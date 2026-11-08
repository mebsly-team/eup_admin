// Links the calendar's appointments to the pins on the map and works out the number a pin shows.
//
// Not every appointment comes from "Plan bezoek". Many are typed in Google Calendar by hand
// ("04 - Sbc bvba — Merksem"): no stored customer id, the business name instead of the contact's
// name, and an address worded differently from the customer record (Merksem / Antwerpen, 2170).

export type VisitEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: number;
  end: number;
  allDay?: boolean;
  userId?: string;
};

type PinAddress = {
  id: string | number;
  street_name?: string | null;
  house_number?: string | number | null;
  house_suffix?: string | null;
  city?: string | null;
  zip_code?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  is_delivery_address?: boolean;
};

type PinUser = {
  id: string | number;
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  addresses: PinAddress[];
};

type Pin = {
  key: string;
  userId: string;
  place: string;
  isDelivery: boolean;
  addressPhrases: string[];
  zipPhrases: string[];
  city: string;
  names: string[];
};

export type PinVisit<E extends VisitEvent = VisitEvent> = {
  event: E;
  label: number;
  /** Days between the appointment and today; decides the colour of the number. */
  diffDays: number;
};

type DateRange = { start: number; end: number };

const VISIT_WINDOW_DAYS = 10;
const MIN_NAME_LENGTH = 4;
const DAY_OPENS_AT = 8;
const DAY_CLOSES_AT = 20;

export const pinKey = (userId: string | number, addressId: string | number) =>
  `${userId}-${addressId}`;

// "B.V." = "BV", "Özkan" = "ozkan", "Sbc bvba — Merksem" = "sbc bvba merksem"
const normalize = (value: unknown) =>
  String(value ?? '')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

// Padded with spaces, so that an includes() only finds whole words: 36 is not found in 368.
const pad = (text: string) => ` ${text} `;

const addressPhrases = (address: PinAddress) => {
  const street = normalize(address.street_name);
  if (!street) return [];

  // "368 bus 2" is still number 368
  const house = normalize(address.house_number).split(' ')[0];
  const suffix = normalize(address.house_suffix);

  // A street without a number says too little: it would match the whole street.
  if (!house) return /\d/.test(street) ? [street] : [];
  if (street.endsWith(` ${house}`)) return [street];

  const base = `${street} ${house}`;
  return suffix ? [base, `${base}${suffix}`, `${base} ${suffix}`] : [base];
};

const zipPhrases = (zip: unknown) => {
  // "2628 HN" and "2628HN" are the same postcode, "B-2170" is 2170
  const compact = normalize(zip)
    .replace(/\s/g, '')
    .replace(/^[a-z]{1,2}(?=\d)/, '');
  if (!compact) return [];
  const spaced = compact.replace(/^(\d+)([a-z]+)$/, '$1 $2');
  return spaced === compact ? [compact] : [compact, spaced];
};

const customerNames = (user: PinUser) => {
  const first = normalize(user.first_name);
  const last = normalize(user.last_name);
  const names = [normalize(user.business_name)];
  if (first && last) {
    names.push(`${first} ${last}`, `${last} ${first}`);
  } else {
    names.push(first || last);
  }
  return Array.from(new Set(names)).filter((name) => name.length >= MIN_NAME_LENGTH);
};

const hasCoordinates = (address: PinAddress) =>
  !!address.latitude &&
  !!address.longitude &&
  !Number.isNaN(Number(address.latitude)) &&
  !Number.isNaN(Number(address.longitude));

const buildPins = (users: PinUser[]) => {
  const pins: Pin[] = [];
  users.forEach((user) => {
    const names = customerNames(user);
    user.addresses.filter(hasCoordinates).forEach((address) => {
      pins.push({
        key: pinKey(user.id, address.id),
        userId: String(user.id),
        // About 10 metres: the same shop entered twice counts as one place.
        place: `${Number(address.latitude).toFixed(4)},${Number(address.longitude).toFixed(4)}`,
        isDelivery: !!address.is_delivery_address,
        addressPhrases: addressPhrases(address),
        zipPhrases: zipPhrases(address.zip_code),
        city: normalize(address.city),
        names,
      });
    });
  });
  return pins;
};

const ifOnePlace = (pins: Pin[]) =>
  pins.length && new Set(pins.map((pin) => pin.place)).size === 1 ? pins : null;

const findPinsForEvent = (event: VisitEvent, pins: Pin[], pinsByUser: Map<string, Pin[]>) => {
  const title = pad(normalize(event.title));
  const text = pad(normalize(`${event.title} ${event.location ?? ''} ${event.description ?? ''}`));

  const atAddress = (pin: Pin) => pin.addressPhrases.some((phrase) => text.includes(pad(phrase)));
  const inArea = (pin: Pin) =>
    pin.zipPhrases.some((zip) => text.includes(pad(zip))) ||
    (!!pin.city && text.includes(pad(pin.city)));
  const nameLength = (pin: Pin) =>
    Math.max(0, ...pin.names.filter((name) => title.includes(pad(name))).map((name) => name.length));

  // 1. "Plan bezoek" stores the customer on the appointment.
  // Google hands it back as text, while the map API sends the id as a number.
  const ownPins = event.userId ? pinsByUser.get(String(event.userId)) : undefined;
  if (ownPins) {
    const atOwnAddress = ownPins.filter(atAddress);
    if (atOwnAddress.length) return atOwnAddress;
    const onlyPlace = ifOnePlace(ownPins);
    if (onlyPlace) return onlyPlace;
  }

  // 2. Street and number, confirmed by the postcode, the city or the customer's name.
  const addressed = pins.filter((pin) => atAddress(pin) && (inArea(pin) || nameLength(pin) > 0));
  if (addressed.length) {
    const named = addressed.filter((pin) => nameLength(pin) > 0);
    return named.length ? named : addressed;
  }

  // 3. Only the name. The longest name wins, so "Ali Market 2" does not also light up "Ali Market".
  let longest = 0;
  let named: Pin[] = [];
  pins.forEach((pin) => {
    const length = nameLength(pin);
    if (length > longest) {
      longest = length;
      named = [pin];
    } else if (length && length === longest) {
      named.push(pin);
    }
  });

  // One place only: several shops under one name without an address would be a guess.
  return (
    ifOnePlace(named) ||
    ifOnePlace(named.filter(inArea)) ||
    ifOnePlace(named.filter((pin) => pin.isDelivery)) ||
    []
  );
};

// A number at the start of the title is the number the planner chose: "04 - Sbc bvba", "4. Sbc".
// Times such as "10:30 Overleg" are not, hence the letter after the separator.
const routeNumber = (title: string) => {
  const match = /^\s*(\d{1,3})\s*[-–—.:)]+\s*(?=\p{L})/u.exec(title);
  const value = match ? Number(match[1]) : 0;
  return value > 0 ? value : null;
};

const dayLabels = (dayEvents: VisitEvent[]) => {
  const labels = new Map<string, number>();
  const taken = new Set<number>();

  dayEvents.forEach((event) => {
    const number = routeNumber(event.title);
    if (number) {
      labels.set(event.id, number);
      taken.add(number);
    }
  });

  // The others continue from the stop before them: a visit added behind "06" becomes 7.
  let next = 1;
  dayEvents.forEach((event) => {
    const number = labels.get(event.id);
    if (number) {
      next = Math.max(next, number + 1);
      return;
    }
    while (taken.has(next)) next += 1;
    labels.set(event.id, next);
    taken.add(next);
    next += 1;
  });

  return labels;
};

const startOfDay = (timestamp: number) => new Date(timestamp).setHours(0, 0, 0, 0);

export const addDays = (timestamp: number, days: number) => {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
};

const inRange = (timestamp: number, range?: DateRange | null) =>
  !!range && timestamp >= range.start && timestamp < range.end;

// The day on screen first, then the next visit. Only without either the last visit: a visit of
// last week must not hide the one planned for tomorrow.
const pickEvent = <E extends VisitEvent>(sorted: E[], today: number, visible?: DateRange | null) =>
  sorted.find((event) => inRange(event.start, visible)) ||
  sorted.find((event) => event.start >= today) ||
  sorted[sorted.length - 1];

export function matchVisitsToPins<E extends VisitEvent>(
  events: E[],
  users: PinUser[],
  { today, visibleRange }: { today: number; visibleRange?: DateRange | null }
) {
  const result = new Map<string, PinVisit<E>>();

  // All-day items (birthdays, holidays) are not stops on the route.
  const timedEvents = events.filter((event) => !event.allDay).sort((a, b) => a.start - b.start);

  const window = {
    start: addDays(today, -VISIT_WINDOW_DAYS),
    end: addDays(today, VISIT_WINDOW_DAYS + 1),
  };
  const relevantEvents = timedEvents.filter(
    (event) => inRange(event.start, window) || inRange(event.start, visibleRange)
  );
  if (!relevantEvents.length) return result;

  const pins = buildPins(users);
  const pinsByUser = new Map<string, Pin[]>();
  pins.forEach((pin) => {
    pinsByUser.set(pin.userId, [...(pinsByUser.get(pin.userId) || []), pin]);
  });

  const eventsByPin = new Map<string, E[]>();
  relevantEvents.forEach((event) => {
    findPinsForEvent(event, pins, pinsByUser).forEach((pin) => {
      eventsByPin.set(pin.key, [...(eventsByPin.get(pin.key) || []), event]);
    });
  });

  const labelsByDay = new Map<number, Map<string, number>>();
  eventsByPin.forEach((pinEvents, key) => {
    const event = pickEvent(pinEvents, today, visibleRange);
    const day = startOfDay(event.start);

    let labels = labelsByDay.get(day);
    if (!labels) {
      labels = dayLabels(timedEvents.filter((other) => startOfDay(other.start) === day));
      labelsByDay.set(day, labels);
    }

    result.set(key, {
      event,
      label: labels.get(event.id) as number,
      diffDays: Math.round((day - today) / (24 * 60 * 60 * 1000)),
    });
  });

  return result;
}

// Start of a new visit on the given day, or null when the day is full. A new visit goes behind the
// last appointment, so that the route keeps its order; an evening appointment or an all-day item
// must not block a day that still has room.
export function findVisitSlot(events: VisitEvent[], day: Date, durationMs: number) {
  const opens = new Date(day).setHours(DAY_OPENS_AT, 0, 0, 0);
  const closes = new Date(day).setHours(DAY_CLOSES_AT, 0, 0, 0);
  const dayStart = new Date(day).setHours(0, 0, 0, 0);
  const dayEnd = new Date(day).setHours(23, 59, 59, 999);

  const appointments = events
    .filter((event) => !event.allDay && event.start >= dayStart && event.start <= dayEnd)
    .sort((a, b) => a.start - b.start);

  const afterLast = Math.max(opens, ...appointments.map((event) => event.end));
  if (afterLast + durationMs <= closes) return afterLast;

  let free = opens;
  for (let i = 0; i < appointments.length; i += 1) {
    if (Math.min(appointments[i].start, closes) - free >= durationMs) return free;
    free = Math.max(free, appointments[i].end);
  }
  return null;
}

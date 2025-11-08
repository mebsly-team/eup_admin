import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle, CircleMarker, Pane } from "react-leaflet";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "src/utils/axios";
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { Map as LeafletMap, Icon, divIcon } from 'leaflet';
import { useSnackbar } from 'src/components/snackbar';
import { StyledCalendar } from 'src/sections/calendar/styles';
import { fTimestamp } from 'src/utils/format-time';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { createEvent, updateEvent, deleteEvent } from 'src/api/calendar';
import GoogleCalendarAuth from 'src/components/google-calendar/GoogleCalendarAuth';
import { MAP_USER_COLORS } from 'src/constants/colors';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

interface Address {
  id: string;
  street_name: string;
  house_number: string;
  city: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
  branch?: string;
  type?: string;
  contact_person_branch?: string;
  phone_number?: string;
  mobile_number?: string;
  mobile_phone?: string;
  days_closed?: string;
  days_no_delivery?: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  business_name?: string;
  addresses: Address[];
  color?: string;
  customer_color?: string;
  branch?: string;
  type?: string;
  contact_person_branch?: string;
  phone_number?: string;
  mobile_number?: string;
  mobile_phone?: string;
  days_closed?: string;
  days_no_delivery?: string;
}

interface SelectedUser {
  id: string;
  name: string;
  address: string;
  fullAddress: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: number;
  end: number;
  color: string;
  allDay: boolean;
  eventType?: string;
}

interface TimeChangeDialogState {
  open: boolean;
  eventId: string | null;
  start: Date | null;
  end: Date | null;
}

const USER_TYPES = [
  { value: "all", label: "Alle" },
  { value: "special", label: "Speciaal" },
  { value: "wholesaler", label: "Groothandel" },
  { value: "supermarket", label: "Supermarkt" },
  { value: "standard_business", label: "Standaard Zakelijk" },
  { value: "particular", label: "Particulier" },
  // { value: "admin", label: "Beheerder" },
] as const;

const MARKER_COLORS = [
  { value: "all", label: "Alle", color: "all" },
  ...MAP_USER_COLORS.map(color => ({
    value: color.value,
    label: color.labelNL,
    color: color.color
  }))
];

const DAY_LABEL_COLORS: Record<number, string> = {
  [-10]: '#8B4513', // saddle brown
  [-9]: '#2F4F4F',  // dark slate gray
  [-8]: '#800080',  // purple
  [-7]: '#FF6347',  // tomato
  [-6]: '#20B2AA',  // light sea green
  [-5]: '#1F77B4', // blue
  [-4]: '#FF7F0E', // orange
  [-3]: '#2CA02C', // green
  [-2]: '#D62728', // red
  [-1]: '#6A3D9A', // purple
  [1]: '#007B83',  // teal
  [2]: '#6B4C3B',  // brown
  [3]: '#E377C2',  // pink
  [4]: '#4D4D4D',  // dark gray
  [5]: '#556B2F',  // olive
  [6]: '#FF1493',  // deep pink
  [7]: '#00CED1',  // dark turquoise
  [8]: '#FFD700',  // gold
  [9]: '#ADFF2F',  // green yellow
  [10]: '#FF69B4', // hot pink
};

const createCustomIcon = (color: string, label?: string | number, labelBgColor?: string) => new Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 40" width="36" height="40">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M18 2 C11.373 2 6 7.373 6 14 C6 20.627 18 38 18 38 C18 38 30 20.627 30 14 C30 7.373 24.627 2 18 2 z"/>
      ${label ? `<circle fill="${labelBgColor || '#11F'}" cx="18" cy="14" r="8"/>` : ''}
      ${label ? `<text x="18" y="18" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${String(label)}</text>` : ''}
    </svg>
  `),
  iconSize: [36, 40],
  iconAnchor: [18, 40],
  popupAnchor: [0, -40]
});

// Separate component to handle map initialization
const MapInitializer = ({ onMapReady }: { onMapReady: (map: LeafletMap) => void }) => {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
};

const Map = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 51.6978, lng: 5.3037 });
  const [zoom, setZoom] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>(
    USER_TYPES
      .filter(type => type.value !== "particular" && type.value !== "all")
      .map(type => type.value)
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(["#33CC33"]);
  const [isAllColorsSelected, setIsAllColorsSelected] = useState(false);
  const [filters, setFilters] = useState({
    is_delivery_address: true
  });
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  const calendarRef = useRef<Calendar>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Add new state for time change dialog
  const [timeChangeDialog, setTimeChangeDialog] = useState<TimeChangeDialogState>({
    open: false,
    eventId: null,
    start: null,
    end: null,
  });

  const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'm.sahin@europowerbv.nl';

  // Fetch events from Google Calendar
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Get events from 30 days ago to 60 days in the future
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

        const tokenFromGapi = window.gapi?.client?.getToken();
        let token = tokenFromGapi;
        if (!tokenFromGapi) {
          const storedToken = localStorage.getItem('googleCalendarToken');
          const tokenExpiry = localStorage.getItem('googleCalendarTokenExpiry');
          if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
            window.gapi?.client?.setToken({ access_token: storedToken });
            token = window.gapi?.client?.getToken();
          }
        }
        console.log('Google Calendar token:', token ? 'Present' : 'Missing');

        if (!window.gapi?.client?.calendar) {
          console.error('Google Calendar API niet geïnitialiseerd');
          enqueueSnackbar('Google Calendar API niet geïnitialiseerd', { variant: 'error' });
          return;
        }

        if (token) {
          console.log('Fetching Google Calendar events...');
          const response = await window.gapi.client.calendar.events.list({
            calendarId: GOOGLE_CALENDAR_ID,
            timeMin: thirtyDaysAgo.toISOString(),
            timeMax: sixtyDaysFromNow.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
          });

          console.log('Google Calendar response:', response.result);

          const googleEvents = response.result.items?.map((event: any) => {
            const startTime = event.start.dateTime || event.start.date;
            const endTime = event.end.dateTime || event.end.date;


            return {
              id: event.id,
              title: event.summary || 'Untitled Event',
              description: event.description || '',
              start: new Date(startTime).getTime(),
              end: new Date(endTime).getTime(),
              color: event.colorId ? CALENDAR_COLOR_OPTIONS[parseInt(event.colorId) % CALENDAR_COLOR_OPTIONS.length] : CALENDAR_COLOR_OPTIONS[0],
              allDay: !event.start.dateTime,
              eventType: event.eventType,
            };
          }) || [];

          setEvents(googleEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Disconnect Google Calendar on error
        const token = window.gapi?.client?.getToken();
        if (token) {
          window.google.accounts.oauth2.revoke(token.access_token);
          window.gapi.client.setToken(null);
        }
        localStorage.removeItem('googleCalendarToken');
        localStorage.removeItem('googleCalendarTokenExpiry');
        enqueueSnackbar('Error fetching calendar events - Disconnected from Google Calendar', { variant: 'error' });
      }
    };

    // Check if Google Calendar API is initialized and fetch events
    const initAndFetch = () => {
      if (window.gapi?.client?.calendar) {
        console.log('Google Calendar API is available, fetching events...');
        fetchEvents();
      } else {
        console.log('Waiting for Google Calendar API to initialize...');
        // Retry after a short delay
        setTimeout(initAndFetch, 1000);
      }
    };

    initAndFetch();
  }, [enqueueSnackbar]);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    const apiUrl = `/get-map-data/`;
    try {
      const response = await axiosInstance.get(apiUrl, {
        params: {
          ne_lat: 90,
          ne_lng: 180,
          sw_lat: -90,
          sw_lng: -180,
          is_delivery_address: filters.is_delivery_address,
          ...(selectedUserTypes[0] !== "all" && { user_types: selectedUserTypes.join(',') }),
          ...(!isAllColorsSelected && { customer_colors: selectedColors.join(',') })
        },
      });
      const uniqueUsers = response.data.reduce((acc: User[], user: User) => {
        const existingUser = acc.find(u => u.id === user.id);
        if (!existingUser) {
          const uniqueAddresses = user.addresses.reduce((addrAcc: Address[], address: Address) => {
            const existingAddress = addrAcc.find(a => a.id === address.id);
            if (!existingAddress) {
              addrAcc.push(address);
            }
            return addrAcc;
          }, []);

          acc.push({
            ...user,
            addresses: uniqueAddresses
          });
        } else {
          const allAddresses = [...existingUser.addresses, ...user.addresses];
          const uniqueAddresses = allAddresses.reduce((addrAcc: Address[], address: Address) => {
            const existingAddress = addrAcc.find(a => a.id === address.id);
            if (!existingAddress) {
              addrAcc.push(address);
            }
            return addrAcc;
          }, []);

          existingUser.addresses = uniqueAddresses;
        }
        return acc;
      }, []);

      console.log('Original users:', response.data.length);
      console.log('Unique users:', uniqueUsers.length);
      console.log('Sample user addresses:', uniqueUsers[0]?.addresses?.length);

      setUsers(uniqueUsers);
    } catch (error) {
      console.error("Error fetching map data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedUserTypes, selectedColors, isAllColorsSelected]);

  const handleUserTypeChange = (event: React.MouseEvent<HTMLElement>, newUserTypes: string[]) => {
    if (newUserTypes.includes("all")) {
      // If "all" is being selected, select only "all"
      if (!selectedUserTypes.includes("all")) {
        setSelectedUserTypes(["all"]);
      } else {
        // If "all" is being deselected, default to "wholesaler"
        setSelectedUserTypes(["wholesaler"]);
      }
    } else {
      // Handle regular multiple selection
      setSelectedUserTypes(newUserTypes.length ? newUserTypes : ["wholesaler"]);
    }
  };

  const handleColorButtonClick = (colorValue: string) => {
    if (colorValue === "all") {
      setIsAllColorsSelected(true);
      setSelectedColors(["all"]);
    } else {
      if (isAllColorsSelected) {
        // Transition from "all" to this specific color
        setIsAllColorsSelected(false);
        setSelectedColors([colorValue]);
      } else {
        // Toggle this color in the current selection
        const newColors = selectedColors.includes(colorValue)
          ? selectedColors.filter(c => c !== colorValue)
          : [...selectedColors, colorValue];

        if (newColors.length === 0) {
          setSelectedColors(["#33CC33"]);
        } else {
          setSelectedColors(newColors);
        }
      }
    }
  };

  const debouncedFetch = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchAddresses();
    }, 300);
  }, [fetchAddresses]);

  const MapEventHandler = () => {
    const map = useMapEvents({
      click: (e) => {
        console.log('Map clicked at:', e.latlng);
      },
      zoom: (e) => {
        console.log('Map zoom:', e);
      }
    });

    // Only prevent browser zoom gestures, not all touch events
    useEffect(() => {
      const mapContainer = map.getContainer();

      const preventBrowserZoom = (e: any) => {
        // Only prevent pinch-to-zoom gestures, allow other touches
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      };

      // Only prevent multi-touch gestures that cause browser zoom
      mapContainer.addEventListener('touchstart', preventBrowserZoom, { passive: false });
      mapContainer.addEventListener('touchmove', preventBrowserZoom, { passive: false });

      return () => {
        mapContainer.removeEventListener('touchstart', preventBrowserZoom);
        mapContainer.removeEventListener('touchmove', preventBrowserZoom);
      };
    }, [map]);

    return null;
  };

  const handleMapReady = useCallback((map: LeafletMap) => {
    console.log('Map ready, container:', map.getContainer());
    console.log('Map container touch-action:', getComputedStyle(map.getContainer()).touchAction);
    console.log('Map container pointer-events:', getComputedStyle(map.getContainer()).pointerEvents);

    mapRef.current = map;
    
    const urlParams = new URLSearchParams(window.location.search);
    const latParam = urlParams.get('lat');
    const lngParam = urlParams.get('lng');
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 15);
      }
    }
    
    debouncedFetch();

    // Debug: check if markers are interactive
    setTimeout(() => {
      const markers = document.querySelectorAll('.leaflet-marker-icon');
      console.log('Found markers:', markers.length);
      markers.forEach((marker, i) => {
        const style = getComputedStyle(marker);
        console.log(`Marker ${i} touch-action:`, style.touchAction);
        console.log(`Marker ${i} pointer-events:`, style.pointerEvents);
      });

      const zoomControls = document.querySelectorAll('.leaflet-control-zoom a');
      console.log('Found zoom controls:', zoomControls.length);
      zoomControls.forEach((control, i) => {
        const style = getComputedStyle(control);
        console.log(`Zoom control ${i} touch-action:`, style.touchAction);
        console.log(`Zoom control ${i} pointer-events:`, style.pointerEvents);
      });
    }, 1000);
  }, [debouncedFetch]);

  useEffect(() => {
    debouncedFetch();
  }, [filters, selectedUserTypes, selectedColors, isAllColorsSelected, debouncedFetch]);


  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleMapMove = (e: { target: LeafletMap }) => {
    setMapCenter({
      lat: e.target.getCenter().lat,
      lng: e.target.getCenter().lng,
    });
    setZoom(e.target.getZoom());
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const latParam = urlParams.get('lat');
    const lngParam = urlParams.get('lng');
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
        setZoom(15);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        if (typeof accuracy === 'number') setCurrentAccuracy(accuracy);
      },
      () => { },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const centerOnCurrentLocation = () => {
    if (currentPosition && mapRef.current) {
      mapRef.current.flyTo([currentPosition.lat, currentPosition.lng], Math.max(15, mapRef.current.getZoom()));
    }
  };

  const handleAddToCalendar = async (user: User, address: Address) => {
    try {
      // Get the current active date from the calendar
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) {
        throw new Error('Kalender niet beschikbaar');
      }

      // Get the currently selected date from the calendar view
      const selectedDate = calendarApi.getDate();
      console.log('Geselecteerde datum van kalender:', selectedDate.toLocaleString('nl-NL'));

      // Create visitDate starting at 9 AM on the selected date
      const visitDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        8, // Start checking from 6 AM
        0,
        0
      );

      console.log('Initiële bezoekdatum (9:00):', visitDate.toLocaleString('nl-NL'));

      // Get all events for the selected date
      const dayStart = new Date(visitDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(visitDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Filter events for the selected date
      const dayEvents = events.filter(event => {
        const eventStart = new Date(event.start);
        return eventStart >= dayStart && eventStart <= dayEnd;
      }).sort((a, b) => a.start - b.start);

      console.log('Afspraken voor geselecteerde datum:', dayEvents.map(e => ({
        title: e.title,
        start: new Date(e.start).toLocaleString('nl-NL'),
        end: new Date(e.end).toLocaleString('nl-NL')
      })));

      // Find the first available 30-minute slot
      let slotFound = false;
      const bezoekDuur = 30 * 60 * 1000; // 30 minuten in milliseconden

      // Check each existing event to find gaps
      for (let i = 0; i <= dayEvents.length; i++) {
        const slotStart = i === 0 ? visitDate : new Date(dayEvents[i - 1].end);
        const slotEnd = new Date(slotStart.getTime() + bezoekDuur);

        // Als dit de laatste iteratie is of er is een gat voor het volgende event
        if (i === dayEvents.length || slotEnd.getTime() <= new Date(dayEvents[i].start).getTime()) {
          visitDate.setTime(slotStart.getTime());
          slotFound = true;
          break;
        }
      }

      if (!slotFound) {
        throw new Error('Geen beschikbare tijdslot gevonden voor deze dag');
      }

      const bezoekStart = visitDate.getTime();
      const bezoekEind = bezoekStart + bezoekDuur;

      console.log('Geplande tijden:', {
        startTijd: new Date(bezoekStart).toLocaleString('nl-NL'),
        eindTijd: new Date(bezoekEind).toLocaleString('nl-NL')
      });

      // First create the event in Google Calendar
      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Agenda API niet geïnitialiseerd');
      }

      const phoneNumber = user.phone_number || user.mobile_number || user.mobile_phone;
      const phoneInfo = phoneNumber ? `\nTelefoon: ${phoneNumber}` : '';

      const eventData = {
        summary: user.first_name || user.last_name
          ? `${user.first_name} ${user.last_name} ${user.business_name ? `- ${user.business_name}` : ''}`.trim()
          : user.business_name || 'Onbekende klant',
        description: `Bezoek aan ${address.street_name || ""} ${address.house_number || ""}, ${address.city} ${address.zip_code}, ${address.country}${phoneInfo}`,
        location: `${address.street_name || ""} ${address.house_number || ""}, ${address.zip_code} ${address.city}, ${address.country}`,
        start: {
          dateTime: new Date(bezoekStart).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(bezoekEind).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: '1',
      };

      console.log('Agenda-afspraak maken:', eventData);

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: GOOGLE_CALENDAR_ID,
        resource: eventData,
      });

      if (response.status !== 200) {
        throw new Error('Kan geen afspraak maken in Google Agenda');
      }

      // After successful creation in Google Calendar, update local state
      const newEvent: CalendarEvent = {
        id: response.result.id,
        title: eventData.summary,
        description: eventData.description,
        start: bezoekStart,
        end: bezoekEind,
        color: CALENDAR_COLOR_OPTIONS[0],
        allDay: false,
      };

      // Update events state and force calendar refresh
      setEvents(prevEvents => {
        const updatedEvents = [...prevEvents, newEvent];
        console.log('Updated events:', updatedEvents);

        // Force calendar refresh
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.removeAllEvents();
          calendarApi.addEventSource(updatedEvents);
        }

        return updatedEvents;
      });

      // Format date and time for the success message
      const startDate = new Date(bezoekStart);
      const formattedDate = startDate.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = startDate.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
      });

      enqueueSnackbar(
        `Bezoek gepland voor ${formattedDate} om ${formattedTime}!`,
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Fout bij het plannen van bezoek:', error);
      // Disconnect Google Calendar on error
      const token = window.gapi?.client?.getToken();
      if (token) {
        window.google.accounts.oauth2.revoke(token.access_token);
        window.gapi.client.setToken(null);
      }
      localStorage.removeItem('googleCalendarToken');
      localStorage.removeItem('googleCalendarTokenExpiry');
      enqueueSnackbar(
        error instanceof Error
          ? `${error.message} - Verbinding met Google Agenda verbroken`
          : 'Fout bij het plannen van bezoek - Verbinding met Google Agenda verbroken',
        { variant: 'error' }
      );
    }
  };

  const handleEventDrop = async (info: any) => {
    try {
      const { event } = info;

      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Calendar API niet geïnitialiseerd');
      }

      // Update in Google Calendar
      const eventData = {
        start: {
          dateTime: event.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await window.gapi.client.calendar.events.patch({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: event.id,
        resource: eventData,
      });

      if (response.status !== 200) {
        throw new Error('Failed to update event in Google Calendar');
      }

      // Update local state
      const updatedEvent: CalendarEvent = {
        ...events.find(e => e.id === event.id)!,
        start: Number(fTimestamp(event.start)),
        end: Number(fTimestamp(event.end)),
        allDay: event.allDay,
      };

      setEvents(prevEvents =>
        prevEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e)
      );

      enqueueSnackbar('Visit time updated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error updating visit:', error);
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Error updating visit time',
        { variant: 'error' }
      );
      info.revert();
    }
  };

  const handleEventResize = async (info: any) => {
    try {
      const { event } = info;

      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Calendar API niet geïnitialiseerd');
      }

      // Update in Google Calendar
      const eventData = {
        start: {
          dateTime: event.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await window.gapi.client.calendar.events.patch({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: event.id,
        resource: eventData,
      });

      if (response.status !== 200) {
        throw new Error('Failed to update event in Google Calendar');
      }

      // Update local state
      const updatedEvent: CalendarEvent = {
        ...events.find(e => e.id === event.id)!,
        start: Number(fTimestamp(event.start)),
        end: Number(fTimestamp(event.end)),
        allDay: event.allDay,
      };

      setEvents(prevEvents =>
        prevEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e)
      );

      enqueueSnackbar('Visit duration updated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error updating visit duration:', error);
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Error updating visit duration',
        { variant: 'error' }
      );
      info.revert();
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Calendar API niet geïnitialiseerd');
      }

      // First, check if we have the event in local state and check its type
      const localEvent = events.find(e => e.id === eventId);
      if (localEvent?.eventType === 'birthday') {
        enqueueSnackbar('Verjaardagsafspraken kunnen niet worden verwijderd', { variant: 'warning' });
        return;
      }

      // If not in local state or type is unknown, fetch the event to check its type
      let event: any = null;
      if (!localEvent || !localEvent.eventType) {
        const eventResponse = await window.gapi.client.calendar.events.get({
          calendarId: GOOGLE_CALENDAR_ID,
          eventId: eventId,
        });

        if (eventResponse.status !== 200) {
          throw new Error('Kan afspraak niet ophalen uit Google Agenda');
        }

        event = eventResponse.result;

        // Check if event is a special type that cannot be deleted (like birthday events)
        if (event.eventType === 'birthday' || event.eventType === 'outOfOffice' || event.eventType === 'focusTime') {
          enqueueSnackbar('Dit type afspraak kan niet worden verwijderd (bijv. verjaardag)', { variant: 'warning' });
          return;
        }

        // Check if event has extendedProperties indicating it's a special event
        if (event.extendedProperties?.private?.eventType === 'birthday') {
          enqueueSnackbar('Verjaardagsafspraken kunnen niet worden verwijderd', { variant: 'warning' });
          return;
        }
      }

      // Delete from Google Calendar
      const response = await window.gapi.client.calendar.events.delete({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: eventId,
      });

      if (response.status !== 204) {
        throw new Error('Kan afspraak niet verwijderen uit Google Agenda');
      }

      // Update local state
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));

      // Force calendar refresh
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(events.filter(e => e.id !== eventId));
      }

      enqueueSnackbar('Afspraak succesvol verwijderd', { variant: 'success' });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      
      // Check if error is about event type restriction
      if (error?.result?.error?.errors?.some((e: any) => e.reason === 'eventTypeRestriction')) {
        enqueueSnackbar('Dit type afspraak kan niet worden verwijderd (bijv. verjaardag)', { variant: 'warning' });
        return;
      }

      // Only disconnect on actual API errors, not on user-friendly warnings
      if (error?.result?.error?.code === 400 && error?.result?.error?.errors?.some((e: any) => e.reason === 'eventTypeRestriction')) {
        return;
      }

      // For other errors, show error message but don't disconnect
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : 'Error deleting event',
        { variant: 'error' }
      );
    }
  };

  // Add handler for opening time change dialog
  const handleOpenTimeChange = (eventInfo: any) => {
    setTimeChangeDialog({
      open: true,
      eventId: eventInfo.event.id,
      start: new Date(eventInfo.event.start),
      end: new Date(eventInfo.event.end),
    });
  };

  // Add handler for closing time change dialog
  const handleCloseTimeChange = () => {
    setTimeChangeDialog({
      open: false,
      eventId: null,
      start: null,
      end: null,
    });
  };

  // Add handler for saving time changes
  const handleSaveTimeChange = async () => {
    try {
      if (!timeChangeDialog.eventId || !timeChangeDialog.start || !timeChangeDialog.end) {
        return;
      }

      const start = timeChangeDialog.start;
      const end = timeChangeDialog.end;

      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Calendar API niet geïnitialiseerd');
      }

      // Update in Google Calendar
      const eventData = {
        start: {
          dateTime: start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await window.gapi.client.calendar.events.patch({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: timeChangeDialog.eventId,
        resource: eventData,
      });

      if (response.status !== 200) {
        throw new Error('Failed to update event in Google Calendar');
      }

      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === timeChangeDialog.eventId
            ? {
              ...event,
              start: start.getTime(),
              end: end.getTime(),
            }
            : event
        )
      );

      // Force calendar refresh
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }

      enqueueSnackbar('Afspraaktijd succesvol bijgewerkt', { variant: 'success' });
      handleCloseTimeChange();
    } catch (error) {
      console.error('Error updating event time:', error);
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Error updating event time',
        { variant: 'error' }
      );
    }
  };

  return (
    <Box sx={{ display: "flex", height: "90vh" }}>
      {/* Left Panel - Calendar */}
      <Paper
        sx={{
          width: 400,
          overflow: "hidden",
          p: 1,
          borderRight: "1px solid",
          borderColor: "divider",
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Planning</Typography>
          <GoogleCalendarAuth />
        </Stack>
        <StyledCalendar sx={{
          flexGrow: 1,
          '& .fc .fc-button': {
            padding: '2px 6px',
            fontSize: '0.75rem',
            minWidth: 'auto',
            lineHeight: 1.2
          },
          '& .fc .fc-toolbar-title': {
            fontSize: '1rem'
          },
          '& .fc .fc-timegrid-slot': {
            height: '40px'
          },
          '& .fc .fc-timegrid-axis-cushion': {
            padding: '0 2px',
            fontSize: '0.7rem'
          },
          '& .fc .fc-timegrid-slot-label-cushion': {
            padding: '0 2px',
            fontSize: '0.7rem'
          }
        }}>
          <Calendar
            weekends
            editable
            droppable
            selectable
            rerenderDelay={10}
            allDayMaintainDuration
            eventResizableFromStart
            ref={calendarRef}
            events={events}
            dayMaxEventRows={3}
            eventDisplay="block"
            height="100%"
            headerToolbar={{
              left: 'prev,next vandaag',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,listWeek'
            }}
            buttonText={{
              today: 'Vandaag',
              day: 'Dag',
              week: 'Week',
              list: 'Lijst'
            }}
            initialView="timeGridDay"
            slotDuration="00:15:00"
            slotLabelInterval="00:30:00"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventClick={(eventInfo) => handleOpenTimeChange(eventInfo)}
            plugins={[
              listPlugin,
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            eventContent={(eventInfo) => {
              return (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '100%',
                    px: 0.5,
                    backgroundColor: eventInfo.event.backgroundColor || CALENDAR_COLOR_OPTIONS[0],
                    color: '#fff',
                    cursor: 'pointer',
                    '&:hover': {
                      filter: 'brightness(0.9)',
                    },
                  }}
                >
                  <Typography
                    noWrap
                    variant="caption"
                    sx={{
                      flexGrow: 1,
                      fontSize: '0.85em',
                      lineHeight: '1.2',
                    }}
                  >
                    {eventInfo.event.title}
                  </Typography>
                  <IconButton
                    className="delete-button"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventDelete(eventInfo.event.id);
                    }}
                    sx={{
                      p: 0.2,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
              );
            }}
          />
        </StyledCalendar>
      </Paper>

      {/* Right Panel - Map */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* User Type Filters - Sticky Header */}
        <Paper
          elevation={2}
          sx={{
            p: 1,
            borderRadius: 0,
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box>
              {/* <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                Gebruikerstype
              </Typography> */}
              <ToggleButtonGroup
                value={selectedUserTypes}
                onChange={handleUserTypeChange}
                aria-label="user types"
                size="small"
                exclusive={false}
                sx={{
                  flexWrap: 'wrap',
                  '& .MuiToggleButton-root': {
                    fontSize: '0.7rem',
                    py: 0.3,
                    px: 0.8,
                    minHeight: '28px',
                  }
                }}
              >
                {USER_TYPES.map((type) => (
                  <ToggleButton
                    key={type.value}
                    value={type.value}
                    sx={{ textTransform: 'none' }}
                  >
                    {type.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box>
              {/* <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                Kleur
              </Typography> */}
              <ToggleButtonGroup
                value={isAllColorsSelected ? ["all"] : selectedColors}
                aria-label="marker colors"
                size="small"
                sx={{
                  flexWrap: 'wrap',
                  '& .MuiToggleButton-root': {
                    fontSize: '0.7rem',
                    py: 0.3,
                    px: 0.8,
                    minHeight: '28px',
                  }
                }}
              >
                {MARKER_COLORS.map((color) => (
                  <ToggleButton
                    key={color.value}
                    value={color.value === "all" ? "all" : color.color}
                    onClick={() => handleColorButtonClick(color.value === "all" ? "all" : color.color)}
                    sx={{
                      textTransform: 'none',
                      '&.Mui-selected': {
                        borderColor: color.color,
                        backgroundColor: `${color.color}22`,
                      }
                    }}
                  >
                    {color.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Paper>

        {/* Map Container */}
        <Box sx={{
          flexGrow: 1,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={zoom}
            style={{
              height: "100%",
              width: "100%"
            }}
          >
            <MapInitializer onMapReady={handleMapReady} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEventHandler />
            {currentPosition && (
              <>
                {currentAccuracy && (
                  <Pane name="accuracy-pane" style={{ zIndex: 450 }}>
                    <Circle
                      center={[currentPosition.lat, currentPosition.lng]}
                      radius={currentAccuracy}
                      pathOptions={{ color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.15, weight: 1 }}
                      interactive={false}
                    />
                  </Pane>
                )}
                <Pane name="current-location-pane" style={{ zIndex: 1200 }}>
                  <Marker
                    position={[currentPosition.lat, currentPosition.lng]}
                    icon={divIcon({
                      className: 'gm-current-location-icon',
                      html: '<div class="gm-current-location-dot"></div>',
                      iconSize: [14, 14],
                      iconAnchor: [7, 7]
                    })}
                    interactive={false}
                  />
                </Pane>
              </>
            )}
            {users.flatMap((user) => {
              // Filter addresses that have valid coordinates
              const validAddresses = user.addresses.filter(address =>
                address.latitude &&
                address.longitude &&
                !isNaN(address.latitude) &&
                !isNaN(address.longitude)
              );

              // Create a marker for each valid address
              return validAddresses.map((address) => {
                const markerColor = user.customer_color || MARKER_COLORS[0].color;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startWindow = new Date(today);
                startWindow.setDate(startWindow.getDate() - 10);
                const endWindow = new Date(today);
                endWindow.setDate(endWindow.getDate() + 10);

                const windowEvents = events
                  .filter((e) => e.start >= startWindow.getTime() && e.start <= endWindow.getTime())
                  .sort((a, b) => a.start - b.start);

                const matchingEvents = windowEvents.filter((e) => {
                  const title = (e.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
                  const first = (user.first_name || '').toLowerCase().trim();
                  const last = (user.last_name || '').toLowerCase().trim();
                  const business = (user.business_name || '').toLowerCase().trim();
                  const full = `${first} ${last}`.replace(/\s+/g, ' ').trim();

                  // If user has no first/last name but has business name, match by business name
                  if (!first && !last && business) {
                    return title === business || title.includes(business);
                  }

                  // If user has first/last name, match by full name (both first and last must be present and match)
                  if (first && last) {
                    return title.includes(full);
                  }

                  // If only first name or only last name, match only if the title contains that single name
                  // but be more strict - require the name to be a complete word
                  if (first && !last) {
                    const regex = new RegExp(`\\b${first}\\b`, 'i');
                    return regex.test(title);
                  }

                  if (last && !first) {
                    const regex = new RegExp(`\\b${last}\\b`, 'i');
                    return regex.test(title);
                  }

                  return false;
                });

                let label: number | undefined;
                let labelBg: string | undefined;
                if (matchingEvents.length) {
                  // Pick the earliest matching event; compute its day offset from today
                  const firstEvent = matchingEvents[0];
                  const eventDate = new Date(firstEvent.start);
                  eventDate.setHours(0, 0, 0, 0);
                  const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const dayStartTs = eventDate.getTime();
                  const dayEndTs = dayStartTs + 24 * 60 * 60 * 1000 - 1;
                  const eventsSameDay = events
                    .filter((e) => e.start >= dayStartTs && e.start <= dayEndTs)
                    .sort((a, b) => a.start - b.start);
                  const indexInDay = eventsSameDay.findIndex((e) => e.id === firstEvent.id);
                  label = indexInDay >= 0 ? indexInDay + 1 : undefined;
                  labelBg = DAY_LABEL_COLORS[diffDays as -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5];
                }
                return (
                  <Marker
                    key={`${user.id}-${address.id}`}
                    position={[address.latitude, address.longitude]}
                    icon={createCustomIcon(markerColor, label, labelBg)}
                    autoPan={true}
                    autoPanPadding={[50, 50]}
                    interactive={true}
                    eventHandlers={{
                      click: (e) => {
                        console.log('Marker clicked:', user.id, address.id, 'at position:', e.latlng);
                        e.originalEvent.preventDefault();
                        e.originalEvent.stopPropagation();
                      },
                      mouseover: () => {
                        console.log('Marker hover:', user.id, address.id);
                      },
                      mouseout: () => {
                        console.log('Marker mouseout:', user.id, address.id);
                      },
                      add: () => {
                        console.log('Marker added to map:', user.id, address.id);
                      }
                    }}
                  >
                    <Popup
                      closeButton={false}
                      autoPan={true}
                      autoPanPadding={[50, 50]}
                      keepInView={true}
                      closeOnClick={false}
                      closeOnEscapeKey={true}
                      className="custom-popup"
                    >
                      <Box sx={{ backgroundColor: markerColor, width: '20px', height: '20px', borderRadius: '50%', border: '2px solid white' }}>  </Box>
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': {
                            color: 'primary.main',
                          }
                        }}
                        onClick={() => window.open(paths.dashboard.user.edit(user.id), '_blank')}
                      >
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : ''}
                        {user.business_name ? ` - ${user.business_name}` : ''}
                      </Typography> <br />
                      {address.street_name} {address.house_number}, {address.city} <br />
                      {address.zip_code}, {address.country} <br />

                      {matchingEvents.length > 0 && (
                        <Box component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Iconify icon="solar:calendar-bold" width={14} sx={{ mr: 0.5 }} />
                            <strong> {new Date(matchingEvents[0].start).toLocaleString('nl-NL')}</strong>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventDelete(matchingEvents[0].id);
                            }}
                            sx={{
                              p: 0.5,
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'error.lighter',
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Box>
                      )}

                      {user.branch && (
                        <Box component="div" sx={{ mt: 1 }}>
                          <strong>Filiaal:</strong> {user.branch}
                        </Box>
                      )}

                      {user.type && (
                        <Box component="div">
                          <strong>Type:</strong> {user.type}
                        </Box>
                      )}

                      {user.contact_person_branch && (
                        <Box component="div">
                          <strong>Contactpersoon:</strong> {user.contact_person_branch}
                        </Box>
                      )}

                      {user.mobile_number && (
                        <Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Iconify icon="solar:smartphone-bold" width={14} sx={{ mr: 0.5 }} />
                          {user.mobile_number}
                        </Box>
                      )}

                      {user.mobile_phone && user.mobile_phone !== user.mobile_number && (
                        <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Iconify icon="solar:smartphone-bold" width={14} sx={{ mr: 0.5 }} />
                          {user.mobile_phone}
                        </Box>
                      )}

                      {user.phone_number && (
                        <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Iconify icon="solar:phone-bold" width={14} sx={{ mr: 0.5 }} />
                          {user.phone_number}
                        </Box>
                      )}

                      {user.days_closed && (
                        <Box component="div" sx={{ mt: 1 }}>
                          <strong>Gesloten dagen:</strong> {user.days_closed}
                        </Box>
                      )}

                      {user.days_no_delivery && (
                        <Box component="div">
                          <strong>Geen bezorging op:</strong> {user.days_no_delivery}
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddToCalendar(user, address)}
                        sx={{ mt: 1 }}
                      >
                        Plan bezoek (30m)
                      </Button>
                    </Popup>
                  </Marker>
                );
              });
            })}
          </MapContainer>

          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1000,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {/* Debug and Locate buttons */}
          <Box
            sx={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              zIndex: 1100,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <IconButton
              color="secondary"
              onClick={() => {
                console.log('Debug button clicked');
                const markers = document.querySelectorAll('.leaflet-marker-icon');
                console.log('Markers found:', markers.length);
                markers.forEach((marker, i) => {
                  console.log(`Marker ${i}:`, marker);
                  console.log('Touch action:', getComputedStyle(marker).touchAction);
                  console.log('Pointer events:', getComputedStyle(marker).pointerEvents);
                });
              }}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 3,
                '&:hover': { bgcolor: 'background.paper' }
              }}
            >
              <Iconify icon="material-symbols:bug-report" width={22} />
            </IconButton>
            <IconButton
              color="primary"
              onClick={centerOnCurrentLocation}
              disabled={!currentPosition}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 3,
                '&:hover': { bgcolor: 'background.paper' }
              }}
            >
              <Iconify icon="material-symbols:my-location-rounded" width={22} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Add Time Change Dialog */}
      <Dialog open={timeChangeDialog.open} onClose={handleCloseTimeChange}>
        <DialogTitle>Afspraaktijd wijzigen</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <MobileDateTimePicker
              label="Start tijd"
              value={timeChangeDialog.start}
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  setTimeChangeDialog(prev => ({
                    ...prev,
                    start: newValue,
                    // Automatically adjust end time to maintain duration
                    end: prev.end && prev.start
                      ? new Date(newValue.getTime() + (prev.end.getTime() - prev.start.getTime()))
                      : prev.end,
                  }));
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
            <MobileDateTimePicker
              label="Eind tijd"
              value={timeChangeDialog.end}
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  setTimeChangeDialog(prev => ({
                    ...prev,
                    end: newValue,
                  }));
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTimeChange}>Annuleren</Button>
          <Button
            variant="contained"
            onClick={handleSaveTimeChange}
            disabled={!timeChangeDialog.start || !timeChangeDialog.end}
          >
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Map;

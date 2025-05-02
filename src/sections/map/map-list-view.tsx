import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "src/utils/axios";
import MarkerClusterGroup from "react-leaflet-cluster";
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
import { Map as LeafletMap, LatLngBounds, Icon } from 'leaflet';
import { useSnackbar } from 'src/components/snackbar';
import { StyledCalendar } from 'src/sections/calendar/styles';
import { fTimestamp } from 'src/utils/format-time';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { createEvent, updateEvent, deleteEvent } from 'src/api/calendar';
import GoogleCalendarAuth from 'src/components/google-calendar/GoogleCalendarAuth';
import { MAP_USER_COLORS } from 'src/constants/colors';
import Iconify from 'src/components/iconify';

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
  days_closed?: string[];
  days_no_delivery?: string[];
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  addresses: Address[];
  color?: string;
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
  { value: "all", label: "Alle", color: "#000000" },
  ...MAP_USER_COLORS.map(color => ({
    value: color.value,
    label: color.labelNL,
    color: color.color
  }))
];

// Create a function to generate custom colored marker icons
const createCustomIcon = (color: string) => new Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M16 2 C10.477 2 6 6.477 6 12 C6 17.523 16 30 16 30 C16 30 26 17.523 26 12 C26 6.477 21.523 2 16 2 z"/>
      <circle fill="#fff" cx="16" cy="12" r="4"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
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
  const [users, setUsers] = useState<User[]>([]);
  console.log("🚀 ~ Map ~ users:", users)
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 52.0452, lng: 4.6522 });
  const [zoom, setZoom] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>(
    USER_TYPES
      .filter(type => type.value !== "particular" && type.value !== "all")
      .map(type => type.value)
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(["all"]);
  const [filters, setFilters] = useState({
    is_delivery_address: true
  });
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

  // Fetch events from Google Calendar
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Get events from 30 days ago to 60 days in the future
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

        const token = window.gapi?.client?.getToken();
        console.log('Google Calendar token:', token ? 'Present' : 'Missing');

        if (!window.gapi?.client?.calendar) {
          console.error('Google Calendar API niet geïnitialiseerd');
          enqueueSnackbar('Google Calendar API niet geïnitialiseerd', { variant: 'error' });
          return;
        }

        if (token) {
          console.log('Fetching Google Calendar events...');
          const response = await window.gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: thirtyDaysAgo.toISOString(),
            timeMax: sixtyDaysFromNow.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
          });

          console.log('Google Calendar response:', response.result);

          const googleEvents = response.result.items?.map((event: any) => {
            const startTime = event.start.dateTime || event.start.date;
            const endTime = event.end.dateTime || event.end.date;

            console.log(`Processing event: ${event.summary}`, {
              start: startTime,
              end: endTime,
            });

            return {
              id: event.id,
              title: event.summary || 'Untitled Event',
              description: event.description || '',
              start: new Date(startTime).getTime(),
              end: new Date(endTime).getTime(),
              color: event.colorId ? CALENDAR_COLOR_OPTIONS[parseInt(event.colorId) % CALENDAR_COLOR_OPTIONS.length] : CALENDAR_COLOR_OPTIONS[0],
              allDay: !event.start.dateTime,
            };
          }) || [];

          console.log('Processed events:', googleEvents);
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
        localStorage.removeItem('googleCalendarTokens');
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

  // Function to fetch users based on the current map state and filters
  const fetchAddresses = useCallback(async (bounds: LatLngBounds) => {
    if (!bounds) return;

    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();

    if (northEast && southWest) {
      setIsLoading(true);
      const apiUrl = `/get-map-data/`;
      try {
        const response = await axiosInstance.get(apiUrl, {
          params: {
            ne_lat: northEast.lat,
            ne_lng: northEast.lng,
            sw_lat: southWest.lat,
            sw_lng: southWest.lng,
            is_delivery_address: filters.is_delivery_address,
            ...(selectedUserTypes[0] !== "all" && { user_types: selectedUserTypes.join(',') }),
            ...(selectedColors[0] !== "all" && { customer_colors: selectedColors.join(',') })
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [filters, selectedUserTypes, selectedColors]);

  const handleUserTypeChange = (event: React.MouseEvent<HTMLElement>, newUserTypes: string[]) => {
    if (newUserTypes.includes("all")) {
      // If "all" is being selected, select all types except "particular"
      if (!selectedUserTypes.includes("all")) {
        setSelectedUserTypes(USER_TYPES
          .filter(type => type.value !== "particular")
          .map(type => type.value)
        );
      } else {
        // If "all" is being deselected, keep the previous selection
        const filteredTypes = selectedUserTypes.filter(type => type !== "all");
        setSelectedUserTypes(filteredTypes.length ? filteredTypes : ["wholesaler"]);
      }
    } else {
      // Handle regular multiple selection
      setSelectedUserTypes(newUserTypes.length ? newUserTypes : ["wholesaler"]);
    }
  };

  const handleColorChange = (event: React.MouseEvent<HTMLElement>, newColors: string[]) => {
    if (newColors.includes("all")) {
      // If "all" is being selected, deselect everything else
      if (!selectedColors.includes("all")) {
        setSelectedColors(["all"]);
      } else {
        // If "all" is being deselected, default to "red"
        setSelectedColors(["red"]);
      }
    } else {
      // If selecting other options while "all" is selected, remove "all"
      const filteredColors = newColors.filter(color => color !== "all");
      setSelectedColors(filteredColors.length ? filteredColors : ["red"]);
    }
  };

  // Debounced fetch to prevent too many API calls
  const debouncedFetch = useCallback((bounds: LatLngBounds) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchAddresses(bounds);
    }, 300);
  }, [fetchAddresses]);

  const MapEventHandler = () => {
    const map = useMapEvents({
      moveend: () => {
        debouncedFetch(map.getBounds());
      },
      zoomend: () => {
        debouncedFetch(map.getBounds());
      },
    });

    return null;
  };

  // Handle map initialization
  const handleMapReady = useCallback((map: LeafletMap) => {
    mapRef.current = map;
    debouncedFetch(map.getBounds());
  }, [debouncedFetch]);

  useEffect(() => {
    if (mapRef.current) {
      debouncedFetch(mapRef.current.getBounds());
    }
  }, [filters, debouncedFetch]);

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
        9, // Start checking from 9 AM
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
        const slotStart = i === 0 ? visitDate : new Date(dayEvents[i - 1].end + 30 * 60 * 1000); // 30 min pauze na vorig event
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

      const eventData = {
        summary: `Bezoek ${user.first_name} ${user.last_name}`,
        description: `Bezoek aan ${address.street_name} ${address.house_number}, ${address.city} <br /> ${address.zip_code}, ${address.country}`,
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
        calendarId: 'primary',
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
      localStorage.removeItem('googleCalendarTokens');
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
        calendarId: 'primary',
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
        calendarId: 'primary',
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

      // Delete from Google Calendar
      const response = await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
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
    } catch (error) {
      console.error('Error deleting event:', error);
      // Disconnect Google Calendar on error
      const token = window.gapi?.client?.getToken();
      if (token) {
        window.google.accounts.oauth2.revoke(token.access_token);
        window.gapi.client.setToken(null);
      }
      localStorage.removeItem('googleCalendarTokens');
      enqueueSnackbar(
        error instanceof Error
          ? `${error.message} - Disconnected from Google Calendar`
          : 'Error deleting event - Disconnected from Google Calendar',
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
        calendarId: 'primary',
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
            p: 2,
            borderRadius: 0,
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Gebruikerstype
              </Typography>
              <ToggleButtonGroup
                value={selectedUserTypes}
                onChange={handleUserTypeChange}
                aria-label="user types"
                size="small"
                exclusive={false}
                sx={{
                  flexWrap: 'wrap',
                  '& .MuiToggleButton-root': {
                    fontSize: '0.75rem',
                    py: 0.5,
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Kleur
              </Typography>
              <ToggleButtonGroup
                value={selectedColors}
                onChange={handleColorChange}
                aria-label="marker colors"
                size="small"
                sx={{
                  flexWrap: 'wrap',
                  '& .MuiToggleButton-root': {
                    fontSize: '0.75rem',
                    py: 0.5,
                  }
                }}
              >
                {MARKER_COLORS.map((color) => (
                  <ToggleButton
                    key={color.value}
                    value={color.value}
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
        <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
          >
            <MapInitializer onMapReady={handleMapReady} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEventHandler />
            <MarkerClusterGroup>
              {users.map((user) =>
                user.addresses.map((address) => {
                  console.log("🚀 ~ Map ~ user:", user)
                  const { latitude, longitude } = address;
                  if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
                    const markerColor = MARKER_COLORS.find(c => c.value === user.customer_color)?.color || MARKER_COLORS[0].color;
                    return (
                      <Marker
                        key={address.id}
                        position={[latitude, longitude]}
                        icon={createCustomIcon(markerColor)}
                      >
                        <Popup>
                          <Box sx={{ backgroundColor: markerColor, width: '20px', height: '20px', borderRadius: '50%', border: '2px solid white' }}>  </Box>
                          <strong>{user.first_name} {user.last_name}</strong> <br />
                          {address.street_name} {address.house_number}, {address.city} <br />
                          {address.zip_code}, {address.country} <br />

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

                          {user.days_closed (
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
                  }
                  return null;
                })
              )}
            </MarkerClusterGroup>
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

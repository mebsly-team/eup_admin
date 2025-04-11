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
import { Map as LeafletMap, LatLngBounds } from 'leaflet';
import { useSnackbar } from 'src/components/snackbar';
import { StyledCalendar } from 'src/sections/calendar/styles';
import { fTimestamp } from 'src/utils/format-time';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { createEvent, updateEvent, deleteEvent } from 'src/api/calendar';
import GoogleCalendarAuth from 'src/components/google-calendar/GoogleCalendarAuth';

interface Address {
  id: string;
  street_name: string;
  house_number: string;
  city: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  addresses: Address[];
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

const USER_TYPES = [
  { value: "special", label: "Speciaal" },
  { value: "wholesaler", label: "Groothandel" },
  { value: "supermarket", label: "Supermarkt" },
  { value: "standard_business", label: "Standaard Zakelijk" },
  { value: "particular", label: "Particulier" },
  { value: "admin", label: "Beheerder" },
] as const;

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 52.0452, lng: 4.6522 });
  const [zoom, setZoom] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string | null>("wholesaler");
  const [filters, setFilters] = useState({
    is_delivery_address: true
  });
  const mapRef = useRef<LeafletMap | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  const calendarRef = useRef<Calendar>(null);
  const { enqueueSnackbar } = useSnackbar();

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
        enqueueSnackbar('Error fetching calendar events', { variant: 'error' });
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
            user_type: selectedUserType
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [filters, selectedUserType]);

  const handleUserTypeChange = (event: React.MouseEvent<HTMLElement>, newUserType: string | null) => {
    setSelectedUserType(newUserType);
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
      console.log('Selected date from calendar:', selectedDate.toLocaleString('nl-NL'));

      // Create visitDate starting at 9 AM on the selected date
      const visitDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        9, // Start checking from 9 AM
        0,
        0
      );

      console.log('Initial visit date (9 AM):', visitDate.toLocaleString('nl-NL'));

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

      console.log('Events for selected date:', dayEvents.map(e => ({
        title: e.title,
        start: new Date(e.start).toLocaleString('nl-NL'),
        end: new Date(e.end).toLocaleString('nl-NL')
      })));

      // Find the first available 2-hour slot
      let slotFound = false;
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

      // Check each existing event to find gaps
      for (let i = 0; i <= dayEvents.length; i++) {
        const slotStart = i === 0 ? visitDate : new Date(dayEvents[i - 1].end + 30 * 60 * 1000); // 30 min buffer after previous event
        const slotEnd = new Date(slotStart.getTime() + twoHours);

        // If this is the last iteration or there's a gap before the next event
        if (i === dayEvents.length || slotEnd.getTime() <= new Date(dayEvents[i].start).getTime()) {
          visitDate.setTime(slotStart.getTime());
          slotFound = true;
          break;
        }
      }

      if (!slotFound) {
        throw new Error('Geen beschikbare tijdslot gevonden voor deze dag');
      }

      const visitStart = visitDate.getTime();
      const visitEnd = visitStart + twoHours;

      console.log('Final scheduling times:', {
        startTime: new Date(visitStart).toLocaleString('nl-NL'),
        endTime: new Date(visitEnd).toLocaleString('nl-NL')
      });

      // First create the event in Google Calendar
      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Calendar API niet geïnitialiseerd');
      }

      const eventData = {
        summary: `Bezoek ${user.first_name} ${user.last_name}`,
        description: `Bezoek aan ${address.street_name} ${address.house_number}, ${address.city} <br /> ${address.zip_code}, ${address.country}`,
        start: {
          dateTime: new Date(visitStart).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(visitEnd).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: '1',
      };

      console.log('Agenda-afspraak maken:', eventData);

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: eventData,
      });

      console.log('Google Calendar response:', response);

      if (response.status !== 200) {
        throw new Error('Kan geen afspraak maken in Google Agenda');
      }

      // After successful creation in Google Calendar, update local state
      const newEvent: CalendarEvent = {
        id: response.result.id,
        title: eventData.summary,
        description: eventData.description,
        start: visitStart,
        end: visitEnd,
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
      const startDate = new Date(visitStart);
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
      console.error('Error scheduling visit:', error);
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Fout bij het plannen van bezoek',
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
            plugins={[
              listPlugin,
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            eventContent={(eventInfo) => {
              return (
                <div style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  fontSize: '0.85em',
                  padding: '2px 4px',
                  backgroundColor: eventInfo.event.backgroundColor || CALENDAR_COLOR_OPTIONS[0],
                  color: '#fff'
                }}>
                  {eventInfo.event.title}
                </div>
              );
            }}
          />
        </StyledCalendar>
      </Paper>

      {/* Right Panel - Map */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* User Type Filters */}
        <Paper sx={{ p: 2, borderRadius: 0 }}>
          <ToggleButtonGroup
            value={selectedUserType}
            exclusive
            onChange={handleUserTypeChange}
            aria-label="user type"
            size="small"
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
        </Paper>

        {/* Map Container */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
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
                  const { latitude, longitude } = address;
                  if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
                    return (
                      <Marker key={address.id} position={[latitude, longitude]}>
                        <Popup>
                          <strong>{user.first_name} {user.last_name}</strong> <br />
                          {address.street_name} {address.house_number}, {address.city} <br />
                          {address.zip_code}, {address.country} <br />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAddToCalendar(user, address)}
                            sx={{ mt: 1 }}
                          >
                            Schedule Visit (2h)
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
    </Box>
  );
};

export default Map;

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
  { value: "special", label: "Special" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "supermarket", label: "Supermarket" },
  { value: "standard_business", label: "Standaard Zakelijk" },
  { value: "particular", label: "Particular" },
  { value: "admin", label: "Admin" },
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
    const now = new Date();
    // Set the time to 9:00 AM
    const visitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);

    // Find the latest event end time to avoid overlapping
    const latestEvent = events.length > 0
      ? events.reduce((latest, event) => event.end > latest.end ? event : latest)
      : null;

    // If there are existing events, schedule after the latest one
    if (latestEvent) {
      const latestEndTime = new Date(latestEvent.end);
      // If the latest event ends after 9 AM today, use that as the start time
      if (latestEndTime > visitDate) {
        visitDate.setTime(latestEndTime.getTime());
      }
    }

    const visitStart = visitDate.getTime();
    const visitEnd = new Date(visitStart + (2 * 60 * 60 * 1000)).getTime(); // 2 hours later

    const eventData: CalendarEvent = {
      id: `${user.id}-${address.id}-${visitStart}`,
      title: `Visit ${user.first_name} ${user.last_name}`,
      description: `Visit at ${address.street_name} ${address.house_number}, ${address.city}, ${address.zip_code}, ${address.country}`,
      start: visitStart,
      end: visitEnd,
      color: CALENDAR_COLOR_OPTIONS[Math.floor(Math.random() * CALENDAR_COLOR_OPTIONS.length)],
      allDay: false,
    };

    try {
      await createEvent(eventData);
      setEvents([...events, eventData]);
      enqueueSnackbar('Visit scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling visit:', error);
      enqueueSnackbar('Error scheduling visit', { variant: 'error' });
    }
  };

  const handleEventDrop = async (info: any) => {
    try {
      const { event } = info;
      const updatedEvent: CalendarEvent = {
        ...events.find(e => e.id === event.id)!,
        start: Number(fTimestamp(event.start)),
        end: Number(fTimestamp(event.end)),
        allDay: event.allDay,
      };
      await updateEvent(updatedEvent);
      setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      enqueueSnackbar('Visit time updated successfully!');
    } catch (error) {
      console.error('Error updating visit:', error);
      enqueueSnackbar('Error updating visit time', { variant: 'error' });
    }
  };

  const handleEventResize = async (info: any) => {
    try {
      const { event } = info;
      const updatedEvent: CalendarEvent = {
        ...events.find(e => e.id === event.id)!,
        start: Number(fTimestamp(event.start)),
        end: Number(fTimestamp(event.end)),
        allDay: event.allDay,
      };
      await updateEvent(updatedEvent);
      setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      enqueueSnackbar('Visit duration updated successfully!');
    } catch (error) {
      console.error('Error updating visit duration:', error);
      enqueueSnackbar('Error updating visit duration', { variant: 'error' });
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
            ref={calendarRef}
            events={events}
            eventDisplay="block"
            dayMaxEventRows={3}
            height="100%"
            allDayMaintainDuration
            eventResizableFromStart
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,listWeek'
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

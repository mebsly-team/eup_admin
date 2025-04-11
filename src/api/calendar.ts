import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';
import { ICalendarEvent } from 'src/types/calendar';
import {
  fetchGoogleEvents,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} from 'src/services/google-calendar';

// ----------------------------------------------------------------------

const URL = endpoints.calendar;

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetEvents() {
  const { data, isLoading, error, isValidating } = useSWR(URL, async () => {
    try {
      // Get events from 30 days ago to 60 days in the future
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

      console.log('Fetching events for date range:', {
        from: thirtyDaysAgo.toLocaleString(),
        to: sixtyDaysFromNow.toLocaleString()
      });

      const googleEvents = await fetchGoogleEvents(thirtyDaysAgo, sixtyDaysFromNow);

      return { events: googleEvents };
    } catch (error) {
      console.error('Error fetching events:', error);
      return { events: [] };
    }
  }, options);

  const memoizedValue = useMemo(() => {
    const events = data?.events.map((event: ICalendarEvent) => ({
      ...event,
      textColor: event.color,
    }));

    return {
      events: (events as ICalendarEvent[]) || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data?.events.length,
    };
  }, [data?.events, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createEvent(eventData: ICalendarEvent) {
  try {
    // Create event in Google Calendar
    const newEvent = await createGoogleEvent(eventData);

    // Update local state
    mutate(
      URL,
      (currentData: any) => {
        const events: ICalendarEvent[] = [...(currentData?.events || []), newEvent];
        return {
          ...currentData,
          events,
        };
      },
      false
    );

    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function updateEvent(eventData: Partial<ICalendarEvent>) {
  try {
    if (!eventData.id) {
      throw new Error('Event ID is required for updating');
    }

    // Update event in Google Calendar
    const updatedEvent = await updateGoogleEvent(eventData as ICalendarEvent);

    // Update local state
    mutate(
      URL,
      (currentData: any) => {
        const events: ICalendarEvent[] = (currentData?.events || []).map((event: ICalendarEvent) =>
          event.id === eventData.id ? updatedEvent : event
        );
        return {
          ...currentData,
          events,
        };
      },
      false
    );

    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId: string) {
  try {
    // Delete event from Google Calendar
    await deleteGoogleEvent(eventId);

    // Update local state
    mutate(
      URL,
      (currentData: any) => {
        const events: ICalendarEvent[] = (currentData?.events || []).filter(
          (event: ICalendarEvent) => event.id !== eventId
        );
        return {
          ...currentData,
          events,
        };
      },
      false
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

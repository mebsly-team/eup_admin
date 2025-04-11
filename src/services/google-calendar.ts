/// <reference types="gapi" />
/// <reference types="gapi.client.calendar" />

import { ICalendarEvent } from 'src/types/calendar';

// Convert our app's event format to Google Calendar event format
const convertToGoogleEvent = (event: ICalendarEvent): gapi.client.calendar.Event => {
    // Don't include id for new events
    const googleEvent: gapi.client.calendar.Event = {
        summary: event.title,
        description: event.description,
        start: {
            dateTime: new Date(Number(event.start)).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
            dateTime: new Date(Number(event.end)).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
    };

    // Convert hex color to Google Calendar colorId (1-11)
    if (event.color) {
        // Map your app's colors to Google Calendar's colorIds
        // You can customize this mapping based on your color palette
        const colorMap: { [key: string]: string } = {
            '#1890FF': '1',  // Blue
            '#0F9D58': '2',  // Green
            '#DB4437': '3',  // Red
            '#F4B400': '4',  // Yellow
            '#8E33FF': '5',  // Purple
            // Add more color mappings as needed
        };
        googleEvent.colorId = colorMap[event.color] || '1'; // Default to blue if no match
    }

    return googleEvent;
};

// Convert Google Calendar event to our app's format
const convertFromGoogleEvent = (event: gapi.client.calendar.Event): ICalendarEvent => {
    // Handle start date/time
    let start: number;
    let end: number;
    const allDay = !event.start?.dateTime && !!event.start?.date;

    if (allDay) {
        // For all-day events, use the date
        start = new Date(event.start?.date || '').getTime();
        end = new Date(event.end?.date || '').getTime();
    } else {
        // For regular events, use the dateTime
        start = new Date(event.start?.dateTime || '').getTime();
        end = new Date(event.end?.dateTime || '').getTime();
    }

    // Validate dates and use current time if invalid
    if (isNaN(start)) {
        console.warn('Invalid start date detected:', event.start);
        start = Date.now();
    }
    if (isNaN(end)) {
        console.warn('Invalid end date detected:', event.end);
        end = start + (60 * 60 * 1000); // 1 hour from start
    }

    const converted = {
        id: event.id || '',
        title: event.summary || '',
        description: event.description || '',
        start,
        end,
        color: event.colorId ? `#${event.colorId}` : '#1890FF', // Default color if none specified
        allDay,
    };
    console.log('Converting single event:', { event, converted });
    return converted;
};

export const fetchGoogleEvents = async (timeMin: Date, timeMax: Date) => {
    console.log('Fetching Google Calendar events...', { timeMin, timeMax });
    try {
        // Check authentication status
        const token = window.gapi?.client?.getToken();
        console.log('Current auth token:', token);

        if (!window.gapi?.client?.calendar) {
            console.error('Google Calendar API not initialized');
            return [];
        }

        if (!token) {
            console.log('No auth token available, skipping event fetch');
            return [];
        }

        console.log('Making API request to fetch events...');
        const response = await gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 2500, // Get more events
        });

        console.log('Raw API response:', response);
        console.log('Fetched events:', response.result);

        const convertedEvents = response.result.items?.map((event) => {
            const converted = convertFromGoogleEvent(event);
            console.log('Converting event:', { original: event, converted });
            return converted;
        }) || [];

        console.log('All converted events:', convertedEvents);
        return convertedEvents;
    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        throw error;
    }
};

export const createGoogleEvent = async (event: ICalendarEvent) => {
    console.log('Creating Google Calendar event:', event);
    try {
        if (!window.gapi?.client?.calendar) {
            console.error('Google Calendar API not initialized');
            throw new Error('Google Calendar API not initialized');
        }

        const response = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: convertToGoogleEvent(event),
        });

        console.log('Created event:', response.result);
        return convertFromGoogleEvent(response.result);
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw error;
    }
};

export const updateGoogleEvent = async (event: ICalendarEvent) => {
    console.log('Updating Google Calendar event:', event);
    try {
        if (!window.gapi?.client?.calendar) {
            console.error('Google Calendar API not initialized');
            throw new Error('Google Calendar API not initialized');
        }

        const response = await gapi.client.calendar.events.update({
            calendarId: 'primary',
            eventId: event.id,
            resource: convertToGoogleEvent(event),
        });

        console.log('Updated event:', response.result);
        return convertFromGoogleEvent(response.result);
    } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        throw error;
    }
};

export const deleteGoogleEvent = async (eventId: string) => {
    console.log('Deleting Google Calendar event:', eventId);
    try {
        if (!window.gapi?.client?.calendar) {
            console.error('Google Calendar API not initialized');
            throw new Error('Google Calendar API not initialized');
        }

        await gapi.client.calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });

        console.log('Deleted event:', eventId);
    } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
        throw error;
    }
}; 
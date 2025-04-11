/// <reference types="gapi" />
/// <reference types="gapi.client.calendar" />

declare global {
    interface Window {
        gapi: typeof gapi & {
            client: {
                init: (config: {
                    apiKey: string;
                    discoveryDocs: string[];
                }) => Promise<void>;
                setToken: (token: { access_token: string } | null) => void;
                getToken: () => { access_token: string } | null;
                calendar: {
                    events: {
                        list: (params: {
                            calendarId: string;
                            timeMin: string;
                            timeMax: string;
                            singleEvents: boolean;
                            orderBy: string;
                        }) => Promise<{
                            result: {
                                items: gapi.client.calendar.Event[];
                            };
                        }>;
                        insert: (params: {
                            calendarId: string;
                            resource: gapi.client.calendar.Event;
                        }) => Promise<{
                            result: gapi.client.calendar.Event;
                        }>;
                        update: (params: {
                            calendarId: string;
                            eventId: string;
                            resource: gapi.client.calendar.Event;
                        }) => Promise<{
                            result: gapi.client.calendar.Event;
                        }>;
                        delete: (params: {
                            calendarId: string;
                            eventId: string;
                        }) => Promise<void>;
                    };
                };
            };
            load: (api: string, callback: () => void) => void;
        };
        google: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (response: { access_token: string }) => void;
                    }) => {
                        requestAccessToken: () => void;
                    };
                    revoke: (token: string, callback?: () => void) => void;
                };
            };
        };
    }
} 
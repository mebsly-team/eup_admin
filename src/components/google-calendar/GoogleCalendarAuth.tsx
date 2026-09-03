import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'src/components/snackbar';
import { mutate } from 'swr';
import axiosInstance, { endpoints } from 'src/utils/axios';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

// CALENDAR_ID bir kimlik/e-posta; sir degil, istemci tarafinda kalabilir.
// Service account e-posta/private key/delegated user artik SUNUCU tarafinda tutulur.
const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary';

export default function GoogleCalendarAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const initializeCalendarConnection = async () => {
            try {
                setIsLoading(true);

                const storedToken = localStorage.getItem('googleCalendarToken');
                const tokenExpiry = localStorage.getItem('googleCalendarTokenExpiry');

                if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry, 10)) {
                    await ensureGapiInitialized(storedToken);
                    setIsAuthenticated(true);
                    mutate(endpoints.calendar);
                    setIsLoading(false);
                    return;
                }

                const accessToken = await getServiceAccountAccessToken();

                if (accessToken) {
                    const expiryTime = Date.now() + 3500000;
                    localStorage.setItem('googleCalendarToken', accessToken);
                    localStorage.setItem('googleCalendarTokenExpiry', expiryTime.toString());

                    await ensureGapiInitialized(accessToken);
                    setIsAuthenticated(true);
                    mutate(endpoints.calendar);
                    enqueueSnackbar('Google Calendar connected', { variant: 'success' });
                } else {
                    throw new Error('Failed to obtain access token');
                }
            } catch (error: any) {
                console.error('Error connecting to Google Calendar:', error);
                enqueueSnackbar(`Calendar connection failed: ${error.message || error}`, { variant: 'error' });
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        initializeCalendarConnection();
    }, [enqueueSnackbar]);

    // Access token SUNUCU tarafinda uretilir (service account private key tarayiciya ASLA gitmez).
    // Backend kisa omurlu (1 saat) bir access token doner.
    const getServiceAccountAccessToken = async (): Promise<string | null> => {
        try {
            const res = await axiosInstance.get('/google/calendar-token/');
            return res.data?.access_token || null;
        } catch (error) {
            console.error('Error getting service account access token:', error);
            return null;
        }
    };

    const loadGapiScript = (): Promise<void> =>
        new Promise((resolve, reject) => {
            if ((window as any).gapi) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load gapi script'));
            document.body.appendChild(script);
        });

    const ensureGapiInitialized = async (accessToken: string): Promise<void> => {
        await loadGapiScript();
        await new Promise<void>((resolve, reject) => {
            (window as any).gapi.load('client', async () => {
                try {
                    if (!(window as any).gapi.client?.calendar) {
                        await (window as any).gapi.client.init({});
                        await (window as any).gapi.client.load('calendar', 'v3');
                    }
                    (window as any).gapi.client.setToken({ access_token: accessToken });
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    };

    const testWriteAccess = async () => {
        try {
            setTesting(true);
            if (!(window as any).gapi?.client?.calendar) throw new Error('Google Calendar API not initialized');
            const start = new Date(Date.now() + 5 * 60 * 1000);
            const end = new Date(start.getTime() + 10 * 60 * 1000);
            const event = {
                summary: 'WriteTest',
                description: 'Temporary event to verify write access',
                location: 'Test Location',
                start: { dateTime: start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                end: { dateTime: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            };
            const insert = await (window as any).gapi.client.calendar.events.insert({ calendarId: GOOGLE_CALENDAR_ID, resource: event });
            if (insert.status !== 200) throw new Error(`Insert failed: ${insert.status}`);
            const eventId = insert.result.id;
            const del = await (window as any).gapi.client.calendar.events.delete({ calendarId: GOOGLE_CALENDAR_ID, eventId });
            if (del.status !== 204) throw new Error(`Delete failed: ${del.status}`);
            enqueueSnackbar('Write access OK: insert/delete succeeded', { variant: 'success' });
        } catch (e: any) {
            const msg = e?.result?.error?.message || e?.message || 'Unknown error';
            enqueueSnackbar(`Write access failed: ${msg}`, { variant: 'error' });
        } finally {
            setTesting(false);
        }
    };

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption">{isAuthenticated ? 'Google Calendar connected' : 'Google Calendar disconnected'}</Typography>
        </Stack>
    );
}

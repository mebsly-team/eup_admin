import { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'src/components/snackbar';
import { mutate } from 'swr';
import { endpoints } from 'src/utils/axios';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

const SERVICE_ACCOUNT_EMAIL = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
const DELEGATED_USER = import.meta.env.VITE_GOOGLE_DELEGATED_USER;
const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || DELEGATED_USER || 'primary';

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

                if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
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

    const getServiceAccountAccessToken = async (): Promise<string | null> => {
        try {
            if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
                throw new Error('Service account credentials not configured');
            }

            const header = {
                alg: 'RS256',
                typ: 'JWT'
            } as const;

            const now = Math.floor(Date.now() / 1000);
            const claimSet: Record<string, string | number> = {
                iss: SERVICE_ACCOUNT_EMAIL,
                scope: 'https://www.googleapis.com/auth/calendar',
                aud: 'https://oauth2.googleapis.com/token',
                exp: now + 3600,
                iat: now
            };

            if (DELEGATED_USER) {
                claimSet.sub = DELEGATED_USER;
            }

            const encodedHeader = base64UrlEncode(JSON.stringify(header));
            const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));

            const signatureInput = `${encodedHeader}.${encodedClaimSet}`;
            const signature = await signWithPrivateKey(signatureInput, SERVICE_ACCOUNT_PRIVATE_KEY);

            const jwt = `${signatureInput}.${signature}`;

            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt
                })
            });

            if (!response.ok) {
                throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.access_token;

        } catch (error) {
            console.error('Error getting service account access token:', error);
            return null;
        }
    };

    const loadGapiScript = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if ((window as any).gapi) return resolve();
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load gapi script'));
            document.body.appendChild(script);
        });
    };

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

    const signWithPrivateKey = async (data: string, privateKey: string): Promise<string> => {
        try {
            const key = await window.crypto.subtle.importKey(
                'pkcs8',
                pemToArrayBuffer(privateKey),
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    hash: { name: 'SHA-256' }
                },
                false,
                ['sign']
            );

            const signature = await window.crypto.subtle.sign(
                'RSASSA-PKCS1-v1_5',
                key,
                new TextEncoder().encode(data)
            );

            return arrayBufferToBase64(signature).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        } catch (error) {
            console.error('Error signing with private key:', error);
            throw error;
        }
    };

    const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
        const cleaned = base64.replace(/\s+/g, '');
        const binaryString = atob(cleaned);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const pemToArrayBuffer = (pem: string): ArrayBuffer => {
        const pemBody = pem
            .replace(/-----BEGIN [^-]+-----/g, '')
            .replace(/-----END [^-]+-----/g, '')
            .replace(/\r?\n/g, '')
            .replace(/\s+/g, '');
        return base64ToArrayBuffer(pemBody);
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const base64UrlEncode = (input: string): string => {
        return btoa(input)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
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
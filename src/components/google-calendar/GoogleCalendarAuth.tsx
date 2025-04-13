import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { mutate } from 'swr';
import { endpoints } from 'src/utils/axios';

// Add these to your index.html:
// <script src="https://apis.google.com/js/api.js"></script>
// <script src="https://accounts.google.com/gsi/client"></script>

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const REDIRECT_URI = import.meta.env.DEV
    ? 'https://localhost:3000'  // Development
    : 'https://admin.europowerbv.com'; // Production

export default function GoogleCalendarAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [gapiInited, setGapiInited] = useState(false);
    const [gisInited, setGisInited] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const initializeGapi = async () => {
            try {
                console.log('Initializing GAPI...');
                if (!window.gapi) {
                    console.error('Google API client library not loaded');
                    enqueueSnackbar('Failed to load Google Calendar API', { variant: 'error' });
                    return;
                }

                await new Promise((resolve) => window.gapi.load('client', resolve));
                console.log('GAPI client loaded');

                await window.gapi.client.init({
                    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyBH17J5aZoj9jdY4mY0pCLA2iUstkAXcgo",
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                });
                console.log('GAPI client initialized');

                // Check for existing tokens after initialization
                const tokens = localStorage.getItem('googleCalendarTokens');
                if (tokens) {
                    console.log('Found existing tokens');
                    const { access_token } = JSON.parse(tokens);
                    if (access_token) {
                        window.gapi.client.setToken({ access_token });
                        setIsAuthenticated(true);
                        // Refresh calendar events when restoring token
                        mutate(endpoints.calendar);
                    }
                }

                setGapiInited(true);
            } catch (error) {
                console.error('Error initializing GAPI client:', error);
                // Disconnect on initialization error
                const token = window.gapi?.client?.getToken();
                if (token) {
                    window.google.accounts.oauth2.revoke(token.access_token);
                    window.gapi.client.setToken(null);
                }
                localStorage.removeItem('googleCalendarTokens');
                setIsAuthenticated(false);
                enqueueSnackbar('Failed to initialize Google Calendar - Disconnected', { variant: 'error' });
            }
        };

        const initializeGis = () => {
            try {
                console.log('Initializing GIS...');
                if (!window.google?.accounts?.oauth2) {
                    console.error('Google Identity Services not loaded');
                    enqueueSnackbar('Failed to load Google Sign-In', { variant: 'error' });
                    return;
                }

                setGisInited(true);
            } catch (error) {
                console.error('Error initializing GIS client:', error);
                // Disconnect on GIS initialization error
                const token = window.gapi?.client?.getToken();
                if (token) {
                    window.google.accounts.oauth2.revoke(token.access_token);
                    window.gapi.client.setToken(null);
                }
                localStorage.removeItem('googleCalendarTokens');
                setIsAuthenticated(false);
                enqueueSnackbar('Failed to initialize Google Sign-In - Disconnected', { variant: 'error' });
            }
        };

        // Check if scripts are loaded
        if (!window.gapi) {
            console.error('Google API client library not loaded. Make sure the script is in index.html');
            return;
        }

        if (!window.google?.accounts?.oauth2) {
            console.error('Google Identity Services not loaded. Make sure the script is in index.html');
            return;
        }

        initializeGapi();
        initializeGis();
    }, [enqueueSnackbar]);

    const handleTokenResponse = (response: any) => {
        console.log('Received token response:', response);
        try {
            if (response.access_token) {
                localStorage.setItem('googleCalendarTokens', JSON.stringify(response));
                window.gapi.client.setToken({ access_token: response.access_token });
                setIsAuthenticated(true);
                // Refresh calendar events after new token received
                mutate(endpoints.calendar);
                enqueueSnackbar('Successfully connected to Google Calendar!', { variant: 'success' });
            } else {
                throw new Error('No access token received');
            }
        } catch (error) {
            console.error('Error handling token response:', error);
            // Disconnect on token handling error
            const token = window.gapi?.client?.getToken();
            if (token) {
                window.google.accounts.oauth2.revoke(token.access_token);
                window.gapi.client.setToken(null);
            }
            localStorage.removeItem('googleCalendarTokens');
            setIsAuthenticated(false);
            enqueueSnackbar('Failed to connect to Google Calendar - Disconnected', { variant: 'error' });
        }
    };

    const handleAuthClick = () => {
        if (!gapiInited || !gisInited) {
            console.log('Not initialized yet. GAPI:', gapiInited, 'GIS:', gisInited);
            enqueueSnackbar('Google Calendar is not initialized yet', { variant: 'warning' });
            return;
        }

        console.log('Requesting access token...');
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "63545553853-6p449srf24g399nq70is8oao2bt8lndj.apps.googleusercontent.com",
            scope: SCOPES,
            callback: handleTokenResponse,
            ux_mode: 'redirect',
            redirect_uri: REDIRECT_URI
        });

        client.requestAccessToken();
    };

    const handleDisconnect = () => {
        console.log('Disconnecting...');
        const token = window.gapi.client.getToken();
        if (token) {
            window.google.accounts.oauth2.revoke(token.access_token);
            window.gapi.client.setToken(null);
        }
        localStorage.removeItem('googleCalendarTokens');
        setIsAuthenticated(false);
        // Refresh calendar events after disconnecting
        mutate(endpoints.calendar);
        enqueueSnackbar('Disconnected from Google Calendar', { variant: 'info' });
    };

    return (
        <Button
            variant={isAuthenticated ? 'outlined' : 'contained'}
            startIcon={<Iconify icon={isAuthenticated ? 'mdi:google-calendar' : 'flat-color-icons:google'} />}
            onClick={isAuthenticated ? handleDisconnect : handleAuthClick}
            sx={{ ml: 2 }}
            disabled={!gapiInited || !gisInited}
        >
            {isAuthenticated ? 'Disconnect Calendar' : 'Connect Google Calendar'}
        </Button>
    );
} 
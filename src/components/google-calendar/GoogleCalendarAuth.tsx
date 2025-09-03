import { useState, useEffect, useRef } from 'react';
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

export default function GoogleCalendarAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const initializeCalendarConnection = async () => {
            try {
                setIsLoading(true);

                // Check if we already have a valid token
                const storedToken = localStorage.getItem('googleCalendarToken');
                const tokenExpiry = localStorage.getItem('googleCalendarTokenExpiry');

                if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
                    // Token is still valid
                    await ensureGapiInitialized(storedToken);
                    setIsAuthenticated(true);
                    mutate(endpoints.calendar);
                    setIsLoading(false);
                    return;
                }

                // Get new access token using service account
                const accessToken = await getServiceAccountAccessToken();

                if (accessToken) {
                    // Store token with expiry (typically 1 hour)
                    const expiryTime = Date.now() + 3500000; // 58 minutes for safety
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

            // Create JWT for service account authentication
            const header = {
                alg: 'RS256',
                typ: 'JWT'
            };

            const now = Math.floor(Date.now() / 1000);
            const claimSet = {
                iss: SERVICE_ACCOUNT_EMAIL,
                scope: 'https://www.googleapis.com/auth/calendar',
                aud: 'https://oauth2.googleapis.com/token',
                exp: now + 3600, // 1 hour
                iat: now
            };

            // Encode header and claim set (base64url)
            const encodedHeader = base64UrlEncode(JSON.stringify(header));
            const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));

            // Create signature
            const signatureInput = `${encodedHeader}.${encodedClaimSet}`;
            const signature = await signWithPrivateKey(signatureInput, SERVICE_ACCOUNT_PRIVATE_KEY);

            // Create JWT
            const jwt = `${signatureInput}.${signature}`;

            // Exchange JWT for access token
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
        // For browser environments, we need to use the Web Crypto API
        // Note: This is a simplified version - you might want to use a library like jsrsasign

        try {
            // Import the private key
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

            // Sign the data
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

    return null;
}
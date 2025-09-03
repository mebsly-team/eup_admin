export const GOOGLE_CONFIG = {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    project_id: import.meta.env.VITE_GOOGLE_PROJECT_ID || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
    redirect_uris: [
        'https://admin.kooptop.com',
        'https://admin.europowerbv.com',
        'https://localhost:3000',
        'https://be.kooptop.com',
        'https://be.europowerbv.com',
    ],
    javascript_origins: [
        'https://admin.kooptop.com',
        'https://admin.europowerbv.com',
        'https://localhost:3000',
        'https://be.kooptop.com',
        'https://be.europowerbv.com',
    ],
} as const;

export const getRedirectUri = () => {
    const hostname = window.location.hostname;

    return GOOGLE_CONFIG.redirect_uris.find((uri) => uri.includes(hostname)) ||
        (import.meta.env.DEV ? 'https://localhost:3000' : GOOGLE_CONFIG.redirect_uris[0]);
}; 
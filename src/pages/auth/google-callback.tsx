import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

export default function GoogleCallback() {
    const router = useRouter();

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token) {
            // Send tokens back to parent window
            window.opener.postMessage(
                {
                    type: 'GOOGLE_AUTH_SUCCESS',
                    access_token,
                    refresh_token,
                },
                window.location.origin
            );

            // Close the popup window
            window.close();
        } else {
            console.error('No access token received');
            // Handle error case
            window.opener.postMessage(
                {
                    type: 'GOOGLE_AUTH_ERROR',
                    error: 'No access token received',
                },
                window.location.origin
            );
            window.close();
        }
    }, [router]);

    return (
        <Container>
            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                spacing={2}
                sx={{ minHeight: '100vh' }}
            >
                <CircularProgress />
                <Typography>Completing Google Calendar authentication...</Typography>
            </Stack>
        </Container>
    );
} 
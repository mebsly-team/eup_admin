import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  currentUser: any;
};

export default function UserDetailsHistory({ currentUser }: Props) {
  const history: any[] = Array.isArray(currentUser?.history) ? currentUser.history : [];

  // Newest first: the latest change is what one comes here to check.
  const events = history.map((item, index) => ({ ...item, index })).reverse();

  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Geschiedenis
      </Typography>

      <Stack sx={{ maxHeight: 480, overflowY: 'auto' }}>
        {events.map((item, position) => (
          <Stack key={item.index} direction="row" spacing={1.5}>
            <Stack alignItems="center" sx={{ pt: 0.75 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: position === 0 ? 'primary.main' : 'grey.400',
                }}
              />
              {position < events.length - 1 && (
                <Box sx={{ width: '1px', flexGrow: 1, mt: 0.5, bgcolor: 'divider' }} />
              )}
            </Stack>

            <Box sx={{ pb: 2, minWidth: 0 }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {item.event}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {fDateTime(item.date)}
              </Typography>
            </Box>
          </Stack>
        ))}

        {events.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nog geen geschiedenis
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

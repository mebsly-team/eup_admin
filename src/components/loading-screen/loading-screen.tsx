import Box, { BoxProps } from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useErrorRefresh } from 'src/hooks/use-error-refresh';

// ----------------------------------------------------------------------

function LoadingScreenWrapper({ sx, ...other }: BoxProps) {
  useErrorRefresh();

  return (
    <Box
      sx={{
        px: 5,
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
      {...other}
    >
      <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 360 }} />
    </Box>
  );
}

export default function LoadingScreen({ sx, ...other }: BoxProps) {
  return <LoadingScreenWrapper sx={sx} {...other} />;
}

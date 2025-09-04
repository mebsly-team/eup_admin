import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import Header from '../common/header-simple';
import ErrorRefresh from 'src/components/error-refresh';
import { useErrorRefresh } from 'src/hooks/use-error-refresh';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

function CompactLayoutWrapper({ children }: Props) {
  useErrorRefresh();

  return (
    <>
      <Header />

      <Container component="main">
        <Stack
          sx={{
            py: 12,
            m: 'auto',
            maxWidth: 400,
            minHeight: '100vh',
            textAlign: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </Stack>
      </Container>
      <ErrorRefresh />
    </>
  );
}

export default function CompactLayout({ children }: Props) {
  return <CompactLayoutWrapper>{children}</CompactLayoutWrapper>;
}

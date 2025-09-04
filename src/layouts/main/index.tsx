import Box from '@mui/material/Box';

import { usePathname } from 'src/routes/hooks';
import { useErrorRefresh } from 'src/hooks/use-error-refresh';

import Footer from './footer';
import Header from './header';
import ErrorRefresh from 'src/components/error-refresh';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

function MainLayoutWrapper({ children }: Props) {
  const pathname = usePathname();
  useErrorRefresh();

  const homePage = pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ...(!homePage && {
            pt: { xs: 8, md: 10 },
          }),
        }}
      >
        {children}
      </Box>

      <Footer />
      <ErrorRefresh />
    </Box>
  );
}

export default function MainLayout({ children }: Props) {
  return <MainLayoutWrapper>{children}</MainLayoutWrapper>;
}

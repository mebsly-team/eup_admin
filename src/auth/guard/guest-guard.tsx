import { useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';
import { useErrorRefresh } from 'src/hooks/use-error-refresh';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

function GuestGuardWrapper({ children }: Props) {
  const { loading } = useAuthContext();
  useErrorRefresh();

  return <>{loading ? <SplashScreen /> : <Container>{children}</Container>}</>;
}

// ----------------------------------------------------------------------

function Container({ children }: Props) {
  const router = useRouter();
  useErrorRefresh();

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo') || paths.dashboard.root;

  const { authenticated } = useAuthContext();

  const check = useCallback(() => {
    if (authenticated) {
      router.replace(returnTo);
    }
  }, [authenticated, returnTo, router]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

export default function GuestGuard({ children }: Props) {
  return <GuestGuardWrapper>{children}</GuestGuardWrapper>;
}

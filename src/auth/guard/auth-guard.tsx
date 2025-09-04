import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';
import { useErrorRefresh } from 'src/hooks/use-error-refresh';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

const loginPaths: Record<string, string> = {
  jwt: paths.auth.jwt.login,
};

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

function AuthGuardWrapper({ children }: Props) {
  const { loading } = useAuthContext();
  useErrorRefresh();

  console.log('AuthGuard - loading:', loading);

  if (loading) {
    console.log('AuthGuard - showing splash screen');
    return <SplashScreen />;
  }

  return <Container>{children}</Container>;
}

export default function AuthGuard({ children }: Props) {
  return <AuthGuardWrapper>{children}</AuthGuardWrapper>;
}

// ----------------------------------------------------------------------

function Container({ children }: Props) {
  const router = useRouter();
  useErrorRefresh();

  const { authenticated, method } = useAuthContext();

  const [checked, setChecked] = useState(false);

  console.log('AuthGuard Container - authenticated:', authenticated, 'method:', method, 'checked:', checked);

  const check = useCallback(() => {
    console.log('AuthGuard check - authenticated:', authenticated);
    if (!authenticated) {
      console.log('AuthGuard - not authenticated, redirecting to login');
      const searchParams = new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString();

      const loginPath = loginPaths[method];

      const href = `${loginPath}?${searchParams}`;

      router.replace(href);
    } else {
      console.log('AuthGuard - authenticated, setting checked to true');
      setChecked(true);
    }
  }, [authenticated, method, router]);

  useEffect(() => {
    console.log('AuthGuard useEffect - running check');
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    console.log('AuthGuard - not checked yet, returning null');
    return null;
  }

  console.log('AuthGuard - rendering children');
  return <>{children}</>;
}

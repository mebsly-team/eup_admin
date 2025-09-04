import Header from '../common/header-simple';
import ErrorRefresh from 'src/components/error-refresh';
import { useErrorRefresh } from 'src/hooks/use-error-refresh';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

function SimpleLayoutWrapper({ children }: Props) {
  useErrorRefresh();

  return (
    <>
      <Header />

      {children}
      <ErrorRefresh />
    </>
  );
}

export default function SimpleLayout({ children }: Props) {
  return <SimpleLayoutWrapper>{children}</SimpleLayoutWrapper>;
}

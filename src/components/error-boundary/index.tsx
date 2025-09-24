import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.hasError !== this.state.hasError && this.state.hasError) {
      const checkForErrorLoadingPage = () => {
        const errorElements = document.querySelectorAll('div');
        for (const element of errorElements) {
          if (element.textContent === 'Loading page') {
            console.log('Loading page detected, refreshing...');
            window.location.reload();
            return;
          }
        }
      };

      setTimeout(checkForErrorLoadingPage, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2>Sayfa yüklenirken hata oluştu</h2>
          <p>Sayfa otomatik olarak yenilenecek...</p>
          <div style={{ marginTop: '20px' }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 
import { useEffect, useRef } from 'react';

export function useErrorRefresh() {
  const observerRef = useRef<MutationObserver | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const checkForErrorLoadingPage = () => {
      if (isRefreshingRef.current) return false;

      const errorElements = document.querySelectorAll('div');
      for (const element of errorElements) {
        if (element.textContent === 'Loading page') {
          console.log('Loading page detected, refreshing in 2 seconds...');
          isRefreshingRef.current = true;

          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }

          refreshTimeoutRef.current = setTimeout(() => {
            console.log('Refreshing page...');
            window.location.reload();
          }, 2000);

          return true;
        }
      }
      return false;
    };

    const startObserver = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            if (checkForErrorLoadingPage()) {
              break;
            }
          }
        }
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    const initialCheck = () => {
      if (!checkForErrorLoadingPage()) {
        startObserver();
      }
    };

    initialCheck();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return null;
} 
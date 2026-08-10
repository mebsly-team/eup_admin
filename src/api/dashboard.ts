import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetDashboardMetrics(startDate?: Date | null, endDate?: Date | null) {
  let URL = endpoints.dashboard.metrics;
  
  const params = new URLSearchParams();
  if (startDate && !isNaN(new Date(startDate).getTime())) {
    params.append('start_date', new Date(startDate).toISOString());
  }
  if (endDate && !isNaN(new Date(endDate).getTime())) {
    params.append('end_date', new Date(endDate).toISOString());
  }
  
  const queryString = params.toString();
  if (queryString) {
    URL = `${URL}?${queryString}`;
  }

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      metrics: data || {},
      metricsLoading: isLoading,
      metricsError: error,
      metricsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

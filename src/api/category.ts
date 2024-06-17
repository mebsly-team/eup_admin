import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

import { IBrandItem } from 'src/types/brand';

// ----------------------------------------------------------------------

export function useGetCategories() {
  const URL = '/categories/';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      items: (data as IBrandItem[]) || [],
      itemsLoading: isLoading,
      itemsError: error,
      itemsValidating: isValidating,
      itemsEmpty: !isLoading && !data?.length,
    }),
    [data, error, isLoading, isValidating]
  );

  if (data) localStorage.setItem('categories', JSON.stringify(data));
  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetCategory(productId: string) {
  const URL = productId ? [endpoints.product.details, { params: { productId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      item: data?.item as IBrandItem,
      itemLoading: isLoading,
      itemError: error,
      itemValidating: isValidating,
    }),
    [data?.item, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchCategories(query: string) {
  const URL = query ? [endpoints.product.search, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: (data?.results as IBrandItem[]) || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}

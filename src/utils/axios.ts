import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request interceptor - URL:', config.url);
    const accessToken = localStorage.getItem('accessToken');
    console.log('Request interceptor - Token:', accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('Request interceptor - Added auth header');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => {
    console.log('Response interceptor - Status:', res.status);
    return res;
  },
  (error) => {
    console.error('Response interceptor error:', error.response?.data || error.message);
    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/login/',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};

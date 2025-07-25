import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API =
  import.meta.env.VITE_HOST_API || 'https://be.kooptop.com/api' || `http://localhost:8000/api`;
export const IMAGE_FOLDER_PATH =
  import.meta.env.VITE_IMAGE_FOLDER_PATH || 'https://d3r7qcgexpw3ka.cloudfront.net/';
export const ASSETS_API = import.meta.env.VITE_ASSETS_API;

export const MAPBOX_API = import.meta.env.VITE_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'

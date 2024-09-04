import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API =  'https://be2.mebsly.com/api';
export const IMAGE_FOLDER_PATH = import.meta.env.VITE_IMAGE_FOLDER_PATH; //https://eup-data.s3.amazonaws.com/eup/uploads/
export const ASSETS_API = import.meta.env.VITE_ASSETS_API;

export const MAPBOX_API = import.meta.env.VITE_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'

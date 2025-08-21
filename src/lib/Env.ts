export const URL_API = import.meta.env.VITE_URL_API;
export const API_KEY = import.meta.env.VITE_API_KEY;
export const CACHE_ENABLED = import.meta.env.VITE_CACHE_ENABLED === 'true';
export const CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION) || (1 * 60 * 60 * 1000); // 1 hora por defecto
export const IMAGE_CACHE_DURATION = parseInt(import.meta.env.VITE_IMAGE_CACHE_DURATION) || (30 * 60 * 1000); // 30 minutos por defecto
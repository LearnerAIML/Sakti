// Centralized API configuration supporting both unified and separate deployments
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

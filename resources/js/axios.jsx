import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Important for Laravel Sanctum
});

// Add CSRF token and session handling
api.interceptors.request.use(async (config) => {
    // Get CSRF token from meta tag
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }

    // For Sanctum, we need to call /sanctum/csrf-cookie first
    if (!window.csrfInitialized) {
        try {
            await axios.get('/sanctum/csrf-cookie');
            window.csrfInitialized = true;
        } catch (error) {
            console.error('Failed to initialize CSRF:', error);
        }
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized - redirecting to login');
            window.location.href = '/login';
        }
        if (error.response?.status === 419) {
            console.error('CSRF token mismatch - please refresh');
        }
        return Promise.reject(error);
    }
);

export default api;
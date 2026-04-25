/*
 * Axios API service with JWT interceptors.
 *
 * Uncomment and use when connecting to a real backend.
 *
 * import axios from 'axios';
 *
 * const api = axios.create({
 *   baseURL: import.meta.env.VITE_API_BASE_URL || 'https://library-crbe.onrender.com/api/v1',
 *   headers: { 'Content-Type': 'application/json' },
 * });
 *
 * // Request Interceptor: Attach JWT Token
 * api.interceptors.request.use(
 *   (config) => {
 *     const token = localStorage.getItem('jwt_token');
 *     if (token && config.headers) {
 *       config.headers.Authorization = `Bearer ${token}`;
 *     }
 *     return config;
 *   },
 *   (error) => Promise.reject(error),
 * );
 *
 * // Response Interceptor: Handle 401 Unauthorized
 * api.interceptors.response.use(
 *   (response) => response,
 *   (error) => {
 *     if (error.response && error.response.status === 401) {
 *       localStorage.removeItem('jwt_token');
 *       localStorage.removeItem('user');
 *       window.location.href = '/login';
 *     }
 *     return Promise.reject(error);
 *   },
 * );
 *
 * export default api;
 */

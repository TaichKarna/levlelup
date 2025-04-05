import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true
});

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to get a new access token using refresh token
        const response = await axios.post(
          `${'http://localhost:5000'}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token also fails, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
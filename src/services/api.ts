export const API_URL = 'http://localhost:8000/api/v1';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    ...getAuthHeaders(),
  };
  const response = await fetch(`${API_URL}${url}`, { ...options, headers });
  
  if (response.status === 401) {
    // Optionally handle refresh token logic here
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
  return response;
};

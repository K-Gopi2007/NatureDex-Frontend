export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://naturedex-api.onrender.com";

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  const authHeaders = getAuthHeaders();
  if (authHeaders.Authorization) {
    headers.set('Authorization', authHeaders.Authorization);
  }
  const response = await fetch(`${API_URL}${url}`, { ...options, headers });
  
  if (response.status === 401) {
    // Optionally handle refresh token logic here
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
  return response;
};

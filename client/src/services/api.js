const API_BASE_URL = '/api';

// Helper to get stored auth token
export const getToken = () => localStorage.getItem('keeploop_token');
export const setToken = (token) => localStorage.setItem('keeploop_token', token);
export const removeToken = () => localStorage.removeItem('keeploop_token');

// Generic fetch wrapper with auth header and error extraction
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: 'Failed to parse server response.',
  }));

  if (!response.ok) {
    const error = new Error(data.error || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Health & Atlas status
  getHealth: () => request('/health'),

  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/auth/password', { method: 'PUT', body: JSON.stringify(body) }),

  // Dashboard Stats
  getDashboardStats: () => request('/dashboard/stats'),

  // Items
  getItems: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/items${queryString ? `?${queryString}` : ''}`);
  },
  getItem: (id) => request(`/items/${id}`),
  createItem: (body) => request('/items', { method: 'POST', body: JSON.stringify(body) }),
  updateItem: (id, body) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Maintenance Records
  getMaintenance: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/maintenance${queryString ? `?${queryString}` : ''}`);
  },
  getMaintenanceById: (id) => request(`/maintenance/${id}`),
  createMaintenance: (body) => request('/maintenance', { method: 'POST', body: JSON.stringify(body) }),
  updateMaintenance: (id, body) => request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMaintenance: (id) => request(`/maintenance/${id}`, { method: 'DELETE' }),

  // Lifecycle Events
  getItemLifecycle: (itemId) => request(`/lifecycle/item/${itemId}`),
  getRecentLifecycle: (limit = 10) => request(`/lifecycle/recent?limit=${limit}`),
  createLifecycleEvent: (body) => request('/lifecycle', { method: 'POST', body: JSON.stringify(body) }),
};


const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!data.success) throw new Error(data.error);
  return data;
};

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await handleResponse(res);
  },
  
  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return await handleResponse(res);
  },

  getProjects: async () => {
    const res = await fetch(`${API_URL}/projects`, {
      headers: getHeaders()
    });
    const data = await handleResponse(res);
    return data.data;
  },

  createProject: async (title, description) => {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description })
    });
    const data = await handleResponse(res);
    return data.data;
  },

  getTasks: async (projectId) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
      headers: getHeaders()
    });
    const data = await handleResponse(res);
    return data.data;
  },

  createTask: async (projectId, title) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title })
    });
    const data = await handleResponse(res);
    return data.data;
  },

  updateProject: async (id, title, description) => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ title, description })
    });
    const data = await handleResponse(res);
    return data.data;
  },

  deleteProject: async (id) => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  },

  updateTask: async (taskId, updateData, projectId) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });
    const data = await handleResponse(res);
    return data.data;
  },

  deleteTask: async (taskId, projectId) => {
    const res = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  }
};

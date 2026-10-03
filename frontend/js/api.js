const API_BASE = window.location.protocol === 'file:'
  ? 'http://localhost:5000/api'
  : '/api';

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = window.Auth ? Auth.getToken() : localStorage.getItem('hd_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Open the URL printed by the backend and make sure MySQL is running.');
  }

  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch (err) {
      throw new Error('The server returned an unexpected response.');
    }
  }

  if (!response.ok) {
    const error = new Error(body.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return body;
}

window.API = {
  API_BASE,
  request: apiRequest
};

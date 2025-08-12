// apiService.js
const api = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/photographers',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  async getClients() {
    return this.request('/clients/');
  },

  async getClient(id) {
    return this.request(`/clients/${id}/`);
  },

  async createClient(clientData) {
    return this.request('/clients/', {
      method: 'POST',
      body: clientData
    });
  },

  async updateClient(id, clientData) {
    return this.request(`/clients/${id}/`, {
      method: 'PATCH',
      body: clientData
    });
  },

  async deleteClient(id) {
    return this.request(`/clients/${id}/`, {
      method: 'DELETE'
    });
  },

  async getClientBookings(id) {
    return this.request(`/clients/${id}/bookings/`);
  }
};

export default api;
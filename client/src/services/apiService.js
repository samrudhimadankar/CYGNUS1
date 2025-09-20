import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Star Systems
  async getStarSystems() {
    try {
      const response = await api.get('/starsystems');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch star systems: ${error.message}`);
    }
  },

  async getStarSystem(id) {
    try {
      const response = await api.get(`/starsystems/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch star system: ${error.message}`);
    }
  },

  async createStarSystem(starSystemData) {
    try {
      const response = await api.post('/starsystems', starSystemData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create star system: ${error.response?.data?.message || error.message}`);
    }
  },

  async updateStarSystem(id, starSystemData) {
    try {
      const response = await api.put(`/starsystems/${id}`, starSystemData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update star system: ${error.response?.data?.message || error.message}`);
    }
  },

  async deleteStarSystem(id) {
    try {
      const response = await api.delete(`/starsystems/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete star system: ${error.message}`);
    }
  },

  async createBulkStarSystems(starSystemsData) {
    try {
      const response = await api.post('/starsystems/bulk', { starSystems: starSystemsData });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create bulk star systems: ${error.response?.data?.message || error.message}`);
    }
  },

  // Trade Routes
  async getTradeRoutes() {
    try {
      const response = await api.get('/traderoutes');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch trade routes: ${error.message}`);
    }
  },

  async optimizeTradeRoutes(sourceId, destinationId, maxWaypoints = 2) {
    try {
      const response = await api.post('/traderoutes/optimize', {
        sourceId,
        destinationId,
        maxWaypoints
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to optimize trade routes: ${error.response?.data?.message || error.message}`);
    }
  },

  async deleteTradeRoute(id) {
    try {
      const response = await api.delete(`/traderoutes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete trade route: ${error.message}`);
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
};

export default apiService;

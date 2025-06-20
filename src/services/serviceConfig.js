// Service configuration
// This file controls whether to use real or mock services

// Set this to false to use real services that connect to the backend
// Set this to true to use mock services for development when backend is unavailable
export const USE_MOCK_SERVICES = false;

// Set this to true to use mock admin services while using real services for other features
export const USE_MOCK_ADMIN = true;

// API base URL
export const API_BASE_URL = "http://localhost:5150";

// Service configuration object
export const SERVICE_CONFIG = {
  useMockServices: USE_MOCK_SERVICES,
  useMockAdmin: USE_MOCK_ADMIN,
  apiBaseUrl: API_BASE_URL,
};

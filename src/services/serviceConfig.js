// Service configuration
// This file controls whether to use real or mock services

// MOCK SERVICES DISABLED - Use real backend only
// Set this to false to use real services
export const USE_MOCK_SERVICES = false;

// Set this to false to use real admin services
export const USE_MOCK_ADMIN = false;

// API base URL
export const API_BASE_URL = "http://localhost:5150";

// Service configuration object
export const SERVICE_CONFIG = {
  baseURL: "http://localhost:5150",
  timeout: 10000,
  apiVersion: "v1",
  endpoints: {},
  useMockServices: USE_MOCK_SERVICES,
  useMockAdmin: USE_MOCK_ADMIN,
};

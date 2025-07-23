// Services export file

// Import configuration
import { API_CONFIG as CONFIG } from "./apiConfig";
import { USE_MOCK_SERVICES, USE_MOCK_ADMIN } from "./serviceConfig";

// Import real services
import realAuthService from "./authService";
import realAdminService from "./adminService";
import consultationService from "./consultationService";

// Import mock services
import mockAuthService from "./mockAuthService";

// Export services based on configuration
export const authService = USE_MOCK_SERVICES
  ? mockAuthService
  : realAuthService;

// Always use real admin service since it has built-in mock functionality for courses
// when SERVICE_CONFIG.useMockAdmin is true, and mockAdminService is not implemented
export const adminService = realAdminService;

// Export consultation service (always use real service)
export { consultationService };

export { API_CONFIG } from "./apiConfig";

// Named exports for convenience
export const services = {
  auth: () => Promise.resolve(authService),
  admin: () => Promise.resolve(adminService),
  consultation: () => Promise.resolve(consultationService),
};

// API endpoint constants for easy access
export const AUTH_ENDPOINTS = {
  LOGIN: CONFIG.ENDPOINTS.LOGIN,
  REGISTER: CONFIG.ENDPOINTS.REGISTER,
  REFRESH_TOKEN: CONFIG.ENDPOINTS.REFRESH_TOKEN,
  LOGOUT: CONFIG.ENDPOINTS.LOGOUT,
  FORGOT_PASSWORD: CONFIG.ENDPOINTS.FORGOT_PASSWORD,
  RESET_PASSWORD: CONFIG.ENDPOINTS.RESET_PASSWORD,
  CHANGE_PASSWORD: CONFIG.ENDPOINTS.CHANGE_PASSWORD,
  VERIFY_EMAIL: CONFIG.ENDPOINTS.VERIFY_EMAIL,
  RESEND_VERIFICATION: CONFIG.ENDPOINTS.RESEND_VERIFICATION,
  EMAIL_VERIFICATION_STATUS:
    CONFIG.ENDPOINTS.EMAIL_VERIFICATION_STATUS,
};

// Admin endpoint constants
export const ADMIN_ENDPOINTS = {
  USERS: CONFIG.ENDPOINTS.ADMIN_USERS,
  USER_BY_ID: CONFIG.ENDPOINTS.ADMIN_USER_BY_ID,
  DASHBOARD: CONFIG.ENDPOINTS.ADMIN_DASHBOARD,
  STATS: CONFIG.ENDPOINTS.ADMIN_STATS,
  POSTS: CONFIG.ENDPOINTS.ADMIN_POSTS,
  POSTS_PENDING: CONFIG.ENDPOINTS.ADMIN_POSTS_PENDING,
  POST_BY_ID: CONFIG.ENDPOINTS.ADMIN_POST_BY_ID,
  POST_APPROVE: CONFIG.ENDPOINTS.ADMIN_POST_APPROVE,
  POST_REJECT: CONFIG.ENDPOINTS.ADMIN_POST_REJECT,
};

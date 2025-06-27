// Services export file
import { API_CONFIG as CONFIG } from "./apiConfig";

export { default as authService } from "./authService";
export { API_CONFIG } from "./apiConfig";

// Named exports for convenience
export const services = {
  auth: () =>
    import("./authService").then((module) => module.default),
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

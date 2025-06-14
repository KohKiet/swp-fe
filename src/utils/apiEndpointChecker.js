import API_CONFIG from "../services/api.config";

/**
 * Utility to check and format API endpoints
 */
const ApiEndpointChecker = {
  /**
   * Get the full URL for a given endpoint
   * @param {string} endpoint - The API endpoint path
   * @returns {string} - The full URL
   */
  getFullUrl: (endpoint) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.substring(1)
      : endpoint;

    return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/${cleanEndpoint}`;
  },

  /**
   * Print the full URLs for all authentication endpoints
   */
  printAuthEndpoints: () => {
    const endpoints = {
      login: "/Auth/login",
      register: "/Auth/register",
      refreshToken: "/Auth/refresh-token",
      logout: "/Auth/logout",
      forgotPassword: "/Auth/forgot-password",
      resetPassword: "/Auth/reset-password",
    };

    console.log("Auth API Endpoints:");
    for (const [key, endpoint] of Object.entries(endpoints)) {
      console.log(
        `${key}: ${ApiEndpointChecker.getFullUrl(endpoint)}`
      );
    }
  },
};

export default ApiEndpointChecker;

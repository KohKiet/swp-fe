import { API_CONFIG } from "./apiConfig";

class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async login(email, password) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );
      console.log(email, password);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Store auth data in localStorage for persistence
      if (data.AccessToken) {
        localStorage.setItem("accessToken", data.AccessToken);
        localStorage.setItem("refreshToken", data.RefreshToken);
        localStorage.setItem("userEmail", data.Email);
        localStorage.setItem("userFullname", data.Fullname);
        localStorage.setItem("userRole", data.Role);
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Register user with email, password and name
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} fullname - User full name
   * @returns {Promise} - API response
   */
  async register(email, password, fullname) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.REGISTER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            fullname,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise} - API response
   */
  async logout() {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId"); // You might need to store this during login

      if (accessToken) {
        const response = await fetch(
          `${this.baseURL}${API_CONFIG.ENDPOINTS.LOGOUT}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(userId),
          }
        );

        if (!response.ok) {
          console.warn(
            "Logout API call failed, but continuing with local cleanup"
          );
        }
      }

      // Clear local storage regardless of API call success
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userFullname");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage even if API call fails
      localStorage.clear();
      return {
        success: true,
        message: "Logged out locally",
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  }

  /**
   * Get current user data
   * @returns {object} - User data
   */
  getCurrentUser() {
    return {
      email: localStorage.getItem("userEmail"),
      fullname: localStorage.getItem("userFullname"),
      role: localStorage.getItem("userRole"),
      accessToken: localStorage.getItem("accessToken"),
    };
  }

  /**
   * Test login with example credentials
   * @returns {Promise} - API response
   */
  async testLogin() {
    return this.login("user@example.com", "string");
  }
}

export default new AuthService();

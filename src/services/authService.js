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
        localStorage.setItem("userId", data.UserId || data.Id);
        localStorage.setItem("userPhone", data.Phone || "");
        localStorage.setItem("userGender", data.Gender || "");
        localStorage.setItem(
          "userDateOfBirth",
          data.DateOfBirth || ""
        );
        localStorage.setItem("userAddress", data.Address || "");
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
   * Register user with full profile information
   * @param {object} userData - User registration data
   * @returns {Promise} - API response
   */
  async register(userData) {
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
            email: userData.email,
            password: userData.password,
            fullname: userData.fullname,
            phone: userData.phone,
            gender: userData.gender,
            dateOfBirth: userData.dateOfBirth,
            address: userData.address,
            role: userData.role || "User",
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
   * Refresh access token using refresh token
   * @returns {Promise} - API response
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(refreshToken),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Update tokens in localStorage
      if (data.AccessToken) {
        localStorage.setItem("accessToken", data.AccessToken);
        localStorage.setItem("refreshToken", data.RefreshToken);
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      // If refresh fails, clear all auth data
      this.clearAuthData();
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
      const userId = localStorage.getItem("userId");

      if (accessToken && userId) {
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
      this.clearAuthData();

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage even if API call fails
      this.clearAuthData();
      return {
        success: true,
        message: "Logged out locally",
      };
    }
  }

  /**
   * Clear all authentication data from localStorage
   */
  clearAuthData() {
    const authKeys = [
      "accessToken",
      "refreshToken",
      "userEmail",
      "userFullname",
      "userRole",
      "userId",
      "userPhone",
      "userGender",
      "userDateOfBirth",
      "userAddress",
    ];

    authKeys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem("accessToken");
    return !!token;
  }

  /**
   * Get current user data
   * @returns {object} - User data
   */
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      id: localStorage.getItem("userId"),
      email: localStorage.getItem("userEmail"),
      fullname: localStorage.getItem("userFullname"),
      role: localStorage.getItem("userRole"),
      phone: localStorage.getItem("userPhone"),
      gender: localStorage.getItem("userGender"),
      dateOfBirth: localStorage.getItem("userDateOfBirth"),
      address: localStorage.getItem("userAddress"),
      accessToken: localStorage.getItem("accessToken"),
    };
  }

  /**
   * Get access token
   * @returns {string|null} - Access token
   */
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  /**
   * Make authenticated API request with automatic token refresh
   * @param {string} url - API endpoint URL
   * @param {object} options - Fetch options
   * @returns {Promise} - Fetch response
   */
  async authenticatedRequest(url, options = {}) {
    const token = this.getAccessToken();

    if (!token) {
      throw new Error("No access token available");
    }

    const requestOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      // If unauthorized, try to refresh token and retry
      if (response.status === 401) {
        const refreshResult = await this.refreshToken();

        if (refreshResult.success) {
          // Retry with new token
          requestOptions.headers.Authorization = `Bearer ${this.getAccessToken()}`;
          return await fetch(url, requestOptions);
        } else {
          // Refresh failed, redirect to login
          throw new Error("Session expired. Please login again.");
        }
      }

      return response;
    } catch (error) {
      console.error("Authenticated request error:", error);
      throw error;
    }
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

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
        console.log(
          "AuthService - Login failed with status:",
          response.status
        );
        console.log("AuthService - Error response data:", data);

        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle nested response structure - API returns data wrapped in ApiResponseDto
      const userData = data.data || data;

      // Store auth data in localStorage for persistence
      if (userData.AccessToken || userData.accessToken) {
        // Use backend's exact field names with fallback for debugging
        const accessToken =
          userData.AccessToken || userData.accessToken;
        const refreshToken =
          userData.RefreshToken || userData.refreshToken;
        const email = userData.Email || userData.email;
        const fullname = userData.Fullname || userData.fullname;
        const role = userData.Role || userData.role;
        const userId =
          userData.UserId ||
          userData.userId ||
          `user_${email?.split("@")[0]}_${Date.now()}`;
        const phone = userData.Phone || userData.phone || "";
        const gender = userData.Gender || userData.gender || "";
        const dateOfBirth =
          userData.DateOfBirth || userData.dateOfBirth || "";
        const address = userData.Address || userData.address || "";

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userFullname", fullname);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userPhone", phone);
        localStorage.setItem("userGender", gender);
        localStorage.setItem("userDateOfBirth", dateOfBirth);
        localStorage.setItem("userAddress", address);

        console.log(
          "AuthService - User authenticated successfully:",
          {
            email: email,
            fullname: fullname,
            role: role,
          }
        );
      } else {
        console.error(
          "AuthService - No access token found in response"
        );
        throw new Error(
          "Invalid login response - missing access token"
        );
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
        console.log(
          "AuthService - Register failed with status:",
          response.status
        );
        console.log(
          "AuthService - Register error response data:",
          data
        );

        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log("AuthService - Registration successful");
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
          body: JSON.stringify({ RefreshToken: refreshToken }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle nested response structure - API returns data wrapped in ApiResponseDto
      const tokenData = data.data || data;

      // Update tokens in localStorage using backend's exact field names
      if (tokenData.AccessToken) {
        const newAccessToken = tokenData.AccessToken;
        const newRefreshToken =
          tokenData.RefreshToken || refreshToken;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
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
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise} - API response
   */
  async forgotPassword(email) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
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
      console.error("Forgot password error:", error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm password
   * @returns {Promise} - API response
   */
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword,
            confirmPassword,
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
      console.error("Reset password error:", error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Change password when logged in
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise} - API response
   */
  async changePassword(
    currentPassword,
    newPassword,
    confirmPassword
  ) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.CHANGE_PASSWORD}`,
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
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
      console.error("Change password error:", error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Verify email address
   * @param {string} token - Verification token
   * @returns {Promise} - API response
   */
  async verifyEmail(token) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.VERIFY_EMAIL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ token }),
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
      console.error("Email verification error:", error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise} - API response
   */
  async resendVerification(email) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.RESEND_VERIFICATION}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
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
      console.error("Resend verification error:", error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Check email verification status
   * @param {string} email - User email (optional, uses current user if authenticated)
   * @returns {Promise} - API response
   */
  async getEmailVerificationStatus(email = null) {
    try {
      const endpoint = `${this.baseURL}${API_CONFIG.ENDPOINTS.EMAIL_VERIFICATION_STATUS}`;
      const queryParams = email
        ? `?email=${encodeURIComponent(email)}`
        : "";

      const response = await fetch(`${endpoint}${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(this.isAuthenticated() && {
            Authorization: `Bearer ${this.getAccessToken()}`,
          }),
        },
      });

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
      console.error("Email verification status error:", error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
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
      "userProfilePicture",
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
      profilePicture: localStorage.getItem("userProfilePicture"),
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
}

export default new AuthService();

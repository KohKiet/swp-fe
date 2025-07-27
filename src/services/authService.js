import { API_CONFIG } from "./apiConfig";

class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.profilePromise = null; // Cache the current profile promise
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
        const profilePicture =
          userData.ProfilePicture ||
          userData.profilePicture ||
          userData.avatar ||
          userData.Profile_Picture ||
          "";
        const specialization =
          userData.Specialization || userData.specialization || "";
        const degree = userData.Degree || userData.degree || "";

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

        // Save profile picture if available from login response
        if (profilePicture) {
          localStorage.setItem("userProfilePicture", profilePicture);
        }

        // Save specialization and degree if available from login response
        if (specialization) {
          localStorage.setItem("userSpecialization", specialization);
        }
        if (degree) {
          localStorage.setItem("userDegree", degree);
        }

        console.log(
          "AuthService - User authenticated successfully:",
          {
            email: email,
            fullname: fullname,
            role: role,
            profilePicture: profilePicture,
            specialization: specialization,
            degree: degree,
          }
        );

        // Debug: Log all user data fields to see available profile picture fields
        if (process.env.NODE_ENV === "development") {
          console.log(
            "AuthService - Full userData from login:",
            userData
          );
        }

        // Fetch additional profile data including profile picture
        try {
          await this.fetchUserProfile();
        } catch (profileError) {
          console.warn("Could not fetch profile data:", profileError);
          // Don't fail login if profile fetch fails
        }
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
      "userSpecialization",
      "userDegree",
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
      specialization: localStorage.getItem("userSpecialization"),
      degree: localStorage.getItem("userDegree"),
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
   * Fetch user profile data from API
   * @returns {Promise} - API response with profile data
   */
  async fetchUserProfile() {
    // If already fetching, return the cached promise
    if (this.profilePromise) {
      return this.profilePromise;
    }

    // Cache the entire execution
    this.profilePromise = (async () => {
      try {
        const response = await this.authenticatedRequest(
          `${this.baseURL}/api/User/me`,
          { method: "GET" }
        );

        // Parse response if it's not already parsed
        let responseData;
        if (response.ok) {
          responseData = await response.json();
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle the API response structure: { success: true, data: { ... } }
        if (responseData.success && responseData.data) {
          const profileData = responseData.data;

          // Update localStorage with profile picture if available
          if (profileData.profilePicture) {
            localStorage.setItem(
              "userProfilePicture",
              profileData.profilePicture
            );
          }

          // Update other profile fields if they exist
          if (profileData.fullname) {
            localStorage.setItem(
              "userFullname",
              profileData.fullname
            );
          }
          if (profileData.phone) {
            localStorage.setItem("userPhone", profileData.phone);
          }
          if (profileData.gender) {
            localStorage.setItem("userGender", profileData.gender);
          }
          if (profileData.dateOfBirth) {
            localStorage.setItem(
              "userDateOfBirth",
              profileData.dateOfBirth
            );
          }
          if (profileData.address) {
            localStorage.setItem("userAddress", profileData.address);
          }
          if (profileData.specialization) {
            localStorage.setItem(
              "userSpecialization",
              profileData.specialization
            );
          }
          if (profileData.degree) {
            localStorage.setItem("userDegree", profileData.degree);
          }
          if (profileData.userId) {
            localStorage.setItem("userId", profileData.userId);
          }
          if (profileData.email) {
            localStorage.setItem("userEmail", profileData.email);
          }

          return { success: true, data: profileData };
        }

        return { success: false, error: "No profile data received" };
      } catch (error) {
        return { success: false, error: error.message };
      } finally {
        // Clear the promise after completion (success or failure)
        this.profilePromise = null;
      }
    })();

    return this.profilePromise;
  }

  /**
   * Update user profile
   * @param {object} profileData - Profile data to update
   * @returns {Promise} - API response
   */
  async updateProfile(profileData) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/User/profile`,
        {
          method: "PUT",
          body: JSON.stringify({
            fullname: profileData.fullname,
            phone: profileData.phone,
            gender: profileData.gender,
            dateOfBirth: profileData.dateOfBirth,
            address: profileData.address,
            specialization: profileData.specialization,
            degree: profileData.degree,
            profilePicture: profileData.profilePicture,
          }),
        }
      );

      // Parse response if it's not already parsed
      let responseData;
      if (response.ok) {
        responseData = await response.json();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle the API response structure: { success: true, data: { ... } }
      if (responseData.success && responseData.data) {
        const updatedProfileData = responseData.data;

        // Debug: Log updated profile data
        if (process.env.NODE_ENV === "development") {
          console.log(
            "AuthService - Profile updated successfully:",
            updatedProfileData
          );
        }

        // Update localStorage with all the updated profile data
        if (updatedProfileData.fullname) {
          localStorage.setItem(
            "userFullname",
            updatedProfileData.fullname
          );
        }
        if (updatedProfileData.phone) {
          localStorage.setItem("userPhone", updatedProfileData.phone);
        }
        if (updatedProfileData.gender) {
          localStorage.setItem(
            "userGender",
            updatedProfileData.gender
          );
        }
        if (updatedProfileData.dateOfBirth) {
          localStorage.setItem(
            "userDateOfBirth",
            updatedProfileData.dateOfBirth
          );
        }
        if (updatedProfileData.address) {
          localStorage.setItem(
            "userAddress",
            updatedProfileData.address
          );
        }
        if (updatedProfileData.profilePicture) {
          localStorage.setItem(
            "userProfilePicture",
            updatedProfileData.profilePicture
          );
        }
        if (updatedProfileData.specialization) {
          localStorage.setItem(
            "userSpecialization",
            updatedProfileData.specialization
          );
        }
        if (updatedProfileData.degree) {
          localStorage.setItem(
            "userDegree",
            updatedProfileData.degree
          );
        }
        if (updatedProfileData.userId) {
          localStorage.setItem("userId", updatedProfileData.userId);
        }
        if (updatedProfileData.email) {
          localStorage.setItem("userEmail", updatedProfileData.email);
        }

        return { success: true, data: updatedProfileData };
      }

      return {
        success: false,
        error: responseData.message || "Failed to update profile",
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Helper function to get access token (alias for getAccessToken)
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem("accessToken");
}

export default new AuthService();

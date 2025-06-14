import { useState, useCallback } from "react";
import { AuthService } from "../services/api";

/**
 * Custom hook for authentication operations
 * @returns {Object} Auth state and methods
 */
const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage if available
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Error loading user from localStorage:", e);
      return null;
    }
  });

  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise} - Authentication result
   */
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(credentials);

      // Check if response data contains token and user
      if (!response || !response.data || !response.data.token) {
        throw new Error("Invalid response format: missing token");
      }

      const { token, user } = response.data;

      // Save token and user data
      try {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }

      setUser(user);
      setIsLoading(false);
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      setIsLoading(false);

      // Rethrow the error so it can be caught by the caller
      throw err;
    }
  }, []);

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration result
   */
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.register(userData);
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  /**
   * Logout user
   * @returns {Promise} - Logout result
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Attempt to call logout API
      await AuthService.logout();
    } catch (err) {
      console.error("Logout API error:", err);
      // Continue with local logout even if API fails
    }

    // Clear local storage and state
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    } catch (e) {
      console.error("Error clearing localStorage:", e);
    }

    setUser(null);
    setIsLoading(false);

    return { success: true };
  }, []);

  /**
   * Request password reset
   * @param {Object} data - Contains email
   * @returns {Promise} - Request result
   */
  const forgotPassword = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.forgotPassword(data);
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage =
        err.message || "Failed to request password reset";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  /**
   * Reset password
   * @param {Object} data - Contains token and new password
   * @returns {Promise} - Reset result
   */
  const resetPassword = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.resetPassword(data);
      setIsLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.message || "Failed to reset password";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
};

export default useAuth;

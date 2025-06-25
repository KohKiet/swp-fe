import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { authService } from "../services";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Only use real auth service
      const response = await authService.login(email, password);

      if (response.success) {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, data: user };
      } else {
        setError(response.error || "Authentication failed");
        setIsLoading(false);
        return {
          success: false,
          error: response.error || "Authentication failed",
        };
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
      return {
        success: false,
        error: err.message || "An unexpected error occurred",
      };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Đã có lỗi xảy ra khi đăng ký",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout API fails, clear local state
      setCurrentUser(null);
      setIsAuthenticated(false);
      return { success: true };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);
      if (result.success) {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: "Đã có lỗi xảy ra khi cập nhật hồ sơ",
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const result = await authService.changePassword(
        currentPassword,
        newPassword
      );
      return result;
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        error: "Đã có lỗi xảy ra khi đổi mật khẩu",
      };
    }
  };

  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken();
      return result;
    } catch (error) {
      console.error("Refresh token error:", error);
      return {
        success: false,
        error: "Đã có lỗi xảy ra khi làm mới token",
      };
    }
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === "admin";
  };

  const isConsultant = () => {
    return (
      currentUser &&
      (currentUser.role === "consultant" ||
        currentUser.role === "Consultant")
    );
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    isAuthenticated,
    isAdmin,
    isConsultant,
    getAccessToken: () => authService.getAccessToken(),
    error,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

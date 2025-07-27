import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
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
  const refreshingRef = useRef(false);
  const startupFetchRef = useRef(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);

      // Fetch fresh profile data including profile picture (only once during startup)
      if (!startupFetchRef.current) {
        startupFetchRef.current = true;
        (async () => {
          try {
            const profileResult =
              await authService.fetchUserProfile();
            if (profileResult.success) {
              // Update current user with fresh data from localStorage
              const updatedUser = authService.getCurrentUser();
              setCurrentUser(updatedUser);
            }
          } catch (error) {
            console.error(
              "Error fetching profile on startup:",
              error
            );
          }
        })();
      }
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
        // Get the updated user data from localStorage and update context
        const updatedUser = authService.getCurrentUser();
        setCurrentUser(updatedUser);
        return { success: true, data: result.data };
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

  const refreshUserData = async () => {
    if (!isAuthenticated || refreshingRef.current) return;

    // Check if we already have essential data (avoid unnecessary API calls)
    const currentUserData = authService.getCurrentUser();
    if (
      currentUserData &&
      currentUserData.fullname &&
      currentUserData.phone
    ) {
      // For consultants, check if we have specialization and degree
      const isConsultantRole =
        currentUserData.role === "consultant" ||
        currentUserData.roleName === "consultant";
      if (
        isConsultantRole &&
        (!currentUserData.specialization || !currentUserData.degree)
      ) {
        // Need to fetch consultant-specific data
      } else if (!isConsultantRole) {
        // Regular user has basic data, no need to refresh
        return;
      }
    }

    refreshingRef.current = true;

    try {
      const profileResult = await authService.fetchUserProfile();
      if (profileResult.success) {
        // Update current user with fresh data from localStorage
        const updatedUser = authService.getCurrentUser();
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      refreshingRef.current = false;
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
    setCurrentUser,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    refreshUserData, // Add the new method
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

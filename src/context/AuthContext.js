import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from authService
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);

      if (result.success) {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Đã có lỗi xảy ra khi đăng nhập",
      };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);

      if (result.success) {
        // Automatically log in the user after successful registration
        const loginResult = await authService.login(
          userData.email,
          userData.password
        );

        if (loginResult.success) {
          const user = authService.getCurrentUser();
          setCurrentUser(user);
          return {
            success: true,
            message: "Đăng ký và đăng nhập thành công!",
            autoLoggedIn: true,
          };
        } else {
          // Registration succeeded but auto-login failed
          return {
            success: true,
            message: "Đăng ký thành công! Vui lòng đăng nhập.",
            autoLoggedIn: false,
          };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: "Đã có lỗi xảy ra khi đăng ký",
      };
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      // For now, just update local state since we don't have update profile API endpoint
      // In a real app, you would call an API here
      const updatedUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedUser);

      // Update localStorage to persist changes
      Object.keys(updatedData).forEach((key) => {
        if (key === "fullname") {
          localStorage.setItem("userFullname", updatedData[key]);
        } else if (key === "phone") {
          localStorage.setItem("userPhone", updatedData[key]);
        } else if (key === "gender") {
          localStorage.setItem("userGender", updatedData[key]);
        } else if (key === "address") {
          localStorage.setItem("userAddress", updatedData[key]);
        } else if (key === "dateOfBirth") {
          localStorage.setItem("userDateOfBirth", updatedData[key]);
        } else if (key === "profilePicture") {
          localStorage.setItem(
            "userProfilePicture",
            updatedData[key]
          );
        }
      });

      return { success: true, message: "Cập nhật thành công" };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, message: "Không thể cập nhật" };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      // For now, just return success since we don't have change password API endpoint
      // In a real app, you would call an API here to change password
      return { success: true, message: "Đổi mật khẩu thành công" };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, message: "Không thể đổi mật khẩu" };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout API fails, clear local state
      setCurrentUser(null);
      return { success: true };
    }
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === "Admin";
  };

  const refreshToken = async () => {
    try {
      const result = await authService.refreshToken();

      if (result.success) {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        return { success: true };
      } else {
        // Refresh failed, logout user
        await logout();
        return { success: false, error: "Session expired" };
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      await logout();
      return { success: false, error: "Session expired" };
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    login,
    register,
    logout,
    isAdmin,
    loading,
    updateProfile,
    changePassword,
    refreshToken,
    isAuthenticated: () => authService.isAuthenticated(),
    getAccessToken: () => authService.getAccessToken(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

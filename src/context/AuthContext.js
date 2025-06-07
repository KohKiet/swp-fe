import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize users storage
  const initializeUsers = () => {
    const existingUsers = JSON.parse(
      localStorage.getItem("users") || "[]"
    );

    // Add default users if they don't exist
    const defaultUsers = [
      {
        id: 1,
        email: "admin@gmail.com",
        password: "admin123",
        name: "Admin",
        role: "Admin",
        group: "Admin",
        profilePicture: null,
        joinDate: "2024-01-01",
        gender: "",
        phone: "",
        address: "",
      },
      {
        id: 2,
        email: "test@gmail.com",
        password: "test123",
        name: "Koh",
        role: "User",
        group: "Nhóm trẻ vị thành niên",
        profilePicture: null,
        joinDate: new Date().toISOString().split("T")[0],
        gender: "",
        phone: "",
        address: "",
      },
    ];

    // Check if users already exist, if not add them
    defaultUsers.forEach((defaultUser) => {
      if (
        !existingUsers.find(
          (user) => user.email === defaultUser.email
        )
      ) {
        existingUsers.push(defaultUser);
      }
    });

    localStorage.setItem("users", JSON.stringify(existingUsers));
    return existingUsers;
  };

  useEffect(() => {
    // Initialize users first
    initializeUsers();

    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      localStorage.setItem(
        "currentUser",
        JSON.stringify(userWithoutPassword)
      );
      setCurrentUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if user already exists
    if (users.find((u) => u.email === userData.email)) {
      return { success: false, message: "Email đã được sử dụng" };
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      role: "User",
      group: "Nhóm trẻ vị thành niên",
      profilePicture: null,
      joinDate: new Date().toISOString().split("T")[0],
      gender: "",
      phone: "",
      address: "",
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return { success: true, message: "Đăng ký thành công" };
  };

  const updateProfile = (updatedData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u) => u.id === currentUser.id);

    if (userIndex !== -1) {
      // Don't update password here, handle separately
      const { password, ...updateFields } = updatedData;
      users[userIndex] = { ...users[userIndex], ...updateFields };

      localStorage.setItem("users", JSON.stringify(users));

      const updatedUser = { ...users[userIndex] };
      delete updatedUser.password;
      setCurrentUser(updatedUser);
      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );

      return { success: true, message: "Cập nhật thành công" };
    }
    return { success: false, message: "Không thể cập nhật" };
  };

  const changePassword = (oldPassword, newPassword) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u) => u.id === currentUser.id);

    if (
      userIndex !== -1 &&
      users[userIndex].password === oldPassword
    ) {
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
      return { success: true, message: "Đổi mật khẩu thành công" };
    }
    return { success: false, message: "Mật khẩu cũ không đúng" };
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === "Admin";
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAdmin,
    loading,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

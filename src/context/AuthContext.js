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

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // For demo purposes, hardcoded admin credentials
    if (email === "admin@gmail.com" && password === "admin123") {
      const adminUser = { email, role: "Admin", name: "Admin" };
      localStorage.setItem("currentUser", JSON.stringify(adminUser));
      setCurrentUser(adminUser);
      return true;
    }
    return false;
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
    logout,
    isAdmin,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

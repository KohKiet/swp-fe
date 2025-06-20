// Mock Auth Service for development
// Use this when the backend is not available

// Mock users for authentication
const mockUsers = [
  {
    email: "admin@example.com",
    password: "admin123",
    fullname: "Admin User",
    role: "admin",
    userId: "1",
    phone: "+84123456789",
    gender: "Male",
    dateOfBirth: "1990-01-01",
    address: "123 Admin St",
  },
  {
    email: "staff@example.com",
    password: "staff123",
    fullname: "Staff User",
    role: "staff",
    userId: "2",
    phone: "+84123456788",
    gender: "Female",
    dateOfBirth: "1992-02-02",
    address: "456 Staff Ave",
  },
  {
    email: "user@example.com",
    password: "user123",
    fullname: "Regular User",
    role: "user",
    userId: "3",
    phone: "+84123456787",
    gender: "Male",
    dateOfBirth: "1995-05-05",
    address: "789 User Blvd",
  },
];

class MockAuthService {
  constructor() {
    this.baseURL = "http://localhost:5150";
    console.log("Using mock auth service");
  }

  async login(email, password) {
    console.log("Mock login attempt:", email);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Generate mock tokens
      const accessToken = `mock_access_token_${Date.now()}`;
      const refreshToken = `mock_refresh_token_${Date.now()}`;

      // Store auth data in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userFullname", user.fullname);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("userPhone", user.phone || "");
      localStorage.setItem("userGender", user.gender || "");
      localStorage.setItem("userDateOfBirth", user.dateOfBirth || "");
      localStorage.setItem("userAddress", user.address || "");

      console.log("Mock login successful:", user.email, user.role);

      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          email: user.email,
          fullname: user.fullname,
          role: user.role,
        },
        status: 200,
      };
    } else {
      console.log("Mock login failed: Invalid credentials");
      return {
        success: false,
        error: "Invalid email or password",
        status: 401,
      };
    }
  }

  async register(userData) {
    console.log("Mock register attempt:", userData.email);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if user already exists
    if (mockUsers.some((u) => u.email === userData.email)) {
      return {
        success: false,
        error: "Email already registered",
        status: 400,
      };
    }

    // Create new user
    const newUser = {
      email: userData.email,
      password: userData.password,
      fullname: userData.fullname,
      role: userData.role || "user",
      userId: `${mockUsers.length + 1}`,
      phone: userData.phone || "",
      gender: userData.gender || "",
      dateOfBirth: userData.dateOfBirth || "",
      address: userData.address || "",
    };

    mockUsers.push(newUser);

    console.log("Mock register successful:", newUser.email);

    return {
      success: true,
      data: {
        email: newUser.email,
        fullname: newUser.fullname,
        role: newUser.role,
      },
      status: 201,
    };
  }

  async logout() {
    console.log("Mock logout");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Clear auth data
    this.clearAuthData();

    return {
      success: true,
      status: 200,
    };
  }

  async refreshToken() {
    console.log("Mock refresh token");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const refreshToken = localStorage.getItem("refreshToken");

    if (
      !refreshToken ||
      !refreshToken.startsWith("mock_refresh_token_")
    ) {
      return {
        success: false,
        error: "Invalid refresh token",
        status: 401,
      };
    }

    // Generate new mock tokens
    const accessToken = `mock_access_token_${Date.now()}`;
    const newRefreshToken = `mock_refresh_token_${Date.now()}`;

    // Update tokens in localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return {
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
      status: 200,
    };
  }

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

  isAuthenticated() {
    const token = localStorage.getItem("accessToken");
    return !!token;
  }

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

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }
}

const mockAuthService = new MockAuthService();
export default mockAuthService;

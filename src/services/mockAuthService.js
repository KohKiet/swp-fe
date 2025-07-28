// Mock Auth Service for development
// DISABLED - Use real backend authentication

// No mock users - use real backend
const mockUsers = [];

class MockAuthService {
  constructor() {
    this.baseURL = "http://localhost:5150";
    console.log("BE ok!");
  }

  async login(email, password) {
    console.log(
      "Mock auth is disabled - redirecting to real auth service"
    );
    throw new Error(
      "Mock authentication is disabled. Please use real backend authentication."
    );
  }

  async register(userData) {
    console.log(
      "Mock auth is disabled - redirecting to real auth service"
    );
    throw new Error(
      "Mock authentication is disabled. Please use real backend authentication."
    );
  }

  async logout() {
    console.log("Mock logout disabled");
    throw new Error(
      "Mock authentication is disabled. Please use real backend authentication."
    );
  }

  async refreshToken() {
    console.log("Mock refresh token disabled");
    throw new Error(
      "Mock authentication is disabled. Please use real backend authentication."
    );
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
    return false; // Always return false since mock is disabled
  }

  getCurrentUser() {
    return null; // Always return null since mock is disabled
  }

  getAccessToken() {
    return null; // Always return null since mock is disabled
  }

  async fetchUserProfile() {
    console.log("Mock fetchUserProfile disabled");
    return {
      success: false,
      error:
        "Mock authentication is disabled. Please use real backend authentication.",
    };
  }
}

const mockAuthService = new MockAuthService();
export default mockAuthService;

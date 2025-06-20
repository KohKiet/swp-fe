// Mock Admin Service for development
// Use this when the backend is not available
import { API_BASE_URL } from "./serviceConfig";

// Mock user data
const mockUsers = [
  {
    userId: "1",
    email: "admin@example.com",
    fullname: "Admin User",
    phone: "+84123456789",
    gender: "Male",
    dateOfBirth: "1990-01-01",
    address: "123 Admin St",
    profilePicture: null,
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    lastLoginAt: "2023-06-01T00:00:00Z",
    roleName: "admin",
    roleDescription: "System Administrator",
  },
  {
    userId: "2",
    email: "staff@example.com",
    fullname: "Staff User",
    phone: "+84123456788",
    gender: "Female",
    dateOfBirth: "1992-02-02",
    address: "456 Staff Ave",
    profilePicture: null,
    isActive: true,
    createdAt: "2023-01-15T00:00:00Z",
    lastLoginAt: "2023-06-02T00:00:00Z",
    roleName: "staff",
    roleDescription: "Staff Member",
  },
  {
    userId: "3",
    email: "user@example.com",
    fullname: "Regular User",
    phone: "+84123456787",
    gender: "Male",
    dateOfBirth: "1995-05-05",
    address: "789 User Blvd",
    profilePicture: null,
    isActive: true,
    createdAt: "2023-02-01T00:00:00Z",
    lastLoginAt: "2023-06-03T00:00:00Z",
    roleName: "user",
    roleDescription: "Regular User",
  },
  {
    userId: "4",
    email: "consultant@example.com",
    fullname: "Consultant User",
    phone: "+84123456786",
    gender: "Female",
    dateOfBirth: "1988-08-08",
    address: "101 Consultant Rd",
    profilePicture: null,
    isActive: true,
    createdAt: "2023-02-15T00:00:00Z",
    lastLoginAt: "2023-06-04T00:00:00Z",
    roleName: "consultant",
    roleDescription: "Health Consultant",
  },
  {
    userId: "5",
    email: "manager@example.com",
    fullname: "Manager User",
    phone: "+84123456785",
    gender: "Male",
    dateOfBirth: "1985-10-10",
    address: "202 Manager St",
    profilePicture: null,
    isActive: true,
    createdAt: "2023-03-01T00:00:00Z",
    lastLoginAt: "2023-06-05T00:00:00Z",
    roleName: "manager",
    roleDescription: "System Manager",
  },
];

// Mock stats data
const mockStats = {
  totalUsers: 120,
  totalCourses: 25,
  totalPosts: 450,
  activeUsers: 85,
  lastUpdated: new Date().toISOString(),
};

class MockAdminService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Now that we have real admin authentication, try to use real backend data
    this.useRealBackend = true;
    console.log(
      "Initializing hybrid admin service - Using real backend data when available"
    );
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("accessToken");

    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // Helper method to normalize user data from backend
  normalizeUserData(data) {
    console.log("Normalizing user data:", data);

    // If data is already an array, check if it needs normalization
    if (Array.isArray(data)) {
      return data.map((user) => this.normalizeSingleUser(user));
    }

    // Check if data is an object with a users property
    if (data && data.users && Array.isArray(data.users)) {
      return data.users.map((user) => this.normalizeSingleUser(user));
    }

    // Check if data is an object with a data property that contains users
    if (data && data.data) {
      if (Array.isArray(data.data)) {
        return data.data.map((user) =>
          this.normalizeSingleUser(user)
        );
      } else if (data.data.users && Array.isArray(data.data.users)) {
        return data.data.users.map((user) =>
          this.normalizeSingleUser(user)
        );
      }
    }

    // If data is an object but not in expected format, try to extract users
    if (data && typeof data === "object" && !Array.isArray(data)) {
      // Try to find arrays in the object that might contain users
      for (const key in data) {
        if (
          Array.isArray(data[key]) &&
          data[key].length > 0 &&
          typeof data[key][0] === "object" &&
          (data[key][0].email || data[key][0].username)
        ) {
          return data[key].map((user) =>
            this.normalizeSingleUser(user)
          );
        }
      }

      // If no arrays found, try to convert object values to array if they look like user objects
      const possibleUsers = Object.values(data).filter(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          (item.email || item.username || item.fullname || item.name)
      );

      if (possibleUsers.length > 0) {
        return possibleUsers.map((user) =>
          this.normalizeSingleUser(user)
        );
      }
    }

    console.log("Could not normalize user data, using mock data");
    return mockUsers;
  }

  // Helper to normalize a single user object to match expected format
  normalizeSingleUser(user) {
    if (!user) return null;

    // Create a normalized user with default values
    const normalizedUser = {
      userId: user.userId || user.id || user._id || "",
      email: user.email || "",
      fullname: user.fullname || user.name || user.username || "",
      phone: user.phone || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth || user.dob || "",
      address: user.address || "",
      profilePicture: user.profilePicture || user.avatar || null,
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt:
        user.lastLoginAt ||
        user.lastLogin ||
        new Date().toISOString(),
      roleName: user.roleName || user.role || "user",
      roleDescription: user.roleDescription || "",
    };

    return normalizedUser;
  }

  // User Management
  async getUsers() {
    if (this.useRealBackend) {
      try {
        console.log("Fetching users from real backend");
        const response = await fetch(
          `${this.baseURL}/api/admin/users`,
          {
            method: "GET",
            headers: this.getAuthHeaders(),
          }
        );

        if (response.ok) {
          const rawData = await response.json();
          console.log(
            "Successfully fetched users from backend",
            rawData
          );

          // Normalize the data to match expected format
          const normalizedData = this.normalizeUserData(rawData);
          return {
            success: true,
            data: normalizedData,
            status: response.status,
          };
        } else {
          console.log(
            `Failed to fetch users from backend (${response.status}), using mock data`
          );
          return this.mockSuccessResponse(mockUsers);
        }
      } catch (error) {
        console.error("Error fetching users from backend:", error);
        return this.mockSuccessResponse(mockUsers);
      }
    }

    console.log("Using mock user data");
    return this.mockSuccessResponse(mockUsers);
  }

  async getUserById(userId) {
    if (this.useRealBackend) {
      try {
        console.log(`Fetching user ${userId} from real backend`);
        const response = await fetch(
          `${this.baseURL}/api/admin/users/${userId}`,
          {
            method: "GET",
            headers: this.getAuthHeaders(),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data: data,
            status: response.status,
          };
        } else {
          const user = mockUsers.find((u) => u.userId === userId);
          if (user) {
            return this.mockSuccessResponse(user);
          }
          return this.mockErrorResponse("User not found", 404);
        }
      } catch (error) {
        console.error(
          `Error fetching user ${userId} from backend:`,
          error
        );
        const user = mockUsers.find((u) => u.userId === userId);
        if (user) {
          return this.mockSuccessResponse(user);
        }
        return this.mockErrorResponse("User not found", 404);
      }
    }

    const user = mockUsers.find((u) => u.userId === userId);
    if (user) {
      return this.mockSuccessResponse(user);
    }
    return this.mockErrorResponse("User not found", 404);
  }

  async updateUser(userId, userData) {
    if (this.useRealBackend) {
      try {
        console.log(`Updating user ${userId} on real backend`);
        const response = await fetch(
          `${this.baseURL}/api/admin/users/${userId}`,
          {
            method: "PUT",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(userData),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data: data,
            status: response.status,
          };
        } else {
          console.log(
            "Failed to update user on backend, using mock update"
          );
          const index = mockUsers.findIndex(
            (u) => u.userId === userId
          );
          if (index !== -1) {
            mockUsers[index] = { ...mockUsers[index], ...userData };
            return this.mockSuccessResponse(mockUsers[index]);
          }
          return this.mockErrorResponse("User not found", 404);
        }
      } catch (error) {
        console.error(
          `Error updating user ${userId} on backend:`,
          error
        );
        const index = mockUsers.findIndex((u) => u.userId === userId);
        if (index !== -1) {
          mockUsers[index] = { ...mockUsers[index], ...userData };
          return this.mockSuccessResponse(mockUsers[index]);
        }
        return this.mockErrorResponse("User not found", 404);
      }
    }

    const index = mockUsers.findIndex((u) => u.userId === userId);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...userData };
      return this.mockSuccessResponse(mockUsers[index]);
    }
    return this.mockErrorResponse("User not found", 404);
  }

  async deleteUser(userId) {
    if (this.useRealBackend) {
      try {
        console.log(`Deleting user ${userId} on real backend`);
        const response = await fetch(
          `${this.baseURL}/api/admin/users/${userId}`,
          {
            method: "DELETE",
            headers: this.getAuthHeaders(),
          }
        );

        if (response.ok) {
          return {
            success: true,
            data: { message: "User deleted successfully" },
            status: response.status,
          };
        } else {
          console.log(
            "Failed to delete user on backend, using mock delete"
          );
          const index = mockUsers.findIndex(
            (u) => u.userId === userId
          );
          if (index !== -1) {
            mockUsers.splice(index, 1);
            return this.mockSuccessResponse({
              message: "User deleted successfully",
            });
          }
          return this.mockErrorResponse("User not found", 404);
        }
      } catch (error) {
        console.error(
          `Error deleting user ${userId} on backend:`,
          error
        );
        const index = mockUsers.findIndex((u) => u.userId === userId);
        if (index !== -1) {
          mockUsers.splice(index, 1);
          return this.mockSuccessResponse({
            message: "User deleted successfully",
          });
        }
        return this.mockErrorResponse("User not found", 404);
      }
    }

    const index = mockUsers.findIndex((u) => u.userId === userId);
    if (index !== -1) {
      mockUsers.splice(index, 1);
      return this.mockSuccessResponse({
        message: "User deleted successfully",
      });
    }
    return this.mockErrorResponse("User not found", 404);
  }

  // Dashboard & Statistics
  async getStats() {
    if (this.useRealBackend) {
      try {
        console.log("Fetching stats from real backend");
        const response = await fetch(
          `${this.baseURL}/api/admin/stats`,
          {
            method: "GET",
            headers: this.getAuthHeaders(),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data: data,
            status: response.status,
          };
        } else {
          console.log(
            "Failed to fetch stats from backend, using mock data"
          );
          return this.mockSuccessResponse(mockStats);
        }
      } catch (error) {
        console.error("Error fetching stats from backend:", error);
        return this.mockSuccessResponse(mockStats);
      }
    }

    return this.mockSuccessResponse(mockStats);
  }

  async getDashboardData() {
    if (this.useRealBackend) {
      try {
        console.log("Fetching dashboard data from real backend");
        const response = await fetch(
          `${this.baseURL}/api/admin/dashboard`,
          {
            method: "GET",
            headers: this.getAuthHeaders(),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            data: data,
            status: response.status,
          };
        } else {
          console.log(
            "Failed to fetch dashboard data from backend, using mock data"
          );
          return this.mockSuccessResponse({
            recentUsers: mockUsers.slice(0, 3),
            stats: mockStats,
            recentActivity: [
              {
                type: "login",
                user: "admin@example.com",
                timestamp: new Date().toISOString(),
              },
              {
                type: "post_created",
                user: "staff@example.com",
                timestamp: new Date(
                  Date.now() - 3600000
                ).toISOString(),
              },
              {
                type: "user_registered",
                user: "newuser@example.com",
                timestamp: new Date(
                  Date.now() - 7200000
                ).toISOString(),
              },
            ],
          });
        }
      } catch (error) {
        console.error(
          "Error fetching dashboard data from backend:",
          error
        );
        return this.mockSuccessResponse({
          recentUsers: mockUsers.slice(0, 3),
          stats: mockStats,
          recentActivity: [
            {
              type: "login",
              user: "admin@example.com",
              timestamp: new Date().toISOString(),
            },
            {
              type: "post_created",
              user: "staff@example.com",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              type: "user_registered",
              user: "newuser@example.com",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
          ],
        });
      }
    }

    return this.mockSuccessResponse({
      recentUsers: mockUsers.slice(0, 3),
      stats: mockStats,
      recentActivity: [
        {
          type: "login",
          user: "admin@example.com",
          timestamp: new Date().toISOString(),
        },
        {
          type: "post_created",
          user: "staff@example.com",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          type: "user_registered",
          user: "newuser@example.com",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    });
  }

  // Helper methods
  mockSuccessResponse(data) {
    return {
      success: true,
      data,
      status: 200,
    };
  }

  mockErrorResponse(message, status = 400) {
    return {
      success: false,
      error: message,
      status,
    };
  }
}

const mockAdminService = new MockAdminService();
export default mockAdminService;

// Mock Admin Service for development
// DISABLED - Use real backend only

// No mock user data - use real backend
const mockUsers = [];

// No mock stats data - use real backend
const mockStats = {};

class MockAdminService {
  constructor() {
    console.log(
      "Mock admin service DISABLED - using real backend only"
    );
  }

  // All methods disabled - use real backend
  async getUsers() {
    throw new Error(
      "Mock admin service is disabled. Please use real backend."
    );
  }

  async getUserById(userId) {
    throw new Error(
      "Mock admin service is disabled. Please use real backend."
    );
  }

  async updateUser(userId, userData) {
    throw new Error(
      "Mock admin service is disabled. Please use real backend."
    );
  }

  async deleteUser(userId) {
    throw new Error(
      "Mock admin service is disabled. Please use real backend."
    );
  }

  async getStats() {
    throw new Error(
      "Mock admin service is disabled. Please use real backend."
    );
  }

  async changeUserRole(userId, newRole) {
    throw new Error(
      "Mock admin service is disabled. Please use real backend."
    );
  }

  async banUser(userId, reason) {
    throw new Error(
      "Mock admin service is disabled. Please use real backend."
    );
  }

  async unbanUser(userId) {
    throw new Error(
      "Mock admin service is disabled. Please use real backend."
    );
  }

  // Helper methods disabled
  mockSuccessResponse(data) {
    return { success: true, data };
  }

  mockErrorResponse(message, status = 400) {
    return { success: false, error: message, status };
  }
}

const mockAdminService = new MockAdminService();
export default mockAdminService;

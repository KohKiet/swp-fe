import { API_CONFIG } from "./apiConfig";

class AdminService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  /**
   * Helper method for making authenticated API requests
   */
  async authenticatedRequest(endpoint, options = {}) {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return {
        success: true,
        data: data.data || data,
        status: response.status,
      };
    } catch (error) {
      console.error(`API request error (${endpoint}):`, error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  // User Management
  async getUsers(page = 1, pageSize = 10) {
    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.ADMIN_USERS}?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );
  }

  async getUserById(userId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_USER_BY_ID.replace("{id}", userId),
      {
        method: "GET",
      }
    );
  }

  async updateUser(userId, userData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_USER_BY_ID.replace("{id}", userId),
      {
        method: "PUT",
        body: JSON.stringify(userData),
      }
    );
  }

  async deleteUser(userId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_USER_BY_ID.replace("{id}", userId),
      {
        method: "DELETE",
      }
    );
  }

  // Dashboard & Statistics
  async getDashboardData() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD,
      {
        method: "GET",
      }
    );
  }

  async getStats() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_STATS,
      {
        method: "GET",
      }
    );
  }

  // Post Management
  async getPosts(page = 1, pageSize = 10) {
    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.ADMIN_POSTS}?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );
  }

  async getPendingPosts(page = 1, pageSize = 10) {
    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.ADMIN_POSTS_PENDING}?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );
  }

  async getPostById(postId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_POST_BY_ID.replace("{id}", postId),
      {
        method: "GET",
      }
    );
  }

  async approvePost(postId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_POST_APPROVE.replace("{id}", postId),
      {
        method: "PUT",
      }
    );
  }

  async rejectPost(postId, feedback) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_POST_REJECT.replace("{id}", postId),
      {
        method: "PUT",
        body: JSON.stringify({ feedback }),
      }
    );
  }

  async deletePost(postId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ADMIN_POST_BY_ID.replace("{id}", postId),
      {
        method: "DELETE",
      }
    );
  }

  // Role Management
  async getRoles() {
    return this.authenticatedRequest(API_CONFIG.ENDPOINTS.ROLE_ALL, {
      method: "GET",
    });
  }

  async getRoleById(roleId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ROLE_BY_ID.replace("{id}", roleId),
      {
        method: "GET",
      }
    );
  }

  async createRole(roleData) {
    return this.authenticatedRequest(API_CONFIG.ENDPOINTS.ROLE_ALL, {
      method: "POST",
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(roleId, roleData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ROLE_BY_ID.replace("{id}", roleId),
      {
        method: "PUT",
        body: JSON.stringify(roleData),
      }
    );
  }

  async deleteRole(roleId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ROLE_BY_ID.replace("{id}", roleId),
      {
        method: "DELETE",
      }
    );
  }

  async getUserRoles(userId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ROLE_USER.replace("{userId}", userId),
      {
        method: "GET",
      }
    );
  }

  async assignRole(userId, roleId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ROLE_ASSIGN,
      {
        method: "POST",
        body: JSON.stringify({ userId, roleId }),
      }
    );
  }

  // Course Management
  async getCourses(page = 1, pageSize = 10) {
    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.COURSE_ALL}?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );
  }

  async getCourseById(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace("{id}", courseId),
      {
        method: "GET",
      }
    );
  }

  async createCourse(courseData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_ALL,
      {
        method: "POST",
        body: JSON.stringify(courseData),
      }
    );
  }

  async updateCourse(courseId, courseData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace("{id}", courseId),
      {
        method: "PUT",
        body: JSON.stringify(courseData),
      }
    );
  }

  async deleteCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace("{id}", courseId),
      {
        method: "DELETE",
      }
    );
  }

  // Category Management
  async getCategories() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CATEGORY_ALL,
      {
        method: "GET",
      }
    );
  }

  async getCategoryById(categoryId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CATEGORY_BY_ID.replace("{id}", categoryId),
      {
        method: "GET",
      }
    );
  }

  async createCategory(categoryData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CATEGORY_ALL,
      {
        method: "POST",
        body: JSON.stringify(categoryData),
      }
    );
  }

  async updateCategory(categoryId, categoryData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CATEGORY_BY_ID.replace("{id}", categoryId),
      {
        method: "PUT",
        body: JSON.stringify(categoryData),
      }
    );
  }

  async deleteCategory(categoryId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CATEGORY_BY_ID.replace("{id}", categoryId),
      {
        method: "DELETE",
      }
    );
  }

  async getSubcategories(parentId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CATEGORY_PARENT.replace(
        "{parentId}",
        parentId
      ),
      {
        method: "GET",
      }
    );
  }

  // Substance Management
  async getSubstances(page = 1, pageSize = 10) {
    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.SUBSTANCE_ALL}?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );
  }

  async getSubstanceById(substanceId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.SUBSTANCE_BY_ID.replace(
        "{id}",
        substanceId
      ),
      {
        method: "GET",
      }
    );
  }

  async createSubstance(substanceData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.SUBSTANCE_ALL,
      {
        method: "POST",
        body: JSON.stringify(substanceData),
      }
    );
  }

  async updateSubstance(substanceId, substanceData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.SUBSTANCE_BY_ID.replace(
        "{id}",
        substanceId
      ),
      {
        method: "PUT",
        body: JSON.stringify(substanceData),
      }
    );
  }

  async deleteSubstance(substanceId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.SUBSTANCE_BY_ID.replace(
        "{id}",
        substanceId
      ),
      {
        method: "DELETE",
      }
    );
  }

  // Survey Management
  async getSurveys(page = 1, pageSize = 10) {
    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.SURVEY_ALL}?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      }
    );
  }

  async createSurvey(surveyData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.SURVEY_ALL,
      {
        method: "POST",
        body: JSON.stringify(surveyData),
      }
    );
  }

  async updateSurvey(surveyId, surveyData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.SURVEY_BY_ID.replace("{id}", surveyId),
      {
        method: "PUT",
        body: JSON.stringify(surveyData),
      }
    );
  }

  async deleteSurvey(surveyId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.SURVEY_BY_ID.replace("{id}", surveyId),
      {
        method: "DELETE",
      }
    );
  }

  // Analytics & Reporting
  async getAnalytics() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ANALYTICS_ALL,
      {
        method: "GET",
      }
    );
  }

  async getUserAnalytics() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ANALYTICS_USER,
      {
        method: "GET",
      }
    );
  }

  async getCourseAnalytics() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ANALYTICS_COURSES,
      {
        method: "GET",
      }
    );
  }

  async getSubstanceAnalytics() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ANALYTICS_SUBSTANCES,
      {
        method: "GET",
      }
    );
  }

  async getPostAnalytics() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ANALYTICS_POSTS,
      {
        method: "GET",
      }
    );
  }

  async getSurveyAnalytics() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ANALYTICS_SURVEYS,
      {
        method: "GET",
      }
    );
  }

  async getDashboardAnalytics() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ANALYTICS_DASHBOARD,
      {
        method: "GET",
      }
    );
  }

  async getTimeRangeAnalytics(startDate, endDate) {
    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.ANALYTICS_TIME_RANGE}?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
      }
    );
  }

  // User Search
  async searchUsers(searchParams) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.SEARCH_USERS,
      {
        method: "POST",
        body: JSON.stringify(searchParams),
      }
    );
  }

  // Badge Management
  async getBadges() {
    return this.authenticatedRequest(API_CONFIG.ENDPOINTS.BADGE_ALL, {
      method: "GET",
    });
  }

  async getBadgeById(badgeId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.BADGE_BY_ID.replace("{id}", badgeId),
      {
        method: "GET",
      }
    );
  }

  async createBadge(badgeData) {
    return this.authenticatedRequest(API_CONFIG.ENDPOINTS.BADGE_ALL, {
      method: "POST",
      body: JSON.stringify(badgeData),
    });
  }

  async updateBadge(badgeId, badgeData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.BADGE_BY_ID.replace("{id}", badgeId),
      {
        method: "PUT",
        body: JSON.stringify(badgeData),
      }
    );
  }

  async deleteBadge(badgeId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.BADGE_BY_ID.replace("{id}", badgeId),
      {
        method: "DELETE",
      }
    );
  }

  async awardBadge(userId, badgeId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.BADGE_AWARD,
      {
        method: "POST",
        body: JSON.stringify({ userId, badgeId }),
      }
    );
  }

  // System Health & Monitoring
  async getHealthChecks() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.HEALTH_ALL,
      {
        method: "GET",
      }
    );
  }

  async getDatabaseHealth() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.HEALTH_DATABASE,
      {
        method: "GET",
      }
    );
  }

  async getFirebaseHealth() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.HEALTH_FIREBASE,
      {
        method: "GET",
      }
    );
  }

  async getCloudinaryHealth() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.HEALTH_CLOUDINARY,
      {
        method: "GET",
      }
    );
  }
}

const adminService = new AdminService();
export default adminService;

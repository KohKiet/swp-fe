import { API_CONFIG } from "./apiConfig";
import { SERVICE_CONFIG } from "./serviceConfig";

class AdminService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  /**
   * Helper method for making authenticated API requests
   */
  async authenticatedRequest(endpoint, options = {}) {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("Authentication required");
    }

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      };

      // Only add Content-Type for non-FormData requests
      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      // Set up timeout if not already provided
      let controller = options.signal?.controller;
      let timeoutId;

      if (!options.signal) {
        controller = new AbortController();
        timeoutId = setTimeout(() => {
          console.warn(`Request timeout for ${endpoint}`);
          controller.abort();
        }, 8000); // 8 second default timeout
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller?.signal || options.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
          // Debug log for backend responses
          if (!response.ok) {
            console.log(
              `Backend response data for ${endpoint}:`,
              JSON.stringify(data, null, 2)
            );
          }
        } catch (jsonError) {
          console.warn("Failed to parse JSON response:", jsonError);
          data = null;
        }
      } else {
        // Try to get text response for debugging
        try {
          const textData = await response.text();
          console.warn(
            `Non-JSON response from ${endpoint}:`,
            textData.substring(0, 500)
          );
          data = { message: textData || `HTTP ${response.status}` };
        } catch (textError) {
          console.warn("Failed to get response text:", textError);
          data = {
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      }

      if (!response.ok) {
        // Extract detailed error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        if (data) {
          // Try different possible error message fields
          const backendError =
            data.message ||
            data.error ||
            data.detail ||
            data.title ||
            data.Message || // ASP.NET Core sometimes uses Pascal case
            data.Error ||
            (typeof data === "string" ? data : null);

          if (backendError) {
            errorMessage = backendError;
          } else if (data.errors) {
            // Handle validation errors (common in ASP.NET Core)
            if (Array.isArray(data.errors)) {
              errorMessage = data.errors.join(", ");
            } else if (typeof data.errors === "object") {
              errorMessage = Object.values(data.errors)
                .flat()
                .join(", ");
            } else {
              errorMessage = data.errors.toString();
            }
          } else {
            // If no specific error field, show status with any available data
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            if (typeof data === "object") {
              const dataStr = JSON.stringify(data).substring(0, 200);
              errorMessage += ` - ${dataStr}`;
            }
          }
        }

        // Log the full error for debugging
        console.error(`API Error (${endpoint}):`, {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: `${this.baseURL}${endpoint}`,
          extractedError: errorMessage,
        });

        throw new Error(errorMessage);
      }

      return {
        success: true,
        data: data?.data || data,
        status: response.status,
      };
    } catch (error) {
      console.error(
        `API request error (${endpoint}):`,
        error.message
      );

      // Handle different types of errors
      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Request timeout - please try again",
          status: 408,
        };
      }

      // Provide more detailed error information
      let errorMessage = error.message;

      // Handle network errors
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        errorMessage = `Unable to connect to backend server at ${this.baseURL}. Please ensure the backend is running on port 5150.`;
      }

      // Handle CORS errors
      if (error.message.includes("CORS")) {
        errorMessage = `CORS error: Backend server needs to allow requests from this domain.`;
      }

      // Handle timeout errors
      if (error.message.includes("timeout")) {
        errorMessage = `Request timeout: Backend server took too long to respond.`;
      }

      return {
        success: false,
        error: errorMessage,
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
    try {
      const response = await this.authenticatedRequest(
        `${API_CONFIG.ENDPOINTS.COURSE_ALL}?page=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
        }
      );

      if (response.success) {
        return response;
      }

      throw new Error(response.error);
    } catch (error) {
      console.error("Failed to load courses:", error);

      // For development purposes, provide mock data when API is not available
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("404")
      ) {
        console.warn(
          "API endpoint not available, returning mock data for development"
        );

        return {
          success: true,
          data: {
            data: [
              {
                courseId: "mock-course-1",
                title: "Introduction to Substance Awareness",
                description:
                  "A comprehensive introduction to understanding substance abuse and its impacts on individuals and communities.",
                courseType: "BasicAwareness",
                ageGroup: "Adults",
                isPublished: true,
                createdAt: "2024-01-15T10:00:00Z",
                imageUrl:
                  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format",
                chapters: [
                  {
                    chapterId: "ch1",
                    title: "Understanding Addiction",
                    lessons: [],
                  },
                  {
                    chapterId: "ch2",
                    title: "Risk Factors",
                    lessons: [],
                  },
                ],
              },
              {
                courseId: "mock-course-2",
                title: "Prevention Strategies for Youth",
                description:
                  "Evidence-based prevention strategies specifically designed for teenagers and young adults.",
                courseType: "Prevention",
                ageGroup: "Teenagers",
                isPublished: false,
                createdAt: "2024-01-10T14:30:00Z",
                imageUrl:
                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop&auto=format",
                chapters: [],
              },
              {
                courseId: "mock-course-3",
                title: "Family Support and Recovery",
                description:
                  "Supporting family members through the recovery process and building healthy relationships.",
                courseType: "FamilyEducation",
                ageGroup: "Adults",
                isPublished: true,
                createdAt: "2024-01-05T09:15:00Z",
                imageUrl:
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop&auto=format",
                chapters: [
                  {
                    chapterId: "ch1",
                    title: "Communication Skills",
                    lessons: [{}, {}],
                  },
                ],
              },
            ],
            pagination: {
              page: page,
              pageSize: pageSize,
              totalPages: 1,
              totalItems: 3,
            },
          },
          status: 200,
        };
      }

      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  async getCourseById(courseId) {
    // Check if we should use mock services immediately for mock course IDs
    if (SERVICE_CONFIG.useMockAdmin && courseId.includes("mock")) {
      console.warn(
        "Using mock course data for mock course ID:",
        courseId
      );

      return {
        success: true,
        data: {
          courseId: courseId,
          title: "Mock Course Title",
          description:
            "This is a mock course description for development purposes.",
          courseType: "BasicAwareness",
          ageGroup: "Adults",
          isPublished: false,
          createdAt: new Date().toISOString(),
          imageUrl:
            "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format",
          chapters: [
            {
              chapterId: "mock-chapter-1",
              title: "Sample Chapter",
              description: "This is a sample chapter for development",
              chapterOrder: 1,
              lessons: [],
            },
          ],
        },
        status: 200,
      };
    }

    try {
      const response = await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace(
          "{courseId}",
          courseId
        ),
        {
          method: "GET",
        }
      );

      if (response.success) {
        return response;
      }

      throw new Error(
        response.error || response.message || "Failed to load course"
      );
    } catch (error) {
      console.error("Failed to load course:", error);

      // Only provide mock data if mock admin services are enabled
      if (
        SERVICE_CONFIG.useMockAdmin &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("404"))
      ) {
        console.warn(
          "API endpoint not available, returning mock course data for development"
        );

        return {
          success: true,
          data: {
            courseId: courseId,
            title: courseId.includes("mock")
              ? "Mock Course Title"
              : "Sample Course",
            description:
              "This is a sample course description for development purposes.",
            courseType: "BasicAwareness",
            ageGroup: "Adults",
            isPublished: false,
            createdAt: new Date().toISOString(),
            imageUrl:
              "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format",
            chapters: [],
          },
          status: 200,
        };
      }

      // When not using mock services, throw the actual error
      throw error;
    }
  }

  async createCourse(courseData) {
    // Check if we should use mock services immediately
    if (SERVICE_CONFIG.useMockAdmin) {
      console.warn(
        "Using mock course creation (mock services enabled)"
      );

      // Generate a mock course ID for development
      const mockCourseId = `mock-course-${Date.now()}`;

      // Extract data from FormData or regular object
      let title, description, courseType, ageGroup;

      if (courseData instanceof FormData) {
        title = courseData.get("Title") || "New Course";
        description =
          courseData.get("Description") || "Course description";
        courseType = courseData.get("CourseType") || "BasicAwareness";
        ageGroup = courseData.get("AgeGroup") || "Adults";
      } else {
        title = courseData.Title || courseData.title || "New Course";
        description =
          courseData.Description ||
          courseData.description ||
          "Course description";
        courseType =
          courseData.CourseType ||
          courseData.courseType ||
          "BasicAwareness";
        ageGroup =
          courseData.AgeGroup || courseData.ageGroup || "Adults";
      }

      return {
        success: true,
        data: {
          courseId: mockCourseId,
          title: title,
          description: description,
          courseType: courseType,
          ageGroup: ageGroup,
          isPublished: false,
          createdAt: new Date().toISOString(),
          chapters: [],
          imageUrl:
            "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format",
        },
        status: 201,
      };
    }

    try {
      // Set a timeout for the API request to prevent long waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Try the main course creation endpoint
      const response = await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.COURSE_ALL,
        {
          method: "POST",
          body:
            courseData instanceof FormData
              ? courseData
              : JSON.stringify(courseData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.success) {
        return response;
      }

      // If response is not successful, throw error with the detailed backend error
      throw new Error(response.error || "Course creation failed");
    } catch (error) {
      console.error("Course creation failed:", error.message);

      // Only provide user-friendly error messages for connection issues
      // For backend errors (500, etc.), pass through the actual error message
      let userFriendlyError = error.message;

      if (
        error.message.includes("Unable to connect to backend server")
      ) {
        userFriendlyError = `Cannot connect to backend server at ${this.baseURL}. 

To fix this issue:
1. Make sure your backend server is running on port 5150
2. Verify the backend API endpoints are correctly implemented
3. Check that CORS is configured to allow requests from this frontend

Current backend URL: ${this.baseURL}`;
      } else if (error.message.includes("404")) {
        userFriendlyError = `Backend API endpoint not found. The /api/Course endpoint may not be implemented yet.

Please ensure your backend has:
1. Course creation endpoint: POST /api/Course
2. Proper request handling for FormData
3. Authentication middleware configured`;
      } else if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        userFriendlyError = `Authentication failed. Please log in again or check your credentials.`;
      } else if (
        error.message.includes("timeout") ||
        error.name === "AbortError"
      ) {
        userFriendlyError = `Request timeout. The backend took too long to respond. 

This could indicate:
1. Backend server is overloaded
2. Database query is taking too long
3. Network connectivity issues

Please try again or check the backend server status.`;
      }
      // For 500 errors and other backend errors, preserve the original error message

      // When not using mock admin, throw the actual error with helpful message
      throw new Error(userFriendlyError);
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      const response = await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace(
          "{courseId}",
          courseId
        ),
        {
          method: "PUT",
          body:
            courseData instanceof FormData
              ? courseData
              : JSON.stringify(courseData),
        }
      );

      if (response.success) {
        return response;
      }

      throw new Error(response.error);
    } catch (error) {
      console.error("Failed to update course:", error);

      // For development purposes, provide mock response
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("404")
      ) {
        console.warn(
          "API endpoint not available, returning mock update response for development"
        );

        return {
          success: true,
          data: {
            courseId: courseId,
            message: "Course updated successfully (mock)",
          },
          status: 200,
        };
      }

      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  async deleteCourse(courseId) {
    try {
      const response = await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace(
          "{courseId}",
          courseId
        ),
        {
          method: "DELETE",
        }
      );

      if (response.success) {
        return response;
      }

      throw new Error(response.error);
    } catch (error) {
      console.error("Failed to delete course:", error);

      // For development purposes, provide mock response
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("404")
      ) {
        console.warn(
          "API endpoint not available, returning mock delete response for development"
        );

        return {
          success: true,
          data: {
            message: "Course deleted successfully (mock)",
          },
          status: 200,
        };
      }

      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  // ==================== CHAPTER MANAGEMENT ====================

  // Get all chapters
  async getChapters() {
    try {
      const response = await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.CHAPTER_ALL
      );

      if (response.success) {
        return response;
      }

      throw new Error(response.error);
    } catch (error) {
      console.error("Failed to load chapters:", error);

      // For development purposes, provide mock data when API is not available
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("404")
      ) {
        console.warn(
          "API endpoint not available, returning mock chapters data for development"
        );

        return {
          success: true,
          data: [
            {
              chapterId: "mock-chapter-1",
              courseId: "mock-course-1",
              title: "Introduction to Substance Awareness",
              description: "Basic concepts and definitions",
              orderIndex: 1,
              lessons: [
                {
                  lessonId: "mock-lesson-1",
                  title: "What is Substance Abuse?",
                  content: "Understanding the basics...",
                  orderIndex: 1,
                  estimatedDuration: 15,
                },
              ],
              quizzes: [],
              media: [],
            },
          ],
          status: 200,
        };
      }

      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  // Get specific chapter
  async getChapterById(chapterId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CHAPTER_BY_ID.replace(
        "{chapterId}",
        chapterId
      )
    );
  }

  // Create chapter
  async createChapter(chapterData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CHAPTER_ALL,
      {
        method: "POST",
        body: JSON.stringify(chapterData),
      }
    );
  }

  // Update chapter
  async updateChapter(chapterId, chapterData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CHAPTER_BY_ID.replace(
        "{chapterId}",
        chapterId
      ),
      {
        method: "PUT",
        body: JSON.stringify(chapterData),
      }
    );
  }

  // Delete chapter
  async deleteChapter(chapterId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CHAPTER_BY_ID.replace(
        "{chapterId}",
        chapterId
      ),
      {
        method: "DELETE",
      }
    );
  }

  // ==================== LESSON MANAGEMENT ====================

  // Get all lessons
  async getLessons() {
    return this.authenticatedRequest(API_CONFIG.ENDPOINTS.LESSON_ALL);
  }

  // Get specific lesson
  async getLessonById(lessonId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.LESSON_BY_ID.replace(
        "{lessonId}",
        lessonId
      )
    );
  }

  // Create lesson
  async createLesson(lessonData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.LESSON_ALL,
      {
        method: "POST",
        body: JSON.stringify(lessonData),
      }
    );
  }

  // Update lesson
  async updateLesson(lessonId, lessonData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.LESSON_BY_ID.replace(
        "{lessonId}",
        lessonId
      ),
      {
        method: "PUT",
        body: JSON.stringify(lessonData),
      }
    );
  }

  // Delete lesson
  async deleteLesson(lessonId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.LESSON_BY_ID.replace(
        "{lessonId}",
        lessonId
      ),
      {
        method: "DELETE",
      }
    );
  }

  // ==================== ENROLLMENT MANAGEMENT ====================

  // Get all enrollments (Admin only)
  async getAllEnrollments() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_ALL
    );
  }

  // Get course enrollments
  async getCourseEnrollments(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Get enrollment count
  async getEnrollmentCount(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_COUNT.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Update enrollment status
  async updateEnrollmentStatus(enrollmentId, status) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_UPDATE_STATUS.replace(
        "{enrollmentId}",
        enrollmentId
      ),
      {
        method: "PUT",
        body: JSON.stringify({ Status: status }),
      }
    );
  }

  // Delete enrollment
  async deleteEnrollment(enrollmentId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_DELETE.replace(
        "{enrollmentId}",
        enrollmentId
      ),
      {
        method: "DELETE",
      }
    );
  }

  // ==================== PROGRESS MANAGEMENT ====================

  // Get all progress (Admin)
  async getAllProgress() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_ALL
    );
  }

  // Get specific progress
  async getProgressById(progressId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_BY_ID.replace(
        "{progressId}",
        progressId
      )
    );
  }

  // Create progress entry
  async createProgress(progressData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_ALL,
      {
        method: "POST",
        body: JSON.stringify(progressData),
      }
    );
  }

  // Update progress
  async updateProgress(progressId, progressData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_BY_ID.replace(
        "{progressId}",
        progressId
      ),
      {
        method: "PUT",
        body: JSON.stringify(progressData),
      }
    );
  }

  // ==================== QUIZ MANAGEMENT ====================

  // Get all quizzes
  async getQuizzes() {
    return this.authenticatedRequest(API_CONFIG.ENDPOINTS.QUIZ_ALL);
  }

  // Get specific quiz
  async getQuizById(quizId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_BY_ID.replace("{quizId}", quizId)
    );
  }

  // Create quiz
  async createQuiz(quizData) {
    return this.authenticatedRequest(API_CONFIG.ENDPOINTS.QUIZ_ALL, {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  }

  // Update quiz
  async updateQuiz(quizId, quizData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_BY_ID.replace("{quizId}", quizId),
      {
        method: "PUT",
        body: JSON.stringify(quizData),
      }
    );
  }

  // Delete quiz
  async deleteQuiz(quizId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_BY_ID.replace("{quizId}", quizId),
      {
        method: "DELETE",
      }
    );
  }

  // Get quizzes by lesson
  async getQuizzesByLesson(lessonId) {
    return this.authenticatedRequest(`/api/Quiz/lesson/${lessonId}`, {
      method: "GET",
    });
  }

  async createQuestion(questionData) {
    return this.authenticatedRequest("/api/Question", {
      method: "POST",
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(questionId) {
    return this.authenticatedRequest(`/api/Question/${questionId}`, {
      method: "DELETE",
    });
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

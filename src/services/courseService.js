import API_CONFIG from "./apiConfig";
import { mockCourseData, mockProgressData } from "./mockData";

class CourseService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Helper method for authenticated requests
  async authenticatedRequest(url, options = {}) {
    const token = localStorage.getItem("accessToken");

    console.log("🔧 authenticatedRequest - Token exists:", !!token);
    console.log("🔧 authenticatedRequest - URL:", url);
    console.log(
      "🔧 authenticatedRequest - Method:",
      options.method || "GET"
    );

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete defaultHeaders["Content-Type"];
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const responseText = await response.text();
      const parsedResponse = responseText
        ? JSON.parse(responseText)
        : {};

      // Handle backend's wrapped response format
      if (
        parsedResponse.success &&
        parsedResponse.data !== undefined
      ) {
        return {
          success: true,
          data: parsedResponse.data,
          message: parsedResponse.message,
        };
      }

      return parsedResponse;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Helper method for public requests (no auth required)
  async publicRequest(url, options = {}) {
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const responseText = await response.text();
      const parsedResponse = responseText
        ? JSON.parse(responseText)
        : {};

      // Handle backend's wrapped response format
      if (
        parsedResponse.success &&
        parsedResponse.data !== undefined
      ) {
        return {
          success: true,
          data: parsedResponse.data,
          message: parsedResponse.message,
        };
      }

      return parsedResponse;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // ==================== PUBLIC COURSE DISCOVERY ENDPOINTS ====================

  // Get all public courses with pagination and filters
  async getPublicCourses(title = "", pageNumber = 1, pageSize = 12) {
    const params = new URLSearchParams({
      ...(title && { title }),
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    return this.publicRequest(
      `${API_CONFIG.ENDPOINTS.PUBLIC_COURSES_LATEST}?${params}`
    );
  }

  // Get specific public course details
  async getPublicCourseById(courseId) {
    try {
      const response = await this.publicRequest(
        API_CONFIG.ENDPOINTS.PUBLIC_COURSE_BY_ID.replace(
          "{courseId}",
          courseId
        )
      );
      console.log("API response for course:", response);
      return response;
    } catch (error) {
      console.warn(
        "API failed for getPublicCourseById:",
        error.message
      );
      throw error; // Re-throw error instead of returning mock data
    }
  }

  // Search courses by age group
  async getPublicCoursesByAge(ageGroup) {
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.PUBLIC_COURSES_BY_AGE.replace(
        "{ageGroup}",
        ageGroup
      )
    );
  }

  // Search courses by course type
  async getPublicCoursesByType(courseType) {
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.PUBLIC_COURSES_BY_TYPE.replace(
        "{courseType}",
        courseType
      )
    );
  }

  // Search courses with title filter
  async searchPublicCourses(
    searchTerm,
    pageNumber = 1,
    pageSize = 12
  ) {
    const params = new URLSearchParams({
      title: searchTerm,
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    return this.publicRequest(
      `${API_CONFIG.ENDPOINTS.PUBLIC_COURSES_SEARCH}?${params}`
    );
  }

  // Get latest courses
  async getLatestCourses(pageNumber = 1, pageSize = 12) {
    try {
      // Try with count parameter first
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      return await this.publicRequest(
        `${API_CONFIG.ENDPOINTS.PUBLIC_COURSES_LATEST}?${params}`
      );
    } catch (error) {
      // If that fails, try without parameters
      try {
        return await this.publicRequest(
          API_CONFIG.ENDPOINTS.PUBLIC_COURSES_LATEST
        );
      } catch (fallbackError) {
        console.warn(
          "Latest courses endpoint not available, returning empty result"
        );
        return { success: true, data: [] };
      }
    }
  }

  // Get featured courses
  async getFeaturedCourses(count = 5) {
    try {
      // Try with count parameter first
      const params = new URLSearchParams({
        count: count.toString(),
      });

      return await this.publicRequest(
        `${API_CONFIG.ENDPOINTS.PUBLIC_COURSES_FEATURED}?${params}`
      );
    } catch (error) {
      // If that fails, try without parameters
      try {
        return await this.publicRequest(
          API_CONFIG.ENDPOINTS.PUBLIC_COURSES_FEATURED
        );
      } catch (fallbackError) {
        console.warn(
          "Featured courses endpoint not available, returning empty result"
        );
        return { success: true, data: [] };
      }
    }
  }

  // ==================== PROTECTED COURSE MANAGEMENT ENDPOINTS ====================

  // Get all courses (admin only)
  async getCourses(pageNumber = 1, pageSize = 10) {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.COURSE_ALL}?${params}`
    );
  }

  // Get specific course
  async getCourseById(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Create new course
  async createCourse(courseFormData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_ALL,
      {
        method: "POST",
        body: courseFormData, // FormData object
      }
    );
  }

  // Update course
  async updateCourse(courseId, courseFormData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace(
        "{courseId}",
        courseId
      ),
      {
        method: "PUT",
        body: courseFormData, // FormData object
      }
    );
  }

  // Delete course
  async deleteCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace(
        "{courseId}",
        courseId
      ),
      {
        method: "DELETE",
      }
    );
  }

  // Publish/unpublish course
  async publishCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_PUBLISH.replace(
        "{courseId}",
        courseId
      ),
      {
        method: "PUT",
      }
    );
  }

  async unpublishCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_UNPUBLISH.replace(
        "{courseId}",
        courseId
      ),
      {
        method: "PUT",
      }
    );
  }

  // ==================== CHAPTER MANAGEMENT ENDPOINTS ====================

  // Get all chapters
  async getChapters() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CHAPTER_ALL
    );
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

  // Get chapters by course
  async getChaptersByCourse(courseId) {
    try {
      const res = await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.CHAPTER_BY_COURSE.replace(
          "{courseId}",
          courseId
        )
      );

      if (res?.success && res.data) {
        return res.data;
      } else {
        console.warn("Chapters API failed, returning empty array");
        return [];
      }
    } catch (error) {
      console.warn("Error fetching chapters:", error.message);
      return [];
    }
  }

  // Create new chapter
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

  // ==================== LESSON MANAGEMENT ENDPOINTS ====================

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

  // Get lessons by chapter
  async getLessonsByChapter(chapterId) {
    try {
      const res = await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.LESSON_BY_CHAPTER.replace(
          "{chapterId}",
          chapterId
        )
      );

      if (res?.success && res.data) {
        return res.data;
      } else {
        console.warn("Lessons API failed, returning empty array");
        return [];
      }
    } catch (error) {
      console.warn("Error fetching lessons:", error.message);
      return [];
    }
  }

  // Create new lesson
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

  // ==================== QUIZ & ASSESSMENT ENDPOINTS ====================

  // Get all quizzes
  async getQuizzes() {
    return this.authenticatedRequest(API_CONFIG.ENDPOINTS.QUIZ_ALL);
  }

  // Get specific quiz with questions
  async getQuizById(quizId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_BY_ID.replace("{quizId}", quizId)
    );
  }

  // Get quizzes by lesson
  async getQuizzesByLesson(lessonId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_BY_LESSON.replace(
        "{lessonId}",
        lessonId
      )
    );
  }

  // Get quizzes by course
  async getQuizzesByCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Create new quiz
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

  // ==================== QUESTION MANAGEMENT ENDPOINTS ====================

  // Get questions by quiz
  async getQuestionsByQuiz(quizId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUESTION_BY_QUIZ.replace(
        "{quizId}",
        quizId
      )
    );
  }

  // Get specific question
  async getQuestionById(questionId) {
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.QUESTION_BY_ID.replace(
        "{questionId}",
        questionId
      )
    );
  }

  // Create new question
  async createQuestion(questionData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUESTION_ALL,
      {
        method: "POST",
        body: JSON.stringify(questionData),
      }
    );
  }

  // Update question
  async updateQuestion(questionId, questionData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUESTION_BY_ID.replace(
        "{questionId}",
        questionId
      ),
      {
        method: "PUT",
        body: JSON.stringify(questionData),
      }
    );
  }

  // Delete question
  async deleteQuestion(questionId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUESTION_BY_ID.replace(
        "{questionId}",
        questionId
      ),
      {
        method: "DELETE",
      }
    );
  }

  // ==================== QUIZ RESULTS ENDPOINTS ====================

  // Submit quiz answers
  async submitQuizAnswers({
    quizId,
    answers,
    timeSpent = 30,
    sessionId = null,
  }) {
    try {
      // Validate sessionId is required
      if (!sessionId) {
        throw new Error("Session ID is required for quiz submission");
      }

      const submittedAt = new Date().toISOString();
      const body = {
        quizId,
        sessionId: sessionId,
        userAnswers: answers.map((a) => ({
          questionId: a.questionId,
          answerId: a.selectedAnswerId || a.answerId,
          isSelected: true,
        })),
        timeSpentMinutes: timeSpent,
        notes: "Quiz submission",
        submittedAt,
      };

      const response = await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.QUIZ_RESULT_SUBMIT,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      // Handle session-related errors
      if (!response.success) {
        if (
          response.message?.includes("session") ||
          response.message?.includes("Session")
        ) {
          throw new Error(
            "Quiz session expired. Please start again."
          );
        }
        if (response.message?.includes("Invalid quiz session")) {
          throw new Error(
            "Invalid session. Please refresh and try again."
          );
        }
        if (response.message?.includes("Quiz not found")) {
          throw new Error("Quiz not available for this course.");
        }
      }

      return response;
    } catch (error) {
      console.error("Error submitting quiz:", error);

      // Enhanced error handling for session-related errors
      if (
        error.message.includes("session") ||
        error.message.includes("Session")
      ) {
        throw new Error("Quiz session expired. Please start again.");
      }
      if (error.message.includes("Invalid quiz session")) {
        throw new Error(
          "Invalid session. Please refresh and try again."
        );
      }
      if (error.message.includes("Quiz not found")) {
        throw new Error("Quiz not available for this course.");
      }

      throw error;
    }
  }

  // Get quiz results by quiz
  async getQuizResultsByQuiz(quizId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_RESULT_BY_QUIZ.replace(
        "{quizId}",
        quizId
      )
    );
  }

  // Get quiz results by user
  async getQuizResultsByUser(userId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_RESULT_BY_USER.replace(
        "{userId}",
        userId
      )
    );
  }

  // ==================== MEDIA ENDPOINTS ====================

  // Add YouTube video to lesson
  async addYouTubeVideo(lessonId, youtubeUrl) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.MEDIA_YOUTUBE_ADD.replace(
        "{lessonId}",
        lessonId
      ),
      {
        method: "POST",
        body: JSON.stringify({ youtubeUrl }),
      }
    );
  }

  // Upload video file
  async uploadVideo(lessonId, courseId, videoFile) {
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("courseId", courseId);

    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.MEDIA_UPLOAD_VIDEO.replace(
        "{lessonId}",
        lessonId
      ),
      {
        method: "POST",
        body: formData,
      }
    );
  }

  // Upload audio file
  async uploadAudio(lessonId, courseId, audioFile) {
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("courseId", courseId);

    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.MEDIA_UPLOAD_AUDIO.replace(
        "{lessonId}",
        lessonId
      ),
      {
        method: "POST",
        body: formData,
      }
    );
  }

  // Upload document file
  async uploadDocument(lessonId, courseId, documentFile) {
    const formData = new FormData();
    formData.append("file", documentFile);
    formData.append("courseId", courseId);

    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.MEDIA_UPLOAD_DOCUMENT.replace(
        "{lessonId}",
        lessonId
      ),
      {
        method: "POST",
        body: formData,
      }
    );
  }

  // Get lesson files
  async getLessonFiles(lessonId) {
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.MEDIA_LESSON_FILES.replace(
        "{lessonId}",
        lessonId
      )
    );
  }

  // ==================== COURSE ENROLLMENT ENDPOINTS ====================

  // Enroll in course
  async enrollInCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_ENROLL.replace(
        "{courseId}",
        courseId
      ),
      {
        method: "POST",
      }
    );
  }

  // Drop from course
  async dropFromCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_DROP.replace(
        "{courseId}",
        courseId
      ),
      {
        method: "DELETE",
      }
    );
  }

  // Complete course
  async completeCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_COMPLETE.replace(
        "{courseId}",
        courseId
      ),
      {
        method: "PUT",
      }
    );
  }

  // ==================== ADMIN ENROLLMENT ENDPOINTS ====================

  // Get all enrollments (admin)
  async getAllEnrollments() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_ALL
    );
  }

  // Get course enrollments (admin)
  async getCourseEnrollments(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Get enrollment count (admin)
  async getEnrollmentCount(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_COUNT.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Update enrollment status (admin)
  async updateEnrollmentStatus(enrollmentId, status) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_UPDATE_STATUS.replace(
        "{enrollmentId}",
        enrollmentId
      ),
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
  }

  // Delete enrollment (admin)
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

  // ==================== PROGRESS TRACKING ENDPOINTS ====================

  // Get my progress with error handling
  async getMyProgress(forceRefresh = false) {
    // Check if Progress API is disabled
    if (localStorage.getItem("disableProgressApi") === "true") {
      console.log("Progress API disabled by user setting");
      return {
        success: false,
        message: "Progress API disabled",
        data: null,
        fallback: true,
        disabled: true,
      };
    }

    try {
      // Add cache busting if force refresh is requested
      const url = forceRefresh
        ? `${API_CONFIG.ENDPOINTS.PROGRESS_ALL}?t=${Date.now()}`
        : API_CONFIG.ENDPOINTS.PROGRESS_ALL;

      console.log(
        `🔄 Getting progress data${
          forceRefresh ? " (force refresh)" : ""
        }...`
      );

      const response = await this.authenticatedRequest(url);

      if (response?.success) {
        console.log("🔄 Progress data received:", response.data);
        return response;
      } else {
        console.warn("Progress API returned unsuccessful response");
        return {
          success: false,
          message: "Progress data temporarily unavailable",
          data: null,
          fallback: true,
        };
      }
    } catch (error) {
      console.warn(
        "Progress API failed, using fallback:",
        error.message
      );
      // Return fallback response structure
      return {
        success: false,
        message: "Progress data temporarily unavailable",
        data: null,
        fallback: true,
      };
    }
  }

  // Get course progress with error handling
  async getCourseProgress(courseId) {
    try {
      return await this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.PROGRESS_BY_COURSE.replace(
          "{courseId}",
          courseId
        )
      );
    } catch (error) {
      console.warn(
        "Course progress API failed, using enrollment status fallback:",
        error.message
      );

      // Fallback to enrollment status
      try {
        const enrollmentResponse = await this.getEnrollmentStatus(
          courseId
        );
        if (enrollmentResponse?.success && enrollmentResponse.data) {
          const { isEnrolled, status } = enrollmentResponse.data;

          // Convert enrollment status to progress-like format
          let completionPercentage = 0;
          let isCompleted = false;

          if (status === "Completed") {
            completionPercentage = 100;
            isCompleted = true;
          } else if (status === "InProgress") {
            completionPercentage = 50; // Default progress for in-progress
          } else if (status === "Enrolled") {
            completionPercentage = 0;
          }

          return {
            success: true,
            data: {
              completionPercentage,
              isCompleted,
              status: status,
              fallback: true,
            },
            fallback: true,
          };
        }
      } catch (enrollmentError) {
        console.warn(
          "Enrollment status fallback also failed:",
          enrollmentError.message
        );
      }

      // Ultimate fallback
      return {
        success: false,
        message: "Progress data temporarily unavailable",
        data: null,
        fallback: true,
      };
    }
  }

  // Get progress by ID
  async getProgressById(progressId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_BY_ID.replace(
        "{progressId}",
        progressId
      )
    );
  }

  // Create or update progress
  async createOrUpdateProgress(progressData) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_CREATE_UPDATE,
      {
        method: "POST",
        body: JSON.stringify(progressData),
      }
    );
  }

  // Complete lesson
  async completeLessonProgress(lessonData) {
    console.log("🔧 completeLessonProgress called with:", lessonData);
    console.log(
      "🔧 Endpoint:",
      API_CONFIG.ENDPOINTS.PROGRESS_LESSON_COMPLETE
    );
    console.log("🔧 Method: POST");
    console.log("🔧 Body:", JSON.stringify(lessonData));

    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_LESSON_COMPLETE,
      {
        method: "POST",
        body: JSON.stringify(lessonData),
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

  // ==================== COMMENT & REVIEW ENDPOINTS ====================

  // Get course comments
  async getCourseComments(courseId) {
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.COMMENT_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Get lesson comments
  async getLessonComments(lessonId) {
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.COMMENT_BY_LESSON.replace(
        "{lessonId}",
        lessonId
      )
    );
  }

  // Get chapter comments
  async getChapterComments(chapterId) {
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.COMMENT_BY_CHAPTER.replace(
        "{chapterId}",
        chapterId
      )
    );
  }

  // Get course reviews
  async getCourseReviews(courseId) {
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.REVIEW_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Lấy trạng thái session quiz
  async getQuizSessionStatus(quizId) {
    return this.authenticatedRequest(
      `/api/Quiz/${quizId}/session/status`
    );
  }

  // Khởi tạo session quiz (dùng GET)
  async startQuizSession(quizId) {
    return this.authenticatedRequest(`/api/Quiz/${quizId}/start`);
  }

  async getQuizResultsByUserQuiz(quizId) {
    return await this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.QUIZ_RESULT_BY_USER_QUIZ.replace(
        "{quizId}",
        quizId
      )
    );
  }

  // ==================== ENROLLMENT ENDPOINTS ====================

  // Check enrollment status
  async getEnrollmentStatus(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_STATUS.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Get my enrollments
  async getMyEnrollments() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_MY_ENROLLMENTS
    );
  }

  // Check if enrolled
  async isEnrolled(courseId) {
    try {
      const response = await this.getEnrollmentStatus(courseId);
      return response?.success && response.data?.isEnrolled;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return false;
    }
  }
}

export default new CourseService();

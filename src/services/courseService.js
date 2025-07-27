import API_CONFIG from "./apiConfig";

class CourseService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Helper method for authenticated requests
  async authenticatedRequest(url, options = {}) {
    const token = localStorage.getItem("accessToken");

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
    return this.publicRequest(
      API_CONFIG.ENDPOINTS.PUBLIC_COURSE_BY_ID.replace(
        "{courseId}",
        courseId
      )
    );
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
    var res = await this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.CHAPTER_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
    return res.data;
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
    var res = await this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.LESSON_BY_CHAPTER.replace(
        "{chapterId}",
        chapterId
      )
    );
    return res.data;
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
    return this.publicRequest(
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
    return this.publicRequest(
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
      // Nếu không có sessionId, bắt đầu quiz session để lấy sessionId
      let actualSessionId = sessionId;
      if (!actualSessionId) {
        const sessionResponse = await this.startQuizSession(quizId);
        if (!sessionResponse.success) {
          throw new Error("Failed to start quiz session");
        }
        actualSessionId = sessionResponse.data.sessionId;
      }

      const submittedAt = new Date().toISOString();
      const body = {
        quizId,
        sessionId: actualSessionId,
        userAnswers: answers.map((a) => ({
          questionId: a.questionId,
          answerId: a.selectedAnswerId || a.answerId,
          isSelected: true,
        })),
        timeSpentMinutes: timeSpent,
        notes: "Quiz submission",
        submittedAt,
      };

      return this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.QUIZ_RESULT_SUBMIT,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
    } catch (error) {
      console.error("Error submitting quiz:", error);
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

  // Get my enrollments
  async getMyEnrollments() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_MY_ENROLLMENTS
    );
  }

  // Check enrollment status
  async getEnrollmentStatus(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_STATUS.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Check if enrolled
  async isEnrolled(courseId) {
    return await this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_IS_ENROLLED.replace(
        "{courseId}",
        courseId
      )
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

  // Get my progress
  async getMyProgress() {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_ALL
    );
  }

  // Get course progress
  async getCourseProgress(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.PROGRESS_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
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
}

export default new CourseService();

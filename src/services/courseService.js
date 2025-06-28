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
      return responseText ? JSON.parse(responseText) : {};
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
      return responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // ==================== PUBLIC COURSE ENDPOINTS ====================

  // Get all public courses with pagination and filters
  async getPublicCourses(title = "", pageNumber = 1, pageSize = 10) {
    const params = new URLSearchParams({
      ...(title && { title }),
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    return this.publicRequest(
      `${API_CONFIG.ENDPOINTS.PUBLIC_COURSES_ALL}?${params}`
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
    pageSize = 10
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

  // ==================== PROTECTED COURSE ENDPOINTS ====================

  // Get all courses (admin only)
  async getCourses(page = 1, pageSize = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return this.authenticatedRequest(
      `${API_CONFIG.ENDPOINTS.COURSE_ALL}?${params}`
    );
  }

  // Get specific course
  async getCourseById(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace("{id}", courseId)
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
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace("{id}", courseId),
      {
        method: "PUT",
        body: courseFormData, // FormData object
      }
    );
  }

  // Delete course
  async deleteCourse(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COURSE_BY_ID.replace("{id}", courseId),
      {
        method: "DELETE",
      }
    );
  }

  // ==================== CHAPTER ENDPOINTS ====================

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

  // ==================== LESSON ENDPOINTS ====================

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
        body: JSON.stringify({ YoutubeUrl: youtubeUrl }),
      }
    );
  }

  // Upload video file
  async uploadVideo(lessonId, courseId, videoFile) {
    const formData = new FormData();
    formData.append("video", videoFile);

    const url =
      API_CONFIG.ENDPOINTS.MEDIA_UPLOAD_VIDEO.replace(
        "{lessonId}",
        lessonId
      ) + `?courseId=${courseId}`;

    return this.authenticatedRequest(url, {
      method: "POST",
      body: formData,
    });
  }

  // Upload audio file
  async uploadAudio(lessonId, courseId, audioFile) {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const url =
      API_CONFIG.ENDPOINTS.MEDIA_UPLOAD_AUDIO.replace(
        "{lessonId}",
        lessonId
      ) + `?courseId=${courseId}`;

    return this.authenticatedRequest(url, {
      method: "POST",
      body: formData,
    });
  }

  // Upload document
  async uploadDocument(lessonId, courseId, documentFile) {
    const formData = new FormData();
    formData.append("document", documentFile);

    const url =
      API_CONFIG.ENDPOINTS.MEDIA_UPLOAD_DOCUMENT.replace(
        "{lessonId}",
        lessonId
      ) + `?courseId=${courseId}`;

    return this.authenticatedRequest(url, {
      method: "POST",
      body: formData,
    });
  }

  // Get lesson files
  async getLessonFiles(lessonId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.MEDIA_LESSON_FILES.replace(
        "{lessonId}",
        lessonId
      )
    );
  }

  // ==================== ENROLLMENT ENDPOINTS ====================

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

  // Get enrollment status for specific course
  async getEnrollmentStatus(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.ENROLLMENT_STATUS.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Check if enrolled in course
  async isEnrolled(courseId) {
    return this.authenticatedRequest(
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

  // ==================== PROGRESS ENDPOINTS ====================

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

  // ==================== QUIZ ENDPOINTS ====================

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

  // ==================== COMMENT ENDPOINTS ====================

  // Get course comments
  async getCourseComments(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COMMENT_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
  }

  // Get lesson comments
  async getLessonComments(lessonId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COMMENT_BY_LESSON.replace(
        "{lessonId}",
        lessonId
      )
    );
  }

  // Get chapter comments
  async getChapterComments(chapterId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.COMMENT_BY_CHAPTER.replace(
        "{chapterId}",
        chapterId
      )
    );
  }

  // ==================== REVIEW ENDPOINTS ====================

  // Get course reviews
  async getCourseReviews(courseId) {
    return this.authenticatedRequest(
      API_CONFIG.ENDPOINTS.REVIEW_BY_COURSE.replace(
        "{courseId}",
        courseId
      )
    );
  }
}

// Create and export a singleton instance
const courseService = new CourseService();
export default courseService;

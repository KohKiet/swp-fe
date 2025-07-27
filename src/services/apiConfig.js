// API Configuration
export const API_CONFIG = {
  // Change this URL to match your backend server
  // Examples: "http://localhost:3000", "https://your-api.com"
  BASE_URL: "http://localhost:5150",
  ENDPOINTS: {
    // Authentication endpoints
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    LOGOUT: "/api/auth/logout",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    CHANGE_PASSWORD: "/api/auth/change-password",
    VERIFY_EMAIL: "/api/auth/verify-email",
    RESEND_VERIFICATION: "/api/auth/resend-verification",
    EMAIL_VERIFICATION_STATUS: "/api/auth/email-verification-status",

    // User profile endpoints
    USER_PROFILE_ME: "/api/userprofile/me",
    USER_PROFILE_BADGES: "/api/userprofile/me/badges",
    USER_PROFILE_ENROLLMENTS: "/api/CourseEnrollment/user",
    USER_PROFILE_REVIEWS: "/api/userprofile/me/reviews",
    USER_PROFILE_POSTS: "/api/userprofile/me/posts",
    USER_PROFILE_DASHBOARD: "/api/userprofile/me/dashboard",
    USER_PROFILE_BY_ID: "/api/userprofile/{userId}",

    // Admin endpoints
    ADMIN_USERS: "/api/admin/users",
    ADMIN_USER_BY_ID: "/api/admin/users/{id}",
    ADMIN_UPDATE_ROLE: "/api/Admin/update-role/{userId}",
    ADMIN_DASHBOARD: "/api/admin/dashboard",
    ADMIN_STATS: "/api/admin/stats",
    ADMIN_POSTS: "/api/admin/posts",
    ADMIN_POSTS_PENDING: "/api/admin/posts/pending",
    ADMIN_POST_BY_ID: "/api/admin/posts/{id}",
    ADMIN_POST_APPROVE: "/api/admin/posts/{id}/approve",
    ADMIN_POST_REJECT: "/api/admin/posts/{id}/reject",

    // Role endpoints
    ROLE_ALL: "/api/Role/all",
    ROLE_BY_ID: "/api/role/{id}",
    ROLE_USER: "/api/role/user/{userId}",
    ROLE_ASSIGN: "/api/role/assign",

    // Course Discovery endpoints - Updated to match actual backend
    PUBLIC_COURSES_ALL: "/api/Course",
    PUBLIC_COURSE_BY_ID: "/api/Course/{courseId}",
    PUBLIC_COURSES_BY_AGE: "/api/Course/by-age/{ageGroup}",
    PUBLIC_COURSES_BY_TYPE: "/api/Course/by-type/{courseType}",
    PUBLIC_COURSES_SEARCH: "/api/Course/search",
    PUBLIC_COURSES_LATEST: "/api/Course/public",
    PUBLIC_COURSES_FEATURED: "/api/Course/featured",

    // Protected Course Management endpoints (Admin/Manager only)
    COURSE_ALL: "/api/Course",
    COURSE_BY_ID: "/api/Course/{courseId}",
    COURSE_PUBLISH: "/api/Course/{courseId}/publish",
    COURSE_UNPUBLISH: "/api/Course/{courseId}/unpublish",

    // Chapter Management endpoints
    CHAPTER_ALL: "/api/Chapter",
    CHAPTER_BY_ID: "/api/Chapter/{chapterId}",
    CHAPTER_BY_COURSE: "/api/Chapter/course/{courseId}",

    // Lesson Management endpoints
    LESSON_ALL: "/api/Lesson",
    LESSON_BY_ID: "/api/Lesson/{lessonId}",
    LESSON_BY_CHAPTER: "/api/Lesson/chapter/{chapterId}",

    // Quiz & Assessment endpoints
    QUIZ_ALL: "/api/Quiz",
    QUIZ_BY_ID: "/api/Quiz/{quizId}",
    QUIZ_BY_LESSON: "/api/Quiz/lesson/{lessonId}",
    QUIZ_BY_COURSE: "/api/Quiz/course/{courseId}",
    QUIZ_START_SESSION: "/api/Quiz/{quizId}/start",

    // Question endpoints
    QUESTION_ALL: "/api/Question",
    QUESTION_BY_ID: "/api/Question/{questionId}",
    QUESTION_BY_QUIZ: "/api/Question/quiz/{quizId}",

    // Quiz Results endpoints
    QUIZ_RESULT_SUBMIT: "/api/Question/submit",
    QUIZ_RESULT_BY_QUIZ: "/api/QuizResult/quiz/{quizId}",
    QUIZ_RESULT_BY_USER: "/api/QuizResult/user/{userId}",
    QUIZ_RESULT_BY_USER_QUIZ: "/api/Quiz/result?quizId={quizId}",

    // Course Enrollment endpoints (Authentication Required)
    ENROLLMENT_ENROLL: "/api/CourseEnrollment/enroll/{courseId}",
    ENROLLMENT_DROP: "/api/CourseEnrollment/drop/{courseId}",
    ENROLLMENT_MY_ENROLLMENTS: "/api/CourseEnrollment/my-enrollments",
    ENROLLMENT_STATUS: "/api/CourseEnrollment/status/{courseId}",
    ENROLLMENT_IS_ENROLLED: "/api/CourseEnrollment/status/{courseId}",
    ENROLLMENT_COMPLETE: "/api/CourseEnrollment/complete/{courseId}",

    // Admin Enrollment endpoints (Admin/Manager only)
    ENROLLMENT_ALL: "/api/CourseEnrollment/all",
    ENROLLMENT_BY_COURSE: "/api/CourseEnrollment/course/{courseId}",
    ENROLLMENT_COUNT: "/api/CourseEnrollment/course/{courseId}/count",
    ENROLLMENT_UPDATE_STATUS:
      "/api/CourseEnrollment/{enrollmentId}/status",
    ENROLLMENT_DELETE: "/api/CourseEnrollment/{enrollmentId}",

    // Progress Tracking endpoints
    PROGRESS_ALL: "/api/Progress",
    PROGRESS_BY_ID: "/api/Progress/{progressId}",
    PROGRESS_BY_COURSE: "/api/Progress/course/{courseId}",
    PROGRESS_LESSON_COMPLETE: "/api/Progress/lesson/complete",
    PROGRESS_CREATE_UPDATE: "/api/Progress",

    // Media endpoints
    MEDIA_YOUTUBE_ADD:
      "/api/SimplifiedMedia/lesson/{lessonId}/youtube",
    MEDIA_UPLOAD_VIDEO: "/api/lessons/{lessonId}/Media/upload/video",
    MEDIA_UPLOAD_AUDIO: "/api/lessons/{lessonId}/Media/upload/audio",
    MEDIA_UPLOAD_DOCUMENT:
      "/api/lessons/{lessonId}/Media/upload/document",
    MEDIA_LESSON_FILES: "/api/FileAttachment/lesson/{lessonId}",

    // Comment endpoints
    COMMENT_BY_COURSE: "/api/Comment/course/{courseId}",
    COMMENT_BY_LESSON: "/api/Comment/lesson/{lessonId}",
    COMMENT_BY_CHAPTER: "/api/Comment/chapter/{chapterId}",

    // Review endpoints
    REVIEW_BY_COURSE: "/api/Review/course/{courseId}",

    // Category endpoints - Updated to match actual backend
    CATEGORY_ALL: "/api/Category",
    CATEGORY_BY_ID: "/api/Category/{id}",
    CATEGORY_PARENT: "/api/Category/parent/{parentId}",

    // Substance endpoints
    SUBSTANCE_ALL: "/api/substance",
    SUBSTANCE_BY_ID: "/api/substance/{id}",

    // Survey endpoints
    ADMIN_SURVEY_LIST: "/api/Surveys", // GET all surveys (Admin)
    ADMIN_SURVEY_CREATE: "/api/Surveys", // POST create survey (Admin)
    ADMIN_SURVEY_UPDATE: "/api/Surveys/{id}", // PUT update survey (Admin)
    ADMIN_SURVEY_DELETE: "/api/Surveys/{id}", // DELETE survey (Admin)

    // SurveyQuestion endpoints
    ADMIN_SURVEY_QUESTIONS: "/api/SurveyQuestion/{surveyId}", // GET questions for a survey
    ADMIN_SURVEY_QUESTION_DETAIL: "/api/SurveyQuestion/detail/{id}", // GET question by ID
    ADMIN_SURVEY_QUESTION_CREATE: "/api/SurveyQuestion", // POST create question (Admin)
    ADMIN_SURVEY_QUESTION_UPDATE: "/api/SurveyQuestion/{id}", // PUT update question (Admin)
    ADMIN_SURVEY_QUESTION_DELETE: "/api/SurveyQuestion/{id}", // DELETE question (Admin)

    // SurveyAnswer endpoints
    ADMIN_QUESTION_ANSWERS: "/api/SurveyAnswer/{questionId}", // GET answers for a question
    ADMIN_ANSWER_DETAIL: "/api/SurveyAnswer/detail/{id}", // GET answer by ID
    ADMIN_SURVEY_ANSWER_CREATE: "/api/SurveyAnswer", // POST create answer (Admin)
    ADMIN_SURVEY_ANSWER_UPDATE: "/api/SurveyAnswer/{id}", // PUT update answer (Admin)
    ADMIN_SURVEY_ANSWER_DELETE: "/api/SurveyAnswer/{id}", // DELETE answer (Admin)

    // Analytics endpoints
    ANALYTICS_ALL: "/api/analytics",
    ANALYTICS_USER: "/api/analytics/user",
    ANALYTICS_COURSES: "/api/analytics/courses",
    ANALYTICS_SUBSTANCES: "/api/analytics/substances",
    ANALYTICS_POSTS: "/api/analytics/posts",
    ANALYTICS_SURVEYS: "/api/analytics/surveys",
    ANALYTICS_DASHBOARD: "/api/analytics/dashboard",
    ANALYTICS_TIME_RANGE: "/api/analytics/time-range",

    // Search endpoints
    SEARCH_USERS: "/api/search/users",

    // Badge endpoints
    BADGE_ALL: "/api/badge",
    BADGE_BY_ID: "/api/badge/{id}",
    BADGE_AWARD: "/api/badge/award",

    // Health check endpoints
    HEALTH_ALL: "/api/healthchecks",
    HEALTH_DATABASE: "/api/healthchecks/database",
    HEALTH_FIREBASE: "/api/healthchecks/firebase",
    HEALTH_CLOUDINARY: "/api/healthchecks/cloudinary",

    // Community Events endpoints
    COMMUNITY_EVENTS: "/api/community-events",
    COMMUNITY_EVENTS_UPCOMING: "/api/community-events/upcoming",
    COMMUNITY_EVENTS_PAST: "/api/community-events/past",
    COMMUNITY_EVENTS_MY_EVENTS: "/api/community-events/my-events",
    COMMUNITY_EVENTS_BY_ID: "/api/community-events/{id}",

    // Event Participants endpoints (for registration)
    EVENT_PARTICIPANTS_REGISTER: "/api/event-participants/register",
    EVENT_PARTICIPANTS_UNREGISTER:
      "/api/event-participants/unregister/{eventId}",
    EVENT_PARTICIPANTS_CHECK_REGISTRATION:
      "/api/event-participants/check-registration/{eventId}",
    EVENT_PARTICIPANTS_BY_EVENT:
      "/api/event-participants/event/{eventId}",

    // Event Feedback endpoints
    EVENT_FEEDBACK: "/api/event-feedback",
    EVENT_FEEDBACK_BY_ID: "/api/event-feedback/{id}",
    EVENT_FEEDBACK_BY_EVENT: "/api/event-feedback/event/{eventId}",
    EVENT_FEEDBACK_BY_USER: "/api/event-feedback/user",
    EVENT_FEEDBACK_SUBMIT: "/api/event-feedback/submit",
    EVENT_FEEDBACK_CHECK_USER:
      "/api/event-feedback/check-user-feedback/{eventId}",

    // Consultation Appointment endpoints
    CONSULTATION_APPOINTMENTS: "/api/consultation-appointments",
    CONSULTATION_APPOINTMENTS_MY:
      "/api/consultation-appointments/my-appointments",
    CONSULTATION_APPOINTMENTS_MY_BOOKED:
      "/api/consultation-appointments/my-booked-appointments",
    CONSULTATION_APPOINTMENTS_MY_COMPLETED:
      "/api/consultation-appointments/my-completed-appointments",
    CONSULTATION_APPOINTMENTS_MY_CONFIRMED:
      "/api/consultation-appointments/my-confirmed-appointments",
    CONSULTATION_APPOINTMENTS_MY_CONSULTATIONS:
      "/api/consultation-appointments/my-consultations",
    CONSULTATION_APPOINTMENTS_BY_ID:
      "/api/consultation-appointments/{id}",
    CONSULTATION_APPOINTMENTS_STATUS:
      "/api/consultation-appointments/{id}/status",
    CONSULTATION_APPOINTMENTS_CANCEL:
      "/api/consultation-appointments/{id}/cancel",
    CONSULTATION_APPOINTMENTS_CANCEL_BY_MEMBER:
      "/api/consultation-appointments/{id}/cancel-by-member",
    CONSULTATION_APPOINTMENTS_CANCEL_BY_CONSULTANT:
      "/api/consultation-appointments/{id}/cancel-by-consultant",

    // Agora Video Call endpoints
    AGORA_TOKEN_REFRESH:
      "/api/consultation-appointments/{appointmentId}/agora-token",

    // Consultation Notes endpoints
    CONSULTATION_NOTES_BY_APPOINTMENT:
      "/api/consultation-notes/appointment/{appointmentId}",
    CONSULTATION_NOTES_MEMBER:
      "/api/consultation-notes/member/appointment/{appointmentId}",
    CONSULTATION_NOTES_ALL_MEMBER: "/api/consultation-notes/member",
    CONSULTATION_NOTES_ALL_CONSULTANT:
      "/api/consultation-notes/consultant",
    CONSULTATION_NOTES_BY_ID: "/api/consultation-notes/{id}",
    CONSULTATION_NOTES_CREATE: "/api/consultation-notes",
    CONSULTATION_NOTES_UPDATE: "/api/consultation-notes/{id}",
    CONSULTATION_NOTES_DELETE: "/api/consultation-notes/{id}",

    // Consultation Slot endpoints
    CONSULTATION_SLOTS: "/api/consultation-slots",
    CONSULTATION_SLOTS_MY: "/api/consultation-slots/my-slots",
    CONSULTATION_SLOTS_SEARCH: "/api/consultation-slots/search",
    CONSULTATION_SLOTS_AVAILABLE: "/api/consultation-slots/available",
    CONSULTATION_SLOTS_PUBLIC_AVAILABLE:
      "/api/consultation-slots/public/available",
    CONSULTATION_SLOTS_ALL_AVAILABLE:
      "/api/consultation-slots/all-available",
    CONSULTATION_SLOTS_ALL_DEBUG: "/api/consultation-slots/all-debug",
    CONSULTATION_SLOTS_BY_ID: "/api/consultation-slots/{id}",
    CONSULTATION_SLOTS_UPDATE: "/api/consultation-slots/{id}",
    CONSULTATION_SLOTS_DELETE: "/api/consultation-slots/{id}",
  },
};

export default API_CONFIG;

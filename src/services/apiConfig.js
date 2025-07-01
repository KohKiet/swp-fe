// API Configuration
export const API_CONFIG = {
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
    USER_PROFILE_ENROLLMENTS: "/api/userprofile/me/enrollments",
    USER_PROFILE_REVIEWS: "/api/userprofile/me/reviews",
    USER_PROFILE_POSTS: "/api/userprofile/me/posts",
    USER_PROFILE_DASHBOARD: "/api/userprofile/me/dashboard",
    USER_PROFILE_BY_ID: "/api/userprofile/{userId}",

    // Admin endpoints
    ADMIN_USERS: "/api/admin/users",
    ADMIN_USER_BY_ID: "/api/admin/users/{id}",
    ADMIN_DASHBOARD: "/api/admin/dashboard",
    ADMIN_STATS: "/api/admin/stats",
    ADMIN_POSTS: "/api/admin/posts",
    ADMIN_POSTS_PENDING: "/api/admin/posts/pending",
    ADMIN_POST_BY_ID: "/api/admin/posts/{id}",
    ADMIN_POST_APPROVE: "/api/admin/posts/{id}/approve",
    ADMIN_POST_REJECT: "/api/admin/posts/{id}/reject",

    // Role endpoints
    ROLE_ALL: "/api/role",
    ROLE_BY_ID: "/api/role/{id}",
    ROLE_USER: "/api/role/user/{userId}",
    ROLE_ASSIGN: "/api/role/assign",

    // Public Course endpoints
    PUBLIC_COURSES_ALL: "/api/public/courses",
    PUBLIC_COURSE_BY_ID: "/api/public/courses/{courseId}",
    PUBLIC_COURSES_BY_AGE: "/api/public/courses/by-age/{ageGroup}",
    PUBLIC_COURSES_BY_TYPE:
      "/api/public/courses/by-type/{courseType}",
    PUBLIC_COURSES_SEARCH: "/api/public/courses/search",

    // Protected Course endpoints
    COURSE_ALL: "/api/course",
    COURSE_BY_ID: "/api/course/{id}",

    // Chapter endpoints
    CHAPTER_ALL: "/api/chapter",
    CHAPTER_BY_ID: "/api/chapter/{chapterId}",

    // Lesson endpoints
    LESSON_ALL: "/api/lesson",
    LESSON_BY_ID: "/api/lesson/{lessonId}",

    // Media endpoints
    MEDIA_YOUTUBE_ADD:
      "/api/SimplifiedMedia/lesson/{lessonId}/youtube",
    MEDIA_UPLOAD_VIDEO: "/api/lessons/{lessonId}/Media/upload/video",
    MEDIA_UPLOAD_AUDIO: "/api/lessons/{lessonId}/Media/upload/audio",
    MEDIA_UPLOAD_DOCUMENT:
      "/api/lessons/{lessonId}/Media/upload/document",
    MEDIA_LESSON_FILES: "/api/FileAttachment/lesson/{lessonId}",

    // Course Enrollment endpoints
    ENROLLMENT_ENROLL: "/api/CourseEnrollment/enroll/{courseId}",
    ENROLLMENT_DROP: "/api/CourseEnrollment/drop/{courseId}",
    ENROLLMENT_MY_ENROLLMENTS: "/api/CourseEnrollment/my-enrollments",
    ENROLLMENT_STATUS: "/api/CourseEnrollment/status/{courseId}",
    ENROLLMENT_IS_ENROLLED:
      "/api/CourseEnrollment/is-enrolled/{courseId}",
    ENROLLMENT_COMPLETE: "/api/CourseEnrollment/complete/{courseId}",

    // Admin Enrollment endpoints
    ENROLLMENT_ALL: "/api/CourseEnrollment/all",
    ENROLLMENT_BY_COURSE: "/api/CourseEnrollment/course/{courseId}",
    ENROLLMENT_COUNT: "/api/CourseEnrollment/course/{courseId}/count",
    ENROLLMENT_UPDATE_STATUS:
      "/api/CourseEnrollment/{enrollmentId}/status",
    ENROLLMENT_DELETE: "/api/CourseEnrollment/{enrollmentId}",

    // Progress endpoints
    PROGRESS_ALL: "/api/Progress",
    PROGRESS_BY_ID: "/api/Progress/{progressId}",

    // Quiz endpoints
    QUIZ_ALL: "/api/Quiz",
    QUIZ_BY_ID: "/api/Quiz/{quizId}",

    // Comment endpoints
    COMMENT_BY_COURSE: "/api/Comment/course/{courseId}",
    COMMENT_BY_LESSON: "/api/Comment/lesson/{lessonId}",
    COMMENT_BY_CHAPTER: "/api/Comment/chapter/{chapterId}",

    // Review endpoints
    REVIEW_BY_COURSE: "/api/Review/course/{courseId}",

    // Category endpoints
    CATEGORY_ALL: "/api/category",
    CATEGORY_BY_ID: "/api/category/{id}",
    CATEGORY_PARENT: "/api/category/parent/{parentId}",

    // Substance endpoints
    SUBSTANCE_ALL: "/api/substance",
    SUBSTANCE_BY_ID: "/api/substance/{id}",

    // Survey endpoints
    SURVEY_ALL: "/api/surveys",
    SURVEY_BY_ID: "/api/surveys/{id}",

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
    
    COMMUNITY_EVENTS: "/api/community-events",
    COMMUNITY_EVENTS_UPCOMING: "/api/community-events/upcoming",
    COMMUNITY_EVENTS_PAST: "/api/community-events/past",
    COMMUNITY_EVENTS_MY_EVENTS: "/api/community-events/my-events",
    COMMUNITY_EVENTS_BY_ID: "/api/community-events/{id}",    // Event Participants endpoints (for registration)
    EVENT_PARTICIPANTS_REGISTER: "/api/event-participants/register",
    EVENT_PARTICIPANTS_UNREGISTER: "/api/event-participants/unregister/{eventId}",
    EVENT_PARTICIPANTS_CHECK_REGISTRATION: "/api/event-participants/check-registration/{eventId}",
    EVENT_PARTICIPANTS_BY_EVENT: "/api/event-participants/event/{eventId}",    // Event Feedback endpoints
    EVENT_FEEDBACK: "/api/event-feedback",
    EVENT_FEEDBACK_BY_ID: "/api/event-feedback/{id}",
    EVENT_FEEDBACK_BY_EVENT: "/api/event-feedback/event/{eventId}",
    EVENT_FEEDBACK_BY_USER: "/api/event-feedback/user",
    EVENT_FEEDBACK_SUBMIT: "/api/event-feedback/submit",
    EVENT_FEEDBACK_CHECK_USER: "/api/event-feedback/check-user-feedback/{eventId}",
  },
};

export default API_CONFIG;

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

    // Course endpoints
    COURSE_ALL: "/api/course",
    COURSE_BY_ID: "/api/course/{id}",

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
  },
};

export default API_CONFIG;

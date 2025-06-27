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
    USER_PROFILE_BY_ID: "/api/userprofile/{userId}",    // Community Events endpoints
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

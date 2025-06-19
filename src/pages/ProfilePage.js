import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEdit,
  faSave,
  faTimes,
  faCamera,
  faLock,
  faUsers,
  faCalendar,
  faPhone,
  faMapMarkerAlt,
  faEnvelope,
  faVenus,
  faMars,
  faMedal,
  faGraduationCap,
  faStar,
  faBlog,
  faChartLine,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "./ProfilePage.css";
import { useAuth } from "../context/AuthContext";
import { authService, API_CONFIG } from "../services";

const ProfilePage = () => {
  const {
    currentUser,
    updateProfile,
    changePassword,
    isAdmin,
    logout,
    setCurrentUser,
  } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState({
    profile: false,
    badges: false,
    enrollments: false,
    reviews: false,
    posts: false,
    dashboard: false,
  });

  const [profileData, setProfileData] = useState({
    fullname: "",
    phone: "",
    gender: "",
    address: "",
    dateOfBirth: "",
    profilePicture: null,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // User profile data states
  const [userProfileData, setUserProfileData] = useState({
    badges: [],
    enrollments: [],
    reviews: [],
    posts: [],
    dashboard: null,
  });

  // Track if we've attempted to load profile to prevent repeated calls
  const [profileLoadAttempted, setProfileLoadAttempted] =
    useState(false);

  // API Functions for User Profile Endpoints
  const fetchUserProfile = async (silent = false) => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const response = await authService.authenticatedRequest(
        `${API_CONFIG.BASE_URL}/api/userprofile/me`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch profile"
        );
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      if (!silent) {
        setMessage({
          type: "error",
          text: `Error loading profile: ${error.message}`,
        });
      }
      return { success: false, error: error.message };
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const fetchUserBadges = async () => {
    setLoading((prev) => ({ ...prev, badges: true }));
    try {
      const response = await authService.authenticatedRequest(
        `${API_CONFIG.BASE_URL}/api/userprofile/me/badges`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfileData((prev) => ({ ...prev, badges: data }));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch badges"
        );
      }
    } catch (error) {
      console.error("Fetch badges error:", error);
      setMessage({
        type: "error",
        text: `Error loading badges: ${error.message}`,
      });
      return { success: false, error: error.message };
    } finally {
      setLoading((prev) => ({ ...prev, badges: false }));
    }
  };

  const fetchUserEnrollments = async () => {
    setLoading((prev) => ({ ...prev, enrollments: true }));
    try {
      const response = await authService.authenticatedRequest(
        `${API_CONFIG.BASE_URL}/api/userprofile/me/enrollments`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfileData((prev) => ({
          ...prev,
          enrollments: data,
        }));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch enrollments"
        );
      }
    } catch (error) {
      console.error("Fetch enrollments error:", error);
      setMessage({
        type: "error",
        text: `Error loading enrollments: ${error.message}`,
      });
      return { success: false, error: error.message };
    } finally {
      setLoading((prev) => ({ ...prev, enrollments: false }));
    }
  };

  const fetchUserReviews = async () => {
    setLoading((prev) => ({ ...prev, reviews: true }));
    try {
      const response = await authService.authenticatedRequest(
        `${API_CONFIG.BASE_URL}/api/userprofile/me/reviews`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfileData((prev) => ({ ...prev, reviews: data }));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch reviews"
        );
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
      setMessage({
        type: "error",
        text: `Error loading reviews: ${error.message}`,
      });
      return { success: false, error: error.message };
    } finally {
      setLoading((prev) => ({ ...prev, reviews: false }));
    }
  };

  const fetchUserPosts = async () => {
    setLoading((prev) => ({ ...prev, posts: true }));
    try {
      const response = await authService.authenticatedRequest(
        `${API_CONFIG.BASE_URL}/api/userprofile/me/posts`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfileData((prev) => ({ ...prev, posts: data }));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Fetch posts error:", error);
      setMessage({
        type: "error",
        text: `Error loading posts: ${error.message}`,
      });
      return { success: false, error: error.message };
    } finally {
      setLoading((prev) => ({ ...prev, posts: false }));
    }
  };

  const fetchUserDashboard = async () => {
    setLoading((prev) => ({ ...prev, dashboard: true }));
    try {
      const response = await authService.authenticatedRequest(
        `${API_CONFIG.BASE_URL}/api/userprofile/me/dashboard`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfileData((prev) => ({ ...prev, dashboard: data }));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch dashboard"
        );
      }
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      setMessage({
        type: "error",
        text: `Error loading dashboard: ${error.message}`,
      });
      return { success: false, error: error.message };
    } finally {
      setLoading((prev) => ({ ...prev, dashboard: false }));
    }
  };

  const updateUserProfile = async (profileData) => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const response = await authService.authenticatedRequest(
        `${API_CONFIG.BASE_URL}/api/userprofile/me`,
        {
          method: "PUT",
          body: JSON.stringify(profileData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update profile"
        );
      }
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const fetchUserById = async (userId) => {
    try {
      const response = await authService.authenticatedRequest(
        `${API_CONFIG.BASE_URL}/api/userprofile/${userId}`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch user profile"
        );
      }
    } catch (error) {
      console.error("Fetch user by ID error:", error);
      return { success: false, error: error.message };
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (!currentUser) return;

    switch (activeTab) {
      case "badges":
        if (userProfileData.badges.length === 0) {
          fetchUserBadges();
        }
        break;
      case "enrollments":
        if (userProfileData.enrollments.length === 0) {
          fetchUserEnrollments();
        }
        break;
      case "reviews":
        if (userProfileData.reviews.length === 0) {
          fetchUserReviews();
        }
        break;
      case "posts":
        if (userProfileData.posts.length === 0) {
          fetchUserPosts();
        }
        break;
      case "dashboard":
        if (!userProfileData.dashboard) {
          fetchUserDashboard();
        }
        break;
      default:
        break;
    }
  }, [activeTab, currentUser]);

  // Load initial profile data when component mounts
  const loadInitialProfile = useCallback(async () => {
    if (currentUser && !loading.profile && !profileLoadAttempted) {
      setProfileLoadAttempted(true);

      // Only fetch if we haven't loaded profile data yet
      const hasProfileData =
        currentUser.fullname && currentUser.phone;
      if (!hasProfileData) {
        try {
          const result = await fetchUserProfile(true); // Silent mode
          if (result.success && result.data && result.data.data) {
            const profileFromApi = result.data.data;
            // Update current user with API data if available
            const updatedUser = { ...currentUser, ...profileFromApi };
            setCurrentUser(updatedUser);
          } else {
            // If API call fails, don't show error message on profile tab, just log it
            console.warn(
              "Profile API call failed, using cached user data:",
              result.error
            );
          }
        } catch (error) {
          console.warn(
            "Profile loading failed, using cached user data:",
            error
          );
        }
      }
    }
  }, [currentUser, loading.profile, profileLoadAttempted]); // Add profileLoadAttempted to dependencies

  useEffect(() => {
    loadInitialProfile();
  }, [loadInitialProfile]);

  // Update profileData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        fullname: currentUser.fullname || "",
        phone: currentUser.phone || "",
        gender: currentUser.gender || "",
        address: currentUser.address || "",
        dateOfBirth: currentUser.dateOfBirth
          ? currentUser.dateOfBirth.split("T")[0]
          : "",
        profilePicture: currentUser.profilePicture || null,
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          profilePicture: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // First, try to save to the API
      const apiResult = await updateUserProfile(profileData);

      if (apiResult.success) {
        // Update the AuthContext's currentUser with the new data
        const updatedUser = { ...currentUser, ...profileData };
        setCurrentUser(updatedUser);

        // Also update the local updateProfile function to persist to localStorage
        await updateProfile(profileData);

        setMessage({
          type: "success",
          text: "Cập nhật hồ sơ thành công",
        });
        setIsEditing(false);

        // Try to refresh the profile data from API (silent mode)
        try {
          await fetchUserProfile(true);
        } catch (refreshError) {
          console.warn(
            "Profile refresh failed after save:",
            refreshError
          );
        }
      } else {
        // API failed, but still save locally
        console.warn(
          "API save failed, saving locally:",
          apiResult.error
        );

        // Update the AuthContext's currentUser with the new data
        const updatedUser = { ...currentUser, ...profileData };
        setCurrentUser(updatedUser);

        // Update localStorage
        await updateProfile(profileData);

        setMessage({
          type: "success",
          text: "Đã lưu hồ sơ cục bộ (API tạm thời không khả dụng)",
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Profile update error:", error);

      // Fallback: save locally even if API completely fails
      try {
        const updatedUser = { ...currentUser, ...profileData };
        setCurrentUser(updatedUser);
        await updateProfile(profileData);

        setMessage({
          type: "success",
          text: "Đã lưu hồ sơ cục bộ (API tạm thời không khả dụng)",
        });
        setIsEditing(false);
      } catch (localError) {
        setMessage({
          type: "error",
          text: "Có lỗi xảy ra khi cập nhật hồ sơ",
        });
      }
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới không khớp" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    try {
      const result = await changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setShowPasswordForm(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Có lỗi xảy ra khi đổi mật khẩu",
      });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleCancel = () => {
    // Reset to original user data
    if (currentUser) {
      setProfileData({
        fullname: currentUser.fullname || "",
        phone: currentUser.phone || "",
        gender: currentUser.gender || "",
        address: currentUser.address || "",
        dateOfBirth: currentUser.dateOfBirth
          ? currentUser.dateOfBirth.split("T")[0]
          : "",
        profilePicture: currentUser.profilePicture || null,
      });
    }
    setIsEditing(false);
    setShowPasswordForm(false);
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "badges":
        return (
          <div className="profile-section">
            <h3>
              <FontAwesomeIcon icon={faMedal} /> Huy hiệu của tôi
            </h3>
            {loading.badges ? (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
              </div>
            ) : (
              <div className="badges-grid">
                {userProfileData.badges.length > 0 ? (
                  userProfileData.badges.map((badge, index) => (
                    <div key={index} className="badge-item">
                      <div className="badge-icon">
                        <FontAwesomeIcon icon={faMedal} />
                      </div>
                      <div className="badge-info">
                        <h4>{badge.name || "Huy hiệu"}</h4>
                        <p>{badge.description || "Mô tả huy hiệu"}</p>
                        <span className="badge-date">
                          {badge.earnedDate
                            ? new Date(
                                badge.earnedDate
                              ).toLocaleDateString("vi-VN")
                            : "Chưa xác định"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <p>Chưa có huy hiệu nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "enrollments":
        return (
          <div className="profile-section">
            <h3>
              <FontAwesomeIcon icon={faGraduationCap} /> Khóa học đã
              đăng ký
            </h3>
            {loading.enrollments ? (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
              </div>
            ) : (
              <div className="enrollments-list">
                {userProfileData.enrollments.length > 0 ? (
                  userProfileData.enrollments.map(
                    (enrollment, index) => (
                      <div key={index} className="enrollment-item">
                        <div className="enrollment-info">
                          <h4>
                            {enrollment.courseName || "Tên khóa học"}
                          </h4>
                          <p>
                            {enrollment.courseDescription ||
                              "Mô tả khóa học"}
                          </p>
                          <div className="enrollment-details">
                            <span className="enrollment-date">
                              Đăng ký:{" "}
                              {enrollment.enrollmentDate
                                ? new Date(
                                    enrollment.enrollmentDate
                                  ).toLocaleDateString("vi-VN")
                                : "Chưa xác định"}
                            </span>
                            <span className="enrollment-status">
                              Trạng thái:{" "}
                              {enrollment.status || "Đang học"}
                            </span>
                            <span className="enrollment-progress">
                              Tiến độ: {enrollment.progress || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <p>Chưa đăng ký khóa học nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "reviews":
        return (
          <div className="profile-section">
            <h3>
              <FontAwesomeIcon icon={faStar} /> Đánh giá của tôi
            </h3>
            {loading.reviews ? (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
              </div>
            ) : (
              <div className="reviews-list">
                {userProfileData.reviews.length > 0 ? (
                  userProfileData.reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <h4>{review.courseName || "Tên khóa học"}</h4>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              className={
                                i < (review.rating || 0)
                                  ? "star-filled"
                                  : "star-empty"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-content">
                        {review.content || "Nội dung đánh giá"}
                      </p>
                      <span className="review-date">
                        {review.reviewDate
                          ? new Date(
                              review.reviewDate
                            ).toLocaleDateString("vi-VN")
                          : "Chưa xác định"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <p>Chưa có đánh giá nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "posts":
        return (
          <div className="profile-section">
            <h3>
              <FontAwesomeIcon icon={faBlog} /> Bài viết của tôi
            </h3>
            {loading.posts ? (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
              </div>
            ) : (
              <div className="posts-list">
                {userProfileData.posts.length > 0 ? (
                  userProfileData.posts.map((post, index) => (
                    <div key={index} className="post-item">
                      <h4>{post.title || "Tiêu đề bài viết"}</h4>
                      <p className="post-excerpt">
                        {post.excerpt ||
                          post.content?.substring(0, 150) + "..." ||
                          "Nội dung bài viết"}
                      </p>
                      <div className="post-meta">
                        <span className="post-date">
                          {post.publishDate
                            ? new Date(
                                post.publishDate
                              ).toLocaleDateString("vi-VN")
                            : "Chưa xác định"}
                        </span>
                        <span className="post-status">
                          Trạng thái: {post.status || "Đã xuất bản"}
                        </span>
                        <span className="post-views">
                          Lượt xem: {post.views || 0}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <p>Chưa có bài viết nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "dashboard":
        return (
          <div className="profile-section">
            <h3>
              <FontAwesomeIcon icon={faChartLine} /> Thống kê
            </h3>
            {loading.dashboard ? (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
              </div>
            ) : (
              <div className="dashboard-stats">
                {userProfileData.dashboard ? (
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faGraduationCap} />
                      </div>
                      <div className="stat-info">
                        <h4>
                          {userProfileData.dashboard
                            .totalEnrollments || 0}
                        </h4>
                        <p>Khóa học đã đăng ký</p>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faMedal} />
                      </div>
                      <div className="stat-info">
                        <h4>
                          {userProfileData.dashboard.totalBadges || 0}
                        </h4>
                        <p>Huy hiệu đạt được</p>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faStar} />
                      </div>
                      <div className="stat-info">
                        <h4>
                          {userProfileData.dashboard.totalReviews ||
                            0}
                        </h4>
                        <p>Đánh giá đã viết</p>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faBlog} />
                      </div>
                      <div className="stat-info">
                        <h4>
                          {userProfileData.dashboard.totalPosts || 0}
                        </h4>
                        <p>Bài viết đã đăng</p>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faChartLine} />
                      </div>
                      <div className="stat-info">
                        <h4>
                          {userProfileData.dashboard
                            .averageProgress || 0}
                          %
                        </h4>
                        <p>Tiến độ trung bình</p>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FontAwesomeIcon icon={faCalendar} />
                      </div>
                      <div className="stat-info">
                        <h4>
                          {userProfileData.dashboard.daysActive || 0}
                        </h4>
                        <p>Ngày hoạt động</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <p>Không có dữ liệu thống kê</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="profile-details">
            <h2>Thông tin cá nhân</h2>

            <div className="details-grid">
              <div className="detail-item">
                <label>
                  <FontAwesomeIcon icon={faUser} />
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullname"
                    value={profileData.fullname}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>
                    {currentUser.fullname || "Chưa cập nhật"}
                  </span>
                )}
              </div>

              <div className="detail-item">
                <label>
                  <FontAwesomeIcon icon={faPhone} />
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{currentUser.phone || "Chưa cập nhật"}</span>
                )}
              </div>

              <div className="detail-item">
                <label>
                  <FontAwesomeIcon icon={faVenus} />
                  Giới tính
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleInputChange}>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <span>{currentUser.gender || "Chưa cập nhật"}</span>
                )}
              </div>

              <div className="detail-item">
                <label>
                  <FontAwesomeIcon icon={faCalendar} />
                  Ngày sinh
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>
                    {currentUser.dateOfBirth
                      ? new Date(
                          currentUser.dateOfBirth
                        ).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </span>
                )}
              </div>

              <div className="detail-item full-width">
                <label>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Địa chỉ
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                ) : (
                  <span>
                    {currentUser.address || "Chưa cập nhật"}
                  </span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveProfile}>
                  <FontAwesomeIcon icon={faSave} />
                  Lưu thay đổi
                </button>
                <button
                  className="btn btn-cancel"
                  onClick={handleCancel}>
                  <FontAwesomeIcon icon={faTimes} />
                  Hủy
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  if (isAdmin()) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-picture-section">
            <div className="profile-picture">
              {profileData.profilePicture ? (
                <img src={profileData.profilePicture} alt="Profile" />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
              {isEditing && (
                <label className="picture-upload-btn">
                  <FontAwesomeIcon icon={faCamera} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="profile-info">
            <h1>{currentUser.fullname || currentUser.email}</h1>
            <p className="user-email">
              <FontAwesomeIcon icon={faEnvelope} />
              {currentUser.email}
            </p>
            <p className="user-role">
              <FontAwesomeIcon icon={faUsers} />
              Vai trò: {currentUser.role || "User"}
            </p>
          </div>

          <div className="profile-actions">
            {!isEditing &&
              !showPasswordForm &&
              activeTab === "profile" && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}>
                    <FontAwesomeIcon icon={faEdit} />
                    Chỉnh sửa hồ sơ
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordForm(true)}>
                    <FontAwesomeIcon icon={faLock} />
                    Đổi mật khẩu
                  </button>
                </>
              )}

            {(isEditing || showPasswordForm) && (
              <button
                className="btn btn-cancel"
                onClick={handleCancel}>
                <FontAwesomeIcon icon={faTimes} />
                Hủy
              </button>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}>
            <FontAwesomeIcon icon={faUser} />
            Thông tin cá nhân
          </button>
          <button
            className={`tab-btn ${
              activeTab === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveTab("dashboard")}>
            <FontAwesomeIcon icon={faChartLine} />
            Thống kê
          </button>
          <button
            className={`tab-btn ${
              activeTab === "badges" ? "active" : ""
            }`}
            onClick={() => setActiveTab("badges")}>
            <FontAwesomeIcon icon={faMedal} />
            Huy hiệu
          </button>
          <button
            className={`tab-btn ${
              activeTab === "enrollments" ? "active" : ""
            }`}
            onClick={() => setActiveTab("enrollments")}>
            <FontAwesomeIcon icon={faGraduationCap} />
            Khóa học
          </button>
          <button
            className={`tab-btn ${
              activeTab === "reviews" ? "active" : ""
            }`}
            onClick={() => setActiveTab("reviews")}>
            <FontAwesomeIcon icon={faStar} />
            Đánh giá
          </button>
          <button
            className={`tab-btn ${
              activeTab === "posts" ? "active" : ""
            }`}
            onClick={() => setActiveTab("posts")}>
            <FontAwesomeIcon icon={faBlog} />
            Bài viết
          </button>
        </div>

        {showPasswordForm && activeTab === "profile" && (
          <div className="password-form-section">
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faLock} />
                  Mật khẩu cũ
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faLock} />
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faLock} />
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon icon={faSave} />
                Lưu mật khẩu
              </button>
            </form>
          </div>
        )}

        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;

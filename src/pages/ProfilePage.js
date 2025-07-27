import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
    specialization: "",
    degree: "",
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

  // Track if profile has been loaded to prevent multiple calls
  const profileLoadedRef = useRef(false);
  const mountedRef = useRef(false);

  // API Functions for User Profile Endpoints
  const fetchUserProfile = async (silent = false) => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      // Use AuthService fetchUserProfile which calls /api/User/me correctly
      const result = await authService.fetchUserProfile();

      if (result.success && result.data) {
        // Update current user with fresh data from API
        const updatedUser = authService.getCurrentUser();
        setCurrentUser(updatedUser);
        return { success: true, data: result.data };
      } else {
        if (!silent) {
          setMessage({
            type: "error",
            text: `Error loading profile: ${result.error}`,
          });
        }
        return { success: false, error: result.error };
      }
    } catch (error) {
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
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE_ENROLLMENTS}`,
        { method: "GET" }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfileData((prev) => ({
          ...prev,
          enrollments: data["data"],
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

  // Note: Profile updates now use AuthService.updateProfile() method
  // which handles the /api/User/profile PUT request with proper response parsing
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
    // Only load once and only if user exists, not already loading, and component is mounted
    if (
      currentUser &&
      !loading.profile &&
      !profileLoadedRef.current &&
      mountedRef.current
    ) {
      profileLoadedRef.current = true;

      try {
        const result = await fetchUserProfile(true); // Silent mode
        if (!result.success) {
          // Reset flag on failure so it can try again
          profileLoadedRef.current = false;
        }
      } catch (error) {
        // Reset flag on error so it can try again
        profileLoadedRef.current = false;
      }
    }
  }, [currentUser?.email, loading.profile]);

  useEffect(() => {
    loadInitialProfile();
  }, [loadInitialProfile]);

  // Set mounted flag and cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset profile loaded flag when user changes (for logout/login scenarios)
  useEffect(() => {
    if (currentUser?.email) {
      profileLoadedRef.current = false;
    }
  }, [currentUser?.email]);

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
        specialization: currentUser.specialization || "",
        degree: currentUser.degree || "",
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
      // Chỉ gửi specialization và degree nếu là consultant
      let dataToSend = { ...profileData };
      if (
        !(
          currentUser.roleName === "consultant" ||
          currentUser.role === "consultant"
        )
      ) {
        delete dataToSend.specialization;
        delete dataToSend.degree;
      }

      // Use AuthContext updateProfile which now handles the API call properly
      const result = await updateProfile(dataToSend);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Cập nhật hồ sơ thành công",
        });
        setIsEditing(false);

        // Try to refresh the profile data from API (silent mode)
        try {
          await fetchUserProfile(true);
        } catch (refreshError) {}
      } else {
        setMessage({
          type: "error",
          text: result.error || "Có lỗi xảy ra khi cập nhật hồ sơ",
        });
      }
    } catch (error) {
      console.error("Profile save error:", error);
      setMessage({
        type: "error",
        text: "Có lỗi xảy ra khi cập nhật hồ sơ",
      });
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
        specialization: currentUser.specialization || "",
        degree: currentUser.degree || "",
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

  // Hàm chuyển trạng thái enrollment sang tiếng Việt
  const getEnrollmentStatusText = (status) => {
    if (!status) return "Không xác định";
    const s = status.toLowerCase();
    switch (s) {
      case "inprogress":
      case "enrolled":
      case "active":
      case "studying":
        return "Đang học";
      case "completed":
      case "done":
        return "Đã hoàn thành";
      case "pending":
        return "Chờ xác nhận";
      case "cancelled":
      case "canceled":
        return "Đã hủy";
      case "failed":
        return "Không đạt";
      case "expired":
        return "Hết hạn";
      default:
        return status;
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
                            {enrollment.courseTitle || "Tên khóa học"}
                          </h4>
                          <div className="enrollment-details">
                            <span className="enrollment-date">
                              Đăng ký:{" "}
                              {enrollment.enrolledAt
                                ? new Date(
                                    enrollment.enrolledAt
                                  ).toLocaleDateString("vi-VN")
                                : "Chưa xác định"}
                            </span>
                            <span className="enrollment-status">
                              Trạng thái:{" "}
                              {getEnrollmentStatusText(
                                enrollment.status
                              )}
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

              {/* Chỉ hiển thị cho consultant khi chỉnh sửa */}
              {(currentUser.roleName === "consultant" ||
                currentUser.role === "consultant") && (
                <>
                  <div className="detail-item">
                    <label>
                      <FontAwesomeIcon icon={faGraduationCap} />
                      Bằng cấp
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="degree"
                        value={profileData.degree}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <span>
                        {currentUser.degree || "Chưa cập nhật"}
                      </span>
                    )}
                  </div>
                  <div className="detail-item">
                    <label>
                      <FontAwesomeIcon icon={faStar} />
                      Chuyên môn
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialization"
                        value={profileData.specialization}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <span>
                        {currentUser.specialization ||
                          "Chưa cập nhật"}
                      </span>
                    )}
                  </div>
                </>
              )}
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
              Vai trò:{" "}
              {currentUser.roleName || currentUser.role || "User"}
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
              activeTab === "enrollments" ? "active" : ""
            }`}
            onClick={() => setActiveTab("enrollments")}>
            <FontAwesomeIcon icon={faGraduationCap} />
            Khóa học
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

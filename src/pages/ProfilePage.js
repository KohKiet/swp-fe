import React, { useState, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import "./ProfilePage.css";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const {
    currentUser,
    updateProfile,
    changePassword,
    isAdmin,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
      const result = await updateProfile(profileData);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Có lỗi xảy ra khi cập nhật",
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
            {!isEditing && !showPasswordForm && (
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

        {showPasswordForm && (
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
                <span>{currentUser.fullname || "Chưa cập nhật"}</span>
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
                <span>{currentUser.address || "Chưa cập nhật"}</span>
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

        <div className="profile-actions-footer">
          <button className="btn btn-danger" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

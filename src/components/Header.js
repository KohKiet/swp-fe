import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faChevronDown,
  faSignOutAlt,
  faTachometerAlt,
  faUserCog,
  faClock,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./Header.css";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    currentUser,
    logout,
    isAdmin,
    isConsultant,
    refreshUserData,
  } = useAuth();
  const navigate = useNavigate();
  const hasRefreshedRef = useRef(false);

  // Effect to refresh user data only once on component mount
  useEffect(() => {
    if (currentUser && refreshUserData && !hasRefreshedRef.current) {
      // Only refresh if we're missing important data like profile picture
      if (!currentUser.profilePicture) {
        hasRefreshedRef.current = true;
        refreshUserData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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

  // Function to get user initials for avatar fallback
  const getUserInitials = () => {
    if (!currentUser) return "";
    const fullname = currentUser.fullname || currentUser.email || "";
    if (fullname.includes(" ")) {
      // Get first letter of first and last name
      const names = fullname.split(" ");
      return names[0][0] + names[names.length - 1][0];
    }
    // Get first two letters if no space
    return fullname.substring(0, 2);
  };

  // Function to check if user is a regular member (not admin or consultant)
  const isMember = () => {
    return currentUser && !isAdmin() && !isConsultant();
  };

  // Function to get display name - prefer fullname, fallback to email
  const getDisplayName = () => {
    if (!currentUser) return "";
    return currentUser.fullname || currentUser.email;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content flex-between">
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <img
                src="/Dlogo.jpg"
                alt="Logo BrightChoice"
                className="logo-image"
              />
              <h1>BrightChoice</h1>
            </Link>
          </div>

          <nav className="main-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/education" className="nav-link">
                  Khóa Học
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/counseling" className="nav-link">
                  Đặt Lịch Tư Vấn
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/surveys" className="nav-link">
                  Khảo Sát
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/programs" className="nav-link">
                  Sự Kiện
                </Link>
              </li>
              <li className="nav-item">
                <a href="/consultants" className="nav-link">
                  Chuyên gia tư vấn
                </a>
              </li>
              {isMember() && (
                <li className="nav-item">
                  <Link to="/my-appointments" className="nav-link">
                    Lịch Hẹn
                  </Link>
                </li>
              )}
              {isConsultant() && (
                <li className="nav-item">
                  <Link to="/consult-time" className="nav-link">
                    Quản Lý Lịch
                  </Link>
                </li>
              )}
              {isAdmin() && (
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">
                    {" "}
                    Bảng điều khiển
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div
            className="mobile-menu-button"
            onClick={toggleMobileMenu}>
            <div
              className={`hamburger ${
                isMobileMenuOpen ? "active" : ""
              }`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div className="auth-buttons">
            {currentUser ? (
              <div className="user-dropdown">
                <button className="dropdown-toggle">
                  <div className="user-avatar">
                    {currentUser.profilePicture ? (
                      <img
                        src={currentUser.profilePicture}
                        alt="Profile"
                        className="user-profile-pic"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.target.style.display = "none";
                          e.target.parentNode.querySelector(
                            ".user-initials"
                          ).style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="user-initials"
                      style={{
                        display: currentUser.profilePicture
                          ? "none"
                          : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        color: "#3f51b5",
                      }}>
                      {getUserInitials()}
                    </div>
                  </div>
                  <span className="user-name">
                    {getDisplayName()}
                  </span>
                  <FontAwesomeIcon icon={faChevronDown} />
                </button>
                <div className="dropdown-menu">
                  {!isAdmin() && !isConsultant() && (
                    <Link to="/profile" className="dropdown-item">
                      <FontAwesomeIcon icon={faUserCog} /> Hồ Sơ Cá
                      Nhân
                    </Link>
                  )}
                  {isConsultant() && (
                    <>
                      <Link to="/profile" className="dropdown-item">
                        <FontAwesomeIcon icon={faUserCog} /> Hồ Sơ Cá
                        Nhân
                      </Link>
                      <Link
                        to="/consult-time"
                        className="dropdown-item">
                        Quản Lý Lịch
                      </Link>
                    </>
                  )}
                  {isAdmin() && (
                    <Link to="/dashboard" className="dropdown-item">
                      Bảng thông tin
                    </Link>
                  )}
                  <button
                    className="dropdown-item"
                    onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Đăng Xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn">
                <FontAwesomeIcon icon={faUser} /> Đăng Nhập / Đăng Ký
              </Link>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-nav">
          <Link to="/education" className="mobile-nav-link">
            Khóa Học
          </Link>
          <Link to="/education/surveys" className="mobile-nav-link">
            Đánh Giá
          </Link>
          <Link to="/counseling" className="mobile-nav-link">
            Đặt Lịch Tư Vấn
          </Link>
          <Link to="/programs" className="mobile-nav-link">
            Chương Trình
          </Link>
          {currentUser && !isAdmin() && (
            <>
              <Link to="/profile" className="mobile-nav-link">
                <FontAwesomeIcon icon={faUserCog} /> Hồ Sơ Cá Nhân
              </Link>
              {!isConsultant() && (
                <Link
                  to="/my-appointments"
                  className="mobile-nav-link">
                  Lịch Hẹn
                </Link>
              )}
            </>
          )}
          {isConsultant() && (
            <Link to="/consult-time" className="mobile-nav-link">
              <FontAwesomeIcon icon={faClock} /> Quản Lý Lịch
            </Link>
          )}
          {isAdmin() && (
            <Link to="/dashboard" className="mobile-nav-link">
              <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
            </Link>
          )}
          {currentUser ? (
            <button
              className="mobile-nav-link"
              onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Đăng Xuất
            </button>
          ) : (
            <Link to="/login" className="mobile-nav-link login">
              <FontAwesomeIcon icon={faUser} /> Đăng Nhập / Đăng Ký
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

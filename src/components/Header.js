import React, { useState } from "react";
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
  const { currentUser, logout, isAdmin, isConsultant } = useAuth();
  const navigate = useNavigate();

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
                    <FontAwesomeIcon icon={faClock} /> Quản Lý Lịch
                  </Link>
                </li>
              )}

              {isAdmin() && (
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">
                    <FontAwesomeIcon icon={faTachometerAlt} />{" "}
                    Dashboard
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
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} />
                    )}
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
                        <FontAwesomeIcon icon={faClock} /> Quản Lý
                        Lịch
                      </Link>
                    </>
                  )}
                  {isAdmin() && (
                    <Link to="/dashboard" className="dropdown-item">
                      <FontAwesomeIcon icon={faTachometerAlt} />{" "}
                      Dashboard
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

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "./Header.css";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content flex-between">
          <div className="logo-container secondary-bg">
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
                <Link to="/education/surveys" className="nav-link">
                  Đánh Giá
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/counseling" className="nav-link">
                  Đặt Lịch Tư Vấn
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/programs" className="nav-link">
                  Chương Trình
                </Link>
              </li>
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
            <Link to="/login" className="btn">
              <FontAwesomeIcon icon={faUser} /> Đăng Nhập / Đăng Ký
            </Link>
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
          <Link to="/login" className="mobile-nav-link login">
            <FontAwesomeIcon icon={faUser} /> Đăng Nhập / Đăng Ký
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

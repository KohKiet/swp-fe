import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faChevronDown,
  faSignOutAlt,
  faTachometerAlt,
  faUserCog,
} from '@fortawesome/free-solid-svg-icons';
import './Header.css';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  // Function to get display name - prefer fullname, fallback to email
  const getDisplayName = () => {
    if (!currentUser) return '';
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
                  Kh�a H?c
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/counseling" className="nav-link">
                  �?t L?ch Tu V?n
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/education/surveys" className="nav-link">
                  Kh?o S�t
                </Link>
              </li>

              <li className="nav-item">
                <Link to="/programs" className="nav-link">
                  S? Ki?n
                </Link>
              </li>

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
              className={hamburger }>
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
                  {!isAdmin() && (
                    <Link to="/profile" className="dropdown-item">
                      <FontAwesomeIcon icon={faUserCog} /> H? So C�
                      Nh�n
                    </Link>
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
                    <FontAwesomeIcon icon={faSignOutAlt} /> �ang Xu?t
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn">
                <FontAwesomeIcon icon={faUser} /> �ang Nh?p / �ang K�
              </Link>
            )}
          </div>
        </div>
      </div>

      <div
        className={mobile-menu }>
        <div className="mobile-nav">
          <Link to="/education" className="mobile-nav-link">
            Kh�a H?c
          </Link>
          <Link to="/education/surveys" className="mobile-nav-link">
            ��nh Gi�
          </Link>
          <Link to="/counseling" className="mobile-nav-link">
            �?t L?ch Tu V?n
          </Link>
          <Link to="/programs" className="mobile-nav-link">
            Chuong Tr�nh
          </Link>
          {currentUser && !isAdmin() && (
            <Link to="/profile" className="mobile-nav-link">
              <FontAwesomeIcon icon={faUserCog} /> H? So C� Nh�n
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
              <FontAwesomeIcon icon={faSignOutAlt} /> �ang Xu?t
            </button>
          ) : (
            <Link to="/login" className="mobile-nav-link login">
              <FontAwesomeIcon icon={faUser} /> �ang Nh?p / �ang K�
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

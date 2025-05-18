import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "./Header.css";

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content flex-between">
          <div className="logo-container secondary-bg">
            <Link to="/">
              <h1>BrightChoice</h1>
            </Link>
          </div>

          <nav className="main-nav">
            <ul className="nav-list">
              <li className="nav-item dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => toggleDropdown("courses")}>
                  Courses <FontAwesomeIcon icon={faChevronDown} />
                </button>
                {activeDropdown === "courses" && (
                  <div className="dropdown-menu">
                    <Link to="/education?group=students">
                      For Students
                    </Link>
                    <Link to="/education?group=parents">
                      For Parents
                    </Link>
                    <Link to="/education?group=teachers">
                      For Teachers
                    </Link>
                  </div>
                )}
              </li>

              <li className="nav-item dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => toggleDropdown("assessments")}>
                  Assessments <FontAwesomeIcon icon={faChevronDown} />
                </button>
                {activeDropdown === "assessments" && (
                  <div className="dropdown-menu">
                    <Link to="/education/surveys/assist">
                      ASSIST Survey
                    </Link>
                    <Link to="/education/surveys/crafft">
                      CRAFFT Survey
                    </Link>
                    <Link to="/education/surveys/pre-program">
                      Pre-Program Survey
                    </Link>
                  </div>
                )}
              </li>

              <li className="nav-item dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => toggleDropdown("counseling")}>
                  Book Counseling{" "}
                  <FontAwesomeIcon icon={faChevronDown} />
                </button>
                {activeDropdown === "counseling" && (
                  <div className="dropdown-menu">
                    <Link to="/counseling/profiles">
                      Counselor Profiles
                    </Link>
                    <Link to="/counseling/booking">
                      Book Appointment
                    </Link>
                  </div>
                )}
              </li>

              <li className="nav-item dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => toggleDropdown("programs")}>
                  Programs <FontAwesomeIcon icon={faChevronDown} />
                </button>
                {activeDropdown === "programs" && (
                  <div className="dropdown-menu">
                    <Link to="/programs/upcoming">
                      Upcoming Events
                    </Link>
                    <Link to="/programs/community">
                      Community Initiatives
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </nav>

          <div className="auth-buttons">
            <Link to="/login" className="btn">
              <FontAwesomeIcon icon={faUser} /> Login / Signup
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

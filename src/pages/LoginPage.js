import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import "./LoginPage.css";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState({});

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin && !formData.name) {
      newErrors.name = "Name is required";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Here we would normally send the data to the server
    console.log("Form submitted:", formData);

    // Clear form
    setFormData({
      email: "",
      password: "",
      name: "",
    });

    // Redirect would happen here after authentication
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image secondary-bg">
          <div className="image-content">
            <h2>Welcome to DrugFree Community</h2>
            <p>
              Join our community of volunteers and make a positive
              impact in the fight against substance abuse.
            </p>
          </div>
        </div>

        <div className="login-form-container">
          <div className="form-switcher">
            <button
              className={`switcher-btn ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}>
              Login
            </button>
            <button
              className={`switcher-btn ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}>
              Sign Up
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <h2>
              {isLogin
                ? "Log In to Your Account"
                : "Create an Account"}
            </h2>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">
                  <FontAwesomeIcon icon={faUser} /> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <div className="error-text">{errors.name}</div>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <div className="error-text">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} /> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              {errors.password && (
                <div className="error-text">{errors.password}</div>
              )}
            </div>

            {isLogin && (
              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link
                  to="/forgot-password"
                  className="forgot-password">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary submit-btn">
              {isLogin ? "Log In" : "Sign Up"}
            </button>

            <div className="form-footer">
              <p>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={toggleForm}>
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

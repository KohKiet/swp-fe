import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import "./LoginPage.css";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setLoginError("");
    setSuccessMessage("");
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

    if (loginError) {
      setLoginError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!isLogin && !formData.name) {
      newErrors.name = "Họ tên là bắt buộc";
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

    if (isLogin) {
      const loginSuccess = login(formData.email, formData.password);
      if (loginSuccess) {
        navigate("/");
      } else {
        setLoginError("Email hoặc mật khẩu không đúng");
      }
    } else {
      // Handle registration
      const result = register(formData);
      if (result.success) {
        setSuccessMessage(result.message);
        setFormData({
          email: "",
          password: "",
          name: "",
        });
        // Auto switch to login form after successful registration
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage("");
        }, 2000);
      } else {
        setLoginError(result.message);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <div className="image-content">
            <h2>Chào mừng đến với Cộng Đồng BrightChoice</h2>
            <p>
              Tham gia cộng đồng tình nguyện viên của chúng tôi và tạo
              ra tác động tích cực trong cuộc chiến chống lại lạm dụng
              chất gây nghiện.
            </p>
          </div>
        </div>

        <div className="login-form-container">
          <div className="form-switcher">
            <button
              className={`switcher-btn ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}>
              Đăng Nhập
            </button>
            <button
              className={`switcher-btn ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}>
              Đăng Ký
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <h2>
              {isLogin
                ? "Đăng Nhập Vào Tài Khoản Của Bạn"
                : "Tạo Tài Khoản Mới"}
            </h2>

            {loginError && (
              <div className="error-alert">{loginError}</div>
            )}

            {successMessage && (
              <div className="success-alert">{successMessage}</div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">
                  <FontAwesomeIcon icon={faUser} /> Họ và Tên
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
                <FontAwesomeIcon icon={faEnvelope} /> Địa Chỉ Email
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
                <FontAwesomeIcon icon={faLock} /> Mật Khẩu
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
                  <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                </div>
                <Link
                  to="/forgot-password"
                  className="forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary submit-btn">
              {isLogin ? "Đăng Nhập" : "Đăng Ký"}
            </button>

            <div className="form-footer">
              <p>
                {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={toggleForm}>
                  {isLogin ? "Đăng Ký" : "Đăng Nhập"}
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

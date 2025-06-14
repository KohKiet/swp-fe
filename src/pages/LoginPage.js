import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEnvelope,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import "./LoginPage.css";
import authService from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setLoginError("");
    setSuccessMessage("");
    // Reset form data when switching
    setFormData({
      email: "",
      password: "",
      name: "",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setLoginError("");
    setSuccessMessage("");

    try {
      if (isLogin) {
        // Handle login
        const result = await authService.login(
          formData.email,
          formData.password
        );

        if (result.success) {
          setSuccessMessage("Đăng nhập thành công!");
          // Navigate to home page after successful login
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          setLoginError(
            result.error || "Email hoặc mật khẩu không đúng"
          );
        }
      } else {
        // Handle registration
        const result = await authService.register(
          formData.email,
          formData.password,
          formData.name
        );

        if (result.success) {
          setSuccessMessage(
            "Đăng ký thành công! Vui lòng đăng nhập."
          );
          // Reset form and switch to login
          setFormData({
            email: formData.email, // Keep email for convenience
            password: "",
            name: "",
          });
          // Auto switch to login form after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMessage("");
          }, 2000);
        } else {
          setLoginError(result.error || "Có lỗi xảy ra khi đăng ký");
        }
      }
    } catch (error) {
      setLoginError("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
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
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`password-input-with-toggle ${
                    errors.password ? "error" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-btn"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }>
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
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
              className="btn btn-primary submit-btn"
              disabled={isLoading}>
              {isLogin
                ? isLoading
                  ? "Đang đăng nhập..."
                  : "Đăng Nhập"
                : isLoading
                ? "Đang đăng ký..."
                : "Đăng Ký"}
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

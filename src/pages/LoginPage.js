import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEnvelope,
  faEye,
  faEyeSlash,
  faPhone,
  faMapMarkerAlt,
  faCalendar,
  faVenus,
  faMars,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./LoginPage.css";
import { useAuth } from "../context/AuthContext";
import {
  USE_MOCK_SERVICES,
  USE_MOCK_ADMIN,
} from "../services/serviceConfig";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, isAdmin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setLoginError("");
    setSuccessMessage("");
    // Reset form data when switching
    setFormData({
      email: "",
      password: "",
      fullname: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      address: "",
      confirmPassword: "",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Special handling for phone number
    if (name === "phone") {
      // Remove any non-digit characters except +
      let cleanValue = value.replace(/[^\d+]/g, "");

      // If user is typing and doesn't start with +84, add it
      if (cleanValue && !cleanValue.startsWith("+84")) {
        // If it starts with 0, replace with +84
        if (cleanValue.startsWith("0")) {
          cleanValue = "+84" + cleanValue.substring(1);
        }
        // If it starts with 84, add +
        else if (cleanValue.startsWith("84")) {
          cleanValue = "+" + cleanValue;
        }
        // If it's just digits, add +84
        else if (/^\d/.test(cleanValue)) {
          cleanValue = "+84" + cleanValue;
        }
      }

      // Ensure we always have +84 if there are digits
      if (
        cleanValue &&
        !cleanValue.startsWith("+84") &&
        /\d/.test(cleanValue)
      ) {
        cleanValue = "+84" + cleanValue.replace(/^\+?84?/, "");
      }

      if (cleanValue.length > 12) {
        cleanValue = cleanValue.substring(0, 12);
      }

      processedValue = cleanValue;
    }

    setFormData({
      ...formData,
      [name]: processedValue,
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

  const handlePhoneFocus = (e) => {
    if (!formData.phone) {
      setFormData({
        ...formData,
        phone: "+84",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Registration specific validations
    if (!isLogin) {
      if (!formData.fullname) {
        newErrors.fullname = "Họ tên là bắt buộc";
      }

      if (!formData.phone) {
        newErrors.phone = "Số điện thoại là bắt buộc";
      } else if (!/^\+84\d{9}$/.test(formData.phone)) {
        newErrors.phone =
          "Số điện thoại phải có định dạng +84xxxxxxxxx (9 chữ số sau +84)";
      }

      if (!formData.gender) {
        newErrors.gender = "Giới tính là bắt buộc";
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
      } else {
        // Age validation - check if user is at least 15 years old
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Adjust age if birthday hasn't occurred this year
        const actualAge =
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ? age - 1
            : age;

        if (actualAge < 15) {
          newErrors.dateOfBirth =
            "Bạn phải từ 15 tuổi trở lên để đăng ký";
        }
      }

      if (!formData.address) {
        newErrors.address = "Địa chỉ là bắt buộc";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu không khớp";
      }
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
        const result = await login(formData.email, formData.password);

        if (result.success) {
          setSuccessMessage("Đăng nhập thành công!");

          // Redirect based on user role
          setTimeout(() => {
            // Check if user is admin and redirect to dashboard
            if (isAdmin()) {
              navigate("/dashboard");
            } else {
              navigate("/");
            }
          }, 1500);
        } else {
          setLoginError(
            result.error || "Email hoặc mật khẩu không đúng"
          );
        }
      } else {
        // Handle registration
        const registrationData = {
          email: formData.email,
          password: formData.password,
          fullname: formData.fullname,
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          role: "Member",
        };

        const result = await register(registrationData);

        if (result.success) {
          setSuccessMessage(
            result.message ||
              "Đăng ký thành công! Vui lòng đăng nhập."
          );

          // Check if user was automatically logged in
          if (result.autoLoggedIn) {
            // User was automatically logged in, redirect to home
            setTimeout(() => {
              // Regular users always go to home page after registration
              navigate("/");
            }, 1500);
          } else {
            // Auto-login failed, reset form and switch to login
            setFormData({
              email: formData.email, // Keep email for convenience
              password: "",
              fullname: "",
              phone: "",
              gender: "",
              dateOfBirth: "",
              address: "",
              confirmPassword: "",
            });
            // Auto switch to login form after successful registration
            setTimeout(() => {
              setIsLogin(true);
              setSuccessMessage("");
            }, 2000);
          }
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
          {/* {(USE_MOCK_SERVICES || USE_MOCK_ADMIN) && (
            <div className="mock-credentials-info">
              <FontAwesomeIcon icon={faInfoCircle} />
              <div>
                <p>
                  <strong>Mock Credentials for Admin Access:</strong>
                </p>
                <p>Admin: admin@example.com / admin123</p>
                <p>Staff: staff@example.com / staff123</p>
              </div>
            </div>
          )} */}

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
            <h2>{isLogin ? "Đăng Nhập" : "Tạo Tài Khoản Mới"}</h2>

            {loginError && (
              <div className="error-alert">{loginError}</div>
            )}

            {successMessage && (
              <div className="success-alert">{successMessage}</div>
            )}

            {/* Login form with horizontal layout for email and password */}
            {isLogin && (
              <div className="login-form-horizontal">
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email">
                    <FontAwesomeIcon icon={faEnvelope} /> Địa Chỉ
                    Email
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

                {/* Password Field */}
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
                      className="password-toggle"
                      onClick={togglePasswordVisibility}>
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <div className="error-text">
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Registration form with vertical layout */}
            {!isLogin && (
              <>
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email">
                    <FontAwesomeIcon icon={faEnvelope} /> Địa Chỉ
                    Email
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

                {/* Full Name Field - Registration Only */}
                <div className="form-group">
                  <label htmlFor="fullname">
                    <FontAwesomeIcon icon={faUser} /> Họ và Tên
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className={errors.fullname ? "error" : ""}
                  />
                  {errors.fullname && (
                    <div className="error-text">
                      {errors.fullname}
                    </div>
                  )}
                </div>

                {/* Phone Field - Registration Only */}
                <div className="form-group">
                  <label htmlFor="phone">
                    <FontAwesomeIcon icon={faPhone} /> Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "error" : ""}
                    placeholder="Ví dụ: +84123456789"
                    onFocus={handlePhoneFocus}
                  />
                  {errors.phone && (
                    <div className="error-text">{errors.phone}</div>
                  )}
                </div>

                {/* Gender Field - Registration Only */}
                <div className="form-group">
                  <label htmlFor="gender">
                    <FontAwesomeIcon icon={faVenus} /> Giới Tính
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={errors.gender ? "error" : ""}>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                  {errors.gender && (
                    <div className="error-text">{errors.gender}</div>
                  )}
                </div>

                {/* Date of Birth Field - Registration Only */}
                <div className="form-group">
                  <label htmlFor="dateOfBirth">
                    <FontAwesomeIcon icon={faCalendar} /> Ngày Sinh
                    (phải từ 15 tuổi trở lên)
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={errors.dateOfBirth ? "error" : ""}
                    max={(() => {
                      const today = new Date();
                      const maxDate = new Date(
                        today.getFullYear() - 15,
                        today.getMonth(),
                        today.getDate()
                      );
                      return maxDate.toISOString().split("T")[0];
                    })()}
                  />
                  {errors.dateOfBirth && (
                    <div className="error-text">
                      {errors.dateOfBirth}
                    </div>
                  )}
                </div>

                {/* Address Field - Registration Only */}
                <div className="form-group">
                  <label htmlFor="address">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Địa Chỉ
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "error" : ""}
                    rows="3"
                    placeholder="Nhập địa chỉ đầy đủ"
                  />
                  {errors.address && (
                    <div className="error-text">{errors.address}</div>
                  )}
                </div>

                {/* Password Field */}
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
                      className="password-toggle"
                      onClick={togglePasswordVisibility}>
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <div className="error-text">
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field - Registration Only */}
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <FontAwesomeIcon icon={faLock} /> Xác Nhận Mật
                    Khẩu
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`password-input-with-toggle ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleConfirmPasswordVisibility}>
                      <FontAwesomeIcon
                        icon={
                          showConfirmPassword ? faEyeSlash : faEye
                        }
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="error-text">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              className={`btn btn-primary ${
                isLoading ? "loading" : ""
              }`}
              disabled={isLoading}>
              {isLoading
                ? "Đang xử lý..."
                : isLogin
                ? "Đăng Nhập"
                : "Đăng Ký"}
            </button>

            {isLogin && (
              <div className="forgot-password">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div>
            )}

            <div className="form-footer">
              <p>
                {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  type="button"
                  className="switch-form-btn"
                  onClick={toggleForm}>
                  {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
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

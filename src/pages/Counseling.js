import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faFilter,
  faSearch,
  faStar,
  faPhone,
  faEnvelope,
  faCheck,
  faClock,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import "./Counseling.css";

// Mock counselor data
const counselorsData = [
  {
    id: 1,
    name: "TS. Nguyễn Thị Hương",
    title: "Nhà Tâm Lý Học Lâm Sàng",
    specialties: [
      "Tư Vấn Thanh Thiếu Niên",
      "Lạm Dụng Chất Gây Nghiện",
      "Trị Liệu Gia Đình",
    ],
    experience: "12 năm",
    bio: "TS. Hương chuyên về làm việc với thanh thiếu niên và gia đình bị ảnh hưởng bởi lạm dụng chất gây nghiện. Phương pháp của cô kết hợp liệu pháp nhận thức-hành vi với công việc hệ thống gia đình.",
    rating: 4.8,
    reviews: 56,
    image: "https://placehold.co/300x300/e8f5e9/2D7DD2?text=NH",
    availableDays: ["Thứ Hai", "Thứ Ba", "Thứ Năm"],
    availableTimeSlots: {
      "Thứ Hai": ["9:00 - 10:30", "13:00 - 14:30", "15:00 - 16:30"],
      "Thứ Ba": ["10:00 - 11:30", "14:00 - 15:30"],
      "Thứ Năm": ["9:00 - 10:30", "11:00 - 12:30", "14:00 - 15:30"],
    },
  },
  {
    id: 2,
    name: "Trần Văn Minh, LCSW",
    title: "Nhân Viên Xã Hội Lâm Sàng",
    specialties: [
      "Trị Liệu Nhóm",
      "Hỗ Trợ Phục Hồi",
      "Can Thiệp Khủng Hoảng",
    ],
    experience: "8 năm",
    bio: "Minh điều phối các nhóm hỗ trợ phục hồi và cung cấp tư vấn cá nhân với trọng tâm là xây dựng kỹ năng đối phó và ngăn ngừa tái phát.",
    rating: 4.6,
    reviews: 42,
    image: "https://placehold.co/300x300/e8f5e9/2D7DD2?text=VM",
    availableDays: ["Thứ Tư", "Thứ Sáu", "Thứ Bảy"],
    availableTimeSlots: {
      "Thứ Tư": ["8:30 - 10:00", "10:30 - 12:00", "15:00 - 16:30"],
      "Thứ Sáu": ["9:00 - 10:30", "13:30 - 15:00"],
      "Thứ Bảy": ["8:30 - 10:00", "10:30 - 12:00"],
    },
  },
  {
    id: 3,
    name: "TS. Lê Thị Mai",
    title: "Bác Sĩ Tâm Thần",
    specialties: [
      "Chẩn Đoán Kép",
      "Quản Lý Thuốc",
      "Sức Khỏe Tâm Thần",
    ],
    experience: "15 năm",
    bio: "TS. Mai chuyên điều trị cho bệnh nhân có rối loạn đồng thời, cung cấp cả quản lý thuốc và hỗ trợ trị liệu.",
    rating: 4.9,
    reviews: 78,
    image: "https://placehold.co/300x300/e8f5e9/2D7DD2?text=LM",
    availableDays: ["Thứ Hai", "Thứ Tư", "Thứ Sáu"],
    availableTimeSlots: {
      "Thứ Hai": ["8:00 - 9:30", "10:00 - 11:30", "14:00 - 15:30"],
      "Thứ Tư": ["9:00 - 10:30", "13:00 - 14:30"],
      "Thứ Sáu": ["8:00 - 9:30", "10:00 - 11:30", "15:00 - 16:30"],
    },
  },
  {
    id: 4,
    name: "Phạm Văn Hùng, LPC",
    title: "Cố Vấn Chuyên Nghiệp",
    specialties: [
      "Tư Vấn Người Trưởng Thành Trẻ",
      "Phục Hồi Sau Nghiện",
      "Chấn Thương Tâm Lý",
    ],
    experience: "6 năm",
    bio: "Hùng chủ yếu làm việc với người trưởng thành trẻ đang đối mặt với các vấn đề sử dụng chất gây nghiện, tập trung vào xây dựng khả năng phục hồi và cơ chế đối phó lành mạnh.",
    rating: 4.7,
    reviews: 35,
    image: "https://placehold.co/300x300/e8f5e9/2D7DD2?text=PH",
    availableDays: ["Thứ Ba", "Thứ Năm", "Thứ Bảy"],
    availableTimeSlots: {
      "Thứ Ba": ["9:00 - 10:30", "11:00 - 12:30", "15:00 - 16:30"],
      "Thứ Năm": ["10:00 - 11:30", "13:30 - 15:00"],
      "Thứ Bảy": ["9:00 - 10:30", "11:00 - 12:30"],
    },
  },
];

const Counseling = () => {
  const [activeTab, setActiveTab] = useState("profiles");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [filteredCounselors, setFilteredCounselors] =
    useState(counselorsData);

  // Booking state
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingForm, setBookingForm] = useState({
    email: "",
    phone: "",
    reason: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Get all unique specialties from counselors
  const allSpecialties = [
    ...new Set(counselorsData.flatMap((c) => c.specialties)),
  ];

  // Handle search and filter
  const handleSearch = () => {
    let filtered = counselorsData;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.bio.toLowerCase().includes(query) ||
          c.specialties.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((c) =>
        c.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredCounselors(filtered);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm({
      ...bookingForm,
      [name]: value,
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Validate booking form
  const validateForm = () => {
    const errors = {};

    if (!bookingForm.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!bookingForm.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc";
    }

    if (!bookingForm.reason.trim()) {
      errors.reason = "Lý do thăm khám là bắt buộc";
    }

    if (!selectedDate) {
      errors.date = "Vui lòng chọn ngày";
    }

    if (!selectedTime) {
      errors.time = "Vui lòng chọn giờ";
    }

    return errors;
  };

  // Handle booking submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Here you would typically send this to your backend
    console.log("Booking submitted:", {
      counselor: selectedCounselor.name,
      date: selectedDate,
      time: selectedTime,
      ...bookingForm,
    });

    // Show confirmation
    setBookingConfirmed(true);
  };

  // Generate available dates (next 14 days)
  const getAvailableDates = (counselor) => {
    if (!counselor) return [];

    const dates = [];
    const today = new Date();
    const availableDaysOfWeek = counselor.availableDays.map((day) => {
      const days = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      return days.indexOf(day);
    });

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      if (availableDaysOfWeek.includes(date.getDay())) {
        const dayName = [
          "Chủ Nhật",
          "Thứ Hai",
          "Thứ Ba",
          "Thứ Tư",
          "Thứ Năm",
          "Thứ Sáu",
          "Thứ Bảy",
        ][date.getDay()];

        dates.push({
          date: date,
          dayName: dayName,
          formatted: date.toLocaleDateString("vi-VN", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        });
      }
    }

    return dates;
  };

  // Initiate booking for a specific counselor
  const initiateBooking = (counselor) => {
    setSelectedCounselor(counselor);
    setActiveTab("booking");
    setBookingConfirmed(false);

    // Reset form
    setSelectedDate("");
    setSelectedTime("");
    setBookingForm({
      email: "",
      phone: "",
      reason: "",
    });
    setFormErrors({});

    // Set available dates for the selected counselor
    const dates = getAvailableDates(counselor);
    setAvailableDates(dates);
    setAvailableTimeSlots([]);
  };

  // Handle date selection
  const handleDateSelection = (dateObj) => {
    setSelectedDate(dateObj.formatted);
    setSelectedTime("");

    // Get available time slots for the selected date
    if (selectedCounselor && dateObj.dayName) {
      setAvailableTimeSlots(
        selectedCounselor.availableTimeSlots[dateObj.dayName] || []
      );
    }
  };

  return (
    <div className="counseling-page">
      <div className="page-header secondary-bg">
        <div className="container">
          <h1>Dịch Vụ Tư Vấn</h1>
          <p>
            Kết nối với các tư vấn viên chuyên nghiệp chuyên về phòng
            ngừa và điều trị lạm dụng chất gây nghiện
          </p>
        </div>
      </div>

      <div className="container">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${
              activeTab === "profiles" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profiles")}>
            Đội Ngũ Tư Vấn Viên
          </button>
          {selectedCounselor && (
            <button
              className={`tab-btn ${
                activeTab === "booking" ? "active" : ""
              }`}
              onClick={() => setActiveTab("booking")}>
              Đặt Lịch Hẹn
            </button>
          )}
        </div>

        {activeTab === "profiles" && (
          <div className="profiles-section">
            <div className="search-filters">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc chuyên môn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                />
                <button onClick={handleSearch}>
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>

              <div className="specialty-filter">
                <span className="filter-label">
                  <FontAwesomeIcon icon={faFilter} /> Lọc theo chuyên
                  môn:
                </span>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setTimeout(handleSearch, 0);
                  }}>
                  <option value="all">Tất Cả Chuyên Môn</option>
                  {allSpecialties.map((specialty, index) => (
                    <option key={index} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="counselors-grid">
              {filteredCounselors.length > 0 ? (
                filteredCounselors.map((counselor) => (
                  <div
                    className="counselor-card card"
                    key={counselor.id}>
                    <div className="counselor-header">
                      <div className="counselor-image">
                        <img
                          src={counselor.image}
                          alt={counselor.name}
                        />
                      </div>
                      <div className="counselor-info">
                        <h3>{counselor.name}</h3>
                        <p className="counselor-title">
                          {counselor.title}
                        </p>
                        <div className="counselor-rating">
                          <FontAwesomeIcon
                            icon={faStar}
                            className="star-icon"
                          />
                          <span>{counselor.rating}</span>
                          <span className="review-count">
                            ({counselor.reviews} đánh giá)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="counselor-specialties">
                      {counselor.specialties.map(
                        (specialty, index) => (
                          <span className="specialty-tag" key={index}>
                            {specialty}
                          </span>
                        )
                      )}
                    </div>

                    <p className="counselor-bio">{counselor.bio}</p>

                    <div className="counselor-experience">
                      <strong>Kinh nghiệm:</strong>{" "}
                      {counselor.experience}
                    </div>

                    <div className="counselor-availability">
                      <strong>Lịch làm việc:</strong>{" "}
                      {counselor.availableDays.join(", ")}
                    </div>

                    <button
                      className="btn btn-primary book-btn"
                      onClick={() => initiateBooking(counselor)}>
                      <FontAwesomeIcon icon={faCalendarAlt} /> Đặt
                      Lịch Hẹn
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <h3>Không tìm thấy tư vấn viên</h3>
                  <p>Hãy điều chỉnh tiêu chí tìm kiếm của bạn</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "booking" && selectedCounselor && (
          <div className="booking-section">
            {!bookingConfirmed ? (
              <>
                <div className="selected-counselor card">
                  <div className="counselor-quick-info">
                    <img
                      src={selectedCounselor.image}
                      alt={selectedCounselor.name}
                    />
                    <div>
                      <h3>Đặt lịch với {selectedCounselor.name}</h3>
                      <p>{selectedCounselor.title}</p>
                    </div>
                  </div>
                </div>

                <div className="booking-form-container">
                  <div className="availability-selection card">
                    <h3>Thời Gian Tư Vấn</h3>

                    <div className="date-selector">
                      <h4>
                        <FontAwesomeIcon icon={faCalendarDay} /> Chọn
                        Ngày
                      </h4>
                      <div className="dates-grid">
                        {availableDates.map((dateObj, index) => (
                          <button
                            key={index}
                            className={`date-btn ${
                              selectedDate === dateObj.formatted
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleDateSelection(dateObj)
                            }>
                            {dateObj.formatted}
                          </button>
                        ))}
                      </div>
                      {formErrors.date && (
                        <div className="error-text">
                          {formErrors.date}
                        </div>
                      )}
                    </div>

                    {selectedDate && (
                      <div className="time-selector">
                        <h4>
                          <FontAwesomeIcon icon={faClock} /> Chọn Giờ
                        </h4>
                        <div className="times-grid">
                          {availableTimeSlots.map((time, index) => (
                            <button
                              key={index}
                              className={`time-btn ${
                                selectedTime === time
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => setSelectedTime(time)}>
                              {time}
                            </button>
                          ))}
                        </div>
                        {formErrors.time && (
                          <div className="error-text">
                            {formErrors.time}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedDate && selectedTime && (
                    <form
                      className="booking-form card"
                      onSubmit={handleBookingSubmit}>
                      <h3>Thông Tin Liên Hệ</h3>

                      <div className="form-group">
                        <label htmlFor="email">Địa Chỉ Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={bookingForm.email}
                          onChange={handleInputChange}
                          className={formErrors.email ? "error" : ""}
                        />
                        {formErrors.email && (
                          <div className="error-text">
                            {formErrors.email}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Số Điện Thoại</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={bookingForm.phone}
                          onChange={handleInputChange}
                          className={formErrors.phone ? "error" : ""}
                        />
                        {formErrors.phone && (
                          <div className="error-text">
                            {formErrors.phone}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="reason">
                          Lý Do Thăm Khám
                        </label>
                        <textarea
                          id="reason"
                          name="reason"
                          rows="3"
                          value={bookingForm.reason}
                          onChange={handleInputChange}
                          className={
                            formErrors.reason ? "error" : ""
                          }></textarea>
                        {formErrors.reason && (
                          <div className="error-text">
                            {formErrors.reason}
                          </div>
                        )}
                      </div>

                      <div className="booking-summary">
                        <h4>Tóm Tắt Lịch Hẹn</h4>
                        <div className="summary-details">
                          <div className="summary-item">
                            <strong>Tư vấn viên:</strong>{" "}
                            {selectedCounselor.name}
                          </div>
                          <div className="summary-item">
                            <strong>Ngày:</strong> {selectedDate}
                          </div>
                          <div className="summary-item">
                            <strong>Giờ:</strong> {selectedTime}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary submit-btn">
                        Xác Nhận Đặt Lịch
                      </button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="booking-confirmation card">
                <div className="confirmation-icon">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <h2>Đã Xác Nhận Đặt Lịch!</h2>
                <p>
                  Cuộc hẹn của bạn với {selectedCounselor.name} đã
                  được lên lịch vào:
                </p>
                <div className="confirmation-details">
                  <p className="detail-item">
                    <strong>Ngày:</strong> {selectedDate}
                  </p>
                  <p className="detail-item">
                    <strong>Giờ:</strong> {selectedTime}
                  </p>
                </div>
                <p className="confirmation-message">
                  Email xác nhận đã được gửi đến {bookingForm.email}.
                  Vui lòng kiểm tra hộp thư của bạn để biết chi tiết.
                </p>
                <div className="contact-info">
                  <p>
                    Nếu bạn cần đổi lịch hoặc hủy, vui lòng liên hệ
                    với chúng tôi:
                  </p>
                  <div className="contact-methods">
                    <a
                      href="tel:+1234567890"
                      className="contact-method">
                      <FontAwesomeIcon icon={faPhone} /> (123)
                      456-7890
                    </a>
                    <a
                      href="mailto:contact@brightchoice.org"
                      className="contact-method">
                      <FontAwesomeIcon icon={faEnvelope} />{" "}
                      contact@brightchoice.org
                    </a>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab("profiles")}>
                  Quay Lại Đội Ngũ Tư Vấn Viên
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Counseling;

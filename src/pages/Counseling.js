import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faPhone,
  faEnvelope,
  faCheck,
  faClock,
  faCalendarDay,
  faSpinner,
  faTimesCircle,
  faUser,
  faInfoCircle,
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
  const [activeTab, setActiveTab] = useState("booking");
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentWeek, setCurrentWeek] = useState([]);
  const [nextWeek, setNextWeek] = useState([]);
  const [availableConsultants, setAvailableConsultants] = useState(
    []
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs for scrolling
  const timeSelectRef = useRef(null);
  const consultantsRef = useRef(null);
  const bookingFormRef = useRef(null);
  const confirmationRef = useRef(null);

  // Get all unique specialties from counselors
  const allSpecialties = [
    ...new Set(counselorsData.flatMap((c) => c.specialties)),
  ];

  // Helper function to format date as "Day Date" (e.g. "Mon 3")
  const formatDateShort = (date) => {
    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const dayNum = date.getDate();
    const formatted = `${day} ${dayNum}`;
    return formatted;
  };

  // Helper function to check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Helper function to check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Memoize the generateTimeSlots function
  const memoizedGenerateTimeSlots = React.useCallback(() => {
    const slots = [];
    const now = new Date();

    // For today, implement strict time slot filtering
    if (selectedDate && isToday(new Date(selectedDate))) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Calculate the next possible time slot (current hour + 2 at minimum)
      // If we're at 8:00, the earliest slot should be 10:00
      let minimumHour = currentHour + 2;

      console.log(
        `Current time: ${currentHour}:${currentMinute}, minimum bookable hour: ${minimumHour}:00`
      );

      for (let hour = 8; hour < 20; hour++) {
        const formattedStartTime = new Date().setHours(hour, 0, 0, 0);
        const startTimeStr = new Date(
          formattedStartTime
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const formattedEndTime = new Date().setHours(
          hour + 1,
          0,
          0,
          0
        );
        const endTimeStr = new Date(
          formattedEndTime
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        // Check if this time slot is at least 2 hours in the future
        const isPast = hour < minimumHour;

        const timeSlot = {
          id: hour - 8,
          display: `${startTimeStr} - ${endTimeStr}`,
          start: hour,
          end: hour + 1,
          isPast: isPast,
        };

        slots.push(timeSlot);
      }
    } else {
      // For future dates, show all time slots
      for (let hour = 8; hour < 20; hour++) {
        const formattedStartTime = new Date().setHours(hour, 0, 0, 0);
        const startTimeStr = new Date(
          formattedStartTime
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const formattedEndTime = new Date().setHours(
          hour + 1,
          0,
          0,
          0
        );
        const endTimeStr = new Date(
          formattedEndTime
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const timeSlot = {
          id: hour - 8,
          display: `${startTimeStr} - ${endTimeStr}`,
          start: hour,
          end: hour + 1,
          isPast: false,
        };

        slots.push(timeSlot);
      }
    }

    return slots;
  }, [selectedDate]);

  // Replace the original generateTimeSlots function
  const generateTimeSlots = memoizedGenerateTimeSlots;

  // Generate current week and next week dates
  useEffect(() => {
    const today = new Date();
    console.log("Today's date:", today.toDateString());
    const currentWeekDates = [];
    const nextWeekDates = [];

    // Start with today
    const startDate = new Date(today);

    // Generate current week (from today to end of week)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // Stop when we reach next week
      if (date.getDay() === 0 && i > 0) break;

      const isCurrentDay = isToday(date);
      if (isCurrentDay) {
        console.log("Marking as today:", date.toDateString());
      }

      currentWeekDates.push({
        date: date,
        formatted: formatDateShort(date),
        isToday: isCurrentDay,
        isPast: isPastDate(date),
        dayName: date.toLocaleDateString("en-US", {
          weekday: "long",
        }),
      });
    }

    // Generate next week (from next Sunday to next Saturday)
    const nextSunday = new Date(startDate);
    while (nextSunday.getDay() !== 0) {
      nextSunday.setDate(nextSunday.getDate() + 1);
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(nextSunday);
      date.setDate(nextSunday.getDate() + i);

      nextWeekDates.push({
        date: date,
        formatted: formatDateShort(date),
        isToday: false,
        isPast: false,
        dayName: date.toLocaleDateString("en-US", {
          weekday: "long",
        }),
      });
    }

    setCurrentWeek(currentWeekDates);
    setNextWeek(nextWeekDates);
  }, []);

  // Update current time every second for the clock display
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for smooth clock display

    return () => clearInterval(clockTimer);
  }, []);

  // Handle time slot updates separately at a longer interval
  useEffect(() => {
    // Initial update of time slots
    if (selectedDate && isToday(new Date(selectedDate))) {
      setAvailableTimeSlots(memoizedGenerateTimeSlots());
    }

    // Update time slots every 30 seconds
    const timeSlotTimer = setInterval(() => {
      // Always refresh time slots for today to ensure past slots disappear
      if (selectedDate && isToday(new Date(selectedDate))) {
        const updatedSlots = memoizedGenerateTimeSlots();
        console.log(
          "Updating time slots:",
          updatedSlots.length,
          "slots available"
        );
        setAvailableTimeSlots(updatedSlots);

        // If the currently selected time is no longer available, clear it
        if (selectedTime) {
          const isTimeStillAvailable = updatedSlots.some(
            (slot) => slot.display === selectedTime
          );

          if (!isTimeStillAvailable) {
            console.log(
              "Selected time is no longer available:",
              selectedTime
            );
            setSelectedTime("");
            setSelectedCounselor(null);
          }
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timeSlotTimer);
  }, [selectedDate, memoizedGenerateTimeSlots, selectedTime]);

  // Format current time as HH:MM:SS
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
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

    if (!selectedCounselor) {
      errors.counselor = "Vui lòng chọn tư vấn viên";
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

    // Check if user has reached maximum bookings (1 per week)
    // In a real app, this would be checked against the database
    const hasReachedMaxBookings = false; // Simulate this check

    if (hasReachedMaxBookings) {
      setErrorMessage(
        "Bạn đã đạt đến số lượng đặt lịch tối đa trong tuần này (1 lịch hẹn)"
      );
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Here you would typically send this to your backend
      console.log("Booking submitted:", {
        counselor: selectedCounselor.name,
        date: selectedDate,
        time: selectedTime,
        ...bookingForm,
      });

      setIsLoading(false);
      // Show confirmation
      setBookingConfirmed(true);
    }, 1000);
  };

  // Handle date selection
  const handleDateSelection = (dateObj) => {
    // Format the date consistently
    const formattedDate = dateObj.formatted;
    console.log("Selected date:", formattedDate);

    setSelectedDate(formattedDate);
    setSelectedTime("");
    setErrorMessage("");
    setSelectedCounselor(null);

    // Force regeneration of time slots with a slight delay to ensure state update
    setTimeout(() => {
      const slots = memoizedGenerateTimeSlots();
      console.log(
        `Generated ${slots.length} time slots for ${formattedDate}`
      );
      setAvailableTimeSlots(slots);
    }, 10);

    // Filter available consultants for this date
    filterAvailableConsultants(dateObj);

    // Scroll to time selector after a short delay
    setTimeout(() => {
      if (timeSelectRef.current) {
        timeSelectRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 300);
  };

  // Filter consultants available on selected date and time
  const filterAvailableConsultants = (dateObj) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In a real implementation, you would fetch this from an API
      // For now, we'll just filter the mock data
      const dayName = dateObj.dayName;
      const availableConsultants = counselorsData.filter(
        (counselor) => counselor.availableDays.includes(dayName)
      );

      setAvailableConsultants(availableConsultants);
      setIsLoading(false);
    }, 500);
  };

  // Handle time slot selection
  const handleTimeSelection = (timeSlot) => {
    setSelectedTime(timeSlot.display);
    setErrorMessage("");

    // Scroll to consultants section after a short delay
    setTimeout(() => {
      if (consultantsRef.current) {
        consultantsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 300);
  };

  // Scroll to booking form when consultant is selected
  useEffect(() => {
    if (selectedCounselor && bookingFormRef.current) {
      setTimeout(() => {
        bookingFormRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 300);
    }
  }, [selectedCounselor]);

  // Scroll to confirmation when booking is confirmed
  useEffect(() => {
    if (bookingConfirmed && confirmationRef.current) {
      setTimeout(() => {
        confirmationRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [bookingConfirmed]);

  // Function to check if we can proceed to booking
  const canProceedToBooking = () => {
    return selectedDate && selectedTime && selectedCounselor;
  };

  // Function to handle proceed to booking
  const handleProceedToBooking = () => {
    // Scroll to the booking form
    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  return (
    <div className="counseling-page">
      <div className="page-header secondary-bg fade-in">
        <div className="container">
          <h1>Dịch Vụ Tư Vấn</h1>
          <p>
            Đặt lịch hẹn tư vấn trực tuyến với các tư vấn viên chuyên
            nghiệp
          </p>
        </div>
      </div>

      <div className="container">
        <div className="tab-navigation fade-in delay-100">
          <button className="tab-btn active">Đặt Lịch Hẹn</button>
        </div>

        <div className="booking-section">
          {!bookingConfirmed ? (
            <>
              <div className="booking-layout fade-in delay-200">
                {/* Left side - Time selection */}
                <div className="availability-selection card">
                  <h3>Chọn Thời Gian Tư Vấn</h3>

                  <div className="date-selector">
                    <h4>
                      <FontAwesomeIcon icon={faCalendarDay} /> Chọn
                      Ngày
                    </h4>

                    {errorMessage && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} />{" "}
                        {errorMessage}
                      </div>
                    )}

                    <div className="calendar-wrapper fade-in delay-300">
                      <div className="week-header">Tuần Này</div>
                      <div className="dates-grid">
                        {currentWeek.map((dateObj, index) => (
                          <button
                            key={index}
                            className={`date-btn 
                              ${dateObj.isPast ? "past" : ""} 
                              ${dateObj.isToday ? "today" : ""}
                              ${
                                selectedDate === dateObj.formatted
                                  ? "selected"
                                  : ""
                              }
                            `}
                            onClick={() =>
                              !dateObj.isPast &&
                              handleDateSelection(dateObj)
                            }
                            disabled={dateObj.isPast}>
                            <span className="day-name">
                              {dateObj.formatted.split(" ")[0]}
                            </span>
                            <span className="day-number">
                              {dateObj.formatted.split(" ")[1]}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="week-header">Tuần Sau</div>
                      <div className="dates-grid">
                        {nextWeek.map((dateObj, index) => (
                          <button
                            key={index}
                            className={`date-btn 
                              ${dateObj.isPast ? "past" : ""} 
                              ${dateObj.isToday ? "today" : ""}
                              ${
                                selectedDate === dateObj.formatted
                                  ? "selected"
                                  : ""
                              }
                            `}
                            onClick={() =>
                              handleDateSelection(dateObj)
                            }>
                            <span className="day-name">
                              {dateObj.formatted.split(" ")[0]}
                            </span>
                            <span className="day-number">
                              {dateObj.formatted.split(" ")[1]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formErrors.date && (
                      <div className="error-text">
                        {formErrors.date}
                      </div>
                    )}
                  </div>

                  {selectedDate && (
                    <div
                      className="time-selector fade-in"
                      ref={timeSelectRef}>
                      <h4>
                        <FontAwesomeIcon icon={faClock} /> Chọn Giờ
                      </h4>
                      <div className="times-grid">
                        {availableTimeSlots.map((timeSlot, index) => (
                          <button
                            key={index}
                            className={`time-btn ${
                              selectedTime === timeSlot.display
                                ? "selected"
                                : ""
                            } ${timeSlot.isPast ? "past" : ""}`}
                            onClick={() =>
                              !timeSlot.isPast &&
                              handleTimeSelection(timeSlot)
                            }
                            disabled={timeSlot.isPast}>
                            {timeSlot.display}
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

                {/* Right side - Selection summary and confirmation */}
                <div className="selection-summary-card">
                  <h3>Thông Tin Đã Chọn</h3>

                  <div className="selection-summary fade-in">
                    <div className="selection-item current-time">
                      <FontAwesomeIcon icon={faClock} />
                      <span>Thời gian hiện tại:</span>{" "}
                      {formatCurrentTime()}
                    </div>

                    {selectedDate ? (
                      <div className="selection-item">
                        <FontAwesomeIcon icon={faCalendarDay} />
                        <span>Ngày:</span> {selectedDate}
                      </div>
                    ) : (
                      <div className="selection-item">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span>Ngày:</span> Chưa chọn
                      </div>
                    )}

                    {selectedTime ? (
                      <div className="selection-item">
                        <FontAwesomeIcon icon={faClock} />
                        <span>Giờ đã chọn:</span> {selectedTime}
                      </div>
                    ) : (
                      <div className="selection-item">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span>Giờ:</span> Chưa chọn
                      </div>
                    )}

                    {selectedCounselor ? (
                      <div className="selection-item">
                        <FontAwesomeIcon icon={faUser} />
                        <span>Tư vấn viên:</span>{" "}
                        {selectedCounselor.name}
                      </div>
                    ) : (
                      <div className="selection-item">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span>Tư vấn viên:</span> Chưa chọn
                      </div>
                    )}
                  </div>

                  <button
                    className="confirmation-btn"
                    disabled={!canProceedToBooking()}
                    onClick={handleProceedToBooking}>
                    {selectedCounselor ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        Đặt Lịch Hẹn
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Vui lòng chọn đầy đủ thông tin
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Consultants selection */}
              {selectedDate && selectedTime && (
                <div
                  className="available-consultants card fade-in"
                  ref={consultantsRef}>
                  <h3>Tư Vấn Viên Khả Dụng</h3>

                  {isLoading ? (
                    <div className="loading-spinner">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Đang tải danh sách tư vấn viên...</span>
                    </div>
                  ) : availableConsultants.length > 0 ? (
                    <div className="consultants-grid">
                      {availableConsultants.map((consultant) => (
                        <div
                          key={consultant.id}
                          className={`consultant-card ${
                            selectedCounselor?.id === consultant.id
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedCounselor(consultant)
                          }>
                          <div className="consultant-image">
                            <img
                              src={consultant.image}
                              alt={consultant.name}
                            />
                          </div>
                          <div className="consultant-details">
                            <h4>{consultant.name}</h4>
                            <p>{consultant.title}</p>
                            <div className="consultant-rating">
                              <FontAwesomeIcon
                                icon={faStar}
                                className="star-icon"
                              />
                              <span>{consultant.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-consultants">
                      <FontAwesomeIcon icon={faTimesCircle} />
                      <p>
                        Không có tư vấn viên khả dụng vào thời gian
                        này
                      </p>
                    </div>
                  )}

                  {formErrors.counselor && (
                    <div className="error-text">
                      {formErrors.counselor}
                    </div>
                  )}
                </div>
              )}

              {/* Booking form */}
              {selectedCounselor && (
                <form
                  className="booking-form card fade-in"
                  onSubmit={handleBookingSubmit}
                  ref={bookingFormRef}>
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
                    <label htmlFor="reason">Lý Do Thăm Khám</label>
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
                    {isLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin /> Đang
                        xử lý...
                      </>
                    ) : (
                      "Đặt Lịch Hẹn"
                    )}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div
              className="booking-confirmation card fade-in"
              ref={confirmationRef}>
              <div className="confirmation-icon">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <h2>Đã Đặt Lịch Thành Công!</h2>
              <p>
                Bạn đã đặt lịch thành công với{" "}
                {selectedCounselor.name} vào:
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
                Bạn đã đặt lịch hẹn thành công với{" "}
                {selectedCounselor.name} vào {selectedDate} lúc{" "}
                {selectedTime}. Đang chờ xác nhận từ tư vấn viên.
              </p>
              <div className="appointment-status">
                <span className="status-badge pending">
                  Đang chờ xác nhận
                </span>
              </div>
              <div className="contact-info">
                <p>
                  Nếu bạn cần đổi lịch hoặc hủy, vui lòng liên hệ với
                  chúng tôi:
                </p>
                <div className="contact-methods">
                  <a
                    href="tel:+1234567890"
                    className="contact-method">
                    <FontAwesomeIcon icon={faPhone} /> (123) 456-7890
                  </a>
                  <a
                    href="mailto:contact@brightchoice.org"
                    className="contact-method">
                    <FontAwesomeIcon icon={faEnvelope} />{" "}
                    contact@brightchoice.org
                  </a>
                </div>
              </div>
              <div className="action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setBookingConfirmed(false);
                    setSelectedDate("");
                    setSelectedTime("");
                    setSelectedCounselor(null);
                    setBookingForm({
                      email: "",
                      phone: "",
                      reason: "",
                    });
                  }}>
                  Đặt Lịch Hẹn Mới
                </button>
                <button className="btn btn-outline cancel-btn">
                  Hủy Lịch Hẹn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Counseling;

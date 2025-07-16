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
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import "./Counseling.css";

const Counseling = () => {
  const { currentUser, isAuthenticated, isConsultant } = useAuth();
  const [activeTab, setActiveTab] = useState("booking");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  // Helper function to safely get lowercase status
  const getStatusLower = (status) => {
    if (!status) return "";

    // Handle numeric status codes
    if (typeof status === "number") {
      switch (status) {
        case 0:
          return "available";
        case 1:
          return "booked";
        case 2:
          return "pending";
        case 3:
          return "confirmed";
        case 4:
          return "rejected";
        case 5:
          return "cancelled";
        default:
          return "unknown";
      }
    }

    // Handle string status
    if (typeof status === "string") {
      return status.toLowerCase();
    }

    // Handle any other type by converting to string first
    return String(status).toLowerCase();
  };

  // Real data from API
  const [availableSlots, setAvailableSlots] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);

  // Booking state
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingForm, setBookingForm] = useState({
    note: "",
    attachments: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentWeek, setCurrentWeek] = useState([]);
  const [nextWeek, setNextWeek] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs for scrolling
  const timeSelectRef = useRef(null);
  const consultantsRef = useRef(null);
  const bookingFormRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAvailableSlots();
      // Only load appointments for regular users, not consultants
      if (!isConsultant()) {
        loadMyAppointments();
      }
    }
    generateWeeks();

    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [isAuthenticated, isConsultant]);

  const generateWeeks = () => {
    const today = new Date();
    const currentWeekDates = [];
    const nextWeekDates = [];

    // Generate current week (next 7 days starting from today)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      currentWeekDates.push({
        date: date,
        formatted: formatDateShort(date),
        isPast: isPastDate(date),
        isToday: isToday(date),
        dateString: date.toISOString().split("T")[0],
      });
    }

    // Generate next week (days 7-14)
    for (let i = 7; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      nextWeekDates.push({
        date: date,
        formatted: formatDateShort(date),
        isPast: false,
        isToday: false,
        dateString: date.toISOString().split("T")[0],
      });
    }

    setCurrentWeek(currentWeekDates);
    setNextWeek(nextWeekDates);
  };

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      let slotsData = [];

      // Try 1: Get all available slots first (no query params)
      try {
        const response =
          await consultationService.getAllAvailableSlots();
        if (response.success && response.data) {
          const allSlots = response.data.data || response.data || [];
          // Filter by date range client-side
          slotsData = allSlots.filter((slot) => {
            const slotDate = slot.workDate || slot.date;
            return slotDate >= startDate && slotDate <= endDate;
          });
        }
      } catch (error) {
        // Silently continue to next attempt
      }

      // Try 2: Search slots with date range
      if (slotsData.length === 0) {
        try {
          const response = await consultationService.searchSlots({
            startDate,
            endDate,
          });
          if (response.success && response.data) {
            slotsData = response.data.data || response.data || [];
          }
        } catch (error) {
          // Silently continue to next attempt
        }
      }

      // Try 3: Get available slots with query params
      if (slotsData.length === 0) {
        try {
          const response =
            await consultationService.getAvailableSlots({
              startDate,
              endDate,
            });
          if (response.success && response.data) {
            slotsData = response.data.data || response.data || [];
          }
        } catch (error) {
          // Silently continue to next attempt
        }
      }

      // Try 4: Public available slots (for users)
      if (slotsData.length === 0) {
        try {
          const response =
            await consultationService.getPublicAvailableSlots({
              startDate,
              endDate,
            });
          if (response.success && response.data) {
            slotsData = response.data.data || response.data || [];
          }
        } catch (error) {
          // Silently continue to next attempt
        }
      }

      // Try 5: Try getMySlots if user is a consultant (for testing)
      if (slotsData.length === 0 && isConsultant()) {
        try {
          const response = await consultationService.getMySlots();
          if (response.success && response.data) {
            const allSlots =
              response.data.data || response.data || [];
            slotsData = allSlots.filter((slot) => {
              const slotDate = slot.workDate || slot.date;
              return slotDate >= startDate && slotDate <= endDate;
            });
          }
        } catch (error) {
          // Silently continue to next attempt
        }
      }

      // Try 6: Debug - get ALL slots regardless of status/filters
      if (slotsData.length === 0) {
        try {
          const response =
            await consultationService.getAllSlotsDebug();
          if (response.success && response.data) {
            const allSlots =
              response.data.data || response.data || [];
            // Filter by date range and show what we have
            slotsData = allSlots.filter((slot) => {
              const slotDate = slot.workDate || slot.date;
              return slotDate >= startDate && slotDate <= endDate;
            });
          }
        } catch (error) {
          // All attempts failed, will show no slots message
        }
      }

      // Ensure slotsData is always an array
      const finalSlotsData = Array.isArray(slotsData)
        ? slotsData
        : [];
      setAvailableSlots(finalSlotsData);

      if (finalSlotsData.length === 0) {
        setErrorMessage(
          "No available slots found. Consultants may not have created any slots yet."
        );
      } else {
        setErrorMessage(""); // Clear any previous error messages
      }
    } catch (err) {
      console.error("Error loading available slots:", err);
      setErrorMessage(
        "Error loading available slots: " + err.message
      );
      // Always set an empty array on error
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyAppointments = async () => {
    // Don't load appointments for consultants - they should use the ConsultTime page
    if (isConsultant()) {
      return;
    }

    // Only try to load appointments if user is properly authenticated
    if (!isAuthenticated || !currentUser) {
      setMyAppointments([]);
      return;
    }

    // Check if we have a valid token
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMyAppointments([]);
      setErrorMessage("Please log in to view your appointments.");
      return;
    }

    try {
      const response =
        await consultationService.getMyAppointmentsWithAgoraToken();
      if (response.success) {
        setMyAppointments(response.data.data || []);
      } else {
        // Handle API errors gracefully
        if (response.error && response.error.includes("401")) {
          setErrorMessage(
            "Your session has expired. Please log in again."
          );
        } else {
          setMyAppointments([]);
        }
      }
    } catch (err) {
      // Handle authentication errors without showing error messages
      if (
        err.message.includes("401") ||
        err.message.includes("403") ||
        err.message.includes("Unauthorized")
      ) {
        setMyAppointments([]);
        setErrorMessage("Please log in to view your appointments.");
      } else {
        setMyAppointments([]);
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load appointments:", err);
        }
      }
    }
  };

  // Helper function to format date as "Day Date" (e.g. "Mon 3")
  const formatDateShort = (date) => {
    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const dayNum = date.getDate();
    return `${day} ${dayNum}`;
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

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!selectedSlot) {
      errors.slot = "Please select a time slot";
    }

    if (bookingForm.note && bookingForm.note.length > 1000) {
      errors.note = "Note cannot exceed 1000 characters";
    }

    return errors;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Check authentication before proceeding
    if (!isAuthenticated || !currentUser) {
      setErrorMessage("Please log in to book appointments.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage(
        "Your session has expired. Please log in again."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const appointmentData = {
        slotId: selectedSlot.id,
        MemberNote: bookingForm.note,
        attachments: bookingForm.attachments,
      };

      // Debug logging to see what data is being sent
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Creating appointment with data:",
          appointmentData
        );
        console.log("Member note being sent:", bookingForm.note);
        console.log("Note length:", bookingForm.note?.length || 0);
      }

      const response = await consultationService.createAppointment(
        appointmentData
      );

      if (response.success) {
        setSuccessMessage("Appointment booked successfully!");

        // Additional debug logging to check response
        if (process.env.NODE_ENV === "development") {
          console.log("Appointment creation response:", response);
          console.log("Created appointment data:", response.data);

          // Test if we can immediately retrieve the appointment
          if (response.data && response.data.id) {
            setTimeout(async () => {
              try {
                const checkResponse =
                  await consultationService.getAppointmentByIdWithAgoraToken(
                    response.data.id
                  );
                console.log(
                  "Immediately retrieved appointment:",
                  checkResponse
                );
                if (checkResponse.success) {
                  console.log("Retrieved appointment note fields:", {
                    note: checkResponse.data.note,
                    appointmentNote:
                      checkResponse.data.appointmentNote,
                    memberNote: checkResponse.data.memberNote,
                    description: checkResponse.data.description,
                  });
                  console.log("Retrieved appointment Agora fields:", {
                    agoraToken: !!checkResponse.data.agoraToken,
                    AgoraToken: !!checkResponse.data.AgoraToken,
                    agoraAppId: !!checkResponse.data.agoraAppId,
                    AgoraAppId: !!checkResponse.data.AgoraAppId,
                    agoraChannelName:
                      !!checkResponse.data.agoraChannelName,
                    ChannelName: !!checkResponse.data.ChannelName,
                  });
                }
              } catch (err) {
                console.log(
                  "Could not immediately retrieve appointment:",
                  err
                );
              }
            }, 2000);
          }
        }

        // Reset the booking form and selection
        resetBooking();

        // Refresh available slots and appointments
        await Promise.all([
          loadAvailableSlots(),
          loadMyAppointments(),
        ]);
      } else {
        // Handle different types of errors
        let errorMsg = response.error || "Failed to book appointment";
        let shouldRefreshSlots = false;

        if (
          errorMsg.includes("401") ||
          errorMsg.includes("Unauthorized")
        ) {
          errorMsg = "Your session has expired. Please log in again.";
        } else if (
          errorMsg.includes("409") ||
          errorMsg.includes("Conflict") ||
          errorMsg.includes("conflict")
        ) {
          shouldRefreshSlots = true; // Refresh slots after conflict
          // More specific conflict messages
          if (errorMsg.toLowerCase().includes("already booked")) {
            errorMsg =
              "This time slot has already been booked by another user. Please select a different time.";
          } else if (errorMsg.toLowerCase().includes("duplicate")) {
            errorMsg =
              "You have already booked an appointment for this time slot.";
          } else if (
            errorMsg.toLowerCase().includes("advance") ||
            errorMsg.toLowerCase().includes("hours")
          ) {
            errorMsg =
              "This appointment is too close to the current time. Please book at least 3 hours in advance.";
          } else if (errorMsg.toLowerCase().includes("unavailable")) {
            errorMsg =
              "This time slot is no longer available. Please refresh and select another time.";
          } else {
            errorMsg =
              "This time slot is no longer available. Please select another time.";
          }
        } else if (errorMsg.includes("400")) {
          errorMsg =
            "Invalid booking request. Please check your selection and try again.";
        } else if (
          errorMsg.includes("403") ||
          errorMsg.includes("Forbidden")
        ) {
          errorMsg =
            "You don't have permission to book this appointment.";
        }

        setErrorMessage(errorMsg);

        // Refresh available slots if there was a conflict
        if (shouldRefreshSlots) {
          // Clear current selection since it's no longer valid
          setSelectedSlot(null);
          setSelectedTime("");
          // Show loading state while refreshing
          setIsLoading(true);
          // Refresh slots to show current availability
          await loadAvailableSlots();
          setIsLoading(false);
        }
      }
    } catch (err) {
      let errorMsg = "Failed to book appointment: " + err.message;
      let shouldRefreshSlots = false;

      if (
        err.message.includes("401") ||
        err.message.includes("Unauthorized")
      ) {
        errorMsg = "Your session has expired. Please log in again.";
      } else if (
        err.message.includes("409") ||
        err.message.includes("Conflict") ||
        err.message.includes("conflict")
      ) {
        shouldRefreshSlots = true; // Refresh slots after conflict
        // More specific conflict messages
        if (err.message.toLowerCase().includes("already booked")) {
          errorMsg =
            "This time slot has already been booked by another user. Please select a different time.";
        } else if (err.message.toLowerCase().includes("duplicate")) {
          errorMsg =
            "You have already booked an appointment for this time slot.";
        } else if (
          err.message.toLowerCase().includes("advance") ||
          err.message.toLowerCase().includes("hours")
        ) {
          errorMsg =
            "This appointment is too close to the current time. Please book at least 3 hours in advance.";
        } else if (
          err.message.toLowerCase().includes("unavailable")
        ) {
          errorMsg =
            "This time slot is no longer available. Please refresh and select another time.";
        } else {
          errorMsg =
            "This time slot is no longer available. Please select another time.";
        }
      } else if (err.message.includes("400")) {
        errorMsg =
          "Invalid booking request. Please check your selection and try again.";
      } else if (
        err.message.includes("403") ||
        err.message.includes("Forbidden")
      ) {
        errorMsg =
          "You don't have permission to book this appointment.";
      }

      setErrorMessage(errorMsg);

      // Refresh available slots if there was a conflict
      if (shouldRefreshSlots) {
        // Clear current selection since it's no longer valid
        setSelectedSlot(null);
        setSelectedTime("");
        // Show loading state while refreshing
        setIsLoading(true);
        // Refresh slots to show current availability
        await loadAvailableSlots();
        setIsLoading(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelection = (dateObj) => {
    setSelectedDate(dateObj.dateString);
    setSelectedTime("");
    setSelectedSlot(null);
    setErrorMessage("");

    // Ensure availableSlots is an array
    const slotsArray = Array.isArray(availableSlots)
      ? availableSlots
      : [];

    // Filter slots for selected date - check both date and workDate fields
    const slotsForDate = slotsArray.filter((slot) => {
      const slotDate = slot.workDate || slot.date;

      // Extract date part from datetime format (2025-06-25T00:00:00 -> 2025-06-25)
      const normalizedSlotDate = slotDate
        ? slotDate.split("T")[0]
        : null;

      // Handle different status formats - numeric 0 probably means "available"
      const isAvailable =
        slot.status === 0 ||
        slot.status === "available" ||
        getStatusLower(slot.status) === "available";

      // Check if slot date matches selected date
      const dateMatches = normalizedSlotDate === dateObj.dateString;

      // Check if slot can be booked (must be at least 3 hours from now)
      let canBook = true;
      if (slot.startTime) {
        const now = new Date();
        const slotStartTime = new Date(slot.startTime);
        const threeHoursFromNow = new Date(
          now.getTime() + 3 * 60 * 60 * 1000
        ); // Add 3 hours
        canBook = slotStartTime >= threeHoursFromNow;
      }

      return dateMatches && isAvailable && canBook;
    });

    if (slotsForDate.length === 0) {
      setErrorMessage("No available slots for the selected date");
    }

    // Scroll to time selection
    setTimeout(() => {
      timeSelectRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  const handleTimeSelection = (slot) => {
    setSelectedSlot(slot);
    setSelectedTime(
      `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
    );

    // Find consultant info (we might need to enhance the API to include consultant details)
    setSelectedConsultant({
      id: slot.consultantId,
      name: slot.consultantName || "Consultant",
    });

    setErrorMessage("");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Unknown time";

    try {
      // Handle different time formats

      // Format 1: Full datetime format like "2025-06-25T19:00:00" or "2025-06-25T19:00:00.000Z"
      if (timeString.includes("T")) {
        const date = new Date(timeString);
        if (date instanceof Date && !isNaN(date)) {
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }

      // Format 2: Time only like "19:00:00" or "19:00"
      if (timeString.includes(":")) {
        const timeParts = timeString.split(":");
        if (timeParts.length >= 2) {
          const hours = parseInt(timeParts[0]);
          const minutes = parseInt(timeParts[1]);
          if (!isNaN(hours) && !isNaN(minutes)) {
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        }
      }

      // Format 3: Try to parse as a regular date string
      const date = new Date(timeString);
      if (date instanceof Date && !isNaN(date)) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // If all parsing fails, return the original string
      return timeString;
    } catch (error) {
      console.warn("Error formatting time:", timeString, error);
      return timeString || "Unknown time";
    }
  };

  const canProceedToBooking = () => {
    return selectedSlot && isAuthenticated && !isConsultant();
  };

  const handleProceedToBooking = () => {
    if (!isAuthenticated) {
      setErrorMessage("Please log in to book an appointment");
      return;
    }

    if (isConsultant()) {
      setErrorMessage(
        "Consultants cannot book appointments. This page is for viewing available slots only."
      );
      return;
    }

    // Scroll to booking form
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  const getAvailableTimeSlotsForDate = (dateString) => {
    // Ensure availableSlots is an array
    const slotsArray = Array.isArray(availableSlots)
      ? availableSlots
      : [];

    const filteredSlots = slotsArray
      .filter((slot) => {
        // Check both date and workDate fields since consultant creates with workDate
        const slotDate = slot.workDate || slot.date;

        // Extract date part from datetime format (2025-06-25T00:00:00 -> 2025-06-25)
        const normalizedSlotDate = slotDate
          ? slotDate.split("T")[0]
          : null;

        // Handle different status formats - numeric 0 probably means "available"
        const isAvailable =
          slot.status === 0 ||
          slot.status === "available" ||
          getStatusLower(slot.status) === "available";

        // Check if slot date matches selected date
        const dateMatches = normalizedSlotDate === dateString;

        // Check if slot can be booked (must be at least 3 hours from now)
        let canBook = true;
        if (slot.startTime) {
          const now = new Date();
          const slotStartTime = new Date(slot.startTime);
          const threeHoursFromNow = new Date(
            now.getTime() + 3 * 60 * 60 * 1000
          ); // Add 3 hours
          canBook = slotStartTime >= threeHoursFromNow;
        }

        return dateMatches && isAvailable && canBook;
      })
      .map((slot) => ({
        ...slot,
        display: `${formatTime(slot.startTime)} - ${formatTime(
          slot.endTime
        )}`,
        sortTime: slot.startTime, // Add sort key
      }))
      .sort((a, b) => {
        // Sort by start time chronologically
        return (
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
        );
      });

    return filteredSlots;
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const resetBooking = () => {
    setSelectedSlot(null);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedConsultant(null);
    setBookingForm({ note: "", attachments: [] });
    setFormErrors({});
    clearMessages();
  };

  return (
    <div className="counseling-page">
      <div className="page-header secondary-bg fade-in">
        <div className="container">
          <h1>Dịch Vụ Tư Vấn</h1>
          <p>
            {isConsultant()
              ? "Xem các khung giờ tư vấn có sẵn (Chế độ xem dành cho tư vấn viên)"
              : "Đặt lịch hẹn tư vấn trực tuyến với các tư vấn viên chuyên nghiệp"}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="tab-navigation fade-in delay-100">
          <button
            className={`tab-btn ${
              activeTab === "booking" ? "active" : ""
            }`}
            onClick={() => setActiveTab("booking")}>
            {isConsultant() ? "Xem Khung Giờ" : "Đặt Lịch Hẹn"}
          </button>
          {isAuthenticated && (
            <button
              className={`tab-btn ${
                activeTab === "appointments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("appointments")}>
              {isConsultant()
                ? "Lịch Hẹn Đã Đặt"
                : "Lịch Hẹn Của Tôi"}
            </button>
          )}
        </div>

        {/* Error and Success Messages */}
        {errorMessage && (
          <div className="alert alert-error">
            <FontAwesomeIcon icon={faTimesCircle} />
            {errorMessage}
            <button onClick={clearMessages} className="close-btn">
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <FontAwesomeIcon icon={faCheck} />
            {successMessage}
            <button onClick={clearMessages} className="close-btn">
              ×
            </button>
          </div>
        )}

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <div className="alert alert-info">
            <FontAwesomeIcon icon={faInfoCircle} />
            Please log in to book appointments or view your booking
            history.
            <button
              onClick={() => (window.location.href = "/login")}
              className="btn-link">
              Go to Login
            </button>
          </div>
        )}

        {activeTab === "booking" && (
          <div className="booking-section">
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
                                selectedDate === dateObj.dateString
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
                              ${
                                selectedDate === dateObj.dateString
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
                        {getAvailableTimeSlotsForDate(
                          selectedDate
                        ).map((slot, index) => (
                          <button
                            key={index}
                            className={`time-btn ${
                              selectedSlot?.id === slot.id
                                ? "selected"
                                : ""
                            } ${slot.isPast ? "past" : ""} ${
                              isConsultant() ? "consultant-view" : ""
                            }`}
                            onClick={() =>
                              !slot.isPast &&
                              !isConsultant() &&
                              handleTimeSelection(slot)
                            }
                            disabled={slot.isPast || isConsultant()}>
                            {slot.display}
                            <small>{slot.consultantName}</small>
                          </button>
                        ))}
                      </div>
                      {getAvailableTimeSlotsForDate(selectedDate)
                        .length === 0 && (
                        <div className="no-slots">
                          Không có khung giờ nào khả dụng cho ngày này
                        </div>
                      )}
                      {formErrors.slot && (
                        <div className="error-text">
                          {formErrors.slot}
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

                    {selectedConsultant ? (
                      <div className="selection-item">
                        <FontAwesomeIcon icon={faUser} />
                        <span>Tư vấn viên:</span>{" "}
                        {selectedConsultant.name}
                      </div>
                    ) : (
                      <div className="selection-item">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span>Tư vấn viên:</span> Chưa chọn
                      </div>
                    )}
                  </div>

                  <button
                    className={`confirmation-btn ${
                      isConsultant() ? "consultant-view" : ""
                    }`}
                    disabled={!canProceedToBooking()}
                    onClick={handleProceedToBooking}>
                    {isConsultant() ? (
                      <>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        View Only (Consultants cannot book)
                      </>
                    ) : selectedSlot ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        Đặt Lịch Hẹn
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Chọn thời gian để tiếp tục
                      </>
                    )}
                  </button>

                  {!isAuthenticated && (
                    <div className="auth-notice">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      Vui lòng đăng nhập để đặt lịch hẹn
                    </div>
                  )}

                  {isConsultant() && (
                    <div className="consultant-notice">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      Bạn đang xem với tư cách tư vấn viên. Không thể
                      đặt lịch hẹn.
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Form */}
              {selectedSlot && isAuthenticated && !isConsultant() && (
                <div
                  className="booking-form-section fade-in"
                  ref={bookingFormRef}>
                  <div className="card">
                    <h3>Thông Tin Đặt Lịch</h3>
                    <form
                      onSubmit={handleBookingSubmit}
                      className="booking-form">
                      <div className="form-group">
                        <label htmlFor="note">
                          Ghi chú (tùy chọn)
                        </label>
                        <textarea
                          id="note"
                          name="note"
                          value={bookingForm.note}
                          onChange={handleInputChange}
                          placeholder="Mô tả vấn đề bạn muốn tư vấn..."
                          rows="4"
                          maxLength="1000"
                          className={formErrors.note ? "error" : ""}
                        />
                        <small>
                          {bookingForm.note.length}/1000 ký tự
                        </small>
                        {formErrors.note && (
                          <div className="error-text">
                            {formErrors.note}
                          </div>
                        )}
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={resetBooking}
                          className="btn-secondary">
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="btn-primary">
                          {isLoading ? (
                            <>
                              <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                              />
                              Đang đặt lịch...
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faCheck} />
                              Xác nhận đặt lịch
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          </div>
        )}

        {/* My Appointments Tab */}
        {activeTab === "appointments" && isAuthenticated && (
          <div className="appointments-section fade-in">
            <h3>
              {isConsultant()
                ? "Lịch Hẹn Đã Đặt"
                : "Lịch Hẹn Của Tôi"}
            </h3>

            {isConsultant() ? (
              <div className="empty-appointments">
                <FontAwesomeIcon icon={faCalendarDay} />
                <h4>Quản lý lịch hẹn từ trang tư vấn</h4>
                <p>
                  Để xem và quản lý các lịch hẹn của bạn, vui lòng
                  truy cập trang Quản lý thời gian tư vấn.
                </p>
                <button
                  onClick={() =>
                    (window.location.href = "/consult-time")
                  }
                  className="btn-primary">
                  Đến trang quản lý
                </button>
              </div>
            ) : isLoading ? (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin />
                Đang tải...
              </div>
            ) : myAppointments.length === 0 ? (
              <div className="empty-appointments">
                <FontAwesomeIcon icon={faCalendarDay} />
                <h4>Chưa có lịch hẹn nào</h4>
                <p>Đặt lịch hẹn đầu tiên của bạn ngay hôm nay!</p>
                <button
                  onClick={() => setActiveTab("booking")}
                  className="btn-primary">
                  Đặt lịch hẹn
                </button>
              </div>
            ) : (
              <div className="appointments-list">
                {myAppointments.map((appointment) => {
                  return (
                    <div
                      key={appointment.id}
                      className={`appointment-card ${getStatusLower(
                        appointment.status
                      )}`}>
                      <div className="appointment-header">
                        <div className="appointment-info">
                          <h4>
                            {appointment.consultantName ||
                              "Tư vấn viên"}
                          </h4>
                          <div className="appointment-datetime">
                            <FontAwesomeIcon icon={faCalendarDay} />
                            {appointment.availableSlot?.workDate?.split(
                              "T"
                            )[0] || appointment.date}{" "}
                            -{" "}
                            {formatTime(
                              appointment.availableSlot?.startTime
                            )}{" "}
                            to{" "}
                            {formatTime(
                              appointment.availableSlot?.endTime
                            )}
                          </div>
                        </div>
                        <div
                          className={`status-badge ${getStatusLower(
                            appointment.status
                          )}`}>
                          {appointment.status}
                        </div>
                      </div>

                      {appointment.note && (
                        <div className="appointment-note">
                          <strong>Ghi chú:</strong> {appointment.note}
                        </div>
                      )}

                      {appointment.meetingLink &&
                        getStatusLower(appointment.status) ===
                          "confirmed" && (
                          <div className="meeting-link">
                            <FontAwesomeIcon icon={faUser} />
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer">
                              Tham gia cuộc họp
                            </a>
                          </div>
                        )}

                      {getStatusLower(appointment.status) ===
                        "pending" && (
                        <div className="appointment-actions">
                          <button
                            onClick={async () => {
                              const reason = prompt(
                                "Lý do hủy lịch hẹn:"
                              );
                              if (reason) {
                                const response =
                                  await consultationService.cancelAppointmentByMember(
                                    appointment.id,
                                    reason
                                  );
                                if (response.success) {
                                  setSuccessMessage(
                                    "Đã hủy lịch hẹn thành công"
                                  );
                                  loadMyAppointments();
                                } else {
                                  setErrorMessage(
                                    "Không thể hủy lịch hẹn: " +
                                      response.error
                                  );
                                }
                              }
                            }}
                            className="btn-danger">
                            Hủy lịch hẹn
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Counseling;

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCalendar,
  faClock,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faSpinner,
  faEye,
  faExclamationTriangle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import "./ConsultTime.css";

const ConsultTime = () => {
  const { currentUser, isConsultant } = useAuth();
  const [activeTab, setActiveTab] = useState("manage-slots");
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [showBulkCreateForm, setShowBulkCreateForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Bulk slot form
  const [bulkForm, setBulkForm] = useState({
    selectedDates: [],
    selectedTimeSlots: [],
  });

  // Predefined time slots
  const predefinedTimeSlots = [
    {
      startTime: "08:00",
      endTime: "09:00",
      label: "8:00 AM - 9:00 AM",
    },
    {
      startTime: "09:00",
      endTime: "10:00",
      label: "9:00 AM - 10:00 AM",
    },
    {
      startTime: "10:00",
      endTime: "11:00",
      label: "10:00 AM - 11:00 AM",
    },
    {
      startTime: "11:00",
      endTime: "12:00",
      label: "11:00 AM - 12:00 PM",
    },
    {
      startTime: "13:00",
      endTime: "14:00",
      label: "1:00 PM - 2:00 PM",
    },
    {
      startTime: "14:00",
      endTime: "15:00",
      label: "2:00 PM - 3:00 PM",
    },
    {
      startTime: "15:00",
      endTime: "16:00",
      label: "3:00 PM - 4:00 PM",
    },
    {
      startTime: "16:00",
      endTime: "17:00",
      label: "4:00 PM - 5:00 PM",
    },
    {
      startTime: "17:00",
      endTime: "18:00",
      label: "5:00 PM - 6:00 PM",
    },
    {
      startTime: "19:00",
      endTime: "20:00",
      label: "7:00 PM - 8:00 PM",
    },
    {
      startTime: "20:00",
      endTime: "21:00",
      label: "8:00 PM - 9:00 PM",
    },
  ];

  // Generate next 14 weekdays for date selection (exclude weekends)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    let daysAdded = 0;
    let currentDate = new Date(today);

    // Generate up to 14 weekdays (excluding weekends)
    while (daysAdded < 14) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Only include weekdays (Monday = 1, Friday = 5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push({
          dateString: currentDate.toISOString().split("T")[0],
          label: currentDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          fullDate: new Date(currentDate),
        });
        daysAdded++;
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const availableDates = generateAvailableDates();

  const [formErrors, setFormErrors] = useState({});

  // Check if user is consultant
  useEffect(() => {
    if (!isConsultant()) {
      setError("Access denied. This page is only for consultants.");
      return;
    }
    loadSlots();
    loadAppointments();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const response = await consultationService.getMySlots();
      if (response.success) {
        const slotsData = response.data.data || [];

        // Clean and normalize the slots data
        const normalizedSlots = slotsData.map((slot) => ({
          ...slot,
          // Ensure we have proper date fields
          date: slot.workDate || slot.date,
          workDate: slot.workDate || slot.date,
          // Ensure times are properly formatted
          startTime: slot.startTime || "",
          endTime: slot.endTime || "",
          // Set proper default status
          status: slot.status || "available",
        }));

        setSlots(normalizedSlots);
      } else {
        setError("Failed to load slots: " + response.error);
      }
    } catch (err) {
      setError("Error loading slots: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await consultationService.getMyConsultations();
      if (response.success) {
        const appointmentsData = response.data.data || [];
        setAppointments(appointmentsData);
      } else {
        console.error("Failed to load appointments:", response.error);
      }
    } catch (err) {
      console.error("Error loading appointments:", err.message);
    }
  };

  const validateSlotForm = (formData) => {
    const errors = {};

    const dateValue = formData.workDate || formData.date;
    if (!dateValue) {
      errors.date = "Date is required";
    } else {
      const selectedDate = new Date(dateValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = "Cannot create slots in the past";
      }

      // Check if it's a weekday (Monday = 1, Friday = 5)
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        errors.date =
          "Work date must be a weekday (Monday to Friday)";
      }
    }

    if (!formData.startTime) {
      errors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      errors.endTime = "End time is required";
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      errors.endTime = "End time must be after start time";
    }

    return errors;
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();

    if (
      !bulkForm.selectedDates.length ||
      !bulkForm.selectedTimeSlots.length
    ) {
      setError(
        "Please select both dates and time slots for bulk creation"
      );
      return;
    }

    // Validate all selected dates are weekdays and in the future
    for (const dateString of bulkForm.selectedDates) {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        setError("Cannot create slots in the past");
        return;
      }

      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setError(
          "All selected dates must be weekdays (Monday to Friday)"
        );
        return;
      }
    }

    setLoading(true);
    try {
      const slotsToCreate = [];

      // Create slots for each selected date and time slot combination
      for (const dateString of bulkForm.selectedDates) {
        for (const timeSlot of bulkForm.selectedTimeSlots) {
          slotsToCreate.push({
            workDate: dateString,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          });
        }
      }

      if (slotsToCreate.length === 0) {
        setError("No slots to create with the selected criteria");
        return;
      }

      const response = await consultationService.createMultipleSlots(
        slotsToCreate
      );
      if (response.success) {
        setSuccess(
          `${slotsToCreate.length} slots created successfully!`
        );
        setBulkForm({
          selectedDates: [],
          selectedTimeSlots: [],
        });
        setShowBulkCreateForm(false);
        loadSlots();
      } else {
        setError("Failed to create slots: " + response.error);
      }
    } catch (err) {
      setError("Error creating slots: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();

    // Validate that we have all required data
    const dateValue = editingSlot.workDate || editingSlot.date;
    if (
      !dateValue ||
      !editingSlot.startTime ||
      !editingSlot.endTime
    ) {
      setError("Please select both date and time slot");
      return;
    }

    const errors = validateSlotForm(editingSlot);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        workDate: dateValue,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
      };

      console.log("Updating slot with data:", updateData);

      const response = await consultationService.updateSlot(
        editingSlot.id,
        updateData
      );

      if (response.success) {
        setSuccess("Slot updated successfully!");
        setEditingSlot(null);
        setFormErrors({});

        // Force refresh the slots data
        await loadSlots();

        // Clear any cached data that might be causing display issues
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError("Failed to update slot: " + response.error);
      }
    } catch (err) {
      setError("Error updating slot: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    // Find the slot to check its status
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) {
      setError("Không tìm thấy slot để xóa");
      return;
    }

    // Check if slot is booked/pending/confirmed - prevent deletion
    const statusLower = getStatusLower(slot.status);
    if (
      statusLower === "booked" ||
      statusLower === "pending" ||
      statusLower === "confirmed"
    ) {
      setError(
        "Không thể xóa slot đã được đặt lịch hoặc đang chờ xác nhận"
      );
      return;
    }

    if (
      !window.confirm("Bạn có chắc chắn muốn xóa slot này không?")
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await consultationService.deleteSlot(slotId);
      if (response.success) {
        setSuccess("Đã xóa slot thành công!");
        loadSlots();
      } else {
        setError("Không thể xóa slot: " + response.error);
      }
    } catch (err) {
      setError("Lỗi khi xóa slot: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (
    appointmentId,
    meetingLink = "",
    note = ""
  ) => {
    setLoading(true);
    try {
      // Debug: Log appointment details before confirming
      console.log("Attempting to confirm appointment:", {
        appointmentId,
        meetingLink,
        note,
      });

      // Find the appointment in our current list to see its current status
      const appointment = appointments.find(
        (apt) => apt.id === appointmentId
      );
      console.log("Current appointment data:", appointment);
      console.log("Current appointment status:", appointment?.status);

      const response = await consultationService.confirmAppointment(
        appointmentId,
        {
          meetingLink,
          note,
        }
      );

      if (response.success) {
        setSuccess("Appointment confirmed successfully!");
        loadAppointments();
      } else {
        setError("Failed to confirm appointment: " + response.error);
      }
    } catch (err) {
      setError("Error confirming appointment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointment = async (appointmentId, reason) => {
    setLoading(true);
    try {
      const response = await consultationService.rejectAppointment(
        appointmentId,
        reason
      );

      if (response.success) {
        setSuccess("Appointment rejected!");
        loadAppointments();
      } else {
        setError("Failed to reject appointment: " + response.error);
      }
    } catch (err) {
      setError("Error rejecting appointment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) {
      return "No time";
    }

    try {
      // Handle different time formats
      let timeToFormat = timeString;

      // If it's already in HH:MM format, use it directly
      if (
        typeof timeString === "string" &&
        timeString.match(/^\d{2}:\d{2}$/)
      ) {
        timeToFormat = timeString;
      }
      // If it has seconds, remove them
      else if (
        typeof timeString === "string" &&
        timeString.match(/^\d{2}:\d{2}:\d{2}$/)
      ) {
        timeToFormat = timeString.substring(0, 5);
      }
      // If it's a full datetime, extract time part
      else if (
        typeof timeString === "string" &&
        timeString.includes("T")
      ) {
        timeToFormat = timeString.split("T")[1]?.substring(0, 5);
      }

      const date = new Date(`2000-01-01T${timeToFormat}`);
      if (isNaN(date.getTime())) {
        console.log(
          "formatTime: Invalid date created from:",
          timeToFormat
        );
        return "Invalid time";
      }

      const formatted = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return formatted;
    } catch (error) {
      console.log(
        "formatTime error:",
        error,
        "for input:",
        timeString
      );
      return "Invalid time";
    }
  };

  // Helper function to safely get lowercase status
  const getStatusLower = (status) => {
    // Handle null, undefined, or empty values
    if (status === null || status === undefined || status === "") {
      return "";
    }

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

    // Handle boolean values
    if (typeof status === "boolean") {
      return status ? "active" : "inactive";
    }

    // Handle objects (in case status is an object with properties)
    if (typeof status === "object") {
      if (status.value !== undefined) {
        return getStatusLower(status.value);
      }
      if (status.name !== undefined) {
        return getStatusLower(status.name);
      }
      // Convert object to string as fallback
      return String(status).toLowerCase();
    }

    // Handle any other type by converting to string first
    try {
      return String(status).toLowerCase();
    } catch (error) {
      console.warn(
        "Error converting status to string:",
        status,
        error
      );
      return "unknown";
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "gray";

    const statusLower = getStatusLower(status);
    switch (statusLower) {
      case "available":
        return "green";
      case "booked":
        return "orange";
      case "pending":
        return "blue";
      case "confirmed":
        return "green";
      case "rejected":
        return "red";
      case "cancelled":
        return "gray";
      default:
        return "gray";
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleDeleteInvalidSlots = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa tất cả slot có dữ liệu không hợp lệ không? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // Filter slots with truly invalid data - NOT just status-based
      const invalidSlots = slots.filter((slot) => {
        // Don't delete any slot that has been booked, has appointments, or is properly available
        const status = getStatusLower(slot.status);
        if (
          status === "booked" ||
          status === "pending" ||
          status === "confirmed" ||
          status === "available"
        ) {
          return false; // Never delete booked/pending/confirmed/available slots
        }

        // Only delete if data is actually corrupted/invalid
        const hasInvalidDate =
          (!slot.workDate && !slot.date) ||
          (slot.workDate &&
            isNaN(new Date(slot.workDate).getTime())) ||
          (slot.date && isNaN(new Date(slot.date).getTime()));

        const hasInvalidStartTime =
          !slot.startTime ||
          slot.startTime === "Invalid time" ||
          (typeof slot.startTime === "string" &&
            !slot.startTime.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) ||
          isNaN(new Date(`2000-01-01T${slot.startTime}`).getTime());

        const hasInvalidEndTime =
          !slot.endTime ||
          slot.endTime === "Invalid time" ||
          (typeof slot.endTime === "string" &&
            !slot.endTime.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) ||
          isNaN(new Date(`2000-01-01T${slot.endTime}`).getTime());

        // Only consider it invalid if it has actual corrupted data
        return (
          hasInvalidDate || hasInvalidStartTime || hasInvalidEndTime
        );
      });

      if (invalidSlots.length === 0) {
        setSuccess(
          "Không tìm thấy slot nào có dữ liệu không hợp lệ cần xóa."
        );
        return;
      }

      // Delete each invalid slot
      let deletedCount = 0;
      let errorCount = 0;

      for (const slot of invalidSlots) {
        try {
          const response = await consultationService.deleteSlot(
            slot.id
          );
          if (response.success) {
            deletedCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (deletedCount > 0) {
        setSuccess(
          `Đã xóa thành công ${deletedCount} slot có dữ liệu không hợp lệ.`
        );
        loadSlots(); // Refresh the slots list
      }

      if (errorCount > 0) {
        setError(
          `Không thể xóa ${errorCount} slot. Vui lòng thử lại.`
        );
      }
    } catch (err) {
      setError("Lỗi trong quá trình dọn dẹp: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to count invalid slots
  const getInvalidSlotsCount = () => {
    return slots.filter((slot) => {
      // Don't count any slot that has been booked, has appointments, or is properly available
      const status = getStatusLower(slot.status);
      if (
        status === "booked" ||
        status === "pending" ||
        status === "confirmed" ||
        status === "available"
      ) {
        return false; // Never count booked/pending/confirmed/available slots as invalid
      }

      // Only count if data is actually corrupted/invalid
      const hasInvalidDate =
        (!slot.workDate && !slot.date) ||
        (slot.workDate && isNaN(new Date(slot.workDate).getTime())) ||
        (slot.date && isNaN(new Date(slot.date).getTime()));

      const hasInvalidStartTime =
        !slot.startTime ||
        slot.startTime === "Invalid time" ||
        (typeof slot.startTime === "string" &&
          !slot.startTime.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) ||
        isNaN(new Date(`2000-01-01T${slot.startTime}`).getTime());

      const hasInvalidEndTime =
        !slot.endTime ||
        slot.endTime === "Invalid time" ||
        (typeof slot.endTime === "string" &&
          !slot.endTime.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) ||
        isNaN(new Date(`2000-01-01T${slot.endTime}`).getTime());

      // Only consider it invalid if it has actual corrupted data
      return (
        hasInvalidDate || hasInvalidStartTime || hasInvalidEndTime
      );
    }).length;
  };

  // Helper function to extract date from appointment
  const getAppointmentDate = (appointment) => {
    // Try different possible locations for date information
    return (
      appointment.availableSlot?.workDate ||
      appointment.availableSlot?.date ||
      appointment.slot?.workDate ||
      appointment.slot?.date ||
      appointment.workDate ||
      appointment.date ||
      appointment.appointmentDate
    );
  };

  // Helper function to extract start time from appointment
  const getAppointmentStartTime = (appointment) => {
    return (
      appointment.availableSlot?.startTime ||
      appointment.slot?.startTime ||
      appointment.startTime ||
      appointment.appointmentTime
    );
  };

  // Helper function to extract end time from appointment
  const getAppointmentEndTime = (appointment) => {
    return (
      appointment.availableSlot?.endTime ||
      appointment.slot?.endTime ||
      appointment.endTime
    );
  };

  // Helper function to get user name from appointment
  const getAppointmentUserName = (appointment) => {
    // Try various possible property paths for user name
    const possibleNames = [
      appointment.memberName,
      appointment.userName,
      appointment.user?.name,
      appointment.user?.userName,
      appointment.user?.memberName,
      appointment.member?.name,
      appointment.member?.userName,
      appointment.member?.memberName,
      appointment.bookedBy?.name,
      appointment.bookedBy?.userName,
      appointment.client?.name,
      appointment.client?.userName,
      appointment.name,
      appointment.fullName,
      appointment.displayName,
    ];

    // Find the first non-empty name
    for (const name of possibleNames) {
      if (name && typeof name === "string" && name.trim() !== "") {
        return name.trim();
      }
    }

    return "Unknown User";
  };

  // Helper function to get user email from appointment
  const getAppointmentUserEmail = (appointment) => {
    // Try various possible property paths for user email
    const possibleEmails = [
      appointment.memberEmail,
      appointment.userEmail,
      appointment.user?.email,
      appointment.user?.memberEmail,
      appointment.member?.email,
      appointment.member?.userEmail,
      appointment.bookedBy?.email,
      appointment.client?.email,
      appointment.email,
    ];

    // Find the first valid email
    for (const email of possibleEmails) {
      if (
        email &&
        typeof email === "string" &&
        email.trim() !== "" &&
        email.includes("@")
      ) {
        return email.trim();
      }
    }

    return null; // Return null if no email found
  };

  if (!isConsultant()) {
    return (
      <div className="consult-time-container">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          Truy cập bị từ chối. Trang này chỉ dành cho chuyên gia tư
          vấn.
        </div>
      </div>
    );
  }

  return (
    <div className="consult-time-container">
      <div className="consult-time-header">
        <h1>Quản Lý Thời Gian Tư Vấn</h1>
        <p>Quản lý slot thời gian và cuộc hẹn của bạn</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
          <button onClick={clearMessages} className="close-btn">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FontAwesomeIcon icon={faCheck} />
          {success}
          <button onClick={clearMessages} className="close-btn">
            ×
          </button>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${
            activeTab === "manage-slots" ? "active" : ""
          }`}
          onClick={() => setActiveTab("manage-slots")}>
          <FontAwesomeIcon icon={faClock} />
          Quản Lý Slot
        </button>
        <button
          className={`tab ${
            activeTab === "appointments" ? "active" : ""
          }`}
          onClick={() => setActiveTab("appointments")}>
          <FontAwesomeIcon icon={faCalendar} />
          Cuộc Hẹn
        </button>
      </div>

      {activeTab === "manage-slots" && (
        <div className="tab-content">
          <div className="actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowBulkCreateForm(true);
                clearMessages();
              }}>
              <FontAwesomeIcon icon={faPlus} />
              Tạo Slot
            </button>
            {getInvalidSlotsCount() > 0 && (
              <button
                className="btn btn-danger"
                onClick={handleDeleteInvalidSlots}
                disabled={loading}>
                <FontAwesomeIcon icon={faTrash} />
                {loading
                  ? "Đang dọn dẹp..."
                  : `Xóa ${getInvalidSlotsCount()} Slot Không Hợp Lệ${
                      getInvalidSlotsCount() > 1 ? "" : ""
                    }`}
              </button>
            )}
          </div>

          {/* Bulk Slot Creation Form */}
          {showBulkCreateForm && (
            <div className="modal-overlay">
              <div className="modal bulk-modal">
                <div className="modal-header">
                  <h3>Tạo Slot</h3>
                  <button
                    onClick={() => setShowBulkCreateForm(false)}
                    className="close-btn">
                    ×
                  </button>
                </div>
                <form
                  onSubmit={handleBulkCreate}
                  className="bulk-form">
                  <div className="form-group">
                    <label>Chọn Ngày</label>
                    <div className="date-buttons-grid">
                      {availableDates.map((date) => (
                        <button
                          key={date.dateString}
                          type="button"
                          className={`date-btn ${
                            bulkForm.selectedDates.includes(
                              date.dateString
                            )
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            const newSelectedDates =
                              bulkForm.selectedDates.includes(
                                date.dateString
                              )
                                ? bulkForm.selectedDates.filter(
                                    (d) => d !== date.dateString
                                  )
                                : [
                                    ...bulkForm.selectedDates,
                                    date.dateString,
                                  ];
                            setBulkForm({
                              ...bulkForm,
                              selectedDates: newSelectedDates,
                            });
                          }}>
                          {date.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Chọn Khung Giờ</label>
                    <div className="time-buttons-grid">
                      {predefinedTimeSlots.map((slot) => (
                        <button
                          key={slot.label}
                          type="button"
                          className={`time-btn ${
                            bulkForm.selectedTimeSlots.some(
                              (s) => s.label === slot.label
                            )
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            const newSelectedTimeSlots =
                              bulkForm.selectedTimeSlots.some(
                                (s) => s.label === slot.label
                              )
                                ? bulkForm.selectedTimeSlots.filter(
                                    (s) => s.label !== slot.label
                                  )
                                : [
                                    ...bulkForm.selectedTimeSlots,
                                    slot,
                                  ];
                            setBulkForm({
                              ...bulkForm,
                              selectedTimeSlots: newSelectedTimeSlots,
                            });
                          }}>
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowBulkCreateForm(false)}
                      className="btn btn-secondary">
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary">
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                      Tạo Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Slot Modal */}
          {editingSlot && (
            <div className="modal-overlay">
              <div className="modal bulk-modal">
                <div className="modal-header">
                  <h3>Chỉnh Sửa Slot</h3>
                  <button
                    onClick={() => setEditingSlot(null)}
                    className="close-btn">
                    ×
                  </button>
                </div>
                <form
                  onSubmit={handleUpdateSlot}
                  className="bulk-form">
                  <div className="form-group">
                    <label>Chọn Ngày</label>
                    <div className="date-buttons-grid">
                      {availableDates.map((date) => (
                        <button
                          key={date.dateString}
                          type="button"
                          className={`date-btn ${
                            (editingSlot.workDate ||
                              editingSlot.date) === date.dateString
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setEditingSlot({
                              ...editingSlot,
                              date: date.dateString,
                              workDate: date.dateString,
                            });
                          }}>
                          {date.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Chọn Khung Giờ</label>
                    <div className="time-buttons-grid">
                      {predefinedTimeSlots.map((slot) => (
                        <button
                          key={slot.label}
                          type="button"
                          className={`time-btn ${
                            editingSlot.startTime ===
                              slot.startTime &&
                            editingSlot.endTime === slot.endTime
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setEditingSlot({
                              ...editingSlot,
                              startTime: slot.startTime,
                              endTime: slot.endTime,
                            });
                          }}>
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setEditingSlot(null)}
                      className="btn btn-secondary">
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary">
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                      Cập Nhật Slot
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Slots List */}
          <div className="slots-list">
            {loading && (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
              </div>
            )}

            {!loading && slots.length === 0 && (
              <div className="empty-state">
                <FontAwesomeIcon icon={faCalendar} />
                <h3>Chưa tạo slot nào</h3>
                <p>
                  Tạo slot thời gian đầu tiên để bắt đầu nhận cuộc
                  hẹn.
                </p>
              </div>
            )}

            {!loading && slots.length > 0 && (
              <div className="slots-grid">
                {slots.map((slot) => {
                  try {
                    const statusClass = getStatusLower(slot.status);
                    const statusColor = getStatusColor(slot.status);
                    const isBooked = statusClass === "booked";

                    return (
                      <div
                        key={slot.id}
                        className={`slot-card ${statusClass}`}>
                        <div className="slot-header">
                          <div className="slot-date">
                            {formatDate(slot.workDate || slot.date)}
                          </div>
                          <div
                            className={`slot-status status-${statusColor}`}>
                            {slot.status}
                          </div>
                        </div>
                        <div className="slot-time">
                          {formatTime(slot.startTime)} -{" "}
                          {formatTime(slot.endTime)}
                        </div>
                        <div className="slot-actions">
                          <button
                            onClick={() => setEditingSlot(slot)}
                            className="btn btn-small btn-secondary"
                            disabled={isBooked}>
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="btn btn-small btn-danger"
                            disabled={isBooked}
                            title={
                              isBooked
                                ? "Không thể xóa slot đã được đặt"
                                : "Xóa slot"
                            }>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error(
                      "Error rendering slot:",
                      slot,
                      error
                    );
                    return (
                      <div key={slot.id} className="slot-card error">
                        <div className="slot-header">
                          <div className="slot-date">Error</div>
                          <div className="slot-status">Invalid</div>
                        </div>
                        <div className="slot-time">
                          Error processing slot data
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="tab-content">
          <div className="appointments-list">
            {loading && (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
              </div>
            )}

            {!loading && appointments.length === 0 && (
              <div className="empty-state">
                <FontAwesomeIcon icon={faCalendar} />
                <h3>Chưa có cuộc hẹn nào</h3>
                <p>
                  Các cuộc hẹn sẽ xuất hiện ở đây khi người dùng đặt
                  lịch trên slot của bạn.
                </p>
              </div>
            )}

            {!loading && appointments.length > 0 && (
              <div className="appointments-grid">
                {appointments.map((appointment) => {
                  try {
                    const statusColor = getStatusColor(
                      appointment.status
                    );
                    const isPending =
                      getStatusLower(appointment.status) ===
                      "pending";

                    return (
                      <div
                        key={appointment.id}
                        className={`appointment-card status-${statusColor}`}>
                        <div className="appointment-header">
                          <div className="appointment-user">
                            <FontAwesomeIcon icon={faUser} />
                            <div className="user-info">
                              <div className="user-name">
                                {getAppointmentUserName(appointment)}
                              </div>
                              {getAppointmentUserEmail(
                                appointment
                              ) && (
                                <div className="user-email">
                                  {getAppointmentUserEmail(
                                    appointment
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div
                            className={`appointment-status status-${statusColor}`}>
                            {appointment.status}
                          </div>
                        </div>
                        <div className="appointment-details">
                          <div className="appointment-date">
                            <FontAwesomeIcon icon={faCalendar} />
                            {formatDate(
                              getAppointmentDate(appointment)
                            )}
                          </div>
                          <div className="appointment-time">
                            <FontAwesomeIcon icon={faClock} />
                            {formatTime(
                              getAppointmentStartTime(appointment)
                            )}
                            -{" "}
                            {formatTime(
                              getAppointmentEndTime(appointment)
                            )}
                          </div>
                        </div>
                        {appointment.note && (
                          <div className="appointment-note">
                            <strong>Note:</strong> {appointment.note}
                          </div>
                        )}
                        {isPending && (
                          <div className="appointment-actions">
                            <button
                              onClick={() => {
                                const meetingLink = prompt(
                                  "Nhập link cuộc họp (tùy chọn):"
                                );
                                const note = prompt(
                                  "Nhập ghi chú của chuyên gia (tùy chọn):"
                                );
                                handleConfirmAppointment(
                                  appointment.id,
                                  meetingLink,
                                  note
                                );
                              }}
                              className="btn btn-success btn-small">
                              <FontAwesomeIcon icon={faCheck} />
                              Xác Nhận
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt(
                                  "Nhập lý do từ chối:"
                                );
                                if (reason)
                                  handleRejectAppointment(
                                    appointment.id,
                                    reason
                                  );
                              }}
                              className="btn btn-danger btn-small">
                              <FontAwesomeIcon icon={faTimes} />
                              Từ Chối
                            </button>
                            {process.env.NODE_ENV ===
                              "development" && (
                              <button
                                onClick={async () => {
                                  console.log(
                                    "Testing endpoints for appointment:",
                                    appointment.id
                                  );
                                  const results =
                                    await consultationService.testAppointmentEndpoints(
                                      appointment.id
                                    );
                                  console.log(
                                    "Test results:",
                                    results
                                  );
                                  alert(
                                    "Check console for endpoint test results"
                                  );
                                }}
                                className="btn btn-secondary btn-small">
                                🔧 Test API
                              </button>
                            )}
                          </div>
                        )}
                        {appointment.meetingLink && (
                          <div className="appointment-meeting">
                            <strong>Link Cuộc Họp:</strong>
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer">
                              {appointment.meetingLink}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  } catch (error) {
                    console.error(
                      "Error rendering appointment:",
                      appointment,
                      error
                    );
                    return (
                      <div
                        key={appointment.id}
                        className="appointment-card error">
                        <div className="appointment-header">
                          <div className="appointment-user">
                            <FontAwesomeIcon icon={faUser} />
                            Error loading user
                          </div>
                          <div className="appointment-status">
                            Invalid
                          </div>
                        </div>
                        <div className="appointment-details">
                          Error processing appointment data
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultTime;

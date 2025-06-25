import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faClock,
  faUser,
  faSpinner,
  faExclamationTriangle,
  faCheck,
  faTimes,
  faCalendar,
  faMapMarkerAlt,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import "./MyAppointments.css";

const MyAppointments = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadMyAppointments();
  }, []);

  const loadMyAppointments = async () => {
    setLoading(true);
    try {
      const response = await consultationService.getMyAppointments();
      if (response.success) {
        const appointmentsData = response.data.data || [];
        setAppointments(appointmentsData);
      } else {
        setError(
          "Không thể tải danh sách lịch hẹn: " + response.error
        );
      }
    } catch (err) {
      setError("Lỗi khi tải lịch hẹn: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId, reason) => {
    setLoading(true);
    try {
      const response =
        await consultationService.cancelAppointmentByMember(
          appointmentId,
          reason
        );

      if (response.success) {
        setSuccess("Đã hủy lịch hẹn thành công!");
        loadMyAppointments();
      } else {
        setError("Không thể hủy lịch hẹn: " + response.error);
      }
    } catch (err) {
      setError("Lỗi khi hủy lịch hẹn: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có ngày";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Không có giờ";
    try {
      let timeToFormat = timeString;

      if (
        typeof timeString === "string" &&
        timeString.match(/^\d{2}:\d{2}$/)
      ) {
        timeToFormat = timeString;
      } else if (
        typeof timeString === "string" &&
        timeString.match(/^\d{2}:\d{2}:\d{2}$/)
      ) {
        timeToFormat = timeString.substring(0, 5);
      } else if (
        typeof timeString === "string" &&
        timeString.includes("T")
      ) {
        timeToFormat = timeString.split("T")[1]?.substring(0, 5);
      }

      const date = new Date(`2000-01-01T${timeToFormat}`);
      if (isNaN(date.getTime())) return "Giờ không hợp lệ";

      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Giờ không hợp lệ";
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "gray";
    const statusLower = status.toLowerCase();
    switch (statusLower) {
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

  const getStatusText = (status) => {
    if (!status) return "Không xác định";
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "rejected":
        return "Đã từ chối";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getAppointmentDate = (appointment) => {
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

  const getAppointmentStartTime = (appointment) => {
    return (
      appointment.availableSlot?.startTime ||
      appointment.slot?.startTime ||
      appointment.startTime ||
      appointment.appointmentTime
    );
  };

  const getAppointmentEndTime = (appointment) => {
    return (
      appointment.availableSlot?.endTime ||
      appointment.slot?.endTime ||
      appointment.endTime
    );
  };

  const getConsultantName = (appointment) => {
    return (
      appointment.consultantName ||
      appointment.consultant?.name ||
      appointment.consultant?.consultantName ||
      "Chuyên gia tư vấn"
    );
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return (
    <div className="my-appointments-container">
      <div className="my-appointments-header">
        <h1>
          <FontAwesomeIcon icon={faCalendarCheck} />
          Lịch Hẹn Của Tôi
        </h1>
        <p>Quản lý các cuộc hẹn tư vấn của bạn</p>
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

      <div className="appointments-content">
        {loading && (
          <div className="loading">
            <FontAwesomeIcon icon={faSpinner} spin /> Đang tải...
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <div className="empty-state">
            <FontAwesomeIcon icon={faCalendarCheck} />
            <h3>Chưa có lịch hẹn nào</h3>
            <p>
              Bạn chưa có cuộc hẹn tư vấn nào. Hãy đặt lịch tư vấn để
              được hỗ trợ.
            </p>
            <a href="/counseling" className="btn btn-primary">
              Đặt Lịch Tư Vấn
            </a>
          </div>
        )}

        {!loading && appointments.length > 0 && (
          <div className="appointments-grid">
            {appointments.map((appointment) => {
              const statusColor = getStatusColor(appointment.status);
              const isPending =
                appointment.status?.toLowerCase() === "pending";
              const isConfirmed =
                appointment.status?.toLowerCase() === "confirmed";
              const canCancel = isPending || isConfirmed;

              return (
                <div
                  key={appointment.id}
                  className={`appointment-card status-${statusColor}`}>
                  <div className="appointment-header">
                    <div className="consultant-info">
                      <FontAwesomeIcon icon={faUser} />
                      <div className="consultant-details">
                        <div className="consultant-name">
                          {getConsultantName(appointment)}
                        </div>
                        <div className="appointment-type">
                          Tư vấn cá nhân
                        </div>
                      </div>
                    </div>
                    <div
                      className={`appointment-status status-${statusColor}`}>
                      {getStatusText(appointment.status)}
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="appointment-date">
                      <FontAwesomeIcon icon={faCalendar} />
                      {formatDate(getAppointmentDate(appointment))}
                    </div>
                    <div className="appointment-time">
                      <FontAwesomeIcon icon={faClock} />
                      {formatTime(
                        getAppointmentStartTime(appointment)
                      )}{" "}
                      -{" "}
                      {formatTime(getAppointmentEndTime(appointment))}
                    </div>
                  </div>

                  {appointment.note && (
                    <div className="appointment-note">
                      <strong>Ghi chú:</strong> {appointment.note}
                    </div>
                  )}

                  {appointment.meetingLink && isConfirmed && (
                    <div className="meeting-link">
                      <strong>Link tham gia:</strong>
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-small btn-primary">
                        Tham gia cuộc họp
                      </a>
                    </div>
                  )}

                  {appointment.reason && (
                    <div className="rejection-reason">
                      <strong>Lý do:</strong> {appointment.reason}
                    </div>
                  )}

                  {canCancel && (
                    <div className="appointment-actions">
                      <button
                        onClick={() => {
                          const reason = prompt(
                            "Vui lòng nhập lý do hủy lịch hẹn:"
                          );
                          if (reason && reason.trim()) {
                            handleCancelAppointment(
                              appointment.id,
                              reason.trim()
                            );
                          }
                        }}
                        className="btn btn-danger btn-small"
                        disabled={loading}>
                        <FontAwesomeIcon icon={faTimes} />
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
    </div>
  );
};

export default MyAppointments;

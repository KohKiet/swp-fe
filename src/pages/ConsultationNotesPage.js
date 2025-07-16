import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStickyNote,
  faFilter,
  faSpinner,
  faExclamationTriangle,
  faSearch,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import ConsultationNotes from "../components/ConsultationNotes";
import "./ConsultationNotesPage.css";

const ConsultationNotesPage = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState(null);
  const [filter, setFilter] = useState("all"); // all, completed, confirmed

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    setLoading(true);
    setError("");

    try {
      let response;

      switch (filter) {
        case "completed":
          response =
            await consultationService.getMyCompletedAppointments();
          break;
        case "confirmed":
          response =
            await consultationService.getMyConfirmedAppointmentsWithAgoraToken();
          break;
        default:
          response =
            await consultationService.getMyAppointmentsWithAgoraToken();
      }

      if (response.success) {
        const appointmentsData = response.data.data || [];
        // Filter appointments that have completed status or are confirmed with potential notes
        const notesAppointments = appointmentsData.filter(
          (appointment) =>
            appointment.status &&
            (appointment.status.toLowerCase() === "completed" ||
              appointment.status.toLowerCase() === "confirmed")
        );
        setAppointments(notesAppointments);
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

  const formatDate = (dateString) => {
    if (!dateString) return "Không có ngày";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Ngày không hợp lệ";
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

  const getConsultantName = (appointment) => {
    return (
      appointment.consultantName ||
      appointment.consultant?.name ||
      appointment.consultant?.consultantName ||
      "Chuyên gia tư vấn"
    );
  };

  const clearError = () => {
    setError("");
  };

  return (
    <div className="consultation-notes-page">
      <div className="page-header">
        <h1>
          <FontAwesomeIcon icon={faStickyNote} />
          Ghi chú tư vấn của tôi
        </h1>
        <p>Xem lại các ghi chú từ các buổi tư vấn đã hoàn thành</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
          <button onClick={clearError} className="close-btn">
            ×
          </button>
        </div>
      )}

      <div className="notes-content">
        <div className="sidebar">
          <div className="filter-section">
            <h3>
              <FontAwesomeIcon icon={faFilter} />
              Lọc lịch hẹn
            </h3>
            <div className="filter-options">
              <button
                className={`filter-btn ${
                  filter === "all" ? "active" : ""
                }`}
                onClick={() => setFilter("all")}>
                Tất cả
              </button>
              <button
                className={`filter-btn ${
                  filter === "completed" ? "active" : ""
                }`}
                onClick={() => setFilter("completed")}>
                Đã hoàn thành
              </button>
              <button
                className={`filter-btn ${
                  filter === "confirmed" ? "active" : ""
                }`}
                onClick={() => setFilter("confirmed")}>
                Đã xác nhận
              </button>
            </div>
          </div>

          <div className="appointments-list">
            <h3>
              <FontAwesomeIcon icon={faCalendar} />
              Danh sách lịch hẹn
            </h3>

            {loading && (
              <div className="loading">
                <FontAwesomeIcon icon={faSpinner} spin />
                Đang tải...
              </div>
            )}

            {!loading && appointments.length === 0 && (
              <div className="no-appointments">
                <p>Không có lịch hẹn nào để hiển thị ghi chú</p>
              </div>
            )}

            {!loading && appointments.length > 0 && (
              <div className="appointment-items">
                <div
                  className={`appointment-item ${
                    selectedAppointment === null ? "active" : ""
                  }`}
                  onClick={() => setSelectedAppointment(null)}>
                  <div className="appointment-info">
                    <div className="consultant-name">
                      Tất cả ghi chú
                    </div>
                    <div className="appointment-date">
                      Xem toàn bộ
                    </div>
                  </div>
                </div>

                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`appointment-item ${
                      selectedAppointment?.id === appointment.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedAppointment(appointment)
                    }>
                    <div className="appointment-info">
                      <div className="consultant-name">
                        {getConsultantName(appointment)}
                      </div>
                      <div className="appointment-date">
                        {formatDate(getAppointmentDate(appointment))}
                      </div>
                      <div className="appointment-status">
                        {appointment.status === "completed"
                          ? "Đã hoàn thành"
                          : "Đã xác nhận"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="notes-display">
          {selectedAppointment ? (
            <div className="selected-appointment-notes">
              <div className="appointment-header">
                <h2>{getConsultantName(selectedAppointment)}</h2>
                <p>
                  {formatDate(
                    getAppointmentDate(selectedAppointment)
                  )}
                </p>
              </div>
              <ConsultationNotes
                appointmentId={selectedAppointment.id}
                showTitle={false}
              />
            </div>
          ) : (
            <div className="all-notes">
              <ConsultationNotes showTitle={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationNotesPage;

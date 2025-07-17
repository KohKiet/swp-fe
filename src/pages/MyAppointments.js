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
  faVideo,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { consultationService } from "../services/consultationService";
import AgoraVideoCall from "../components/AgoraVideoCall";
import ConsultationNotes from "../components/ConsultationNotes";
import "./MyAppointments.css";

const MyAppointments = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(null);
  const [showNotes, setShowNotes] = useState(null);

  useEffect(() => {
    loadMyAppointments();
  }, []);

  const loadMyAppointments = async () => {
    setLoading(true);
    try {
      const response =
        await consultationService.getMyAppointmentsWithAgoraToken();
      if (response.success) {
        const appointmentsData = response.data.data || [];
        setAppointments(appointmentsData);

        // Debug logging to help identify note fields (member side)
        if (
          process.env.NODE_ENV === "development" &&
          appointmentsData.length > 0
        ) {
          console.log(
            "Member's appointment data for debugging notes:",
            appointmentsData[0]
          );
          appointmentsData.forEach((appointment, index) => {
            const memberNote = getAppointmentMemberNote(appointment);
            console.log(`Member Appointment ${index + 1}:`, {
              id: appointment.id,
              status: appointment.status,
              hasMemberNote: !!memberNote,
              memberNote: memberNote,
              hasAgoraToken: !!(
                appointment.agoraToken || appointment.AgoraToken
              ),
              agoraFields: {
                agoraToken: !!appointment.agoraToken,
                AgoraToken: !!appointment.AgoraToken,
                agoraAppId: !!appointment.agoraAppId,
                AgoraAppId: !!appointment.AgoraAppId,
                agoraChannelName: !!appointment.agoraChannelName,
                ChannelName: !!appointment.ChannelName,
              },
              rawNoteFields: {
                note: appointment.note,
                appointmentNote: appointment.appointmentNote,
                memberNote: appointment.memberNote,
                description: appointment.description,
              },
            });
          });
        }
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

  // Helper function to get member's note from appointment
  const getAppointmentMemberNote = (appointment) => {
    // Try various possible property paths for member note
    const possibleNotes = [
      appointment.note,
      appointment.appointmentNote,
      appointment.memberNote,
      appointment.member_note,
      appointment.userNote,
      appointment.user_note,
      appointment.bookingNote,
      appointment.booking_note,
      appointment.description,
      appointment.member?.note,
      appointment.user?.note,
      appointment.bookedBy?.note,
    ];

    // Find the first non-empty note
    for (const note of possibleNotes) {
      if (note && typeof note === "string" && note.trim() !== "") {
        return note.trim();
      }
    }

    return null; // Return null if no note found
  };

  // Helper: lấy thông tin video call đúng theo vai trò
  const getAgoraInfo = (appointment, isConsultant = false) => {
    const info = appointment.agoraInfo || {};
    return {
      appId: info.appId,
      channelName: info.channelName,
      token: isConsultant
        ? info.consultant?.token
        : info.member?.token,
      userId: isConsultant
        ? info.consultant?.userId
        : info.member?.userId,
    };
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

              // Lấy đúng thông tin video call
              const agora = getAgoraInfo(appointment);
              const hasAgoraChannel = !!agora.channelName;
              const hasAgoraToken = !!agora.token;

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

                  {getAppointmentMemberNote(appointment) && (
                    <div className="appointment-note">
                      <strong>Ghi chú:</strong>{" "}
                      {getAppointmentMemberNote(appointment)}
                    </div>
                  )}

                  {/* Video Call and Notes for Confirmed Appointments */}
                  {isConfirmed && (
                    <div className="appointment-features">
                      {hasAgoraChannel && hasAgoraToken && (
                        <button
                          onClick={() => {
                            setShowVideoCall(appointment);
                          }}
                          className="btn btn-primary btn-small">
                          <FontAwesomeIcon icon={faVideo} />
                          Tham gia video call
                        </button>
                      )}
                      {/* Debug Info button */}
                      <button
                        onClick={() => {
                          const agora = getAgoraInfo(appointment);
                          alert(`AGORA DEBUG INFO:\n\nApp ID: ${agora.appId}\nChannel Name: ${agora.channelName}\nToken: ${agora.token}\nUser ID: ${agora.userId}`);
                          console.log('AGORA DEBUG INFO:', agora);
                        }}
                        className="btn btn-warning btn-small"
                        style={{ marginLeft: 8 }}
                      >
                        Debug Info
                      </button>
                    </div>
                  )}

                  {/* Fallback meeting link if no Agora credentials */}
                  {appointment.meetLink &&
                    isConfirmed &&
                    !appointment.agoraChannelName && (
                      <div className="meeting-link">
                        <strong>Link tham gia:</strong>
                        <a
                          href={appointment.meetLink}
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

                  {/* Combined Actions Row - Notes and Cancel buttons */}
                  <div className="appointment-actions-row">
                    {isConfirmed && (
                      <button
                        onClick={() => setShowNotes(appointment)}
                        className="btn btn-secondary btn-small">
                        <FontAwesomeIcon icon={faStickyNote} />
                        Xem ghi chú
                      </button>
                    )}

                    {canCancel && (
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      {showVideoCall && (
        <div
          className="modal-overlay video-call-overlay"
          onClick={(e) => {
            // Only close if clicking directly on the overlay, not on modal content
            if (e.target === e.currentTarget) {
              console.log("Video call modal closed by overlay click");
              setShowVideoCall(null);
            }
          }}>
          <div
            className="modal-content video-call-modal"
            onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faVideo} />
                Video Call - {getConsultantName(showVideoCall)}
              </h3>
              <button
                className="modal-close"
                onClick={() => {
                  console.log(
                    "Video call modal closed by close button"
                  );
                  setShowVideoCall(null);
                }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                const agora = getAgoraInfo(showVideoCall);
                return (
                  <AgoraVideoCall
                    appointmentId={showVideoCall.id}
                    agoraAppId={agora.appId}
                    agoraChannelName={agora.channelName}
                    agoraToken={agora.token}
                    agoraUserId={agora.userId}
                    onCallEnd={() => setShowVideoCall(null)}
                    onError={(error) => {
                      setError("Lỗi video call: " + error.message);
                      setShowVideoCall(null);
                    }}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotes && (
        <div
          className="modal-overlay"
          onClick={() => setShowNotes(null)}>
          <div
            className="modal-content notes-modal"
            onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faStickyNote} />
                Ghi chú tư vấn - {getConsultantName(showNotes)}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowNotes(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <ConsultationNotes
                appointmentId={showNotes.id}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;

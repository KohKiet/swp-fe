import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faUser,
  faVideo,
  faStickyNote,
  faCheck,
  faTimes,
  faEdit,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import AgoraVideoCall from "./AgoraVideoCall";
import ConsultantNotes from "./ConsultantNotes";
import "./ConsultantAppointmentCard.css";
import { useAuth } from "../context/AuthContext";

const ConsultantAppointmentCard = ({
  appointment,
  onConfirm,
  onReject,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const { currentUser, isConsultant } = useAuth();

  // Helper: xác định vai trò hiện tại
  const isCurrentConsultant =
    typeof isConsultant === "function" ? isConsultant() : false;

  // Helper: lấy thông tin video call đúng theo vai trò
  const getAgoraInfo = () => {
    const info = appointment.agoraInfo || {};
    return {
      appId:
        info.appId ||
        appointment.agoraAppId ||
        appointment.AgoraAppId,
      channelName:
        info.channelName ||
        appointment.agoraChannelName ||
        appointment.ChannelName,
      token: isCurrentConsultant
        ? info.consultant?.token ||
          appointment.agoraToken ||
          appointment.AgoraToken
        : info.member?.token ||
          appointment.agoraToken ||
          appointment.AgoraToken,
      userId: isCurrentConsultant
        ? info.consultant?.userId
        : info.member?.userId,
      expireAt: appointment.agoraExpireAt,
    };
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
      case "completed":
        return "purple";
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
      case "completed":
        return "Đã hoàn thành";
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

  const getMemberName = (appointment) => {
    return (
      appointment.memberName ||
      appointment.member?.name ||
      appointment.member?.memberName ||
      "Thành viên"
    );
  };

  const statusColor = getStatusColor(appointment.status);
  const isPending = appointment.status?.toLowerCase() === "pending";
  const isConfirmed =
    appointment.status?.toLowerCase() === "confirmed";
  const isCompleted =
    appointment.status?.toLowerCase() === "completed";

  return (
    <>
      <div
        className={`consultant-appointment-card status-${statusColor}`}>
        <div className="appointment-header">
          <div className="member-info">
            <FontAwesomeIcon icon={faUser} />
            <div className="member-details">
              <div className="member-name">
                {getMemberName(appointment)}
              </div>
              <div className="appointment-type">Tư vấn cá nhân</div>
            </div>
          </div>
          <div className={`appointment-status status-${statusColor}`}>
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
            {formatTime(getAppointmentStartTime(appointment))} -{" "}
            {formatTime(getAppointmentEndTime(appointment))}
          </div>
        </div>

        {appointment.appointmentNote && (
          <div className="appointment-note">
            <strong>Ghi chú từ thành viên:</strong>{" "}
            {appointment.appointmentNote}
          </div>
        )}

        {/* Actions for different statuses */}
        {isPending && (
          <div className="appointment-actions">
            <button
              onClick={() => {
                const data = {
                  meetLink: "https://meet.google.com/xxx",
                }; // You can customize this
                onConfirm(appointment.id, data);
              }}
              className="btn btn-success btn-small">
              <FontAwesomeIcon icon={faCheck} />
              Xác nhận
            </button>
            <button
              onClick={() => {
                const reason = prompt("Lý do từ chối:");
                if (reason && reason.trim()) {
                  onReject(appointment.id, reason.trim());
                }
              }}
              className="btn btn-danger btn-small">
              <FontAwesomeIcon icon={faTimes} />
              Từ chối
            </button>
          </div>
        )}

        {/* Video call and notes for confirmed/completed appointments */}
        {(isConfirmed || isCompleted) && (
          <div className="consultant-features">
            {(appointment.agoraChannelName ||
              appointment.ChannelName) &&
              (appointment.agoraToken || appointment.AgoraToken) &&
              isConfirmed && (
                <button
                  onClick={() => setShowVideoCall(true)}
                  className="btn btn-primary btn-small">
                  <FontAwesomeIcon icon={faVideo} />
                  Tham gia video call
                </button>
              )}

            <button
              onClick={() => setShowNotes(true)}
              className="btn btn-secondary btn-small">
              <FontAwesomeIcon icon={faStickyNote} />
              Xem ghi chú
            </button>

            <button
              onClick={() => setShowCreateNote(true)}
              className="btn btn-info btn-small">
              <FontAwesomeIcon icon={faPlus} />
              Thêm ghi chú
            </button>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      {showVideoCall && (
        <div
          className="modal-overlay"
          onClick={() => setShowVideoCall(false)}>
          <div
            className="modal-content video-call-modal"
            onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faVideo} />
                Video Call - {getMemberName(appointment)}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowVideoCall(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {/* Lấy đúng thông tin video call theo vai trò */}
              {(() => {
                const agora = getAgoraInfo();
                return (
                  <AgoraVideoCall
                    appointmentId={appointment.id}
                    agoraAppId={agora.appId}
                    agoraChannelName={agora.channelName}
                    agoraToken={agora.token}
                    agoraUserId={agora.userId}
                    agoraExpireAt={agora.expireAt}
                    onCallEnd={() => setShowVideoCall(false)}
                    onError={(error) => {
                      console.error("Video call error:", error);
                      setShowVideoCall(false);
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
          onClick={() => setShowNotes(false)}>
          <div
            className="modal-content notes-modal"
            onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faStickyNote} />
                Ghi chú tư vấn - {getMemberName(appointment)}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowNotes(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <ConsultantNotes
                appointmentId={appointment.id}
                onCreateNote={onCreateNote}
                onUpdateNote={onUpdateNote}
                onDeleteNote={onDeleteNote}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateNote && (
        <CreateNoteModal
          appointmentId={appointment.id}
          memberName={getMemberName(appointment)}
          onClose={() => setShowCreateNote(false)}
          onSubmit={(noteData) => {
            onCreateNote(noteData);
            setShowCreateNote(false);
          }}
        />
      )}
    </>
  );
};

const CreateNoteModal = ({
  appointmentId,
  memberName,
  onClose,
  onSubmit,
}) => {
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        appointmentId,
        noteText: noteText.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content create-note-modal"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faPlus} />
            Thêm ghi chú - {memberName}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="noteText">Nội dung ghi chú:</label>
            <textarea
              id="noteText"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Nhập ghi chú về buổi tư vấn..."
              rows={8}
              required
              className="form-control"
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary">
              Hủy
            </button>
            <button
              type="submit"
              disabled={!noteText.trim() || isSubmitting}
              className="btn btn-primary">
              {isSubmitting ? "Đang lưu..." : "Lưu ghi chú"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultantAppointmentCard;

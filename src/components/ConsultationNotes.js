import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStickyNote,
  faCalendar,
  faUser,
  faSpinner,
  faExclamationTriangle,
  faFileText,
} from "@fortawesome/free-solid-svg-icons";
import { consultationService } from "../services/consultationService";
import "./ConsultationNotes.css";

const ConsultationNotes = ({ appointmentId, showTitle = true }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (appointmentId) {
      loadNotesForAppointment();
    } else {
      loadAllNotes();
    }
  }, [appointmentId]);

  const loadNotesForAppointment = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await consultationService.getMemberNotesByAppointment(
          appointmentId
        );

      if (response.success) {
        setNotes(response.data.data || []);
      } else {
        setError("Không thể tải ghi chú: " + response.error);
      }
    } catch (err) {
      setError("Lỗi khi tải ghi chú: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllNotes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await consultationService.getAllMemberNotes();

      if (response.success) {
        setNotes(response.data.data || []);
      } else {
        setError("Không thể tải ghi chú: " + response.error);
      }
    } catch (err) {
      setError("Lỗi khi tải ghi chú: " + err.message);
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
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  if (loading) {
    return (
      <div className="consultation-notes-loading">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="loading-icon"
        />
        <p>Đang tải ghi chú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consultation-notes-error">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="error-icon"
        />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="consultation-notes">
      {showTitle && (
        <div className="notes-header">
          <FontAwesomeIcon
            icon={faStickyNote}
            className="header-icon"
          />
          <h3>
            {appointmentId
              ? "Ghi chú buổi tư vấn"
              : "Tất cả ghi chú tư vấn"}
          </h3>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="no-notes">
          <FontAwesomeIcon
            icon={faFileText}
            className="no-notes-icon"
          />
          <p>
            {appointmentId
              ? "Chưa có ghi chú cho buổi tư vấn này"
              : "Bạn chưa có ghi chú tư vấn nào"}
          </p>
        </div>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <div className="note-info">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="consultant-icon"
                  />
                  <span className="consultant-name">
                    {note.consultantName || "Chuyên gia tư vấn"}
                  </span>
                </div>
                <div className="note-date">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="date-icon"
                  />
                  <span>{formatDate(note.createdAt)}</span>
                </div>
              </div>

              <div className="note-content">
                <p>{note.noteText}</p>
              </div>

              {note.updatedAt &&
                note.updatedAt !== note.createdAt && (
                  <div className="note-updated">
                    <small>
                      Cập nhật lần cuối: {formatDate(note.updatedAt)}
                    </small>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultationNotes;

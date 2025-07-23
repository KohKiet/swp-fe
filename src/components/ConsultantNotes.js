import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStickyNote,
  faCalendar,
  faUser,
  faSpinner,
  faExclamationTriangle,
  faFileText,
  faEdit,
  faTrash,
  faPlus,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { consultationService } from "../services/consultationService";
import "./ConsultantNotes.css";

const ConsultantNotes = ({
  appointmentId,
  showTitle = true,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (appointmentId) {
      loadNotesForAppointment();
    } else {
      loadAllConsultantNotes();
    }
  }, [appointmentId]);

  const loadNotesForAppointment = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await consultationService.getNotesByAppointment(
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

  const loadAllConsultantNotes = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await consultationService.getAllConsultantNotes();

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

  const handleEditNote = (note) => {
    setEditingNote(note.id);
    setEditText(note.noteText);
  };

  const handleSaveEdit = async (noteId) => {
    if (!editText.trim()) return;

    try {
      const response = await consultationService.updateNote(noteId, {
        noteText: editText.trim(),
      });

      if (response.success) {
        // Update local state
        setNotes(
          notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  noteText: editText.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : note
          )
        );
        setEditingNote(null);
        setEditText("");

        if (onUpdateNote) {
          onUpdateNote(noteId, { noteText: editText.trim() });
        }
      } else {
        setError("Không thể cập nhật ghi chú: " + response.error);
      }
    } catch (err) {
      setError("Lỗi khi cập nhật ghi chú: " + err.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
      return;
    }

    try {
      const response = await consultationService.deleteNote(noteId);

      if (response.success) {
        setNotes(notes.filter((note) => note.id !== noteId));

        if (onDeleteNote) {
          onDeleteNote(noteId);
        }
      } else {
        setError("Không thể xóa ghi chú: " + response.error);
      }
    } catch (err) {
      setError("Lỗi khi xóa ghi chú: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditText("");
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
      <div className="consultant-notes-loading">
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
      <div className="consultant-notes-error">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="error-icon"
        />
        <p>{error}</p>
        <button
          onClick={() => setError("")}
          className="btn btn-secondary btn-small">
          Đóng
        </button>
      </div>
    );
  }

  return (
    <div className="consultant-notes">
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
            <div key={note.id} className="consultant-note-card">
              <div className="note-header">
                <div className="note-info">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="member-icon"
                  />
                  <span className="member-name">
                    {note.memberName || "Thành viên"}
                  </span>
                </div>
                <div className="note-actions">
                  {editingNote === note.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="btn btn-success btn-small"
                        disabled={!editText.trim()}>
                        <FontAwesomeIcon icon={faSave} />
                        Lưu
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-secondary btn-small">
                        <FontAwesomeIcon icon={faTimes} />
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditNote(note)}
                        className="btn btn-info btn-small">
                        <FontAwesomeIcon icon={faEdit} />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn btn-danger btn-small">
                        <FontAwesomeIcon icon={faTrash} />
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="note-date">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="date-icon"
                />
                <span>{formatDate(note.createdAt)}</span>
              </div>

              <div className="note-content">
                {editingNote === note.id ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="note-edit-textarea"
                    rows={6}
                    placeholder="Nhập ghi chú..."
                  />
                ) : (
                  <p>{note.noteText}</p>
                )}
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

export default ConsultantNotes;

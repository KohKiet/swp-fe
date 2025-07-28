
// Import các thư viện cần thiết
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import './styles/EventFeedbackList.css';


/**
 * Trang quản lý đánh giá sự kiện (chỉ dành cho staff)
 * - Hiển thị danh sách feedback, thống kê, phân phối rating
 * - Cho phép xóa feedback
 * - Có thể chọn sự kiện để xem feedback tương ứng
 * Props:
 *   - eventId: nếu truyền vào sẽ chỉ xem feedback của 1 sự kiện cụ thể
 *   - eventTitle: tên sự kiện (nếu có)
 */
const EventFeedbackListPage = ({ eventId, eventTitle }) => {
  // Lấy hàm kiểm tra quyền staff từ context
  const { isStaff } = useAuth();
  // State lưu danh sách feedback của sự kiện đang chọn
  const [feedbacks, setFeedbacks] = useState([]);
  // State loading khi tải dữ liệu
  const [loading, setLoading] = useState(true);
  // State lỗi khi gọi API
  const [error, setError] = useState(null);
  // Sự kiện đang được chọn (nếu có eventId thì lấy luôn)
  const [selectedEvent, setSelectedEvent] = useState(eventId ? { id: eventId, title: eventTitle } : null);
  // Danh sách tất cả sự kiện (dùng cho staff chọn)
  const [events, setEvents] = useState([]);
  // Thống kê feedback: điểm TB, tổng số, phân phối rating
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });


  // Khi không truyền eventId, tự động tải danh sách sự kiện cho staff chọn
  useEffect(() => {
    if (!eventId) {
      loadEvents();
    }
  }, [eventId]);

  // Khi đã chọn sự kiện, tải feedback của sự kiện đó
  useEffect(() => {
    if (selectedEvent?.id) {
      loadEventFeedback(selectedEvent.id);
    }
  }, [selectedEvent]);


  // Hàm tải danh sách sự kiện (dành cho staff)
  const loadEvents = async () => {
    try {
      const response = await eventService.getAllEvents();
      if (response && response.success) {
        setEvents(response.data || []);
        // Nếu có sự kiện, tự động chọn sự kiện đầu tiên
        if (response.data && response.data.length > 0) {
          setSelectedEvent(response.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Không thể tải danh sách sự kiện');
    }
  };


  // Hàm tải feedback của 1 sự kiện, đồng thời tính toán thống kê
  const loadEventFeedback = async (eventId) => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      // Gọi API lấy feedback
      const feedbackResponse = await eventService.getFeedbackByEvent(eventId);
      let feedbackData = [];
      if (feedbackResponse && feedbackResponse.success) {
        feedbackData = feedbackResponse.data || [];
      }
      setFeedbacks(feedbackData);
      // Tính toán thống kê: điểm TB, tổng số, phân phối rating
      if (feedbackData.length > 0) {
        const totalRating = feedbackData.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
        const avgRating = totalRating / feedbackData.length;
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbackData.forEach(feedback => {
          if (feedback.rating >= 1 && feedback.rating <= 5) {
            distribution[feedback.rating]++;
          }
        });
        setStats({
          averageRating: avgRating,
          totalFeedbacks: feedbackData.length,
          ratingDistribution: distribution
        });
      } else {
        setStats({
          averageRating: 0,
          totalFeedbacks: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
    } catch (err) {
      console.error('Error loading event feedback:', err);
      setError('Không thể tải đánh giá của sự kiện');
    } finally {
      setLoading(false);
    }
  };


  // Hàm xóa feedback (chỉ staff mới có quyền)
  const handleDeleteFeedback = async (feedbackId) => {
    // Xác nhận trước khi xóa
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }
    try {
      const response = await eventService.deleteFeedback(feedbackId);
      if (response && response.success) {
        // Xóa thành công, reload lại danh sách feedback
        if (selectedEvent?.id) {
          loadEventFeedback(selectedEvent.id);
        }
      } else {
        alert('Không thể xóa đánh giá');
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Đã xảy ra lỗi khi xóa đánh giá');
    }
  };


  // Hàm định dạng ngày giờ cho hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Hàm render icon sao cho điểm rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };


  // Nếu không phải staff thì không cho truy cập trang này
  if (!isStaff()) {
    return (
      <div className="feedback-list-container">
        <div className="access-denied">
          <h2>Truy cập bị từ chối</h2>
          <p>Bạn cần quyền Staff để xem trang này.</p>
        </div>
      </div>
    );
  }

  // Giao diện chính của trang quản lý feedback sự kiện
  return (
    <div className="feedback-list-container">
      {/* Header trang */}
      <div className="feedback-list-header">
        <h1>📊 Quản lý đánh giá sự kiện</h1>
        <p>Xem và quản lý tất cả đánh giá từ người tham gia</p>
      </div>

      {/* Bộ chọn sự kiện (chỉ hiện khi không truyền eventId) */}
      {!eventId && events.length > 0 && (
        <div className="event-selector">
          <label htmlFor="event-select">Chọn sự kiện:</label>
          <select
            id="event-select"
            value={selectedEvent?.id || ''}
            onChange={(e) => {
              const event = events.find(ev => ev.id === e.target.value);
              setSelectedEvent(event);
            }}
            className="event-select-input"
          >
            <option value="">-- Chọn sự kiện --</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} ({formatDate(event.startTime || event.startDate)})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Thông tin sự kiện đang chọn */}
      {selectedEvent && (
        <div className="selected-event-info">
          <h2>📅 {selectedEvent.title}</h2>
          {selectedEvent.startTime && (
            <p className="event-date">🕒 {formatDate(selectedEvent.startTime)}</p>
          )}
        </div>
      )}

      {/* Thống kê feedback: tổng số, điểm TB, phân phối rating */}
      {selectedEvent && !loading && (
        <div className="feedback-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalFeedbacks}</div>
              <div className="stat-label">Tổng đánh giá</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0'}
              </div>
              <div className="stat-label">Điểm trung bình</div>
              <div className="stat-stars">
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
          </div>
          {/* Phân phối rating theo số sao */}
          {stats.totalFeedbacks > 0 && (
            <div className="rating-distribution">
              <h3>Phân bố đánh giá</h3>
              <div className="distribution-bars">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="distribution-row">
                    <span className="rating-label">{rating} ⭐</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{
                          width: `${stats.totalFeedbacks > 0 ? (stats.ratingDistribution[rating] / stats.totalFeedbacks) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="count-label">({stats.ratingDistribution[rating]})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="error-message">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading khi đang tải dữ liệu */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải đánh giá...</p>
        </div>
      )}

      {/* Danh sách feedback của sự kiện */}
      {!loading && selectedEvent && (
        <div className="feedback-list">
          {feedbacks.length > 0 ? (
            <div className="feedbacks-grid">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="feedback-card">
                  {/* Header: thông tin người gửi và nút xóa */}
                  <div className="feedback-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {feedback.userDisplayName ? feedback.userDisplayName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="user-details">
                        <h4>{feedback.userDisplayName || 'Người dùng ẩn danh'}</h4>
                        <p className="feedback-date">{formatDate(feedback.submittedAt || feedback.createdAt)}</p>
                      </div>
                    </div>
                    <div className="feedback-actions">
                      <button
                        className="btn-delete-feedback"
                        onClick={() => handleDeleteFeedback(feedback.id)}
                        title="Xóa đánh giá"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Rating sao và điểm số */}
                  <div className="feedback-rating">
                    <div className="stars">
                      {renderStars(feedback.rating || 0)}
                    </div>
                    <span className="rating-text">{feedback.rating || 0}/5</span>
                  </div>
                  {/* Comment nếu có */}
                  {feedback.comment && (
                    <div className="feedback-comment">
                      <p>"{feedback.comment}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>Chưa có đánh giá nào</h3>
              <p>Sự kiện này chưa có đánh giá từ người tham gia.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Export component để sử dụng ở các trang quản lý sự kiện
export default EventFeedbackListPage;

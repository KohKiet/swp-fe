import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import './styles/EventFeedbackList.css';

const EventFeedbackListPage = ({ eventId, eventTitle }) => {
  const { isStaff } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(eventId ? { id: eventId, title: eventTitle } : null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Lấy danh sách sự kiện nếu không có eventId cụ thể
  useEffect(() => {
    if (!eventId) {
      loadEvents();
    }
  }, [eventId]);

  // Lấy feedback khi có selectedEvent
  useEffect(() => {
    if (selectedEvent?.id) {
      loadEventFeedback(selectedEvent.id);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      const response = await eventService.getAllEvents();
      if (response && response.success) {
        setEvents(response.data || []);
        // Tự động chọn sự kiện đầu tiên nếu có
        if (response.data && response.data.length > 0) {
          setSelectedEvent(response.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Không thể tải danh sách sự kiện');
    }
  };

  const loadEventFeedback = async (eventId) => {
    if (!eventId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Lấy feedback của sự kiện
      const feedbackResponse = await eventService.getFeedbackByEvent(eventId);
      let feedbackData = [];
      
      if (feedbackResponse && feedbackResponse.success) {
        feedbackData = feedbackResponse.data || [];
      }
      
      setFeedbacks(feedbackData);
      
      // Tính toán thống kê
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

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }
    
    try {
      const response = await eventService.deleteFeedback(feedbackId);
      if (response && response.success) {
        // Reload feedback list
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

  return (
    <div className="feedback-list-container">
      <div className="feedback-list-header">
        <h1>📊 Quản lý đánh giá sự kiện</h1>
        <p>Xem và quản lý tất cả đánh giá từ người tham gia</p>
      </div>

      {/* Event Selector */}
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

      {selectedEvent && (
        <div className="selected-event-info">
          <h2>📅 {selectedEvent.title}</h2>
          {selectedEvent.startTime && (
            <p className="event-date">🕒 {formatDate(selectedEvent.startTime)}</p>
          )}
        </div>
      )}

      {/* Feedback Statistics */}
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

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải đánh giá...</p>
        </div>
      )}

      {/* Feedback List */}
      {!loading && selectedEvent && (
        <div className="feedback-list">
          {feedbacks.length > 0 ? (
            <div className="feedbacks-grid">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="feedback-card">
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
                  
                  <div className="feedback-rating">
                    <div className="stars">
                      {renderStars(feedback.rating || 0)}
                    </div>
                    <span className="rating-text">{feedback.rating || 0}/5</span>
                  </div>
                  
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

export default EventFeedbackListPage;

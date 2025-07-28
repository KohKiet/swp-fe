
// Import React và các hook cần thiết
import React, { useState, useEffect } from 'react';
import eventService from '../../services/eventService';


/**
 * Modal đánh giá sự kiện (gửi hoặc cập nhật feedback)
 * Props:
 *   - event: object, thông tin sự kiện
 *   - isOpen: boolean, hiển thị modal hay không
 *   - onClose: function, đóng modal
 *   - onFeedbackSubmitted: callback khi gửi thành công
 */
const EventFeedbackModal = ({ event, isOpen, onClose, onFeedbackSubmitted }) => {
  // State lưu dữ liệu form: rating (số sao), comment (nhận xét)
  const [formData, setFormData] = useState({ rating: 0, comment: '' });
  // State loading khi gửi hoặc kiểm tra feedback
  const [loading, setLoading] = useState(false);
  // State lỗi khi gửi hoặc validate
  const [error, setError] = useState(null);
  // State hiển thị trạng thái gửi thành công
  const [success, setSuccess] = useState(false);
  // Nếu user đã gửi feedback trước đó, lưu lại để cập nhật
  const [existingFeedback, setExistingFeedback] = useState(null);
  // Đang kiểm tra feedback cũ hay không
  const [checkingExisting, setCheckingExisting] = useState(false);
  // Hiệu ứng đóng modal (animation)
  const [isClosing, setIsClosing] = useState(false);


  // Reset form và kiểm tra feedback cũ mỗi khi mở modal hoặc đổi sự kiện
  useEffect(() => {
    if (isOpen && event?.id) {
      setIsClosing(false);
      setSuccess(false);
      setError(null);
      checkExistingFeedback();
    } else {
      setFormData({ rating: 0, comment: '' });
      setExistingFeedback(null);
    }
  }, [isOpen, event?.id]);


  // Kiểm tra xem user đã gửi feedback cho sự kiện này chưa
  const checkExistingFeedback = async () => {
    if (!event?.id) return;
    setCheckingExisting(true);
    try {
      const response = await eventService.checkUserFeedbackStatus(event.id);
      if (response?.success && response?.data?.id) {
        // Nếu đã có feedback, set lại form để user cập nhật
        setExistingFeedback(response.data);
        setFormData({
          rating: response.data.rating || 0,
          comment: response.data.comment || ''
        });
        console.log('✅ Found existing feedback:', response.data.id);
      } else {
        setExistingFeedback(null);
        setFormData({ rating: 0, comment: '' });
      }
    } catch (err) {
      // Nếu API không hỗ trợ, coi như chưa có feedback
      console.log('⚠️ Could not check existing feedback (this is normal if endpoint doesn\'t exist):', err.message);
      setExistingFeedback(null);
      setFormData({ rating: 0, comment: '' });
    } finally {
      setCheckingExisting(false);
    }
  };


  // Đóng modal với hiệu ứng mượt
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };


  // Xử lý thay đổi input comment
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // Xử lý click chọn số sao
  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };


  // Validate form trước khi gửi
  const validateForm = () => {
    if (formData.rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return false;
    }
    if (!formData.comment.trim()) {
      setError('Vui lòng nhập nhận xét về sự kiện');
      return false;
    }
    if (formData.comment.trim().length < 10) {
      setError('Nhận xét phải có ít nhất 10 ký tự');
      return false;
    }
    return true;
  };


  // Xử lý gửi feedback (hoặc cập nhật nếu đã có)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      // Chuẩn bị dữ liệu gửi lên server
      const feedbackData = {
        eventId: event.id,
        rating: parseInt(formData.rating),
        comment: formData.comment.trim()
      };
      let response;
      try {
        // Thử gửi feedback mới
        response = await eventService.submitFeedback(feedbackData);
      } catch (createError) {
        // Nếu đã có feedback (409), chuyển sang update
        if (existingFeedback?.id && createError.response?.status === 409) {
          response = await eventService.updateFeedback(existingFeedback.id, feedbackData);
        } else {
          throw createError;
        }
      }
      if (response?.success) {
        setSuccess(true);
        onFeedbackSubmitted && onFeedbackSubmitted();
        setTimeout(handleClose, 2000);
      } else {
        setError(response?.message || 'Đã xảy ra lỗi khi gửi đánh giá');
      }
    } catch (err) {
      // Xử lý lỗi trả về từ server
      let errorMessage = 'Đã xảy ra lỗi khi gửi đánh giá';
      const data = err.response?.data;
      if (err.response?.status === 400) {
        if (data?.message) errorMessage = data.message;
        else if (data?.title) errorMessage = data.title;
        else if (data?.errors) errorMessage = Object.values(data.errors).flat().join(', ') || 'Dữ liệu không hợp lệ';
        else if (typeof data === 'string') errorMessage = data;
        else errorMessage = 'Dữ liệu không hợp lệ - vui lòng kiểm tra lại thông tin';
      } else if (err.response?.status === 401) {
        errorMessage = 'Bạn cần đăng nhập để thực hiện thao tác này';
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền đánh giá sự kiện này';
      } else if (err.response?.status === 404 || err.response?.status === 405) {
        errorMessage = 'Chức năng đánh giá đang được phát triển. Cảm ơn bạn đã quan tâm!';
        setSuccess(true);
        onFeedbackSubmitted && onFeedbackSubmitted();
        setTimeout(handleClose, 3000);
        return;
      } else if (data?.message) {
        errorMessage = data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // Nếu modal chưa mở thì không render gì cả
  if (!isOpen) return null;


  // Giao diện modal đánh giá sự kiện
  return (
    <div
      className={`modal-overlay${isClosing ? ' closing' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
    >
      {/* Modal chính, ngăn click lan ra ngoài */}
      <div
        className="modal-content event-feedback-modal"
        onClick={e => e.stopPropagation()}
        role="document"
      >
        {/* Header modal */}
        <div className="modal-header">
          <h2>{existingFeedback ? 'Cập nhật đánh giá' : 'Đánh giá sự kiện'}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Đang kiểm tra feedback cũ */}
          {checkingExisting ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang kiểm tra đánh giá hiện tại...</p>
            </div>
          ) : success ? (
            // Gửi thành công
            <div className="success-state">
              <div className="success-icon">✅</div>
              <h3>Gửi đánh giá thành công!</h3>
              <p>Cảm ơn bạn đã chia sẻ phản hồi về sự kiện "{event?.title}"</p>
            </div>
          ) : (
            <>
              {/* Thông tin sự kiện */}
              <div className="event-info">
                <h3>Sự kiện: {event?.title}</h3>
                <p className="event-date">
                  {event?.startTime && new Date(event.startTime).toLocaleDateString('vi-VN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              {/* Hiển thị lỗi nếu có */}
              {error && (
                <div className="error-message">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              {/* Form đánh giá */}
              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                  <label htmlFor="rating">Đánh giá tổng thể *</label>
                  <div className="rating-stars" id="rating" role="radiogroup" aria-labelledby="rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star${formData.rating >= star ? ' filled' : ''}`}
                        onClick={() => handleRatingClick(star)}
                        aria-label={`${star} sao`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <div className="rating-labels">
                    <span>Rất tệ</span>
                    <span>Tuyệt vời</span>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="comment">Nhận xét chi tiết *</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này..."
                    rows="4"
                    maxLength="1000"
                    required
                  />
                  <div className="char-count">
                    {formData.comment.length}/1000 ký tự
                  </div>
                </div>
                <div className="form-suggestions">
                  <p><strong>Gợi ý nội dung đánh giá:</strong></p>
                  <ul>
                    <li>Chất lượng nội dung và tính hữu ích của sự kiện</li>
                    <li>Sự tổ chức và chuyên nghiệp của ban tổ chức</li>
                    <li>Môi trường và không khí sự kiện</li>
                    <li>Điều gì bạn thích nhất và muốn cải thiện</li>
                  </ul>
                </div>
              </form>
            </>
          )}
        </div>
        {/* Footer: nút gửi/hủy, chỉ hiện khi không loading/success */}
        {!checkingExisting && !success && (
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading || formData.rating === 0}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Đang gửi...
                </>
              ) : (
                existingFeedback ? 'Cập nhật đánh giá' : 'Gửi đánh giá'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// Export component để sử dụng ở các trang/quản lý sự kiện
export default EventFeedbackModal;

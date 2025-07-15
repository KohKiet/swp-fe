import React, { useState, useEffect } from 'react';
import eventService from '../../services/eventService';

const EventManagementModal = ({ 
  isOpen, 
  onClose, 
  eventToEdit = null, 
  onEventSaved,
  mode = 'create' // 'create' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    onlineLink: '',
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Helper: format datetime cho input và backend
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
    } catch {
      return null;
    }
  };

  const emptyForm = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    onlineLink: '',
    imageUrl: ''
  };

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && eventToEdit) {
      setFormData({
        title: eventToEdit.title || '',
        description: eventToEdit.description || '',
        startTime: formatDateTimeLocal(eventToEdit.startTime || eventToEdit.startDate),
        endTime: formatDateTimeLocal(eventToEdit.endTime || eventToEdit.endDate),
        location: eventToEdit.location || '',
        onlineLink: eventToEdit.onlineLink || '',
        imageUrl: eventToEdit.imageUrl || ''
      });
      setImagePreview(eventToEdit.imageUrl || null);
    } else {
      setFormData({ ...emptyForm });
      setImagePreview(null);
    }
    setError(null);
  }, [mode, eventToEdit, isOpen]);

  // Remove selected image
  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return setError('Tiêu đề sự kiện là bắt buộc'), false;
    if (!formData.description.trim()) return setError('Mô tả sự kiện là bắt buộc'), false;
    if (!formData.startTime) return setError('Thời gian bắt đầu là bắt buộc'), false;
    if (formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime))
      return setError('Thời gian kết thúc phải sau thời gian bắt đầu'), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: formatDateTime(formData.startTime),
        endTime: formData.endTime ? formatDateTime(formData.endTime) : null,
        location: formData.location.trim() || null,
        onlineLink: formData.onlineLink.trim() || null,
        imageUrl: formData.imageUrl || null
      };

      // Validate required fields
      if (!eventData.startTime) {
        setError('Thời gian bắt đầu không hợp lệ');
        return;
      }

      let response;
      if (mode === 'edit' && eventToEdit?.id) {
        response = await eventService.updateEvent(eventToEdit.id, eventData);
      } else {
        response = await eventService.createEvent(eventData);
      }

      if (response && response.success) {
        onEventSaved && onEventSaved(response.data);
        onClose();
        
        // Reset form
        setFormData({ ...emptyForm });
        setImagePreview(null);
      } else {
        setError(response?.message || `Lỗi khi ${mode === 'edit' ? 'cập nhật' : 'tạo'} sự kiện`);
      }
    } catch (err) {
      console.error(`${mode === 'edit' ? 'Update' : 'Create'} event error:`, err);
      console.error('Error response:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        config: err.config
      });
      
      let errorMessage = `Đã xảy ra lỗi khi ${mode === 'edit' ? 'cập nhật' : 'tạo'} sự kiện`;
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.join(', ');
        } else if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        }
      } else if (err.response?.status === 400) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền tạo sự kiện. Vui lòng liên hệ quản trị viên.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="event-management-modal" onClick={(e) => e.stopPropagation()} style={{
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form" style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}>
          <div className="modal-body" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            maxHeight: 'calc(90vh - 120px)' // Trừ đi chiều cao header và footer
          }}>
            {error && (
              <div className="error-message mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title">Tiêu đề sự kiện *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề sự kiện"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả sự kiện *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả sự kiện"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Ảnh sự kiện</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => {
                  handleInputChange(e);
                  // Update image preview when URL changes
                  if (e.target.value) {
                    setImagePreview(e.target.value);
                  } else {
                    setImagePreview(null);
                  }
                }}
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl && (
                <div className="image-preview" style={{
                  margin: '16px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '400px',
                  minHeight: '120px',
                  maxHeight: '260px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: '#f8fafc',
                }}>
                  <img 
                    src={formData.imageUrl} 
                    alt="Event preview" 
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '240px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      background: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none', padding: '20px', textAlign: 'center', color: '#999' }}>
                    Không thể tải ảnh
                  </div>
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={removeImage}
                    title="Xóa ảnh"
                    style={{ marginTop: '8px' }}
                  >
                    ×
                  </button>
                </div>
              )}
              <small className="form-text">
                Nhập URL ảnh (JPG, PNG, GIF).
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Thời gian bắt đầu *</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime">Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Địa điểm</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Nhập địa điểm tổ chức"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="onlineLink">Link tham gia online</label>
                <input
                  type="url"
                  id="onlineLink"
                  name="onlineLink"
                  value={formData.onlineLink}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (mode === 'edit' ? 'Hoàn tất chỉnh sửa' : 'Tạo sự kiện')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventManagementModal;

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
    maxParticipants: '',
    onlineLink: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && eventToEdit) {
      const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.error('Invalid date for formatting:', dateString);
            return '';
          }
          
          // Lấy thời gian địa phương (không chuyển đổi múi giờ)
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          console.log('Formatting datetime:', {
            original: dateString,
            parsed: date.toISOString(),
            formatted: `${year}-${month}-${day}T${hours}:${minutes}`
          });
          
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
          console.error('Error formatting datetime:', dateString, e);
          return '';
        }
      };

      setFormData({
        title: eventToEdit.title || '',
        description: eventToEdit.description || '',
        startTime: formatDateTimeLocal(eventToEdit.startTime || eventToEdit.startDate),
        endTime: formatDateTimeLocal(eventToEdit.endTime || eventToEdit.endDate),
        location: eventToEdit.location || '',
        maxParticipants: eventToEdit.maxParticipants || '',
        onlineLink: eventToEdit.onlineLink || ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: '',
        onlineLink: ''
      });
    }
    setError(null);
  }, [mode, eventToEdit, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Tiêu đề sự kiện là bắt buộc');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Mô tả sự kiện là bắt buộc');
      return false;
    }
    if (!formData.startTime) {
      setError('Thời gian bắt đầu là bắt buộc');
      return false;
    }
    if (formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return false;
    }
    if (formData.maxParticipants && (isNaN(formData.maxParticipants) || parseInt(formData.maxParticipants) <= 0)) {
      setError('Số lượng tham gia tối đa phải là số dương');
      return false;
    }
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
      // Format datetime cho backend (giữ múi giờ địa phương)
      const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return null;
        try {
          const date = new Date(dateTimeString);
          // Kiểm tra xem date có hợp lệ không
          if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateTimeString);
            return null;
          }
          
          // Chuyển đổi sang ISO string nhưng điều chỉnh múi giờ
          // Để tránh lệch múi giờ, ta sẽ tạo ISO string từ các thành phần địa phương
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          
          // Trả về format ISO nhưng với thời gian địa phương + múi giờ Việt Nam
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
        } catch (e) {
          console.error('Invalid datetime format:', dateTimeString, e);
          return null;
        }
      };

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: formatDateTime(formData.startTime),
        endTime: formData.endTime ? formatDateTime(formData.endTime) : null,
        location: formData.location.trim() || null,
        onlineLink: formData.onlineLink.trim() || null
      };

      // Chỉ thêm maxParticipants nếu có giá trị
      if (formData.maxParticipants && parseInt(formData.maxParticipants) > 0) {
        eventData.maxParticipants = parseInt(formData.maxParticipants);
      }

      // Validate required fields
      if (!eventData.startTime) {
        setError('Thời gian bắt đầu không hợp lệ');
        return;
      }

      // Debug logging
      console.log('🚀 Sending event data:', {
        mode,
        eventData,
        originalFormData: formData,
        eventToEdit: eventToEdit?.id
      });

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
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          location: '',
          maxParticipants: '',
          onlineLink: ''
        });
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
                <label htmlFor="maxParticipants">Số lượng tham gia tối đa</label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="0 = Không giới hạn"
                  min="0"
                />
              </div>
              
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

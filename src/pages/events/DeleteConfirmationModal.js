import React from 'react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  eventTitle,
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-confirmation-content">
          <svg className="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          
          <h3>Xác nhận xóa sự kiện</h3>
          <p>
            Bạn có chắc chắn muốn xóa sự kiện <strong>"{eventTitle}"</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </p>
          
          <div className="delete-confirmation-actions">
            <button 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              className="btn-confirm-delete" 
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Đang xóa...' : 'Xóa sự kiện'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

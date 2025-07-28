
// Import React để sử dụng JSX và component
import React from 'react';


/**
 * DeleteConfirmationModal
 * Modal xác nhận xóa sự kiện, dùng cho các thao tác nguy hiểm (xóa vĩnh viễn)
 * Props:
 *   - isOpen: boolean, hiển thị modal hay không
 *   - onClose: function, đóng modal
 *   - onConfirm: function, xác nhận xóa
 *   - eventTitle: string, tên sự kiện hiển thị trong nội dung
 *   - loading: boolean, trạng thái loading khi đang xóa
 */
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  eventTitle,
  loading = false 
}) => {
  // Nếu modal chưa mở thì không render gì cả
  if (!isOpen) return null;

  // Render modal xác nhận xóa
  return (
    // Overlay mờ nền, click ra ngoài sẽ đóng modal
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal chính, ngăn sự kiện click lan ra ngoài overlay */}
      <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-confirmation-content">
          {/* Icon cảnh báo màu vàng */}
          <svg className="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          {/* Tiêu đề xác nhận */}
          <h3>Xác nhận xóa sự kiện</h3>
          {/* Nội dung cảnh báo, hiển thị tên sự kiện */}
          <p>
            Bạn có chắc chắn muốn xóa sự kiện <strong>"{eventTitle}"</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </p>
          {/* Nhóm nút hành động */}
          <div className="delete-confirmation-actions">
            {/* Nút hủy, đóng modal */}
            <button 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            {/* Nút xác nhận xóa, hiển thị loading nếu đang xử lý */}
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


// Export component để sử dụng ở các trang/quản lý sự kiện
export default DeleteConfirmationModal;

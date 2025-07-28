
// Import các thư viện cần thiết
import React from 'react'; // React core
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Dùng để lấy state, chuyển trang, và tạo link
import './styles/survey.css'; // Import CSS cho giao diện khảo sát


// Component hiển thị kết quả khảo sát sau khi người dùng hoàn thành
const SurveyResultsPage = () => {
  // Lấy state truyền qua khi chuyển trang (kết quả khảo sát)
  const { state } = useLocation();
  // Hook để chuyển trang
  const navigate = useNavigate();
  // Lấy kết quả khảo sát từ state
  const result = state?.result;

  // Nếu không có kết quả (truy cập trực tiếp), chuyển về trang khảo sát
  if (!result) {
    navigate('/surveys');
    return null;
  }

  // Hiển thị giao diện kết quả khảo sát
  return (
    <div>
      {/* Banner tiêu đề trang */}
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Kết Quả Khảo Sát</h1>
          <p className="survey-banner-subtitle">Phân tích và đánh giá từ bài khảo sát của bạn</p>
        </div>
      </div>
      
      <div className="survey-root">
        <div className="survey-container survey-results-container">
          {/* Tiêu đề kết quả khảo sát */}
          <div className="survey-title survey-title-center">
            <span role="img" aria-label="result">
              🎉
            </span>{' '}
            Kết quả khảo sát
          </div>
          {/* Thông tin tổng kết kết quả khảo sát */}
          <div className="survey-results-summary">
            <b>Mức độ rủi ro:</b>{' '}
            <span className="survey-results-risk">
              {result.riskLevel}
            </span>{' '}
            <br />
            <b>Đề xuất:</b>{' '}
            <span className="survey-results-suggestion">
              {result.suggestedAction}
            </span>{' '}
            <br />
            {/* Ngày nộp khảo sát, định dạng ngày Việt Nam */}
            <b>Ngày nộp:</b> {new Date(result.submittedAt).toLocaleDateString('vi-VN')}
          </div>
          {/* Các nút hành động sau khi xem kết quả */}
          <div className="survey-action-buttons">
            {/* Nút đặt lịch tư vấn */}
            <Link to="/counseling" className="survey-action-btn survey-action-btn--primary">
              <span role="img" aria-label="calendar">📅</span> Đặt lịch tư vấn ngay
            </Link>
            {/* Nút xem khóa học phù hợp */}
            <Link to="/education" className="survey-action-btn survey-action-btn--secondary">
              <span role="img" aria-label="book">📚</span> Xem khóa học phù hợp
            </Link>
            {/* Nút quay lại trang khảo sát */}
            <button
              className="survey-action-btn survey-action-btn--secondary"
              onClick={() => navigate('/surveys')}
            >
              <span role="img" aria-label="back">↩️</span> Quay lại trang khảo sát
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export component để sử dụng ở nơi khác
export default SurveyResultsPage;

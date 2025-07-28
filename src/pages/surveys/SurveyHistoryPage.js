
// Import các thư viện cần thiết
import React, { useEffect, useState } from 'react'; // React core và các hook
import surveyService from '../../services/surveyService'; // Service để gọi API lấy dữ liệu khảo sát
import { Link } from 'react-router-dom'; // Dùng để chuyển trang trong SPA
import './styles/survey.css'; // Import CSS cho giao diện khảo sát


// Component hiển thị lịch sử các khảo sát đã làm của người dùng
const SurveyHistoryPage = () => {
  // State lưu danh sách lịch sử khảo sát
  const [history, setHistory] = useState([]);
  // State kiểm soát trạng thái loading khi lấy dữ liệu
  const [loading, setLoading] = useState(true);
  // State lưu thông báo lỗi nếu có lỗi khi lấy dữ liệu
  const [error, setError] = useState(null);

  // Khi component mount, gọi API lấy lịch sử khảo sát
  useEffect(() => {
    surveyService.getHistory()
      .then(setHistory) // Nếu thành công, lưu dữ liệu vào state history
      .catch(() => setError('Không thể tải lịch sử khảo sát')) // Nếu lỗi, lưu thông báo lỗi
      .finally(() => setLoading(false)); // Kết thúc loading dù thành công hay thất bại
  }, []);
  // Nếu đang loading, hiển thị giao diện chờ
  if (loading) return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Lịch Sử Khảo Sát</h1>
          <p className="survey-banner-subtitle">Xem lại các khảo sát bạn đã hoàn thành</p>
        </div>
      </div>
      <div className="survey-root">
        <div className="survey-container">
          <div className="survey-title survey-title-center">
            <span role="img" aria-label="history">📜</span> Đang tải lịch sử...
          </div>
        </div>
      </div>
    </div>
  );
  
  // Nếu có lỗi khi lấy dữ liệu, hiển thị thông báo lỗi
  if (error) return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Lịch Sử Khảo Sát</h1>
          <p className="survey-banner-subtitle">Xem lại các khảo sát bạn đã hoàn thành</p>
        </div>
      </div>
      <div className="survey-root">
        <div className="survey-container survey-alert">{error}</div>
      </div>
    </div>
  );
  
  // Nếu không có lịch sử khảo sát nào, hiển thị thông báo tương ứng
  if (!history.length) return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Lịch Sử Khảo Sát</h1>
          <p className="survey-banner-subtitle">Xem lại các khảo sát bạn đã hoàn thành</p>
        </div>
      </div>
      <div className="survey-root">
        <div className="survey-container survey-title-center">Chưa có khảo sát nào.</div>
      </div>
    </div>
  );

  // Hiển thị danh sách lịch sử khảo sát nếu có dữ liệu
  return (
    <div>
      {/* Banner tiêu đề trang */}
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Lịch Sử Khảo Sát</h1>
          <p className="survey-banner-subtitle">Xem lại các khảo sát bạn đã hoàn thành</p>
        </div>
      </div>
      
      <div className="survey-root">
        <div className="survey-container survey-history-container">
          {/* Tiêu đề lịch sử khảo sát */}
          <div className="survey-title survey-title-center">
            <span role="img" aria-label="history">📜</span> Lịch sử khảo sát
          </div>
          {/* Danh sách các khảo sát đã làm */}
          <ul className="survey-history-list">
            {history.map(h => (
              <li key={h.id} className="survey-history-item">
                <div className="survey-history-card">
                  {/* Tiêu đề khảo sát */}
                  <div className="survey-history-title">{h.surveyTitle}</div>
                  {/* Ngày nộp khảo sát, định dạng ngày Việt Nam */}
                  <div className="survey-history-date">Ngày nộp: {new Date(h.submittedAt).toLocaleDateString('vi-VN')}</div>
                  {/* Mức độ rủi ro đánh giá từ khảo sát */}
                  <div className="survey-history-risk">Rủi ro: <b className="survey-history-risk-level">{h.riskLevel}</b></div>
                </div>
              </li>
            ))}
          </ul>
          {/* Nút quay lại trang khảo sát chính */}
          <div className="survey-back-button-container">
            <Link to="/surveys" className="survey-back-link">
              <button className="survey-btn">
                <span className="survey-back-arrow">←</span> Quay lại trang khảo sát
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export component để sử dụng ở nơi khác
export default SurveyHistoryPage;

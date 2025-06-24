import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './styles/survey.css';

const SurveyResultsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    navigate('/surveys');
    return null;
  }  return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Kết Quả Khảo Sát</h1>
          <p className="survey-banner-subtitle">Phân tích và đánh giá từ bài khảo sát của bạn</p>
        </div>
      </div>
      
      <div className="survey-root">
        <div className="survey-container survey-results-container">
          <div className="survey-title survey-title-center">
            <span role="img" aria-label="result">
              🎉
            </span>{' '}
            Kết quả khảo sát
          </div>        <div className="survey-results-summary">
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
          <b>Ngày nộp:</b> {new Date(result.submittedAt).toLocaleDateString('vi-VN')}
        </div>
        
        <div className="survey-action-buttons">
          <Link to="/counseling" className="survey-action-btn survey-action-btn--primary">
            <span role="img" aria-label="calendar">📅</span> Đặt lịch tư vấn ngay
          </Link>
          
          <Link to="/education" className="survey-action-btn survey-action-btn--secondary">
            <span role="img" aria-label="book">📚</span> Xem khóa học phù hợp
          </Link>
          
          <button
            className="survey-action-btn survey-action-btn--secondary"
            onClick={() => navigate('/surveys')}
          >
            <span role="img" aria-label="back">↩️</span> Quay lại trang khảo sát
          </button>        </div>
      </div>
    </div>
    </div>
  );
};

export default SurveyResultsPage;

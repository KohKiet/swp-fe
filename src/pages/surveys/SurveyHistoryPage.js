import React, { useEffect, useState } from 'react';
import surveyService from '../../services/surveyService';
import { Link } from 'react-router-dom';
import './styles/survey.css';

const SurveyHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    surveyService.getHistory()
      .then(setHistory)
      .catch(() => setError('Không thể tải lịch sử khảo sát'))
      .finally(() => setLoading(false));
  }, []);
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
    return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Lịch Sử Khảo Sát</h1>
          <p className="survey-banner-subtitle">Xem lại các khảo sát bạn đã hoàn thành</p>
        </div>
      </div>
      
      <div className="survey-root">
        <div className="survey-container survey-history-container">
          <div className="survey-title survey-title-center">
            <span role="img" aria-label="history">📜</span> Lịch sử khảo sát
          </div>
          <ul className="survey-history-list">
            {history.map((h, idx) => (
              <li key={h.id || idx} className="survey-history-item">
                <div className="survey-history-card">
                  <div className="survey-history-title">{h.surveyTitle}</div>
                  <div className="survey-history-date">Ngày nộp: {new Date(h.submittedAt).toLocaleDateString('vi-VN')}</div>
                  <div className="survey-history-risk">Rủi ro: <b className="survey-history-risk-level">{h.riskLevel}</b></div>
                </div>
              </li>
            ))}
          </ul>
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

export default SurveyHistoryPage;

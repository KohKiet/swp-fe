import React, { useEffect, useState } from 'react';
import surveyService from '../../services/surveyService';
import { Link } from 'react-router-dom';
import './styles/survey.css';

const SurveyEntryPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    surveyService.checkSurveyStatus()
      .then(setStatus)
      .catch(() => setError('Không thể tải trạng thái khảo sát'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Khảo Sát</h1>
          <p className="survey-banner-subtitle">Đánh giá tâm lý của bạn qua bài khảo sát</p>
        </div>
      </div>
      <div className="survey-root">
        <div className="survey-container">
          <div className="survey-title" style={{justifyContent:'center'}}>
            <span role="img" aria-label="survey">📝</span> Đang tải trạng thái khảo sát...
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Khảo Sát</h1>
          <p className="survey-banner-subtitle">Đánh giá tâm lý của bạn qua bài khảo sát</p>
        </div>
      </div>
      <div className="survey-root">
        <div className="survey-container survey-alert">{error}</div>
      </div>
    </div>
  );return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Khảo Sát</h1>
          <p className="survey-banner-subtitle">Đánh giá tâm lý của bạn qua bài khảo sát</p>
        </div>
      </div>
      
      <div className="survey-root">
        <div className="survey-container" style={{maxWidth:400}}>
          <div className="survey-title">
            <span role="img" aria-label="survey">📝</span> Khảo sát
          </div>        <div className="survey-desc">{status?.message}</div>
        <div style={{display:'flex',flexDirection:'column',gap:16,marginTop:24}}>
          {status?.canTakeSurvey && (
            <Link to="/surveys/take" style={{textDecoration:'none'}}>
              <button className="survey-btn" style={{width:'100%'}}>Bắt đầu khảo sát</button>
            </Link>
          )}
          {status?.hasCompleted && (
            <Link to="/surveys/history" style={{textDecoration:'none'}}>
              <button className="survey-btn" style={{width:'100%',background:'linear-gradient(90deg,#60a5fa 0%,#6366f1 100%)'}}>Xem lịch sử</button>
            </Link>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyEntryPage;

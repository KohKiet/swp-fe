import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles/survey.css';

const SurveyResultsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    navigate('/surveys');
    return null;
  }

  return (
    <div className="survey-root">
      <div className="survey-container" style={{ maxWidth: 500 }}>
        <div className="survey-title" style={{ justifyContent: 'center' }}>
          <span role="img" aria-label="result">
            🎉
          </span>{' '}
          Kết quả khảo sát
        </div>
        <div className="survey-desc" style={{ marginBottom: 18 }}>
          <b>Điểm số:</b> {result.totalScore} <br />
          <b>Mức độ rủi ro:</b>{' '}
          <span style={{ color: '#6366f1', fontWeight: 700 }}>
            {result.riskLevel}
          </span>{' '}
          <br />
          <b>Đề xuất:</b>{' '}
          <span style={{ color: '#16a34a' }}>
            {result.suggestedAction}
          </span>{' '}
          <br />
          <b>Ngày nộp:</b> {new Date(result.submittedAt).toLocaleString()}
        </div>
        <div className="survey-question" style={{ marginBottom: 10 }}>
          Chi tiết câu trả lời
        </div>
        <ul style={{ paddingLeft: 18, marginBottom: 24 }}>
          {result.answers.map((a, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <b>{a.question}</b>:{' '}
              <span style={{ color: '#6366f1' }}>
                {a.selectedAnswer}
              </span>
            </li>
          ))}
        </ul>
        <button
          className="survey-btn"
          style={{ width: '100%' }}
          onClick={() => navigate('/surveys')}
        >
          Quay lại khảo sát
        </button>
      </div>
    </div>
  );
};

export default SurveyResultsPage;

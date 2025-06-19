import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SurveyResultsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    navigate('/surveys');
    return null;
  }

  return (
    <div>
      <h2>Kết quả khảo sát</h2>
      <div>Điểm số: {result.totalScore}</div>
      <div>Mức độ rủi ro: {result.riskLevel}</div>
      <div>Đề xuất: {result.suggestedAction}</div>
      <div>Ngày nộp: {new Date(result.submittedAt).toLocaleString()}</div>
      <h3>Chi tiết câu trả lời</h3>
      <ul>
        {result.answers.map((a, i) => (
          <li key={i}><b>{a.question}</b>: {a.selectedAnswer}</li>
        ))}
      </ul>
      <button onClick={() => navigate('/surveys')}>Quay lại khảo sát</button>
    </div>
  );
};

export default SurveyResultsPage;

import React, { useEffect, useState } from 'react';
import surveyService from '../../services/surveyService';
import { Link } from 'react-router-dom';

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

  if (loading) return <div>Đang tải lịch sử...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!history.length) return <div>Chưa có khảo sát nào.</div>;

  return (
    <div>
      <h2>Lịch sử khảo sát</h2>
      <ul>
        {history.map(h => (
          <li key={h.id}>
            {h.surveyTitle} - {new Date(h.submittedAt).toLocaleString()} - Điểm: {h.totalScore} - Rủi ro: {h.riskLevel}
            <Link to={`/surveys/results/${h.id}`}>Xem chi tiết</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SurveyHistoryPage;

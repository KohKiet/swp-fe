import React, { useEffect, useState } from 'react';
import surveyService from '../../services/surveyService';
import { Link } from 'react-router-dom';

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

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h2>Khảo sát</h2>
      <p>{status?.message}</p>
      {status?.canTakeSurvey && (
        <Link to="/surveys/take"><button>Bắt đầu khảo sát</button></Link>
      )}
      {status?.hasCompleted && (
        <Link to="/surveys/history"><button>Xem lịch sử</button></Link>
      )}
    </div>
  );
};

export default SurveyEntryPage;

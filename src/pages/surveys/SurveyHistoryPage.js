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
    <div className="survey-root">
      <div className="survey-container">
        <div className="survey-title" style={{justifyContent:'center'}}>
          <span role="img" aria-label="history">📜</span> Đang tải lịch sử...
        </div>
      </div>
    </div>
  );
  if (error) return <div className="survey-root"><div className="survey-container survey-alert">{error}</div></div>;
  if (!history.length) return <div className="survey-root"><div className="survey-container">Chưa có khảo sát nào.</div></div>;

  return (
    <div className="survey-root">
      <div className="survey-container" style={{maxWidth:600}}>
        <div className="survey-title" style={{justifyContent:'center'}}>
          <span role="img" aria-label="history">📜</span> Lịch sử khảo sát
        </div>
        <ul style={{paddingLeft:0,marginTop:24}}>
          {history.map(h => (
            <li key={h.id} style={{listStyle:'none',marginBottom:18,padding:0}}>
              <div style={{background:'#f3f4f6',borderRadius:10,padding:'14px 18px',display:'flex',flexDirection:'column',gap:4}}>
                <div style={{fontWeight:700,color:'#6366f1'}}>{h.surveyTitle}</div>
                <div style={{fontSize:'0.98rem',color:'#6b7280'}}>Ngày nộp: {new Date(h.submittedAt).toLocaleString()}</div>
                <div style={{fontSize:'0.98rem'}}>Điểm: <b>{h.totalScore}</b> &nbsp;|&nbsp; Rủi ro: <b style={{color:'#f59e42'}}>{h.riskLevel}</b></div>
                <Link to={`/surveys/results/${h.id}`} style={{marginTop:6,textDecoration:'none'}}>
                  <button className="survey-btn" style={{width:'100%',padding:'7px 0'}}>Xem chi tiết</button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SurveyHistoryPage;

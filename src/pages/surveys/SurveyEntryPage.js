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
  );

  return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Khảo Sát</h1>
          <p className="survey-banner-subtitle">Đánh giá tâm lý của bạn qua bài khảo sát</p>
        </div>
      </div>
      
      <div className="survey-root">
        <div className="survey-container" style={{maxWidth:900}}>
          <div className="survey-title">
            <span role="img" aria-label="survey">📝</span> Khảo sát
          </div>
          
          <div className="survey-desc">{status?.message}</div>
          
          {/* Thông tin thống kê */}
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
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '24px', marginBottom: '4px'}}>📊</div>
              <div style={{fontWeight: '600', color: '#1e293b'}}>10 câu hỏi</div>
              <div style={{fontSize: '14px', color: '#64748b'}}>Thời gian: ~5 phút</div>
            </div>

            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '24px', marginBottom: '4px'}}>🎯</div>
              <div style={{fontWeight: '600', color: '#1e293b'}}>95% chính xác</div>
              <div style={{fontSize: '14px', color: '#64748b'}}>Độ tin cậy</div>
            </div>
          </div>

          {/* Hướng dẫn */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e40af'
            }}>
              💡 Hướng dẫn làm khảo sát
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '14px',
              color: '#1e293b',
              lineHeight: '1.5'
            }}>
              <li>Trả lời trung thực để có kết quả chính xác nhất</li>
              <li>Đọc kỹ từng câu hỏi trước khi chọn đáp án</li>
              <li>Dựa vào cảm nhận hiện tại, không quá suy nghĩ</li>
              <li>Hoàn thành tất cả câu hỏi để có đánh giá đầy đủ</li>
            </ul>
          </div>

          {/* Thông tin bảo mật */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#15803d'
            }}>
              🔒 Cam kết bảo mật
            </div>
            <div style={{
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.5'
            }}>
              <div style={{marginBottom: '8px'}}>
                ✓ <strong>Bảo mật tuyệt đối:</strong> Thông tin cá nhân được mã hóa an toàn
              </div>
              <div>
                ✓ <strong>Tuân thủ quy định:</strong> Đáp ứng tiêu chuẩn bảo vệ dữ liệu cá nhân
              </div>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default SurveyEntryPage;

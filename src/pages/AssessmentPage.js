import React, { useState, useEffect } from 'react';
import './AssessmentPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5150',
});

// Interceptor để tự động thêm token vào header
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [surveyId, setSurveyId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showProfileButton, setShowProfileButton] = useState(false);
  const [surveyResult, setSurveyResult] = useState(null);
  const [currentStep, setCurrentStep] = useState('questions'); // 'questions' | 'result'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Kiểm tra trạng thái khảo sát khi mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/surveys/check-status');
        if (res.data.canTakeSurvey) {
          fetchSuitableSurvey();
        } else {
          setMessage(res.data.message);
        }
      } catch (err) {
        setError('Không thể kiểm tra trạng thái khảo sát');
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  // Lấy khảo sát phù hợp
  const fetchSuitableSurvey = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/surveys/get-suitable');
      setSurvey(res.data);
      setSurveyId(res.data.surveyId);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        if (err.response.data.message.includes('DateOfBirth')) {
          setError('Bạn cần cập nhật ngày sinh trong hồ sơ để làm khảo sát');
          setShowProfileButton(true);
        } else {
          setError(err.response.data.message || 'Không thể lấy khảo sát');
        }
      } else if (err.response && err.response.status === 404) {
        setError('Không tìm thấy khảo sát phù hợp với độ tuổi của bạn');
      } else {
        setError('Đã xảy ra lỗi khi lấy khảo sát phù hợp');
      }
    } finally {
      setLoading(false);
    }
  };

  // Chọn đáp án
  const handleAnswerSelected = (questionId, answerId) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  // Validate đủ câu trả lời
  const validateAnswers = () => {
    if (!survey) return false;
    const unanswered = survey.questions.filter(q => !answers[q.questionId]);
    if (unanswered.length > 0) {
      setError(`Vui lòng trả lời tất cả câu hỏi. Còn ${unanswered.length} câu chưa trả lời.`);
      return false;
    }
    return true;
  };

  // Nộp kết quả khảo sát
  const handleSubmit = async () => {
    if (!validateAnswers()) return;
    try {
      setSubmitting(true);
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        questionId,
        selectedAnswerId: answers[questionId],
      }));
      const res = await api.post(`/api/surveys/${surveyId}/submit`, { answers: formattedAnswers });
      setSurveyResult(res.data);
      setCurrentStep('result');
      localStorage.removeItem('surveyState');
    } catch (err) {
      setError('Đã xảy ra lỗi khi nộp kết quả khảo sát');
    } finally {
      setSubmitting(false);
    }
  };

  // Lưu trạng thái tạm thời
  useEffect(() => {
    if (Object.keys(answers).length > 0 && surveyId) {
      localStorage.setItem('surveyState', JSON.stringify({ answers, surveyId }));
    }
  }, [answers, surveyId]);

  // Load trạng thái tạm thời nếu có
  useEffect(() => {
    const savedState = localStorage.getItem('surveyState');
    if (savedState) {
      const { answers: savedAnswers, surveyId: savedSurveyId } = JSON.parse(savedState);
      setAnswers(savedAnswers);
      setSurveyId(savedSurveyId);
    }
  }, []);

  // Điều hướng về profile nếu thiếu ngày sinh
  const handleGoProfile = () => {
    navigate('/profile');
  };

  // Điều hướng về dashboard sau khi hoàn thành
  const handleGoDashboard = () => {
    navigate('/dashboard');
  };

  // Hiển thị tiến trình
  const Progress = ({ current, total }) => {
    const percentage = Math.floor((current / total) * 100);
    return (
      <div className="progress-container">
        <div className="progress-text">{current}/{total} câu hỏi</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  // Hiển thị từng câu hỏi
  const renderQuestion = () => {
    if (!survey) return null;
    const question = survey.questions[currentQuestionIndex];
    return (
      <div className="survey-question">
        <h3>{question.content}</h3>
        <div className="answer-options">
          {question.answers.map(answer => (
            <div
              key={answer.answerId}
              className={`answer-option ${answers[question.questionId] === answer.answerId ? 'selected' : ''}`}
              onClick={() => handleAnswerSelected(question.questionId, answer.answerId)}
            >
              {answer.answerText}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Hiển thị kết quả
  const SurveyResult = ({ result }) => {
    const getRiskLevelText = (level) => (level === 1 ? 'Thấp' : 'Cao');
    return (
      <div className="survey-result">
        <h2>Kết Quả Khảo Sát</h2>
        <div className="result-summary">
          <div className="score"><span>Điểm số:</span> {result.totalScore}</div>
          <div className={`risk-level ${result.riskLevel === 1 ? 'low' : 'high'}`}>
            <span>Mức độ rủi ro:</span> {getRiskLevelText(result.riskLevel)}</div>
          <div className="suggestion"><span>Đề xuất:</span> {result.suggestedAction}</div>
        </div>
        <div className="answered-questions">
          <h3>Chi tiết câu trả lời</h3>
          {result.answers.map((answer, idx) => (
            <div key={idx} className="answered-item">
              <div className="question">{answer.question}</div>
              <div className="answer">{answer.selectedAnswer}</div>
            </div>
          ))}
        </div>
        <button onClick={handleGoDashboard}>Quay về trang chủ</button>
      </div>
    );
  };

  // Render
  if (loading) return <div className="assessment-content">Đang tải khảo sát...</div>;
  if (error) return (
    <div className="assessment-content">
      <div>{error}</div>
      {showProfileButton && (
        <button className="update-profile-btn" onClick={handleGoProfile}>Cập nhật hồ sơ</button>
      )}
    </div>
  );
  if (message) return <div className="assessment-content">{message}</div>;
  if (!survey) return null;

  if (currentStep === 'result' && surveyResult) {
    return <SurveyResult result={surveyResult} />;
  }

  // Câu hỏi và điều hướng
  const totalQuestions = survey.questions.length;
  return (
    <div className="assessment-page">
      <h1>{survey.title}</h1>
      <p>{survey.description}</p>
      <Progress current={currentQuestionIndex + 1} total={totalQuestions} />
      {renderQuestion()}
      <div className="navigation-buttons">
        {currentQuestionIndex > 0 && (
          <button className="prev-btn" onClick={() => setCurrentQuestionIndex(i => i - 1)}>
            Câu trước
          </button>
        )}
        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            className="next-btn"
            onClick={() => setCurrentQuestionIndex(i => i + 1)}
            disabled={!answers[survey.questions[currentQuestionIndex].questionId]}
          >
            Câu tiếp theo
          </button>
        ) : (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!validateAnswers() || submitting}
          >
            {submitting ? 'Đang xử lý...' : 'Hoàn thành'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
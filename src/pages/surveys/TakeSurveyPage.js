import React, { useEffect, useState } from 'react';
import surveyService from '../../services/surveyService';
import { useNavigate } from 'react-router-dom';
import './styles/survey.css';

const TakeSurveyPage = () => {
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('survey_progress');
    if (saved) {
      const { survey, answers, current } = JSON.parse(saved);
      setSurvey(survey);
      setAnswers(answers);
      setCurrent(current);
      setLoading(false);
      return;
    }
    surveyService.getSuitableSurvey()
      .then(data => {
        setSurvey(data);
        setAnswers(data.questions.map(q => ({ questionId: q.questionId, selectedAnswerId: null })));
      })
      .catch(() => setError('Không thể tải khảo sát'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (survey && answers.length) {
      localStorage.setItem('survey_progress', JSON.stringify({ survey, answers, current }));
    }
  }, [survey, answers, current]);

  const handleAnswer = (answerId) => {
    setAnswers(prev => prev.map((a, idx) => idx === current ? { ...a, selectedAnswerId: answerId } : a));
  };

  const handleSubmit = async () => {
    if (answers.some(a => !a.selectedAnswerId)) {
      setError('Vui lòng trả lời tất cả câu hỏi');
      return;
    }
    setSubmitting(true);
    try {
      const result = await surveyService.submitSurvey(survey.surveyId, answers);
      localStorage.removeItem('survey_progress');
      navigate('/surveys/results', { state: { result } });
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi nộp khảo sát');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="survey-root">
      <div className="survey-container">
        <div className="survey-title" style={{justifyContent:'center'}}>
          <span role="img" aria-label="survey">📝</span> Đang tải câu hỏi...
        </div>
        <div style={{marginTop: 24}}>
          <div className="survey-progress">
            <div className="survey-progress-bar" style={{width:'40%'}}></div>
          </div>
          <div className="survey-question" style={{opacity:0.5}}>
            <div className="survey-answer" style={{width:'80%',margin:'8px auto',height:32,background:'#f3f4f6'}}></div>
            <div className="survey-answer" style={{width:'60%',margin:'8px auto',height:32,background:'#f3f4f6'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return <div className="survey-root"><div className="survey-container survey-alert">{error}</div></div>;
  if (!survey) return null;

  const q = survey.questions[current];
  const total = survey.questions.length;
  const answered = answers.filter(a => a.selectedAnswerId).length;
  const progress = Math.round((answered / total) * 100);

  return (
    <div className="survey-root">
      <div className="survey-container">
        <div className="survey-title">
          <span role="img" aria-label="survey">📝</span> {survey.title}
        </div>
        <div className="survey-desc">{survey.description}</div>
        <div className="survey-progress" aria-label="Tiến trình khảo sát">
          <div className="survey-progress-bar" style={{width: progress + '%'}}></div>
        </div>
        <div className="survey-step">Câu {current + 1} / {total} &nbsp;|&nbsp; Đã trả lời: {answered}/{total}</div>
        <div className="survey-question">{q.content}</div>
        <div className="survey-answers">
          {q.answers.map(ans => (
            <label key={ans.answerId} className={
              'survey-answer' + (answers[current].selectedAnswerId === ans.answerId ? ' selected' : '')
            }>
              <input
                type="radio"
                checked={answers[current].selectedAnswerId === ans.answerId}
                onChange={() => handleAnswer(ans.answerId)}
                disabled={submitting}
                aria-label={ans.answerText}
              />
              {ans.answerText}
            </label>
          ))}
        </div>
        <div className="survey-nav">
          {current > 0 && <button className="survey-btn" onClick={() => setCurrent(c => c - 1)}>Trước</button>}
          {current < survey.questions.length - 1 ? (
            <button className="survey-btn" onClick={() => setCurrent(c => c + 1)} disabled={!answers[current].selectedAnswerId}>Tiếp</button>
          ) : (
            <button
              className="survey-btn"
              onClick={handleSubmit}
              disabled={submitting || !answers[current].selectedAnswerId}
            >
              {submitting ? 'Đang gửi...' : 'Nộp bài'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeSurveyPage;

import React, { useEffect, useState } from 'react';
import surveyService from '../../services/surveyService';
import { useNavigate } from 'react-router-dom';

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

  if (loading) return <div>Đang tải câu hỏi...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!survey) return null;

  const q = survey.questions[current];

  return (
    <div>
      <h3>{survey.title}</h3>
      <p>{survey.description}</p>
      <div>
        <h4>Câu {current + 1}: {q.content}</h4>
        {q.answers.map(ans => (
          <label key={ans.answerId}>
            <input
              type="radio"
              checked={answers[current].selectedAnswerId === ans.answerId}
              onChange={() => handleAnswer(ans.answerId)}
              disabled={submitting}
            />
            {ans.answerText}
          </label>
        ))}
      </div>
      <div>
        {current > 0 && <button onClick={() => setCurrent(c => c - 1)}>Trước</button>}
        {current < survey.questions.length - 1
          ? <button onClick={() => setCurrent(c => c + 1)} disabled={!answers[current].selectedAnswerId}>Tiếp</button>
          : <button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Đang gửi...' : 'Nộp bài'}</button>
        }
      </div>
    </div>
  );
};

export default TakeSurveyPage;

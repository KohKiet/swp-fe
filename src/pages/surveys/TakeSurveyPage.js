
// Import các thư viện cần thiết
import React, { useEffect, useState } from 'react'; // React core và các hook
import surveyService from '../../services/surveyService'; // Service gọi API khảo sát
import { useNavigate } from 'react-router-dom'; // Dùng để chuyển trang
import './styles/survey.css'; // Import CSS cho giao diện khảo sát


// Component cho phép người dùng làm bài khảo sát
const TakeSurveyPage = () => {
  // State lưu thông tin khảo sát hiện tại
  const [survey, setSurvey] = useState(null);
  // State lưu đáp án của từng câu hỏi
  const [answers, setAnswers] = useState([]);
  // State chỉ số câu hỏi hiện tại đang hiển thị
  const [current, setCurrent] = useState(0);
  // State kiểm soát trạng thái loading khi lấy dữ liệu
  const [loading, setLoading] = useState(true);
  // State kiểm soát trạng thái đang gửi bài
  const [submitting, setSubmitting] = useState(false);
  // State lưu thông báo lỗi nếu có lỗi
  const [error, setError] = useState(null);
  // Hook để chuyển trang
  const navigate = useNavigate();


  // Khi component mount, kiểm tra xem có lưu tiến trình khảo sát trong localStorage không
  // Nếu có thì load lại, nếu không thì gọi API lấy khảo sát phù hợp
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
    // Gọi API lấy khảo sát phù hợp cho người dùng
    surveyService.getSuitableSurvey()
      .then(data => {
        setSurvey(data);
        // Khởi tạo mảng đáp án rỗng cho từng câu hỏi
        setAnswers(data.questions.map(q => ({ questionId: q.questionId, selectedAnswerId: null })));
      })
      .catch(() => setError('Không thể tải khảo sát'))
      .finally(() => setLoading(false));
  }, []);


  // Mỗi khi survey, answers hoặc current thay đổi, lưu tiến trình vào localStorage để người dùng có thể tiếp tục nếu reload
  useEffect(() => {
    if (survey && answers.length) {
      localStorage.setItem('survey_progress', JSON.stringify({ survey, answers, current }));
    }
  }, [survey, answers, current]);


  // Xử lý khi người dùng chọn đáp án cho câu hỏi hiện tại
  const handleAnswer = (answerId) => {
    setAnswers(prev => prev.map((a, idx) => idx === current ? { ...a, selectedAnswerId: answerId } : a));
  };


  // Xử lý khi người dùng nhấn nút "Nộp bài"
  const handleSubmit = async () => {
    // Kiểm tra đã trả lời hết tất cả câu hỏi chưa
    if (answers.some(a => !a.selectedAnswerId)) {
      setError('Vui lòng trả lời tất cả câu hỏi');
      return;
    }
    setSubmitting(true);
    try {
      // Gửi đáp án lên server
      const result = await surveyService.submitSurvey(survey.surveyId, answers);
      // Xóa tiến trình khảo sát đã lưu
      localStorage.removeItem('survey_progress');
      // Chuyển sang trang kết quả và truyền kết quả qua state
      navigate('/surveys/results', { state: { result } });
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi nộp khảo sát');
    } finally {
      setSubmitting(false);
    }
  };

  // Nếu đang loading, hiển thị giao diện chờ
  if (loading) return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Làm Bài Khảo Sát</h1>
          <p className="survey-banner-subtitle">Hãy trả lời các câu hỏi dưới đây một cách chân thực nhất</p>
        </div>
      </div>
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
    </div>
  );
  
  // Nếu có lỗi khi lấy dữ liệu hoặc nộp bài, hiển thị thông báo lỗi
  if (error) return (
    <div>
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Làm Bài Khảo Sát</h1>
          <p className="survey-banner-subtitle">Hãy trả lời các câu hỏi dưới đây một cách chân thực nhất</p>
        </div>
      </div>
      <div className="survey-root">
        <div className="survey-container survey-alert">{error}</div>
      </div>
    </div>
  );
  // Nếu chưa có dữ liệu khảo sát, không render gì
  if (!survey) return null;

  // Lấy thông tin câu hỏi hiện tại, tổng số câu hỏi, số câu đã trả lời và phần trăm tiến trình
  const q = survey.questions[current];
  const total = survey.questions.length;
  const answered = answers.filter(a => a.selectedAnswerId).length;
  const progress = Math.round((answered / total) * 100);

  // Hiển thị giao diện làm khảo sát
  return (
    <div>
      {/* Banner tiêu đề trang */}
      <div className="survey-banner">
        <div className="survey-banner-content">
          <h1 className="survey-banner-title">Làm Bài Khảo Sát</h1>
          <p className="survey-banner-subtitle">Hãy trả lời các câu hỏi dưới đây một cách chân thực nhất</p>
        </div>
      </div>
      
      <div className="survey-root">
        <div className="survey-container">
          {/* Tiêu đề khảo sát */}
          <div className="survey-title">
            <span role="img" aria-label="survey">📝</span> {survey.title}
          </div>
          {/* Mô tả khảo sát */}
          <div className="survey-desc">{survey.description}</div>
          {/* Thanh tiến trình khảo sát */}
          <div className="survey-progress" aria-label="Tiến trình khảo sát">
            <div className="survey-progress-bar" style={{width: progress + '%'}}></div>
          </div>
          {/* Hiển thị câu hỏi hiện tại */}
          <div className="survey-question">{q.content}</div>
          {/* Hiển thị các đáp án cho câu hỏi hiện tại */}
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
          {/* Các nút điều hướng câu hỏi và nộp bài */}
          <div className="survey-nav">
            {/* Nút quay lại câu trước */}
            {current > 0 && <button className="survey-btn" onClick={() => setCurrent(c => c - 1)}>Trước</button>}
            {/* Nút sang câu tiếp theo hoặc nộp bài */}
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
    </div>
  );
};

// Export component để sử dụng ở nơi khác
export default TakeSurveyPage;

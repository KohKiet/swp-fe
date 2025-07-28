import React, { useEffect, useState } from 'react';
import surveyService from '../../services/surveyService';
import { Link } from 'react-router-dom';
import './styles/survey.css';
import './styles/AdminSurveyModal.css';
import adminSurveyService from '../../services/adminSurveyService';
import { useAuth } from '../../context/AuthContext';

const SurveyEntryPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAdmin } = useAuth();

  // State cho admin CRUD
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    type: '',
    minAge: 0,
    maxAge: 0,
    status: true,
    createdBy: ''
  });
  const [questionForm, setQuestionForm] = useState({ content: '' });
  const [answerForm, setAnswerForm] = useState({ content: '', score: 0 });
  // State cho modal admin
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    surveyService.checkSurveyStatus()
      .then(setStatus)
      .catch(() => setError('Không thể tải trạng thái khảo sát'))
      .finally(() => setLoading(false));
  }, []);

  // Lấy token từ localStorage
  const getAuthConfig = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Lấy danh sách khảo sát cho admin
  useEffect(() => {
    if (isAdmin() && !loading) {
      adminSurveyService.getAllSurveys(getAuthConfig()).then(res => {
        setSurveys(res.data || res);
      });
    }
  }, [isAdmin, loading]);

  // Lấy câu hỏi khi chọn khảo sát
  const handleSelectSurvey = async (survey) => {
    setSelectedSurvey(survey);
    setSelectedQuestion(null);
    setAnswers([]);
    const res = await adminSurveyService.getSurveyQuestions
      ? await adminSurveyService.getSurveyQuestions(survey.id, getAuthConfig())
      : { data: survey.questions || [] };
    setQuestions(res.data || res);
  };

  // Lấy đáp án khi chọn câu hỏi
  const handleSelectQuestion = async (question) => {
    setSelectedQuestion(question);
    const res = await adminSurveyService.getQuestionAnswers
      ? await adminSurveyService.getQuestionAnswers(question.id, getAuthConfig())
      : { data: question.answers || [] };
    setAnswers(res.data || res);
  };

  // CRUD Survey
  const handleOpenSurveyModal = (survey = null) => {
    setEditingSurvey(survey);
    setSurveyForm(survey ? {
      title: survey.title || '',
      description: survey.description || '',
      type: survey.type || '',
      minAge: survey.minAge ?? 0,
      maxAge: survey.maxAge ?? 0,
      status: survey.status !== undefined ? survey.status : true,
      createdBy: survey.createdBy || ''
    } : {
      title: '',
      description: '',
      type: '',
      minAge: 0,
      maxAge: 0,
      status: true,
      createdBy: ''
    });
    setShowSurveyModal(true);
  };
  const handleSaveSurvey = async () => {
    // Lấy userId từ localStorage nếu có
    const userId = localStorage.getItem('userId') || '';
    const payload = { ...surveyForm, createdBy: surveyForm.createdBy || userId };
    if (editingSurvey) {
      await adminSurveyService.updateSurvey(editingSurvey.id, payload, getAuthConfig());
    } else {
      await adminSurveyService.createSurvey(payload, getAuthConfig());
    }
    setShowSurveyModal(false);
    const res = await adminSurveyService.getAllSurveys(getAuthConfig());
    setSurveys(res.data || res);
  };
  const handleDeleteSurvey = async (surveyId) => {
    await adminSurveyService.deleteSurvey(surveyId, getAuthConfig());
    const res = await adminSurveyService.getAllSurveys(getAuthConfig());
    setSurveys(res.data || res);
    setSelectedSurvey(null);
    setQuestions([]);
    setAnswers([]);
  };

  // CRUD Question
  const handleOpenQuestionModal = (question = null) => {
    setEditingQuestion(question);
    setQuestionForm(question ? { content: question.content } : { content: '' });
    setShowQuestionModal(true);
  };
  const handleSaveQuestion = async () => {
    if (!selectedSurvey) return;
    if (editingQuestion) {
      await adminSurveyService.updateQuestion(editingQuestion.id, { ...questionForm, surveyId: selectedSurvey.id }, getAuthConfig());
    } else {
      await adminSurveyService.createQuestion({ ...questionForm, surveyId: selectedSurvey.id }, getAuthConfig());
    }
    setShowQuestionModal(false);
    const res = await adminSurveyService.getSurveyQuestions
      ? await adminSurveyService.getSurveyQuestions(selectedSurvey.id, getAuthConfig())
      : { data: selectedSurvey.questions || [] };
    setQuestions(res.data || res);
  };
  const handleDeleteQuestion = async (questionId) => {
    await adminSurveyService.deleteQuestion(questionId, getAuthConfig());
    const res = await adminSurveyService.getSurveyQuestions
      ? await adminSurveyService.getSurveyQuestions(selectedSurvey.id, getAuthConfig())
      : { data: selectedSurvey.questions || [] };
    setQuestions(res.data || res);
    setSelectedQuestion(null);
    setAnswers([]);
  };

  // CRUD Answer
  const handleOpenAnswerModal = (answer = null) => {
    setEditingAnswer(answer);
    setAnswerForm({
      content: (answer && typeof answer.content === 'string' ? answer.content : (answer && answer.content !== undefined ? String(answer.content) : '')),
      score: (answer && typeof answer.score === 'number') ? answer.score : (answer && answer.score !== undefined ? Number(answer.score) : 0)
    });
    setShowAnswerModal(true);
  };
  const handleSaveAnswer = async () => {
    if (!selectedQuestion) {
      alert('Vui lòng chọn câu hỏi trước khi thêm/sửa đáp án!');
      return;
    }
    try {
      if (editingAnswer) {
        if (!editingAnswer.id) {
          alert('Không tìm thấy ID đáp án để sửa!');
          return;
        }
        console.log('Update Answer:', { id: editingAnswer.id, ...answerForm, questionId: selectedQuestion.id });
        await adminSurveyService.updateAnswer(editingAnswer.id, { ...answerForm, questionId: selectedQuestion.id }, getAuthConfig());
      } else {
        console.log('Create Answer:', { ...answerForm, questionId: selectedQuestion.id });
        await adminSurveyService.createAnswer({ ...answerForm, questionId: selectedQuestion.id }, getAuthConfig());
      }
      setShowAnswerModal(false);
      const res = await adminSurveyService.getQuestionAnswers
        ? await adminSurveyService.getQuestionAnswers(selectedQuestion.id, getAuthConfig())
        : { data: selectedQuestion.answers || [] };
      setAnswers(res.data || res);
    } catch (err) {
      console.error('Lỗi khi thêm/sửa đáp án:', err);
      alert('Có lỗi khi thêm/sửa đáp án! ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!answerId) {
      alert('Không tìm thấy ID đáp án để xóa!');
      return;
    }
    try {
      console.log('Delete Answer:', answerId);
      await adminSurveyService.deleteAnswer(answerId, getAuthConfig());
      const res = await adminSurveyService.getQuestionAnswers
        ? await adminSurveyService.getQuestionAnswers(selectedQuestion.id, getAuthConfig())
        : { data: selectedQuestion.answers || [] };
      setAnswers(res.data || res);
    } catch (err) {
      console.error('Lỗi khi xóa đáp án:', err);
      alert('Có lỗi khi xóa đáp án! ' + (err?.response?.data?.message || err.message));
    }
  };

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
          <p className="survey-banner-subtitle">Đánh giá mức độ sử dụng chất gây nghiện của bạn qua bài khảo sát</p>
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
      {isAdmin() && (
        <div style={{margin:'32px 0'}}>
          <button className="admin-modal-btn" onClick={() => setShowAdminModal(true)}>Quản lý khảo sát</button>
          {showAdminModal && (
            <div className="admin-modal-overlay">
              <div className="admin-modal-content">
                <button className="admin-modal-close" onClick={() => setShowAdminModal(false)} title="Đóng">×</button>
                <div className="admin-modal-title">Quản lý khảo sát</div>
                <button className="admin-modal-btn" onClick={() => handleOpenSurveyModal()}>Thêm khảo sát</button>
                <ul className="admin-modal-list">
                  {surveys.map(survey => (
                    <li key={survey.id}>
                      <span style={{fontWeight:'bold',cursor:'pointer'}} onClick={() => handleSelectSurvey(survey)}>{survey.name || survey.title}</span>
                      <button className="admin-modal-btn" onClick={() => handleOpenSurveyModal(survey)}>Sửa</button>
                      <button className="admin-modal-btn" onClick={() => handleDeleteSurvey(survey.id)}>Xóa</button>
                      {selectedSurvey && selectedSurvey.id === survey.id && (
                        <div className="admin-modal-section" style={{marginLeft:24}}>
                          <h4>Câu hỏi</h4>
                          <button className="admin-modal-btn" onClick={() => handleOpenQuestionModal()}>Thêm câu hỏi</button>
                          <ul className="admin-modal-list">
                            {questions.map(q => (
                              <li key={q.id}>
                                <span style={{cursor:'pointer'}} onClick={() => handleSelectQuestion(q)}>{q.content || q.questionText}</span>
                                <button className="admin-modal-btn" onClick={() => handleOpenQuestionModal(q)}>Sửa</button>
                                <button className="admin-modal-btn" onClick={() => handleDeleteQuestion(q.id)}>Xóa</button>
                                {selectedQuestion && selectedQuestion.id === q.id && (
                                  <div className="admin-modal-section" style={{marginLeft:24}}>
                                    <h5>Đáp án</h5>
                                    <button className="admin-modal-btn" onClick={() => handleOpenAnswerModal()}>Thêm đáp án</button>
                                    <ul className="admin-modal-list">
                                      {answers.map(a => (
                                        <li key={a.id}>
                                          {a.content || a.answerText}
                                          <button className="admin-modal-btn" onClick={() => handleOpenAnswerModal(a)}>Sửa</button>
                                          <button className="admin-modal-btn" onClick={() => handleDeleteAnswer(a.id)}>Xóa</button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {/* Modal khảo sát */}
                {showSurveyModal && (
                  <div className="admin-modal-modal">
                    <h3>{editingSurvey ? 'Sửa khảo sát' : 'Thêm khảo sát'}</h3>
                    <input className="admin-modal-input" placeholder="Tên khảo sát" value={surveyForm.title} onChange={e => setSurveyForm(f => ({...f, title: e.target.value}))} />
                    <input className="admin-modal-input" placeholder="Mô tả" value={surveyForm.description} onChange={e => setSurveyForm(f => ({...f, description: e.target.value}))} />
                    <input className="admin-modal-input" placeholder="Loại khảo sát (type)" value={surveyForm.type} onChange={e => setSurveyForm(f => ({...f, type: e.target.value}))} />
                    <input className="admin-modal-input" type="number" placeholder="Độ tuổi tối thiểu (minAge)" value={surveyForm.minAge} min={0} onChange={e => setSurveyForm(f => ({...f, minAge: Number(e.target.value)}))} />
                    <input className="admin-modal-input" type="number" placeholder="Độ tuổi tối đa (maxAge)" value={surveyForm.maxAge} min={0} onChange={e => setSurveyForm(f => ({...f, maxAge: Number(e.target.value)}))} />
                    {/* <input className="admin-modal-input" placeholder="Ảnh (image)" value={surveyForm.image} onChange={e => setSurveyForm(f => ({...f, image: e.target.value}))} /> */}
                    <label style={{display:'block',margin:'8px 0'}}>Trạng thái:
                      <select className="admin-modal-input" value={surveyForm.status ? 'true' : 'false'} onChange={e => setSurveyForm(f => ({...f, status: e.target.value === 'true'}))}>
                        <option value="true">Hoạt động</option>
                        <option value="false">Ẩn</option>
                      </select>
                    </label>
                    <button className="admin-modal-btn" onClick={handleSaveSurvey}>Lưu</button>
                    <button className="admin-modal-btn" onClick={() => setShowSurveyModal(false)}>Hủy</button>
                  </div>
                )}
                {/* Modal câu hỏi */}
                {showQuestionModal && (
                  <div className="admin-modal-modal">
                    <h3>{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h3>
                    <input className="admin-modal-input" placeholder="Nội dung câu hỏi" value={questionForm.content} onChange={e => setQuestionForm(f => ({...f, content: e.target.value}))} />
                    <button className="admin-modal-btn" onClick={handleSaveQuestion}>Lưu</button>
                    <button className="admin-modal-btn" onClick={() => setShowQuestionModal(false)}>Hủy</button>
                  </div>
                )}
                {/* Modal đáp án */}
                {showAnswerModal && (
                  <div className="admin-modal-modal">
                    <h3>{editingAnswer ? 'Sửa đáp án' : 'Thêm đáp án'}</h3>
                    <input className="admin-modal-input" placeholder="Nội dung đáp án" value={answerForm.content || ''} onChange={e => setAnswerForm(f => ({...f, content: e.target.value}))} />
                    <input className="admin-modal-input" type="number" placeholder="Điểm số (score)" value={answerForm.score ?? 0} min={0} onChange={e => setAnswerForm(f => ({...f, score: Number(e.target.value)}))} />
                    <button className="admin-modal-btn" onClick={handleSaveAnswer}>Lưu</button>
                    <button className="admin-modal-btn" onClick={() => setShowAnswerModal(false)}>Hủy</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveyEntryPage;

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
    // Fetch questions
    const res = await adminSurveyService.getSurveyQuestions
      ? await adminSurveyService.getSurveyQuestions(survey.id, getAuthConfig())
      : { data: survey.questions || [] };
    let loadedQuestions = res.data || res;
    // For each question, fetch answers and attach to question
    if (Array.isArray(loadedQuestions) && loadedQuestions.length > 0 && adminSurveyService.getQuestionAnswers) {
      loadedQuestions = await Promise.all(loadedQuestions.map(async (q) => {
        try {
          const ansRes = await adminSurveyService.getQuestionAnswers(q.id, getAuthConfig());
          return { ...q, answers: ansRes.data || ansRes };
        } catch {
          return { ...q, answers: [] };
        }
      }));
    }
    setQuestions(loadedQuestions);
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
    // Always fetch answers for all questions after add/edit
    const res = await adminSurveyService.getSurveyQuestions
      ? await adminSurveyService.getSurveyQuestions(selectedSurvey.id, getAuthConfig())
      : { data: selectedSurvey.questions || [] };
    let loadedQuestions = res.data || res;
    if (Array.isArray(loadedQuestions) && loadedQuestions.length > 0 && adminSurveyService.getQuestionAnswers) {
      loadedQuestions = await Promise.all(loadedQuestions.map(async (q) => {
        try {
          const ansRes = await adminSurveyService.getQuestionAnswers(q.id, getAuthConfig());
          return { ...q, answers: ansRes.data || ansRes };
        } catch {
          return { ...q, answers: [] };
        }
      }));
    }
    setQuestions(loadedQuestions);
  };
  const handleDeleteQuestion = async (questionId) => {
    await adminSurveyService.deleteQuestion(questionId, getAuthConfig());
    // Always fetch answers for all questions after delete
    const res = await adminSurveyService.getSurveyQuestions
      ? await adminSurveyService.getSurveyQuestions(selectedSurvey.id, getAuthConfig())
      : { data: selectedSurvey.questions || [] };
    let loadedQuestions = res.data || res;
    if (Array.isArray(loadedQuestions) && loadedQuestions.length > 0 && adminSurveyService.getQuestionAnswers) {
      loadedQuestions = await Promise.all(loadedQuestions.map(async (q) => {
        try {
          const ansRes = await adminSurveyService.getQuestionAnswers(q.id, getAuthConfig());
          return { ...q, answers: ansRes.data || ansRes };
        } catch {
          return { ...q, answers: [] };
        }
      }));
    }
    setQuestions(loadedQuestions);
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
        await adminSurveyService.updateAnswer(editingAnswer.id, { ...answerForm, questionId: selectedQuestion.id }, getAuthConfig());
      } else {
        await adminSurveyService.createAnswer({ ...answerForm, questionId: selectedQuestion.id }, getAuthConfig());
      }
      setShowAnswerModal(false);
      // Reload all questions and answers for the selected survey
      if (selectedSurvey) {
        await handleSelectSurvey(selectedSurvey);
      }
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
      // Reload all questions and answers for the selected survey
      if (selectedSurvey) {
        await handleSelectSurvey(selectedSurvey);
      }
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
              <div className="admin-modal-content" style={{display:'flex',minWidth:900,minHeight:500,gap:32}}>
                {/* Sidebar khảo sát */}
                <div style={{width:300,background:'#f8fafc',borderRight:'1px solid #e2e8f0',padding:'20px 0',overflowY:'auto'}}>
                  <div className="admin-modal-title" style={{marginBottom:16}}>Quản lý khảo sát</div>
                  <button className="admin-modal-btn" style={{width:'100%',marginBottom:16}} onClick={() => handleOpenSurveyModal()}>+ Thêm khảo sát</button>
                  <ul className="admin-modal-list" style={{padding:0}}>
                    {surveys.map(survey => (
                      <li key={survey.id} style={{marginBottom:8,padding:8,borderRadius:8,background:selectedSurvey && selectedSurvey.id===survey.id?'#e0e7ff':'transparent',display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontWeight:'bold',cursor:'pointer',flex:1}} onClick={() => handleSelectSurvey(survey)}>{survey.name || survey.title}</span>
                        <button className="admin-modal-btn" style={{padding:'2px 8px'}} onClick={() => handleOpenSurveyModal(survey)}>Sửa</button>
                        <button className="admin-modal-btn" style={{padding:'2px 8px'}} onClick={() => handleDeleteSurvey(survey.id)}>Xóa</button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Nội dung chi tiết khảo sát */}
                <div style={{flex:1,padding:'20px 0',overflowY:'auto'}}>
                  {selectedSurvey ? (
                    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                        <div style={{fontWeight:600,fontSize:18}}>{selectedSurvey.title}</div>
                        <span style={{fontSize:13,color:'#64748b'}}>{selectedSurvey.type}</span>
                      </div>
                      <div style={{marginBottom:8}}>{selectedSurvey.description}</div>
                      <div style={{fontSize:13,color:'#64748b',marginBottom:8}}>Độ tuổi: {selectedSurvey.minAge} - {selectedSurvey.maxAge} | Trạng thái: {selectedSurvey.status?'Hoạt động':'Ẩn'}</div>
                      <div style={{marginTop:16}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <h4 style={{margin:0}}>Câu hỏi</h4>
                          <button className="admin-modal-btn" onClick={() => handleOpenQuestionModal()}>+ Thêm câu hỏi</button>
                        </div>
                        <div style={{marginTop:8,maxHeight:400,overflowY:'auto',paddingRight:4,display:'flex',flexDirection:'column',gap:16}}>
                          {questions.length === 0 && (
                            <div style={{color:'#64748b',textAlign:'center',padding:'16px 0'}}>Chưa có câu hỏi nào cho khảo sát này.</div>
                          )}
                          {questions.map((q, idx) => (
                            <div key={q.id} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:10,padding:'14px 16px',boxShadow:'0 1px 4px #e0e7ef22',marginBottom:0}}>
                              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8}}>
                                <div style={{fontWeight:600,fontSize:15,flex:1,lineHeight:'1.5',color:'#22292f'}}>
                                  <span style={{color:'#6366f1',marginRight:8}}>{idx+1}.</span>{q.content || q.questionText}
                                </div>
                                <div style={{display:'flex',gap:4}}>
                                  <button className="admin-modal-btn" style={{padding:'2px 8px',fontSize:13,background:'#fbbf24',color:'#fff'}} onClick={() => handleOpenQuestionModal(q)}>Sửa</button>
                                  <button className="admin-modal-btn" style={{padding:'2px 8px',fontSize:13,background:'#ef4444',color:'#fff'}} onClick={() => handleDeleteQuestion(q.id)}>Xóa</button>
                                  <button className="admin-modal-btn" style={{padding:'2px 8px',fontSize:13,background:'#22c55e',color:'#fff'}} onClick={() => { setSelectedQuestion(q); setEditingAnswer(null); setAnswerForm({ content: '', score: 0 }); setShowAnswerModal(true); }}>+ Thêm Đáp án</button>
                                </div>
                              </div>
                              <div style={{marginTop:4}}>
                                <div style={{fontWeight:500,fontSize:13,marginBottom:2,color:'#0ea5e9',textAlign:'left'}}>Đáp án</div>
                                {(q.answers && q.answers.length > 0) ? (
                                  <ul className="admin-modal-list" style={{margin:0,paddingLeft:0,display:'flex',flexDirection:'column',gap:4}}>
                                    {q.answers.map((a, aidx) => (
                                      <li key={a.id} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:6,padding:'5px 10px',display:'flex',alignItems:'center',gap:6}}>
                                        <span style={{flex:1,fontSize:14}}>{String.fromCharCode(65+aidx)}. {a.content || a.answerText} <span style={{color:'#64748b',fontSize:12}}>(Điểm: {a.score})</span></span>
                                        <button className="admin-modal-btn" style={{padding:'2px 7px',fontSize:12,background:'#fbbf24',color:'#fff'}} onClick={() => {
                                          setSelectedQuestion(q);
                                          setEditingAnswer(a);
                                          // Try all possible answer content keys
                                          let answerContent = '';
                                          if (typeof a.content === 'string') answerContent = a.content;
                                          else if (a.content !== undefined) answerContent = String(a.content);
                                          else if (typeof a.answerText === 'string') answerContent = a.answerText;
                                          else if (a.answerText !== undefined) answerContent = String(a.answerText);
                                          else if (typeof a.text === 'string') answerContent = a.text;
                                          else if (a.text !== undefined) answerContent = String(a.text);
                                          else if (typeof a.value === 'string') answerContent = a.value;
                                          else if (a.value !== undefined) answerContent = String(a.value);
                                          setAnswerForm({
                                            content: answerContent,
                                            score: (typeof a.score === 'number' ? a.score : (a.score !== undefined ? Number(a.score) : 0))
                                          });
                                          setShowAnswerModal(true);
                                        }}>Sửa</button>
                                        <button className="admin-modal-btn" style={{padding:'2px 7px',fontSize:12,background:'#ef4444',color:'#fff'}} onClick={() => { setSelectedQuestion(q); handleDeleteAnswer(a.id); }}>Xóa</button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div style={{color:'#64748b',fontSize:12,marginLeft:2}}>Chưa có đáp án nào.</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{color:'#64748b',textAlign:'center',marginTop:60}}>Chọn một khảo sát để xem chi tiết</div>
                  )}
                </div>
                {/* Popup modal thêm/sửa khảo sát */}
                {showSurveyModal && (
                  <div className="admin-modal-modal" style={{zIndex:10}}>
                    <h3>{editingSurvey ? 'Sửa khảo sát' : 'Thêm khảo sát'}</h3>
                    <input className="admin-modal-input" placeholder="Tên khảo sát" value={surveyForm.title} onChange={e => setSurveyForm(f => ({...f, title: e.target.value}))} />
                    <input className="admin-modal-input" placeholder="Mô tả" value={surveyForm.description} onChange={e => setSurveyForm(f => ({...f, description: e.target.value}))} />
                    <input className="admin-modal-input" placeholder="Loại khảo sát (type)" value={surveyForm.type} onChange={e => setSurveyForm(f => ({...f, type: e.target.value}))} />
                    <input className="admin-modal-input" type="number" placeholder="Độ tuổi tối thiểu (minAge)" value={surveyForm.minAge} min={0} onChange={e => setSurveyForm(f => ({...f, minAge: Number(e.target.value)}))} />
                    <input className="admin-modal-input" type="number" placeholder="Độ tuổi tối đa (maxAge)" value={surveyForm.maxAge} min={0} onChange={e => setSurveyForm(f => ({...f, maxAge: Number(e.target.value)}))} />
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
                {/* Popup modal thêm/sửa câu hỏi */}
                {showQuestionModal && (
                  <div className="admin-modal-modal" style={{zIndex:10}}>
                    <h3>{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h3>
                    <input className="admin-modal-input" placeholder="Nội dung câu hỏi" value={questionForm.content} onChange={e => setQuestionForm(f => ({...f, content: e.target.value}))} />
                    <button className="admin-modal-btn" onClick={handleSaveQuestion}>Lưu</button>
                    <button className="admin-modal-btn" onClick={() => setShowQuestionModal(false)}>Hủy</button>
                  </div>
                )}
                {/* Popup modal thêm/sửa đáp án */}
                {showAnswerModal && (
                  <div className="admin-modal-modal" style={{zIndex:10}}>
                    <h3>{editingAnswer ? 'Sửa đáp án' : 'Thêm đáp án'}</h3>
                    <input className="admin-modal-input" placeholder="Nội dung đáp án" value={answerForm.content || ''} onChange={e => setAnswerForm(f => ({...f, content: e.target.value}))} />
                    <input className="admin-modal-input" type="number" placeholder="Điểm số (score)" value={answerForm.score ?? 0} min={0} onChange={e => setAnswerForm(f => ({...f, score: Number(e.target.value)}))} />
                    <button className="admin-modal-btn" onClick={handleSaveAnswer}>Lưu</button>
                    <button className="admin-modal-btn" onClick={() => setShowAnswerModal(false)}>Hủy</button>
                  </div>
                )}
                <button className="admin-modal-close" onClick={() => setShowAdminModal(false)} title="Đóng">×</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveyEntryPage;

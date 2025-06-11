import React, { useState, useEffect } from 'react';
import './AssessmentPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faUserShield, faInfoCircle } from '@fortawesome/free-solid-svg-icons';


// Default User Data (used if none of the above are uncommented)
const currentUser = {
  userId: 'user-1234',
  role: 'user', // Example roles: 'user', 'counselor', 'admin'
  age: 25, // Example age
};

const getAppropriateAssessmentId = (user) => {
  // Example logic: CRAFFT for users under 18, ASSIST for users 18 and older.
  // This should be replaced with your actual moderation rules and return the Survey ID.
  if (user.age < 18) {
    return 'survey-crafft-id'; // Using a placeholder ID for CRAFFT
  } else {
    return 'survey-assist-id'; // Using a placeholder ID for ASSIST
  }
};

// --- Data Structured According to ERD (Simulated Fetch) ---

// Mock database of surveys, questions, and answers
const mockDatabase = {
  surveys: [
    {
      id: 'survey-assist-id',
      title: 'ASSIST Assessment',
      description: 'Alcohol, Smoking and Substance Involvement Screening Test',
      type: 'ASSIST',
      minAge: 18,
      maxAge: 99,
      createdBy: 'admin-1',
      questions: [
        {
          id: 'assist-q1',
          surveyId: 'survey-assist-id',
          content: 'Trong 3 tháng qua, bạn đã sử dụng các chất sau bao nhiêu lần?',
          questionOrder: 1,
          // Substances are part of the question context, not separate entities in ERD
          substances: [
            'Rượu bia', 'Cần sa', 'Cocain', 'Thuốc lắc', 'Heroin',
            'Thuốc an thần', 'Thuốc kích thích', 'Các chất khác'
          ],
          answers: [
            { id: 'assist-q1-a1', questionId: 'assist-q1', answerText: 'Không bao giờ', score: 0 },
            { id: 'assist-q1-a2', questionId: 'assist-q1', answerText: '1-2 lần', score: 1 },
            { id: 'assist-q1-a3', questionId: 'assist-q1', answerText: '3-5 lần', score: 2 },
            { id: 'assist-q1-a4', questionId: 'assist-q1', answerText: '6-9 lần', score: 3 },
            { id: 'assist-q1-a5', questionId: 'assist-q1', answerText: '10 lần trở lên', score: 4 },
          ]
        },
        {
          id: 'assist-q2',
          surveyId: 'survey-assist-id',
          content: 'Trong 3 tháng qua, bạn đã từng cảm thấy thèm muốn hoặc thôi thúc sử dụng các chất trên không?',
          questionOrder: 2,
          answers: [
            { id: 'assist-q2-a1', questionId: 'assist-q2', answerText: 'Không bao giờ', score: 0 },
            { id: 'assist-q2-a2', questionId: 'assist-q2', answerText: 'Hiếm khi', score: 1 },
            { id: 'assist-q2-a3', questionId: 'assist-q2', answerText: 'Thỉnh thoảng', score: 2 },
            { id: 'assist-q2-a4', questionId: 'assist-q2', answerText: 'Thường xuyên', score: 3 },
            { id: 'assist-q2-a5', questionId: 'assist-q2', answerText: 'Rất thường xuyên', score: 4 },
          ]
        },
        {
          id: 'assist-q3',
          surveyId: 'survey-assist-id',
          content: 'Trong 3 tháng qua, việc sử dụng các chất trên đã gây ra vấn đề về sức khỏe, xã hội, pháp lý hoặc tài chính cho bạn không?',
          questionOrder: 3,
          answers: [
            { id: 'assist-q3-a1', questionId: 'assist-q3', answerText: 'Không', score: 0 },
            { id: 'assist-q3-a2', questionId: 'assist-q3', answerText: 'Có, nhưng không nghiêm trọng', score: 1 },
            { id: 'assist-q3-a3', questionId: 'assist-q3', answerText: 'Có, ở mức độ trung bình', score: 2 },
            { id: 'assist-q3-a4', questionId: 'assist-q3', answerText: 'Có, ở mức độ nghiêm trọng', score: 3 },
          ]
        },
         {
          id: 'assist-q4',
          surveyId: 'survey-assist-id',
          content: 'Trong 3 tháng qua, bạn có từng thất bại trong việc làm những gì thường được mong đợi ở bạn do sử dụng các chất trên không?',
          questionOrder: 4,
          answers: [
            { id: 'assist-q4-a1', questionId: 'assist-q4', answerText: 'Không', score: 0 },
            { id: 'assist-q4-a2', questionId: 'assist-q4', answerText: 'Có, nhưng không thường xuyên', score: 1 },
            { id: 'assist-q4-a3', questionId: 'assist-q4', answerText: 'Có, thường xuyên', score: 2 },
          ]
        },
        {
          id: 'assist-q5',
          surveyId: 'survey-assist-id',
          content: 'Bạn bè hoặc người thân có từng bày tỏ lo ngại về việc sử dụng các chất của bạn không?',
          questionOrder: 5,
          answers: [
            { id: 'assist-q5-a1', questionId: 'assist-q5', answerText: 'Không', score: 0 },
            { id: 'assist-q5-a2', questionId: 'assist-q5', answerText: 'Có, nhưng không thường xuyên', score: 1 },
            { id: 'assist-q5-a3', questionId: 'assist-q5', answerText: 'Có, thường xuyên', score: 2 },
          ]
        },
        {
          id: 'assist-q6',
          surveyId: 'survey-assist-id',
          content: 'Bạn đã từng cố gắng giảm hoặc ngừng sử dụng các chất trên nhưng không thành công không?',
          questionOrder: 6,
          answers: [
            { id: 'assist-q6-a1', questionId: 'assist-q6', answerText: 'Không', score: 0 },
            { id: 'assist-q6-a2', questionId: 'assist-q6', answerText: 'Có, nhưng không thường xuyên', score: 1 },
            { id: 'assist-q6-a3', questionId: 'assist-q6', answerText: 'Có, thường xuyên', score: 2 },
          ]
        },
        {
          id: 'assist-q7',
          surveyId: 'survey-assist-id',
          content: 'Bạn đã từng sử dụng thuốc bằng đường tiêm chích không?',
          questionOrder: 7,
          answers: [
            { id: 'assist-q7-a1', questionId: 'assist-q7', answerText: 'Không bao giờ', score: 0 },
            { id: 'assist-q7-a2', questionId: 'assist-q7', answerText: 'Có, nhưng không trong 3 tháng qua', score: 1 },
            { id: 'assist-q7-a3', questionId: 'assist-q7', answerText: 'Có, trong 3 tháng qua', score: 2 },
          ]
        },
        // Add more ASSIST questions if needed
      ].sort((a, b) => a.questionOrder - b.questionOrder), // Sort questions by order
    },
    {
      id: 'survey-crafft-id',
      title: 'CRAFFT Assessment',
      description: 'A brief screening test for adolescent substance abuse',
      type: 'CRAFFT',
      minAge: 0,
      maxAge: 17,
      createdBy: 'admin-1',
      questions: [
        {
          id: 'crafft-q1',
          surveyId: 'survey-crafft-id',
          content: 'Bạn đã từng lái xe trong khi đang say hoặc đang sử dụng chất gây nghiện không?',
          questionOrder: 1,
          answers: [
            { id: 'crafft-q1-a1', questionId: 'crafft-q1', answerText: 'Không', score: 0 },
            { id: 'crafft-q1-a2', questionId: 'crafft-q1', answerText: 'Có', score: 1 },
          ]
        },
        {
          id: 'crafft-q2',
          surveyId: 'survey-crafft-id',
          content: 'Bạn có từng sử dụng chất gây nghiện để thư giãn, cảm thấy tốt hơn về bản thân, hoặc hòa nhập với mọi người không?',
          questionOrder: 2,
          answers: [
            { id: 'crafft-q2-a1', questionId: 'crafft-q2', answerText: 'Không', score: 0 },
            { id: 'crafft-q2-a2', questionId: 'crafft-q2', answerText: 'Có', score: 1 },
          ]
        },
        {
          id: 'crafft-q3',
          surveyId: 'survey-crafft-id',
          content: 'Bạn có từng sử dụng chất gây nghiện khi ở một mình không?',
          questionOrder: 3,
          answers: [
            { id: 'crafft-q3-a1', questionId: 'crafft-q3', answerText: 'Không', score: 0 },
            { id: 'crafft-q3-a2', questionId: 'crafft-q3', answerText: 'Có', score: 1 },
          ]
        },
        {
          id: 'crafft-q4',
          surveyId: 'survey-crafft-id',
          content: 'Bạn có từng quên những việc bạn đã làm khi đang sử dụng chất gây nghiện không?',
          questionOrder: 4,
          answers: [
            { id: 'crafft-q4-a1', questionId: 'crafft-q4', answerText: 'Không', score: 0 },
            { id: 'crafft-q4-a2', questionId: 'crafft-q4', answerText: 'Có', score: 1 },
          ]
        },
        {
          id: 'crafft-q5',
          surveyId: 'survey-crafft-id',
          content: 'Gia đình hoặc bạn bè có từng nói với bạn rằng bạn nên giảm bớt việc sử dụng chất gây nghiện không?',
          questionOrder: 5,
          answers: [
            { id: 'crafft-q5-a1', questionId: 'crafft-q5', answerText: 'Không', score: 0 },
            { id: 'crafft-q5-a2', questionId: 'crafft-q5', answerText: 'Có', score: 1 },
          ]
        },
        {
          id: 'crafft-q6',
          surveyId: 'survey-crafft-id',
          content: 'Bạn có từng gặp rắc rối khi đang sử dụng chất gây nghiện không?',
          questionOrder: 6,
          answers: [
            { id: 'crafft-q6-a1', questionId: 'crafft-q6', answerText: 'Không', score: 0 },
            { id: 'crafft-q6-a2', questionId: 'crafft-q6', answerText: 'Có', score: 1 },
          ]
        },
        // Add more CRAFFT questions if needed
      ].sort((a, b) => a.questionOrder - b.questionOrder), // Sort questions by order
    },
  ],
};

// Simulate fetching a survey and its questions/answers from the "database"
const fetchSurveyData = (surveyId) => {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      const survey = mockDatabase.surveys.find(s => s.id === surveyId);
      if (survey) {
        // In a real app, you might fetch questions and answers separately
        // Here, we assume the survey object includes nested questions and answers
        resolve(survey);
      } else {
        reject(`Survey with ID ${surveyId} not found`);
      }
    }, 500); // Simulate network latency
  });
};

// --- AssessmentPage Component ---

const AssessmentPage = () => {
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // userAnswers will store { questionId: answerId }
  const [userAnswers, setUserAnswers] = useState({});
  const [stage, setStage] = useState('loading'); // 'loading', 'questions', 'results', 'error'
  const [results, setResults] = useState(null); // Store calculated results

  // Fetch the appropriate survey when the component mounts
  useEffect(() => {
    const appropriateSurveyId = getAppropriateAssessmentId(currentUser);
    fetchSurveyData(appropriateSurveyId)
      .then(survey => {
        setCurrentSurvey(survey);
        setStage('questions'); // Move to questions stage
      })
      .catch(err => {
        console.error('Error fetching survey:', err);
        // setError(err); // Optional: store error details
        setStage('error'); // Move to error stage
      });
  }, []); // Empty dependency array means this effect runs only once on mount

  const handleAnswerSelect = (questionId, answerId) => {
    setUserAnswers({ ...userAnswers, [questionId]: answerId });
  };

  const calculateScoreAndResults = () => {
    if (!currentSurvey) return null; // Should not happen if stage is 'results'

    let totalScore = 0;
    const userResponsesForSurveyResponsesTable = []; // Data structure for SurveyResponses
    const userAnswersForUserSurveyAnswersTable = []; // Data structure for UserSurveyAnswers

    // Calculate total score and prepare data for saving
    currentSurvey.questions.forEach(question => {
      const selectedAnswerId = userAnswers[question.id];
      if (selectedAnswerId) {
        const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
        if (selectedAnswer) {
          totalScore += selectedAnswer.score;

          // Prepare data for UserSurveyAnswers table
          userAnswersForUserSurveyAnswersTable.push({
             // Assuming a ResponseID will be generated on the backend after saving SurveyResponses
            // responseId: 'generated-response-id',
            answerId: selectedAnswer.id,
            isSelected: true,
            // questionId: question.id // May not be needed based on your ERD
          });
        }
      }
    });

    // Determine Risk Level and Suggested Actions based on the survey type and total score
    let riskLevel = 'Unknown';
    let suggestedActions = 'No specific actions suggested.';

    if (currentSurvey.type === 'ASSIST') {
      // TODO: Implement actual ASSIST scoring and risk level determination logic
      if (totalScore <= 3) {
        riskLevel = 'Thấp';
        suggestedActions = 'Nguy cơ thấp, không cần can thiệp';
      } else if (totalScore <= 26) {
        riskLevel = 'Trung bình';
        suggestedActions = 'Nguy cơ trung bình, cần tư vấn ngắn';
      } else {
        riskLevel = 'Cao';
        suggestedActions = 'Nguy cơ cao, cần can thiệp chuyên sâu';
      }
    } else if (currentSurvey.type === 'CRAFFT') {
        // TODO: Implement actual CRAFFT scoring and risk level determination logic
        // CRAFFT is typically scored by counting 'Yes' answers (score = 1)
         if (totalScore <= 2) {
            riskLevel = 'Thấp';
            suggestedActions = 'Nguy cơ thấp, không cần can thiệp';
         } else {
            riskLevel = 'Cao';
            suggestedActions = 'Nguy cơ cao, cần đánh giá chuyên sâu';
         }
    }

    // Prepare data for SurveyResponses table
    userResponsesForSurveyResponsesTable.push({
      // id: 'generated-response-id', // Backend generates ID
      surveyId: currentSurvey.id,
      userId: currentUser.userId, // Assuming currentUser is available
      totalScore: totalScore,
      riskLevel: riskLevel, // Store the determined risk level
      suggestedActions: suggestedActions, // Store the determined suggested actions
      submittedAt: new Date().toISOString(), // Current timestamp
    });

    return {
      totalScore,
      riskLevel,
      suggestedActions,
      surveyResponsesData: userResponsesForSurveyResponsesTable[0], // Data for SurveyResponses table
      userSurveyAnswersData: userAnswersForUserSurveyAnswersTable // Data for UserSurveyAnswers table
    };
  };

  const handleNext = () => {
    if (!currentSurvey) return; // Should not happen in 'questions' stage

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < currentSurvey.questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      // Reached the end of questions, calculate and show results
      const calculatedResults = calculateScoreAndResults();
      setResults(calculatedResults);
      setStage('results');
      // TODO: Send results to backend here or in a separate effect/function
      console.log('Assessment Completed. Results:', calculatedResults);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentSurvey(null); // Reset survey data
    setCurrentQuestionIndex(0);
    setUserAnswers({}); // Clear answers
    setResults(null); // Clear results
    setStage('loading'); // Go back to loading state to refetch
    // Re-fetch the appropriate assessment based on current user
    const appropriateSurveyId = getAppropriateAssessmentId(currentUser);
     fetchSurveyData(appropriateSurveyId)
      .then(survey => {
        setCurrentSurvey(survey);
        setStage('questions');
      })
      .catch(err => {
        console.error('Error fetching survey on reset:', err);
        // setError(err); // Optional: store error details
        setStage('error');
      });
  };

  // Render the main content based on the current stage (questions or results)
  const renderMainContent = () => {
    switch (stage) {
      case 'loading':
        return <div className="assessment-content">Đang tải khảo sát...</div>; // Loading state message
      case 'error':
        return <div className="assessment-content">Lỗi khi tải khảo sát. Vui lòng thử lại sau.</div>; // Error message
      case 'questions':
        if (!currentSurvey || !currentSurvey.questions[currentQuestionIndex]) {
             // Should not happen if stage is 'questions' and no error
            return <div className="assessment-content">Không tìm thấy câu hỏi.</div>; // Should not happen
        }
        const currentQuestion = currentSurvey.questions[currentQuestionIndex];
        const totalQuestions = currentSurvey.questions.length;

        return (
             <div className="assessment-content">
                <div className="assessment-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
                            }}
                        />
                    </div>
                    <span className="progress-text">
                        Câu hỏi {currentQuestionIndex + 1}/{totalQuestions}
                    </span>
                </div>

                <div className="question-card">
                    <div className="question-header">
                        <h3>Câu hỏi {currentQuestionIndex + 1}: {currentQuestion.content}</h3>
                        {currentQuestion.substances && (
                            <div className="substances-list">
                                {currentQuestion.substances.map((substance, index) => (
                                    <span key={index} className="substance-tag">
                                        {substance}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="options-grid">
                        {currentQuestion.answers.map((answer) => (
                            <button
                                key={answer.id}
                                className={`option-btn ${
                                    userAnswers[currentQuestion.id] === answer.id
                                        ? 'selected'
                                        : ''
                                }`}
                                onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                            >
                                {answer.answerText}
                            </button>
                        ))}
                    </div>

                    <div className="question-navigation">
                        {currentQuestionIndex > 0 && (
                            <button className="btn-back" onClick={handleBack}>
                                <FontAwesomeIcon icon={faArrowLeft} />
                                Quay lại
                            </button>
                        )}
                        <button
                            className="btn-next"
                            onClick={handleNext}
                            disabled={userAnswers[currentQuestion.id] === undefined}
                        >
                            {currentQuestionIndex === totalQuestions - 1 ? 'Xem kết quả' : 'Tiếp tục'}
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                </div>
            </div>
        );
      case 'results':
           if (!results) {
               // Should not happen if stage is 'results'
              return <div className="assessment-content">Không có kết quả để hiển thị.</div>; // Should not happen
           }
        return (
             <div className="assessment-content">
               <div className="results-card">
                  <h2>Kết Quả Đánh Giá</h2>
                   {/* Display results based on calculated values */}
                  <div className="score-section">
                        <h3>Điểm Tổng: {results.totalScore}</h3>
                        <div
                          className="risk-level"
                          style={{
                            backgroundColor: results.riskLevel === 'Thấp' ? '#4caf50' : results.riskLevel === 'Trung bình' ? '#ff9800' : '#f44336' // Basic color logic
                          }}
                        >
                          Mức độ nguy cơ: {results.riskLevel}
                        </div>
                        <p className="risk-description">
                          Gợi ý hành động: {results.suggestedActions}
                        </p>
                      </div>

                  <div className="results-actions">
                    <button className="btn-primary" onClick={handleReset}>
                      Làm lại đánh giá
                    </button>
                     {/* Optional: Add a button to navigate to more detailed results page or counseling booking */}
                    {/* <button className="btn-secondary">Đặt lịch tư vấn</button> */}
                  </div>
                </div>
            </div>
          );
      default:
        return <div className="assessment-content">Đã xảy ra lỗi không xác định.</div>; // Default error state
    }
  };

   // Define the Info section JSX
   const infoSection = (
    <div className="assessment-info">
      <div className="info-card">
        <FontAwesomeIcon icon={faUserShield} />
        <h4>Bảo mật thông tin</h4>
        <p>Tất cả thông tin của bạn sẽ được bảo mật và chỉ được sử dụng cho mục đích đánh giá.</p>
      </div>
      <div className="info-card">
        <FontAwesomeIcon icon={faInfoCircle} />
        <h4>Hướng dẫn</h4>
        <p>Hãy trả lời trung thực để có kết quả đánh giá chính xác nhất.</p>
      </div>
    </div>
  );

  return (
    <div className="assessment-page">
      <div className="assessment-header">
         <div className="assessment-header-content">
           <h1>{currentSurvey ? currentSurvey.title : 'Đánh Giá Nguy Cơ'}</h1>
           <p>{currentSurvey ? currentSurvey.description : ''}</p>
         </div>
       </div>
       <div className="assessment-container">
          {renderMainContent()}
          {/* Render the Info section below the main content if applicable stages */}
          {(stage === 'questions' || stage === 'results') && infoSection}
       </div>

    </div>
  );
};

export default AssessmentPage; 
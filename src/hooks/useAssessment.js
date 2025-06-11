import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAssessment = () => {
  const { currentUser } = useAuth();
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [stage, setStage] = useState('loading');
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const getAppropriateAssessmentId = (user) => {
    if (!user?.age) {
      throw new Error('User age is required for assessment');
    }
    return user.age < 18 ? 'survey-crafft-id' : 'survey-assist-id';
  };

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const surveyId = getAppropriateAssessmentId(currentUser);
        const response = await fetch(`/api/assessments/${surveyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch assessment');
        }
        const survey = await response.json();
        setCurrentSurvey(survey);
        setStage('questions');
      } catch (err) {
        setError(err.message);
        setStage('error');
      }
    };

    if (currentUser) {
      fetchSurvey();
    }
  }, [currentUser]);

  const handleAnswerSelect = (questionId, answerId) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const calculateScoreAndResults = () => {
    if (!currentSurvey) return null;

    let totalScore = 0;
    const questionScores = {};

    currentSurvey.questions.forEach(question => {
      const answerId = userAnswers[question.id];
      if (answerId) {
        const answer = question.answers.find(a => a.id === answerId);
        if (answer) {
          questionScores[question.id] = answer.score;
          totalScore += answer.score;
        }
      }
    });

    // Calculate risk level based on total score
    let riskLevel = 'low';
    if (currentSurvey.type === 'ASSIST') {
      if (totalScore >= 27) riskLevel = 'high';
      else if (totalScore >= 4) riskLevel = 'moderate';
    } else if (currentSurvey.type === 'CRAFFT') {
      if (totalScore >= 2) riskLevel = 'high';
    }

    return {
      totalScore,
      questionScores,
      riskLevel,
      recommendations: getRecommendations(riskLevel, currentSurvey.type)
    };
  };

  const getRecommendations = (riskLevel, assessmentType) => {
    const recommendations = {
      low: {
        ASSIST: 'Mức độ sử dụng chất của bạn ở mức thấp. Hãy tiếp tục duy trì lối sống lành mạnh.',
        CRAFFT: 'Bạn đang có lối sống lành mạnh. Hãy tiếp tục phát huy.'
      },
      moderate: {
        ASSIST: 'Bạn đang có dấu hiệu sử dụng chất ở mức độ trung bình. Nên tham khảo ý kiến chuyên gia.',
        CRAFFT: 'Có một số dấu hiệu cần lưu ý. Nên trao đổi với chuyên gia tư vấn.'
      },
      high: {
        ASSIST: 'Bạn đang có dấu hiệu sử dụng chất ở mức độ cao. Cần được tư vấn và hỗ trợ chuyên môn.',
        CRAFFT: 'Có nhiều dấu hiệu đáng lo ngại. Cần được tư vấn và hỗ trợ ngay lập tức.'
      }
    };

    return recommendations[riskLevel][assessmentType];
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSurvey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const assessmentResults = calculateScoreAndResults();
      setResults(assessmentResults);
      setStage('results');
      // Save results to backend
      saveAssessmentResults(assessmentResults);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setResults(null);
    setStage('questions');
  };

  const saveAssessmentResults = async (results) => {
    try {
      const response = await fetch('/api/assessments/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          surveyId: currentSurvey.id,
          results,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment results');
      }
    } catch (err) {
      console.error('Error saving assessment results:', err);
      // Handle error appropriately
    }
  };

  return {
    currentSurvey,
    currentQuestionIndex,
    userAnswers,
    stage,
    error,
    results,
    handleAnswerSelect,
    handleNext,
    handleBack,
    handleReset
  };
}; 
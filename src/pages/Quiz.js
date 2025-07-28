import React, { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import courseService from "../services/courseService";
import QuizTimer from "../components/QuizTimer";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Alert,
} from "@mui/material";

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState(
    location.state?.sessionId || null
  );
  const [sessionStarted, setSessionStarted] = useState(
    !!location.state?.sessionId
  );
  const [sessionExpired, setSessionExpired] = useState(false);

  const startQuizSession = async () => {
    setLoading(true);
    setError("");
    try {
      const sessionRes = await courseService.startQuizSession(quizId);
      if (sessionRes.success && sessionRes.data) {
        setSessionId(sessionRes.data.sessionId);
        setSessionStarted(true);

        // Set questions if provided
        if (sessionRes.data.questions) {
          setQuestions(sessionRes.data.questions);
        }

        return sessionRes.data;
      } else {
        throw new Error(
          sessionRes.message || "Failed to start quiz session"
        );
      }
    } catch (err) {
      setError(err.message || "Không khởi tạo được session cho quiz");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizData = async () => {
    try {
      const quizRes = await courseService.getQuizById(quizId);
      if (quizRes.success && quizRes.data) {
        setQuiz(quizRes.data);
      } else {
        setError(quizRes.message || "Không tìm thấy quiz");
        return;
      }
    } catch (err) {
      setError("Lỗi khi tải thông tin quiz");
    }
  };

  const fetchQuestions = async () => {
    try {
      const questionsRes = await courseService.getQuestionsByQuiz(
        quizId
      );
      if (questionsRes.success && questionsRes.data) {
        setQuestions(questionsRes.data);
      } else {
        setError(questionsRes.message || "Không tải được câu hỏi");
      }
    } catch (err) {
      setError("Lỗi khi tải câu hỏi");
    }
  };

  useEffect(() => {
    const initializeQuiz = async () => {
      setLoading(true);
      try {
        await fetchQuizData();

        // If we have sessionId from navigation state, just fetch questions
        if (sessionId) {
          await fetchQuestions();
        } else {
          // Otherwise start a new session
          await startQuizSession();
        }
      } catch (err) {
        console.error("Quiz initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initializeQuiz();
  }, [quizId, sessionId]);

  const handleAnswer = (questionId, answerId) => {
    if (sessionExpired) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleTimeExpired = () => {
    setSessionExpired(true);
  };

  const handleSubmit = async () => {
    if (!sessionId) {
      setError(
        "No active quiz session. Please refresh and try again."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await courseService.submitQuizAnswers({
        quizId,
        sessionId,
        answers: Object.entries(answers).map(
          ([questionId, selectedAnswerId]) => ({
            questionId,
            selectedAnswerId,
          })
        ),
        timeSpent: quiz.timeLimitMinutes
          ? (quiz.timeLimitMinutes * 60) / 60
          : 30,
      });

      if (res.success && res.data) {
        setResult(res.data);

        // Handle auto course completion
        if (res.data.isPassed) {
          // Backend should handle auto completion
          console.log(
            "🎉 Quiz passed! Course completed automatically."
          );
        }
      } else {
        setError(res.message || "Nộp bài thất bại");
      }
    } catch (err) {
      // Handle session-related errors
      if (
        err.message.includes("session expired") ||
        err.message.includes("Session expired")
      ) {
        setError("Quiz session expired. Please start again.");
        setSessionExpired(true);
      } else if (err.message.includes("Invalid session")) {
        setError("Invalid session. Please refresh and try again.");
      } else if (err.message.includes("Quiz not found")) {
        setError("Quiz not available for this course.");
      } else {
        setError(err.message || "Lỗi khi nộp bài");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setSessionExpired(false);
    setSessionStarted(false);
    setSessionId(null);
    setAnswers({});
    setResult(null);
    setError("");
    startQuizSession();
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );

  if (error && !sessionStarted)
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRestart}>
          Thử lại
        </Button>
      </Box>
    );

  if (!quiz) return null;

  return (
    <Box maxWidth="md" mx="auto" p={4}>
      <Typography variant="h4" fontWeight={600} mb={2}>
        {quiz.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        {quiz.description}
      </Typography>

      {/* Quiz Timer */}
      <QuizTimer
        timeLimitMinutes={quiz.timeLimitMinutes}
        onTimeExpired={handleTimeExpired}
        isActive={sessionStarted && !result}
        showWarning={true}
      />

      {/* Session Expired Alert */}
      {sessionExpired && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Thời gian làm bài đã hết. Vui lòng nộp bài hoặc làm lại.
        </Alert>
      )}

      {/* Questions */}
      {questions.map((q, idx) => (
        <Paper key={q.id || q.questionId} sx={{ p: 2, mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "#2196f3", fontWeight: 600 }}>
            {`Câu ${idx + 1}: ${q.content}`}
          </Typography>
          <RadioGroup
            name={`question-${q.id || q.questionId}`}
            value={answers[q.id || q.questionId] || ""}
            onChange={(e) =>
              handleAnswer(q.id || q.questionId, e.target.value)
            }>
            {q.answers?.map((ans) => (
              <FormControlLabel
                key={ans.id}
                value={ans.id}
                control={<Radio />}
                label={ans.answerText}
                disabled={sessionExpired}
              />
            ))}
          </RadioGroup>
        </Paper>
      ))}

      {/* Action Buttons */}
      {!result && (
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              submitting ||
              Object.keys(answers).length !== questions.length ||
              sessionExpired
            }>
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </Button>

          {sessionExpired && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleRestart}>
              Làm lại
            </Button>
          )}
        </Box>
      )}

      {/* Results */}
      {result && (
        <Box mt={3}>
          <Alert
            severity={result.isPassed ? "success" : "error"}
            sx={{ mb: 2 }}>
            <Typography variant="h6">
              {result.isPassed
                ? "🎉 Chúc mừng! Bạn đã vượt qua quiz!"
                : "❌ Bạn chưa đạt yêu cầu."}
            </Typography>
            <Typography>Điểm số: {result.score}%</Typography>
            {result.isPassed && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Khóa học đã được hoàn thành tự động!
              </Typography>
            )}
          </Alert>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(-1)}>
              Quay lại
            </Button>

            {!result.isPassed && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleRestart}>
                Làm lại
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Quiz;

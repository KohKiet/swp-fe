import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseService from "../services/courseService";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from "@mui/material";

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const fetchQuizAndSession = async () => {
      setLoading(true);
      try {
        // Lấy thông tin quiz (title, description...)
        const quizRes = await courseService.getQuizById(quizId);
        if (quizRes.success && quizRes.data) {
          setQuiz(quizRes.data);
        } else {
          setError(quizRes.message || "Không tìm thấy quiz");
          setLoading(false);
          return;
        }
        // Khởi tạo session và lấy câu hỏi
        const sessionRes = await courseService.startQuizSession(
          quizId
        );
        if (sessionRes.success && sessionRes.data) {
          setSessionId(sessionRes.data.sessionId);
          if (sessionRes.data.questions) {
            setQuestions(sessionRes.data.questions);
          } else {
            setQuestions([]);
          }
        } else {
          setError(
            sessionRes.message ||
              "Không khởi tạo được session cho quiz"
          );
        }
      } catch (err) {
        setError("Lỗi khi tải quiz hoặc khởi tạo session");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndSession();
  }, [quizId]);

  const handleAnswer = (questionId, answerId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await courseService.submitQuizAnswers({
        quizId,
        sessionId, // truyền sessionId lấy từ API
        answers: Object.entries(answers).map(
          ([questionId, selectedAnswerId]) => ({
            questionId,
            selectedAnswerId,
          })
        ),
      });
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || "Nộp bài thất bại");
      }
    } catch (err) {
      setError("Lỗi khi nộp bài");
    } finally {
      setSubmitting(false);
    }
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
  if (error)
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
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
              />
            ))}
          </RadioGroup>
        </Paper>
      ))}
      {!result && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={
            submitting ||
            Object.keys(answers).length !== questions.length
          }>
          {submitting ? "Đang nộp..." : "Nộp bài"}
        </Button>
      )}
      {result && result.isPassed && (
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      )}
      {result && !result.isPassed && (
        <Button
          variant="contained"
          color="error"
          onClick={() => window.location.reload()}>
          Làm lại
        </Button>
      )}
      {result && (
        <Box mt={3}>
          <Typography
            variant="h6"
            color={result.isPassed ? "success.main" : "error.main"}>
            {result.isPassed
              ? "Bạn đã vượt qua quiz!"
              : "Bạn chưa đạt yêu cầu."}
          </Typography>
          <Typography>Kết quả: {result.score}%</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Quiz;

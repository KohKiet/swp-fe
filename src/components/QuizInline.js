import React, { useEffect, useState } from "react";
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
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import {
  Quiz as QuizIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import QuizTimer from "./QuizTimer";
import courseService from "../services/courseService";

const QuizInline = ({
  quiz,
  courseId,
  onQuizComplete,
  onBackToLessons,
}) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Start quiz session
  const startQuizSession = async () => {
    setLoading(true);
    setError("");
    try {
      // Check if this is a demo quiz (has questions pre-loaded)
      if (quiz.questions && quiz.questions.length > 0) {
        console.log("🧪 Using demo quiz data");
        setSessionId("demo-session-" + Date.now());
        setSessionStarted(true);
        setQuestions(quiz.questions);
        setLoading(false);
        return {
          sessionId: "demo-session",
          questions: quiz.questions,
        };
      }

      // Real API call for actual quiz
      const sessionRes = await courseService.startQuizSession(
        quiz.id
      );
      if (sessionRes.success && sessionRes.data) {
        setSessionId(sessionRes.data.sessionId);
        setSessionStarted(true);

        // Set questions if provided
        if (sessionRes.data.questions) {
          setQuestions(sessionRes.data.questions);
        } else {
          // Fetch questions separately
          await fetchQuestions();
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

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      const questionsRes = await courseService.getQuestionsByQuiz(
        quiz.id
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

  // Initialize quiz
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        await startQuizSession();
      } catch (err) {
        console.error("Quiz initialization failed:", err);
      }
    };
    initializeQuiz();
  }, [quiz.id]);

  // Track time spent
  useEffect(() => {
    if (sessionStarted && !result && !sessionExpired) {
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionStarted, result, sessionExpired]);

  const handleAnswer = (questionId, answerId) => {
    if (sessionExpired || result) return;
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
      // Check if this is a demo quiz
      if (sessionId.startsWith("demo-session")) {
        console.log("🧪 Processing demo quiz submission");

        // Calculate score for demo quiz
        let correctAnswers = 0;
        let totalQuestions = questions.length;

        questions.forEach((question) => {
          const selectedAnswerId = answers[question.id];
          const correctAnswer = question.answers.find(
            (ans) => ans.isCorrect
          );
          if (selectedAnswerId === correctAnswer?.id) {
            correctAnswers++;
          }
        });

        const score = Math.round(
          (correctAnswers / totalQuestions) * 100
        );
        const isPassed = score >= (quiz.passingScore || 70);

        const demoResult = {
          isPassed,
          score,
          courseCompleted: isPassed,
          correctAnswers,
          totalQuestions,
        };

        setResult(demoResult);

        if (isPassed) {
          console.log(
            "🎉 Demo quiz passed! Course completed automatically."
          );
          if (onQuizComplete) {
            onQuizComplete(demoResult);
          }
        }

        setSubmitting(false);
        return;
      }

      // Real API call for actual quiz
      const res = await courseService.submitQuizAnswers({
        quizId: quiz.id,
        sessionId,
        answers: Object.entries(answers).map(
          ([questionId, selectedAnswerId]) => ({
            questionId,
            selectedAnswerId,
          })
        ),
        timeSpent: Math.ceil(timeSpent / 60), // Convert to minutes
      });

      if (res.success && res.data) {
        setResult(res.data);

        // Handle auto course completion
        if (res.data.isPassed) {
          console.log(
            "🎉 Quiz passed! Course completed automatically."
          );
          if (onQuizComplete) {
            onQuizComplete(res.data);
          }
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
    setTimeSpent(0);
    startQuizSession();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        gap={2}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang tải quiz...
        </Typography>
      </Box>
    );
  }

  if (error && !sessionStarted) {
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
  }

  return (
    <Box>
      {/* Quiz Header */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}>
          <QuizIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {quiz.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {quiz.description ||
                "Bài kiểm tra để đánh giá kiến thức của bạn"}
            </Typography>
          </Box>
        </Stack>

        {/* Quiz Info */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip
            icon={<TimeIcon />}
            label={`${quiz.timeLimitMinutes || 30} phút`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<QuizIcon />}
            label={`${questions.length} câu hỏi`}
            color="secondary"
            variant="outlined"
          />
          <Chip
            icon={<CheckCircleIcon />}
            label={`Điểm đạt: ${quiz.passingScore || 70}%`}
            color="success"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Quiz Timer */}
      <QuizTimer
        timeLimitMinutes={quiz.timeLimitMinutes || 30}
        onTimeExpired={handleTimeExpired}
        isActive={sessionStarted && !result}
        showWarning={true}
      />

      {/* Session Expired Alert */}
      {sessionExpired && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <WarningIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Thời gian làm bài đã hết. Vui lòng nộp bài hoặc làm lại.
          </Typography>
        </Alert>
      )}

      {/* Questions */}
      {questions.length > 0 && !result && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "primary.main" }}>
            Câu hỏi ({questions.length} câu)
          </Typography>
          <Stack spacing={3}>
            {questions.map((q, idx) => (
              <Paper key={q.id || q.questionId} sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#2196f3", fontWeight: 600, mb: 2 }}>
                  {`Câu ${idx + 1}: ${q.content}`}
                </Typography>
                <RadioGroup
                  name={`question-${q.id || q.questionId}`}
                  value={answers[q.id || q.questionId] || ""}
                  onChange={(e) =>
                    handleAnswer(q.id || q.questionId, e.target.value)
                  }>
                  <Stack spacing={1}>
                    {q.answers?.map((ans) => (
                      <FormControlLabel
                        key={ans.id}
                        value={ans.id}
                        control={<Radio />}
                        label={ans.answerText}
                        disabled={sessionExpired}
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            fontSize: "16px",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </RadioGroup>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Action Buttons */}
      {!result && (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={
              submitting ||
              Object.keys(answers).length !== questions.length ||
              sessionExpired
            }
            sx={{ minWidth: 120 }}>
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Đang nộp...
              </>
            ) : (
              "Nộp bài"
            )}
          </Button>

          {sessionExpired && (
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleRestart}>
              Làm lại
            </Button>
          )}

          <Button
            variant="outlined"
            size="large"
            onClick={onBackToLessons}>
            Quay lại bài học
          </Button>
        </Box>
      )}

      {/* Results */}
      {result && (
        <Paper sx={{ p: 4, bgcolor: "grey.50" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            {result.isPassed ? (
              <CheckCircleIcon
                sx={{ fontSize: 64, color: "success.main", mb: 2 }}
              />
            ) : (
              <WarningIcon
                sx={{ fontSize: 64, color: "warning.main", mb: 2 }}
              />
            )}
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {result.isPassed ? "🎉 Chúc mừng!" : "😔 Chưa đạt"}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom>
              {result.isPassed
                ? "Bạn đã hoàn thành quiz thành công!"
                : "Bạn cần cải thiện thêm để đạt yêu cầu"}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Typography variant="body1">Điểm số:</Typography>
              <Chip
                label={`${result.score || 0}%`}
                color={result.isPassed ? "success" : "warning"}
                variant="filled"
              />
            </Box>
            {result.correctAnswers !== undefined && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <Typography variant="body1">Câu đúng:</Typography>
                <Typography variant="body1">
                  {result.correctAnswers}/{result.totalQuestions} câu
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Typography variant="body1">
                Thời gian làm bài:
              </Typography>
              <Typography variant="body1">
                {Math.floor(timeSpent / 60)}:
                {String(timeSpent % 60).padStart(2, "0")}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Typography variant="body1">Trạng thái:</Typography>
              <Chip
                label={result.isPassed ? "Đạt" : "Chưa đạt"}
                color={result.isPassed ? "success" : "warning"}
                variant="outlined"
              />
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              gap: 2,
              justifyContent: "center",
            }}>
            {!result.isPassed && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleRestart}>
                Làm lại
              </Button>
            )}
            <Button variant="outlined" onClick={onBackToLessons}>
              Quay lại bài học
            </Button>
          </Box>
        </Paper>
      )}

      {/* Progress Indicator */}
      {!result && questions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom>
            Tiến độ: {Object.keys(answers).length}/{questions.length}{" "}
            câu đã trả lời
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: 8,
              bgcolor: "grey.200",
              borderRadius: 4,
              overflow: "hidden",
            }}>
            <Box
              sx={{
                width: `${
                  (Object.keys(answers).length / questions.length) *
                  100
                }%`,
                height: "100%",
                bgcolor: "primary.main",
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default QuizInline;

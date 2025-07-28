import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Quiz as QuizIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import courseService from "../services/courseService";

const StartQuizButton = ({
  quizId,
  courseId,
  quizTitle,
  timeLimitMinutes,
  passingScore,
  questionCount,
  variant = "contained",
  size = "medium",
  disabled = false,
}) => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartQuiz = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate quizId
      if (!quizId) {
        throw new Error("Quiz ID không hợp lệ. Vui lòng thử lại.");
      }

      console.log("🧪 Starting quiz session with quizId:", quizId);

      // Start quiz session
      const sessionRes = await courseService.startQuizSession(quizId);

      if (sessionRes.success && sessionRes.data) {
        // Navigate to quiz with session
        navigate(`/quiz/${quizId}`, {
          state: {
            sessionId: sessionRes.data.sessionId,
            courseId: courseId,
          },
        });
      } else {
        throw new Error(
          sessionRes.message || "Failed to start quiz session"
        );
      }
    } catch (err) {
      console.error("🧪 Quiz session error:", err);
      setError(
        err.message || "Không thể bắt đầu quiz. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setError("");
  };

  const handleConfirm = () => {
    handleClose();
    handleStartQuiz();
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={<QuizIcon />}
        onClick={handleClick}
        disabled={disabled || loading}
        color="primary">
        {loading ? "Đang tải..." : "Bắt đầu Quiz"}
      </Button>

      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <QuizIcon color="primary" />
            <Typography variant="h6">Bắt đầu Quiz</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {quizTitle || "Quiz"}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}>
              {timeLimitMinutes && (
                <Box display="flex" alignItems="center" gap={1}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Thời gian: {timeLimitMinutes} phút
                  </Typography>
                </Box>
              )}

              {questionCount && (
                <Box display="flex" alignItems="center" gap={1}>
                  <InfoIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Số câu hỏi: {questionCount}
                  </Typography>
                </Box>
              )}

              {passingScore && (
                <Box display="flex" alignItems="center" gap={1}>
                  <InfoIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Điểm đạt: {passingScore}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Lưu ý:</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              • Quiz sẽ bắt đầu ngay khi bạn xác nhận
            </Typography>
            <Typography variant="body2">
              • Thời gian sẽ được tính từ lúc bắt đầu
            </Typography>
            <Typography variant="body2">
              • Bạn không thể dừng hoặc tạm dừng quiz
            </Typography>
            <Typography variant="body2">
              • Hãy đảm bảo kết nối internet ổn định
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} /> : null
            }>
            {loading ? "Đang bắt đầu..." : "Bắt đầu Quiz"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StartQuizButton;

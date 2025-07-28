import React, { useEffect, useState } from "react";
import { Box, Chip, Typography, Alert } from "@mui/material";
import { AccessTime as TimeIcon } from "@mui/icons-material";

const QuizTimer = ({
  timeLimitMinutes,
  onTimeExpired,
  isActive = true,
  showWarning = true,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(
    timeLimitMinutes ? timeLimitMinutes * 60 : null
  );
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isActive || !timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          if (onTimeExpired) {
            onTimeExpired();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining, onTimeExpired]);

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (!timeRemaining) return "default";
    if (timeRemaining < 60) return "error";
    if (timeRemaining < 300) return "warning"; // 5 minutes
    return "primary";
  };

  const getTimerVariant = () => {
    if (!timeRemaining) return "outlined";
    if (timeRemaining < 60) return "filled";
    return "outlined";
  };

  if (!timeLimitMinutes) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Chip
        icon={<TimeIcon />}
        label={`Thời gian còn lại: ${formatTime(timeRemaining)}`}
        color={getTimerColor()}
        variant={getTimerVariant()}
        sx={{
          fontSize: "1.1rem",
          fontWeight: "bold",
          minWidth: "200px",
          height: "40px",
        }}
      />

      {showWarning &&
        timeRemaining &&
        timeRemaining < 300 &&
        timeRemaining > 60 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">
              ⚠️ Chỉ còn {Math.floor(timeRemaining / 60)} phút! Hãy
              nộp bài sớm.
            </Typography>
          </Alert>
        )}

      {isExpired && (
        <Alert severity="error" sx={{ mt: 1 }}>
          <Typography variant="body2">
            ⏰ Thời gian làm bài đã hết! Vui lòng nộp bài ngay.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default QuizTimer;

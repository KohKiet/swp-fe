import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Alert,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const TimerContainer = styled(Paper)(({ theme, status }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: `2px solid ${
    status === "warning"
      ? theme.palette.warning.main
      : status === "danger"
      ? theme.palette.error.main
      : theme.palette.primary.main
  }`,
  backgroundColor:
    status === "warning"
      ? theme.palette.warning.light
      : status === "danger"
      ? theme.palette.error.light
      : theme.palette.background.paper,
  transition: "all 0.3s ease-in-out",
}));

const CircularTimer = styled(Box)(({ theme, progress, status }) => ({
  position: "relative",
  display: "inline-flex",
  "& .MuiCircularProgress-root": {
    color:
      status === "danger"
        ? theme.palette.error.main
        : status === "warning"
        ? theme.palette.warning.main
        : theme.palette.primary.main,
  },
}));

const QuizTimer = ({
  totalTimeMinutes = 30,
  onTimeUp,
  onWarning,
  isActive = false,
  isPaused = false,
  warningThreshold = 5, // minutes
  dangerThreshold = 2, // minutes
  showCircular = false,
  size = "medium",
}) => {
  const [timeLeft, setTimeLeft] = useState(totalTimeMinutes * 60); // Convert to seconds
  const [status, setStatus] = useState("normal"); // normal, warning, danger, expired
  const [hasWarned, setHasWarned] = useState(false);

  const totalSeconds = totalTimeMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const timeLeftProgress = (timeLeft / totalSeconds) * 100;

  // Format time to MM:SS or HH:MM:SS
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Get time status based on remaining time
  const getTimeStatus = useCallback(
    (seconds) => {
      const minutes = seconds / 60;
      if (seconds <= 0) return "expired";
      if (minutes <= dangerThreshold) return "danger";
      if (minutes <= warningThreshold) return "warning";
      return "normal";
    },
    [dangerThreshold, warningThreshold]
  );

  // Get display color based on status
  const getDisplayColor = (status) => {
    switch (status) {
      case "expired":
        return "error";
      case "danger":
        return "error";
      case "warning":
        return "warning";
      default:
        return "primary";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "expired":
      case "danger":
        return <ErrorIcon />;
      case "warning":
        return <WarningIcon />;
      default:
        return <TimeIcon />;
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isActive || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(0, prevTime - 1);
        const newStatus = getTimeStatus(newTime);

        setStatus(newStatus);

        // Trigger warning callback
        if (newStatus === "warning" && !hasWarned && onWarning) {
          setHasWarned(true);
          onWarning(newTime);
        }

        // Trigger time up callback
        if (newTime === 0 && onTimeUp) {
          onTimeUp();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isActive,
    isPaused,
    hasWarned,
    onTimeUp,
    onWarning,
    getTimeStatus,
  ]);

  // Reset warning flag when time is not in warning range
  useEffect(() => {
    if (status === "normal" && hasWarned) {
      setHasWarned(false);
    }
  }, [status, hasWarned]);

  const renderLinearTimer = () => (
    <TimerContainer elevation={2} status={status}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            {getStatusIcon(status)}
            <Typography variant="h6" color={getDisplayColor(status)}>
              {formatTime(timeLeft)}
            </Typography>
          </Stack>

          <Chip
            label={
              status === "expired"
                ? "Time's Up!"
                : status === "danger"
                ? "Hurry Up!"
                : status === "warning"
                ? "Time Running Low"
                : "Quiz Timer"
            }
            color={getDisplayColor(status)}
            size="small"
            variant={status === "normal" ? "outlined" : "filled"}
          />
        </Stack>

        {/* Progress Bar */}
        <Box>
          <LinearProgress
            variant="determinate"
            value={timeLeftProgress}
            color={getDisplayColor(status)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.grey[200]
                  : theme.palette.grey[800],
            }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(totalSeconds - timeLeft)} elapsed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(timeLeft)} remaining
            </Typography>
          </Stack>
        </Box>

        {/* Status Messages */}
        {status === "expired" && (
          <Alert severity="error" variant="filled">
            Time is up! Please submit your quiz immediately.
          </Alert>
        )}
        {status === "danger" && (
          <Alert severity="error">
            Only {Math.ceil(timeLeft / 60)} minutes remaining!
          </Alert>
        )}
        {status === "warning" && (
          <Alert severity="warning">
            {Math.ceil(timeLeft / 60)} minutes left. Consider
            reviewing your answers.
          </Alert>
        )}
      </Stack>
    </TimerContainer>
  );

  const renderCircularTimer = () => (
    <CircularTimer progress={progress} status={status}>
      <CircularProgress
        variant="determinate"
        value={timeLeftProgress}
        size={size === "small" ? 60 : size === "large" ? 120 : 80}
        thickness={4}
        color={getDisplayColor(status)}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {getStatusIcon(status)}
        <Typography
          variant={size === "small" ? "caption" : "body2"}
          component="div"
          color={getDisplayColor(status)}
          fontWeight="bold">
          {formatTime(timeLeft)}
        </Typography>
      </Box>
    </CircularTimer>
  );

  const renderCompactTimer = () => (
    <Chip
      icon={getStatusIcon(status)}
      label={formatTime(timeLeft)}
      color={getDisplayColor(status)}
      variant={status === "normal" ? "outlined" : "filled"}
      size={size}
    />
  );

  // Don't render if not active
  if (!isActive) return null;

  // Render based on props
  if (showCircular) {
    return renderCircularTimer();
  }

  if (size === "compact") {
    return renderCompactTimer();
  }

  return renderLinearTimer();
};

export default QuizTimer;

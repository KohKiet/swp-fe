import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Collapse,
  Button,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

const ApiStatusSummary = () => {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState({
    progressApi: "unknown",
    courseApi: "unknown",
    chaptersApi: "unknown",
  });

  useEffect(() => {
    // Check localStorage for Progress API setting
    const progressDisabled =
      localStorage.getItem("disableProgressApi") === "true";
    setStatus((prev) => ({
      ...prev,
      progressApi: progressDisabled ? "disabled" : "unknown",
    }));
  }, []);

  // Only show in development mode and when explicitly enabled
  const showDebugTools =
    process.env.NODE_ENV === "development" &&
    (process.env.REACT_APP_SHOW_DEBUG_TOOLS === "true" ||
      localStorage.getItem("showDebugTools") === "true");

  if (!showDebugTools) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "working":
        return "success";
      case "error":
        return "error";
      case "disabled":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "working":
        return <CheckIcon />;
      case "error":
        return <ErrorIcon />;
      case "disabled":
        return <WarningIcon />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "working":
        return "Working";
      case "error":
        return "Error";
      case "disabled":
        return "Disabled";
      default:
        return "Unknown";
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        border: 1,
        borderColor: "grey.300",
        borderRadius: 1,
      }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <Typography variant="h6">API Status Summary</Typography>
        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={
            expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
          }>
          {expanded ? "Hide" : "Show"} Details
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
        <Chip
          icon={getStatusIcon(status.progressApi)}
          label={`Progress API: ${getStatusText(status.progressApi)}`}
          color={getStatusColor(status.progressApi)}
          size="small"
        />
        <Chip
          icon={getStatusIcon(status.courseApi)}
          label={`Course API: ${getStatusText(status.courseApi)}`}
          color={getStatusColor(status.courseApi)}
          size="small"
        />
        <Chip
          icon={getStatusIcon(status.chaptersApi)}
          label={`Chapters API: ${getStatusText(status.chaptersApi)}`}
          color={getStatusColor(status.chaptersApi)}
          size="small"
        />
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {status.progressApi === "disabled" && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Progress API is disabled to prevent 500 errors. Enable
              it in settings when backend is fixed.
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            • Progress API: Used for tracking course completion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Course API: Used for loading course details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Chapters API: Used for loading course chapters and
            lessons
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ApiStatusSummary;

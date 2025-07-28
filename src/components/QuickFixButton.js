import React from "react";
import { Box, Button, Alert, Typography } from "@mui/material";
import {
  Block as BlockIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

const QuickFixButton = () => {
  // Only show in development mode and when explicitly enabled
  const showDebugTools =
    process.env.NODE_ENV === "development" &&
    (process.env.REACT_APP_SHOW_DEBUG_TOOLS === "true" ||
      localStorage.getItem("showDebugTools") === "true");

  if (!showDebugTools) {
    return null;
  }

  const isDisabled =
    localStorage.getItem("disableProgressApi") === "true";

  const disableProgressApi = () => {
    localStorage.setItem("disableProgressApi", "true");
    window.location.reload();
  };

  const enableProgressApi = () => {
    localStorage.removeItem("disableProgressApi");
    window.location.reload();
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: 1,
        borderColor: "red.300",
        borderRadius: 1,
        bgcolor: "red.50",
      }}>
      <Typography variant="h6" color="error" gutterBottom>
        🚨 Quick Fix for 500 Errors
      </Typography>

      {isDisabled ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Progress API is disabled. 500 errors should be fixed.
          </Typography>
        </Alert>
      ) : (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Progress API is causing 500 errors. Click below to disable
            it.
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        {!isDisabled ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
            onClick={disableProgressApi}>
            Disable Progress API (Fix 500 Errors)
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="success"
            startIcon={<CheckIcon />}
            onClick={enableProgressApi}>
            Re-enable Progress API
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuickFixButton;

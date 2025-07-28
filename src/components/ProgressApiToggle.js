import React, { useState } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Button,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const ProgressApiToggle = () => {
  const [disableProgressApi, setDisableProgressApi] = useState(
    localStorage.getItem("disableProgressApi") === "true"
  );

  // Only show in development mode and when explicitly enabled
  const showDebugTools =
    process.env.NODE_ENV === "development" &&
    (process.env.REACT_APP_SHOW_DEBUG_TOOLS === "true" ||
      localStorage.getItem("showDebugTools") === "true");

  if (!showDebugTools) {
    return null;
  }

  const handleToggle = (event) => {
    const newValue = event.target.checked;
    setDisableProgressApi(newValue);
    localStorage.setItem("disableProgressApi", newValue.toString());

    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const clearSettings = () => {
    localStorage.removeItem("disableProgressApi");
    setDisableProgressApi(false);
    window.location.reload();
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: 1,
        borderColor: "grey.300",
        borderRadius: 1,
      }}>
      <Typography variant="h6" gutterBottom>
        <SettingsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        API Settings
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={disableProgressApi}
            onChange={handleToggle}
            color="warning"
          />
        }
        label="Disable Progress API (fixes 500 errors)"
      />

      {disableProgressApi && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Progress API calls are disabled. This will prevent 500
            errors but may affect some features.
          </Typography>
        </Alert>
      )}

      <Button
        size="small"
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={clearSettings}
        sx={{ mt: 1 }}>
        Reset Settings
      </Button>
    </Box>
  );
};

export default ProgressApiToggle;

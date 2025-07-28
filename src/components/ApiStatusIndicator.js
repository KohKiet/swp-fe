import React, { useState, useEffect } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const ApiStatusIndicator = ({
  isOnline = true,
  isUsingMockData = false,
  onRetry = null,
  showDetails = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!isOnline || isUsingMockData) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert
          severity={isUsingMockData ? "warning" : "error"}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              {onRetry && (
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={onRetry}>
                  <RefreshIcon />
                </IconButton>
              )}
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setExpanded(!expanded)}>
                {expanded ? <CloseIcon /> : <WarningIcon />}
              </IconButton>
            </Box>
          }>
          <AlertTitle>
            {isUsingMockData ? "Demo Mode" : "Connection Error"}
          </AlertTitle>
          {isUsingMockData
            ? "Backend API is unavailable. Showing demo data."
            : "Cannot connect to server. Please check your internet connection."}

          <Collapse in={expanded}>
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ mr: 1 }}>
                Refresh Page
              </Button>
              {onRetry && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onRetry}>
                  Retry Connection
                </Button>
              )}
            </Box>
          </Collapse>
        </Alert>
      </Box>
    );
  }

  if (showDetails) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert
          severity="success"
          icon={<CheckIcon />}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setExpanded(!expanded)}>
              {expanded ? <CloseIcon /> : <CheckIcon />}
            </IconButton>
          }>
          <AlertTitle>Connected</AlertTitle>
          Backend API is working properly.
          <Collapse in={expanded}>
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </Box>
          </Collapse>
        </Alert>
      </Box>
    );
  }

  return null;
};

export default ApiStatusIndicator;

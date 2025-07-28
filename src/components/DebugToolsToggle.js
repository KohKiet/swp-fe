import React, { useState } from "react";
import { Box, Button, Typography, Alert } from "@mui/material";
import {
  BugReport as DebugIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
} from "@mui/icons-material";

const DebugToolsToggle = () => {
  const [showDebugTools, setShowDebugTools] = useState(
    localStorage.getItem("showDebugTools") === "true"
  );

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const toggleDebugTools = () => {
    const newValue = !showDebugTools;
    setShowDebugTools(newValue);
    localStorage.setItem("showDebugTools", newValue.toString());
    window.location.reload();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
        // bgcolor: "background.paper",
        // border: 1,
        // borderColor: "grey.300",
        // borderRadius: 2,
        // p: 1,
        // boxShadow: 3,
      }}>
      {/* <Button
        variant="outlined"
        size="small"
        startIcon={showDebugTools ? <HideIcon /> : <ShowIcon />}
        onClick={toggleDebugTools}
        sx={{ minWidth: "auto", px: 2 }}>
        {showDebugTools ? "Hide" : "Show"} Debug
      </Button> */}
    </Box>
  );
};

export default DebugToolsToggle;

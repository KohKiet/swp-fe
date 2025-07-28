import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  BugReport as DebugIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import courseService from "../services/courseService";

const ApiTestButton = ({ courseId }) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  // Only show in development mode and when explicitly enabled
  const showDebugTools =
    process.env.NODE_ENV === "development" &&
    (process.env.REACT_APP_SHOW_DEBUG_TOOLS === "true" ||
      localStorage.getItem("showDebugTools") === "true");

  if (!showDebugTools) {
    return null;
  }

  const testApi = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log("🧪 Testing API endpoints...");

      // Test 1: Course API
      console.log("1. Testing course API...");
      const courseResult = await courseService.getPublicCourseById(
        courseId
      );
      console.log("Course API result:", courseResult);

      // Test 2: Chapters API
      console.log("2. Testing chapters API...");
      const chaptersResult = await courseService.getChaptersByCourse(
        courseId
      );
      console.log("Chapters API result:", chaptersResult);

      // Test 3: Progress API
      console.log("3. Testing progress API...");
      const progressResult = await courseService.getMyProgress();
      console.log("Progress API result:", progressResult);

      setResults({
        course: courseResult,
        chapters: chaptersResult,
        progress: progressResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ API test failed:", error);
      setResults({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
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
        <DebugIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        API Debug Tool
      </Typography>

      <Button
        variant="outlined"
        startIcon={
          testing ? <CircularProgress size={16} /> : <RefreshIcon />
        }
        onClick={testApi}
        disabled={testing}
        sx={{ mb: 2 }}>
        {testing ? "Testing..." : "Test API Endpoints"}
      </Button>

      {results && (
        <Box>
          {results.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Test Failed</Typography>
              <Typography variant="body2">{results.error}</Typography>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                Test Results
              </Typography>
              <Typography variant="body2">
                Course: {results.course?.success ? "✅" : "❌"}{" "}
                {results.course?.id || "N/A"}
              </Typography>
              <Typography variant="body2">
                Chapters:{" "}
                {Array.isArray(results.chapters)
                  ? `✅ ${results.chapters.length} chapters`
                  : "❌"}
              </Typography>
              <Typography variant="body2">
                Progress: {results.progress?.success ? "✅" : "❌"}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 1 }}>
                Tested at: {results.timestamp}
              </Typography>
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ApiTestButton;

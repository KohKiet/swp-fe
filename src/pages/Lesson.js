import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseService from "../services/courseService";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";

const Lesson = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizId, setQuizId] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [lastQuizResult, setLastQuizResult] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await courseService.getLessonById(lessonId);
        if (res.success && res.data) {
          setLesson(res.data);
          // Luôn gọi API lấy quiz theo lessonId
          const quizRes = await courseService.getQuizzesByLesson(
            lessonId
          );
          if (
            quizRes.success &&
            Array.isArray(quizRes.data) &&
            quizRes.data.length > 0
          ) {
            setQuizId(quizRes.data[0].id);
            return quizRes.data[0].id;
          } else {
            setQuizId(null);
          }
        } else {
          setError(res.message || "Không tìm thấy bài học");
        }
      } catch (err) {
        setError("Lỗi khi tải bài học");
      } finally {
        setLoading(false);
      }
    };
    const handleQuizResults = async (quizId) => {
    try {
      const results = await courseService.getQuizResultsByUserQuiz(
        quizId
      );  
      if (results && results.length > 0) {
        setQuizResults(results);
        getLastQuizResult(results);
        return results;
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    }
  };
  const getLastQuizResult = (quizResults) => {
    if (quizResults.length === 0) return null;
    const sortedResults = quizResults.sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
    );
    setLastQuizResult(sortedResults[0]);
    return sortedResults[0];
  };
    fetchLesson().then((quizId) => {
      return handleQuizResults(quizId)
    });
  }, [lessonId]);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  if (error)
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  if (!lesson) return null;

  const handleNext = () => {
    if (quizId) {
      navigate(`/quiz/${quizId}`);
    } else if (lesson.nextLessonId) {
      navigate(`/lesson/${lesson.nextLessonId}`);
    }
  };

  return (
    <Box maxWidth="md" mx="auto" p={4}>
      <Typography variant="h4" fontWeight={600} mb={2}>
        {lesson.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        {lesson.description}
      </Typography>
      {lesson.videoUrl && (
        <Box mb={3}>
          <video
            width="100%"
            height="400"
            controls
            poster={lesson.imageUrl}>
            <source src={lesson.videoUrl} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </Box>
      )}
      <Typography variant="body1" mb={3}>
        {lesson.content}
      </Typography>
      
      {/* Quiz Section */}
      {quizId && (
        <Box mb={3} p={3} bgcolor="background.paper" borderRadius={2} border="1px solid" borderColor="divider">
          <Typography variant="h6" mb={2}>Quiz</Typography>
          {(() => {
            if (lastQuizResult) {
              return (
                <Box>
                  <Typography variant="subtitle1" color="text.primary" mb={2}>
                    Kết quả Quiz gần nhất:
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Điểm số:</Typography>
                      <Typography variant="body1" fontWeight={600} color={lastQuizResult.isPassed ? "success.main" : "error.main"}>
                        {lastQuizResult.score.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Trạng thái:</Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={600}
                        color={lastQuizResult.isPassed ? "success.main" : "error.main"}
                      >
                        {lastQuizResult.isPassed ? "Đạt" : "Không đạt"}
                      </Typography>
                    </Box>
                    {lastQuizResult.notes && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ghi chú:</Typography>
                        <Typography variant="body1">{lastQuizResult.notes}</Typography>
                      </Box>
                    )}
                  </Stack>
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleNext}
                      size="small"
                    >
                      Làm lại Quiz
                    </Button>
                  </Box>
                </Box>
              );
            } else {
              return (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Bạn chưa thực hiện quiz này.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    Làm Quiz
                  </Button>
                </Box>
              );
            }
          })()}
        </Box>
      )}
      
      <Stack direction="row" spacing={2}>
        {!quizId && lesson.nextLessonId && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}>
            Tiếp theo
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default Lesson;

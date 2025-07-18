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
    fetchLesson();
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
      <Stack direction="row" spacing={2}>
        {quizId && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}>
            Làm Quiz
          </Button>
        )}
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

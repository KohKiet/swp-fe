import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Stack,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
  Fab,
  Tooltip,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Timer,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Visibility as EyeIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncompletedIcon,
  Quiz as QuizIcon,
  MenuBook as BookIcon,
  Star as StarIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Home as HomeIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import courseService from "../services/courseService";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
  formatDuration,
  calculateCourseProgress,
} from "../models/courseModels";
import QuizTimer from "./QuizTimer";

// Styled components
const StyledHeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: "white",
  padding: theme.spacing(4, 0),
  position: "relative",
  overflow: "hidden",
}));

const CourseImageCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  boxShadow: theme.shadows[8],
}));

const ChapterAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: `${theme.spacing(1)} 0`,
  },
}));

const LessonListItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 0),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

const QuizCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${theme.palette.secondary.main}`,
}));

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // States
  const [course, setCourse] = useState({});
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({}); // Track lesson completion
  const [quizProgress, setQuizProgress] = useState({}); // Track quiz completion
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [mediaError, setMediaError] = useState(null);

  // Track enrollment and completion status
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    isEnrolled: false,
    isCompleted: false,
    progress: 0,
  });

  // UI state
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [showQuizDialog, setShowQuizDialog] = useState(false);

  // Progress tracking
  const [progress, setProgress] = useState({});

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // Add timer state for quiz
  const [quizTimerActive, setQuizTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load course data on mount
  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
      checkEnrollmentStatus();
    }
  }, [courseId]);

  // Load progress if enrolled
  useEffect(() => {
    if (isEnrolled && course) {
      loadCourseProgress();
    }
  }, [isEnrolled, course]);

  // Quiz timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && quizTimeLeft > 0 && !quizSubmitted) {
      timer = setTimeout(() => {
        setQuizTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (quizTimeLeft === 0 && quizStarted && !quizSubmitted) {
      handleQuizSubmit(); // Auto-submit when time is up
    }
    return () => clearTimeout(timer);
  }, [quizStarted, quizTimeLeft, quizSubmitted]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await courseService.getPublicCourseById(
        courseId
      );

      if (response?.success && response.data) {
        const courseData = response.data;
        setCourse(courseData);

        // Load chapters for the course
        if (courseData.chapters && courseData.chapters.length > 0) {
          // Automatically expand first chapter and select first lesson
          const firstChapter = courseData.chapters[0];
          setExpandedChapters(new Set([firstChapter.chapterId]));
          setCurrentChapter(firstChapter);

          if (
            firstChapter.lessons &&
            firstChapter.lessons.length > 0
          ) {
            setCurrentLesson(firstChapter.lessons[0]);
          }
        }

        // Calculate overall progress
        const overallProgress = calculateCourseProgress(
          courseData.chapters || []
        );
        setCourseProgress(overallProgress);
      } else {
        setError(response?.message || "Course not found");
      }
    } catch (err) {
      console.error("Error loading course details:", err);
      setError(
        "Failed to load course details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      if (!courseId) {
        setIsEnrolled(false);
        setEnrollmentStatus({
          isEnrolled: false,
          isCompleted: false,
          progress: 0,
        });
        return;
      }

      // Check enrollment status
      try {
        const response = await courseService.isEnrolled(courseId);
        const enrolled = response === true || response.data === true;
        setIsEnrolled(enrolled);

        if (enrolled) {
          // If enrolled, check progress and completion status
          await checkCourseCompletion();
        } else {
          setEnrollmentStatus({
            isEnrolled: false,
            isCompleted: false,
            progress: 0,
          });
        }
      } catch (enrollmentError) {
        // Handle 404 - user not enrolled
        if (enrollmentError.message?.includes("404")) {
          setIsEnrolled(false);
          setEnrollmentStatus({
            isEnrolled: false,
            isCompleted: false,
            progress: 0,
          });
        } else {
          console.error(
            "Error checking enrollment status:",
            enrollmentError
          );
          setIsEnrolled(false);
          setEnrollmentStatus({
            isEnrolled: false,
            isCompleted: false,
            progress: 0,
          });
        }
      }
    } catch (err) {
      console.error("Error checking enrollment status:", err);
      setIsEnrolled(false);
      setEnrollmentStatus({
        isEnrolled: false,
        isCompleted: false,
        progress: 0,
      });
    }
  };

  const checkCourseCompletion = async () => {
    try {
      const response = await courseService.getCourseProgress(
        courseId
      );
      if (response?.success && response.data) {
        const progressData = response.data;

        // Calculate completion percentage based on your backend's progress structure
        let completionPercentage = 0;
        let isCompleted = false;

        if (progressData.completionPercentage !== undefined) {
          completionPercentage = progressData.completionPercentage;
          isCompleted = completionPercentage >= 100;
        } else if (progressData.progress !== undefined) {
          completionPercentage = progressData.progress;
          isCompleted = completionPercentage >= 100;
        } else {
          // Fallback: calculate based on completed lessons/quizzes
          const totalLessons =
            course.chapters?.reduce(
              (total, chapter) =>
                total + (chapter.lessons?.length || 0),
              0
            ) || 0;
          const completedLessons =
            Object.values(lessonProgress).filter(Boolean).length;
          completionPercentage =
            totalLessons > 0
              ? (completedLessons / totalLessons) * 100
              : 0;
          isCompleted = completionPercentage >= 100;
        }

        setCourseProgress(completionPercentage);
        setIsCourseCompleted(isCompleted);
        setEnrollmentStatus({
          isEnrolled: true,
          isCompleted: isCompleted,
          progress: completionPercentage,
        });
      } else {
        // No progress data yet
        setEnrollmentStatus({
          isEnrolled: true,
          isCompleted: false,
          progress: 0,
        });
      }
    } catch (err) {
      console.error("Error checking course completion:", err);
      // Assume not completed if we can't get progress
      setEnrollmentStatus({
        isEnrolled: true,
        isCompleted: false,
        progress: 0,
      });
    }
  };

  const loadCourseProgress = async () => {
    try {
      const response = await courseService.getCourseProgress(
        courseId
      );
      if (response?.success && response.data) {
        const progressData = response.data;
        const progressMap = {};

        if (Array.isArray(progressData)) {
          progressData.forEach((item) => {
            if (item.lessonId) {
              progressMap[item.lessonId] = item.isCompleted;
            }
            if (item.quizId) {
              setQuizProgress((prev) => ({
                ...prev,
                [item.quizId]: item.isCompleted,
              }));
            }
          });
        }

        setLessonProgress(progressMap);

        // Update enrollment status with progress info
        if (isEnrolled) {
          await checkCourseCompletion();
        }
      }
    } catch (err) {
      console.error("Error loading course progress:", err);
    }
  };

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp > currentTime;
    } catch {
      return false;
    }
  };

  const handleEnrollment = async () => {
    try {
      setEnrollmentLoading(true);
      setError(null);

      if (isEnrolled) {
        // Drop from course
        await courseService.dropFromCourse(courseId);
        setIsEnrolled(false);
        setEnrollmentStatus({
          isEnrolled: false,
          isCompleted: false,
          progress: 0,
        });
      } else {
        // Enroll in course
        try {
          await courseService.enrollInCourse(courseId);
          setIsEnrolled(true);
          await checkCourseCompletion(); // Load progress after enrollment
        } catch (enrollError) {
          // Handle "already enrolled" error
          if (enrollError.message?.includes("already enrolled")) {
            setIsEnrolled(true);
            await checkCourseCompletion();
            // Don't show error if user is already enrolled - just proceed
          } else {
            throw enrollError; // Re-throw other errors
          }
        }
      }
    } catch (err) {
      console.error("Error with enrollment:", err);
      if (err.message && err.message.includes("401")) {
        localStorage.removeItem("accessToken");
        navigate("/login", {
          state: { returnUrl: `/education/courses/${courseId}` },
        });
      } else {
        setError("Failed to update enrollment. Please try again.");
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleChapterToggle = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleLessonSelect = (chapter, lesson) => {
    setCurrentChapter(chapter);
    setCurrentLesson(lesson);
    setCurrentQuiz(null);

    // Mark lesson as viewed
    if (isEnrolled) {
      markLessonProgress(lesson.lessonId);
    }
  };

  const handleQuizSelect = async (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);

    // Load quiz questions
    try {
      const response = await courseService.getQuestionsByQuiz(
        quiz.quizId
      );
      if (response?.success && response.data) {
        setQuizQuestions(response.data);
        setQuizTimeLeft(quiz.timeLimitMinutes * 60); // Convert to seconds
        setShowQuizDialog(true);
        setQuizAnswers({});
        setQuizStarted(false);
        setQuizSubmitted(false);
        setQuizResults(null);
      }
    } catch (err) {
      console.error("Error loading quiz questions:", err);
      setError("Failed to load quiz. Please try again.");
    }
  };

  const markLessonProgress = async (lessonId) => {
    try {
      await courseService.createOrUpdateProgress({
        courseId,
        lessonId,
        percent: 100,
        isCompleted: true,
      });

      // Update local progress
      setProgress((prev) => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          isCompleted: true,
          percent: 100,
        },
      }));

      // Recalculate course progress
      loadCourseProgress();
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const markLessonCompleted = async (lessonId) => {
    try {
      setLessonProgress((prev) => ({
        ...prev,
        [lessonId]: true,
      }));

      // Update progress on server
      await courseService.completeLessonProgress({
        lessonId: lessonId,
        courseId: courseId,
        isCompleted: true,
      });

      // Check if course is now completed
      if (isEnrolled) {
        await checkCourseCompletion();
      }
    } catch (err) {
      console.error("Error marking lesson completed:", err);
    }
  };

  const handleQuizStart = () => {
    setQuizStarted(true);
    setQuizTimerActive(true);
    if (currentQuiz?.timeLimitMinutes) {
      setQuizTimeLeft(currentQuiz.timeLimitMinutes * 60);
    }
  };

  const handleQuizTimeUp = () => {
    // Auto-submit quiz when time is up
    handleQuizSubmit();
    setQuizTimerActive(false);
  };

  const handleQuizWarning = (timeLeft) => {
    // Optional: Show warning notification
    console.log(
      `Quiz warning: ${Math.ceil(timeLeft / 60)} minutes remaining`
    );
  };

  const handleQuizAnswerChange = (questionId, answerId) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleQuizSubmit = async () => {
    try {
      setSubmitting(true);
      setQuizTimerActive(false); // Stop timer when submitting

      // Prepare answers for submission
      const submissionData = {
        quizId: currentQuiz.quizId,
        answers: Object.entries(quizAnswers).map(
          ([questionId, answerId]) => ({
            questionId,
            selectedAnswerId: answerId,
          })
        ),
      };

      const response = await courseService.submitQuizAnswers(
        submissionData
      );

      if (response?.success) {
        setQuizResults(response.data);

        // Update progress if quiz passed
        if (response.data.passed) {
          setQuizProgress((prev) => ({
            ...prev,
            [currentQuiz.quizId]: true,
          }));

          // Check if course is now completed
          if (isEnrolled) {
            await checkCourseCompletion();
          }
        }
      } else {
        setError("Failed to submit quiz. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getNextLesson = () => {
    if (!course?.chapters || !currentChapter || !currentLesson)
      return null;

    const currentChapterIndex = course.chapters.findIndex(
      (ch) => ch.chapterId === currentChapter.chapterId
    );
    const currentLessonIndex = currentChapter.lessons.findIndex(
      (l) => l.lessonId === currentLesson.lessonId
    );

    // Try next lesson in current chapter
    if (currentLessonIndex < currentChapter.lessons.length - 1) {
      return {
        chapter: currentChapter,
        lesson: currentChapter.lessons[currentLessonIndex + 1],
      };
    }

    // Try first lesson of next chapter
    if (currentChapterIndex < course.chapters.length - 1) {
      const nextChapter = course.chapters[currentChapterIndex + 1];
      if (nextChapter.lessons && nextChapter.lessons.length > 0) {
        return {
          chapter: nextChapter,
          lesson: nextChapter.lessons[0],
        };
      }
    }

    return null;
  };

  const getPreviousLesson = () => {
    if (!course?.chapters || !currentChapter || !currentLesson)
      return null;

    const currentChapterIndex = course.chapters.findIndex(
      (ch) => ch.chapterId === currentChapter.chapterId
    );
    const currentLessonIndex = currentChapter.lessons.findIndex(
      (l) => l.lessonId === currentLesson.lessonId
    );

    // Try previous lesson in current chapter
    if (currentLessonIndex > 0) {
      return {
        chapter: currentChapter,
        lesson: currentChapter.lessons[currentLessonIndex - 1],
      };
    }

    // Try last lesson of previous chapter
    if (currentChapterIndex > 0) {
      const prevChapter = course.chapters[currentChapterIndex - 1];
      if (prevChapter.lessons && prevChapter.lessons.length > 0) {
        return {
          chapter: prevChapter,
          lesson: prevChapter.lessons[prevChapter.lessons.length - 1],
        };
      }
    }

    return null;
  };

  const navigateToLesson = (direction) => {
    const target =
      direction === "next" ? getNextLesson() : getPreviousLesson();
    if (target) {
      handleLessonSelect(target.chapter, target.lesson);
      // Expand the target chapter if it's not expanded
      if (!expandedChapters.has(target.chapter.chapterId)) {
        setExpandedChapters(
          (prev) => new Set([...prev, target.chapter.chapterId])
        );
      }
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress[lessonId]?.isCompleted || false;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          onClick={() => navigate("/education")}
          startIcon={<HomeIcon />}>
          Back to Education Hub
        </Button>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Compact Hero Section */}
      <StyledHeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Breadcrumbs
                separator={<NavigateNextIcon />}
                sx={{ mb: 2, color: "rgba(255,255,255,0.8)" }}>
                <MuiLink
                  color="inherit"
                  onClick={() => navigate("/")}
                  sx={{ cursor: "pointer" }}>
                  Home
                </MuiLink>
                <MuiLink
                  color="inherit"
                  onClick={() => navigate("/education")}
                  sx={{ cursor: "pointer" }}>
                  Education Hub
                </MuiLink>
                <Typography color="white">{course.title}</Typography>
              </Breadcrumbs>

              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 600 }}>
                {course.title}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                sx={{ mb: 2 }}>
                <Chip
                  icon={<SchoolIcon />}
                  label={getCourseTypeLabel(course.courseType)}
                  color="primary"
                  variant="filled"
                />
                <Chip
                  icon={<GroupIcon />}
                  label={getAgeGroupLabel(course.ageGroup)}
                  color="secondary"
                  variant="filled"
                />
              </Stack>

              {isEnrolled && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Progress: {courseProgress.toFixed(0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={courseProgress}
                    sx={{
                      flexGrow: 1,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "rgba(255,255,255,0.3)",
                    }}
                  />
                </Stack>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              {!isEnrolled && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleEnrollment}
                  disabled={enrollmentLoading}
                  startIcon={
                    enrollmentLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <PlayIcon />
                    )
                  }
                  sx={{
                    backgroundColor: "white",
                    color: "primary.main",
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  }}>
                  Enroll Now
                </Button>
              )}
            </Grid>
          </Grid>
        </Container>
      </StyledHeroSection>

      {error && (
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        </Container>
      )}

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Main Content Area */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {currentLesson && (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  {/* Lesson Header */}
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center">
                      <Box>
                        <Typography
                          variant="h5"
                          gutterBottom
                          sx={{ fontWeight: 600 }}>
                          {currentLesson.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary">
                          Chapter {currentChapter?.chapterOrder}:{" "}
                          {currentChapter?.title}
                        </Typography>
                      </Box>
                      <Box>
                        {isLessonCompleted(
                          currentLesson.lessonId
                        ) && (
                          <CheckCircleIcon
                            color="success"
                            sx={{ fontSize: 32 }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </Box>

                  {/* Lesson Content */}
                  <Box sx={{ p: 3 }}>
                    {currentLesson.videoUrl && (
                      <Box
                        sx={{
                          mb: 3,
                          borderRadius: 2,
                          overflow: "hidden",
                        }}>
                        <video
                          width="100%"
                          height="400"
                          controls
                          poster={course.imageUrl}>
                          <source
                            src={currentLesson.videoUrl}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </Box>
                    )}

                    <Typography
                      variant="body1"
                      sx={{ lineHeight: 1.8, mb: 3 }}>
                      {currentLesson.content ||
                        currentLesson.description}
                    </Typography>

                    {/* Lesson Navigation */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mt: 4 }}>
                      <Button
                        variant="outlined"
                        startIcon={<NavigateBeforeIcon />}
                        onClick={() => navigateToLesson("previous")}
                        disabled={!getPreviousLesson()}>
                        Previous
                      </Button>

                      <Button
                        variant="contained"
                        endIcon={<NavigateNextIcon />}
                        onClick={() => navigateToLesson("next")}
                        disabled={!getNextLesson()}>
                        Next Lesson
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            )}

            {!currentLesson && !currentQuiz && (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <SchoolIcon
                  sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom>
                  Welcome to {course.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}>
                  {enrollmentStatus.isCompleted
                    ? "Congratulations! You have completed this course."
                    : isEnrolled
                    ? "Select a lesson from the course content to continue learning"
                    : "Select a lesson from the course content to start learning"}
                </Typography>

                {/* Progress bar for enrolled users */}
                {isEnrolled && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}>
                      Course Progress:{" "}
                      {Math.round(enrollmentStatus.progress)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={enrollmentStatus.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}

                {/* Enrollment/Status Button */}
                {!isEnrolled ? (
                  <Button
                    variant="contained"
                    onClick={handleEnrollment}
                    disabled={enrollmentLoading}
                    startIcon={<PlayIcon />}>
                    {enrollmentLoading
                      ? "Enrolling..."
                      : "Enroll to Start Learning"}
                  </Button>
                ) : enrollmentStatus.isCompleted ? (
                  <Button
                    variant="contained"
                    color="success"
                    disabled
                    startIcon={<CheckCircleIcon />}>
                    Đã hoàn thành
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      // Navigate to first incomplete lesson or first lesson
                      const firstChapter = course.chapters?.[0];
                      const firstLesson = firstChapter?.lessons?.[0];
                      if (firstLesson) {
                        setCurrentLesson(firstLesson);
                        setCurrentQuiz(null);
                      }
                    }}
                    startIcon={<PlayIcon />}>
                    Tiếp tục học
                  </Button>
                )}
              </Card>
            )}
          </Grid>

          {/* Course Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600 }}>
                Course Content
              </Typography>

              {course.chapters?.map((chapter) => (
                <ChapterAccordion
                  key={chapter.chapterId}
                  expanded={expandedChapters.has(chapter.chapterId)}
                  onChange={() =>
                    handleChapterToggle(chapter.chapterId)
                  }>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ width: "100%" }}>
                      <BookIcon color="primary" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}>
                          Chapter {chapter.chapterOrder}:{" "}
                          {chapter.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary">
                          {chapter.lessons?.length || 0} lessons
                          {chapter.quizzes?.length > 0 &&
                            ` • ${chapter.quizzes.length} quiz(es)`}
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 0 }}>
                    <List>
                      {chapter.lessons?.map((lesson) => (
                        <LessonListItem
                          key={lesson.lessonId}
                          selected={
                            currentLesson?.lessonId ===
                            lesson.lessonId
                          }
                          onClick={() =>
                            handleLessonSelect(chapter, lesson)
                          }
                          disabled={!isEnrolled}>
                          <ListItemIcon>
                            {isLessonCompleted(lesson.lessonId) ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <UncompletedIcon color="action" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={lesson.title}
                            secondary={
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center">
                                <TimeIcon fontSize="small" />
                                <Typography variant="caption">
                                  {formatDuration(
                                    lesson.estimatedDuration || 10
                                  )}
                                </Typography>
                              </Stack>
                            }
                          />
                        </LessonListItem>
                      ))}

                      {/* Chapter Quizzes */}
                      {chapter.quizzes?.map((quiz) => (
                        <LessonListItem
                          key={quiz.quizId}
                          onClick={() => handleQuizSelect(quiz)}
                          disabled={!isEnrolled}>
                          <ListItemIcon>
                            <QuizIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={quiz.title}
                            secondary={
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center">
                                <TimerIcon fontSize="small" />
                                <Typography variant="caption">
                                  {quiz.timeLimitMinutes} minutes •{" "}
                                  {quiz.passingScore}% to pass
                                </Typography>
                              </Stack>
                            }
                          />
                        </LessonListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </ChapterAccordion>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Enhanced Quiz Dialog */}
      <Dialog
        open={showQuizDialog}
        onClose={() => {
          if (!quizStarted) {
            setShowQuizDialog(false);
            setQuizTimerActive(false);
          }
        }}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={quizStarted}>
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between">
            <Typography variant="h6">{currentQuiz?.title}</Typography>
            {quizStarted && currentQuiz?.timeLimitMinutes && (
              <QuizTimer
                totalTimeMinutes={currentQuiz.timeLimitMinutes}
                onTimeUp={handleQuizTimeUp}
                onWarning={handleQuizWarning}
                isActive={quizTimerActive}
                isPaused={submitting}
                showCircular={true}
                size="small"
              />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent>
          {!quizStarted ? (
            // Quiz Instructions
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ready to Start Quiz?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {currentQuiz?.description}
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {quizQuestions.length}
                    </Typography>
                    <Typography variant="caption">
                      Questions
                    </Typography>
                  </Box>
                  {currentQuiz?.timeLimitMinutes && (
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary">
                        {currentQuiz.timeLimitMinutes}
                      </Typography>
                      <Typography variant="caption">
                        Minutes
                      </Typography>
                    </Box>
                  )}
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {currentQuiz?.passingScore || 70}%
                    </Typography>
                    <Typography variant="caption">
                      Passing Score
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Alert severity="info" sx={{ mb: 3 }}>
                Once you start the quiz, you cannot pause or restart
                it. Make sure you have enough time to complete it.
              </Alert>
            </Box>
          ) : quizSubmitted && quizResults ? (
            // Quiz Results
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="h5" gutterBottom>
                Quiz Completed!
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Score: {quizResults.score}%
              </Typography>
              <Typography
                variant="body1"
                color={
                  quizResults.passed ? "success.main" : "error.main"
                }
                sx={{ mb: 3 }}>
                {quizResults.passed
                  ? "Congratulations! You passed!"
                  : "You need to retake this quiz."}
              </Typography>
            </Box>
          ) : (
            // Quiz Questions with Timer
            <Box>
              {/* Quiz Timer (if time limit exists) */}
              {currentQuiz?.timeLimitMinutes && (
                <Box sx={{ mb: 3 }}>
                  <QuizTimer
                    totalTimeMinutes={currentQuiz.timeLimitMinutes}
                    onTimeUp={handleQuizTimeUp}
                    onWarning={handleQuizWarning}
                    isActive={quizTimerActive}
                    isPaused={submitting}
                    warningThreshold={5}
                    dangerThreshold={2}
                  />
                </Box>
              )}

              {/* Questions */}
              {quizQuestions.map((question, index) => (
                <Card key={question.questionId} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Question {index + 1}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {question.content}
                    </Typography>

                    <FormControl component="fieldset">
                      <RadioGroup
                        value={quizAnswers[question.questionId] || ""}
                        onChange={(e) =>
                          handleQuizAnswerChange(
                            question.questionId,
                            e.target.value
                          )
                        }>
                        {question.answers?.map((answer) => (
                          <FormControlLabel
                            key={answer.answerId}
                            value={answer.answerId}
                            control={<Radio />}
                            label={answer.answerText}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {!quizStarted ? (
            <>
              <Button
                onClick={() => {
                  setShowQuizDialog(false);
                  setQuizTimerActive(false);
                }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleQuizStart}
                startIcon={<PlayIcon />}>
                Start Quiz
              </Button>
            </>
          ) : quizSubmitted ? (
            <Button
              onClick={() => {
                setShowQuizDialog(false);
                setQuizResults(null);
                setQuizSubmitted(false);
                setQuizStarted(false);
                setQuizTimerActive(false);
              }}>
              Close
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleQuizSubmit}
              disabled={
                submitting ||
                Object.keys(quizAnswers).length !==
                  quizQuestions.length
              }
              startIcon={
                submitting ? <CircularProgress size={16} /> : null
              }>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Navigation */}
      {currentLesson && getNextLesson() && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => navigateToLesson("next")}>
          <NavigateNextIcon />
        </Fab>
      )}
    </Box>
  );
};

export default CoursePlayer;

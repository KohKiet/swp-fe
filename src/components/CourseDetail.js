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
  Collapse,
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
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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
  Download as DownloadIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Home as HomeIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import courseService from "../services/courseService";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
  formatDuration,
  calculateCourseProgress,
  CourseTypeEnum,
} from "../models/courseModels";
import "./CourseDetail.css";

// Styled components
const StyledHeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: "white",
  padding: theme.spacing(6, 0),
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
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
    },
  },
}));

// Helper function to get course type icon
const getCourseTypeIcon = (courseType) => {
  switch (courseType) {
    case CourseTypeEnum.BASIC_AWARENESS:
      return <SchoolIcon />;
    case CourseTypeEnum.PREVENTION:
      return <BookIcon />;
    case CourseTypeEnum.INTERVENTION:
      return <AssignmentIcon />;
    case CourseTypeEnum.RECOVERY_SUPPORT:
      return <GroupIcon />;
    case CourseTypeEnum.PROFESSIONAL_TRAINING:
      return <StarIcon />;
    case CourseTypeEnum.FAMILY_EDUCATION:
      return <GroupIcon />;
    default:
      return <BookIcon />;
  }
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State management
  const [course, setCourse] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [progress, setProgress] = useState({});
  const [courseProgress, setCourseProgress] = useState(0);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);

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
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        setIsEnrolled(false);
        return;
      }

      const response = await courseService.isEnrolled(courseId);
      setIsEnrolled(response === true || response.data === true);
    } catch (err) {
      console.error("Error checking enrollment status:", err);
      setIsEnrolled(false);
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

        progressData.forEach((item) => {
          if (item.lessonId) {
            progressMap[item.lessonId] = item;
          }
        });

        setProgress(progressMap);
      }
    } catch (err) {
      console.error("Error loading progress:", err);
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
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        navigate("/login", {
          state: { returnUrl: `/education/courses/${courseId}` },
        });
        return;
      }

      setEnrollmentLoading(true);

      if (isEnrolled) {
        await courseService.dropFromCourse(courseId);
        setIsEnrolled(false);
      } else {
        await courseService.enrollInCourse(courseId);
        setIsEnrolled(true);
        loadCourseProgress(); // Load progress after enrollment
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

  const handleQuizSelect = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);
    setShowQuizDialog(true);
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
    } catch (err) {
      console.error("Error updating progress:", err);
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

  const getMediaIcon = (mediaType) => {
    switch (mediaType?.toLowerCase()) {
      case "video":
        return <VideoIcon />;
      case "audio":
        return <AudioIcon />;
      case "pdf":
      case "document":
        return <PdfIcon />;
      default:
        return <BookIcon />;
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress[lessonId]?.isCompleted || false;
  };

  const getLessonProgress = (lessonId) => {
    return progress[lessonId]?.percent || 0;
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

  if (error) {
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
      {/* Hero Section */}
      <StyledHeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Breadcrumbs */}
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
                variant="h3"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700 }}>
                {course.title}
              </Typography>

              <Typography
                variant="h6"
                sx={{ opacity: 0.9, mb: 3, lineHeight: 1.6 }}>
                {course.description}
              </Typography>

              {/* Course Meta Info */}
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                sx={{ mb: 3 }}>
                <Chip
                  icon={getCourseTypeIcon(course.courseType)}
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
                <Chip
                  icon={<TimeIcon />}
                  label={formatDuration(course.estimatedDuration)}
                  variant="outlined"
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                  }}
                />
                <Chip
                  icon={<EyeIcon />}
                  label={`${course.viewCount} views`}
                  variant="outlined"
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                  }}
                />
              </Stack>

              {/* Course Stats */}
              <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {course.chapters?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Chapters
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {course.chapters?.reduce(
                      (total, ch) =>
                        total + (ch.lessons?.length || 0),
                      0
                    ) || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Lessons
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {course.enrollmentCount || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Students
                  </Typography>
                </Box>
              </Stack>

              {/* Rating */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 4 }}>
                <Rating
                  value={course.averageRating || 0}
                  precision={0.5}
                  readOnly
                />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  ({course.averageRating?.toFixed(1) || 0})
                </Typography>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleEnrollment}
                  disabled={enrollmentLoading}
                  startIcon={
                    enrollmentLoading ? (
                      <CircularProgress size={20} />
                    ) : isEnrolled ? (
                      <CheckCircleIcon />
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
                  {isEnrolled ? "Continue Learning" : "Enroll Now"}
                </Button>

                <IconButton
                  onClick={(e) => setShareMenuAnchor(e.currentTarget)}
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}>
                  <ShareIcon />
                </IconButton>

                <IconButton
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}>
                  <BookmarkIcon />
                </IconButton>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CourseImageCard>
                <CardMedia
                  component="img"
                  height="250"
                  image={
                    course.imageUrl ||
                    `https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop&auto=format`
                  }
                  alt={course.title}
                />
              </CourseImageCard>
            </Grid>
          </Grid>
        </Container>
      </StyledHeroSection>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Course Content */}
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
                        Previous Lesson
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

            {/* Progress Bar */}
            {isEnrolled && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      Course Progress
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {courseProgress.toFixed(0)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={courseProgress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </CardContent>
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

              {course.chapters?.map((chapter, chapterIndex) => (
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
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 0 }}>
                    <List>
                      {chapter.lessons?.map((lesson, lessonIndex) => (
                        <LessonListItem
                          key={lesson.lessonId}
                          selected={
                            currentLesson?.lessonId ===
                            lesson.lessonId
                          }
                          onClick={() =>
                            handleLessonSelect(chapter, lesson)
                          }>
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

                      {/* Chapter Quiz */}
                      {chapter.quizzes?.map((quiz) => (
                        <LessonListItem
                          key={quiz.quizId}
                          onClick={() => handleQuizSelect(quiz)}>
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
                                  {quiz.timeLimitMinutes} minutes
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

            {/* Course Info */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600 }}>
                Course Information
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary">
                    Instructor
                  </Typography>
                  <Typography variant="body1">
                    {course.authorName || "Unknown"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {formatDuration(course.estimatedDuration)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary">
                    Enrolled Students
                  </Typography>
                  <Typography variant="body1">
                    {course.enrollmentCount || 0}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary">
                    Language
                  </Typography>
                  <Typography variant="body1">English</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Share Menu */}
      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={() => setShareMenuAnchor(null)}>
        <MenuItem
          onClick={() =>
            navigator.clipboard.writeText(window.location.href)
          }>
          Copy Link
        </MenuItem>
        <MenuItem>Share on Social Media</MenuItem>
      </Menu>

      {/* Floating Action Button for Quick Navigation */}
      {currentLesson && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => {
            const nextLesson = getNextLesson();
            if (nextLesson) {
              handleLessonSelect(
                nextLesson.chapter,
                nextLesson.lesson
              );
            }
          }}
          disabled={!getNextLesson()}>
          <NavigateNextIcon />
        </Fab>
      )}
    </Box>
  );
};

export default CourseDetail;

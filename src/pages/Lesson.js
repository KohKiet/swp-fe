import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseService from "../services/courseService";
import ApiStatusIndicator from "../components/ApiStatusIndicator";
import ApiTestButton from "../components/ApiTestButton";
import EmptyState from "../components/EmptyState";
import ProgressApiToggle from "../components/ProgressApiToggle";
import ApiStatusSummary from "../components/ApiStatusSummary";
import QuickFixButton from "../components/QuickFixButton";
import StartQuizButton from "../components/StartQuizButton";
import QuizInline from "../components/QuizInline";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncompletedIcon,
  MenuBook as BookIcon,
  NavigateNext as NavigateNextIcon,
  Quiz as QuizIcon,
  PlayArrow as PlayArrowIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon,
  Celebration as CelebrationIcon,
  Home as HomeIcon,
  EmojiEvents as TrophyIcon,
  LibraryBooks as LibraryBooksIcon,
  Article as ArticleIcon,
  Psychology as PsychologyIcon,
  Star as StarIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
  formatDuration,
} from "../models/courseModels";

// Styled components
const StyledHeroSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  padding: theme.spacing(6, 0),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
    opacity: 0.3,
  },
}));

const ChapterAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: `${theme.spacing(1)} 0`,
  },
  "& .MuiAccordionSummary-root": {
    borderRadius: theme.spacing(1),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const LessonListItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 0),
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateX(4px)",
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

const Lesson = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [showCongratulations, setShowCongratulations] =
    useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [lessonProgress, setLessonProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [completingCourse, setCompletingCourse] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        setError("");
        setApiOnline(true);
        setIsUsingMockData(false);

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setError("Tải khóa học quá lâu. Vui lòng thử lại.");
          setLoading(false);
        }, 15000); // 15 seconds timeout

        // Load course details
        const courseResponse =
          await courseService.getPublicCourseById(courseId);

        // Clear timeout since we got a response
        clearTimeout(timeoutId);

        // Check if we have valid course data
        if (courseResponse?.success && courseResponse.data) {
          const courseData = courseResponse.data;

          // Load chapters for the course
          let chaptersResponse = [];
          try {
            chaptersResponse =
              await courseService.getChaptersByCourse(courseId);
          } catch (chapterError) {
            // Create a default chapter if API fails
            chaptersResponse = [
              {
                id: "default-chapter",
                title: "Nội dung khóa học",
                description: "Chương mặc định",
                lessons: [],
              },
            ];
          }
          courseData.chapters = chaptersResponse || [];

          // Load lessons for each chapter
          for (let chapter of courseData.chapters) {
            try {
              const lessonsResponse =
                await courseService.getLessonsByChapter(chapter.id);
              chapter.lessons = lessonsResponse || [];
            } catch (lessonError) {
              chapter.lessons = [];
            }
          }

          // Load quizzes for the course
          try {
            const quizzesResponse =
              await courseService.getQuizzesByCourse(courseId);
            courseData.quizzes = quizzesResponse?.data || [];
          } catch (quizError) {
            courseData.quizzes = [];
          }

          // Load lesson progress
          try {
            const progressResponse =
              await courseService.getMyProgress();
            if (progressResponse?.success && progressResponse.data) {
              const progressData = progressResponse.data;
              const lessonProgressMap = {};

              // Map progress data to lesson IDs
              if (progressData.lessonProgress) {
                progressData.lessonProgress.forEach((progress) => {
                  lessonProgressMap[progress.lessonId] =
                    progress.isCompleted;
                });
              }

              setLessonProgress(lessonProgressMap);
            }
          } catch (progressError) {
            // Continue without progress data
          }

          setCourse(courseData);
          setChapters(courseData.chapters);
          setQuizzes(courseData.quizzes || []);

          // Set first lesson as current if available
          if (
            courseData.chapters.length > 0 &&
            courseData.chapters[0].lessons.length > 0
          ) {
            setCurrentLesson(courseData.chapters[0].lessons[0]);
            setExpandedChapters(new Set([courseData.chapters[0].id]));
          }
        } else if (courseResponse?.data) {
          // Handle case where response.data exists but success might be false
          const courseData = courseResponse.data;

          // Load chapters for the course
          let chaptersResponse = [];
          try {
            chaptersResponse =
              await courseService.getChaptersByCourse(courseId);
          } catch (chapterError) {
            // Create a default chapter if API fails
            chaptersResponse = [
              {
                id: "default-chapter",
                title: "Nội dung khóa học",
                description: "Chương mặc định",
                lessons: [],
              },
            ];
          }
          courseData.chapters = chaptersResponse || [];

          // Load lessons for each chapter
          for (let chapter of courseData.chapters) {
            try {
              const lessonsResponse =
                await courseService.getLessonsByChapter(chapter.id);
              chapter.lessons = lessonsResponse || [];
            } catch (lessonError) {
              chapter.lessons = [];
            }
          }

          setCourse(courseData);
          setChapters(courseData.chapters);

          // Set first lesson as current if available
          if (
            courseData.chapters.length > 0 &&
            courseData.chapters[0].lessons.length > 0
          ) {
            setCurrentLesson(courseData.chapters[0].lessons[0]);
            setExpandedChapters(new Set([courseData.chapters[0].id]));
          }
        } else {
          setError(
            "Không tìm thấy khóa học hoặc API không trả về dữ liệu"
          );
        }
      } catch (err) {
        setError(
          "Lỗi khi tải khóa học: " + (err.message || "Unknown error")
        );
        setApiOnline(false);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const handleChapterToggle = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentQuiz(null);
  };

  const handleQuizSelect = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);
  };

  const isLessonCompleted = (lessonId) => {
    return lessonProgress[lessonId] === true;
  };

  const findNextLessonOrQuiz = () => {
    if (!currentLesson && !currentQuiz) {
      return null;
    }

    let currentIndex = -1;
    let nextItem = null;

    if (currentLesson) {
      // Find current chapter and lesson index
      for (
        let chapterIndex = 0;
        chapterIndex < chapters.length;
        chapterIndex++
      ) {
        const chapter = chapters[chapterIndex];
        const lessonIndex = chapter.lessons.findIndex(
          (l) => l.id === currentLesson.id
        );

        if (lessonIndex !== -1) {
          // Found current lesson
          if (lessonIndex < chapter.lessons.length - 1) {
            // Next lesson in same chapter
            nextItem = {
              type: "lesson",
              item: chapter.lessons[lessonIndex + 1],
            };
          } else if (chapterIndex < chapters.length - 1) {
            // First lesson in next chapter
            nextItem = {
              type: "lesson",
              item: chapters[chapterIndex + 1].lessons[0],
            };
          } else {
            // Last lesson in last chapter, check if there are quizzes
            if (quizzes.length > 0) {
              nextItem = { type: "quiz", item: quizzes[0] };
            }
          }
          break;
        }
      }
    } else if (currentQuiz) {
      const quizIndex = quizzes.findIndex(
        (q) => q.id === currentQuiz.id
      );
      if (quizIndex !== -1 && quizIndex < quizzes.length - 1) {
        nextItem = { type: "quiz", item: quizzes[quizIndex + 1] };
      }
    }

    return nextItem;
  };

  const completeCourse = async () => {
    try {
      setCompletingCourse(true);

      const response = await courseService.completeCourse(courseId);

      if (response.success) {
        setCourseCompleted(true);
        setShowCongratulations(true);

        // Show success message
        alert(
          "🎉 Chúc mừng! Khóa học đã được hoàn thành thành công!"
        );

        // Navigate to education page after a short delay
        setTimeout(() => {
          navigate("/education");
        }, 2000);
      } else {
        alert(
          "❌ Không thể hoàn thành khóa học: " +
            (response.message || "Lỗi không xác định")
        );
      }
    } catch (error) {
      // Show detailed error message
      const errorMessage = error.message || "Lỗi không xác định";
      const isServerError =
        errorMessage.includes("500") ||
        errorMessage.includes("Internal Server Error");

      if (isServerError) {
        const shouldContinue = window.confirm(
          "❌ Lỗi server khi hoàn thành khóa học.\n\n" +
            "Có thể backend đang gặp sự cố.\n\n" +
            "Bạn có muốn:\n" +
            "• Chọn 'OK' để chuyển về trang khóa học (có thể chưa được đánh dấu hoàn thành)\n" +
            "• Chọn 'Cancel' để ở lại trang này"
        );

        if (shouldContinue) {
          navigate("/education");
        }
      } else {
        alert(
          "❌ Có lỗi xảy ra khi hoàn thành khóa học:\n\n" +
            errorMessage
        );
      }
    } finally {
      setCompletingCourse(false);
    }
  };

  const handleQuizComplete = (result) => {
    // Set quiz as completed
    setQuizCompleted(true);

    // Show success message
    if (result.isPassed) {
      alert(
        "🎉 Chúc mừng! Bạn đã hoàn thành bài kiểm tra và khóa học!\n\n" +
          "Khóa học đã được đánh dấu hoàn thành tự động.\n\n" +
          "Bạn có thể sử dụng nút 'Đánh dấu hoàn thành' để hoàn thành khóa học."
      );
    } else {
      alert(
        "📝 Bài kiểm tra đã hoàn thành nhưng chưa đạt điểm yêu cầu.\n\n" +
          "Bạn có thể làm lại bài kiểm tra để hoàn thành khóa học."
      );
    }

    // Don't navigate - let user stay on current page
    // User can manually navigate using the "Về trang khóa học" button
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang tải khóa học...
        </Typography>
        {process.env.NODE_ENV === "development" && (
          <Typography variant="caption" color="text.secondary">
            Hãy vui lòng chờ trong giây lát
          </Typography>
        )}
      </Box>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Lỗi tải khóa học"
        message={error}
        onRetry={() => {
          setError("");
          setLoading(true);
          // Trigger reload by changing a dependency
          window.location.reload();
        }}
        onGoHome={() => navigate("/education")}
        isUsingMockData={false}
      />
    );
  }

  if (!course) {
    return (
      <EmptyState
        title="Không tìm thấy khóa học"
        message="Khóa học này không tồn tại hoặc đã bị xóa"
        onGoHome={() => navigate("/education")}
      />
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Hero Section */}
      <StyledHeroSection>
        <Container maxWidth="xl">
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
            sx={{ fontWeight: 700, color: "white", mb: 1 }}>
            {course.title}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 3,
              maxWidth: "800px",
            }}>
            {course.description}
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
              sx={{ fontSize: "14px", height: "32px" }}
            />
            <Chip
              icon={<GroupIcon />}
              label={getAgeGroupLabel(course.ageGroup)}
              color="secondary"
              variant="filled"
              sx={{ fontSize: "14px", height: "32px" }}
            />
            {course.imageUrl && (
              <Chip
                icon={<BookIcon />}
                label={`${chapters.length} chương`}
                variant="filled"
                sx={{
                  fontSize: "14px",
                  height: "32px",
                  bgcolor: "rgba(255,255,255,0.2)",
                }}
              />
            )}
          </Stack>
        </Container>
      </StyledHeroSection>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <ApiStatusIndicator
          isOnline={apiOnline}
          isUsingMockData={isUsingMockData}
          onRetry={() => window.location.reload()}
        />

        {/* Debug Tool - Only show when explicitly enabled */}
        {process.env.NODE_ENV === "development" &&
          (process.env.REACT_APP_SHOW_DEBUG_TOOLS === "true" ||
            localStorage.getItem("showDebugTools") === "true") && (
            <>
              <QuickFixButton />
              <ApiStatusSummary />
              <ProgressApiToggle />
              <ApiTestButton courseId={courseId} />
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `http://localhost:5150/api/Course/${courseId}`
                      );
                      const data = await response.text();
                      alert(
                        `API Status: ${
                          response.status
                        }\nData: ${data.substring(0, 200)}...`
                      );
                    } catch (error) {
                      alert(`API Error: ${error.message}`);
                    }
                  }}>
                  Test API Directly
                </Button>
              </Box>

              {/* Test Lesson Completion API */}
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={async () => {
                    try {
                      const token =
                        localStorage.getItem("accessToken");

                      const lessonData = {
                        lessonId:
                          currentLesson?.id || "test-lesson-id",
                        courseId: courseId,
                        isCompleted: true,
                      };

                      const response = await fetch(
                        "http://localhost:5150/api/Progress/lesson/complete",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(
                              "accessToken"
                            )}`,
                          },
                          body: JSON.stringify(lessonData),
                        }
                      );

                      const data = await response.text();
                      alert(
                        `Lesson Completion API Status: ${response.status}\nData: ${data}`
                      );
                    } catch (error) {
                      alert(
                        `Lesson Completion API Error: ${error.message}`
                      );
                    }
                  }}>
                  Test Lesson Completion API
                </Button>
              </Box>

              {/* Debug Data Display */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Debug Data
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ fontSize: "12px", overflow: "auto" }}>
                    Course: {JSON.stringify(course, null, 2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ fontSize: "12px", overflow: "auto" }}>
                    Chapters: {JSON.stringify(chapters, null, 2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ fontSize: "12px", overflow: "auto" }}>
                    Quizzes: {JSON.stringify(quizzes, null, 2)}
                  </Typography>
                </CardContent>
              </Card>
            </>
          )}

        <Grid container spacing={4}>
          {/* Course Sidebar - 30% - BÊN TRÁI */}
          <Grid xs={12} lg={4}>
            <Paper
              sx={{
                p: 4,
                height: "fit-content",
                position: "sticky",
                top: 20,
                boxShadow: 4,
                borderRadius: 3,
                border: "2px solid",
                borderColor: "primary.100",
                bgcolor: "background.paper",
              }}>
              {/* Course Header in Sidebar */}
              <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: "primary.main",
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}>
                  <LibraryBooksIcon
                    sx={{ mr: 1, verticalAlign: "middle" }}
                  />
                  Nội dung khóa học
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: "16px",
                    lineHeight: 1.6,
                    mb: 3,
                  }}>
                  {course.title}
                </Typography>

                {/* Course Progress Summary */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    mb: 3,
                  }}>
                  <Chip
                    label={`${chapters.length} Chương`}
                    color="primary"
                    variant="filled"
                    sx={{ fontSize: "14px", py: 1 }}
                  />
                  <Chip
                    label={`${chapters.reduce(
                      (total, chapter) =>
                        total + chapter.lessons.length,
                      0
                    )} Bài học`}
                    color="secondary"
                    variant="filled"
                    sx={{ fontSize: "14px", py: 1 }}
                  />
                  <Chip
                    label={`${quizzes.length} Bài kiểm tra`}
                    color="info"
                    variant="filled"
                    sx={{ fontSize: "14px", py: 1 }}
                  />
                </Box>

                {/* Lessons List */}
                <List>
                  {chapters.map((chapter) => (
                    <ChapterAccordion
                      key={chapter.id}
                      expanded={expandedChapters.has(chapter.id)}
                      onChange={() =>
                        handleChapterToggle(chapter.id)
                      }>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          bgcolor: "action.hover",
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}>
                        <ListItemButton
                          onClick={() =>
                            handleChapterToggle(chapter.id)
                          }
                          sx={{
                            borderRadius: 1,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}>
                          <ListItemIcon>
                            <BookIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={chapter.title}
                            secondary={chapter.description}
                            sx={{
                              "& .MuiTypography-root": {
                                fontWeight: 600,
                              },
                            }}
                          />
                        </ListItemButton>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {chapter.lessons.map((lesson) => (
                            <LessonListItem
                              key={lesson.id}
                              selected={
                                currentLesson?.id === lesson.id
                              }
                              onClick={() =>
                                handleLessonSelect(lesson)
                              }>
                              <ListItemIcon>
                                {isLessonCompleted(lesson.id) ? (
                                  <CheckCircleIcon />
                                ) : (
                                  <UncompletedIcon />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={lesson.title}
                                secondary={`${
                                  lesson.estimatedTime || 15
                                } phút`}
                                sx={{
                                  "& .MuiTypography-root": {
                                    fontWeight: 600,
                                  },
                                }}
                              />
                            </LessonListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </ChapterAccordion>
                  ))}
                </List>

                {/* Start Quiz Button */}
                {quizzes.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <StartQuizButton
                      quizId={quizzes[0].id}
                      courseId={courseId}
                      quizTitle={quizzes[0].title}
                      timeLimitMinutes={quizzes[0].timeLimitMinutes}
                      passingScore={quizzes[0].passingScore}
                      questionCount={quizzes[0].questionCount}
                      disabled={quizzes.length === 0}
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Lesson Content - 70% - BÊN PHẢI */}
          <Grid xs={12} lg={8}>
            {(() => {
              if (currentLesson) {
                return (
                  <Card
                    sx={{
                      height: "100%",
                      boxShadow: 3,
                      minHeight: "800px",
                    }}>
                    <CardContent sx={{ p: 4 }}>
                      {/* Lesson Header - CENTERED */}
                      <Box sx={{ mb: 6, textAlign: "center" }}>
                        <Typography
                          variant="h2"
                          gutterBottom
                          sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: "primary.main",
                            fontSize: { xs: "2rem", md: "3rem" },
                          }}>
                          {currentLesson.title}
                        </Typography>

                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{
                            mb: 4,
                            fontSize: "20px",
                            lineHeight: 1.6,
                            fontStyle: "italic",
                            maxWidth: "800px",
                            mx: "auto",
                          }}>
                          {currentLesson.description}
                        </Typography>

                        {/* Lesson Info - LEFT TO RIGHT */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 3,
                            justifyContent: "center",
                            flexWrap: "wrap",
                            mb: 4,
                          }}>
                          <Chip
                            icon={<BookIcon />}
                            label={`Bài học ${
                              currentLesson.order || 1
                            }`}
                            color="primary"
                            variant="filled"
                            sx={{ fontSize: "16px", py: 1.5 }}
                          />
                          <Chip
                            icon={<TimeIcon />}
                            label={`Thời gian đọc: ${
                              currentLesson.estimatedTime || 15
                            } phút`}
                            color="secondary"
                            variant="filled"
                            sx={{ fontSize: "16px", py: 1.5 }}
                          />
                          {isLessonCompleted(currentLesson.id) && (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Đã hoàn thành"
                              color="success"
                              variant="filled"
                              sx={{ fontSize: "16px", py: 1.5 }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Lesson Content - LEFT ALIGNED */}
                      <Box
                        sx={{
                          p: 6,
                          bgcolor: "background.paper",
                          borderRadius: 3,
                          border: "2px solid",
                          borderColor: "primary.100",
                          minHeight: "600px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          textAlign: "left",
                        }}>
                        <Typography
                          variant="h4"
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            mb: 4,
                            color: "primary.main",
                            textAlign: "left",
                          }}>
                          <ArticleIcon
                            sx={{ mr: 1, verticalAlign: "middle" }}
                          />
                          Nội dung bài học
                        </Typography>

                        {/* Display actual lesson content - LEFT ALIGNED */}
                        <Box
                          sx={{
                            fontSize: "18px",
                            lineHeight: 1.8,
                            color: "text.primary",
                            textAlign: "left",
                          }}>
                          {currentLesson.content ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: currentLesson.content.replace(
                                  /\n/g,
                                  "<br/>"
                                ),
                              }}
                              style={{
                                whiteSpace: "pre-wrap",
                                fontFamily: "inherit",
                                textAlign: "left",
                              }}
                            />
                          ) : (
                            <Box sx={{ textAlign: "left", py: 8 }}>
                              <Typography
                                variant="h5"
                                color="text.secondary"
                                gutterBottom
                                sx={{ textAlign: "left" }}>
                                <ArticleIcon
                                  sx={{
                                    mr: 1,
                                    verticalAlign: "middle",
                                  }}
                                />
                                Nội dung bài học
                              </Typography>
                              <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                  textAlign: "left",
                                  maxWidth: "100%",
                                  fontSize: "18px",
                                }}>
                                {isUsingMockData
                                  ? "Demo content - Backend API is unavailable"
                                  : "Nội dung bài học sẽ được hiển thị ở đây khi có dữ liệu từ backend"}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Lesson Actions - BOTTOM */}
                        <Box
                          sx={{
                            mt: 6,
                            pt: 4,
                            borderTop: "2px solid",
                            borderColor: "divider",
                            display: "flex",
                            gap: 3,
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            {/* Complete Course Button - Only show when quiz is completed */}
                            {process.env.NODE_ENV === "development" &&
                              quizCompleted && (
                                <Button
                                  variant="contained"
                                  size="large"
                                  startIcon={<SchoolIcon />}
                                  disabled={completingCourse}
                                  onClick={async () => {
                                    try {
                                      await completeCourse();
                                    } catch (error) {
                                      alert(
                                        "❌ Error: " + error.message
                                      );
                                    }
                                  }}
                                  sx={{
                                    px: 3,
                                    py: 1.5,
                                    fontSize: "16px",
                                    background:
                                      "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                                    color: "white",
                                    fontWeight: 600,
                                    "&:hover": {
                                      background:
                                        "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                                    },
                                    "&:disabled": {
                                      background:
                                        "linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)",
                                      color:
                                        "rgba(255, 255, 255, 0.7)",
                                    },
                                  }}>
                                  {completingCourse
                                    ? "Đang hoàn thành..."
                                    : "Đánh dấu hoàn thành"}
                                </Button>
                              )}

                            <Button
                              variant="outlined"
                              color="info"
                              size="large"
                              startIcon={<HomeIcon />}
                              onClick={() => {
                                navigate("/education");
                              }}
                              sx={{
                                px: 3,
                                py: 1.5,
                                fontSize: "16px",
                              }}>
                              Về trang khóa học
                            </Button>
                          </Box>

                          {/* Error Display - REMOVED */}

                          {/* Next Button */}
                          <Button
                            variant="contained"
                            color="success"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => {
                              // Find next lesson or quiz
                              const nextItem = findNextLessonOrQuiz();
                              if (nextItem) {
                                if (nextItem.type === "lesson") {
                                  setCurrentLesson(nextItem.item);
                                  setCurrentQuiz(null);
                                } else if (nextItem.type === "quiz") {
                                  setCurrentQuiz(nextItem.item);
                                  setCurrentLesson(null);
                                }
                              } else {
                                // No more lessons or quizzes, show message about quiz requirement
                                alert(
                                  "🎉 Chúc mừng! Bạn đã hoàn thành tất cả bài học.\n\n" +
                                    "📝 Để hoàn thành khóa học, bạn cần làm bài kiểm tra cuối khóa.\n\n" +
                                    "Hãy click vào nút 'Bắt đầu Quiz' trong sidebar để làm bài kiểm tra."
                                );
                              }
                            }}
                            sx={{
                              px: 4,
                              py: 2,
                              fontSize: "18px",
                              fontWeight: 600,
                            }}>
                            {(() => {
                              const nextItem = findNextLessonOrQuiz();
                              if (!nextItem) {
                                return "Làm bài kiểm tra";
                              } else if (nextItem.type === "quiz") {
                                return "Làm bài kiểm tra";
                              } else {
                                return "Tiếp theo";
                              }
                            })()}
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              } else if (currentQuiz) {
                return (
                  <Card sx={{ height: "100%", boxShadow: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                      <QuizInline
                        quiz={currentQuiz}
                        courseId={courseId}
                        onQuizComplete={handleQuizComplete}
                        onBackToLessons={() => {
                          setCurrentQuiz(null);
                          // Set first lesson as current if available
                          if (
                            chapters.length > 0 &&
                            chapters[0].lessons.length > 0
                          ) {
                            setCurrentLesson(chapters[0].lessons[0]);
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                );
              } else if (showCongratulations) {
                return (
                  <Card
                    sx={{
                      height: "100%",
                      boxShadow: 3,
                      minHeight: "600px",
                    }}>
                    <CardContent sx={{ p: 6, textAlign: "center" }}>
                      {/* Congratulations Header */}
                      <Box sx={{ mb: 6 }}>
                        <Typography
                          variant="h1"
                          gutterBottom
                          sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: "success.main",
                            fontSize: { xs: "3rem", md: "4rem" },
                          }}>
                          <CelebrationIcon
                            sx={{ mr: 2, fontSize: "inherit" }}
                          />
                          Chúc mừng!
                        </Typography>

                        <Typography
                          variant="h4"
                          color="text.secondary"
                          sx={{
                            mb: 4,
                            fontSize: "24px",
                            lineHeight: 1.6,
                            maxWidth: "800px",
                            mx: "auto",
                          }}>
                          Bạn đã hoàn thành tất cả bài học trong khóa
                          học "{course.title}"
                        </Typography>

                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{
                            fontSize: "18px",
                            lineHeight: 1.6,
                            maxWidth: "600px",
                            mx: "auto",
                            fontStyle: "italic",
                          }}>
                          🎯 Để hoàn thành khóa học, bạn cần làm bài
                          kiểm tra cuối khóa. Hãy click vào nút "Bắt
                          đầu Quiz" trong sidebar để làm bài kiểm tra.
                        </Typography>
                      </Box>

                      {/* Course Summary */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 4,
                          justifyContent: "center",
                          flexWrap: "wrap",
                          mb: 6,
                        }}>
                        <Chip
                          icon={<LibraryBooksIcon />}
                          label={`${chapters.length} Chương đã học`}
                          color="primary"
                          variant="filled"
                          sx={{ fontSize: "16px", py: 2, px: 3 }}
                        />
                        <Chip
                          icon={<ArticleIcon />}
                          label={`${chapters.reduce(
                            (total, chapter) =>
                              total + chapter.lessons.length,
                            0
                          )} Bài học đã hoàn thành`}
                          color="secondary"
                          variant="filled"
                          sx={{ fontSize: "16px", py: 2, px: 3 }}
                        />
                        <Chip
                          icon={<PsychologyIcon />}
                          label={`${quizzes.length} Bài kiểm tra cần làm`}
                          color="info"
                          variant="filled"
                          sx={{ fontSize: "16px", py: 2, px: 3 }}
                        />
                      </Box>

                      {/* Action Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<QuizIcon />}
                          onClick={() => {
                            // Navigate to first quiz
                            if (quizzes.length > 0) {
                              setCurrentQuiz(quizzes[0]);
                              setShowCongratulations(false);
                            }
                          }}
                          sx={{
                            px: 4,
                            py: 2,
                            fontSize: "18px",
                            fontWeight: 600,
                          }}>
                          Bắt đầu làm bài kiểm tra
                        </Button>

                        <Button
                          variant="outlined"
                          color="primary"
                          size="large"
                          startIcon={<HomeIcon />}
                          onClick={() => {
                            navigate("/education");
                          }}
                          sx={{
                            px: 4,
                            py: 2,
                            fontSize: "18px",
                            fontWeight: 600,
                          }}>
                          Về trang khóa học
                        </Button>
                      </Box>

                      {/* Info Message */}
                      <Box
                        sx={{
                          mt: 4,
                          p: 3,
                          bgcolor: "info.50",
                          borderRadius: 2,
                          border: "2px solid",
                          borderColor: "info.200",
                        }}>
                        <Typography
                          variant="h6"
                          color="info.main"
                          sx={{ fontWeight: 600, mb: 1 }}>
                          <InfoIcon
                            sx={{ mr: 1, verticalAlign: "middle" }}
                          />
                          Thông tin quan trọng
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary">
                          Khóa học chỉ được đánh dấu hoàn thành khi
                          bạn làm bài kiểm tra và đạt điểm số yêu cầu.
                          Hãy làm bài kiểm tra để nhận chứng chỉ hoàn
                          thành khóa học.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              } else {
                return (
                  <Card
                    sx={{
                      height: "100%",
                      boxShadow: 3,
                      minHeight: "600px",
                    }}>
                    <CardContent sx={{ p: 4 }}>
                      {/* Course Header */}
                      <Box sx={{ textAlign: "center", mb: 6 }}>
                        <Typography
                          variant="h2"
                          color="primary.main"
                          gutterBottom
                          sx={{
                            fontWeight: 700,
                            mb: 3,
                            fontSize: { xs: "2rem", md: "3rem" },
                          }}>
                          <SchoolIcon
                            sx={{ mr: 2, fontSize: "inherit" }}
                          />
                          {course.title}
                        </Typography>

                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{
                            mb: 4,
                            fontSize: "20px",
                            lineHeight: 1.6,
                            maxWidth: "800px",
                            mx: "auto",
                            fontStyle: "italic",
                          }}>
                          {course.description ||
                            "Khóa học cung cấp kiến thức toàn diện và thực tế"}
                        </Typography>

                        {/* Course Stats */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 3,
                            justifyContent: "center",
                            flexWrap: "wrap",
                            mb: 4,
                          }}>
                          <Chip
                            icon={<LibraryBooksIcon />}
                            label={`${chapters.length} Chương`}
                            color="primary"
                            variant="filled"
                            sx={{ fontSize: "16px", py: 1 }}
                          />
                          <Chip
                            icon={<ArticleIcon />}
                            label={`${chapters.reduce(
                              (total, chapter) =>
                                total + chapter.lessons.length,
                              0
                            )} Bài học`}
                            color="secondary"
                            variant="filled"
                            sx={{ fontSize: "16px", py: 1 }}
                          />
                          <Chip
                            icon={<PsychologyIcon />}
                            label={`${quizzes.length} Bài kiểm tra`}
                            color="info"
                            variant="filled"
                            sx={{ fontSize: "16px", py: 1 }}
                          />
                        </Box>
                      </Box>

                      {/* Call to Action */}
                      <Box
                        sx={{
                          p: 4,
                          bgcolor: "success.50",
                          borderRadius: 3,
                          border: "2px solid",
                          borderColor: "success.200",
                          textAlign: "center",
                        }}>
                        <Typography
                          variant="h5"
                          color="success.main"
                          gutterBottom
                          sx={{ fontWeight: 600 }}>
                          <PlayArrowIcon
                            sx={{ mr: 1, verticalAlign: "middle" }}
                          />
                          Bắt đầu học ngay!
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 3, fontSize: "18px" }}>
                          Chọn bài học đầu tiên từ sidebar để bắt đầu
                          hành trình học tập của bạn. Mỗi bài học được
                          thiết kế để cung cấp kiến thức một cách có
                          hệ thống.
                        </Typography>

                        <Button
                          variant="contained"
                          color="success"
                          size="large"
                          startIcon={<AssignmentIcon />}
                          onClick={() => {
                            // Auto-select first lesson
                            if (
                              chapters.length > 0 &&
                              chapters[0].lessons.length > 0
                            ) {
                              setCurrentLesson(
                                chapters[0].lessons[0]
                              );
                            }
                          }}
                          sx={{
                            px: 4,
                            py: 2,
                            fontSize: "18px",
                            fontWeight: 600,
                          }}>
                          Bắt đầu với bài học đầu tiên
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              }
            })()}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Lesson;

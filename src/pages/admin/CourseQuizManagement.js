import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import courseService from "../../services/courseService";
import {
  getCourseQuiz,
  startQuizSession,
  submitQuiz,
} from "../../services/quizService";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const CourseQuizManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state cho tạo quiz
  const [formData, setFormData] = useState({
    lessonId: "",
    title: "",
    description: "",
    isFinalQuiz: true, // Always true theo requirement
    timeLimitMinutes: 30,
    passingScore: 70,
    maxAttempts: 3,
    allowRetry: true,
    retryDelayMinutes: 1440, // 24 hours
  });

  const [formErrors, setFormErrors] = useState({});

  // Load course data và quizzes
  useEffect(() => {
    loadCourseData();
    loadQuizzes();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      // Load course details
      const courseResponse = await courseService.getCourseById(
        courseId
      );
      if (courseResponse.success) {
        setCourse(courseResponse.data);
      }

      // Load chapters and lessons
      const chaptersResponse =
        await courseService.getChaptersByCourse(courseId);
      if (chaptersResponse && Array.isArray(chaptersResponse)) {
        // Load lessons for each chapter
        const chaptersWithLessons = await Promise.all(
          chaptersResponse.map(async (chapter) => {
            const lessonsResponse =
              await courseService.getLessonsByChapter(chapter.id);
            return {
              ...chapter,
              lessons: lessonsResponse || [],
            };
          })
        );
        setChapters(chaptersWithLessons);
      }
    } catch (err) {
      console.error("Error loading course data:", err);
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      const response = await getCourseQuiz(courseId);
      if (response.success) {
        setQuizzes(response.data);
      }
    } catch (err) {
      console.error("Error loading quizzes:", err);
      setError("Failed to load quizzes");
    }
  };

  const handleMenuClick = (event, quiz) => {
    setMenuAnchor(event.currentTarget);
    setSelectedQuiz(quiz);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedQuiz(null);
  };

  const handleCreateQuiz = () => {
    setShowCreateDialog(true);
    setFormData({
      lessonId: "",
      title: "",
      description: "",
      isFinalQuiz: true,
      timeLimitMinutes: 30,
      passingScore: 70,
      maxAttempts: 3,
      allowRetry: true,
      retryDelayMinutes: 1440,
    });
    setFormErrors({});
  };

  const handleEditQuiz = (quiz) => {
    // Navigate to quiz editor or open edit dialog
    navigate(`/admin/quiz/${quiz.id}/edit`);
    handleMenuClose();
  };

  const handleDeleteQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.lessonId) {
      errors.lessonId = "Please select a lesson";
    }

    if (!formData.title.trim()) {
      errors.title = "Quiz title is required";
    }

    if (
      formData.timeLimitMinutes < 1 ||
      formData.timeLimitMinutes > 300
    ) {
      errors.timeLimitMinutes =
        "Time limit must be between 1 and 300 minutes";
    }

    if (formData.passingScore < 0 || formData.passingScore > 100) {
      errors.passingScore = "Passing score must be between 0 and 100";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCreate = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await courseService.createQuiz(formData);

      if (response.success) {
        setShowCreateDialog(false);
        loadQuizzes(); // Refresh quizzes list
      } else {
        setError(response.error || "Failed to create quiz");
      }
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Failed to create quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;

    setSubmitting(true);
    try {
      const response = await courseService.deleteQuiz(
        selectedQuiz.id
      );

      if (response.success) {
        setShowDeleteDialog(false);
        loadQuizzes(); // Refresh quizzes list
      } else {
        setError(response.error || "Failed to delete quiz");
      }
    } catch (err) {
      console.error("Error deleting quiz:", err);
      setError("Failed to delete quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getAllLessons = () => {
    return chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({
        ...lesson,
        chapterTitle: chapter.title,
      }))
    );
  };

  // Check if lesson already has a quiz
  const hasQuiz = (lessonId) => {
    return quizzes.some((quiz) => quiz.lessonId === lessonId);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink
            color="inherit"
            onClick={() => navigate("/admin/courses")}
            sx={{ cursor: "pointer" }}>
            Courses
          </MuiLink>
          <Typography color="text.primary">
            Quiz Management
          </Typography>
        </Breadcrumbs>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between">
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 600 }}>
              📝 Quiz Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {course?.title}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateQuiz}
            size="large">
            Create Quiz
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Quiz Cards */}
      {quizzes.length > 0 ? (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} md={6} lg={4} key={quiz.id}>
              <StyledCard>
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 2 }}>
                    <QuizIcon color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{ fontWeight: 600 }}>
                        {quiz.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary">
                        {quiz.chapterTitle} • {quiz.lessonTitle}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, quiz)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>

                  {quiz.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}>
                      {quiz.description}
                    </Typography>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ mb: 2 }}>
                    <Chip
                      icon={<TimerIcon />}
                      label={`${quiz.timeLimitMinutes} min`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${quiz.passingScore}% pass`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                    <Chip
                      label={`${quiz.maxAttempts} attempts`}
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                    {quiz.allowRetry && (
                      <Chip
                        label="Retry allowed"
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    )}
                  </Stack>
                </CardContent>

                <CardActions
                  sx={{
                    justifyContent: "space-between",
                    px: 2,
                    pb: 2,
                  }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditQuiz(quiz)}>
                    Edit
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <QuizIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom>
            No quizzes found
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}>
            Create your first quiz to start testing students knowledge
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateQuiz}>
            Create First Quiz
          </Button>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditQuiz(selectedQuiz)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Quiz
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteQuiz(selectedQuiz)}
          sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Quiz
        </MenuItem>
      </Menu>

      {/* Create Quiz Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>Create New Quiz</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth error={!!formErrors.lessonId}>
              <InputLabel>Select Lesson</InputLabel>
              <Select
                value={formData.lessonId}
                label="Select Lesson"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lessonId: e.target.value,
                  }))
                }>
                {getAllLessons().map((lesson) => (
                  <MenuItem
                    key={lesson.id}
                    value={lesson.id}
                    disabled={hasQuiz(lesson.id)}>
                    {lesson.chapterTitle} • {lesson.title}
                    {hasQuiz(lesson.id) && " (Has Quiz)"}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.lessonId && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5 }}>
                  {formErrors.lessonId}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Quiz Title"
              fullWidth
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              error={!!formErrors.title}
              helperText={formErrors.title}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Time Limit (minutes)"
                  type="number"
                  fullWidth
                  value={formData.timeLimitMinutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timeLimitMinutes: parseInt(e.target.value) || 0,
                    }))
                  }
                  error={!!formErrors.timeLimitMinutes}
                  helperText={formErrors.timeLimitMinutes}
                  inputProps={{ min: 1, max: 300 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Passing Score (%)"
                  type="number"
                  fullWidth
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passingScore: parseInt(e.target.value) || 0,
                    }))
                  }
                  error={!!formErrors.passingScore}
                  helperText={formErrors.passingScore}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Attempts"
                  type="number"
                  fullWidth
                  value={formData.maxAttempts}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxAttempts: parseInt(e.target.value) || 1,
                    }))
                  }
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Retry Delay (minutes)"
                  type="number"
                  fullWidth
                  value={formData.retryDelayMinutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      retryDelayMinutes:
                        parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={!formData.allowRetry}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.allowRetry}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowRetry: e.target.checked,
                    }))
                  }
                />
              }
              label="Allow Retry"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCreate}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <SaveIcon />
              )
            }>
            Create Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedQuiz?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseQuizManagement;

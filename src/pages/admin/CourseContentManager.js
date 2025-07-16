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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  Paper,
  LinearProgress,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragHandle as DragHandleIcon,
  PlayArrow as PlayIcon,
  Quiz as QuizIcon,
  MenuBook as ChapterIcon,
  Article as LessonIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Description as DocumentIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Visibility as PreviewIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircle,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import adminService from "../../services/adminService";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
} from "../../models/courseModels";
import QuizEditor from "../../components/admin/QuizEditor";

const DragContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  cursor: "grab",
  "&:active": {
    cursor: "grabbing",
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: `${theme.spacing(1)} 0`,
  },
}));

const CourseContentManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [expandedChapter, setExpandedChapter] = useState(null);

  // Dialog states
  const [showChapterDialog, setShowChapterDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Form states
  const [chapterForm, setChapterForm] = useState({
    title: "",
    description: "",
    orderIndex: 1,
  });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    orderIndex: 1,
    estimatedDuration: 10,
    chapterId: "",
    lessonType: "Text",
    additionalResources: "",
    passingScore: 100,
  });
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    passingScore: 70,
    chapterId: "",
    lessonId: "",
    questions: [],
  });
  const [mediaForm, setMediaForm] = useState({
    title: "",
    type: "image",
    file: null,
    description: "",
    chapterId: "",
    lessonId: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // 1. Add state to store lessons by chapter
  const [chapterLessons, setChapterLessons] = useState({});

  // 1. Add state for quiz dialog and selected lesson/quiz
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [quizEditorLessonId, setQuizEditorLessonId] = useState(null);
  const [quizEditorQuiz, setQuizEditorQuiz] = useState(null);

  // Add state at the top of CourseContentManager
  const [expandedLessonQuestions, setExpandedLessonQuestions] =
    useState({});

  // Load course data on mount
  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  // 2. Fetch lessons for all chapters when chapters change
  useEffect(() => {
    const fetchLessonsForChapters = async () => {
      const lessonsByChapter = {};
      for (const chapter of chapters) {
        const id = chapter.chapterId || chapter.id;
        if (!id) continue;
        try {
          const response = await adminService.authenticatedRequest(
            `/api/Lesson/chapter/${id}`
          );
          if (response.success) {
            // For each lesson, fetch quizzes and attach
            const lessonsWithQuizzes = await Promise.all(
              response.data.map(async (lesson) => {
                const quizRes = await adminService.getQuizzesByLesson(
                  lesson.lessonId || lesson.id
                );
                let quizzes = quizRes.success ? quizRes.data : [];
                // Fetch questions for each quiz if not present
                quizzes = await Promise.all(
                  quizzes.map(async (quiz) => {
                    if (
                      !quiz.questions ||
                      !Array.isArray(quiz.questions) ||
                      quiz.questions.length === 0
                    ) {
                      const qRes =
                        await adminService.authenticatedRequest(
                          `/api/Question/quiz/${
                            quiz.quizId || quiz.id
                          }`
                        );
                      if (qRes.success && Array.isArray(qRes.data)) {
                        return { ...quiz, questions: qRes.data };
                      }
                    }
                    return quiz;
                  })
                );
                const lessonWithQuizzes = { ...lesson, quizzes };
                console.log(
                  "DEBUG: lessonWithQuizzes for chapter",
                  id,
                  lessonWithQuizzes
                );
                return lessonWithQuizzes;
              })
            );
            console.log(
              "DEBUG: lessonsWithQuizzes for chapter",
              id,
              lessonsWithQuizzes
            );
            lessonsByChapter[id] = lessonsWithQuizzes;
          } else {
            lessonsByChapter[id] = [];
          }
        } catch (err) {
          lessonsByChapter[id] = [];
        }
      }
      console.log(
        "DEBUG: Setting chapterLessons",
        JSON.stringify(lessonsByChapter, null, 2)
      );
      setChapterLessons(lessonsByChapter);
    };
    if (chapters.length > 0) fetchLessonsForChapters();
  }, [chapters]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load course details
      const courseResponse = await adminService.getCourseById(
        courseId
      );
      if (courseResponse.success) {
        setCourse(courseResponse.data);
      }

      // Load chapters
      const chaptersResponse = await adminService.getChapters();
      if (chaptersResponse.success) {
        // Filter chapters for this course and sort by order
        const courseChapters = chaptersResponse.data
          .filter((ch) => ch.courseId === courseId)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        setChapters(courseChapters);
      }
    } catch (err) {
      console.error("Error loading course data:", err);
      setError("Failed to load course data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Chapter management
  const handleCreateChapter = () => {
    setEditingItem(null);
    setChapterForm({
      title: "",
      description: "",
      orderIndex: chapters.length + 1,
    });
    setShowChapterDialog(true);
  };

  const handleEditChapter = (chapter) => {
    setEditingItem(chapter);
    setChapterForm({
      title: chapter.title,
      description: chapter.description,
      orderIndex: chapter.orderIndex,
    });
    setShowChapterDialog(true);
  };

  const handleSubmitChapter = async () => {
    try {
      setSubmitting(true);

      // Ensure chapterOrder is present and > 0
      const chapterOrder =
        Number(chapterForm.orderIndex) > 0
          ? Number(chapterForm.orderIndex)
          : 1;
      const chapterData = {
        courseId,
        title: chapterForm.title,
        description: chapterForm.description,
        chapterOrder, // Use correct property name for backend
      };

      let response;
      if (editingItem) {
        console.log("DEBUG editingItem:", editingItem);
        response = await adminService.updateChapter(
          editingItem.chapterId || editingItem.id,
          chapterData
        );
      } else {
        response = await adminService.createChapter(chapterData);
      }

      if (response.success) {
        setShowChapterDialog(false);
        loadCourseData(); // Refresh data
      } else {
        setError(response.error || "Failed to save chapter");
      }
    } catch (err) {
      console.error("Error saving chapter:", err);
      setError("Failed to save chapter. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChapter = async (chapter) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${chapter.title}"?`
      )
    )
      return;

    try {
      setSubmitting(true);
      const response = await adminService.deleteChapter(
        chapter.chapterId
      );

      if (response.success) {
        loadCourseData(); // Refresh data
      } else {
        setError(response.error || "Failed to delete chapter");
      }
    } catch (err) {
      console.error("Error deleting chapter:", err);
      setError("Failed to delete chapter. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Lesson management
  const handleCreateLesson = (chapterId) => {
    if (!chapterId) {
      alert("No chapter selected or chapters not loaded.");
      return;
    }
    setEditingItem(null);
    setSelectedChapter(chapterId);
    setLessonForm((prev) => ({
      ...prev,
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      orderIndex: 1,
      estimatedDuration: 10,
      chapterId: chapterId,
      lessonType: "Text",
      additionalResources: "",
      passingScore: 100,
    }));
    setShowLessonDialog(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingItem(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content,
      videoUrl: lesson.videoUrl || "",
      orderIndex: lesson.orderIndex,
      estimatedDuration: lesson.estimatedDuration || 10,
      chapterId: lesson.chapterId, // always set chapterId in form
      lessonType: lesson.lessonType || "Text",
      additionalResources: lesson.additionalResources || "",
      passingScore: lesson.passingScore || 100,
    });
    setShowLessonDialog(true);
  };

  const handleSubmitLesson = async () => {
    try {
      setSubmitting(true);

      // Debug: log lessonForm state
      console.log("DEBUG lessonForm at submit:", lessonForm);

      // Only use lessonForm.chapterId
      const chapterId = lessonForm.chapterId;
      if (
        !chapterId ||
        typeof chapterId !== "string" ||
        chapterId.length < 8
      ) {
        setError(
          "No valid chapter selected. Please select a chapter."
        );
        setSubmitting(false);
        return;
      }

      // Validate required fields
      if (
        !lessonForm.title ||
        !lessonForm.description ||
        !lessonForm.content
      ) {
        setError("Title, description, and content are required.");
        setSubmitting(false);
        return;
      }

      // Map form fields to backend API fields
      const lessonOrder = Math.max(
        1,
        Math.min(lessonForm.orderIndex || 1, 100)
      );
      // Use estimated duration directly as minutes, or convert to a reasonable seconds value
      const duration = Math.max(
        1, // minimum 1 minute
        lessonForm.estimatedDuration || 10 // use minutes directly
      );
      const lessonData = {
        chapterId,
        title: lessonForm.title,
        description: lessonForm.description,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl || "",
        lessonOrder,
        isCompleted: false,
        duration,
        lessonType: lessonForm.lessonType || "Text",
        isPublished: true,
        additionalResources: lessonForm.additionalResources || "",
        passingScore: lessonForm.passingScore || 100,
      };

      console.log("Lesson data being sent:", lessonData);
      console.log("DEBUG chapterId being sent:", chapterId);
      console.log("DEBUG duration in seconds:", duration);

      let response;
      if (editingItem) {
        response = await adminService.updateLesson(
          editingItem.lessonId || editingItem.id,
          lessonData
        );
      } else {
        response = await adminService.createLesson(lessonData);
      }

      if (response.success) {
        setShowLessonDialog(false);
        loadCourseData(); // Refresh data
      } else {
        setError(response.error || "Failed to save lesson");
      }
    } catch (err) {
      console.error("Error saving lesson:", err);
      setError("Failed to save lesson. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Quiz management
  const handleCreateQuiz = (chapterId, lessonId = null) => {
    setEditingItem(null);
    setSelectedChapter(chapterId);
    setSelectedLesson(lessonId);
    setQuizForm({
      title: "",
      description: "",
      passingScore: 70,
      chapterId,
      lessonId,
      questions: [],
    });
    setShowQuizDialog(true);
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);

      let response;
      if (editingItem) {
        response = await adminService.updateQuiz(
          editingItem.quizId,
          quizForm
        );
      } else {
        response = await adminService.createQuiz(quizForm);
      }

      if (response.success) {
        setShowQuizDialog(false);
        loadCourseData(); // Refresh data
      } else {
        setError(response.error || "Failed to save quiz");
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
      setError("Failed to save quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Media management
  const handleUploadMedia = (chapterId, lessonId = null) => {
    setSelectedChapter(chapterId);
    setSelectedLesson(lessonId);
    setMediaForm({
      title: "",
      type: "image",
      file: null,
      description: "",
      chapterId,
      lessonId,
    });
    setShowMediaDialog(true);
  };

  // 3. Add handler to open QuizEditor for a lesson
  const handleOpenQuizEditor = (lessonId, quiz = null) => {
    setQuizEditorLessonId(lessonId);
    setQuizEditorQuiz(quiz);
    setShowQuizEditor(true);
  };

  const refreshLessonQuizzes = async (lessonId) => {
    let chapterIdWithLesson = null;
    let lessonIndex = null;
    let lessonsCopy = null;
    for (const [chapterId, lessons] of Object.entries(
      chapterLessons
    )) {
      const idx = lessons.findIndex(
        (lesson) =>
          lesson.lessonId === lessonId || lesson.id === lessonId
      );
      if (idx !== -1) {
        chapterIdWithLesson = chapterId;
        lessonIndex = idx;
        lessonsCopy = [...lessons];
        break;
      }
    }
    if (!chapterIdWithLesson || lessonIndex === null) return;
    const quizRes = await adminService.getQuizzesByLesson(lessonId);
    let quizzes = quizRes.success ? quizRes.data : [];
    // Fetch questions for each quiz if not present
    quizzes = await Promise.all(
      quizzes.map(async (quiz) => {
        if (
          !quiz.questions ||
          !Array.isArray(quiz.questions) ||
          quiz.questions.length === 0
        ) {
          const qRes = await adminService.authenticatedRequest(
            `/api/Question/quiz/${quiz.quizId || quiz.id}`
          );
          if (qRes.success && Array.isArray(qRes.data)) {
            console.log(
              "Questions for quiz",
              quiz.quizId || quiz.id,
              qRes.data
            );
            return { ...quiz, questions: qRes.data };
          }
        }
        return quiz;
      })
    );
    lessonsCopy[lessonIndex] = {
      ...lessonsCopy[lessonIndex],
      quizzes,
    };
    setChapterLessons((prev) => ({
      ...prev,
      [chapterIdWithLesson]: lessonsCopy,
    }));
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case "image":
        return <ImageIcon />;
      case "video":
        return <VideoIcon />;
      case "audio":
        return <AudioIcon />;
      case "document":
        return <DocumentIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  const renderChapterAccordion = (chapter) => {
    const lessons =
      chapterLessons[chapter.chapterId || chapter.id] || [];
    console.log(
      "DEBUG: UI lessons for chapter",
      chapter.chapterId || chapter.id,
      lessons
    );
    return (
      <StyledAccordion
        key={chapter.chapterId}
        expanded={expandedChapter === chapter.chapterId}
        onChange={() =>
          setExpandedChapter(
            expandedChapter === chapter.chapterId
              ? null
              : chapter.chapterId
          )
        }>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 2,
            }}>
            <DragContainer>
              <DragHandleIcon color="action" />
              <ChapterIcon color="primary" />
            </DragContainer>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Chapter {chapter.orderIndex}: {chapter.title}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 2 }}
                  component="span">
                  (ID: {chapter.chapterId || chapter.id || "N/A"})
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lessons.length || 0} lessons •
                {chapter.quizzes?.length || 0} quizzes •
                {chapter.media?.length || 0} media files
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditChapter(chapter);
                }}>
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChapter(chapter);
                }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Lessons Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}>
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}>
                      <LessonIcon />
                      Lessons
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        handleCreateLesson(
                          chapter.chapterId || chapter.id
                        )
                      }>
                      Add Lesson
                    </Button>
                  </Box>

                  {lessons.length > 0 ? (
                    <List dense>
                      {lessons
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((lesson) => {
                          console.log("Lesson object:", lesson);
                          return (
                            <Box key={lesson.lessonId || lesson.id}>
                              <ListItem
                                secondaryAction={
                                  <Box>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleEditLesson(lesson)
                                      }>
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleOpenQuizEditor(
                                          lesson.lessonId || lesson.id
                                        )
                                      }>
                                      <QuizIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleUploadMedia(
                                          chapter.chapterId,
                                          lesson.lessonId || lesson.id
                                        )
                                      }>
                                      <UploadIcon />
                                    </IconButton>
                                  </Box>
                                }>
                                <ListItemIcon>
                                  <LessonIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${lesson.orderIndex}. ${lesson.title}`}
                                  secondary={`${
                                    lesson.estimatedDuration || 10
                                  } min`}
                                />
                              </ListItem>
                              {/* Tất cả câu hỏi button and expandable section */}
                              <Box sx={{ pl: 7, pb: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    setExpandedLessonQuestions(
                                      (prev) => ({
                                        ...prev,
                                        [lesson.lessonId ||
                                        lesson.id]:
                                          !prev[
                                            lesson.lessonId ||
                                              lesson.id
                                          ],
                                      })
                                    )
                                  }>
                                  Tất cả câu hỏi
                                </Button>
                                {expandedLessonQuestions[
                                  lesson.lessonId || lesson.id
                                ] && (
                                  <Box sx={{ mt: 2, mb: 2 }}>
                                    {lesson.quizzes &&
                                    lesson.quizzes.length > 0 ? (
                                      lesson.quizzes.map((quiz) => (
                                        <Box
                                          key={quiz.quizId || quiz.id}
                                          sx={{ mb: 2 }}>
                                          <Typography
                                            variant="subtitle2"
                                            sx={{ mb: 1 }}>
                                            {quiz.title || `Quiz`}
                                          </Typography>
                                          {quiz.questions &&
                                          quiz.questions.length >
                                            0 ? (
                                            <List dense>
                                              {quiz.questions.map(
                                                (q, idx) => (
                                                  <Box
                                                    key={q.id || idx}
                                                    sx={{
                                                      width: "100%",
                                                    }}>
                                                    <Box
                                                      sx={{
                                                        display:
                                                          "flex",
                                                        alignItems:
                                                          "flex-start",
                                                        width: "100%",
                                                      }}>
                                                      <ListItem
                                                        sx={{
                                                          flex: 1,
                                                        }}>
                                                        <ListItemIcon>
                                                          <QuizIcon
                                                            fontSize="small"
                                                            color="action"
                                                          />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                          primary={
                                                            q.content ||
                                                            q.questionText ||
                                                            q.title ||
                                                            q.text ||
                                                            `Question ${
                                                              idx + 1
                                                            }`
                                                          }
                                                          secondary={
                                                            q.questionType
                                                              ? q.questionType
                                                                  .replace(
                                                                    "_",
                                                                    " "
                                                                  )
                                                                  .toUpperCase()
                                                              : ""
                                                          }
                                                        />
                                                      </ListItem>
                                                      <Box
                                                        sx={{
                                                          display:
                                                            "flex",
                                                          alignItems:
                                                            "center",
                                                          pr: 2,
                                                        }}>
                                                        <IconButton
                                                          size="small"
                                                          onClick={() =>
                                                            handleOpenQuizEditor(
                                                              lesson.lessonId ||
                                                                lesson.id,
                                                              {
                                                                ...quiz,
                                                                editingQuestion:
                                                                  q,
                                                              }
                                                            )
                                                          }
                                                          title="Edit Question">
                                                          <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                          size="small"
                                                          color="error"
                                                          onClick={async () => {
                                                            if (
                                                              window.confirm(
                                                                "Are you sure you want to delete this question?"
                                                              )
                                                            ) {
                                                              if (
                                                                q.id
                                                              ) {
                                                                const res =
                                                                  await adminService.deleteQuestion(
                                                                    q.id
                                                                  );
                                                                if (
                                                                  !res.success
                                                                ) {
                                                                  alert(
                                                                    res.error ||
                                                                      "Failed to delete question from backend"
                                                                  );
                                                                  return;
                                                                }
                                                              }
                                                              // Remove from local quiz.questions
                                                              const updatedQuizzes =
                                                                lesson.quizzes.map(
                                                                  (
                                                                    quizItem
                                                                  ) =>
                                                                    quizItem ===
                                                                    quiz
                                                                      ? {
                                                                          ...quizItem,
                                                                          questions:
                                                                            quizItem.questions.filter(
                                                                              (
                                                                                qq
                                                                              ) =>
                                                                                qq !==
                                                                                q
                                                                            ),
                                                                        }
                                                                      : quizItem
                                                                );
                                                              // Update lesson in chapterLessons
                                                              let chapterIdWithLesson =
                                                                null;
                                                              let lessonIndex =
                                                                null;
                                                              let lessonsCopy =
                                                                null;
                                                              for (const [
                                                                chapterId,
                                                                lessons,
                                                              ] of Object.entries(
                                                                chapterLessons
                                                              )) {
                                                                const idx =
                                                                  lessons.findIndex(
                                                                    (
                                                                      lessonObj
                                                                    ) =>
                                                                      lessonObj.lessonId ===
                                                                      (lesson.lessonId ||
                                                                        lesson.id)
                                                                  );
                                                                if (
                                                                  idx !==
                                                                  -1
                                                                ) {
                                                                  chapterIdWithLesson =
                                                                    chapterId;
                                                                  lessonIndex =
                                                                    idx;
                                                                  lessonsCopy =
                                                                    [
                                                                      ...lessons,
                                                                    ];
                                                                  break;
                                                                }
                                                              }
                                                              if (
                                                                chapterIdWithLesson &&
                                                                lessonIndex !==
                                                                  null
                                                              ) {
                                                                lessonsCopy[
                                                                  lessonIndex
                                                                ] = {
                                                                  ...lessonsCopy[
                                                                    lessonIndex
                                                                  ],
                                                                  quizzes:
                                                                    updatedQuizzes,
                                                                };
                                                                setChapterLessons(
                                                                  (
                                                                    prev
                                                                  ) => ({
                                                                    ...prev,
                                                                    [chapterIdWithLesson]:
                                                                      lessonsCopy,
                                                                  })
                                                                );
                                                              }
                                                            }
                                                          }}
                                                          title="Delete Question">
                                                          <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                      </Box>
                                                      {/* Answers for this question */}
                                                      <Box
                                                        sx={{
                                                          flex: 1,
                                                          pl: 7,
                                                          pb: 1,
                                                        }}>
                                                        {q.answers &&
                                                        q.answers
                                                          .length >
                                                          0 ? (
                                                          <List dense>
                                                            {q.answers.map(
                                                              (
                                                                a,
                                                                aidx
                                                              ) => (
                                                                <ListItem
                                                                  key={
                                                                    a.id ||
                                                                    aidx
                                                                  }
                                                                  sx={{
                                                                    pl: 0,
                                                                  }}>
                                                                  <ListItemIcon>
                                                                    {a.isCorrect ? (
                                                                      <CheckCircle
                                                                        color="success"
                                                                        fontSize="small"
                                                                      />
                                                                    ) : (
                                                                      <CancelIcon
                                                                        color="disabled"
                                                                        fontSize="small"
                                                                      />
                                                                    )}
                                                                  </ListItemIcon>
                                                                  <ListItemText
                                                                    primary={
                                                                      a.answerText
                                                                    }
                                                                    secondary={
                                                                      a.isCorrect
                                                                        ? "Correct"
                                                                        : ""
                                                                    }
                                                                  />
                                                                </ListItem>
                                                              )
                                                            )}
                                                          </List>
                                                        ) : (
                                                          <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                              pl: 2,
                                                            }}>
                                                            No
                                                            answers.
                                                          </Typography>
                                                        )}
                                                      </Box>
                                                    </Box>
                                                  </Box>
                                                )
                                              )}
                                            </List>
                                          ) : (
                                            <Typography
                                              variant="body2"
                                              color="text.secondary"
                                              sx={{ pl: 2 }}>
                                              No questions yet.
                                            </Typography>
                                          )}
                                        </Box>
                                      ))
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ pl: 2 }}>
                                        No quizzes in this lesson.
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </Box>
                              {/* Quizzes UI under each lesson */}
                              {lesson.quizzes &&
                                lesson.quizzes.length > 0 && (
                                  <Box sx={{ pl: 7, pb: 2 }}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ mb: 1 }}>
                                      Quizzes:
                                    </Typography>
                                    <List dense>
                                      {lesson.quizzes.map((quiz) => (
                                        <Box
                                          key={
                                            quiz.quizId || quiz.id
                                          }>
                                          <ListItem
                                            secondaryAction={
                                              <Box>
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    handleOpenQuizEditor(
                                                      lesson.lessonId ||
                                                        lesson.id,
                                                      quiz
                                                    )
                                                  }>
                                                  <EditIcon />
                                                </IconButton>
                                              </Box>
                                            }>
                                            <ListItemIcon>
                                              <QuizIcon color="secondary" />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={quiz.title}
                                              secondary={`Questions: ${
                                                quiz.questions
                                                  ?.length ??
                                                quiz.questionCount ??
                                                0
                                              }`}
                                            />
                                          </ListItem>
                                          {/* Nested questions list */}
                                          <Box sx={{ pl: 6, pb: 1 }}>
                                            {quiz.questions &&
                                            quiz.questions.length >
                                              0 ? (
                                              <List dense>
                                                {quiz.questions.map(
                                                  (q, idx) => (
                                                    <Box
                                                      key={
                                                        q.id || idx
                                                      }
                                                      sx={{
                                                        display:
                                                          "flex",
                                                        alignItems:
                                                          "flex-start",
                                                        width: "100%",
                                                      }}>
                                                      <ListItem
                                                        sx={{
                                                          flex: 1,
                                                        }}>
                                                        <ListItemIcon>
                                                          <QuizIcon
                                                            fontSize="small"
                                                            color="action"
                                                          />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                          primary={
                                                            q.content ||
                                                            q.questionText ||
                                                            q.title ||
                                                            q.text ||
                                                            `Question ${
                                                              idx + 1
                                                            }`
                                                          }
                                                          secondary={
                                                            q.questionType
                                                              ? q.questionType
                                                                  .replace(
                                                                    "_",
                                                                    " "
                                                                  )
                                                                  .toUpperCase()
                                                              : ""
                                                          }
                                                        />
                                                      </ListItem>
                                                      <Box
                                                        sx={{
                                                          display:
                                                            "flex",
                                                          alignItems:
                                                            "center",
                                                          pr: 2,
                                                        }}>
                                                        <IconButton
                                                          size="small"
                                                          onClick={() =>
                                                            handleOpenQuizEditor(
                                                              lesson.lessonId ||
                                                                lesson.id,
                                                              {
                                                                ...quiz,
                                                                editingQuestion:
                                                                  q,
                                                              }
                                                            )
                                                          }
                                                          title="Edit Question">
                                                          <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                          size="small"
                                                          color="error"
                                                          onClick={async () => {
                                                            if (
                                                              window.confirm(
                                                                "Are you sure you want to delete this question?"
                                                              )
                                                            ) {
                                                              if (
                                                                q.id
                                                              ) {
                                                                const res =
                                                                  await adminService.deleteQuestion(
                                                                    q.id
                                                                  );
                                                                if (
                                                                  !res.success
                                                                ) {
                                                                  alert(
                                                                    res.error ||
                                                                      "Failed to delete question from backend"
                                                                  );
                                                                  return;
                                                                }
                                                              }
                                                              // Remove from local quiz.questions
                                                              const updatedQuizzes =
                                                                lesson.quizzes.map(
                                                                  (
                                                                    quizItem
                                                                  ) =>
                                                                    quizItem ===
                                                                    quiz
                                                                      ? {
                                                                          ...quizItem,
                                                                          questions:
                                                                            quizItem.questions.filter(
                                                                              (
                                                                                qq
                                                                              ) =>
                                                                                qq !==
                                                                                q
                                                                            ),
                                                                        }
                                                                      : quizItem
                                                                );
                                                              // Update lesson in chapterLessons
                                                              let chapterIdWithLesson =
                                                                null;
                                                              let lessonIndex =
                                                                null;
                                                              let lessonsCopy =
                                                                null;
                                                              for (const [
                                                                chapterId,
                                                                lessons,
                                                              ] of Object.entries(
                                                                chapterLessons
                                                              )) {
                                                                const idx =
                                                                  lessons.findIndex(
                                                                    (
                                                                      lessonObj
                                                                    ) =>
                                                                      lessonObj.lessonId ===
                                                                      (lesson.lessonId ||
                                                                        lesson.id)
                                                                  );
                                                                if (
                                                                  idx !==
                                                                  -1
                                                                ) {
                                                                  chapterIdWithLesson =
                                                                    chapterId;
                                                                  lessonIndex =
                                                                    idx;
                                                                  lessonsCopy =
                                                                    [
                                                                      ...lessons,
                                                                    ];
                                                                  break;
                                                                }
                                                              }
                                                              if (
                                                                chapterIdWithLesson &&
                                                                lessonIndex !==
                                                                  null
                                                              ) {
                                                                lessonsCopy[
                                                                  lessonIndex
                                                                ] = {
                                                                  ...lessonsCopy[
                                                                    lessonIndex
                                                                  ],
                                                                  quizzes:
                                                                    updatedQuizzes,
                                                                };
                                                                setChapterLessons(
                                                                  (
                                                                    prev
                                                                  ) => ({
                                                                    ...prev,
                                                                    [chapterIdWithLesson]:
                                                                      lessonsCopy,
                                                                  })
                                                                );
                                                              }
                                                            }
                                                          }}
                                                          title="Delete Question">
                                                          <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                      </Box>
                                                      {/* Answers for this question */}
                                                      <Box
                                                        sx={{
                                                          flex: 1,
                                                          pl: 7,
                                                          pb: 1,
                                                        }}>
                                                        {q.answers &&
                                                        q.answers
                                                          .length >
                                                          0 ? (
                                                          <List dense>
                                                            {q.answers.map(
                                                              (
                                                                a,
                                                                aidx
                                                              ) => (
                                                                <ListItem
                                                                  key={
                                                                    a.id ||
                                                                    aidx
                                                                  }
                                                                  sx={{
                                                                    pl: 0,
                                                                  }}>
                                                                  <ListItemIcon>
                                                                    {a.isCorrect ? (
                                                                      <CheckCircle
                                                                        color="success"
                                                                        fontSize="small"
                                                                      />
                                                                    ) : (
                                                                      <CancelIcon
                                                                        color="disabled"
                                                                        fontSize="small"
                                                                      />
                                                                    )}
                                                                  </ListItemIcon>
                                                                  <ListItemText
                                                                    primary={
                                                                      a.answerText
                                                                    }
                                                                    secondary={
                                                                      a.isCorrect
                                                                        ? "Correct"
                                                                        : ""
                                                                    }
                                                                  />
                                                                </ListItem>
                                                              )
                                                            )}
                                                          </List>
                                                        ) : (
                                                          <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                              pl: 2,
                                                            }}>
                                                            No
                                                            answers.
                                                          </Typography>
                                                        )}
                                                      </Box>
                                                    </Box>
                                                  )
                                                )}
                                              </List>
                                            ) : (
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ pl: 2 }}>
                                                No questions yet.
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      ))}
                                    </List>
                                  </Box>
                                )}
                            </Box>
                          );
                        })}
                    </List>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      py={2}>
                      No lessons yet. Click "Add Lesson" to get
                      started.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </StyledAccordion>
    );
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

  if (!course) {
    return (
      <Container>
        <Alert severity="error">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink
            component="button"
            variant="body1"
            onClick={() => navigate("/admin/courses")}
            sx={{ textDecoration: "none" }}>
            Course Management
          </MuiLink>
          <Typography color="text.primary">
            Content Manager
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 600 }}>
              {course.title}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip label={getCourseTypeLabel(course.courseType)} />
              <Chip
                label={getAgeGroupLabel(course.ageGroup)}
                variant="outlined"
              />
              <Chip
                label={course.isPublished ? "Published" : "Draft"}
                color={course.isPublished ? "success" : "default"}
              />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              {course.description}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate("/admin/courses")}>
              Back to Courses
            </Button>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() =>
                navigate(`/education/courses/${courseId}`)
              }>
              Preview Course
            </Button>
          </Stack>
        </Box>

        {/* Course Progress */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Course Progress
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={
                chapters.length > 0
                  ? (chapters.filter(
                      (ch) =>
                        (chapterLessons[ch.chapterId || ch.id]
                          ?.length || 0) > 0
                    ).length /
                      chapters.length) *
                    100
                  : 0
              }
              sx={{ flex: 1, height: 8, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {chapters.length} chapters •{" "}
              {Object.values(chapterLessons).reduce(
                (total, lessons) => total + lessons.length,
                0
              )}{" "}
              lessons
            </Typography>
          </Box>
        </Paper>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Content Management */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Course Content
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateChapter}>
            Add Chapter
          </Button>
        </Box>

        {chapters.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <ChapterIcon
              sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom>
              No chapters found
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}>
              Start building your course by adding the first chapter
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateChapter}>
              Add Chapter
            </Button>
          </Paper>
        ) : (
          <Box>{chapters.map(renderChapterAccordion)}</Box>
        )}
      </Box>

      {/* Chapter Dialog */}
      <Dialog
        open={showChapterDialog}
        onClose={() => setShowChapterDialog(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>
          {editingItem ? "Edit Chapter" : "Create New Chapter"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              mt: 2,
            }}>
            <TextField
              label="Chapter Title"
              fullWidth
              value={chapterForm.title}
              onChange={(e) =>
                setChapterForm({
                  ...chapterForm,
                  title: e.target.value,
                })
              }
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={chapterForm.description}
              onChange={(e) =>
                setChapterForm({
                  ...chapterForm,
                  description: e.target.value,
                })
              }
            />

            <TextField
              label="Order Index"
              type="number"
              value={chapterForm.orderIndex}
              onChange={(e) =>
                setChapterForm({
                  ...chapterForm,
                  orderIndex: parseInt(e.target.value),
                })
              }
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChapterDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitChapter}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <SaveIcon />
              )
            }>
            {editingItem ? "Update" : "Create"} Chapter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog
        open={showLessonDialog}
        onClose={() => setShowLessonDialog(false)}
        maxWidth="lg"
        fullWidth>
        <DialogTitle>
          {editingItem ? "Edit Lesson" : "Create New Lesson"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              mt: 2,
            }}>
            <TextField
              label="Lesson Title"
              fullWidth
              value={lessonForm.title}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  title: e.target.value,
                })
              }
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={lessonForm.description}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  description: e.target.value,
                })
              }
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={8}
              value={lessonForm.content}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  content: e.target.value,
                })
              }
              placeholder="Enter lesson content, instructions, or embedded media..."
            />
            <TextField
              label="Video URL"
              fullWidth
              value={lessonForm.videoUrl}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  videoUrl: e.target.value,
                })
              }
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Order Index"
                  type="number"
                  fullWidth
                  value={lessonForm.orderIndex}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      orderIndex: parseInt(e.target.value),
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Estimated Duration (minutes)"
                  type="number"
                  fullWidth
                  value={lessonForm.estimatedDuration}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      estimatedDuration: parseInt(e.target.value),
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Lesson Type"
              fullWidth
              value={lessonForm.lessonType}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  lessonType: e.target.value,
                })
              }
            />
            <TextField
              label="Additional Resources"
              fullWidth
              value={lessonForm.additionalResources}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  additionalResources: e.target.value,
                })
              }
            />
            <TextField
              label="Passing Score"
              type="number"
              fullWidth
              value={lessonForm.passingScore}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  passingScore: parseInt(e.target.value),
                })
              }
              inputProps={{ min: 0, max: 100 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLessonDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitLesson}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <SaveIcon />
              )
            }>
            {editingItem ? "Update" : "Create"} Lesson
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog
        open={showQuizDialog}
        onClose={() => setShowQuizDialog(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>
          {editingItem ? "Edit Quiz" : "Create New Quiz"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              mt: 2,
            }}>
            <TextField
              label="Quiz Title"
              fullWidth
              value={quizForm.title}
              onChange={(e) =>
                setQuizForm({ ...quizForm, title: e.target.value })
              }
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={quizForm.description}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  description: e.target.value,
                })
              }
            />

            <TextField
              label="Passing Score (%)"
              type="number"
              value={quizForm.passingScore}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  passingScore: parseInt(e.target.value),
                })
              }
              inputProps={{ min: 0, max: 100 }}
            />

            <Alert severity="info">
              After creating the quiz, you'll be able to add questions
              in the quiz editor.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuizDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitQuiz}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <SaveIcon />
              )
            }>
            {editingItem ? "Update" : "Create"} Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Upload Dialog */}
      <Dialog
        open={showMediaDialog}
        onClose={() => setShowMediaDialog(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>Upload Media</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              mt: 2,
            }}>
            <TextField
              label="Media Title"
              fullWidth
              value={mediaForm.title}
              onChange={(e) =>
                setMediaForm({ ...mediaForm, title: e.target.value })
              }
            />

            <FormControl fullWidth>
              <InputLabel>Media Type</InputLabel>
              <Select
                value={mediaForm.type}
                label="Media Type"
                onChange={(e) =>
                  setMediaForm({ ...mediaForm, type: e.target.value })
                }>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
                <MenuItem value="document">Document</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ mb: 1 }}>
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setMediaForm({
                      ...mediaForm,
                      file: e.target.files[0],
                    })
                  }
                />
              </Button>
              {mediaForm.file && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {mediaForm.file.name}
                </Typography>
              )}
            </Box>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={mediaForm.description}
              onChange={(e) =>
                setMediaForm({
                  ...mediaForm,
                  description: e.target.value,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMediaDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!mediaForm.file || submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <UploadIcon />
              )
            }>
            Upload Media
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Editor Dialog */}
      <Dialog
        open={showQuizEditor}
        onClose={() => setShowQuizEditor(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>
          {quizEditorQuiz ? "Edit Quiz" : "Create Quiz"}
        </DialogTitle>
        <DialogContent>
          <QuizEditor
            quiz={
              quizEditorQuiz
                ? { ...quizEditorQuiz, lessonId: quizEditorLessonId }
                : { lessonId: quizEditorLessonId }
            }
            onSave={async () => {
              setShowQuizEditor(false);
              await refreshLessonQuizzes(quizEditorLessonId);
            }}
            onCancel={() => setShowQuizEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CourseContentManager;

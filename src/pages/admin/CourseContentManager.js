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
  Breadcrumbs,
  Link as MuiLink,
  alpha,
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
  Publish as PublishIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import adminService from "../../services/adminService";
import courseService from "../../services/courseService";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
} from "../../models/courseModels";
import QuizEditor from "../../components/admin/QuizEditor";

// Modern Styled Components
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  overflow: "hidden",
  background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
    borderColor: theme.palette.primary.main,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  "&:before": {
    display: "none",
  },
  "&.Mui-expanded": {
    margin: `${theme.spacing(2)} 0`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
  borderRadius: "0 0 24px 24px",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="36" cy="24" r="5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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

                // Process quizzes - questions should already be included in API response
                quizzes = quizzes.map((quiz) => {
                  // Ensure quiz has proper ID and questions array
                  return {
                    ...quiz,
                    id: quiz.id || quiz.quizId, // Standardize to 'id'
                    questions: quiz.questions || [], // Use existing questions or empty array
                  };
                });

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
      !window.confirm(`Bạn có chắc chắn muốn xóa "${chapter.title}"?`)
    )
      return;

    try {
      setSubmitting(true);
      console.log("Deleting chapter:", chapter);
      console.log("Chapter ID candidates:", {
        chapterId: chapter.chapterId,
        id: chapter.id,
        using: chapter.chapterId || chapter.id,
      });

      const chapterIdToDelete = chapter.chapterId || chapter.id;
      if (!chapterIdToDelete) {
        setError("Không tìm thấy ID của chương để xóa");
        setSubmitting(false);
        return;
      }

      const response = await adminService.deleteChapter(
        chapterIdToDelete
      );

      if (response.success) {
        loadCourseData(); // Refresh data
        alert("✅ Chương đã được xóa thành công!");
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

  // Helper function to check if chapter already has a lesson
  const hasLesson = (chapterId) => {
    const lessons = chapterLessons[chapterId] || [];
    return lessons.length > 0;
  };

  // Helper function to check if lesson already has a quiz
  const hasQuiz = (lesson) => {
    return lesson.quizzes && lesson.quizzes.length > 0;
  };

  // Publish course function
  const handlePublishCourse = async () => {
    try {
      setSubmitting(true);
      const response = await courseService.publishCourse(courseId);
      if (response.success) {
        setCourse((prev) => ({ ...prev, isPublished: true }));
        alert("Khóa học đã được xuất bản thành công!");
      } else {
        alert(response.error || "Không thể xuất bản khóa học");
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Đã xảy ra lỗi khi xuất bản khóa học");
    } finally {
      setSubmitting(false);
    }
  };

  // Lesson management
  const handleCreateLesson = (chapterId) => {
    if (!chapterId) {
      alert(
        "Không có chương nào được chọn hoặc chương chưa được tải."
      );
      return;
    }

    // Check if chapter already has a lesson
    if (hasLesson(chapterId)) {
      alert(
        "Chương này đã có một bài học. Mỗi chương chỉ được phép có một bài học."
      );
      return;
    }

    setSelectedChapter(chapterId);
    setLessonForm({
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
    });
    setEditingItem(null);
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
          "Không có chương hợp lệ nào được chọn. Vui lòng chọn một chương."
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
        setError("Tiêu đề, mô tả và nội dung là bắt buộc.");
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

  // Delete lesson function
  const handleDeleteLesson = async (lesson) => {
    // Check if lesson has quiz first
    if (hasQuiz(lesson)) {
      if (
        !window.confirm(
          `⚠️ CẢNH BÁO: Bài học "${lesson.title}" có chứa quiz. 
        
Việc xóa bài học sẽ xóa luôn quiz và tất cả câu hỏi bên trong.
        
Bạn có chắc chắn muốn xóa bài học này và tất cả nội dung liên quan?`
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          `Bạn có chắc chắn muốn xóa bài học "${lesson.title}"?`
        )
      ) {
        return;
      }
    }

    try {
      setSubmitting(true);
      console.log("Deleting lesson:", lesson.lessonId || lesson.id);

      const response = await adminService.deleteLesson(
        lesson.lessonId || lesson.id
      );

      if (response.success || response.isSuccess) {
        loadCourseData(); // Refresh data
        alert("✅ Bài học đã được xóa thành công!");
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          "Failed to delete lesson";
        console.error("Delete lesson failed:", response);
        setError(`Không thể xóa bài học: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Error deleting lesson:", err);

      // Special handling for common errors
      if (
        err.message.includes("401") ||
        err.message.includes("Unauthorized")
      ) {
        setError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (err.message.includes("404")) {
        setError("Bài học không tồn tại hoặc đã được xóa.");
      } else {
        setError(`Không thể xóa bài học: ${err.message}`);
      }
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

    // Process quizzes - questions should already be included in API response
    quizzes = quizzes.map((quiz) => {
      return {
        ...quiz,
        id: quiz.id || quiz.quizId, // Standardize to 'id'
        questions: quiz.questions || [], // Use existing questions or empty array
      };
    });

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
    const chapterId = chapter.chapterId || chapter.id;
    const lessons = chapterLessons[chapterId] || [];

    console.log(
      "DEBUG: Chapter object in renderChapterAccordion:",
      chapter
    );
    console.log("DEBUG: Chapter properties:", Object.keys(chapter));
    console.log("DEBUG: Using chapterId:", chapterId);
    console.log("DEBUG: UI lessons for chapter", chapterId, lessons);
    return (
      <StyledAccordion
        key={chapterId}
        expanded={expandedChapter === chapterId}
        onChange={() =>
          setExpandedChapter(
            expandedChapter === chapterId ? null : chapterId
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "grab",
                "&:active": {
                  cursor: "grabbing",
                },
              }}>
              <DragHandleIcon color="action" />
              <ChapterIcon color="primary" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Chương {chapter.orderIndex}: {chapter.title}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 2 }}
                  component="span"></Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lessons.length || 0} bài học •
                {lessons.reduce(
                  (sum, l) => sum + (l.quizzes?.length || 0),
                  0
                )}{" "}
                bài kiểm tra •{chapter.media?.length || 0} tài liệu
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {/* Action Buttons - Moved here to avoid nested button issue */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 2,
              justifyContent: "flex-end",
            }}>
            <ActionButton
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => handleEditChapter(chapter)}
              sx={{ minWidth: "auto", px: 1 }}>
              Sửa
            </ActionButton>
            <ActionButton
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteChapter(chapter)}
              sx={{ minWidth: "auto", px: 1 }}>
              Xóa
            </ActionButton>
          </Box>

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
                      Bài học
                    </Typography>
                    <ActionButton
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleCreateLesson(chapterId)}
                      disabled={hasLesson(chapterId)}
                      sx={{
                        background: hasLesson(chapterId)
                          ? "grey.300"
                          : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                        color: "white",
                      }}>
                      {hasLesson(chapterId)
                        ? "Đã có bài học"
                        : "Thêm bài học"}
                    </ActionButton>
                  </Box>

                  {lessons.length > 0 ? (
                    <List dense>
                      {lessons
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((lesson) => {
                          console.log("Lesson object:", lesson);
                          return (
                            <ModernCard
                              key={lesson.lessonId || lesson.id}
                              sx={{ mb: 2 }}>
                              <CardContent>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 2,
                                  }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontWeight: 600, mb: 1 }}>
                                      {lesson.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}>
                                      {lesson.description}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary">
                                      {lesson.estimatedDuration || 10}{" "}
                                      phút •{" "}
                                      {lesson.lessonType || "Text"}
                                    </Typography>
                                  </Box>

                                  <Stack direction="row" spacing={1}>
                                    <ActionButton
                                      size="small"
                                      variant="outlined"
                                      startIcon={<EditIcon />}
                                      onClick={() =>
                                        handleEditLesson(lesson)
                                      }
                                      sx={{ minWidth: "auto" }}>
                                      Sửa
                                    </ActionButton>

                                    <ActionButton
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon />}
                                      onClick={() =>
                                        handleDeleteLesson(lesson)
                                      }
                                      disabled={submitting}
                                      sx={{
                                        minWidth: "auto",
                                        borderColor: "error.main",
                                        "&:hover": {
                                          backgroundColor:
                                            "error.main",
                                          color: "white",
                                        },
                                      }}>
                                      Xóa
                                    </ActionButton>

                                    {hasQuiz(lesson) ? (
                                      <ActionButton
                                        size="small"
                                        variant="contained"
                                        startIcon={<QuizIcon />}
                                        onClick={() => {
                                          const existingQuiz =
                                            lesson.quizzes[0]; // Get first quiz
                                          setQuizEditorLessonId(
                                            lesson.lessonId ||
                                              lesson.id
                                          );
                                          setQuizEditorQuiz(
                                            existingQuiz
                                          );
                                          setShowQuizEditor(true);
                                        }}
                                        sx={{
                                          background:
                                            "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                                          color: "white",
                                        }}>
                                        Xem Quiz
                                      </ActionButton>
                                    ) : (
                                      <ActionButton
                                        size="small"
                                        variant="contained"
                                        startIcon={<QuizIcon />}
                                        onClick={() => {
                                          setQuizEditorLessonId(
                                            lesson.lessonId ||
                                              lesson.id
                                          );
                                          setQuizEditorQuiz(null);
                                          setShowQuizEditor(true);
                                        }}
                                        sx={{
                                          background:
                                            "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                                          color: "white",
                                        }}>
                                        Tạo Quiz
                                      </ActionButton>
                                    )}
                                  </Stack>
                                </Box>

                                {/* Show Quiz Details if exists */}
                                {hasQuiz(lesson) && (
                                  <Box
                                    sx={{
                                      mt: 2,
                                      p: 2,
                                      bgcolor: "grey.50",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "grey.200",
                                    }}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        color: "primary.main",
                                      }}>
                                      📝 Quiz:{" "}
                                      {lesson.quizzes[0]?.title}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}>
                                      {lesson.quizzes[0]?.description}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                      }}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          bgcolor: "primary.main",
                                          color: "white",
                                          px: 1,
                                          py: 0.5,
                                          borderRadius: 1,
                                        }}>
                                        {lesson.quizzes[0]?.questions
                                          ?.length || 0}{" "}
                                        câu hỏi
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          bgcolor: "success.main",
                                          color: "white",
                                          px: 1,
                                          py: 0.5,
                                          borderRadius: 1,
                                        }}>
                                        Điểm đạt:{" "}
                                        {lesson.quizzes[0]
                                          ?.passingScore || 0}
                                        %
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          bgcolor: "warning.main",
                                          color: "white",
                                          px: 1,
                                          py: 0.5,
                                          borderRadius: 1,
                                        }}>
                                        Thời gian:{" "}
                                        {lesson.quizzes[0]
                                          ?.timeLimitMinutes ||
                                          0}{" "}
                                        phút
                                      </Typography>
                                    </Box>
                                  </Box>
                                )}
                              </CardContent>
                            </ModernCard>
                          );
                        })}
                    </List>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      py={2}>
                      Chưa có bài học nào. Hãy bắt đầu bằng cách thêm
                      một bài học.
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
        <Alert severity="error">Không tìm thấy khóa học</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Modern Header */}
      <HeaderSection>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Breadcrumbs
                separator="/"
                sx={{
                  mb: 2,
                  "& .MuiBreadcrumbs-separator": {
                    color: "rgba(255,255,255,0.7)",
                  },
                  "& .MuiLink-root": {
                    color: "rgba(255,255,255,0.9)",
                  },
                  "& .MuiTypography-root": { color: "white" },
                }}>
                <MuiLink
                  component="button"
                  variant="body1"
                  onClick={() => navigate("/admin/courses")}
                  sx={{
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.9)",
                    "&:hover": { color: "white" },
                  }}>
                  Quản lý khóa học
                </MuiLink>
                <Typography color="white" sx={{ fontWeight: 500 }}>
                  Quản lý nội dung
                </Typography>
              </Breadcrumbs>

              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: "white",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}>
                {course.title}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={getCourseTypeLabel(course.courseType)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label={getAgeGroupLabel(course.ageGroup)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label={
                    course.isPublished ? "Đã xuất bản" : "Bản nháp"
                  }
                  sx={{
                    bgcolor: course.isPublished
                      ? "rgba(76,175,80,0.8)"
                      : "rgba(255,193,7,0.8)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </Stack>

              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  color: "white",
                  maxWidth: 600,
                  lineHeight: 1.5,
                }}>
                {course.description}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                <Stack
                  direction={{ xs: "row", md: "column" }}
                  spacing={2}>
                  <ActionButton
                    variant="outlined"
                    startIcon={<BackIcon />}
                    onClick={() => navigate("/admin/courses")}
                    sx={{
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "white",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}>
                    Quay lại khóa học
                  </ActionButton>
                  <ActionButton
                    variant="contained"
                    startIcon={<PreviewIcon />}
                    onClick={() =>
                      navigate(`/education/courses/${courseId}`)
                    }
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.3)",
                      },
                    }}>
                    Xem khóa học
                  </ActionButton>
                  {!course.isPublished && (
                    <ActionButton
                      variant="contained"
                      startIcon={<PublishIcon />}
                      onClick={handlePublishCourse}
                      sx={{
                        bgcolor: "success.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "success.dark",
                        },
                      }}>
                      Xuất bản khóa học
                    </ActionButton>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeaderSection>

      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Content Management */}
        <Box>
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: `1px solid ${alpha("#1976d2", 0.1)}`,
            }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 0.5 }}>
                  Nội dung khóa học
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {chapters.length} chương •{" "}
                  {Object.values(chapterLessons).reduce(
                    (total, lessons) => total + lessons.length,
                    0
                  )}{" "}
                  bài học
                </Typography>
              </Box>
              <ActionButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateChapter}
                sx={{
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  color: "white",
                }}>
                Thêm chương
              </ActionButton>
            </Box>
          </Paper>

          {chapters.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <ChapterIcon
                sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
              />
              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom>
                Chưa tìm thấy chương nào
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}>
                Hãy bắt đầu xây dựng khóa học của bạn bằng cách thêm
                chương đầu tiên
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateChapter}>
                Thêm chương
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
            {editingItem ? "Chỉnh sửa chương" : "Tạo chương mới"}
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
                label="Tiêu đề chương"
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
                label="Mô tả"
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
                label="Thứ tự"
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
              Hủy
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
              {editingItem ? "Cập nhật" : "Tạo"} chương
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
            {editingItem ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
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
                label="Tiêu đề bài học"
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
                label="Mô tả"
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
                label="Nội dung"
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
                placeholder="Nhập nội dung bài học, hướng dẫn hoặc phương tiện đã lưu trữ..."
              />
              <TextField
                label="URL video"
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
                    label="Thứ tự"
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
                    label="Thời gian ước tính (phút)"
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
                label="Loại bài học"
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
                label="Tài liệu thêm"
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
                label="Điểm số đạt được"
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
              Hủy
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
              {editingItem ? "Cập nhật" : "Tạo"} bài học
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
            {editingItem
              ? "Chỉnh sửa bài kiểm tra"
              : "Tạo bài kiểm tra mới"}
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
                label="Tiêu đề bài kiểm tra"
                fullWidth
                value={quizForm.title}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, title: e.target.value })
                }
              />

              <TextField
                label="Mô tả"
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
                label="Điểm số đạt được (%)"
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
                Sau khi tạo bài kiểm tra, bạn sẽ có thể thêm câu hỏi
                trong trình chỉnh sửa bài kiểm tra.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQuizDialog(false)}>
              Hủy
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
              {editingItem ? "Cập nhật" : "Tạo"} bài kiểm tra
            </Button>
          </DialogActions>
        </Dialog>

        {/* Media Upload Dialog */}
        <Dialog
          open={showMediaDialog}
          onClose={() => setShowMediaDialog(false)}
          maxWidth="md"
          fullWidth>
          <DialogTitle>Tải lên tài liệu</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: 2,
              }}>
              <TextField
                label="Tiêu đề tài liệu"
                fullWidth
                value={mediaForm.title}
                onChange={(e) =>
                  setMediaForm({
                    ...mediaForm,
                    title: e.target.value,
                  })
                }
              />

              <FormControl fullWidth>
                <InputLabel>Loại tài liệu</InputLabel>
                <Select
                  value={mediaForm.type}
                  label="Loại tài liệu"
                  onChange={(e) =>
                    setMediaForm({
                      ...mediaForm,
                      type: e.target.value,
                    })
                  }>
                  <MenuItem value="image">Hình ảnh</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="audio">Âm thanh</MenuItem>
                  <MenuItem value="document">Tài liệu</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ mb: 1 }}>
                  Chọn tệp
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
                    Đã chọn: {mediaForm.file.name}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Mô tả"
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
              Hủy
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
              Tải lên tài liệu
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
            {quizEditorQuiz ? "Chỉnh Sửa Quiz" : "Tạo Quiz Mới"}
          </DialogTitle>
          <DialogContent>
            <QuizEditor
              quiz={
                quizEditorQuiz
                  ? {
                      ...quizEditorQuiz,
                      lessonId: quizEditorLessonId,
                    }
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
    </Box>
  );
};

export default CourseContentManager;

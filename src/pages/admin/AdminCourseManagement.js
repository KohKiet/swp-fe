import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Fab,
  Tooltip,
  Stack,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  MenuBook as BookIcon,
  PlayArrow as PlayIcon,
  Publish as PublishIcon,
  UnpublishedOutlined as UnpublishIcon,
  GridView as GridViewIcon,
  ViewList as TableViewIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import adminService from "../../services/adminService";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
  CourseTypeEnum,
  AgeGroupEnum,
  createCourseFormData,
} from "../../models/courseModels";
import courseService from "../../services/courseService";

// Modern Styled Components
const ModernCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 16,
  overflow: "hidden",
  background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
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

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  height: 200,
  overflow: "hidden",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
  },
}));

const StatusBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 12,
  right: 12,
  zIndex: 2,
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: 20,
  padding: "4px 8px",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
}));

const CourseTypeChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 2,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  fontWeight: 600,
  fontSize: "0.75rem",
  "& .MuiChip-icon": {
    color: theme.palette.primary.main,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  overflow: "hidden",
  background: "white",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  padding: theme.spacing(6, 0),
  position: "relative",
  marginBottom: theme.spacing(4),
  borderRadius: "0 0 24px 24px",
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

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[8],
  },
}));

const AdminCourseManagement = () => {
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or table
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null); // Separate state for delete
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0,
  });

  // Form state - only for non-text fields
  const [formData, setFormData] = useState({
    courseType: "BasicAwareness",
    ageGroup: AgeGroupEnum.ADULTS,
    categoryId: "", // Add required CategoryId field
    image: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Categories state for the required CategoryId field
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Direct DOM refs for inputs - completely uncontrolled
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  // Stats calculation
  const stats = useMemo(() => {
    const publishedCount = courses.filter(
      (c) => c.isPublished
    ).length;
    const draftCount = courses.length - publishedCount;
    const totalChapters = courses.reduce(
      (sum, c) => sum + (c.chapters?.length || 0),
      0
    );

    return {
      total: courses.length,
      published: publishedCount,
      draft: draftCount,
      totalChapters,
    };
  }, [courses]);

  // Immediate error clearing - no debounce, no setTimeout violations
  const clearFormErrors = useCallback(() => {
    setFormErrors((prev) => {
      if (prev.title || prev.description) {
        const { title, description, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  // Ultra-fast input handlers - NO debounce, NO setTimeout
  const handleTitleChange = useCallback(() => {
    // Clear errors immediately on input
    clearFormErrors();
  }, [clearFormErrors]);

  const handleDescriptionChange = useCallback(() => {
    // Clear errors immediately on input
    clearFormErrors();
  }, [clearFormErrors]);

  // Optimized handlers for other form fields
  const handleCourseTypeChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, courseType: e.target.value }));
  }, []);

  const handleAgeGroupChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      ageGroup: parseInt(e.target.value),
    }));
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: e.target.value,
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files?.[0] || null,
    }));
  }, []);

  // Validation function that reads directly from DOM
  const validateForm = useCallback(() => {
    const errors = {};
    const titleValue = titleInputRef.current?.value?.trim() || "";
    const descriptionValue =
      descriptionInputRef.current?.value?.trim() || "";

    if (!titleValue) errors.title = "Title is required";
    if (!descriptionValue)
      errors.description = "Description is required";
    if (!formData.categoryId)
      errors.categoryId = "Category is required";

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [formData.categoryId]);

  // Memoized options to prevent re-creation on every render
  const courseTypeOptions = useMemo(
    () => [
      { value: "BasicAwareness", label: "Basic Awareness" },
      { value: "Prevention", label: "Prevention" },
      { value: "Intervention", label: "Intervention" },
      { value: "FamilyEducation", label: "Family Education" },
      { value: "Recovery", label: "Recovery" },
    ],
    []
  );

  const ageGroupOptions = useMemo(
    () => [
      { value: AgeGroupEnum.TEENAGERS, label: "Teenagers (15-21)" },
      { value: AgeGroupEnum.ADULTS, label: "Adults (22-64)" },
    ],
    []
  );

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminService.getCourses(
        pagination.page,
        pagination.pageSize
      );

      if (response.success) {
        setCourses(response.data.data || response.data);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: response.data.pagination.totalPages,
            totalItems: response.data.pagination.totalItems,
          }));
        }
      } else {
        setError(response.error || "Failed to load courses");
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  // Load categories for the required CategoryId field
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await adminService.getCategories();

      if (response.success && response.data) {
        setCategories(response.data);
        // Set default category if available and none selected
        if (response.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({
            ...prev,
            categoryId: response.data[0].id,
          }));
        }
      } else {
        console.warn("Failed to load categories, using empty list");
        setCategories([]);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [formData.categoryId]);

  // Load courses on mount - placed after loadCourses declaration
  useEffect(() => {
    loadCourses();
    loadCategories(); // Load categories for CategoryId dropdown
  }, [loadCourses, loadCategories]);

  const handleMenuClick = useCallback((event, course) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCourse(course);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setSelectedCourse(null);
  }, []);

  const handleCreateCourse = useCallback(() => {
    setShowCreateDialog(true);
    // Reset form state
    setFormData({
      courseType: "BasicAwareness",
      ageGroup: AgeGroupEnum.ADULTS,
      categoryId: "", // Reset categoryId
      image: null,
    });
    setFormErrors({});
    // Clear inputs immediately without setTimeout
    if (titleInputRef.current) titleInputRef.current.value = "";
    if (descriptionInputRef.current)
      descriptionInputRef.current.value = "";
  }, []);

  const handleEditCourse = useCallback(
    (course) => {
      navigate(`/admin/courses/${course.courseId}/edit`);
      handleMenuClose();
    },
    [navigate]
  );

  const handleViewCourse = useCallback(
    (course) => {
      navigate(`/education/courses/${course.courseId}`);
      handleMenuClose();
    },
    [navigate]
  );

  const handleManageContent = useCallback(
    (course) => {
      navigate(`/admin/courses/${course.courseId}/content`);
      handleMenuClose();
    },
    [navigate]
  );

  const handleDeleteCourse = useCallback(() => {
    console.log(
      "handleDeleteCourse called, selectedCourse:",
      selectedCourse
    );
    if (!selectedCourse) {
      console.error("No selectedCourse available");
      return;
    }
    setCourseToDelete(selectedCourse); // Set the course to delete
    setShowDeleteDialog(true);
    handleMenuClose(); // Close menu after setting courseToDelete
  }, [selectedCourse]);

  const handleTogglePublish = useCallback(
    async (course) => {
      try {
        const response = course.isPublished
          ? await courseService.unpublishCourse(course.courseId)
          : await courseService.publishCourse(course.courseId);

        if (response.success) {
          loadCourses(); // Refresh the list
        } else {
          setError("Failed to update course status");
        }
      } catch (err) {
        console.error("Error toggling publish status:", err);
        setError("Failed to update course status");
      }
      handleMenuClose();
    },
    [loadCourses]
  );

  const handleSubmitCreate = useCallback(async () => {
    const { errors, isValid } = validateForm();

    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    // Set submitting immediately for instant UI feedback
    setSubmitting(true);
    setError("");

    // Get values directly from DOM
    const title = titleInputRef.current?.value?.trim() || "";
    const description =
      descriptionInputRef.current?.value?.trim() || "";

    const courseFormData = createCourseFormData({
      Title: title,
      Description: description,
      CourseType: formData.courseType,
      AgeGroup: formData.ageGroup,
      CategoryId: formData.categoryId, // Add required CategoryId
      Image: formData.image,
    });

    try {
      const response = await adminService.createCourse(
        courseFormData
      );

      if (response.success) {
        console.log("Course created successfully:", response.data);

        // Immediate UI update - close dialog first
        setShowCreateDialog(false);
        setSubmitting(false);

        // Reset form efficiently
        setFormData({
          courseType: "BasicAwareness",
          ageGroup: AgeGroupEnum.ADULTS,
          categoryId: categories.length > 0 ? categories[0].id : "", // Reset to first category if available
          image: null,
        });
        setFormErrors({});

        // Clear inputs
        if (titleInputRef.current) titleInputRef.current.value = "";
        if (descriptionInputRef.current)
          descriptionInputRef.current.value = "";

        // Navigate to content management for the new course
        if (response.data.courseId) {
          navigate(
            `/admin/courses/${response.data.courseId}/content`
          );
        } else {
          // Refresh the list if no course ID returned
          loadCourses();
        }
      } else {
        setError(response.error || "Failed to create course");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Error creating course:", err);
      setError(
        err.message || "Failed to create course. Please try again."
      );
      setSubmitting(false);
    }
  }, [formData, validateForm, navigate, loadCourses, categories]);

  const handleConfirmDelete = useCallback(async () => {
    if (!courseToDelete) {
      console.error(
        "No courseToDelete available for delete operation"
      );
      return;
    }

    console.log("Attempting to delete course:", courseToDelete);
    setSubmitting(true);

    try {
      const response = await adminService.deleteCourse(
        courseToDelete.courseId
      );

      if (response.success || response.isSuccess) {
        setShowDeleteDialog(false);
        setCourseToDelete(null); // Clear courseToDelete
        loadCourses(); // Refresh the list
      } else {
        setError(
          response.message ||
            response.error ||
            "Failed to delete course"
        );
        // Don't clear courseToDelete on error, keep dialog open
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      setError("Failed to delete course. Please try again.");
      // Don't clear courseToDelete on error, keep dialog open
    } finally {
      setSubmitting(false);
    }
  }, [courseToDelete, loadCourses]);

  const getStatusChip = useCallback((course) => {
    if (course.isPublished) {
      return (
        <Chip label="Đã xuất bản" color="success" size="small" />
      );
    }
    return <Chip label="Bản nháp" color="default" size="small" />;
  }, []);

  // Memoized course card component to prevent unnecessary re-renders
  const renderCourseCard = useCallback(
    (course) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.courseId}>
        <ModernCard>
          <ImageContainer
            sx={{
              backgroundImage: course.imageUrl
                ? `url(${course.imageUrl})`
                : 'url("https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
            <StatusBadge>{getStatusChip(course)}</StatusBadge>
          </ImageContainer>

          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 2,
                lineHeight: 1.3,
              }}>
              {course.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.6,
                mb: 3,
              }}>
              {course.description}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pt: 1,
              }}></Box>
          </CardContent>

          <CardActions
            sx={{
              justifyContent: "space-between",
              px: 3,
              pb: 3,
              pt: 0,
            }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleManageContent(course)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
                background:
                  "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                  transform: "translateY(-1px)",
                },
              }}>
              Chỉnh Sửa
            </Button>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, course)}
              sx={{
                bgcolor: alpha("#000", 0.04),
                borderRadius: 2,
                "&:hover": {
                  bgcolor: alpha("#000", 0.08),
                  transform: "scale(1.1)",
                },
              }}>
              <MoreVertIcon />
            </IconButton>
          </CardActions>
        </ModernCard>
      </Grid>
    ),
    [getStatusChip, handleManageContent, handleMenuClick]
  );

  const renderTableView = useCallback(
    () => (
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell
                sx={{ color: "white", fontWeight: 600, py: 2 }}>
                Khóa Học
              </TableCell>
              <TableCell
                sx={{ color: "white", fontWeight: 600, py: 2 }}>
                Trạng Thái
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: 600, py: 2 }}>
                Hành Động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course, index) => (
              <TableRow
                key={course.courseId}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: alpha("#f8fafc", 0.5),
                  },
                  "&:hover": {
                    backgroundColor: alpha("#1976d2", 0.08),
                    transform: "scale(1.01)",
                  },
                  transition: "all 0.2s ease",
                }}>
                <TableCell sx={{ py: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}>
                    <Avatar
                      src={course.imageUrl}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {course.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ lineHeight: 1.4 }}>
                        {course.description.substring(0, 60)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  {getStatusChip(course)}
                </TableCell>
                <TableCell align="right" sx={{ py: 2 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, course)}
                    sx={{
                      bgcolor: alpha("#000", 0.04),
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: alpha("#000", 0.08),
                        transform: "scale(1.1)",
                      },
                    }}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    ),
    [courses, getStatusChip, handleMenuClick]
  );

  // Optimized view mode handlers
  const handleGridView = useCallback(() => setViewMode("grid"), []);
  const handleTableView = useCallback(() => setViewMode("table"), []);

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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <HeaderSection>
        <Container>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: "3rem",
                  color: "transparent",
                  background:
                    "linear-gradient(to right, #ffffff, #e0e0e0)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                }}>
                Quản Lý Khóa Học
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  fontSize: "1.5rem",
                  maxWidth: "800px",
                  margin: "0 auto",
                  color: "transparent",
                  background:
                    "linear-gradient(to right, #ffffff, #e0e0e0)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                }}>
                Tạo và quản lý các khóa học giáo dục, chương, bài học
                và bài kiểm tra
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCourse}
              size="large"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: 3,
                px: 4,
                py: 1.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  transform: "translateY(-2px)",
                },
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
              Tạo Khóa Học
            </Button>
          </Box>
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

        {/* Development Notice */}
        {courses.length > 0 &&
          courses[0]?.courseId?.includes("mock") && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}>
              <strong>Chế độ phát triển:</strong> API backend không
              khả dụng. Hiện tại đang hiển thị dữ liệu mẫu cho mục
              đích phát triển.
            </Alert>
          )}

        {/* View Toggle */}
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
              mb: 3,
            }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Thống Kê Khóa Học
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={
                  viewMode === "grid" ? "contained" : "outlined"
                }
                onClick={handleGridView}
                size="small"
                startIcon={<GridViewIcon />}
                sx={{ borderRadius: 2 }}>
                Lưới
              </Button>
              <Button
                variant={
                  viewMode === "table" ? "contained" : "outlined"
                }
                onClick={handleTableView}
                size="small"
                startIcon={<TableViewIcon />}
                sx={{ borderRadius: 2 }}>
                Bảng
              </Button>
            </Stack>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  color: "white",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    transform: "translate(15px, -15px)",
                  },
                }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: "#ffffff",
                  }}>
                  {stats.total}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 1,
                    color: "#ffffff",
                  }}>
                  Tổng Khóa Học
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                  color: "white",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    transform: "translate(15px, -15px)",
                  },
                }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: "#ffffff",
                  }}>
                  {stats.published}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 1,
                    color: "#ffffff",
                  }}>
                  Đã Xuất Bản
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  color: "white",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    transform: "translate(15px, -15px)",
                  },
                }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: "#ffffff",
                  }}>
                  {stats.draft}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 1,
                    color: "#ffffff",
                  }}>
                  Bản Nháp
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
                  color: "white",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    transform: "translate(15px, -15px)",
                  },
                }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: "#ffffff",
                  }}>
                  {stats.totalChapters}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 1,
                    color: "#ffffff",
                  }}>
                  Tổng Chương
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Course List */}
        {courses.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              background: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
            <SchoolIcon
              sx={{ fontSize: 80, color: "grey.300", mb: 3 }}
            />
            <Typography
              variant="h5"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600 }}>
              Không tìm thấy khóa học nào
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 400, mx: "auto" }}>
              Bắt đầu bằng cách tạo khóa học đầu tiên của bạn và bắt
              đầu chia sẻ kiến thức với học viên
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateCourse}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}>
              Tạo Khóa Học Đầu Tiên
            </Button>
          </Paper>
        ) : viewMode === "grid" ? (
          <Grid container spacing={3}>
            {courses.map(renderCourseCard)}
          </Grid>
        ) : (
          renderTableView()
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              mt: 1,
              minWidth: 200,
              border: `1px solid ${alpha("#1976d2", 0.1)}`,
            },
          }}>
          {selectedCourse && (
            <MenuItem
              onClick={() => handleTogglePublish(selectedCourse)}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                "&:hover": {
                  bgcolor: alpha("#1976d2", 0.08),
                },
              }}>
              {selectedCourse.isPublished ? (
                <>
                  <UnpublishIcon sx={{ mr: 2, color: "grey.600" }} />
                  <Typography sx={{ fontWeight: 500 }}>
                    Hủy Xuất Bản
                  </Typography>
                </>
              ) : (
                <>
                  <PublishIcon
                    sx={{ mr: 2, color: "success.main" }}
                  />
                  <Typography sx={{ fontWeight: 500 }}>
                    Xuất Bản
                  </Typography>
                </>
              )}
            </MenuItem>
          )}
          <MenuItem
            onClick={handleDeleteCourse}
            sx={{
              color: "error.main",
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              "&:hover": {
                bgcolor: alpha("#f44336", 0.08),
              },
            }}>
            <DeleteIcon sx={{ mr: 2 }} />
            <Typography sx={{ fontWeight: 500 }}>Xóa</Typography>
          </MenuItem>
        </Menu>

        {/* Create Course Dialog */}
        <Dialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            },
          }}>
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 700,
              py: 3,
            }}>
            ✨ Tạo Khóa Học Mới
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: 2,
              }}>
              {/* Completely uncontrolled input */}
              <TextField
                inputRef={titleInputRef}
                label="Tiêu Đề Khóa Học"
                fullWidth
                onChange={handleTitleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Completely uncontrolled textarea */}
              <TextField
                inputRef={descriptionInputRef}
                label="Mô Tả"
                fullWidth
                multiline
                rows={4}
                onChange={handleDescriptionChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Loại Khóa Học</InputLabel>
                    <Select
                      value={formData.courseType}
                      label="Loại Khóa Học"
                      onChange={handleCourseTypeChange}
                      sx={{ borderRadius: 2 }}>
                      {courseTypeOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Nhóm Tuổi Mục Tiêu</InputLabel>
                    <Select
                      value={formData.ageGroup}
                      label="Nhóm Tuổi Mục Tiêu"
                      onChange={handleAgeGroupChange}
                      sx={{ borderRadius: 2 }}>
                      {ageGroupOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControl
                    fullWidth
                    required
                    error={!!formErrors.categoryId}>
                    <InputLabel>Danh Mục</InputLabel>
                    <Select
                      value={formData.categoryId}
                      label="Danh Mục"
                      onChange={handleCategoryChange}
                      disabled={categoriesLoading}
                      sx={{ borderRadius: 2 }}>
                      {categoriesLoading ? (
                        <MenuItem disabled>
                          Đang tải danh mục...
                        </MenuItem>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <MenuItem
                            key={category.id}
                            value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          Không có danh mục nào
                        </MenuItem>
                      )}
                    </Select>
                    {formErrors.categoryId && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}>
                        {formErrors.categoryId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              <Box
                sx={{
                  p: 3,
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: alpha("#f5f5f5", 0.5),
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: alpha("#1976d2", 0.02),
                  },
                }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "text.primary" }}>
                  Hình Ảnh Khóa Học
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                  }}>
                  Tải Lên Hình Ảnh
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {formData.image && (
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 2,
                      color: "success.main",
                      fontWeight: 600,
                      bgcolor: alpha("#4caf50", 0.1),
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}>
                    ✓ {formData.image.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setShowCreateDialog(false)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                px: 3,
              }}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmitCreate}
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={16} />
                ) : (
                  <AddIcon />
                )
              }
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                background:
                  "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                },
              }}>
              {submitting ? "Đang tạo..." : "Tạo Khóa Học"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setCourseToDelete(null); // Clear courseToDelete when dialog closes
          }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            },
          }}>
          <DialogTitle
            sx={{
              color: "error.main",
              fontWeight: 700,
              py: 3,
            }}>
            🗑️ Xóa Khóa Học
          </DialogTitle>
          <DialogContent sx={{ py: 2, px: 3 }}>
            <Typography sx={{ lineHeight: 1.6 }}>
              Bạn có chắc chắn muốn xóa khóa học{" "}
              <strong>
                "
                {courseToDelete?.title ||
                  courseToDelete?.courseId ||
                  "Unknown Course"}
                "
              </strong>
              ? Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn
              tất cả nội dung liên quan.
            </Typography>

            {/* Debug info only in development and only if courseToDelete is null */}
            {process.env.NODE_ENV === "development" &&
              !courseToDelete && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 2,
                    p: 1,
                    bgcolor: "red.100",
                    borderRadius: 1,
                    display: "block",
                    color: "red",
                  }}>
                  ❌ Error: courseToDelete is null/undefined
                </Typography>
              )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setCourseToDelete(null); // Clear courseToDelete when cancelled
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                px: 3,
              }}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={submitting || !courseToDelete}
              startIcon={
                submitting ? (
                  <CircularProgress size={16} />
                ) : (
                  <DeleteIcon />
                )
              }
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                py: 1.5,
              }}>
              {submitting ? "Đang xóa..." : "Xóa Khóa Học"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for mobile */}
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background:
              "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            boxShadow: "0 8px 20px rgba(25, 118, 210, 0.4)",
            "&:hover": {
              background:
                "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
              transform: "scale(1.1)",
              boxShadow: "0 12px 24px rgba(25, 118, 210, 0.6)",
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onClick={handleCreateCourse}>
          <AddIcon />
        </Fab>
      </Container>
    </Box>
  );
};

export default React.memo(AdminCourseManagement);

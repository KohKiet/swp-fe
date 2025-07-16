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

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
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

  const handleDeleteCourse = useCallback((course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
    handleMenuClose();
  }, []);

  const handleTogglePublish = useCallback(
    async (course) => {
      try {
        const response = await adminService.updateCourse(
          course.courseId,
          {
            isPublished: !course.isPublished,
          }
        );

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
    if (!selectedCourse) return;

    setSubmitting(true);

    try {
      const response = await adminService.deleteCourse(
        selectedCourse.courseId
      );

      if (response.success) {
        setShowDeleteDialog(false);
        loadCourses(); // Refresh the list
      } else {
        setError(response.error || "Failed to delete course");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      setError("Failed to delete course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedCourse, loadCourses]);

  const getStatusChip = useCallback((course) => {
    if (course.isPublished) {
      return <Chip label="Published" color="success" size="small" />;
    }
    return <Chip label="Draft" color="default" size="small" />;
  }, []);

  // Memoized course card component to prevent unnecessary re-renders
  const renderCourseCard = useCallback(
    (course) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.courseId}>
        <StyledCard>
          <Box
            sx={{
              height: 200,
              backgroundImage: course.imageUrl
                ? `url(${course.imageUrl})`
                : 'url("https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}>
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 1,
                p: 0.5,
              }}>
              {getStatusChip(course)}
            </Box>
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
              }}>
              <Chip
                icon={<SchoolIcon />}
                label={getCourseTypeLabel(course.courseType)}
                size="small"
                sx={{ backgroundColor: "rgba(255,255,255,0.9)" }}
              />
            </Box>
          </Box>

          <CardContent sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600 }}>
              {course.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
              {course.description}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip
                label={getAgeGroupLabel(course.ageGroup)}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${course.chapters?.length || 0} chapters`}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Created:{" "}
              {new Date(course.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>

          <CardActions
            sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleManageContent(course)}>
              Manage
            </Button>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, course)}>
              <MoreVertIcon />
            </IconButton>
          </CardActions>
        </StyledCard>
      </Grid>
    ),
    [getStatusChip, handleManageContent, handleMenuClick]
  );

  const renderTableView = useCallback(
    () => (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Age Group</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Chapters</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseId}>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}>
                    <Avatar
                      src={course.imageUrl}
                      sx={{ width: 40, height: 40 }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600 }}>
                        {course.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary">
                        {course.description.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getCourseTypeLabel(course.courseType)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {getAgeGroupLabel(course.ageGroup)}
                </TableCell>
                <TableCell>{getStatusChip(course)}</TableCell>
                <TableCell>{course.chapters?.length || 0}</TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, course)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}>
            Course Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage educational courses, chapters, lessons,
            and quizzes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCourse}
          size="large">
          Create Course
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Development Notice */}
      {courses.length > 0 &&
        courses[0]?.courseId?.includes("mock") && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Development Mode:</strong> The backend API is not
            available. Currently displaying mock data for development
            purposes.
          </Alert>
        )}

      {/* View Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}>
        <Typography variant="h6">
          {courses.length} Course{courses.length !== 1 ? "s" : ""}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant={viewMode === "grid" ? "contained" : "outlined"}
            onClick={handleGridView}
            size="small">
            Grid
          </Button>
          <Button
            variant={viewMode === "table" ? "contained" : "outlined"}
            onClick={handleTableView}
            size="small">
            Table
          </Button>
        </Stack>
      </Box>

      {/* Course List */}
      {courses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <SchoolIcon
            sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
          />
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom>
            No courses found
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}>
            Get started by creating your first course
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCourse}>
            Create Course
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
        onClose={handleMenuClose}>
        <MenuItem onClick={() => handleViewCourse(selectedCourse)}>
          <ViewIcon sx={{ mr: 1 }} />
          View Course
        </MenuItem>
        <MenuItem onClick={() => handleEditCourse(selectedCourse)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Details
        </MenuItem>
        <MenuItem onClick={() => handleManageContent(selectedCourse)}>
          <BookIcon sx={{ mr: 1 }} />
          Manage Content
        </MenuItem>
        {selectedCourse && (
          <MenuItem
            onClick={() => handleTogglePublish(selectedCourse)}>
            {selectedCourse.isPublished ? (
              <>
                <UnpublishIcon sx={{ mr: 1 }} />
                Unpublish
              </>
            ) : (
              <>
                <PublishIcon sx={{ mr: 1 }} />
                Publish
              </>
            )}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => handleDeleteCourse(selectedCourse)}
          sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Course Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
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
              label="Course Title"
              fullWidth
              onChange={handleTitleChange}
              error={!!formErrors.title}
              helperText={formErrors.title}
            />

            {/* Completely uncontrolled textarea */}
            <TextField
              inputRef={descriptionInputRef}
              label="Description"
              fullWidth
              multiline
              rows={4}
              onChange={handleDescriptionChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Course Type</InputLabel>
                  <Select
                    value={formData.courseType}
                    label="Course Type"
                    onChange={handleCourseTypeChange}>
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
                  <InputLabel>Target Age Group</InputLabel>
                  <Select
                    value={formData.ageGroup}
                    label="Target Age Group"
                    onChange={handleAgeGroupChange}>
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
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Category"
                    onChange={handleCategoryChange}
                    disabled={categoriesLoading}>
                    {categoriesLoading ? (
                      <MenuItem disabled>
                        Loading categories...
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
                        No categories available
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

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Course Image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddIcon />}>
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {formData.image && (
                <Typography variant="caption" sx={{ ml: 2 }}>
                  {formData.image.name}
                </Typography>
              )}
            </Box>
          </Box>
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
                <AddIcon />
              )
            }>
            Create Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedCourse?.title}"?
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

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={handleCreateCourse}>
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default React.memo(AdminCourseManagement);

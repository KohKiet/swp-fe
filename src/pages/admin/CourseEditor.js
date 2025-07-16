import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Visibility as PreviewIcon,
} from "@mui/icons-material";
import adminService from "../../services/adminService";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
  CourseTypeEnum,
  AgeGroupEnum,
  createCourseFormData,
} from "../../models/courseModels";

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);

  // State
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseType: "BasicAwareness",
    ageGroup: AgeGroupEnum.ADULTS,
    image: null,
    imageUrl: "",
    isPublished: false,
  });

  const [formErrors, setFormErrors] = useState({});

  // Load course data if editing
  useEffect(() => {
    if (isEditing) {
      loadCourseData();
    }
  }, [courseId, isEditing]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getCourseById(courseId);
      if (response.success) {
        const course = response.data;
        setFormData({
          title: course.title || "",
          description: course.description || "",
          courseType: course.courseType || "BasicAwareness",
          ageGroup:
            typeof course.ageGroup === "string"
              ? course.ageGroup === "Adults"
                ? AgeGroupEnum.ADULTS
                : course.ageGroup === "Teenagers"
                ? AgeGroupEnum.TEENAGERS
                : AgeGroupEnum.ADULTS
              : course.ageGroup || AgeGroupEnum.ADULTS,
          image: null,
          imageUrl: course.imageUrl || "",
          isPublished: course.isPublished || false,
        });
      } else {
        setError(response.error || "Failed to load course data");
      }
    } catch (err) {
      console.error("Error loading course:", err);
      setError("Failed to load course data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");

      const courseFormData = createCourseFormData({
        Title: formData.title,
        Description: formData.description,
        CourseType: formData.courseType,
        AgeGroup: formData.ageGroup,
        Image: formData.image,
        IsPublished: formData.isPublished,
      });

      let response;
      if (isEditing) {
        response = await adminService.updateCourse(
          courseId,
          courseFormData
        );
      } else {
        response = await adminService.createCourse(courseFormData);
      }

      if (response.success) {
        const newCourseId = isEditing
          ? courseId
          : response.data.courseId;
        navigate(`/admin/courses/${newCourseId}/content`);
      } else {
        setError(response.error || "Failed to save course");
      }
    } catch (err) {
      console.error("Error saving course:", err);
      setError("Failed to save course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
            {isEditing ? "Edit Course" : "Create Course"}
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}>
          {isEditing ? "Edit Course" : "Create New Course"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEditing
            ? "Update course information and settings"
            : "Fill in the course details to get started"}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Course Title"
                fullWidth
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                error={!!formErrors.title}
                helperText={formErrors.title}
                placeholder="Enter a descriptive course title"
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Course Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                error={!!formErrors.description}
                helperText={formErrors.description}
                placeholder="Provide a detailed description of what students will learn"
              />
            </Grid>

            {/* Course Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Course Type</InputLabel>
                <Select
                  value={formData.courseType}
                  label="Course Type"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseType: e.target.value,
                    })
                  }>
                  <MenuItem value="BasicAwareness">
                    Basic Awareness
                  </MenuItem>
                  <MenuItem value="Prevention">Prevention</MenuItem>
                  <MenuItem value="Intervention">
                    Intervention
                  </MenuItem>
                  <MenuItem value="RecoverySupport">
                    Recovery Support
                  </MenuItem>
                  <MenuItem value="ProfessionalTraining">
                    Professional Training
                  </MenuItem>
                  <MenuItem value="FamilyEducation">
                    Family Education
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Age Group */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Target Age Group</InputLabel>
                <Select
                  value={formData.ageGroup}
                  label="Target Age Group"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ageGroup: e.target.value,
                    })
                  }>
                  <MenuItem value={AgeGroupEnum.TEENAGERS}>
                    Teenagers (15-21)
                  </MenuItem>
                  <MenuItem value={AgeGroupEnum.ADULTS}>
                    Adults (22-70)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Course Image */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                Course Image
              </Typography>
              <Stack spacing={2}>
                {formData.imageUrl && (
                  <Box
                    component="img"
                    src={formData.imageUrl}
                    alt="Course preview"
                    sx={{
                      width: "100%",
                      maxWidth: 300,
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                )}
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ alignSelf: "flex-start" }}>
                  {formData.imageUrl
                    ? "Change Image"
                    : "Upload Image"}
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
                    color="text.secondary">
                    New image selected: {formData.image.name}
                  </Typography>
                )}
              </Stack>
            </Grid>

            {/* Publish Status */}
            {isEditing && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Publication Status</InputLabel>
                  <Select
                    value={formData.isPublished}
                    label="Publication Status"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.value,
                      })
                    }>
                    <MenuItem value={false}>
                      Draft (Not visible to students)
                    </MenuItem>
                    <MenuItem value={true}>
                      Published (Visible to students)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
        }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/admin/courses")}>
          Back to Courses
        </Button>

        <Stack direction="row" spacing={2}>
          {isEditing && (
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() =>
                navigate(`/education/courses/${courseId}`)
              }>
              Preview Course
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : (
                <SaveIcon />
              )
            }>
            {isEditing ? "Update Course" : "Create Course"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default CourseEditor;

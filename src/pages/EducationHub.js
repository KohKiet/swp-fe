import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
  Paper,
  Fade,
  Grow,
  Skeleton,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Menu,
  MenuList,
  ListItemText,
  Divider,
  Rating,
} from "@mui/material";
import {
  Search as SearchIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Visibility as EyeIcon,
  MenuBook as BookIcon,
  Star as StarIcon,
  School as SchoolIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
  NewReleases as NewIcon,
  Category as CategoryIcon,
  PlayCircle as PlayIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import "./EducationHub.css";
import courseService from "../services/courseService";
import adminService from "../services/adminService";
import {
  AgeGroupEnum,
  CourseTypeEnum,
  getAgeGroupLabel,
  getCourseTypeLabel,
  formatDuration,
  mapCourseTypeFromString,
  mapAgeGroupFromString,
} from "../models/courseModels";

// Styled components for enhanced visual appeal
const StyledHeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  minHeight: "35vh",
  display: "flex",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(4),
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" fill-opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\') repeat',
    opacity: 0.3,
  },
}));

const StyledSearchBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(0, 2, 4, 2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(12px)",
}));

const StyledCourseCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  position: "relative",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[16],
  },
  "&:hover .course-overlay": {
    opacity: 1,
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 180,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)",
  },
}));

const CourseOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.3s ease",
  zIndex: 2,
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& .MuiTab-root": {
    minWidth: 120,
    fontWeight: 600,
    textTransform: "none",
  },
}));

const EducationHub = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const groupParam = queryParams.get("group");

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0,
  });
  const [userProgress, setUserProgress] = useState([]);

  // Load courses when component mounts or filters change
  useEffect(() => {
    loadCourses();
    // Load user progress nếu đã đăng nhập
    courseService
      .getMyProgress()
      .then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setUserProgress(res.data);
        }
      })
      .catch(() => setUserProgress([]));
  }, [pagination.currentPage, searchQuery]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const pageSize = 12;
      const response = await courseService.getPublicCourses(
        searchQuery.trim(),
        pagination.currentPage,
        pageSize
      );
      if (response && response.success && response.data) {
        let coursesData =
          response.data.data ||
          response.data.items ||
          response.data ||
          [];
        setCourses(coursesData);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: response.data.pagination.totalPages || 1,
            totalItems:
              response.data.pagination.totalItems ||
              coursesData.length,
          }));
        }
      } else {
        setError(response?.message || "Failed to load courses");
        setCourses([]);
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const getCourseUrl = (course) => {
    return `/education/courses/${course.courseId}`;
  };

  const getImageUrl = (course) => {
    return (
      course.imageUrl ||
      `https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format`
    );
  };

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

  const renderCourseCard = (course, index) => {
    // Xử lý giá trị
    const duration = formatDuration(course.estimatedDuration);
    const enrollment = course.enrollmentCount;
    const viewCount = course.viewCount;
    const rating = course.rating;
    const chapterCount = course.chapters?.length;
    const authorName = course.authorName;
    // Helper kiểm tra giá trị không hợp lệ
    const isInvalid = (val) => {
      if (typeof val === "string") {
        const lower = val.toLowerCase();
        return lower.includes("nan") || lower.includes("unknown");
      }
      return Number.isNaN(val);
    };
    // Kiểm tra trạng thái học
    const progress = userProgress.find(
      (p) => p.courseId === course.courseId
    );
    let courseButtonLabel = "Bắt đầu học";
    let courseButtonColor = "primary";
    if (progress) {
      if (progress.isCompleted) {
        courseButtonLabel = "Đã học xong";
        courseButtonColor = "success";
      } else {
        courseButtonLabel = "Đang học";
        courseButtonColor = "warning";
      }
    }
    return (
      <Grow in timeout={300 + index * 100} key={course.courseId}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StyledCourseCard>
            <Box position="relative">
              <StyledCardMedia
                image={getImageUrl(course)}
                title={course.title}
              />
              <CourseOverlay className="course-overlay">
                <IconButton
                  component={Link}
                  to={getCourseUrl(course)}
                  sx={{ color: "white" }}>
                  <PlayIcon sx={{ fontSize: 48 }} />
                </IconButton>
              </CourseOverlay>
              {/* Course Type Badge */}
              {!isInvalid(getCourseTypeLabel(course.courseType)) && (
                <Chip
                  icon={getCourseTypeIcon(course.courseType)}
                  label={getCourseTypeLabel(course.courseType)}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    fontWeight: 600,
                  }}
                />
              )}
              {/* Featured Badge */}
              {course.isFeatured && (
                <Chip
                  icon={<StarIcon />}
                  label="Nổi bật"
                  size="small"
                  color="primary"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.3,
                  mb: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                {course.title}
              </Typography>
              {!isInvalid(course.description) && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                  }}>
                  {course.description}
                </Typography>
              )}
              {/* Course Stats */}
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                {duration &&
                  duration !== "0 phút" &&
                  !isInvalid(duration) && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography
                        variant="caption"
                        color="text.secondary">
                        {duration}
                      </Typography>
                    </Box>
                  )}
                {enrollment > 0 && !isInvalid(enrollment) && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <GroupIcon fontSize="small" color="action" />
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      {enrollment}
                    </Typography>
                  </Box>
                )}
                {viewCount > 0 && !isInvalid(viewCount) && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EyeIcon fontSize="small" color="action" />
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      {viewCount}
                    </Typography>
                  </Box>
                )}
              </Stack>
              {/* Rating */}
              {typeof rating === "number" &&
                rating > 0 &&
                !isInvalid(rating) && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2 }}>
                    <Rating
                      value={rating}
                      precision={0.5}
                      size="small"
                      readOnly
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      ({rating?.toFixed(1)})
                    </Typography>
                  </Stack>
                )}
              {/* Age Group & Chapters Info */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {course.ageGroup &&
                  !isInvalid(getAgeGroupLabel(course.ageGroup)) && (
                    <Chip
                      label={getAgeGroupLabel(course.ageGroup)}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                {chapterCount > 0 && !isInvalid(chapterCount) && (
                  <Chip
                    icon={<BookIcon />}
                    label={`${chapterCount} chương`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
              {authorName && !isInvalid(authorName) && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}>
                  bởi {authorName}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ p: 2.5, pt: 0 }}>
              <Button
                component={Link}
                to={getCourseUrl(course)}
                variant="contained"
                fullWidth
                startIcon={<PlayIcon />}
                color={courseButtonColor}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}>
                {courseButtonLabel}
              </Button>
            </CardActions>
          </StyledCourseCard>
        </Grid>
      </Grow>
    );
  };

  const renderLoadingSkeleton = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
        <Card sx={{ height: "100%" }}>
          <Skeleton variant="rectangular" height={180} />
          <CardContent>
            <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Skeleton
                variant="rectangular"
                width={80}
                height={24}
              />
              <Skeleton
                variant="rectangular"
                width={100}
                height={24}
              />
            </Stack>
          </CardContent>
          <CardActions sx={{ p: 2 }}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={36}
            />
          </CardActions>
        </Card>
      </Grid>
    ));

  return (
    <Box>
      {/* Hero Section */}
      <div className="page-header secondary-bg fade-in">
        <div className="container">
          <h1>Trung tâm Giáo dục</h1>
          <p>
            Tài nguyên giáo dục toàn diện về nhận thức về ma túy,
            phòng chống và hỗ trợ phục hồi
          </p>
        </div>
      </div>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Search Only */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "stretch", md: "center" }}>
            <TextField
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery("")}>
                      {" "}
                      <ClearIcon />{" "}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: "100%", md: 300 } }}
            />
          </Stack>
        </Paper>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {/* Course Grid */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            {loading ? (
              renderLoadingSkeleton()
            ) : courses.length > 0 ? (
              courses.map((course, index) =>
                renderCourseCard(course, index)
              )
            ) : (
              <Grid size={{ xs: 12 }}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    backgroundColor: "grey.50",
                  }}>
                  <SchoolIcon
                    sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Không tìm thấy khóa học nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hãy thử điều chỉnh tiêu chí tìm kiếm
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
        {/* Pagination */}
        {courses.length > 0 && pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" sx={{ mb: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default EducationHub;

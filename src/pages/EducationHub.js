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
  Avatar,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
  Paper,
  Fade,
  Grow,
  Skeleton,
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
  Warning as WarningIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import "./EducationHub.css";
import courseService from "../services/courseService";
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
  minHeight: "30vh",
  display: "flex",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  marginBottom: theme.spacing(3),
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
  padding: theme.spacing(2.5),
  margin: theme.spacing(0, 2, 3, 2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[6],
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
}));

const StyledCourseCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  borderRadius: theme.spacing(1.5),
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: theme.shadows[12],
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 160,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)",
  },
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
}));

const EducationHub = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const groupParam = queryParams.get("group");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(
    groupParam || "all"
  );
  const [selectedCourseType, setSelectedCourseType] = useState("all");
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    totalItems: 0,
  });

  // Load courses when component mounts or filters change
  useEffect(() => {
    loadCourses();
  }, [
    selectedAgeGroup,
    selectedCourseType,
    searchQuery,
    pagination.currentPage,
  ]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (searchQuery.trim()) {
        response = await courseService.searchPublicCourses(
          searchQuery,
          pagination.currentPage,
          pagination.pageSize
        );
      } else if (
        selectedAgeGroup !== "all" &&
        selectedAgeGroup !== null
      ) {
        response = await courseService.getPublicCoursesByAge(
          selectedAgeGroup
        );
      } else if (selectedCourseType !== "all") {
        response = await courseService.getPublicCoursesByType(
          selectedCourseType
        );
      } else {
        response = await courseService.getPublicCourses(
          "",
          pagination.currentPage,
          pagination.pageSize
        );
      }

      if (response && response.success && response.data) {
        let coursesData =
          response.data.data ||
          response.data.items ||
          response.data ||
          [];

        coursesData = coursesData.map((course) => ({
          ...course,
          courseType: mapCourseTypeFromString(course.courseType),
          ageGroup: mapAgeGroupFromString(course.ageGroup),
          estimatedDuration: course.estimatedDuration || 0,
          viewCount: course.viewCount || 0,
          chapters: course.chapters || [],
          author: course.authorName
            ? {
                firstName: course.authorName.split(" ")[0] || "",
                lastName:
                  course.authorName.split(" ").slice(1).join(" ") ||
                  "",
              }
            : null,
        }));

        setCourses(coursesData);
        setFilteredCourses(coursesData);

        if (response.data.totalPages) {
          setPagination((prev) => ({
            ...prev,
            totalPages: response.data.totalPages,
            totalItems:
              response.data.totalCount ||
              response.data.totalItems ||
              coursesData.length,
          }));
        }
      } else {
        setCourses([]);
        setFilteredCourses([]);
        setError(
          response?.message ||
            "Không có khóa học nào phù hợp với bộ lọc hiện tại."
        );
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      setCourses([]);
      setFilteredCourses([]);
      setError(
        "Không thể kết nối đến máy chủ. Đảm bảo rằng backend server đang chạy trên cổng 5150."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadCourses();
  };

  const handleAgeGroupChange = (event) => {
    setSelectedAgeGroup(event.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleCourseTypeChange = (event) => {
    setSelectedCourseType(event.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedAgeGroup("all");
    setSelectedCourseType("all");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setTimeout(() => {
      loadCourses();
    }, 100);
  };

  const getCourseUrl = (course) => {
    return `/education/courses/${course.courseId || course.id}`;
  };

  const getImageUrl = (course) => {
    return (
      course.imageUrl ||
      `https://placehold.co/400x200/e8f5e9/2D7DD2?text=${encodeURIComponent(
        course.title
      )}`
    );
  };

  const renderCourseCard = (course, index) => (
    <Grow
      in={true}
      timeout={300 + index * 100}
      key={course.courseId || course.id}>
      <Grid item xs={12} sm={6} md={6} lg={4}>
        <StyledCourseCard>
          <Box position="relative">
            <StyledCardMedia
              image={getImageUrl(course)}
              title={course.title}
            />
            <Box position="absolute" top={12} left={12}>
              <Chip
                label={getCourseTypeLabel(course.courseType)}
                size="small"
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.7rem",
                  height: 24,
                  boxShadow: 2,
                }}
              />
            </Box>
            {course.isFeatured && (
              <Box position="absolute" top={12} right={12}>
                <Chip
                  icon={<StarIcon sx={{ fontSize: 14 }} />}
                  label="Nổi bật"
                  size="small"
                  sx={{
                    backgroundColor: "warning.main",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    height: 24,
                    boxShadow: 2,
                  }}
                />
              </Box>
            )}
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Typography
              variant="subtitle1"
              component="h3"
              gutterBottom
              fontWeight="bold"
              color="text.primary"
              sx={{
                fontSize: "1rem",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
              {course.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.4,
                fontSize: "0.8rem",
              }}>
              {course.description}
            </Typography>

            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              gap={0.5}
              mb={1.5}>
              <Chip
                icon={<TimeIcon sx={{ fontSize: 12 }} />}
                label={formatDuration(course.estimatedDuration)}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: "0.65rem", height: 20 }}
              />
              <Chip
                icon={<GroupIcon sx={{ fontSize: 12 }} />}
                label={getAgeGroupLabel(course.ageGroup)}
                size="small"
                variant="outlined"
                color="secondary"
                sx={{ fontSize: "0.65rem", height: 20 }}
              />
              {course.viewCount > 0 && (
                <Chip
                  icon={<EyeIcon sx={{ fontSize: 12 }} />}
                  label={`${course.viewCount}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 20 }}
                />
              )}
              {course.chapters && course.chapters.length > 0 && (
                <Chip
                  icon={<BookIcon sx={{ fontSize: 12 }} />}
                  label={`${course.chapters.length} chương`}
                  size="small"
                  variant="outlined"
                  color="success"
                  sx={{ fontSize: "0.65rem", height: 20 }}
                />
              )}
            </Stack>

            {course.author && (
              <Box display="flex" alignItems="center" mt={1}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    mr: 1,
                    bgcolor: "primary.light",
                  }}>
                  <SchoolIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem" }}>
                  Bởi: {course.author.firstName}{" "}
                  {course.author.lastName}
                </Typography>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              component={Link}
              to={getCourseUrl(course)}
              variant="contained"
              fullWidth
              size="small"
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: "bold",
                py: 1,
                fontSize: "0.8rem",
                background:
                  "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1976D2 30%, #0097A7 90%)",
                  transform: "translateY(-1px)",
                  boxShadow: 3,
                },
              }}>
              Xem Chi Tiết
            </Button>
          </CardActions>
        </StyledCourseCard>
      </Grid>
    </Grow>
  );

  const renderLoadingSkeleton = () => (
    <Grid container spacing={2}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={6} lg={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={160} />
            <CardContent sx={{ p: 2 }}>
              <Skeleton variant="text" height={24} width="80%" />
              <Skeleton variant="text" height={16} />
              <Skeleton variant="text" height={16} width="60%" />
              <Box mt={1}>
                <Skeleton
                  variant="rounded"
                  height={20}
                  width={60}
                  sx={{ display: "inline-block", mr: 1 }}
                />
                <Skeleton
                  variant="rounded"
                  height={20}
                  width={80}
                  sx={{ display: "inline-block" }}
                />
              </Box>
            </CardContent>
            <CardActions sx={{ p: 2 }}>
              <Skeleton variant="rounded" height={32} width="100%" />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "grey.50" }}>
      {/* Hero Section */}
      <StyledHeroSection>
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 1 }}>
          <Fade in={true} timeout={1000}>
            <Box textAlign="center" color="white">
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                }}>
                Trung Tâm Giáo Dục
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  maxWidth: 600,
                  margin: "0 auto",
                  fontSize: { xs: "1rem", md: "1.25rem" },
                }}>
                Truy cập khóa học và tài nguyên để củng cố kiến thức
                phòng ngừa ma túy
              </Typography>
            </Box>
          </Fade>
        </Container>
      </StyledHeroSection>

      <Container maxWidth="lg">
        {/* Search and Filters */}
        <Fade in={true} timeout={1200}>
          <StyledSearchBox elevation={6}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSearch(e)
                  }
                  disabled={loading}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 1.5 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small">
                  <InputLabel>Độ tuổi</InputLabel>
                  <Select
                    value={selectedAgeGroup}
                    onChange={handleAgeGroupChange}
                    label="Độ tuổi"
                    disabled={loading}
                    sx={{ borderRadius: 1.5 }}>
                    <MenuItem value="all">Tất Cả</MenuItem>
                    {Object.entries(AgeGroupEnum).map(
                      ([key, value]) => (
                        <MenuItem key={key} value={value.toString()}>
                          {getAgeGroupLabel(value)}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small">
                  <InputLabel>Loại khóa học</InputLabel>
                  <Select
                    value={selectedCourseType}
                    onChange={handleCourseTypeChange}
                    label="Loại khóa học"
                    disabled={loading}
                    sx={{ borderRadius: 1.5 }}>
                    <MenuItem value="all">Tất Cả</MenuItem>
                    {Object.entries(CourseTypeEnum).map(
                      ([key, value]) => (
                        <MenuItem key={key} value={value.toString()}>
                          {getCourseTypeLabel(value)}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      minWidth: "auto",
                      px: 2,
                    }}>
                    {loading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <SearchIcon />
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    disabled={loading}
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      minWidth: "auto",
                      px: 1.5,
                    }}>
                    <ClearIcon />
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </StyledSearchBox>
        </Fade>

        {/* Error Alert */}
        {error && (
          <Fade in={true}>
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={loadCourses}>
                  Thử lại
                </Button>
              }
              sx={{ mb: 3, borderRadius: 1.5 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Loading State */}
        {loading && renderLoadingSkeleton()}

        {/* Content */}
        {!loading && !error && (
          <Fade in={true} timeout={800}>
            <Box>
              {filteredCourses.length > 0 ? (
                <>
                  {/* Results Summary */}
                  <Paper
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 1.5,
                      background:
                        "linear-gradient(45deg, #E3F2FD, #F3E5F5)",
                    }}>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      fontWeight="bold"
                      sx={{ fontSize: "0.9rem" }}>
                      <FilterIcon
                        sx={{
                          mr: 1,
                          verticalAlign: "middle",
                          fontSize: 18,
                        }}
                      />
                      Tìm thấy{" "}
                      {pagination.totalItems ||
                        filteredCourses.length}{" "}
                      khóa học
                    </Typography>
                  </Paper>

                  {/* Course Grid */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {filteredCourses.map((course, index) =>
                      renderCourseCard(course, index)
                    )}
                  </Grid>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <Box
                      display="flex"
                      justifyContent="center"
                      mt={3}
                      mb={5}>
                      <Pagination
                        count={pagination.totalPages}
                        page={pagination.currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="medium"
                        variant="outlined"
                        shape="rounded"
                        disabled={loading}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            borderRadius: 1.5,
                            mx: 0.3,
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Fade in={true}>
                  <Paper
                    sx={{
                      textAlign: "center",
                      py: 6,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    }}>
                    <WarningIcon
                      sx={{
                        fontSize: 60,
                        color: "warning.main",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h5"
                      gutterBottom
                      fontWeight="bold"
                      color="text.primary">
                      Không tìm thấy khóa học
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
                      Hãy điều chỉnh tìm kiếm hoặc bộ lọc để tìm thấy
                      những gì bạn đang tìm kiếm.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleClearFilters}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}>
                      Xóa bộ lọc
                    </Button>
                  </Paper>
                </Fade>
              )}
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default EducationHub;
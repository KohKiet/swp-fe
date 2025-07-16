import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Grid,
  LinearProgress,
  Stack,
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Badge,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  School as SchoolIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayIcon,
  MenuBook as BookIcon,
  Quiz as QuizIcon,
  WorkspacePremium as CertificateIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  EmojiEvents as TrophyIcon,
  Visibility as ViewIcon,
  BookmarkBorder as BookmarkIcon,
  NotificationsActive as NotificationIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import courseService from "../services/courseService";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
  formatDuration,
  EnrollmentStatusEnum,
  getEnrollmentStatusLabel,
} from "../models/courseModels";
import CertificateViewer from "./CertificateViewer";

// Styled components
const StyledDashboardCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const ProgressCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: "white",
  marginBottom: theme.spacing(3),
}));

const AchievementCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  borderRadius: theme.spacing(2),
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  borderRadius: theme.spacing(2),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const UserDashboard = () => {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    completedCourses: 0,
    totalStudyTime: 0,
    averageScore: 0,
    certificates: 0,
  });
  const [showCertificateDialog, setShowCertificateDialog] =
    useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState(null);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load user enrollments
      const enrollmentResponse =
        await courseService.getMyEnrollments();
      if (enrollmentResponse?.success && enrollmentResponse.data) {
        setEnrollments(enrollmentResponse.data);

        // Calculate basic stats
        const completed = enrollmentResponse.data.filter(
          (e) => e.status === EnrollmentStatusEnum.COMPLETED
        ).length;

        const totalTime = enrollmentResponse.data.reduce(
          (sum, e) => sum + (e.timeSpentMinutes || 0),
          0
        );

        setStats((prev) => ({
          ...prev,
          totalEnrollments: enrollmentResponse.data.length,
          completedCourses: completed,
          totalStudyTime: totalTime,
          certificates: completed, // Assume certificates equal completed courses
        }));

        // Mock achievements data (could be loaded from API) - moved here to access completed and totalTime
        setAchievements([
          {
            id: 1,
            title: "First Steps",
            description: "Enrolled in your first course",
            icon: SchoolIcon,
            earned: true,
            earnedDate: "2024-01-15",
          },
          {
            id: 2,
            title: "Fast Learner",
            description: "Completed a course in under 2 hours",
            icon: TimerIcon,
            earned: completed > 0,
            earnedDate: completed > 0 ? "2024-01-20" : null,
          },
          {
            id: 3,
            title: "Quiz Master",
            description: "Passed 5 quizzes with 90%+ score",
            icon: QuizIcon,
            earned: false,
            earnedDate: null,
          },
          {
            id: 4,
            title: "Dedicated Student",
            description: "Studied for 10+ hours total",
            icon: TrophyIcon,
            earned: totalTime >= 600, // 10 hours
            earnedDate: totalTime >= 600 ? "2024-01-25" : null,
          },
        ]);
      }

      // Load progress data
      const progressResponse = await courseService.getMyProgress();
      if (progressResponse?.success && progressResponse.data) {
        setProgress(progressResponse.data);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(
        "Failed to load dashboard data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case EnrollmentStatusEnum.COMPLETED:
        return "success";
      case EnrollmentStatusEnum.IN_PROGRESS:
        return "primary";
      case EnrollmentStatusEnum.ENROLLED:
        return "info";
      case EnrollmentStatusEnum.DROPPED:
        return "error";
      case EnrollmentStatusEnum.SUSPENDED:
        return "warning";
      default:
        return "default";
    }
  };

  const getImageUrl = (course) => {
    return (
      course?.imageUrl ||
      `https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop&auto=format`
    );
  };

  const handleContinueLearning = (enrollment) => {
    navigate(`/education/courses/${enrollment.courseId}`);
  };

  const handleViewCertificate = (enrollment) => {
    setSelectedCertificate({
      course: enrollment.course,
      completedAt: enrollment.completedAt,
      courseName: enrollment.course?.title,
      duration: enrollment.course?.estimatedDuration,
      certificateId: `CERT-${enrollment.enrollmentId}`,
    });
    setShowCertificateDialog(true);
  };

  const renderEnrollmentCard = (enrollment) => (
    <Grid
      size={{ xs: 12, md: 6, lg: 4 }}
      key={enrollment.enrollmentId}>
      <StyledDashboardCard>
        <CardMedia
          component="img"
          height="180"
          image={getImageUrl(enrollment.course)}
          alt={enrollment.course?.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600 }}>
            {enrollment.course?.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}>
            {enrollment.course?.description}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label={getEnrollmentStatusLabel(enrollment.status)}
              color={getStatusColor(enrollment.status)}
              size="small"
            />
            <Chip
              label={getCourseTypeLabel(
                enrollment.course?.courseType
              )}
              variant="outlined"
              size="small"
            />
          </Stack>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {enrollment.progress || 0}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={enrollment.progress || 0}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Course Stats */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {formatDuration(enrollment.timeSpentMinutes || 0)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <BookIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {enrollment.course?.chapters?.length || 0} chapters
              </Typography>
            </Box>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Enrolled:{" "}
            {new Date(enrollment.enrolledAt).toLocaleDateString()}
          </Typography>
        </CardContent>

        <CardActions sx={{ p: 2 }}>
          {enrollment.status === EnrollmentStatusEnum.COMPLETED ? (
            <Stack direction="row" spacing={1} width="100%">
              <Button
                variant="outlined"
                startIcon={<CertificateIcon />}
                onClick={() => handleViewCertificate(enrollment)}
                sx={{ flex: 1 }}>
                Certificate
              </Button>
              <Button
                variant="contained"
                startIcon={<ViewIcon />}
                onClick={() => handleContinueLearning(enrollment)}
                sx={{ flex: 1 }}>
                Review
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayIcon />}
              onClick={() => handleContinueLearning(enrollment)}>
              Continue Learning
            </Button>
          )}
        </CardActions>
      </StyledDashboardCard>
    </Grid>
  );

  const renderProgressItem = (progressItem) => (
    <ListItem key={progressItem.progressId}>
      <ListItemIcon>
        {progressItem.isCompleted ? (
          <CheckCircleIcon color="success" />
        ) : (
          <BookIcon color="action" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={progressItem.lesson?.title || "Lesson"}
        secondary={
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption">
              {progressItem.course?.title}
            </Typography>
            <Typography variant="caption">
              {progressItem.percent}% complete
            </Typography>
            <Typography variant="caption">
              {formatDuration(progressItem.timeSpentMinutes || 0)}{" "}
              spent
            </Typography>
          </Stack>
        }
      />
    </ListItem>
  );

  const renderAchievement = (achievement) => {
    const IconComponent = achievement.icon;
    return (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={achievement.id}>
        <AchievementCard
          sx={{ opacity: achievement.earned ? 1 : 0.5 }}>
          <IconComponent sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            {achievement.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {achievement.description}
          </Typography>
          {achievement.earned && (
            <Chip
              label={`Earned ${new Date(
                achievement.earnedDate
              ).toLocaleDateString()}`}
              size="small"
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
              }}
            />
          )}
        </AchievementCard>
      </Grid>
    );
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
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}>
          My Learning Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your progress, manage your courses, and celebrate your
          achievements
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard>
            <SchoolIcon
              sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {stats.totalEnrollments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enrolled Courses
            </Typography>
          </StatsCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard>
            <CheckCircleIcon
              sx={{ fontSize: 40, color: "success.main", mb: 1 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {stats.completedCourses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </StatsCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard>
            <TimerIcon
              sx={{ fontSize: 40, color: "warning.main", mb: 1 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {Math.round(stats.totalStudyTime / 60)}h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Study Time
            </Typography>
          </StatsCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard>
            <CertificateIcon
              sx={{ fontSize: 40, color: "secondary.main", mb: 1 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {stats.certificates}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Certificates
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab
            icon={
              <Badge
                badgeContent={enrollments.length}
                color="primary">
                <SchoolIcon />
              </Badge>
            }
            label="My Courses"
            iconPosition="start"
          />
          <Tab
            icon={<TrendingIcon />}
            label="Progress"
            iconPosition="start"
          />
          <Tab
            icon={
              <Badge
                badgeContent={
                  achievements.filter((a) => a.earned).length
                }
                color="secondary">
                <TrophyIcon />
              </Badge>
            }
            label="Achievements"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {enrollments.length > 0 ? (
            <Grid container spacing={3}>
              {enrollments.map(renderEnrollmentCard)}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <SchoolIcon
                sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
              />
              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom>
                No Enrolled Courses
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}>
                Start your learning journey by enrolling in a course
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/education"
                startIcon={<SchoolIcon />}>
                Browse Courses
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Paper>
            <List>
              {progress.length > 0 ? (
                progress.map(renderProgressItem)
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No progress data available"
                    secondary="Start learning to track your progress"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3}>
            {achievements.map(renderAchievement)}
          </Grid>
        </Box>
      )}

      {/* Enhanced Certificate Dialog */}
      <CertificateViewer
        open={showCertificateDialog}
        onClose={() => setShowCertificateDialog(false)}
        certificate={selectedCertificate}
        userInfo={{
          fullName:
            localStorage.getItem("userFullname") || "Student Name",
          email:
            localStorage.getItem("userEmail") ||
            "student@example.com",
        }}
      />
    </Container>
  );
};

export default UserDashboard;

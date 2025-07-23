import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Paper,
  Button,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Category as CategoryIcon,
  WorkspacePremium as CertificateIcon,
  Timer as TimerIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  TrendingUp as ImprovementIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import CertificateViewer from "./CertificateViewer";
import QuizTimer from "./QuizTimer";

const DemoCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const FeatureHighlight = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  color: "white",
  textAlign: "center",
  borderRadius: theme.spacing(2),
}));

const FeatureDemo = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showQuizTimer, setShowQuizTimer] = useState(false);

  const newFeatures = [
    {
      title: "Category Management System",
      icon: <CategoryIcon />,
      description:
        "Complete CRUD interface for organizing courses by categories",
      highlights: [
        "Admin dashboard for category management",
        "Category filtering in course catalog",
        "Active/inactive status management",
        "Course count tracking per category",
      ],
      status: "✅ Implemented",
      color: "success",
    },
    {
      title: "Enhanced Certificate System",
      icon: <CertificateIcon />,
      description:
        "Professional certificate generation with download options",
      highlights: [
        "Professional certificate design",
        "PDF and image download options",
        "Print functionality",
        "Social sharing capabilities",
        "Certificate ID generation",
      ],
      status: "✅ Implemented",
      color: "success",
    },
    {
      title: "Quiz Timer Enhancement",
      icon: <TimerIcon />,
      description:
        "Visual countdown timer with warning states for quizzes",
      highlights: [
        "Visual countdown display",
        "Warning states (5 min, 2 min)",
        "Auto-submit on time expiration",
        "Multiple display modes (linear, circular, compact)",
        "Pause/resume functionality",
      ],
      status: "✅ Implemented",
      color: "success",
    },
    {
      title: "Advanced Search & Filtering",
      icon: <SearchIcon />,
      description:
        "Enhanced course discovery with multiple filter options",
      highlights: [
        "Category-based filtering",
        "Age group and course type filters",
        "Active filter display with chips",
        "Quick filter clearing",
        "Search term highlighting",
      ],
      status: "✅ Implemented",
      color: "success",
    },
  ];

  const improvements = [
    {
      category: "User Experience",
      items: [
        "Enhanced course catalog with better filtering",
        "Professional certificate generation and download",
        "Visual quiz timer with warning states",
        "Improved navigation and breadcrumbs",
      ],
    },
    {
      category: "Admin Features",
      items: [
        "Complete category management system",
        "Enhanced course organization tools",
        "Better content management workflow",
        "Comprehensive dashboard navigation",
      ],
    },
    {
      category: "Technical Improvements",
      items: [
        "Modern Material-UI components",
        "Responsive design patterns",
        "Better error handling and loading states",
        "Code organization and reusability",
      ],
    },
  ];

  const demoData = {
    certificate: {
      course: {
        title: "Substance Awareness Fundamentals",
        estimatedDuration: 120,
      },
      completedAt: new Date().toISOString(),
      courseName: "Substance Awareness Fundamentals",
      duration: 120,
      certificateId: "DEMO-CERT-2024",
    },
    userInfo: {
      fullName: "Demo Student",
      email: "demo@example.com",
    },
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderOverview = () => (
    <Stack spacing={4}>
      <FeatureHighlight>
        <SchoolIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          LMS Enhancement Summary
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Successfully implemented 4 major feature enhancements
        </Typography>
      </FeatureHighlight>

      <Grid container spacing={3}>
        {newFeatures.map((feature, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <DemoCard>
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6">
                    {feature.title}
                  </Typography>
                  <Chip
                    label={feature.status}
                    color={feature.color}
                    size="small"
                  />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>

                <List dense>
                  {feature.highlights.map((highlight, i) => (
                    <ListItem key={i} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={highlight}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </DemoCard>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );

  const renderImprovements = () => (
    <Stack spacing={3}>
      <Typography variant="h5" gutterBottom>
        System Improvements by Category
      </Typography>

      {improvements.map((category, index) => (
        <Card key={index}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              {category.category}
            </Typography>
            <List>
              {category.items.map((item, i) => (
                <ListItem key={i}>
                  <ListItemIcon>
                    <ImprovementIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  const renderDemos = () => (
    <Stack spacing={4}>
      <Typography variant="h5" gutterBottom>
        Live Feature Demonstrations
      </Typography>

      <Grid container spacing={3}>
        {/* Certificate Demo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DemoCard>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}>
                <CertificateIcon color="primary" />
                <Typography variant="h6">
                  Certificate System
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}>
                Professional certificate generation with download and
                sharing options.
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowCertificate(true)}
                startIcon={<CertificateIcon />}>
                View Sample Certificate
              </Button>
            </CardContent>
          </DemoCard>
        </Grid>

        {/* Quiz Timer Demo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DemoCard>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}>
                <TimerIcon color="primary" />
                <Typography variant="h6">Quiz Timer</Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}>
                Enhanced quiz timer with visual countdown and warning
                states.
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setShowQuizTimer(!showQuizTimer)}
                  startIcon={<TimerIcon />}>
                  {showQuizTimer ? "Hide" : "Show"} Timer Demo
                </Button>

                {showQuizTimer && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      30-minute Quiz Timer (Demo Mode)
                    </Typography>
                    <QuizTimer
                      totalTimeMinutes={30}
                      isActive={true}
                      warningThreshold={25}
                      dangerThreshold={28}
                      onTimeUp={() => console.log("Time's up!")}
                      onWarning={(time) =>
                        console.log("Warning!", time)
                      }
                    />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </DemoCard>
        </Grid>
      </Grid>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>Note:</strong> These are demonstration features. In
          the actual system, they are fully integrated into the course
          learning and admin management workflows.
        </Typography>
      </Alert>
    </Stack>
  );

  const renderImplementationNotes = () => (
    <Stack spacing={3}>
      <Typography variant="h5" gutterBottom>
        Implementation Details
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Technical Stack & Architecture
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" gutterBottom>
                Frontend Technologies
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="React 18+ with Hooks" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Material-UI v5 Components" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="React Router for Navigation" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Styled Components for Theming" />
                </ListItem>
              </List>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" gutterBottom>
                New Dependencies
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="html2canvas - Certificate generation" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="jsPDF - PDF export functionality" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Enhanced MUI components" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            File Structure & Components
          </Typography>

          <Typography
            variant="body2"
            component="pre"
            sx={{
              bgcolor: "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              overflow: "auto",
            }}>
            {`src/
├── components/
│   ├── admin/
│   │   └── CategoryManagement.js     ✨ New
│   ├── CertificateViewer.js          ✨ New  
│   ├── QuizTimer.js                  ✨ New
│   └── UserDashboard.js              🔄 Enhanced
├── pages/
│   ├── EducationHub.js               🔄 Enhanced
│   ├── Dashboard.js                  🔄 Enhanced
│   └── admin/
│       └── ... (existing admin pages)
└── services/
    └── ... (existing services)`}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center">
          LMS Feature Enhancement Demo
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          align="center">
          Comprehensive demonstration of the new features and
          improvements
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Overview" />
          <Tab label="Improvements" />
          <Tab label="Live Demos" />
          <Tab label="Implementation" />
        </Tabs>
      </Box>

      <Box sx={{ minHeight: 400 }}>
        {selectedTab === 0 && renderOverview()}
        {selectedTab === 1 && renderImprovements()}
        {selectedTab === 2 && renderDemos()}
        {selectedTab === 3 && renderImplementationNotes()}
      </Box>

      {/* Certificate Demo Modal */}
      <CertificateViewer
        open={showCertificate}
        onClose={() => setShowCertificate(false)}
        certificate={demoData.certificate}
        userInfo={demoData.userInfo}
      />
    </Container>
  );
};

export default FeatureDemo;

import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  AutoAwesome as AwesomeIcon,
  Palette as PaletteIcon,
  Speed as SpeedIcon,
  Accessibility as AccessibilityIcon,
  Responsive as ResponsiveIcon,
  Animation as AnimationIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[12],
  },
}));

const EducationHubDemo = () => {
  const features = [
    {
      icon: <PaletteIcon />,
      title: "Beautiful Material Design",
      description:
        "Redesigned với Material-UI components cho giao diện hiện đại và nhất quán",
      color: "primary",
    },
    {
      icon: <SpeedIcon />,
      title: "Enhanced Performance",
      description:
        "Tối ưu hóa loading states với skeleton components và lazy loading",
      color: "secondary",
    },
    {
      icon: <ResponsiveIcon />,
      title: "Fully Responsive",
      description:
        "Thiết kế responsive hoàn hảo trên mọi thiết bị từ mobile đến desktop",
      color: "success",
    },
    {
      icon: <AnimationIcon />,
      title: "Smooth Animations",
      description:
        "Hiệu ứng chuyển động mượt mà với Fade, Grow và custom transitions",
      color: "warning",
    },
    {
      icon: <AccessibilityIcon />,
      title: "Accessibility First",
      description:
        "Hỗ trợ đầy đủ các tiêu chuẩn accessibility và keyboard navigation",
      color: "error",
    },
    {
      icon: <AwesomeIcon />,
      title: "Premium Experience",
      description:
        "Glass morphism effects, gradient backgrounds và modern interactions",
      color: "info",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header Section */}
      <GradientPaper
        elevation={8}
        sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}>
          🎨 Education Hub Redesigned
        </Typography>
        <Typography
          variant="h5"
          sx={{ opacity: 0.9, maxWidth: 800, mx: "auto" }}>
          Trải nghiệm giáo dục hoàn toàn mới với Material-UI design
          system
        </Typography>
      </GradientPaper>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <FeatureCard>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip
                    icon={feature.icon}
                    label={feature.title}
                    color={feature.color}
                    variant="filled"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>

      {/* Design Improvements */}
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 3, fontWeight: 600 }}>
          🚀 Key Design Improvements
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="bold">
              Visual Enhancements
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AwesomeIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Gradient hero section với animated particles" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PaletteIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Glass morphism search box với backdrop blur" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AnimationIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Staggered animations cho course cards" />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              gutterBottom
              color="secondary"
              fontWeight="bold">
              User Experience
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon color="secondary" />
                </ListItemIcon>
                <ListItemText primary="Loading skeleton components" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ResponsiveIcon color="secondary" />
                </ListItemIcon>
                <ListItemText primary="Enhanced mobile responsiveness" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessibilityIcon color="secondary" />
                </ListItemIcon>
                <ListItemText primary="Improved accessibility features" />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box textAlign="center">
          <Typography
            variant="h6"
            gutterBottom
            color="text.secondary">
            Khám phá Education Hub mới
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/education"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              background:
                "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              "&:hover": {
                background:
                  "linear-gradient(45deg, #1976D2 30%, #0097A7 90%)",
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}>
            Truy Cập Education Hub
          </Button>
        </Box>
      </Paper>

      {/* Tech Stack */}
      <Paper
        elevation={2}
        sx={{
          mt: 6,
          p: 3,
          background:
            "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          borderRadius: 3,
        }}>
        <Typography
          variant="h6"
          gutterBottom
          textAlign="center"
          fontWeight="bold">
          🛠️ Technology Stack
        </Typography>
        <Box
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          gap={2}
          mt={2}>
          {[
            "Material-UI v5",
            "React 18",
            "CSS3 Animations",
            "Responsive Design",
            "Accessibility",
          ].map((tech) => (
            <Chip
              key={tech}
              label={tech}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: "bold" }}
            />
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default EducationHubDemo;

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  WorkspacePremium as CertificateIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CertificateContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  color: "white",
  textAlign: "center",
  position: "relative",
  minHeight: "600px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  border: `8px solid ${theme.palette.secondary.main}`,
  borderRadius: theme.spacing(2),
  "&::before": {
    content: '""',
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    border: `2px solid ${theme.palette.common.white}`,
    borderRadius: theme.spacing(1),
  },
}));

const CertificateBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: -20,
  right: 20,
  background: theme.palette.secondary.main,
  borderRadius: "50%",
  width: 80,
  height: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `4px solid ${theme.palette.common.white}`,
}));

const WatermarkLogo = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  opacity: 0.1,
  fontSize: "120px",
  zIndex: 0,
}));

const CertificateViewer = ({
  open,
  onClose,
  certificate,
  userInfo = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const certificateRef = useRef(null);

  const defaultUserInfo = {
    fullName: "Student Name",
    email: "student@example.com",
    completionDate: new Date().toISOString(),
  };

  const user = userInfo || defaultUserInfo;
  const courseName =
    certificate?.course?.title ||
    certificate?.courseName ||
    "Course Title";
  const completionDate =
    certificate?.completedAt ||
    certificate?.completionDate ||
    user.completionDate;
  const certificateId =
    certificate?.certificateId || `CERT-${Date.now()}`;
  const duration =
    certificate?.course?.estimatedDuration ||
    certificate?.duration ||
    0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Not specified";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const generateCertificateNumber = () => {
    const date = new Date(completionDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase();
    return `SWP-${year}${month}-${random}`;
  };

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;

    try {
      setLoading(true);

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `certificate-${courseName
          .replace(/\s+/g, "-")
          .toLowerCase()}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsImage = async () => {
    if (!certificateRef.current) return;

    try {
      setLoading(true);

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `certificate-${courseName
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadFormat === "pdf") {
      downloadAsPDF();
    } else {
      downloadAsImage();
    }
  };

  const handlePrint = () => {
    const printContent = certificateRef.current;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
      <html>
        <head>
          <title>Certificate - ${courseName}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${courseName}`,
          text: `I've completed the course "${courseName}" and earned a certificate!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `I've completed the course "${courseName}" and earned a certificate! 🎓`;
      navigator.clipboard.writeText(shareText);
      // You could show a toast notification here
    }
  };

  const renderCertificate = () => (
    <CertificateContainer ref={certificateRef} elevation={0}>
      <WatermarkLogo>
        <SchoolIcon sx={{ fontSize: "inherit" }} />
      </WatermarkLogo>

      <CertificateBadge>
        <CertificateIcon sx={{ fontSize: 40, color: "white" }} />
      </CertificateBadge>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: "bold",
            mb: 1,
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}>
          Certificate of Completion
        </Typography>

        <Typography
          variant="h6"
          sx={{
            opacity: 0.9,
            mb: 4,
            letterSpacing: 1,
          }}>
          Substance Wellness Platform
        </Typography>

        {/* Main Content */}
        <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
          This is to certify that
        </Typography>

        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: "bold",
            mb: 3,
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            borderBottom: "2px solid white",
            pb: 1,
            display: "inline-block",
          }}>
          {user.fullName}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
          has successfully completed the course
        </Typography>

        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontWeight: "600",
            mb: 4,
            fontStyle: "italic",
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
          }}>
          "{courseName}"
        </Typography>

        {/* Course Details */}
        <Grid
          container
          spacing={2}
          sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
          <Grid size={{ xs: 6 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}>
              <CalendarIcon />
              <Box>
                <Typography variant="caption" display="block">
                  Completion Date
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {formatDate(completionDate)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}>
              <SchoolIcon />
              <Box>
                <Typography variant="caption" display="block">
                  Course Duration
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {formatDuration(duration)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Footer */}
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
          Certificate ID: {generateCertificateNumber()}
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 4, maxWidth: 400, mx: "auto" }}>
          <Box textAlign="center">
            <Divider
              sx={{ borderColor: "white", width: 120, mb: 1 }}
            />
            <Typography variant="caption">
              Platform Director
            </Typography>
          </Box>
          <VerifiedIcon sx={{ fontSize: 40, opacity: 0.8 }} />
          <Box textAlign="center">
            <Divider
              sx={{ borderColor: "white", width: 120, mb: 1 }}
            />
            <Typography variant="caption">
              Course Instructor
            </Typography>
          </Box>
        </Stack>
      </Box>
    </CertificateContainer>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: "80vh" },
      }}>
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <CertificateIcon color="primary" />
            <Typography variant="h6">
              Certificate of Completion
            </Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Certificate Preview */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Certificate Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your official certificate of completion
              </Typography>
            </Box>
            {renderCertificate()}
          </Grid>

          {/* Actions & Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Certificate Actions
                </Typography>

                <Stack spacing={2}>
                  {/* Download Options */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Download Format
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label="PDF"
                        variant={
                          downloadFormat === "pdf"
                            ? "filled"
                            : "outlined"
                        }
                        onClick={() => setDownloadFormat("pdf")}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label="Image"
                        variant={
                          downloadFormat === "image"
                            ? "filled"
                            : "outlined"
                        }
                        onClick={() => setDownloadFormat("image")}
                        color="primary"
                        size="small"
                      />
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={
                      loading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <DownloadIcon />
                      )
                    }
                    onClick={handleDownload}
                    disabled={loading}
                    fullWidth>
                    Download Certificate
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    fullWidth>
                    Print Certificate
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                    fullWidth>
                    Share Achievement
                  </Button>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Certificate Details */}
                <Typography variant="h6" gutterBottom>
                  Certificate Details
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      Student
                    </Typography>
                    <Typography variant="body2">
                      {user.fullName}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      Course
                    </Typography>
                    <Typography variant="body2">
                      {courseName}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      Completion Date
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(completionDate)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      Course Duration
                    </Typography>
                    <Typography variant="body2">
                      {formatDuration(duration)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      Certificate ID
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}>
                      {generateCertificateNumber()}
                    </Typography>
                  </Box>
                </Stack>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    This certificate serves as proof of course
                    completion and can be used for professional
                    development or continuing education requirements.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CertificateViewer;

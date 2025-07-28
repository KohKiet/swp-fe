import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import {
  School as SchoolIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

const EmptyState = ({
  title = "Không có dữ liệu",
  message = "Không thể tải thông tin khóa học",
  onRetry = null,
  onGoHome = null,
  isUsingMockData = false,
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      p={3}>
      <Card sx={{ maxWidth: 400, textAlign: "center" }}>
        <CardContent>
          <SchoolIcon
            sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
          />

          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3 }}>
            {message}
          </Typography>

          {isUsingMockData && (
            <Typography
              variant="body2"
              color="warning.main"
              sx={{ mb: 2 }}>
              ⚠️ Đang hiển thị dữ liệu demo do backend không khả dụng
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
            }}>
            {onRetry && (
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={onRetry}>
                Thử lại
              </Button>
            )}

            {onGoHome && (
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={onGoHome}>
                Về trang chủ
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmptyState;

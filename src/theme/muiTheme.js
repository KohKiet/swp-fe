import { createTheme } from "@mui/material/styles";

// Custom Material-UI theme for the Education Hub
const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9C27B0",
      light: "#BA68C8",
      dark: "#7B1FA2",
      contrastText: "#ffffff",
    },
    success: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
    },
    warning: {
      main: "#FF9800",
      light: "#FFB74D",
      dark: "#F57C00",
    },
    error: {
      main: "#F44336",
      light: "#E57373",
      dark: "#D32F2F",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0,0,0,0.05)",
    "0px 4px 8px rgba(0,0,0,0.08)",
    "0px 6px 12px rgba(0,0,0,0.1)",
    "0px 8px 16px rgba(0,0,0,0.12)",
    "0px 10px 20px rgba(0,0,0,0.14)",
    "0px 12px 24px rgba(0,0,0,0.16)",
    "0px 14px 28px rgba(0,0,0,0.18)",
    "0px 16px 32px rgba(0,0,0,0.2)",
    "0px 18px 36px rgba(0,0,0,0.22)",
    "0px 20px 40px rgba(0,0,0,0.24)",
    "0px 22px 44px rgba(0,0,0,0.26)",
    "0px 24px 48px rgba(0,0,0,0.28)",
    "0px 26px 52px rgba(0,0,0,0.3)",
    "0px 28px 56px rgba(0,0,0,0.32)",
    "0px 30px 60px rgba(0,0,0,0.34)",
    "0px 32px 64px rgba(0,0,0,0.36)",
    "0px 34px 68px rgba(0,0,0,0.38)",
    "0px 36px 72px rgba(0,0,0,0.4)",
    "0px 38px 76px rgba(0,0,0,0.42)",
    "0px 40px 80px rgba(0,0,0,0.44)",
    "0px 42px 84px rgba(0,0,0,0.46)",
    "0px 44px 88px rgba(0,0,0,0.48)",
    "0px 46px 92px rgba(0,0,0,0.5)",
    "0px 48px 96px rgba(0,0,0,0.52)",
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 24px",
          fontSize: "1rem",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)",
          },
        },
        containedPrimary: {
          background:
            "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          "&:hover": {
            background:
              "linear-gradient(45deg, #1976D2 30%, #0097A7 90%)",
          },
        },
        containedSecondary: {
          background:
            "linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)",
          "&:hover": {
            background:
              "linear-gradient(45deg, #7B1FA2 30%, #C2185B 90%)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
            },
            "&.Mui-focused": {
              boxShadow: "0px 4px 12px rgba(33, 150, 243, 0.3)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "all 0.3s ease",
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
            },
            "&.Mui-focused": {
              boxShadow: "0px 4px 12px rgba(33, 150, 243, 0.3)",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            borderRadius: 12,
            margin: "0 4px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          animation:
            "skeleton-loading 1.5s ease-in-out infinite alternate",
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default muiTheme;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "./App.css";

// Custom Material-UI Theme
import muiTheme from "./theme/muiTheme";

// Auth Context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import EducationHub from "./pages/EducationHub";
import Counseling from "./pages/Counseling";
import ConsultTime from "./pages/ConsultTime";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import MyAppointments from "./pages/MyAppointments";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ApiTest from "./components/ApiTest";
import CoursePlayer from "./components/CoursePlayer";
import UserDashboard from "./components/UserDashboard";

// Survey Flow Pages
import SurveyEntryPage from "./pages/surveys/SurveyEntryPage";
import TakeSurveyPage from "./pages/surveys/TakeSurveyPage";
import SurveyResultsPage from "./pages/surveys/SurveyResultsPage";
import SurveyHistoryPage from "./pages/surveys/SurveyHistoryPage";
//Events
import EventListPage from "./pages/events/EventListPage";

// Admin Pages
import AdminCourseManagement from "./pages/admin/AdminCourseManagement";
import CourseContentManager from "./pages/admin/CourseContentManager";
import CourseEditor from "./pages/admin/CourseEditor";
import CategoryManagement from "./components/admin/CategoryManagement";
import FeatureDemo from "./components/FeatureDemo";

// Protected route component
const ProtectedRoute = ({ element }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // For dashboard, require admin
  if (isAdmin()) return element;

  // Redirect to login if not authenticated
  return <Navigate to="/login" />;
};

// User protected route component
const UserProtectedRoute = ({ element }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Require any authenticated user
  if (currentUser) return element;

  // Redirect to login if not authenticated
  return <Navigate to="/login" />;
};

// Consultant protected route component
const ConsultantProtectedRoute = ({ element }) => {
  const { currentUser, isConsultant, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Require consultant role
  if (isConsultant()) return element;

  // Redirect to login if not authenticated or not consultant
  return <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/Apitest" element={<ApiTest />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/education" element={<EducationHub />} />
          <Route
            path="/education/courses/:courseId"
            element={<CoursePlayer />}
          />
          <Route
            path="/education/dashboard"
            element={
              <UserProtectedRoute element={<UserDashboard />} />
            }
          />
          <Route path="/counseling" element={<Counseling />} />
          <Route
            path="/consult-time"
            element={
              <ConsultantProtectedRoute element={<ConsultTime />} />
            }
          />

          <Route path="/programs" element={<EventListPage />} />

          {/* Survey Flow Routes */}
          <Route
            path="/surveys"
            element={
              <UserProtectedRoute element={<SurveyEntryPage />} />
            }
          />
          <Route
            path="/surveys/take"
            element={
              <UserProtectedRoute element={<TakeSurveyPage />} />
            }
          />
          <Route
            path="/surveys/results"
            element={
              <UserProtectedRoute element={<SurveyResultsPage />} />
            }
          />
          <Route
            path="/surveys/history"
            element={
              <UserProtectedRoute element={<SurveyHistoryPage />} />
            }
          />
          {/* End Survey Flow */}

          <Route path="/demo" element={<FeatureDemo />} />

          {/* Admin Routes */}
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute element={<AdminCourseManagement />} />
            }
          />
          <Route
            path="/admin/courses/:courseId/content"
            element={
              <ProtectedRoute element={<CourseContentManager />} />
            }
          />
          <Route
            path="/admin/courses/:courseId/edit"
            element={<ProtectedRoute element={<CourseEditor />} />}
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute element={<CategoryManagement />} />
            }
          />
          {/* End Admin Routes */}

          <Route
            path="/profile"
            element={<UserProtectedRoute element={<ProfilePage />} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
          <Route
            path="/my-appointments"
            element={
              <UserProtectedRoute element={<MyAppointments />} />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

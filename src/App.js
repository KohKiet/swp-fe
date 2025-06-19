import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Auth Context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import EducationHub from "./pages/EducationHub";
import Counseling from "./pages/Counseling";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";


// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ApiTest from "./components/ApiTest";

// Survey Flow Pages
import SurveyEntryPage from './pages/surveys/SurveyEntryPage';
import TakeSurveyPage from './pages/surveys/TakeSurveyPage';
import SurveyResultsPage from './pages/surveys/SurveyResultsPage';
import SurveyHistoryPage from './pages/surveys/SurveyHistoryPage';

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
          <Route path="/counseling" element={<Counseling />} />
          {/* Survey Flow Routes */}
          <Route path="/surveys" element={<UserProtectedRoute element={<SurveyEntryPage />} />} />
          <Route path="/surveys/take" element={<UserProtectedRoute element={<TakeSurveyPage />} />} />
          <Route path="/surveys/results" element={<UserProtectedRoute element={<SurveyResultsPage />} />} />
          <Route path="/surveys/history" element={<UserProtectedRoute element={<SurveyHistoryPage />} />} />
          {/* End Survey Flow */}
          
          <Route path="/profile" element={<UserProtectedRoute element={<ProfilePage />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />}
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

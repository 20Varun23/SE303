// All add their page once done
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ExaminerDashboard from "./components/examiner/ExaminerDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import CreateExam from "./components/examiner/CreateExam";
import TakeExam from "./components/student/TakeExam";
import ExamResults from "./components/student/ExamResults";
import Leaderboard from "./components/examiner/Leaderboard";
import ExamReview from "./components/student/ExamReview";
import Analytics from "./components/examiner/Analytics";
import LandingPage from "./components/LandingPage";
import EditQuestions from "./components/examiner/EditQuestions";
import "./styles/index.css";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Landing Page */}
      <Route
        path="/"
        element={
          !user ? (
            <LandingPage />
          ) : (
            <Navigate
              to={
                user.role === "examiner"
                  ? "/examiner/dashboard"
                  : "/student/dashboard"
              }
            />
          )
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" />}
      />

      {/* Examiner Routes */}
      <Route
        path="/examiner/dashboard"
        element={
          <ProtectedRoute requiredRole="examiner">
            <ExaminerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/examiner/create-exam"
        element={
          <ProtectedRoute requiredRole="examiner">
            <CreateExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/examiner/exam/:examId/leaderboard"
        element={
          <ProtectedRoute requiredRole="examiner">
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/examiner/exams/:examId/analytics"
        element={
          <ProtectedRoute requiredRole="examiner">
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/exam/:examId"
        element={
          <ProtectedRoute requiredRole="student">
            <TakeExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute requiredRole="student">
            <ExamResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attempts/:attemptId/review"
        element={
          <ProtectedRoute requiredRole="student">
            <ExamReview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/examiner/exams/:examId/edit"
        element={
          <ProtectedRoute requiredRole="examiner">
            <EditQuestions />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

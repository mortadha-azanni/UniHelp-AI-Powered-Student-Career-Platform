import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHome from './pages/DashboardHome';
import ProfilePage from './pages/ProfilePage';
import GenerateCVPage from './pages/GenerateCVPage';
import ProfileCritiquePage from './pages/ProfileCritiquePage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import RoadmapsPage from './pages/RoadmapsPage';
import CommunityRoadmapsPage from './pages/CommunityRoadmapsPage';
import ProgramsPage from './pages/programs/ProgramsPage';
import ProgramDetailsPage from './pages/programs/ProgramDetailsPage';
// CreateProgramPage removed — programs are now created from Roadmaps
import './App.css';

// Component to handle root navigation
const RootNavigate = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootNavigate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="generate-cv" element={<GenerateCVPage />} />
          <Route path="profile-critique" element={<ProfileCritiquePage />} />
          <Route path="interview-prep" element={<InterviewPrepPage />} />
          <Route path="job-applications" element={<JobApplicationsPage />} />
          <Route path="roadmaps" element={<RoadmapsPage />} />
          <Route path="community-roadmaps" element={<CommunityRoadmapsPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          {/* Programs are created from Roadmaps via 'Sauv. en Programme' button */}
          <Route path="programs/:id" element={<ProgramDetailsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;



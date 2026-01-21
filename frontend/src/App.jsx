import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers'; // ← NEW: User management page
import SurveyList from './pages/SurveyList';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyEdit from './pages/SurveyEdit';
import SurveyRespond from './pages/SurveyRespond';
import SurveyResults from './pages/SurveyResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        {/* ADMIN routes */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute><AdminUsers /></ProtectedRoute>
        } />
        
        <Route path="/surveys" element={
          <ProtectedRoute><SurveyList /></ProtectedRoute>
        } />
        <Route path="/surveys/create" element={
          <ProtectedRoute><SurveyBuilder /></ProtectedRoute>
        } />
        <Route path="/surveys/:id/edit" element={
          <ProtectedRoute><SurveyEdit /></ProtectedRoute>
        } />
        <Route path="/surveys/:id/results" element={
          <ProtectedRoute><SurveyResults /></ProtectedRoute>
        } />
        
        <Route path="/surveys/:id/respond" element={<SurveyRespond />} />
      </Routes>
    </Router>
  );
}

export default App;
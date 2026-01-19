import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard'; // ← NEW
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
        {/*ADMIN dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/surveys" element={
          <ProtectedRoute><SurveyList /></ProtectedRoute>
        } />
        <Route path="/surveys/create" element={
          <ProtectedRoute><SurveyBuilder /></ProtectedRoute>
        } />
        {/* "EDIT" route*/}
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
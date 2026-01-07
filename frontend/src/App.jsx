import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SurveyList from './pages/SurveyList';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyRespond from './pages/SurveyRespond';
import SurveyResults from './pages/SurveyResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/surveys" element={
          <ProtectedRoute>
            <SurveyList />
          </ProtectedRoute>
        } />
        <Route path="/surveys/create" element={
          <ProtectedRoute>
            <SurveyBuilder />
          </ProtectedRoute>
        } />
        <Route path="/surveys/:id/results" element={
          <ProtectedRoute>
            <SurveyResults />
          </ProtectedRoute>
        } />
        
        {/* Public Rout --> Survey Answers */}
        <Route path="/surveys/:id/respond" element={<SurveyRespond />} />
      </Routes>
    </Router>
  );
}

export default App;
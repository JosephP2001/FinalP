import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/surveys" element={<SurveyList />} />
        <Route path="/surveys/create" element={<SurveyBuilder />} />
        <Route path="/surveys/:id/respond" element={<SurveyRespond />} />
        <Route path="/surveys/:id/results" element={<SurveyResults />} />
      </Routes>
    </Router>
  );
}

export default App;
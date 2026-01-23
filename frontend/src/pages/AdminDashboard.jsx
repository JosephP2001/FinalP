import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { authService } from '../services/authService';
import { Shield, FileText, TrendingUp } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0
  });
  const [allSurveys, setAllSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Get all surveys (admin endpoint)
      const response = await api.get('/surveys/admin/all-surveys');
      const surveys = response.data.data || [];
      
      setAllSurveys(surveys);

      // Calculate stats
      const activeSurveys = surveys.filter(s => s.status === 'active').length;
      const totalResponses = surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0);

      setStats({
        totalSurveys: surveys.length,
        totalResponses,
        activeSurveys
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-spin">⚙️</div>
            <p className="text-gray-600">Cargando panel de administración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-red-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Panel de Administrador</h1>
          </div>
          <p className="text-gray-600">Vista completa del sistema de encuestas</p>
        </div>

        {/* Statistics Cards - Only 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Encuestas Totales</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalSurveys}</p>
              </div>
              <div className="p-4 bg-primary-100 rounded-full">
                <FileText className="text-primary-600" size={28} />
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Encuestas Activas</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeSurveys}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <TrendingUp className="text-green-600" size={28} />
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Respuestas</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalResponses}</p>
              </div>
              <div className="p-4 bg-purple-100 rounded-full">
                <TrendingUp className="text-purple-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* All Surveys Table */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Todas las Encuestas ({allSurveys.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Creador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Respuestas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Creación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allSurveys.map((survey) => (
                  <tr key={survey._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {survey.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {survey.creator?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {survey.creator?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        survey.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : survey.status === 'closed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {survey.responseCount || 0}
                      {survey.settings?.maxResponses && ` / ${survey.settings.maxResponses}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {allSurveys.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay encuestas en el sistema
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
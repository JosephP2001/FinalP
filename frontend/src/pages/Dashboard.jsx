/*Rebuilded (DONE)
*Real Stadistics from MongoDB
*/

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { BarChart3, Users, FileText, TrendingUp, Eye, Plus } from 'lucide-react';
import { surveyService } from '../services/surveyService';
import { authService } from '../services/authService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    avgResponseRate: 0
  });
  const [recentSurveys, setRecentSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario actual
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Obtener todas las encuestas del usuario
      const { data: surveys } = await surveyService.getMySurveys();

      // Calcular estadísticas
      const totalSurveys = surveys.length;
      const activeSurveys = surveys.filter(s => s.status === 'active').length;
      const totalResponses = surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0);
      
      // Calcular tasa promedio de respuesta
      const surveysWithMax = surveys.filter(s => s.settings?.maxResponses);
      const avgResponseRate = surveysWithMax.length > 0
        ? surveysWithMax.reduce((sum, s) => {
            const rate = (s.responseCount / s.settings.maxResponses) * 100;
            return sum + rate;
          }, 0) / surveysWithMax.length
        : 0;

      setStats({
        totalSurveys,
        activeSurveys,
        totalResponses,
        avgResponseRate: Math.round(avgResponseRate)
      });

      // Obtener encuestas recientes (últimas 5)
      setRecentSurveys(surveys.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return `Hace ${Math.floor(diffDays / 7)} semanas`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-spin">⚙️</div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="text-gray-600">
            Aquí está el resumen de tus encuestas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Surveys */}
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Encuestas</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalSurveys}</p>
              </div>
              <div className="p-4 bg-primary-100 rounded-full">
                <FileText className="text-primary-600" size={28} />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {stats.activeSurveys} activas
            </div>
          </div>

          {/* Active Surveys */}
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
            <div className="mt-4 text-sm text-gray-500">
              Recopilando respuestas
            </div>
          </div>

          {/* Total Responses */}
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Respuestas</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalResponses}</p>
              </div>
              <div className="p-4 bg-purple-100 rounded-full">
                <Users className="text-purple-600" size={28} />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Datos recopilados
            </div>
          </div>

          {/* Average Response Rate */}
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tasa Promedio</p>
                <p className="text-3xl font-bold text-blue-600">{stats.avgResponseRate}%</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <BarChart3 className="text-blue-600" size={28} />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              De completitud
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/surveys/create">
              <button className="w-full btn-primary flex items-center justify-center space-x-2 py-3">
                <Plus size={20} />
                <span>Nueva Encuesta</span>
              </button>
            </Link>
            <Link to="/surveys">
              <button className="w-full btn-secondary flex items-center justify-center space-x-2 py-3">
                <FileText size={20} />
                <span>Ver Todas</span>
              </button>
            </Link>
            <button className="w-full btn-secondary flex items-center justify-center space-x-2 py-3">
              <BarChart3 size={20} />
              <span>Estadísticas</span>
            </button>
          </div>
        </div>

        {/* Recent Surveys */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Encuestas Recientes</h2>
            <Link to="/surveys" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
              Ver todas →
            </Link>
          </div>

          {recentSurveys.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 mb-4">Aún no tienes encuestas</p>
              <Link to="/surveys/create">
                <button className="btn-primary">Crear tu primera encuesta</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSurveys.map((survey) => (
                <div 
                  key={survey._id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800">{survey.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        survey.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : survey.status === 'closed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {survey.status === 'active' ? 'Activa' : survey.status === 'closed' ? 'Cerrada' : 'Borrador'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📊 {survey.responseCount || 0} respuestas</span>
                      <span>📝 {survey.questions?.length || 0} preguntas</span>
                      <span>🕒 {getTimeAgo(survey.createdAt)}</span>
                    </div>
                  </div>
                  <Link to={`/surveys/${survey._id}/results`}>
                    <button className="btn-secondary flex items-center space-x-2">
                      <Eye size={18} />
                      <span>Ver</span>
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
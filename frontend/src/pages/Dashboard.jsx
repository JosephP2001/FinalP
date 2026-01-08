import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { FileText, CheckCircle, TrendingUp, Plus } from 'lucide-react';
import { surveyService } from '../services/surveyService';
import { authService } from '../services/authService';

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    responseRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener encuestas del usuario
      const response = await surveyService.getMySurveys();
      const surveysData = response.data || [];
      
      setSurveys(surveysData);
      
      // Calcular estadísticas reales
      const totalResponses = surveysData.reduce(
        (sum, survey) => sum + (survey.responseCount || 0), 
        0
      );
      
      const activeSurveys = surveysData.filter(s => s.status === 'active').length;
      
      const totalMaxResponses = surveysData.reduce(
        (sum, survey) => sum + (survey.settings?.maxResponses || 100),
        0
      );
      
      const responseRate = totalMaxResponses > 0 
        ? Math.round((totalResponses / totalMaxResponses) * 100)
        : 0;

      setStats({
        totalSurveys: surveysData.length,
        activeSurveys,
        totalResponses,
        responseRate
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    { 
      icon: FileText, 
      label: 'Total Encuestas', 
      value: stats.totalSurveys.toString(), 
      subtext: `${stats.activeSurveys} activas`,
      color: 'bg-blue-500' 
    },
    { 
      icon: CheckCircle, 
      label: 'Respuestas Totales', 
      value: stats.totalResponses.toString(), 
      subtext: 'Respuestas recibidas',
      color: 'bg-green-500' 
    },
    { 
      icon: TrendingUp, 
      label: 'Tasa de Respuesta', 
      value: `${stats.responseRate}%`, 
      subtext: 'Del total esperado',
      color: 'bg-purple-500' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenido, {user?.name || 'Usuario'} 👋
          </h1>
          <p className="text-gray-600">
            Aquí está el resumen de tus encuestas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`${stat.color.replace('bg-', 'text-')} w-6 h-6`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Recent Surveys Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Encuestas Recientes</h2>
            <Link to="/surveys/create">
              <button className="btn-primary flex items-center space-x-2">
                <Plus size={20} />
                <span>Nueva Encuesta</span>
              </button>
            </Link>
          </div>

          {surveys.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No tienes encuestas aún
              </h3>
              <p className="text-gray-500 mb-6">
                Crea tu primera encuesta para comenzar a recolectar datos
              </p>
              <Link to="/surveys/create">
                <button className="btn-primary">
                  Crear Primera Encuesta
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Título</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Respuestas</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.slice(0, 5).map((survey) => {
                    const maxResponses = survey.settings?.maxResponses || 100;
                    const percentage = Math.round((survey.responseCount / maxResponses) * 100);
                    
                    return (
                      <tr key={survey._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-800">{survey.title}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            survey.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : survey.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {survey.status === 'active' ? 'Activa' : 
                             survey.status === 'draft' ? 'Borrador' : 'Cerrada'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <span className="text-gray-800 font-medium">
                              {survey.responseCount || 0} / {maxResponses}
                            </span>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-primary-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {new Date(survey.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-4 px-4">
                          <Link to={`/surveys/${survey._id}/results`}>
                            <button className="text-primary-600 hover:text-primary-700 font-medium">
                              Ver
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
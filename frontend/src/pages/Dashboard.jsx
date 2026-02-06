import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react";
import { surveyService } from "../services/surveyService";
import { authService } from "../services/authService";
import {
  StatsCardSkeleton,
  RecentSurveySkeleton,
} from "../components/common/Skeleton";
import StatsCard from "../components/common/StatsCard";
import { getGreeting, getTimeAgo } from "../utils";
import { getFirstName, calculateAverageResponseRate } from "../utils";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    avgResponseRate: 0,
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

      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      const { data: surveys } = await surveyService.getMySurveys();

      const totalSurveys = surveys.length;
      const activeSurveys = surveys.filter((s) => s.status === "active").length;
      const totalResponses = surveys.reduce(
        (sum, s) => sum + (s.responseCount || 0),
        0,
      );
      const avgResponseRate = calculateAverageResponseRate(surveys);

      setStats({
        totalSurveys,
        activeSurveys,
        totalResponses,
        avgResponseRate,
      });

      setRecentSurveys(surveys.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {getGreeting()}, {getFirstName(user?.name)} 👋
              </h1>
              <p className="text-gray-600">
                Aquí está el resumen de tus encuestas
              </p>
            </>
          )}
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              icon={FileText}
              label="Total Encuestas"
              value={stats.totalSurveys}
              subtitle={`${stats.activeSurveys} activas`}
              color="primary"
            />

            <StatsCard
              icon={TrendingUp}
              label="Encuestas Activas"
              value={stats.activeSurveys}
              subtitle="Recopilando respuestas"
              color="green"
            />

            <StatsCard
              icon={Users}
              label="Total Respuestas"
              value={stats.totalResponses}
              subtitle="Datos recopilados"
              color="purple"
            />

            <StatsCard
              icon={BarChart3}
              label="Tasa Promedio"
              value={`${stats.avgResponseRate}%`}
              subtitle="De completitud"
              color="blue"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Recent Surveys */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Encuestas Recientes
            </h2>
            <Link
              to="/surveys"
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <RecentSurveySkeleton count={5} />
          ) : recentSurveys.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 mb-4">Aún no tienes encuestas</p>
              <Link to="/surveys/create">
                <button className="btn-primary">
                  Crear tu primera encuesta
                </button>
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
                      <h3 className="font-semibold text-gray-800">
                        {survey.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          survey.status === "active"
                            ? "bg-green-100 text-green-700"
                            : survey.status === "closed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {survey.status === "active"
                          ? "Activa"
                          : survey.status === "closed"
                            ? "Cerrada"
                            : "Borrador"}
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

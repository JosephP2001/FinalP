import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Search, Plus, Eye, Edit, Share2, Trash2, Copy } from 'lucide-react';
import { surveyService } from '../services/surveyService';
import { CardSkeleton } from '../components/common/Skeleton';

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadSurveys();
  }, []);

  useEffect(() => {
    filterSurveys();
  }, [surveys, searchTerm, statusFilter]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await surveyService.getMySurveys();
      setSurveys(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar encuestas');
    } finally {
      setLoading(false);
    }
  };

  const filterSurveys = () => {
    let filtered = surveys;

    if (searchTerm) {
      filtered = filtered.filter(survey =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(survey => survey.status === statusFilter);
    }

    setFilteredSurveys(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta encuesta?')) return;

    try {
      await surveyService.deleteSurvey(id);
      setSurveys(surveys.filter(s => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar encuesta');
    }
  };

  const copyShareLink = (id) => {
    const link = `${window.location.origin}/surveys/${id}/respond`;
    navigator.clipboard.writeText(link);
    alert('¡Enlace copiado al portapapeles!');
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'ACTIVA' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'CERRADA' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'BORRADOR' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Encuestas</h1>
            <p className="text-gray-600">
              {surveys.length} {surveys.length === 1 ? 'encuesta' : 'encuestas'} creadas
            </p>
          </div>
          <Link to="/surveys/create">
            <button className="btn-primary flex items-center space-x-2">
              <Plus size={20} />
              <span>Crear Nueva Encuesta</span>
            </button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="🔍 Buscar encuestas..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input-field w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="closed">Cerradas</option>
            <option value="draft">Borradores</option>
          </select>
        </div>

        {/* Loading State with Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredSurveys.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron encuestas'
                : 'Aún no tienes encuestas'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta con otros filtros'
                : 'Crea tu primera encuesta para comenzar'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/surveys/create">
                <button className="btn-primary">
                  + Crear Nueva Encuesta
                </button>
              </Link>
            )}
          </div>
        ) : (
          /* Survey Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSurveys.map((survey) => {
              const percentage = survey.settings?.maxResponses 
                ? Math.round((survey.responseCount / survey.settings.maxResponses) * 100)
                : 0;

              return (
                <div key={survey._id} className="card hover:shadow-lg transition-shadow">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    {getStatusBadge(survey.status)}
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(survey.createdAt)}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {survey.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {survey.description || 'Sin descripción'}
                  </p>

                  {/* Stats */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Respuestas</p>
                        <p className="text-lg font-bold text-gray-800">
                          {survey.responseCount || 0}
                          {survey.settings?.maxResponses && ` / ${survey.settings.maxResponses}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Preguntas</p>
                        <p className="text-lg font-bold text-gray-800">
                          {survey.questions?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {survey.settings?.maxResponses && (
                      <>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Progreso</span>
                          <span className="text-gray-600 font-semibold">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              survey.status === 'active' ? 'bg-primary-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/surveys/${survey._id}/results`} className="flex-1">
                      <button className="btn-primary w-full flex items-center justify-center space-x-2">
                        <Eye size={18} />
                        <span>Resultados</span>
                      </button>
                    </Link>
                    
                    <button 
                      onClick={() => copyShareLink(survey._id)}
                      className="btn-secondary px-4 flex items-center justify-center"
                      title="Copiar enlace para compartir"
                    >
                      <Copy size={18} />
                    </button>

                    {survey.status === 'draft' && (
                      <Link to={`/surveys/${survey._id}/edit`}>
                        <button className="btn-secondary px-4 flex items-center justify-center">
                          <Edit size={18} />
                        </button>
                      </Link>
                    )}

                    <button 
                      onClick={() => handleDelete(survey._id)}
                      className="btn-secondary px-4 flex items-center justify-center text-red-600 hover:bg-red-50"
                      title="Eliminar encuesta"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Create New Card - Solo si hay encuestas */}
            {filteredSurveys.length > 0 && (
              <Link to="/surveys/create">
                <div className="card border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors cursor-pointer">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Crear Nueva Encuesta
                    </h3>
                    <p className="text-gray-500">
                      Comienza a recolectar datos valiosos
                    </p>
                    <button className="btn-primary mt-4">
                      + Nueva Encuesta
                    </button>
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyList;
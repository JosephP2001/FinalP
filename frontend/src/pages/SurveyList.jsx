import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Search, Plus, Eye, Edit, Share2, Copy } from 'lucide-react';

const SurveyList = () => {
  const surveys = [
    {
      id: 1,
      title: 'Evaluación Docente Semestre 2024-2',
      description: 'Encuesta para evaluar el desempeño docente en la Facultad de Ingeniería',
      status: 'active',
      responses: 234,
      maxResponses: 300,
      percentage: 78,
      createdAt: 'Hace 2 días'
    },
    {
      id: 2,
      title: 'Satisfacción Servicios Estudiantiles',
      description: 'Evaluar la calidad de servicios: biblioteca, cafetería, atención estudiantil',
      status: 'active',
      responses: 156,
      maxResponses: 200,
      percentage: 78,
      createdAt: 'Hace 5 días'
    },
    {
      id: 3,
      title: 'Infraestructura y Equipamiento',
      description: 'Evaluación de aulas, laboratorios y espacios comunes',
      status: 'closed',
      responses: 89,
      maxResponses: 100,
      percentage: 89,
      createdAt: 'Hace 2 semanas'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Encuestas</h1>
            <p className="text-gray-600">Gestiona y visualiza todas tus encuestas</p>
          </div>
          <Link to="/surveys/create">
            <button className="btn-primary flex items-center space-x-2">
              <Plus size={20} />
              <span>Crear Nueva Encuesta</span>
            </button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="🔍 Buscar encuestas..."
              className="input-field pl-10"
            />
          </div>
          <select className="input-field w-48">
            <option>Todas</option>
            <option>Activas</option>
            <option>Cerradas</option>
            <option>Borradores</option>
          </select>
        </div>

        {/* Survey Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {surveys.map((survey) => (
            <div key={survey.id} className="card">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  survey.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {survey.status === 'active' ? 'ACTIVA' : 'CERRADA'}
                </span>
                <span className="text-sm text-gray-500">{survey.createdAt}</span>
              </div>

              {/* Title and Description */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {survey.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {survey.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">
                    📊 Respuestas: <strong>{survey.responses} / {survey.maxResponses}</strong>
                  </span>
                  <span className="text-gray-600">{survey.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      survey.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${survey.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link to={`/surveys/${survey.id}/results`} className="flex-1">
                  <button className="btn-primary w-full flex items-center justify-center space-x-2">
                    <Eye size={18} />
                    <span>Ver Resultados</span>
                  </button>
                </Link>
                <button className="btn-secondary px-4 flex items-center justify-center">
                  <Share2 size={18} />
                </button>
                <button className="btn-secondary px-4 flex items-center justify-center">
                  <Edit size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Create New Card */}
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
        </div>
      </div>
    </div>
  );
};

export default SurveyList;
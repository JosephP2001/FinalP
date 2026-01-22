import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Download, FileDown, FileSpreadsheet, FileText, 
  TrendingUp, Users, Calendar, ArrowLeft 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { surveyService } from '../services/surveyService';
import { responseService } from '../services/responseService';
import { exportService } from '../services/exportService';

const SurveyResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [surveyData, responsesData] = await Promise.all([
        surveyService.getSurvey(id),
        responseService.getSurveyResponses(id)
      ]);

      setSurvey(surveyData.data);
      setResponses(responsesData.data);
    } catch (err) {
      console.error('Error loading survey results:', err);
      setError(err.response?.data?.message || 'Error al cargar resultados');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      switch (format) {
        case 'csv':
          await exportService.exportToCSV(survey, responses);
          break;
        case 'excel':
          await exportService.exportToExcel(survey, responses);
          break;
        case 'pdf':
          await exportService.exportToPDF(survey, responses);
          break;
        default:
          console.error('Unknown export format:', format);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Error al exportar: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando resultados...</p>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/surveys')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Volver a mis encuestas</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {survey.title}
              </h1>
              <p className="text-gray-600">{survey.description}</p>
            </div>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="btn-primary flex items-center gap-2">
                <Download size={20} />
                <span>Exportar</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <FileText size={18} className="text-green-600" />
                  <span className="text-sm font-medium">CSV</span>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <FileSpreadsheet size={18} className="text-blue-600" />
                  <span className="text-sm font-medium">Excel</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors rounded-b-lg"
                >
                  <FileDown size={18} className="text-red-600" />
                  <span className="text-sm font-medium">PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total de Respuestas"
            value={responses.length}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Tasa de Finalización"
            value={`${calculateCompletionRate(responses, survey)}%`}
            color="green"
          />
          <StatCard
            icon={Calendar}
            label="Última Respuesta"
            value={getLastResponseDate(responses)}
            color="purple"
          />
        </div>

        {/* Questions Results */}
        <div className="space-y-6">
          {survey.questions.map((question, index) => (
            <QuestionResults
              key={question._id}
              question={question}
              questionNumber={index + 1}
              responses={responses}
            />
          ))}
        </div>

        {/* No Responses Message */}
        {responses.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aún no hay respuestas
            </h3>
            <p className="text-gray-500">
              Comparte el enlace de tu encuesta para empezar a recibir respuestas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color]}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
};

// Question Results Component
const QuestionResults = ({ question, questionNumber, responses }) => {
  // Get all answers for this question
  const answers = responses
    .map(r => r.answers.find(a => a.questionId === question._id))
    .filter(Boolean);

  const renderChart = () => {
    switch (question.type) {
      case 'multiple':
        return <MultipleChoiceChart question={question} answers={answers} />;
      case 'scale':
        return <ScaleChart answers={answers} />;
      case 'text':
        return <TextResponses answers={answers} />;
      case 'date':
        return <DateResponses answers={answers} />;
      default:
        return <div>Tipo de pregunta no soportado</div>;
    }
  };

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {questionNumber}. {question.text}
        </h3>
        <p className="text-sm text-gray-500">
          {answers.length} respuesta{answers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {answers.length > 0 ? renderChart() : (
        <div className="text-center py-8 text-gray-400">
          Sin respuestas aún
        </div>
      )}
    </div>
  );
};

// Multiple Choice Chart Component
const MultipleChoiceChart = ({ question, answers }) => {
  // Count responses per option
  const data = question.options.map(option => ({
    name: option,
    value: answers.filter(a => a.value === option).length
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const total = answers.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Distribución</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Porcentajes</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="lg:col-span-2">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Resumen</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Opción
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Respuestas
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Porcentaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.value}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Scale Chart Component
const ScaleChart = ({ answers }) => {
  // Count responses per scale value (1-10)
  const scaleCounts = {};
  for (let i = 1; i <= 10; i++) {
    scaleCounts[i] = 0;
  }

  answers.forEach(a => {
    const value = parseInt(a.value);
    if (value >= 1 && value <= 10) {
      scaleCounts[value]++;
    }
  });

  const data = Object.entries(scaleCounts).map(([key, value]) => ({
    scale: key,
    count: value
  }));

  // Calculate statistics
  const values = answers.map(a => parseInt(a.value));
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mode = values.sort((a, b) =>
    values.filter(v => v === a).length - values.filter(v => v === b).length
  ).pop();

  return (
    <div>
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">Promedio</p>
          <p className="text-2xl font-bold text-blue-600">{avg.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">Mediana</p>
          <p className="text-2xl font-bold text-green-600">{median}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">Moda</p>
          <p className="text-2xl font-bold text-purple-600">{mode}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="scale" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Text Responses Component
const TextResponses = ({ answers }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedAnswers = showAll ? answers : answers.slice(0, 10);

  return (
    <div className="space-y-3">
      {displayedAnswers.map((answer, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-800">{answer.value}</p>
        </div>
      ))}

      {answers.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showAll ? 'Ver menos' : `Ver todas (${answers.length})`}
        </button>
      )}
    </div>
  );
};

// Date Responses Component
const DateResponses = ({ answers }) => {
  // Group by date
  const dateCounts = {};
  answers.forEach(a => {
    const date = new Date(a.value).toLocaleDateString('es-EC');
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });

  const data = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Fechas seleccionadas:</h4>
        <div className="space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.date}</span>
              <span className="font-medium text-gray-800">{item.count} respuesta{item.count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper Functions
const calculateCompletionRate = (responses, survey) => {
  if (!survey.settings?.maxResponses) return 100;
  return Math.min(100, ((responses.length / survey.settings.maxResponses) * 100).toFixed(1));
};

const getLastResponseDate = (responses) => {
  if (responses.length === 0) return 'N/A';
  const dates = responses.map(r => new Date(r.submittedAt));
  const latest = new Date(Math.max(...dates));
  return latest.toLocaleDateString('es-EC', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default SurveyResults;
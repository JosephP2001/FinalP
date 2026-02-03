import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Download, FileDown, FileSpreadsheet, FileText, 
  TrendingUp, Users, Calendar, ArrowLeft, Sparkles, X 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import StatsCard from '../components/common/StatsCard';
import { surveyService } from '../services/surveyService';
import { responseService } from '../services/responseService';
import { exportService } from '../services/exportService';
import { aiService } from '../services/aiService';
import { StatsCardSkeleton, QuestionResultsSkeleton } from '../components/common/Skeleton';

// Import utilities
import {
  calculateCompletionRate,
  getLastResponseDate,
  calculateScaleStats,
  calculateFrequencyDistribution,
  groupResponsesByDate
} from '../utils/statisticsUtils';

import { getSentimentColor } from '../utils/uiUtils';
import { getErrorMessage } from '../utils/validationUtils';

const SurveyResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

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
      setError(getErrorMessage(err, 'Error al cargar resultados'));
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

  const handleGenerateAI = async () => {
    try {
      setAiLoading(true);
      console.log('🤖 Generating AI analysis...');
      
      const result = await aiService.analyzeSurvey(id);
      
      if (result.success) {
        setAiAnalysis(result.analysis);
        setShowAiModal(true);
        console.log('AI analysis generated');
      } else {
        throw new Error('Failed to generate analysis');
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      alert('Error al generar análisis: ' + getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>

          {/* Questions Skeleton */}
          <div className="space-y-6">
            <QuestionResultsSkeleton />
            <QuestionResultsSkeleton />
            <QuestionResultsSkeleton />
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

  const completionRate = calculateCompletionRate(responses, survey);
  const lastResponse = getLastResponseDate(responses);

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

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* AI Analysis Button */}
              {responses.length > 0 && (
                <button
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={20} className={aiLoading ? 'animate-spin' : ''} />
                  <span>{aiLoading ? 'Generando...' : 'Análisis IA'}</span>
                </button>
              )}

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
        </div>

        {/* Statistics Cards - Using StatsCard Component */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={Users}
            label="Total Respuestas"
            value={responses.length}
            subtitle={survey.settings?.maxResponses 
              ? `de ${survey.settings.maxResponses} máximo` 
              : 'Sin límite'
            }
            color="blue"
          />
          
          <StatsCard
            icon={TrendingUp}
            label="Tasa de Completitud"
            value={`${completionRate}%`}
            color="green"
          />
          
          <StatsCard
            icon={Calendar}
            label="Última Respuesta"
            value={lastResponse}
            color="purple"
          />
        </div>

        {/* Question Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Resultados por Pregunta
          </h2>

          {responses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <Users size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aún no hay respuestas
              </h3>
              <p className="text-gray-500">
                Comparte tu encuesta para comenzar a recibir respuestas
              </p>
            </div>
          ) : (
            survey.questions.map((question, index) => (
              <QuestionResult
                key={question._id}
                question={question}
                responses={responses}
                index={index}
              />
            ))
          )}
        </div>
      </div>

      {/* AI Analysis Modal */}
      {showAiModal && aiAnalysis && (
        <AIAnalysisModal
          analysis={aiAnalysis}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </div>
  );
};

// Question Result Component
const QuestionResult = ({ question, responses, index }) => {
  const answers = responses
    .map(r => r.answers.find(a => a.questionId === question._id))
    .filter(Boolean);

  return (
    <div className="card">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {index + 1}. {question.text}
          </h3>
          {question.required && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              Obligatoria
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {answers.length} respuesta{answers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {answers.length > 0 && (
        <>
          {question.type === 'multiple' && (
            <MultipleChoiceChart answers={answers} question={question} />
          )}
          {question.type === 'scale' && (
            <ScaleChart answers={answers} />
          )}
          {question.type === 'text' && (
            <TextResponses answers={answers} />
          )}
          {question.type === 'date' && (
            <DateResponses answers={answers} />
          )}
        </>
      )}
    </div>
  );
};

// Multiple Choice Chart Component
const MultipleChoiceChart = ({ answers, question }) => {
  const answerValues = answers.map(a => a.value);
  const data = calculateFrequencyDistribution(answerValues, question.options);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={100}
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

      <div>
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

      <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución detallada:</h4>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-gray-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{item.value} respuestas</span>
                <span className="font-semibold text-gray-800 w-16 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Scale Chart Component  
const ScaleChart = ({ answers }) => {
  const values = answers.map(a => Number(a.value));
  const stats = calculateScaleStats(values);

  const distribution = {};
  for (let i = 1; i <= 10; i++) {
    distribution[i] = 0;
  }
  values.forEach(val => {
    if (val >= 1 && val <= 10) {
      distribution[val]++;
    }
  });

  const data = Object.entries(distribution).map(([value, count]) => ({
    value: Number(value),
    count
  }));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">Promedio</p>
          <p className="text-2xl font-bold text-blue-700">{stats.average}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">Mínimo</p>
          <p className="text-2xl font-bold text-green-700">{stats.min}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 mb-1">Máximo</p>
          <p className="text-2xl font-bold text-orange-700">{stats.max}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 mb-1">Respuestas</p>
          <p className="text-2xl font-bold text-purple-700">{stats.count}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="value" 
            label={{ value: 'Calificación', position: 'insideBottom', offset: -5 }}
          />
          <YAxis label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3B82F6">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value <= 3 ? '#EF4444' : entry.value <= 7 ? '#F59E0B' : '#10B981'} 
              />
            ))}
          </Bar>
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
        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">
              Respuesta #{index + 1}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(answer.submittedAt).toLocaleString('es-EC')}
            </span>
          </div>
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
  const data = groupResponsesByDate(answers.map(a => ({ submittedAt: a.value })));

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

// AI Analysis Modal Component
const AIAnalysisModal = ({ analysis, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="text-white" size={28} />
            <h2 className="text-2xl font-bold text-white">Análisis con IA</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              📋 Resumen General
            </h3>
            <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💡 Insights Clave
            </h3>
            <div className="space-y-3">
              {analysis.keyInsights.map((insight, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 flex-1">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              😊 Análisis de Sentimiento
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className={`px-4 py-2 rounded-full font-semibold ${getSentimentColor(analysis.sentiment.overall)}`}>
                {analysis.sentiment.overall.toUpperCase()}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${analysis.sentiment.score}%` }}
                  ></div>
                </div>
                <span className="text-gray-700 font-semibold">{analysis.sentiment.score}%</span>
              </div>
            </div>
            <p className="text-gray-700">{analysis.sentiment.explanation}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              🎯 Recomendaciones
            </h3>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-gray-700 flex-1">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {analysis.statistics && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📊 Estadísticas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Respuestas</p>
                  <p className="text-2xl font-bold text-gray-900">{analysis.statistics.totalResponses}</p>
                </div>
                {analysis.statistics.averagePerDay && (
                  <div>
                    <p className="text-sm text-gray-600">Promedio/Día</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysis.statistics.averagePerDay.toFixed(1)}
                    </p>
                  </div>
                )}
                {analysis.statistics.latestResponse && (
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-600">Última Respuesta</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(analysis.statistics.latestResponse).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                )}
              </div>
            </div> 
          )}

          <div className="text-center text-xs text-gray-500">
            Análisis generado el {new Date(analysis.generatedAt).toLocaleString('es-EC')}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full btn-primary py-3"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;
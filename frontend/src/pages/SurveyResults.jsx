/*
*Conecton with Backend (DONE)
*conection (surveyService)  (DONE)
*conection (responseService) (DONE)
*Added: loadSurveyData() 
*Added: handleAIAnalysis()
*/

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Sparkles, TrendingUp, Users, Calendar, Brain } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { surveyService } from '../services/surveyService';
import { responseService } from '../services/responseService';

const SurveyResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSurveyData();
  }, [id]);

  const loadSurveyData = async () => {
    try {
      setLoading(true);
      const [surveyData, responsesData, statsData] = await Promise.all([
        surveyService.getSurvey(id),
        responseService.getSurveyResponses(id),
        responseService.getSurveyStats(id)
      ]);

      setSurvey(surveyData.data);
      setResponses(responsesData.data);
      setStats(statsData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar resultados');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    try {
      setLoadingAI(true);
      setError('');
      const analysisData = await surveyService.getAIAnalysis(id);
      setAiAnalysis(analysisData.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar análisis IA');
    } finally {
      setLoadingAI(false);
    }
  };

  const calculateQuestionStats = (question) => {
    const questionResponses = responses
      .map(r => r.answers.find(a => a.questionId === question._id))
      .filter(a => a);

    if (question.type === 'multiple') {
      const frequency = {};
      questionResponses.forEach(a => {
        frequency[a.value] = (frequency[a.value] || 0) + 1;
      });
      return Object.entries(frequency).map(([option, count]) => ({
        option,
        count,
        percentage: ((count / questionResponses.length) * 100).toFixed(1)
      }));
    }

    if (question.type === 'scale') {
      const values = questionResponses.map(a => Number(a.value));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { average: avg.toFixed(2), total: values.length };
    }

    return questionResponses.map(a => a.value);
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'gray';
    if (sentiment.overall === 'positive') return 'green';
    if (sentiment.overall === 'negative') return 'red';
    return 'yellow';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-spin">⚙️</div>
            <p className="text-gray-600">Cargando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => navigate('/surveys')} className="btn-primary">
              Volver a encuestas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/surveys')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a encuestas
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{survey?.title}</h1>
              <p className="text-gray-600">{survey?.description}</p>
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Respuestas</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.totalResponses || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tasa de Respuesta</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.responseRate?.toFixed(1) || 'N/A'}%
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Respuesta</p>
                <p className="text-sm font-semibold text-gray-800">
                  {stats?.latestResponse ? new Date(stats.latestResponse).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <button
              onClick={handleAIAnalysis}
              disabled={loadingAI || responses.length === 0}
              className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-primary-50 hover:to-purple-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg">
                <Brain className="text-white" size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">
                  {loadingAI ? 'Analizando...' : 'Análisis IA'}
                </p>
                <p className="text-xs text-gray-600">
                  {loadingAI ? '⏳' : 'Generar insights'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* AI Analysis Section */}
        {aiAnalysis && (
          <div className="mb-8 card p-6 bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Análisis con IA</h2>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">📊 Resumen General</h3>
              <p className="text-gray-700">{aiAnalysis.summary}</p>
            </div>

            {/* Sentiment */}
            {aiAnalysis.sentiment && (
              <div className="mb-6 p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">💭 Análisis de Sentimiento</h3>
                <div className="flex items-center gap-4 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${getSentimentColor(aiAnalysis.sentiment)}-100 text-${getSentimentColor(aiAnalysis.sentiment)}-700`}>
                    {aiAnalysis.sentiment.overall.toUpperCase()}
                  </span>
                  <span className="text-2xl font-bold text-gray-800">
                    {aiAnalysis.sentiment.score}/100
                  </span>
                </div>
                <p className="text-sm text-gray-600">{aiAnalysis.sentiment.explanation}</p>
              </div>
            )}

            {/* Key Insights */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">💡 Insights Clave</h3>
              <ul className="space-y-2">
                {aiAnalysis.keyInsights?.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">🎯 Recomendaciones</h3>
              <ul className="space-y-2">
                {aiAnalysis.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-right">
              Generado el {new Date(aiAnalysis.generatedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Questions Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Resultados por Pregunta</h2>
          
          {survey?.questions.map((question, index) => {
            const questionStats = calculateQuestionStats(question);
            
            return (
              <div key={question._id} className="card p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {index + 1}. {question.text}
                </h3>

                {question.type === 'multiple' && Array.isArray(questionStats) && (
                  <div className="space-y-3">
                    {questionStats.map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700">{stat.option}</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {stat.count} ({stat.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'scale' && questionStats.average && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-primary-600">{questionStats.average}</p>
                    <p className="text-sm text-gray-600">Promedio de {questionStats.total} respuestas</p>
                  </div>
                )}

                {question.type === 'text' && Array.isArray(questionStats) && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {questionStats.map((text, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">"{text}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;




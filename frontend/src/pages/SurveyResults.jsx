import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Sparkles, TrendingUp, Users } from 'lucide-react';

const SurveyResults = () => {
  const { id } = useParams();
  const [showAI, setShowAI] = useState(false);

  // Datos de ejemplo para gráficos
  const barData = [
    { name: 'Excelente', value: 120 },
    { name: 'Buena', value: 89 },
    { name: 'Regular', value: 20 },
    { name: 'Mala', value: 5 },
  ];

  const pieData = [
    { name: 'Muy Satisfecho', value: 140 },
    { name: 'Satisfecho', value: 70 },
    { name: 'Neutral', value: 18 },
    { name: 'Insatisfecho', value: 6 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const aiInsights = {
    sentiment: 'Positivo',
    summary: 'La mayoría de estudiantes expresan satisfacción con la metodología del docente. Se destaca la claridad en las explicaciones y el dominio del tema. Área de mejora: aumentar ejemplos prácticos.',
    patterns: [
      'El 85% considera la metodología entre buena y excelente',
      'Mayor satisfacción en temas teóricos que prácticos',
      'Se solicita más tiempo para ejercicios en clase'
    ]
  };

  const responses = [
    { id: 1, date: '2024-12-20 10:30', q1: 'Excelente', q2: 5, q3: 'Me gustaría más ejercicios prácticos' },
    { id: 2, date: '2024-12-20 11:15', q1: 'Buena', q2: 4, q3: 'Muy clara la explicación' },
    { id: 3, date: '2024-12-20 12:00', q1: 'Excelente', q2: 5, q3: 'Excelente docente' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Resultados: Evaluación Docente Semestre 2024-2
              </h1>
              <p className="text-gray-600">
                234 respuestas recibidas de 300 esperadas
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Download size={18} />
                <span>Exportar CSV</span>
              </button>
              <button 
                onClick={() => setShowAI(!showAI)}
                className="btn-primary flex items-center space-x-2"
              >
                <Sparkles size={18} />
                <span>Análisis con IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Respuestas</p>
                <p className="text-3xl font-bold text-gray-800">234</p>
                <p className="text-sm text-green-600 mt-1">78% completado</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Promedio General</p>
                <p className="text-3xl font-bold text-gray-800">4.3/5</p>
                <p className="text-sm text-green-600 mt-1">+0.3 vs anterior</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Sentimiento IA</p>
                <p className="text-3xl font-bold text-green-600">Positivo</p>
                <p className="text-sm text-gray-600 mt-1">85% satisfacción</p>
              </div>
              <Sparkles className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* AI Insights Card (Conditional) */}
        {showAI && (
          <div className="card mb-8 border-2 border-purple-200 bg-purple-50">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">
                Análisis con Inteligencia Artificial
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Sentimiento General:</h3>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                  {aiInsights.sentiment}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Resumen Automático:</h3>
                <p className="text-gray-700 bg-white p-4 rounded-lg">
                  {aiInsights.summary}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Patrones Detectados:</h3>
                <ul className="space-y-2">
                  {aiInsights.patterns.map((pattern, index) => (
                    <li key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg">
                      <span className="text-purple-600 font-bold">•</span>
                      <span className="text-gray-700">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Pregunta 1: ¿Cómo calificarías la metodología?
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Distribución de Satisfacción General
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Responses Table */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Respuestas Individuales
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">P1: Metodología</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">P2: Claridad (1-5)</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">P3: Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {response.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {response.q1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{response.q2}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < response.q2 ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm max-w-xs truncate">
                      {response.q3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Ver todas las respuestas (234) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;
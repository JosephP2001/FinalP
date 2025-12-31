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
    { name: 'Excelent', value: 120 },
    { name: 'Good', value: 89 },
    { name: 'Regular', value: 20 },
    { name: 'Bad', value: 5 },
  ];

  const pieData = [
    { name: 'Highly satisfied', value: 140 },
    { name: 'Satisfied', value: 70 },
    { name: 'Neutral', value: 18 },
    { name: 'Dissatisfied', value: 6 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const aiInsights = {
    sentiment: 'Positive',
    summary: 'La mayoría de estudiantes expresan satisfacción con la metodología del docente. Se destaca la claridad en las explicaciones y el dominio del tema. Área de mejora: aumentar ejemplos prácticos.',
    patterns: [
      'El 85% considera la metodología entre buena y excelente',
      'Mayor satisfacción en temas teóricos que prácticos',
      'Se solicita más tiempo para ejercicios en clase'
    ]
  };

  const responses = [
    { id: 1, date: '2025-12-22 10:30', q1: 'Excelente', q2: 5, q3: 'Me gustaría más ejercicios prácticos' },
    { id: 2, date: '2025-12-21 11:15', q1: 'Buena', q2: 4, q3: 'Muy clara la explicación' },
    { id: 3, date: '2025-12-23 12:00', q1: 'Excelente', q2: 5, q3: 'Excelente docente' },
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
                Results: Evaluación Docente Semestre 2025
              </h1>

            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Download size={18} />
                <span>Export CSV</span>
              </button>
              <button 
                onClick={() => setShowAI(!showAI)}
                className="btn-primary flex items-center space-x-2"
              >
                <Sparkles size={18} />
                <span>IA Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Responses</p>
                <p className="text-3xl font-bold text-gray-800">234</p>
                <p className="text-sm text-green-600 mt-1">78% completed</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Average</p>
                <p className="text-3xl font-bold text-gray-800">4.3/5</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">IA feeling</p>
                <p className="text-3xl font-bold text-green-600">Positive</p>
                <p className="text-sm text-gray-600 mt-1">85% satisfaction</p>
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
                <h3 className="font-semibold text-gray-700 mb-2">Summary:</h3>
                <p className="text-gray-700 bg-white p-4 rounded-lg">
                  {aiInsights.summary}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Detected Pattern:</h3>
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
              Question 1: ¿Cómo calificarías la metodología?
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
              General Distribution Satisfaction
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


      </div>
    </div>
  );
};

export default SurveyResults;
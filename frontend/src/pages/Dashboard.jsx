import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { FileText, CheckCircle, TrendingUp, Plus } from 'lucide-react';

const Dashboard = () => {
  // Datos de ejemplo (wireframe)
  const stats = [
    { icon: FileText, label: 'Total surveys', value: '12',  color: 'bg-blue-500' },
    { icon: CheckCircle, label: 'Total Answers', value: '847',  color: 'bg-green-500' },
  ];

  const recentSurveys = [
    {
      id: 1,
      title: 'Evaluación Docente Sistemas',
      status: 'active',
      responses: '234 / 300',
      percentage: 78,
      date: '22 Dic 2025'
    },
    {
      id: 2,
      title: 'Satisfacción Servicios UCE',
      status: 'active',
      responses: '156 / 200',
      percentage: 78,
      date: '21 Dic 2025'
    },
    {
      id: 3,
      title: 'Infraestructura Biblioteca',
      status: 'closed',
      responses: '89 / 100',
      percentage: 89,
      date: '20 Dic 2025'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard 
          </h1>
  
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
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
            <h2 className="text-2xl font-bold text-gray-800">Your Surveys</h2>
            <Link to="/surveys/create">
              <button className="btn-primary flex items-center space-x-2">
                <Plus size={20} />
                <span>New Survey</span>
              </button>
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">State</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Answers</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Accions</th>
                </tr>
              </thead>
              <tbody>
                {recentSurveys.map((survey) => (
                  <tr key={survey.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800">{survey.title}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        survey.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {survey.status === 'active' ? 'Active' : 'Close'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="text-gray-800 font-medium">{survey.responses}</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary-500 h-2 rounded-full" 
                            style={{ width: `${survey.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{survey.date}</td>
                    <td className="py-4 px-4">
                      <Link to={`/surveys/${survey.id}/results`}>
                        <button className="text-primary-600 hover:text-primary-700 font-medium">
                          Ver
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trash2, Shield, ShieldOff, Search, Mail, Calendar, AlertCircle, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(authService.getCurrentUser());
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Redirect if not admin
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getStats()
      ]);
      
      setUsers(usersResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      showMessage('error', error.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone and will delete all their surveys and responses.`)) {
      return;
    }

    try {
      const response = await adminService.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      showMessage('success', response.message || `User "${userName}" deleted successfully`);
      fetchData(); // Refresh stats
    } catch (error) {
      showMessage('error', error.message || 'Error deleting user');
    }
  };

  const handleToggleRole = async (userId, currentRole, userName) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`Change "${userName}"'s role to ${newRole === 'admin' ? 'Administrator' : 'User'}?`)) {
      return;
    }

    try {
      const response = await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      showMessage('success', response.message || `Role updated to ${newRole}`);
    } catch (error) {
      showMessage('error', error.message || 'Error updating role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          </div>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.users.total}</p>
                  <p className="text-xs text-green-600 mt-1">+{stats.users.recentSignups} this week</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-full">
                  <Users className="text-blue-600" size={28} />
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Administrators</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.users.admins}</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-full">
                  <Shield className="text-purple-600" size={28} />
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Surveys</p>
                  <p className="text-3xl font-bold text-green-600">{stats.surveys.total}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.surveys.active} active</p>
                </div>
                <div className="p-4 bg-green-100 rounded-full">
                  <Activity className="text-green-600" size={28} />
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Responses</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.responses.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Avg: {stats.responses.averagePerSurvey}/survey</p>
                </div>
                <div className="p-4 bg-orange-100 rounded-full">
                  <TrendingUp className="text-orange-600" size={28} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All roles</option>
              <option value="admin">Administrators only</option>
              <option value="user">Users only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={14} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? <Shield size={14} /> : <Users size={14} />}
                        {user.role === 'admin' ? 'Administrator' : 'User'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <p>{user.surveyCount} surveys</p>
                        <p className="text-xs text-gray-500">{user.responseCount} responses</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} />
                        {new Date(user.createdAt).toLocaleDateString('en-US')}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRole(user._id, user.role, user.name)}
                          className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                          title={user.role === 'admin' ? 'Remove admin privileges' : 'Make administrator'}
                        >
                          {user.role === 'admin' ? (
                            <ShieldOff size={18} className="text-purple-600 group-hover:text-purple-700" />
                          ) : (
                            <Shield size={18} className="text-gray-600 group-hover:text-purple-600" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Delete user"
                        >
                          <Trash2 size={18} className="text-red-600 group-hover:text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
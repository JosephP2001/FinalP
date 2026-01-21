import { Link } from 'react-router-dom';
import { Home, FileText, LogOut, User, Shield, Users } from 'lucide-react';
import { authService } from '../../services/authService';

const Navbar = () => {
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      authService.logout();
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-3xl">📊</div>
            <span className="text-xl font-bold text-primary-600">
              UCE Surveys
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/surveys" 
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <FileText size={20} />
              <span>My Surveys</span>
            </Link>

            {/* Admin Links - Only visible to admins */}
            {user?.role === 'admin' && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
                >
                  <Shield size={20} />
                  <span>All Surveys</span>
                </Link>
                <Link 
                  to="/admin/users" 
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
                >
                  <Users size={20} />
                  <span>Manage Users</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <div className="flex items-center gap-2">
                <User size={20} />
                <div className="hidden md:block">
                  <span className="font-medium">{user?.name || 'User'}</span>
                  {user?.role === 'admin' && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

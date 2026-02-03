import { Link } from 'react-router-dom';
import { Home, FileText, LogOut, User, Shield, Users } from 'lucide-react';
import { authService } from '../../services/authService';
import uceLogo from '../../assets/uce-logo.png';

const Navbar = () => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      authService.logout();
    }
  };

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img 
              src={uceLogo} 
              alt="UCE Logo" 
              className="h-12 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-white leading-tight">
                Sistema de Encuestas
              </h1>
              <p className="text-xs text-primary-100">
                Universidad Central del Ecuador
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              // Admin navigation
              <>
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors font-medium"
                >
                  <Shield size={20} />
                  <span>All Surveys</span>
                </Link>
                <Link 
                  to="/admin/users" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors font-medium"
                >
                  <Users size={20} />
                  <span>Manage Users</span>
                </Link>
              </>
            ) : (
              // Regular user navigation
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors font-medium"
                >
                  <Home size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/surveys" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors font-medium"
                >
                  <FileText size={20} />
                  <span>My Surveys</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <User size={18} />
                </div>
                <div className="hidden md:block">
                  <span className="font-medium text-sm">{user?.name || 'User'}</span>
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 bg-secondary-500 text-white text-xs font-semibold rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden md:inline text-sm font-medium">Exit</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 flex gap-2 border-t border-white/20 pt-3">
          {isAdmin ? (
            <>
              <Link 
                to="/admin" 
                className="flex-1 flex items-center justify-center gap-2 text-white/90 hover:text-white bg-white/10 rounded-lg py-2 text-sm"
              >
                <Shield size={16} />
                <span>Surveys</span>
              </Link>
              <Link 
                to="/admin/users" 
                className="flex-1 flex items-center justify-center gap-2 text-white/90 hover:text-white bg-white/10 rounded-lg py-2 text-sm"
              >
                <Users size={16} />
                <span>Users</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/dashboard" 
                className="flex-1 flex items-center justify-center gap-2 text-white/90 hover:text-white bg-white/10 rounded-lg py-2 text-sm"
              >
                <Home size={16} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/surveys" 
                className="flex-1 flex items-center justify-center gap-2 text-white/90 hover:text-white bg-white/10 rounded-lg py-2 text-sm"
              >
                <FileText size={16} />
                <span>Surveys</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
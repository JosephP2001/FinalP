import { Link, useNavigate } from 'react-router-dom';
import { Home, FileText, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí iría la lógica de logout
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-3xl">📊</div>
            <span className="text-xl font-bold text-primary-600">
              Encuestas UCE
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
              <span>Mis Encuestas</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User size={20} />
              <span className="hidden md:inline">Juan Pérez</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
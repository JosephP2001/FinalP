// frontend/src/pages/AuthCallback.jsx

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const user = searchParams.get('user');

        if (!token || !user) {
          console.error('Missing token or user data');
          navigate('/login');
          return;
        }

        // Parse user data
        const userData = JSON.parse(decodeURIComponent(user));

        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('OAuth authentication successful');
        console.log('User role:', userData.role);

        // Redirect based on user role
        if (userData.role === 'admin') {
          navigate('/admin'); // Admin goes to All Surveys dashboard
        } else {
          navigate('/dashboard'); // Regular user goes to personal dashboard
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-500 to-secondary-500 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">📊</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
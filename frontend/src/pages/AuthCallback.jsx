import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = () => {
      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(`Error de autenticación: ${errorParam}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (token && userStr) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', decodeURIComponent(userStr));
          navigate('/dashboard');
        } else {
          setError('Token o usuario no recibido');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Error procesando autenticación');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="text-6xl mb-4 animate-spin">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Autenticando...
        </h2>
        <p className="text-gray-600">Por favor espera</p>
      </div>
    </div>
  );
};

export default AuthCallback;
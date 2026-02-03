import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { loginSchema, registerSchema } from '../schemas/authSchemas';
import FormInput from '../components/common/FormInput';
import uceLogo from '../assets/uce-logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [apiError, setApiError] = useState('');

  // React Hook Form - Login
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // React Hook Form - Register
  const {
    register: registerForm,
    handleSubmit: handleSubmitRegister,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'user' }
  });

  const onLoginSubmit = async (data) => {
    setApiError('');
    try {
      const response = await authService.login(data.email, data.password);
      
      // Redirect based on user role
      const user = response.data.user;
      if (user.role === 'admin') {
        navigate('/admin'); // Admin goes to All Surveys dashboard
      } else {
        navigate('/dashboard'); // Regular user goes to personal dashboard
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const onRegisterSubmit = async (data) => {
    setApiError('');
    try {
      // Always register as 'user' - admin is assigned manually in DB
      await authService.register(data.name, data.email, data.password, 'user');
      navigate('/dashboard'); // New users always go to dashboard
    } catch (err) {
      setApiError(err.response?.data?.message || 'Error al registrarse');
    }
  };

  const OAuthGithub = () => {
    const githubAuthUrl = import.meta.env.VITE_GITHUB_AUTH_URL || 'http://localhost:5000/api/auth/github';
    
    return (
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or try with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => window.location.href = githubAuthUrl}
            disabled={isLoginSubmitting || isRegisterSubmitting}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            Try using Github
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <img 
                src={uceLogo} 
                alt="UCE Logo" 
                className="h-24 w-auto mx-auto"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Sistema de Encuestas
          </h1>
          <p className="text-primary-100 text-lg">
            Universidad Central del Ecuador
          </p>
        </div>

        {/* Card -> Login/Register */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-in">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-fade-in">
              <AlertCircle size={20} />
              <span className="text-sm">{apiError}</span>
            </div>
          )}

          {/* Login Form */}
          {!isRegister ? (
            <>
              <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-5">
                <FormInput
                  label="Correo Electrónico"
                  type="email"
                  icon={Mail}
                  placeholder="tu-email@uce.edu.ec"
                  {...registerLogin('email')}
                  error={loginErrors.email?.message}
                  disabled={isLoginSubmitting}
                />

                <FormInput
                  label="Contraseña"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  {...registerLogin('password')}
                  error={loginErrors.password?.message}
                  disabled={isLoginSubmitting}
                />

                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-lg font-semibold"
                  disabled={isLoginSubmitting}
                >
                  {isLoginSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner-small"></div>
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setApiError('');
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    disabled={isLoginSubmitting}
                  >
                    ¿No tienes cuenta? Regístrate aquí
                  </button>
                </div>
              </form>

              <OAuthGithub />
            </>
          ) : (
            <>
              {/* Register Form */}
              <form onSubmit={handleSubmitRegister(onRegisterSubmit)} className="space-y-5">
                <FormInput
                  label="Nombre Completo"
                  type="text"
                  placeholder="Juan Pérez"
                  {...registerForm('name')}
                  error={registerErrors.name?.message}
                  disabled={isRegisterSubmitting}
                />

                <FormInput
                  label="Correo Electrónico"
                  type="email"
                  icon={Mail}
                  placeholder="tu-email@uce.edu.ec"
                  {...registerForm('email')}
                  error={registerErrors.email?.message}
                  disabled={isRegisterSubmitting}
                />

                <FormInput
                  label="Contraseña"
                  type="password"
                  icon={Lock}
                  placeholder="Mínimo 6 caracteres"
                  {...registerForm('password')}
                  error={registerErrors.password?.message}
                  disabled={isRegisterSubmitting}
                />

                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-lg font-semibold"
                  disabled={isRegisterSubmitting}
                >
                  {isRegisterSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner-small"></div>
                      Registrando...
                    </span>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setApiError('');
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    disabled={isRegisterSubmitting}
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>
              </form>

              <OAuthGithub />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-white/90 text-sm font-medium">
            Universidad Central del Ecuador
          </p>
          <p className="text-white/70 text-xs">
            Sistema de Gestión de Encuestas © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
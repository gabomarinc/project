import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { AirtableService } from '../services/airtableService';

interface LoginProps {
  onLoginSuccess: (dashboardId: string, userEmail: string) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Intentando iniciar sesión para:', email);
      
      // Search for user session in Airtable
      const result = await AirtableService.findUserSession(email, password);
      
      if (result.success && result.dashboardId) {
        console.log('✅ Login exitoso, dashboard ID:', result.dashboardId);
        onLoginSuccess(result.dashboardId, email);
      } else {
        console.log('❌ Login fallido:', result.error);
        setError(result.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('❌ Error durante el login:', error);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onBack();
        }
      }}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          {/* Close Button */}
          <button
            onClick={onBack}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300 p-1"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <img 
              src="https://konsul.digital/wp-content/uploads/2025/07/Logo-en-BW-e1751712792454.png" 
              alt="KONSUL" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Iniciar Sesión</h1>
            <p className="text-gray-400 text-sm sm:text-base">Accede a tu dashboard de negocio</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                📧 Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                placeholder="tu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                🔑 Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="Tu contraseña"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform text-sm sm:text-base ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Iniciar Sesión</span>
                </div>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-400">
              ¿No tienes una cuenta?{' '}
              <button
                onClick={onBack}
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200"
              >
                Crea tu plan de negocio aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

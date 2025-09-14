import React from 'react';
import { Clock, RefreshCw, AlertTriangle } from 'lucide-react';

interface ExpirationMessageProps {
  onRenew: () => void;
  isRenewing?: boolean;
}

const ExpirationMessage: React.FC<ExpirationMessageProps> = ({ onRenew, isRenewing = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Dashboard Expirado
          </h1>

          {/* Description */}
          <div className="text-gray-300 mb-8 space-y-4">
            <p className="text-lg">
              Tu acceso al dashboard completo ha expirado.
            </p>
            <p>
              Para continuar utilizando todas las funcionalidades y mantener tu análisis actualizado, 
              necesitas renovar tu suscripción.
            </p>
          </div>

          {/* Features that are locked */}
          <div className="bg-gray-700/30 rounded-lg p-6 mb-8">
            <h3 className="text-white font-semibold mb-4 flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Funcionalidades Bloqueadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Análisis completo del mercado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Plan de acción detallado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Inteligencia de marca</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Validación de mercado</span>
              </div>
            </div>
          </div>

          {/* Renewal Button */}
          <button
            onClick={onRenew}
            disabled={isRenewing}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isRenewing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Renovar Dashboard
              </>
            )}
          </button>

          {/* Additional Info */}
          <p className="text-sm text-gray-400 mt-6">
            Al renovar, tendrás acceso completo por 30 días más
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpirationMessage;


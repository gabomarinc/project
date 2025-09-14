import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface PaymentSuccessLoadingProps {
  isVisible: boolean;
}

export const PaymentSuccessLoading: React.FC<PaymentSuccessLoadingProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">
          ¡Pago Exitoso! 🎉
        </h2>

        {/* Description */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          Tu pago ha sido procesado correctamente. Estamos preparando tu dashboard completo...
        </p>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Status Text */}
        <p className="text-sm text-gray-400">
          Redirigiendo a tu dashboard...
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Copy, Check, Mail, User, Key, ArrowRight } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  password: string;
  onContinue: () => void;
  previewSessionId?: string;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({ 
  isOpen, 
  onClose, 
  email, 
  password, 
  onContinue,
  previewSessionId
}) => {
  const [copied, setCopied] = useState({ email: false, password: false });

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Generar URL de redirección de Stripe (simplificada)
  const generateStripeRedirectUrl = () => {
    const currentUrl = window.location.origin + window.location.pathname;
    const redirectUrl = `${currentUrl}?session_email=${encodeURIComponent(email)}&session_password=${encodeURIComponent(password)}&session_preview_id=${previewId}&payment_success=true&return_to_preview=true`;
    
    console.log('🔗 URL de redirección simplificada:', redirectUrl);
    
    const stripeUrl = `https://buy.stripe.com/cNi5kD1KX5zkfgUdAsgjC02?success_url=${encodeURIComponent(redirectUrl)}`;
    
    return stripeUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">¡Sesión Creada Exitosamente!</h2>
              <p className="text-gray-400 text-sm">Guarda esta información de forma segura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Sesión Activa</span>
            </div>
            <p className="text-gray-300 text-sm">
              Tu sesión ha sido creada y activada automáticamente. 
              <strong className="text-yellow-400"> Guarda estas credenciales</strong> para futuros accesos.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm">
                {email}
              </div>
              <button
                onClick={() => copyToClipboard(email, 'email')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copied.email ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied.email ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              Contraseña
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm">
                {password}
              </div>
              <button
                onClick={() => copyToClipboard(password, 'password')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copied.password ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied.password ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Key className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 text-sm font-medium mb-1">Importante</p>
                <p className="text-yellow-200 text-xs">
                  Esta contraseña no se puede recuperar. Guárdala en un lugar seguro. 
                  También hemos enviado esta información a tu email.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = generateStripeRedirectUrl()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105"
            >
              💳 Completar Pago €5
              <ArrowRight className="w-5 h-5" />
            </button>
            
            {/* Debug Button - Solo para desarrollo */}
            <button
              onClick={() => {
                const url = generateStripeRedirectUrl();
                navigator.clipboard.writeText(url);
                alert('URL copiada al portapapeles:\n' + url);
              }}
              className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 hover:bg-gray-700"
            >
              🔗 Copiar URL de Stripe (Debug)
            </button>
            
            <p className="text-center text-xs text-gray-400">
              Después del pago serás redirigido automáticamente a tu dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

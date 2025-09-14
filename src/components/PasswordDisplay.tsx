import React, { useState } from 'react';

interface PasswordDisplayProps {
  email: string;
  password: string;
  onClose: () => void;
}

export const PasswordDisplay: React.FC<PasswordDisplayProps> = ({ email, password, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Sesión Creada</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-green-400 font-medium mb-2">¡Sesión creada exitosamente!</h3>
            <p className="text-gray-300 text-sm">
              Tu contraseña ha sido generada automáticamente. 
              <strong className="text-yellow-400"> Guárdala bien</strong> para poder acceder a tu dashboard.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white">
              {email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white font-mono">
                {password}
              </div>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {copied ? '✓' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-300 text-sm">
              ⚠️ <strong>Importante:</strong> Esta contraseña no se puede recuperar. 
              Guárdala en un lugar seguro.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
};


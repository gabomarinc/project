import React from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface DashboardExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: () => Promise<void>;
  onDelete: () => Promise<void>;
  expiresAt: string;
  isLoading: boolean;
}

export const DashboardExpirationModal: React.FC<DashboardExpirationModalProps> = ({
  isOpen,
  onClose,
  onExtend,
  onDelete,
  expiresAt,
  isLoading
}) => {
  if (!isOpen) return null;

  const formatExpirationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExtend = async () => {
    await onExtend();
    onClose();
  };

  const handleDelete = async () => {
    await onDelete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800/95 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Expirado</h2>
          <p className="text-gray-300">
            Tu dashboard ha expirado y ya no tienes acceso al contenido.
          </p>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Fecha de Expiración</span>
          </div>
          <p className="text-gray-300 text-sm">
            {formatExpirationDate(expiresAt)}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExtend}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-lime-500/20 text-lime-400 rounded-xl font-medium hover:bg-lime-500/30 transition-all duration-300 border border-lime-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Extendiendo...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Extender Acceso (30 días)
              </span>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all duration-300 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar Dashboard
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gray-600/20 text-gray-400 rounded-xl font-medium hover:bg-gray-600/30 transition-all duration-300 border border-gray-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

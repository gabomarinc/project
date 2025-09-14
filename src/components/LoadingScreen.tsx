import React from 'react';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Cargando...", 
  showLogo = true 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {showLogo && (
        <div className="mb-8">
          {/* Logo KONSUL con animación */}
          <div className="relative mx-auto w-32 h-16 flex flex-col items-center justify-center">
            <img 
              src="https://konsul.digital/wp-content/uploads/2025/07/Logo-en-BW-e1751712792454.png" 
              alt="KONSUL" 
              className="h-12 w-auto animate-pulse"
            />
            {/* Tagline CONSULTORÍA DIGITAL */}
            <div className="text-xs text-cyan-400 font-medium mt-2 text-center animate-fade-in">
              CONSULTORÍA DIGITAL
            </div>
          </div>
        </div>
        )}
        
        {/* Mensaje de carga */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
          
          {/* Barra de progreso animada */}
          <div className="w-64 mx-auto">
            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 via-green-500 to-blue-600 h-full rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Puntos de carga */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

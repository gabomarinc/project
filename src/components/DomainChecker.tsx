import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Globe, Search, X } from 'lucide-react';

interface DomainCheckerProps {
  brandNames: string[];
}

interface DomainVariation {
  domain: string;
  type: string;
}

const DomainChecker: React.FC<DomainCheckerProps> = ({ brandNames }) => {
  const [domainVariations, setDomainVariations] = useState<DomainVariation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  // Generar variaciones de dominios cuando cambien los nombres de marca
  useEffect(() => {
    if (brandNames.length > 0) {
      const allVariations: DomainVariation[] = [];
      
      brandNames.forEach(brandName => {
        const cleanName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Generar variaciones básicas
        allVariations.push(
          { domain: `${cleanName}.com`, type: '.com' },
          { domain: `${cleanName}.es`, type: '.es' },
          { domain: `${cleanName}.net`, type: '.net' },
          { domain: `${cleanName}.org`, type: '.org' },
          { domain: `${cleanName}.io`, type: '.io' },
          { domain: `${cleanName}.co`, type: '.co' },
          { domain: `${cleanName}.app`, type: '.app' },
          { domain: `${cleanName}.dev`, type: '.dev' }
        );
      });

      setDomainVariations(allVariations);
    }
  }, [brandNames]);

  const handleCheckDomain = (domain: string) => {
    setSelectedDomain(domain);
    setShowModal(true);
  };

  const openDomainSearch = (provider: string) => {
    let searchUrl = '';
    
    switch (provider) {
      case 'dondominio':
        searchUrl = `https://www.dondominio.com/dominios/buscar/?domain=${selectedDomain}`;
        break;
      case 'godaddy':
        searchUrl = `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${selectedDomain}`;
        break;
      case 'namecheap':
        searchUrl = `https://www.namecheap.com/domains/registration/results/?domain=${selectedDomain}`;
        break;
      case 'hostinger':
        searchUrl = `https://www.hostinger.es/dominios?domain=${selectedDomain}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${selectedDomain}+domain+registrar`;
    }
    
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  const getDomainTypeColor = (type: string) => {
    switch (type) {
      case '.com': return 'text-blue-400';
      case '.es': return 'text-red-400';
      case '.net': return 'text-purple-400';
      case '.org': return 'text-green-400';
      case '.io': return 'text-cyan-400';
      case '.co': return 'text-yellow-400';
      case '.app': return 'text-pink-400';
      case '.dev': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-lime-400" />
              Verificación de Dominios
            </h3>
            <p className="text-gray-400 text-sm">
              Verifica la disponibilidad de dominios para tus nombres de marca
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Total Dominios</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {domainVariations.length}
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Extensiones</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              8
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Buscadores</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">
              4
            </div>
          </div>
        </div>

        {/* Lista de dominios */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {domainVariations.map((variation) => (
            <div
              key={variation.domain}
              className="p-4 rounded-lg border border-gray-600 bg-gray-700/20 hover:border-gray-500 transition-all duration-300"
            >
              {/* Desktop Layout - Botón a la derecha */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-lime-400" />
                  <div>
                    <div className="font-medium text-white">{variation.domain}</div>
                    <div className={`text-sm ${getDomainTypeColor(variation.type)}`}>
                      {variation.type}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCheckDomain(variation.domain)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Ver disponibilidad
                </button>
              </div>

              {/* Mobile Layout - Botón debajo */}
              <div className="sm:hidden">
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-lime-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-white">{variation.domain}</div>
                    <div className={`text-sm ${getDomainTypeColor(variation.type)} mb-3`}>
                      {variation.type}
                    </div>
                    
                    <button
                      onClick={() => handleCheckDomain(variation.domain)}
                      className="px-3 py-2 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <Search className="w-3 h-3" />
                      <span className="hidden xs:inline">Ver disponibilidad</span>
                      <span className="xs:hidden">Verificar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {domainVariations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay nombres de marca para verificar dominios</p>
          </div>
        )}
      </div>

      {/* Modal de buscadores - Renderizado fuera del contenedor principal */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999999] p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Verificar Dominio</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-400 mb-6">
              Selecciona un buscador para verificar la disponibilidad de:
            </p>
            
            <div className="bg-gray-700/30 rounded-lg p-3 mb-6">
              <div className="font-medium text-white text-lg">{selectedDomain}</div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => openDomainSearch('dondominio')}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-3"
              >
                <Globe className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">DonDominio</div>
                  <div className="text-sm opacity-80">Buscador español</div>
                </div>
              </button>
              
              <button
                onClick={() => openDomainSearch('godaddy')}
                className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-3"
              >
                <Globe className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">GoDaddy</div>
                  <div className="text-sm opacity-80">Buscador internacional</div>
                </div>
              </button>
              
              <button
                onClick={() => openDomainSearch('namecheap')}
                className="w-full p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center gap-3"
              >
                <Globe className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Namecheap</div>
                  <div className="text-sm opacity-80">Buscador económico</div>
                </div>
              </button>
              
              <button
                onClick={() => openDomainSearch('hostinger')}
                className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-3"
              >
                <Globe className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Hostinger</div>
                  <div className="text-sm opacity-80">Buscador con hosting</div>
                </div>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default DomainChecker;


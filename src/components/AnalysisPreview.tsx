import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, ArrowRight, Building2, Tag, AlertTriangle, BarChart3, Rocket, Shield, Star, Search } from 'lucide-react';
import ExpirationMessage from './ExpirationMessage';

interface AnalysisPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onExportPDF?: () => void;
  onCreateSession?: () => void;
  isPaymentRegistered?: boolean;
  isCreatingSession?: boolean;
  isSessionCreated?: boolean;
  userEmail?: string;
  aiContent: {
    executiveSummary?: string;
    strongPoint?: string;
    criticalRisks?: string[];
    actionableRecommendation?: string;
    dataBackedInsights?: boolean;
    externalData?: {
      marketSize?: {
        totalAddressableMarket: string;
        serviceableAddressableMarket: string;
        serviceableObtainableMarket: string;
      };
      competitors?: Array<{
        name: string;
        funding?: {
          totalRaised: string;
        };
        traffic?: string;
        tech?: string[];
      }>;
      trends?: string[];
      insights?: {
        strategicRecommendations?: string[];
      };
      marketTrends?: Array<{
        keyword: string;
        trend: string;
        growthRate: number;
      }>;
    };
    // Add new fields that are being generated
    brandSuggestions?: string[];
    brandReasoning?: string[];
    intelligentlySearched?: boolean;
    searchQueries?: string[];
  };
  userInputs: {
    idea: string;
    problem: string;
    idealUser: string;
    region: string;
    alternatives: string;
    businessModel: string;
    projectType: string;
  };
  isDashboardUnlocked?: boolean;
  previewSessionId?: string;
  isExpired?: boolean;
  onRenew?: () => void;
}

const AnalysisPreview: React.FC<AnalysisPreviewProps> = ({
  isOpen,
  onClose,
  onContinue,
  onExportPDF,
  onCreateSession,
  isPaymentRegistered = false,
  isCreatingSession = false,
  isSessionCreated = false,
  userEmail = '',
  aiContent,
  userInputs,
  isDashboardUnlocked = false,
  previewSessionId = '',
  isExpired = false,
  onRenew
}) => {
  // Debug logging
  console.log('🔍 AnalysisPreview render - isOpen:', isOpen);
  console.log('🔍 AnalysisPreview render - isSessionCreated:', isSessionCreated);
  console.log('🔍 AnalysisPreview render - isCreatingSession:', isCreatingSession);
  console.log('🔍 AnalysisPreview render - userEmail:', userEmail);
  console.log('🔍 AnalysisPreview render - onCreateSession:', !!onCreateSession);
  console.log('🔍 AnalysisPreview render - isDashboardUnlocked:', isDashboardUnlocked);
  console.log('🔍 AnalysisPreview props:', {
    isDashboardUnlocked,
    previewSessionId,
    isDashboardUnlockedType: typeof isDashboardUnlocked,
    isSessionCreated,
    userEmail,
    isCreatingSession
  });

  // Effect to log when props change
  useEffect(() => {
    console.log('🔄 AnalysisPreview props updated:', {
      isDashboardUnlocked,
      previewSessionId,
      buttonShouldBeEnabled: isDashboardUnlocked,
      isSessionCreated,
      userEmail,
      isCreatingSession
    });
  }, [isDashboardUnlocked, previewSessionId, isSessionCreated, userEmail, isCreatingSession]);

  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['executiveSummary']));

  // Safety check to ensure aiContent is never null/undefined
  const safeAiContent = aiContent || {};
  const safeExternalData = (safeAiContent.externalData || {}) as any;
  const safeMarketSize = (safeExternalData.marketSize || {}) as any;
  const safeCompetitors = (safeExternalData.competitors || []) as any[];
  const safeInsights = (safeExternalData.insights || {}) as any;
  const safeBrandSuggestions = (safeAiContent.brandSuggestions || []) as string[];
  const safeBrandReasoning = (safeAiContent.brandReasoning || []) as string[];
  const safeCriticalRisks = (safeAiContent.criticalRisks || []) as string[];
  const safeSearchQueries = (safeAiContent.searchQueries || []) as string[];

  // Debug logging to see what data is being received
  console.log('🔍 AnalysisPreview - aiContent received:', aiContent);
  console.log('🔍 AnalysisPreview - executiveSummary:', aiContent?.executiveSummary);
  console.log('🔍 AnalysisPreview - strongPoint:', aiContent?.strongPoint);
  console.log('🔍 AnalysisPreview - criticalRisks received:', aiContent?.criticalRisks);
  console.log('🔍 AnalysisPreview - actionableRecommendation:', aiContent?.actionableRecommendation);
  console.log('🔍 AnalysisPreview - safeCriticalRisks:', safeCriticalRisks);
  console.log('🔍 AnalysisPreview - safeCriticalRisks length:', safeCriticalRisks.length);
  console.log('🔍 AnalysisPreview - safeCriticalRisks type:', typeof safeCriticalRisks);
  console.log('🔍 AnalysisPreview - safeCriticalRisks isArray:', Array.isArray(safeCriticalRisks));
  console.log('🔍 AnalysisPreview - safeCriticalRisks content:', JSON.stringify(safeCriticalRisks, null, 2));

  // Helper function to safely convert any data to string for React rendering
  const safeToString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return value.map(safeToString).join(', ');
    if (typeof value === 'object') {
      // Handle specific object types
      if (value.monthlyVisits && value.globalRank && value.categoryRank) {
        // Ensure we have numbers for proper formatting
        const visits = typeof value.monthlyVisits === 'string' ? parseInt(value.monthlyVisits) : value.monthlyVisits;
        const rank = typeof value.globalRank === 'string' ? parseInt(value.globalRank) : value.globalRank;
        
        if (!isNaN(visits) && !isNaN(rank)) {
          return `${visits.toLocaleString()} visitas/mes (Rank: ${rank.toLocaleString()})`;
        } else {
          return 'Datos de tráfico en análisis...';
        }
      }
      if (value.totalRaised) return `$${value.totalRaised}`;
      // Convert other objects to JSON string, but limit length
      try {
        const jsonStr = JSON.stringify(value);
        return jsonStr.length > 100 ? jsonStr.substring(0, 100) + '...' : jsonStr;
      } catch {
        return '[Datos complejos]';
      }
    }
    return String(value);
  };

  // Helper function to clean AI content by removing JSON symbols and formatting properly
  const cleanAiContent = (content: string): string => {
    if (!content || typeof content !== 'string') return '';
    
    let cleaned = content
      // Remove "titulo" word that appears concatenated with content (like "tituloRecomendación" -> "Recomendación")
      .replace(/titulo([A-Z][a-z]*)/g, '$1') // Remove "titulo" when concatenated with capitalized words
      .replace(/titulo([a-z]+)/g, '$1') // Remove "titulo" when concatenated with lowercase words
      .replace(/^titulo\s*/gi, '') // Remove "titulo" at the beginning (case insensitive)
      .replace(/\stitulo\s/gi, ' ') // Remove "titulo" in the middle
      .replace(/\stitulo$/gi, '') // Remove "titulo" at the end
      
      // Remove common JSON formatting symbols
      .replace(/\*/g, '') // Remove asterisks
      .replace(/#/g, '') // Remove hash symbols
      .replace(/\*\*/g, '') // Remove double asterisks
      .replace(/^\s*[-•]\s*/gm, '') // Remove leading bullets/dashes
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      
      // Remove JSON-like descriptive text and symbols more comprehensively
      .replace(/\{"parrafo1":"/g, '') // Remove {"parrafo1":"
      .replace(/\{"parrafo2":"/g, '') // Remove {"parrafo2":"
      .replace(/\{"parrafo3":"/g, '') // Remove {"parrafo3":"
      .replace(/\{"descripcion":"/g, '') // Remove {"descripcion":"
      .replace(/\{"texto":"/g, '') // Remove {"texto":"
      .replace(/\{"contenido":"/g, '') // Remove {"contenido":"
      .replace(/\{"analisis":"/g, '') // Remove {"analisis":"
      .replace(/\{"resumen":"/g, '') // Remove {"resumen":"
      
      .replace(/\[{"parrafo1":"/g, '') // Remove [{"parrafo1":"
      .replace(/\[{"parrafo2":"/g, '') // Remove [{"parrafo2":"
      .replace(/\[{"parrafo3":"/g, '') // Remove [{"parrafo3":"
      .replace(/\[{"descripcion":"/g, '') // Remove [{"descripcion":"
      .replace(/\[{"texto":"/g, '') // Remove [{"texto":"
      .replace(/\[{"contenido":"/g, '') // Remove [{"contenido":"
      .replace(/\[{"analisis":"/g, '') // Remove [{"analisis":"
      .replace(/\[{"resumen":"/g, '') // Remove [{"resumen":"
      
      // Remove closing quotes, braces, and brackets
      .replace(/"\s*\}\s*\]?/g, '') // Remove closing quotes, braces, and brackets
      .replace(/"\s*\}\s*$/g, '') // Remove closing quotes and braces at end
      .replace(/"\s*\]\s*$/g, '') // Remove closing quotes and brackets at end
      .replace(/"\s*,\s*$/g, '') // Remove trailing quotes and commas
      
      // Remove remaining JSON symbols
      .replace(/\[/g, '') // Remove any remaining [ symbols
      .replace(/\{/g, '') // Remove any remaining { symbols
      .replace(/\}/g, '') // Remove any remaining } symbols
      
      // Improve paragraph separation for better readability
      .replace(/"\s*,\s*"/g, '\n\n') // Replace comma-separated quotes with double line breaks
      .replace(/"\s*\}\s*,\s*\{/g, '\n\n') // Replace comma-separated objects with double line breaks
      .replace(/\s*\}\s*,\s*\{/g, '\n\n') // Replace comma-separated objects without quotes
      .replace(/"\s*,\s*\{/g, '\n\n') // Replace comma and opening brace with line breaks
      
      // Clean up any remaining JSON artifacts
      .replace(/"\s*:\s*"/g, '') // Remove key-value separators
      .replace(/:\s*"/g, '') // Remove remaining colons and quotes
      .replace(/^\s*"/g, '') // Remove leading quotes
      .replace(/"\s*$/g, '') // Remove trailing quotes
      
      // Final cleanup
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim();
    
    // If the result is too short or contains only symbols, return a fallback
    if (cleaned.length < 10 || /^[^\w\s]+$/.test(cleaned)) {
      return 'Contenido en análisis...';
    }
    
    return cleaned;
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCreateSession = async () => {
    if (onCreateSession) {
      await onCreateSession();
      setShowPaymentSection(true);
    }
  };

  const handleContinue = () => {
    onContinue();
  };

  if (!isOpen) return null;

  // Si el dashboard está expirado, mostrar mensaje de expiración
  if (isExpired) {
    return <ExpirationMessage onRenew={onRenew || (() => {})} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl sm:rounded-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-cyan-500/20 rounded-lg flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">🚀 Vista Previa Profunda de tu Plan de Negocio</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Análisis AI profesional completo - Solo una muestra de lo que obtendrás</p>
            </div>
            
            {/* Session Status Indicator */}
            {isSessionCreated && userEmail && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-500/20 border border-green-500/30 rounded-lg flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs sm:text-sm font-medium hidden sm:inline">
                  {userEmail.split('@')[0]} • Sesión activa
                </span>
                <span className="text-green-400 text-xs font-medium sm:hidden">
                  Activo
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Call-to-Action Banner - Outside scrollable content */}
        <div className="px-3 sm:px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-green-500/10 border-b border-cyan-500/20 flex-shrink-0">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 text-xs sm:text-sm">🔥</span>
              <span className="text-cyan-400 text-xs sm:text-sm font-medium">Acceso limitado - Solo por tiempo limitado</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Core Analysis */}
            <div className="space-y-4 sm:space-y-6">
              {/* Executive Summary - Always Expanded */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-green-500/10 border border-cyan-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">🎯 Resumen Ejecutivo Profundo</span>
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30 self-start sm:self-auto">
                    Análisis Completo
                  </span>
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    {(() => {
                      const summary = safeAiContent?.executiveSummary;
                      console.log('🔍 Executive Summary section - raw summary:', summary);
                      console.log('🔍 Executive Summary section - summary type:', typeof summary);
                      console.log('🔍 Executive Summary section - summary length:', summary?.length);
                      
                      if (summary && typeof summary === 'string' && summary.trim().length > 0) {
                        const cleanedSummary = cleanAiContent(summary);
                        console.log('🔍 Executive Summary section - cleaned summary:', cleanedSummary);
                        console.log('🔍 Executive Summary section - cleaned length:', cleanedSummary.length);
                        
                        // Ensure the content looks like an executive summary
                        if (cleanedSummary.length > 50 && !cleanedSummary.includes('{') && !cleanedSummary.includes('[')) {
                          console.log('🔍 Executive Summary section - returning cleaned summary');
                          return cleanedSummary;
                        } else {
                          console.log('🔍 Executive Summary section - summary rejected (too short or contains JSON symbols)');
                        }
                      } else {
                        console.log('🔍 Executive Summary section - no valid summary found');
                      }
                      return 'Análisis crítico profundo de la idea, problema, usuario, diferenciación, modelo de negocio y región...';
                    })()}
                  </p>
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-cyan-300 text-xs">
                      💡 <strong>Dashboard completo:</strong> Análisis ejecutivo personalizado con propuesta de valor, recomendaciones, tamaño de mercado y diferenciador.
                    </p>
                  </div>
                </div>
              </div>

              {/* Strong Point */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">✨ Punto Fuerte Identificado</span>
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 self-start sm:self-auto">
                    Validación IA
                  </span>
                </h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                  {(() => {
                    const strongPoint = safeAiContent?.strongPoint;
                    console.log('🔍 Strong Point section - raw strongPoint:', strongPoint);
                    console.log('🔍 Strong Point section - strongPoint type:', typeof strongPoint);
                    console.log('🔍 Strong Point section - strongPoint length:', strongPoint?.length);
                    
                    if (strongPoint && typeof strongPoint === 'string' && strongPoint.trim().length > 0) {
                      const cleanedPoint = cleanAiContent(strongPoint);
                      console.log('🔍 Strong Point section - cleaned point:', cleanedPoint);
                      console.log('🔍 Strong Point section - cleaned length:', cleanedPoint.length);
                      
                      // Ensure the content looks like a strong point analysis
                      if (cleanedPoint.length > 30 && !cleanedPoint.includes('{') && !cleanedPoint.includes('[')) {
                        console.log('🔍 Strong Point section - returning cleaned point');
                        return cleanedPoint;
                      } else {
                        console.log('🔍 Strong Point section - point rejected (too short or contains JSON symbols)');
                      }
                    } else {
                      console.log('🔍 Strong Point section - no valid strongPoint found');
                    }
                    return 'Validación prometedora de tu enfoque basada en análisis de mercado...';
                  })()}
                </p>
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-300 text-xs">
                    💡 <strong>Dashboard completo:</strong> Análisis de precios, competencia y estrategia para competir.
                  </p>
                </div>
              </div>

              {/* Critical Risks */}
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">⚠️ Riesgos Críticos Identificados</span>
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 self-start sm:self-auto">
                    Análisis Profundo
                  </span>
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {(() => {
                    console.log('🔍 Rendering critical risks section:');
                    console.log('🔍 safeCriticalRisks:', safeCriticalRisks);
                    console.log('🔍 safeCriticalRisks.length:', safeCriticalRisks.length);
                    console.log('🔍 safeCriticalRisks isArray:', Array.isArray(safeCriticalRisks));
                    
                                        // Ensure we only show actual risk content, not mixed data
                    if (safeCriticalRisks && Array.isArray(safeCriticalRisks) && safeCriticalRisks.length > 0) {
                      console.log('🔍 Critical Risks section - processing risks array:', safeCriticalRisks);
                      
                      // Filter out any non-risk content that might have been mixed in
                      const validRisks = safeCriticalRisks.filter(risk => {
                        if (typeof risk !== 'string') {
                          console.log('🔍 Critical Risks section - risk is not string:', risk);
                          return false;
                        }
                        
                        const cleanedRisk = cleanAiContent(risk);
                        console.log('🔍 Critical Risks section - cleaned risk:', cleanedRisk);
                        
                        // Check if the content looks like a risk (contains risk-related keywords)
                        const riskKeywords = ['riesgo', 'peligro', 'amenaza', 'desafío', 'obstáculo', 'limitación', 'debilidad', 'vulnerabilidad'];
                        const hasRiskKeyword = riskKeywords.some(keyword => cleanedRisk.toLowerCase().includes(keyword));
                        const isLongEnough = cleanedRisk.length > 20;
                        
                        console.log('🔍 Critical Risks section - hasRiskKeyword:', hasRiskKeyword, 'isLongEnough:', isLongEnough);
                        
                        return hasRiskKeyword || isLongEnough;
                      });
                      
                      console.log('🔍 Critical Risks section - valid risks filtered:', validRisks);
                      
                      if (validRisks.length > 0) {
                        console.log('🔍 Critical Risks section - rendering valid risks');
                        return validRisks.map((risk: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <span className="text-red-400 text-xs sm:text-sm mt-1 flex-shrink-0">⚠️</span>
                      <span className="text-gray-200 text-xs sm:text-sm">{cleanAiContent(risk)}</span>
                    </div>
                        ));
                      } else {
                        console.log('🔍 Critical Risks section - no valid risks after filtering');
                      }
                    } else {
                      console.log('🔍 Critical Risks section - no risks array or empty array');
                    }
                    
                    // Fallback content when no valid risks are available
                    console.log('🔍 Rendering fallback content - no valid risks available');
                    return (
                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <span className="text-red-400 text-xs sm:text-sm mt-1 flex-shrink-0">⚠️</span>
                        <span className="text-gray-200 text-xs sm:text-sm">Análisis de riesgos en progreso...</span>
                    </div>
                    );
                  })()}
                </div>
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-300 text-xs">
                    💡 <strong>Dashboard completo:</strong> Análisis detallado de 15+ riesgos con estrategias de mitigación
                  </p>
                </div>
              </div>

              {/* Actionable Recommendation */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">🚀 Recomendación Accionable</span>
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30 self-start sm:self-auto">
                    Próximo Paso
                  </span>
                </h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                  {(() => {
                    const recommendation = safeAiContent?.actionableRecommendation;
                    console.log('🔍 Actionable Recommendation section - raw recommendation:', recommendation);
                    console.log('🔍 Actionable Recommendation section - recommendation type:', typeof recommendation);
                    console.log('🔍 Actionable Recommendation section - recommendation length:', recommendation?.length);
                    
                    if (recommendation && typeof recommendation === 'string' && recommendation.trim().length > 0) {
                      const cleanedRecommendation = cleanAiContent(recommendation);
                      console.log('🔍 Actionable Recommendation section - cleaned recommendation:', cleanedRecommendation);
                      console.log('🔍 Actionable Recommendation section - cleaned length:', cleanedRecommendation.length);
                      
                      // Ensure the content looks like an actionable recommendation
                      if (cleanedRecommendation.length > 40 && !cleanedRecommendation.includes('{') && !cleanedRecommendation.includes('[')) {
                        console.log('🔍 Actionable Recommendation section - returning cleaned recommendation');
                        return cleanedRecommendation;
                      } else {
                        console.log('🔍 Actionable Recommendation section - recommendation rejected (too short or contains JSON symbols)');
                      }
                    } else {
                      console.log('🔍 Actionable Recommendation section - no valid recommendation found');
                    }
                    return 'Recomendación específica para mejorar tu enfoque antes de proceder...';
                  })()}
                </p>
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-xs">
                    💡 <strong>Dashboard completo:</strong> Plan de acción totalmente personalizado, estructura probada de 7 pasos con seguimiento para ir de idea a MVP.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Brand Names & Market Data */}
            <div className="space-y-4 sm:space-y-6">
              {/* Brand Names Section */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">🌟 Nombres de Marca Generados</span>
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30 self-start sm:self-auto">
                    {safeBrandSuggestions.length || 0}/5 Nombres
                  </span>
                </h3>
                
                {safeBrandSuggestions.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {safeBrandSuggestions.map((brand, index) => (
                      <div key={index} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <span className="text-purple-400 font-bold text-sm sm:text-lg">#{index + 1}</span>
                          <h4 className="text-white font-semibold text-sm sm:text-base flex-1 min-w-0">{brand}</h4>
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                        </div>
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                          {(() => {
                            const reasoning = safeBrandReasoning[index];
                            if (reasoning && typeof reasoning === 'string' && reasoning.trim().length > 0) {
                              const cleanedReasoning = cleanAiContent(reasoning);
                              // Ensure the content looks like brand reasoning
                              if (cleanedReasoning.length > 20 && !cleanedReasoning.includes('{') && !cleanedReasoning.includes('[')) {
                                return cleanedReasoning;
                              }
                            }
                            return 'Nombre estratégicamente seleccionado por IA basado en tu idea de negocio y mercado objetivo.';
                          })()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-400 mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-gray-400 text-xs sm:text-sm">Generando nombres de marca estratégicos...</p>
                  </div>
                )}
                
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-purple-300 text-xs">
                    💡 <strong>Dashboard completo:</strong> Capacidad de regenerar 2 rondas de nombres nuevas, verificar disponibilidad de dominio y marcar tu favorito
                  </p>
                </div>
              </div>

              {/* Market Intelligence */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base">📊 Inteligencia de Mercado</span>
                  </div>
                  {safeAiContent?.dataBackedInsights && (
                    <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 self-start sm:self-auto">
                      Datos Reales
                    </span>
                  )}
                </h3>
                
                {/* Market Size */}
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-medium text-indigo-300 mb-2 sm:mb-3">Tamaño del Mercado:</h4>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="p-2 sm:p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <span className="text-gray-400 text-xs">TAM (Total Addressable Market):</span>
                      <p className="text-white font-medium text-xs sm:text-sm">{safeToString(safeMarketSize?.totalAddressableMarket) || 'Análisis completo disponible en el dashboard'}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <span className="text-gray-400 text-xs">SAM (Serviceable Addressable Market):</span>
                      <p className="text-white font-medium text-xs sm:text-sm">{safeToString(safeMarketSize?.serviceableAddressableMarket) || 'Análisis completo disponible en el dashboard'}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <span className="text-gray-400 text-xs">SOM (Serviceable Obtainable Market):</span>
                      <p className="text-white font-medium text-xs sm:text-sm">{safeToString(safeMarketSize?.serviceableObtainableMarket) || 'Análisis completo disponible en el dashboard'}</p>
                    </div>
                  </div>
                </div>

                {/* Competitors */}
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-medium text-indigo-300 mb-2 sm:mb-3">Competidores Identificados:</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {safeCompetitors.slice(0, 3).map((competitor: any, index: number) => (
                      <div key={index} className="p-3 sm:p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <div className="mb-2">
                          <h5 className="text-white font-semibold text-sm sm:text-base mb-1">{competitor.name}</h5>
                          {competitor.description && (
                            <p className="text-indigo-300 text-xs sm:text-sm leading-relaxed mb-2">{competitor.description}</p>
                          )}
                        </div>
                        <div>
                          <span className="text-indigo-400 text-xs font-medium">Tráfico:</span>
                          <p className="text-indigo-300 text-xs sm:text-sm mt-1">
                            {safeToString(competitor.traffic) || 'Sin datos de tráfico'}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="p-3 sm:p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <span className="text-gray-300 text-xs sm:text-sm">Análisis de competencia completo disponible en el dashboard</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Strategic Insights */}
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-indigo-300 mb-2 sm:mb-3">Insights Estratégicos:</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {(() => {
                      const insights = safeInsights?.strategicRecommendations;
                      if (insights && Array.isArray(insights) && insights.length > 0) {
                        // Filter out any non-insight content that might have been mixed in
                        const validInsights = insights.filter(insight => {
                          if (typeof insight !== 'string') return false;
                          const cleanedInsight = cleanAiContent(insight);
                          // Check if the content looks like a strategic insight
                          const insightKeywords = ['estratégico', 'recomendación', 'oportunidad', 'ventaja', 'diferencia', 'enfoque', 'estrategia'];
                          return insightKeywords.some(keyword => cleanedInsight.toLowerCase().includes(keyword)) || cleanedInsight.length > 25;
                        });
                        
                        if (validInsights.length > 0) {
                          return validInsights.slice(0, 3).map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <span className="text-indigo-400 text-xs sm:text-sm mt-1 flex-shrink-0">💡</span>
                        <span className="text-gray-200 text-xs sm:text-sm">{cleanAiContent(insight)}</span>
                      </div>
                          ));
                        }
                      }
                      
                      // Fallback content when no valid insights are available
                      return (
                      <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <span className="text-indigo-400 text-xs sm:text-sm mt-1 flex-shrink-0">💡</span>
                          <span className="text-gray-200 text-xs sm:text-sm">Análisis estratégico completo disponible en el dashboard</span>
                      </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Intelligent Competitor Search Results */}
              {safeAiContent?.intelligentlySearched && (
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm sm:text-base">🔍 Búsqueda Inteligente de Competidores</span>
                    </div>
                    <span className="px-2 sm:px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 self-start sm:self-auto">
                      IA Automática
                    </span>
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <h4 className="text-xs sm:text-sm font-medium text-emerald-300 mb-2">Competidores Identificados Automáticamente:</h4>
                      <p className="text-gray-200 text-xs sm:text-sm">
                        La IA identificó competidores relevantes basándose en tu idea "{userInputs.idea}" en {userInputs.region}
                      </p>
                    </div>
                    
                    {safeSearchQueries.length > 0 && (
                      <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <h4 className="text-xs sm:text-sm font-medium text-emerald-300 mb-2">Búsquedas Realizadas:</h4>
                        <div className="space-y-1 sm:space-y-2">
                          {safeSearchQueries.map((query, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-emerald-400 text-xs flex-shrink-0">🔍</span>
                              <span className="text-gray-200 text-xs">{cleanAiContent(query)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <p className="text-emerald-300 text-xs">
                      💡 <strong>Dashboard completo:</strong> Obtendrás un análisis de precios sobre los competidores que nos mencionas y otros que podamos encontrar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Context Form */}
        </div>

        {/* Footer Actions - STICKY, always visible */}
        <div className="p-3 sm:p-6 border-t border-gray-700 bg-gray-800/30 flex-shrink-0">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between items-center">
              <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                <span className="text-cyan-400">✓</span> Vista previa generada con AI profesional
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {onExportPDF && (
                <button
                    onClick={onExportPDF}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg sm:rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Exportar PDF
                  </button>
                )}
                {/* Botón Crear Sesión - Se oculta después de crear la sesión */}
                {onCreateSession && !isSessionCreated && (
                  <button
                    onClick={handleCreateSession}
                    disabled={isCreatingSession}
                    className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg transform hover:from-cyan-600 hover:via-green-600 hover:to-blue-700 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    {isCreatingSession ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Creando tu acceso...</span>
                        <span className="sm:hidden">Creando...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">🚀 ¡Desbloquea tu Plan Completo!</span>
                        <span className="sm:hidden">🚀 Desbloquear</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                )}

                {/* Botón Desbloquear Dashboard - Solo aparece cuando la sesión esté creada */}
                {isSessionCreated && (
                <button
                  onClick={handleContinue}
                  disabled={!isDashboardUnlocked}
                  className={`px-4 sm:px-8 py-3 sm:py-4 font-semibold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg transform text-xs sm:text-sm ${
                    isDashboardUnlocked
                        ? 'bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white hover:from-cyan-600 hover:via-green-600 hover:to-blue-700 shadow-cyan-500/25 hover:scale-105 cursor-pointer'
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isDashboardUnlocked ? (
                    <>
                      <span className="hidden sm:inline">🚀 Desbloquear Dashboard Completo</span>
                      <span className="sm:hidden">🚀 Desbloquear</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">🔒 Dashboard Bloqueado</span>
                      <span className="sm:hidden">🔒 Bloqueado</span>
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </button>
                )}
              </div>
            </div>
            
            {/* Payment Section - Only shows after creating session */}
            {showPaymentSection && !isDashboardUnlocked && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-cyan-500/10 via-green-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg sm:rounded-xl">
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">🎯 ¡Casi listo!</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Solo falta completar el pago para desbloquear tu análisis completo
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-xs sm:text-sm font-medium">Análisis completo bloqueado</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Accede a todas las secciones detalladas por solo €5
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Crear URL de redirección con parámetros de sesión y pago exitoso
                      const currentUrl = window.location.origin + window.location.pathname;
                      const redirectUrl = `${currentUrl}?session_email=${encodeURIComponent(userInputs.idea.split(' ')[0] + '@example.com')}&session_password=${encodeURIComponent('temp_password')}&session_preview_id=${previewSessionId}&payment_success=true&return_to_preview=true`;
                      
                      // Abrir Stripe con URL de redirección
                      const stripeUrl = `https://buy.stripe.com/test_7sY4gzcpB2n8d8M3ZSgjC00?success_url=${encodeURIComponent(redirectUrl)}`;
                      window.location.href = stripeUrl;
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:via-green-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    💳 Pagar €5 y Desbloquear
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPreview;

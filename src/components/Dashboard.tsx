import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Wrench, 
  CheckSquare,
  Download,
  ExternalLink,
  Zap,
  Calculator,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  FileText,
  Play,
  User,
  BookOpen,
  Users,
  Target,
  Rocket,
  Tag,
  RefreshCw,
  Menu,
  X,
  Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import { AIService, BusinessData, GeneratedContent } from '../services/aiService';
import { EmailService } from '../services/emailService';
import { AirtableService } from '../services/airtableService';
import { UserLogin } from './UserLogin';
import { PasswordDisplay } from './PasswordDisplay';
import { safeObjectKeys, safeObjectEntries } from '../utils/safeObjectUtils';
import DomainChecker from './DomainChecker';
import ExpirationMessage from './ExpirationMessage';
import { calculateDeadlines, getDeadlineInfo, getUrgencyColor, getDeadlineIcon, formatDeadlineDate } from '../utils/deadlineUtils';

interface DashboardProps {
  name: string;
  email: string;
  idea: string;
  problem: string;
  idealUser: string;
  region: string;
  alternatives: string;
  businessModel: string;
  projectType: string;
  onBack: () => void;
  existingAIContent?: any; // Full dashboard AI content from Airtable
  previewContent?: any; // Preview AI content (not used for full dashboard)
  previewSessionId?: string; // Preview session ID for Airtable updates
  dashboardId?: string; // Full dashboard ID for Airtable updates
  isExpired?: boolean; // Whether the dashboard has expired
  onRenew?: () => void; // Function to handle renewal
}

const Dashboard: React.FC<DashboardProps> = ({ name, email, idea, problem, idealUser, region, alternatives, businessModel, projectType, onBack, existingAIContent, previewContent, previewSessionId, dashboardId, isExpired = false, onRenew }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [stepNotes, setStepNotes] = useState<{[key: number]: string}>({});
  const [actionPlanDeadlines, setActionPlanDeadlines] = useState<string[]>([]);
  const [bitacoraDeadlines, setBitacoraDeadlines] = useState<string[]>([]);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackEmails, setFeedbackEmails] = useState(['', '', '']);
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  // Estados para sistema de sesión
  const [showLogin, setShowLogin] = useState(false);
  const [showPasswordDisplay, setShowPasswordDisplay] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(false);
  const [isPaymentRegistered, setIsPaymentRegistered] = useState(false);
  const [socialShares, setSocialShares] = useState({
    twitter: { shared: false, interactions: 0 },
    linkedin: { shared: false, interactions: 0 }
  });
  const [showBitacora, setShowBitacora] = useState(false);
  const [copyNotification, setCopyNotification] = useState<{text: string, show: boolean}>({text: '', show: false});
  const [recentlyCopied, setRecentlyCopied] = useState<string[]>([]);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfNotification, setPdfNotification] = useState<{type: 'success' | 'error', message: string, show: boolean}>({
    type: 'success',
    message: '',
    show: false
  });

  // AI-generated content state
  const [aiContent, setAiContent] = useState<GeneratedContent | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Progressive loading states for each section
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());
  const [sectionLoadingStates, setSectionLoadingStates] = useState<Record<string, boolean>>({});
  
  // Business sub-sections state
  const [businessSubSections, setBusinessSubSections] = useState<{
    propuestaValor: string;
    modeloNegocio: string;
    ventajaCompetitiva: string;
  } | null>(null);

  // Pricing sub-sections state
  const [pricingSubSections, setPricingSubSections] = useState<{
    modeloPrecios: string;
    estrategiaCompetitiva: string;
    recomendaciones: string;
    analisisCompetidores: string;
  } | null>(null);

  // Brand regeneration state
  const [regenerationAttempts, setRegenerationAttempts] = useState(0);
  const [isRegeneratingNames, setIsRegeneratingNames] = useState(false);
  const [favoriteName, setFavoriteName] = useState<string>('');

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);


  // Function to mark a section as loaded
  const markSectionLoaded = (sectionName: string) => {
    setLoadedSections(prev => new Set(prev).add(sectionName));
    setSectionLoadingStates(prev => ({ ...prev, [sectionName]: false }));
  };

  // Function to mark a section as loading
  const markSectionLoading = (sectionName: string, isLoading: boolean) => {
    setSectionLoadingStates(prev => ({ ...prev, [sectionName]: isLoading }));
  };


  // Function to handle favorite name selection
  const handleFavoriteNameChange = (name: string) => {
    if (favoriteName === name) {
      // If clicking the same name, uncheck it
      setFavoriteName('');
    } else {
      // Set new favorite name (only one allowed)
      setFavoriteName(name);
    }
  };

  // Function to regenerate brand names
  const handleRegenerateNames = async () => {
    if (regenerationAttempts >= 2) {
      return; // Maximum attempts reached
    }
    
    console.log('🔄 Starting brand name regeneration...');
    console.log('📊 Current regeneration attempts:', regenerationAttempts);
    
    setIsRegeneratingNames(true);
    try {
      const businessData: BusinessData = {
        idea,
        problem,
        idealUser,
        region,
        alternatives,
        businessModel,
        projectType
      };
      
      console.log('📝 Business data for regeneration:', businessData);
      
      // Add a longer delay and random seed to ensure AI generates different content
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add random seed to business data to force different results
      const businessDataWithSeed = {
        ...businessData,
        randomSeed: Date.now() + Math.random() * 1000,
        regenerationAttempt: regenerationAttempts + 1
      };
      
      console.log('🌱 Business data with seed for regeneration:', businessDataWithSeed);
      
      const brandData = await AIService.generateBrandSuggestions(businessDataWithSeed);
      
      console.log('✅ New brand data received:', brandData);
      console.log('🆕 New names:', brandData.names);
      console.log('🆕 New reasoning:', brandData.reasoning);
      
      // Check if names are actually different
      const currentNames = aiContent?.brandSuggestions || [];
      const namesChanged = JSON.stringify(brandData.names) !== JSON.stringify(currentNames);
      
      console.log('🔄 Names changed?', namesChanged);
      console.log('📊 Old names:', currentNames);
      console.log('📊 New names:', brandData.names);
      
      // Always update the content with new names
      setAiContent(prev => prev ? {
        ...prev,
        brandSuggestions: brandData.names,
        brandReasoning: brandData.reasoning
      } : null);
      
      // Update Airtable with new brand suggestions and reasoning
      const currentDashboardId = dashboardId || previewSessionId;
      if (currentDashboardId) {
        try {
          console.log('💾 Updating Airtable with new brand suggestions and reasoning...');
          console.log('📝 Brand names to save:', brandData.names);
          console.log('📝 Brand reasoning to save:', brandData.reasoning);
          
          // Update brand suggestions
          const updateNamesResult = await AirtableService.updateDashboardField(currentDashboardId, 'brand_suggestions', brandData.names);
          if (updateNamesResult.success) {
            console.log('✅ Brand suggestions updated in Airtable successfully');
          } else {
            console.warn('⚠️ Failed to update brand suggestions in Airtable:', updateNamesResult.error);
          }
          
          // Update brand reasoning
          const updateReasoningResult = await AirtableService.updateDashboardField(currentDashboardId, 'brand_reasoning', brandData.reasoning);
          if (updateReasoningResult.success) {
            console.log('✅ Brand reasoning updated in Airtable successfully');
          } else {
            console.warn('⚠️ Failed to update brand reasoning in Airtable:', updateReasoningResult.error);
          }
        } catch (airtableError) {
          console.error('❌ Error updating brand data in Airtable:', airtableError);
        }
      } else {
        console.warn('⚠️ No dashboard ID available, cannot update Airtable');
      }
      
      setRegenerationAttempts(prev => prev + 1);
      
      // Show success notification
      setCopyNotification({
        text: `Nombres regenerados exitosamente (${regenerationAttempts + 1}/2)`,
        show: true
      });
      setTimeout(() => setCopyNotification({ text: '', show: false }), 3000);
      
    } catch (error) {
      console.error('❌ Error regenerating brand names:', error);
      setCopyNotification({
        text: 'Error al regenerar nombres. Intenta de nuevo.',
        show: true
      });
      setTimeout(() => setCopyNotification({ text: '', show: false }), 3000);
    } finally {
      setIsRegeneratingNames(false);
    }
  };

  // Helper function to format market size values correctly
  const formatMarketSizeValue = (text: string): string => {
    if (!text) return 'Analizando...';
    
    console.log('🔍 Formatting market size value from text:', text);
    
    // Look for monetary values in the text
    const moneyPatterns = [
      // Match patterns like: 50M+, 100B+, 25K+ (with + symbol)
      /(\d+(?:\.\d+)?)([KMB])\+/gi,
      // Match patterns like: $50M, $100B, $25K, etc.
      /\$(\d+(?:\.\d+)?)([KMB])/gi,
      // Match patterns like: 50M, 100B, 25K, etc.
      /(\d+(?:\.\d+)?)([KMB])/gi,
      // Match patterns like: $50 million, $100 billion, etc.
      /\$(\d+(?:\.\d+)?)\s*(million|billion|thousand)/gi,
      // Match patterns like: 50 million, 100 billion, etc.
      /(\d+(?:\.\d+)?)\s*(million|billion|thousand)/gi
    ];
    
    for (let i = 0; i < moneyPatterns.length; i++) {
      const pattern = moneyPatterns[i];
      const matches = text.match(pattern);
      
      if (matches && matches.length > 0) {
        const match = matches[0];
        console.log(`✅ Format pattern ${i + 1} matched:`, match);
        
        // Extract number and unit
        let number: string;
        let unit: string;
        
        if (match.includes('$')) {
          // Format: $50M or $50 million
          const parts = match.replace('$', '').split(/([KMB]|million|billion|thousand)/);
          number = parts[0];
          unit = parts[1];
        } else {
          // Format: 50M+, 100B+, 25K+ or 50M, 100B, 25K
          const parts = match.split(/([KMB]|million|billion|thousand)/);
          number = parts[0];
          unit = parts[1];
        }
        
        console.log('📊 Format extracted parts:', { number, unit, originalMatch: match });
        
        // Convert text units to letters
        if (unit?.toLowerCase().includes('thousand')) unit = 'K';
        else if (unit?.toLowerCase().includes('million')) unit = 'M';
        else if (unit?.toLowerCase().includes('billion')) unit = 'B';
        
        // Return formatted value
        if (number && unit) {
          const result = `${number}${unit}+`;
          console.log('🎯 Formatted result:', result);
          return result;
        }
      }
    }
    
    console.log('❌ No monetary patterns found for formatting, returning: Analizando...');
    // If no monetary value found, return default
    return 'Analizando...';
  };

  // Helper function to get market size description and trend
  const getMarketSizeDescription = (text: string): string => {
    if (!text) return 'Valor de mercado';
    
    // Extract the first monetary value to determine market size
    const moneyPatterns = [
      /\$(\d+(?:\.\d+)?)([KMB])/gi,
      /(\d+(?:\.\d+)?)([KMB])/gi,
      /\$(\d+(?:\.\d+)?)\s*(million|billion|thousand)/gi,
      /(\d+(?:\.\d+)?)\s*(million|billion|thousand)/gi
    ];
    
    for (const pattern of moneyPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const match = matches[0];
        
        // Extract number and unit
        let number: string;
        let unit: string;
        
        if (match.includes('$')) {
          const parts = match.replace('$', '').split(/([KMB]|million|billion|thousand)/);
          number = parts[0];
          unit = parts[1];
        } else {
          const parts = match.split(/([KMB]|million|billion|thousand)/);
          number = parts[0];
          unit = parts[1];
        }
        
        // Convert text units to letters
        if (unit?.toLowerCase().includes('thousand')) unit = 'K';
        else if (unit?.toLowerCase().includes('million')) unit = 'M';
        else if (unit?.toLowerCase().includes('billion')) unit = 'B';
        
        if (number && unit) {
          const numValue = parseFloat(number);
          
          // Determine market size category based on value and unit
          if (unit === 'B') {
            if (numValue >= 100) return 'Mercado masivo global';
            if (numValue >= 50) return 'Mercado continental';
            if (numValue >= 10) return 'Mercado regional grande';
            return 'Mercado regional';
          } else if (unit === 'M') {
            if (numValue >= 1000) return 'Mercado nacional grande';
            if (numValue >= 500) return 'Mercado nacional';
            if (numValue >= 100) return 'Mercado regional';
            if (numValue >= 50) return 'Mercado local grande';
            return 'Mercado local';
          } else if (unit === 'K') {
            if (numValue >= 1000) return 'Mercado local grande';
            if (numValue >= 500) return 'Mercado local';
            return 'Mercado nicho';
          }
        }
      }
    }
    
    return 'Valor de mercado';
  };

  // Helper function to determine market size category (Alto, Medio, Bajo)
  const getMarketSizeCategory = (text: string): string => {
    if (!text) return 'Analizando...';
    
    // Check if market is decreasing (automatic "Bajo" for declining markets)
    const declineKeywords = ['declive', 'decline', 'disminución', 'decrease', 'contracción', 'contraction', 'reducción', 'reduction'];
    const lowerText = text.toLowerCase();
    if (declineKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'Bajo';
    }
    
    // Extract monetary values with improved patterns
    const moneyPatterns = [
      // Match patterns like: 50M+, 100B+, 25K+ (with + symbol)
      /(\d+(?:\.\d+)?)([KMB])\+/gi,
      // Match patterns like: 50M, 100B, 25K (without symbols)
      /(\d+(?:\.\d+)?)([KMB])/gi,
      // Match patterns like: $50M, $100B, $25K (with $ symbol)
      /\$(\d+(?:\.\d+)?)([KMB])/gi,
      // Match patterns like: 50 million, 100 billion, etc.
      /(\d+(?:\.\d+)?)\s*(million|billion|thousand)/gi,
      // Match patterns like: $50 million, $100 billion, etc.
      /\$(\d+(?:\.\d+)?)\s*(million|billion|thousand)/gi
    ];
    
    for (const pattern of moneyPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const match = matches[0];
        
        // Extract number and unit
        let number: string;
        let unit: string;
        
        if (match.includes('$')) {
          const parts = match.replace('$', '').split(/([KMB]|million|billion|thousand)/);
          number = parts[0];
          unit = parts[1];
        } else {
          const parts = match.split(/([KMB]|million|billion|thousand)/);
          number = parts[0];
          unit = parts[1];
        }
        
        // Convert text units to letters
        if (unit?.toLowerCase().includes('thousand')) unit = 'K';
        else if (unit?.toLowerCase().includes('million')) unit = 'M';
        else if (unit?.toLowerCase().includes('billion')) unit = 'B';
        
        if (number && unit) {
          const numValue = parseFloat(number);
          
          // Updated formula based on your requirements
          if (unit === 'B') {
            if (numValue >= 100) return 'Alto';      // 100B+ = Alto
            if (numValue >= 10) return 'Medio';     // 10B+ = Medio
            return 'Bajo';                          // <10B = Bajo
          } else if (unit === 'M') {
            if (numValue >= 100) return 'Alto';     // 100M+ = Alto
            if (numValue >= 9) return 'Medio';      // 9M+ = Medio (your requirement)
            return 'Bajo';                          // <9M = Bajo
          } else if (unit === 'K') {
            if (numValue >= 1000) return 'Medio';   // 1000K+ = Medio
            return 'Bajo';                          // <1000K = Bajo
          }
        }
      }
    }
    
    // If no monetary value found, check for other indicators
    if (lowerText.includes('pequeño') || lowerText.includes('small') || lowerText.includes('limitado') || lowerText.includes('limited')) {
      return 'Bajo';
    }
    
    return 'Analizando...';
  };

  // Helper function to determine market trend
  const getMarketTrend = (text: string): { emoji: string; description: string } => {
    if (!text) return { emoji: '📊', description: 'Analizando tendencias' };
    
    // Look for growth indicators in the text
    const growthKeywords = ['crecimiento', 'growth', 'aumento', 'incremento', 'expansión', 'expansion'];
    const stableKeywords = ['estable', 'stable', 'consolidado', 'consolidated', 'maduro', 'mature'];
    const declineKeywords = ['declive', 'decline', 'disminución', 'decrease', 'contracción', 'contraction'];
    
    const lowerText = text.toLowerCase();
    
    // Check for growth indicators
    if (growthKeywords.some(keyword => lowerText.includes(keyword))) {
      return { emoji: '↗️', description: 'Mercado en crecimiento' };
    }
    
    // Check for stable indicators
    if (stableKeywords.some(keyword => lowerText.includes(keyword))) {
      return { emoji: '→', description: 'Mercado estable' };
    }
    
    // Check for decline indicators
    if (declineKeywords.some(keyword => lowerText.includes(keyword))) {
      return { emoji: '↘️', description: 'Mercado en declive' };
    }
    
    // Default: analyze based on market size (larger markets tend to be more stable)
    const marketSize = getMarketSizeCategory(text);
    if (marketSize === 'Alto') {
      return { emoji: '→', description: 'Mercado estable' };
    } else if (marketSize === 'Medio') {
      return { emoji: '↗️', description: 'Mercado en crecimiento' };
    } else {
      return { emoji: '↗️', description: 'Mercado emergente' };
    }
  };

  // Helper function to clean and limit market size content
  const cleanAndLimitMarketSizeContent = (content: string): string => {
    if (!content) return '';
    
    // Remove AI formatting symbols and clean up text
    let cleaned = content
      .replace(/\*/g, '') // Remove asterisks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/`/g, '') // Remove backticks
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\s+/g, ' '); // Normalize spaces
    
    // Split into sentences for better structure
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Count words and limit to 300
    const words = cleaned.split(/\s+/);
    if (words.length <= 300) {
      // Add tooltips for market acronyms
      cleaned = addMarketAcronymTooltips(cleaned);
      // Add better bullet separation
      cleaned = cleaned.replace(/\s*•\s*/g, '\n\n• ');
      return cleaned;
    }
    
    // If over 300 words, take first sentences that fit within limit
    let result = '';
    let wordCount = 0;
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(/\s+/).length;
      if (wordCount + sentenceWords <= 300) {
        result += sentence.trim() + '. ';
        wordCount += sentenceWords;
      } else {
        break;
      }
    }
    
    // Ensure the result ends properly
    result = result.trim();
    if (!result.endsWith('.')) {
      result += '.';
    }
    
    // Add tooltips for market acronyms
    result = addMarketAcronymTooltips(result);
    
    // Add better bullet separation
    result = result.replace(/\s*•\s*/g, '\n\n• ');
    
    return result;
  };

  // Helper function to parse market size content into sections
  const parseMarketSizeSections = (content: string) => {
    if (!content) return null;
    
    // Split content by bullets (•)
    const sections = content.split(/\s*•\s*/).filter(section => section.trim().length > 0);
    
    // Map sections to their titles
    const parsedSections: { [key: string]: string } = {};
    
    sections.forEach((section, index) => {
      const trimmedSection = section.trim();
      if (trimmedSection) {
        // Extract title from first part of section
        const colonIndex = trimmedSection.indexOf(':');
        if (colonIndex > 0) {
          const title = trimmedSection.substring(0, colonIndex).trim();
          const content = trimmedSection.substring(colonIndex + 1).trim();
          parsedSections[title] = content;
        } else {
          // If no colon, use index-based title
          const titles = ['TAM', 'SAM', 'SOM', 'Factores de Crecimiento', 'Barreras de Entrada'];
          if (titles[index]) {
            parsedSections[titles[index]] = trimmedSection;
          }
        }
      }
    });
    
    return parsedSections;
  };

  // Helper function to add tooltips for market acronyms
  const addMarketAcronymTooltips = (content: string): string => {
    if (!content) return content;
    
    // Add tooltips for TAM, SAM, SOM
    return content
      .replace(/\bTAM\b/g, '<span class="cursor-help border-b border-dotted border-blue-400" title="Total Addressable Market - El mercado total disponible para tu producto o servicio">TAM</span>')
      .replace(/\bSAM\b/g, '<span class="cursor-help border-b border-dotted border-green-400" title="Serviceable Addressable Market - El mercado que realmente puedes atender con tus recursos">SAM</span>')
      .replace(/\bSOM\b/g, '<span class="cursor-help border-b border-dotted border-cyan-400" title="Serviceable Obtainable Market - El mercado que realmente puedes capturar en 3-5 años">SOM</span>');
  };

  // Helper functions for market research
  const generatePrimarySearchTerms = (idea: string, projectType: string) => {
    const baseTerms = [
      `"${idea}" mercado`,
      `"${idea}" competencia`,
      `"${idea}" demanda`,
      `"${idea}" tendencias`,
      `"${idea}" validación`
    ];
    
    // Add project-type specific terms
    if (projectType === 'SaaS') {
      baseTerms.push(`"${idea}" software`, `"${idea}" aplicación`, `"${idea}" herramienta`);
    } else if (projectType === 'Ecommerce') {
      baseTerms.push(`"${idea}" tienda`, `"${idea}" venta`, `"${idea}" producto`);
    } else if (projectType === 'Service') {
      baseTerms.push(`"${idea}" consultoría`, `"${idea}" asesoría`, `"${idea}" servicio`);
    } else if (projectType === 'Physical Product') {
      baseTerms.push(`"${idea}" invento`, `"${idea}" innovación`, `"${idea}" patente`);
    }
    
    return baseTerms.slice(0, 5);
  };

  const generateMarketValidationTopics = (idea: string, projectType: string) => {
    const topics = [
      `Demanda real de "${idea}"`,
      `Competencia directa para "${idea}"`,
      `Tendencias de adopción para "${idea}"`,
      `Barreras de entrada para "${idea}"`,
      `Validación de precio para "${idea}"`
    ];
    
    // Add project-type specific validation topics
    if (projectType === 'SaaS') {
      topics.push(`Alternativas software a "${idea}"`, `Integración de "${idea}"`);
    } else if (projectType === 'Ecommerce') {
      topics.push(`Nicho de mercado para "${idea}"`, `Logística de "${idea}"`);
    } else if (projectType === 'Service') {
      topics.push(`Expertise necesario para "${idea}"`, `Credibilidad de "${idea}"`);
    } else if (projectType === 'Physical Product') {
      topics.push(`Manufactura de "${idea}"`, `Distribución de "${idea}"`);
    }
    
    return topics.slice(0, 4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show notification
      setCopyNotification({text: text, show: true});
      // Add to recently copied list
      setRecentlyCopied(prev => [text, ...prev.filter(t => t !== text)].slice(0, 3));
      setTimeout(() => {
        setCopyNotification({text: '', show: false});
      }, 2000);
      // Remove from recently copied after 3 seconds
      setTimeout(() => {
        setRecentlyCopied(prev => prev.filter(t => t !== text));
      }, 3000);
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyNotification({text: text, show: true});
        setRecentlyCopied(prev => [text, ...prev.filter(t => t !== text)].slice(0, 3));
        setTimeout(() => {
          setCopyNotification({text: '', show: false});
        }, 2000);
        setTimeout(() => {
          setRecentlyCopied(prev => prev.filter(t => t !== text));
        }, 3000);
      } catch (err) {
        console.error('Fallback copy failed: ', err);
      }
      document.body.removeChild(textArea);
    });
  };







  // Tab navigation sections
  const sections = [
    { id: 'resumen', label: 'Resumen y mercado' },
    { id: 'marcas', label: 'Nombre y precios' },
    { id: 'herramientas', label: 'Herramientas y recursos' },
    { id: 'plan', label: 'Plan de acción' },
    { id: 'validacion', label: 'Validación de mercado' },
    { id: 'bitacora', label: 'Bitácora del Proyecto', special: true }
  ];

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'bitacora') {
      setShowBitacora(true);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      const headerHeight = 120; // Account for sticky tabs + spacer
      const elementPosition = el.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Personalized steps based on user input
  const personalizedSteps = [
    `Definir tu ${projectType === 'SaaS' ? 'MVP y funcionalidades core' : projectType === 'Physical Product' ? 'prototipo y materiales' : projectType === 'Ecommerce' ? 'catálogo inicial y proveedores' : projectType === 'Service' ? 'paquetes de servicio y precios' : 'propuesta de valor única'}`,
    `Identificar tu mercado objetivo en ${region === 'latam' ? 'Latinoamérica' : region === 'usa' ? 'Estados Unidos' : region === 'europa' ? 'Europa' : region === 'asia' ? 'Asia' : 'mercados globales'}`,
    `Crear landing page ${projectType === 'SaaS' ? 'con demo' : projectType === 'Ecommerce' ? 'con catálogo' : 'explicativa'}`,
    `Validar con ${projectType === 'SaaS' ? '50 usuarios beta' : projectType === 'Physical Product' ? '20 potenciales compradores' : projectType === 'Ecommerce' ? '100 visitantes' : '30 clientes potenciales'}`,
    `Configurar ${projectType === 'SaaS' ? 'sistema de suscripciones' : projectType === 'Ecommerce' ? 'pasarela de pagos' : 'método de cobro'}`,
    `Lanzar campaña de marketing en ${region === 'latam' ? 'redes sociales locales' : region === 'usa' ? 'Google Ads y LinkedIn' : region === 'europa' ? 'canales europeos' : 'plataformas regionales'}`,
  ];

  const [showSocialStats, setShowSocialStats] = useState(false);

  const getNextStepRecommendation = () => {
    const completionRate = completedSteps.length / personalizedSteps.length;
    
    
    if (completionRate === 0) {
      return {
        stage: 'Empezando',
        title: 'Aún sin clientes',
        description: 'Tu idea necesita estructura y validación inicial. Comienza organizando tus tareas y validando la demanda.',
        priority: 'high',
        actions: [
          {
            title: 'Organizar el caos',
            description: 'Estructura tu idea con metodología probada',
            cta: 'Ir a Kônsul Tasks',
            type: 'primary',
            icon: 'Zap',
            action: () => handleKonsulTasks()
          },
          {
            title: 'Validar demanda',
            description: 'Confirma que tu idea resuelve un problema real',
            cta: 'Crear encuesta',
            type: 'secondary',
            icon: 'Target',
            action: () => window.open('https://forms.google.com', '_blank')
          }
        ]
      };
    } else if (completionRate < 0.5) {
      return {
        stage: 'Validando',
        title: 'Validación inicial',
        description: 'Has comenzado bien. Ahora necesitas feedback real de tu mercado objetivo y completar la validación.',
        priority: 'medium',
        actions: [
          {
            title: 'Conseguir feedback',
            description: 'Obtén opiniones honestas de tu mercado objetivo',
            cta: 'Conectar con mentor',
            type: 'primary',
            icon: 'Users',
            action: () => window.open('https://calendly.com/mentor-session', '_blank')
          },
          {
            title: 'Crear mini-pitch',
            description: 'Prepara tu presentación de 2 minutos',
            cta: 'Exportar mini-pitch',
            type: 'secondary',
            icon: 'FileText',
            action: () => console.log('Exportando mini-pitch...')
          }
        ]
      };
    } else if (completionRate < 0.8) {
      return {
        stage: 'Avanzando',
        title: 'Validación avanzada',
        description: 'Excelente progreso. Es momento de preparar el lanzamiento y definir tu estrategia de monetización.',
        priority: 'medium',
        actions: [
          {
            title: 'Preparar lanzamiento',
            description: 'Organiza tu go-to-market strategy',
            cta: 'Ir a Kônsul Tasks',
            type: 'primary',
            icon: 'Rocket',
            action: () => handleKonsulTasks()
          },
          {
            title: 'Configurar pagos',
            description: 'Prepara tu sistema de monetización',
            cta: 'Setup Stripe',
            type: 'secondary',
            icon: 'CreditCard',
            action: () => window.open('https://stripe.com/docs/billing', '_blank')
          }
        ]
      };
    } else if (completionRate === 1) {
      return {
        stage: 'MVP con Tracción',
        title: '¡Plan de Acción Completado!',
        description: '¡Excelente! Has completado todos los 7 pasos del plan de acción. Ahora es momento de crear un MVP que genere tracción real en el mercado.',
        priority: 'high',
        actions: [
          {
            title: 'Construir MVP Funcional',
            description: 'Desarrolla la versión mínima viable de tu producto que resuelva el problema principal',
            cta: 'Comenzar desarrollo',
            type: 'primary',
            icon: 'Rocket',
            action: () => {
              console.log('🚀 Iniciando desarrollo del MVP...');
              // Open development resources
              window.open('https://www.notion.so/templates/startup-mvp', '_blank');
            }
          },
          {
            title: 'Lanzar Beta Privado',
            description: 'Invita a 10-20 usuarios reales para probar tu MVP y obtener feedback crítico',
            cta: 'Crear lista beta',
            type: 'primary',
            icon: 'Users',
            action: () => {
              console.log('👥 Creando lista de usuarios beta...');
              // Open beta testing platform
              window.open('https://www.betabound.com/', '_blank');
            }
          },
          {
            title: 'Medir Métricas Clave',
            description: 'Implementa tracking de engagement, retención y conversión desde el día 1',
            cta: 'Configurar analytics',
            type: 'primary',
            icon: 'TrendingUp',
            action: () => {
              console.log('📊 Configurando métricas clave...');
              // Open analytics setup guide
              window.open('https://analytics.google.com/', '_blank');
            }
          }
        ]
      };
    } else {
      return {
        stage: 'Listo',
        title: 'Listo para facturar',
        description: '¡Felicitaciones! Has completado la validación. Es hora de lanzar y generar tus primeros ingresos.',
        priority: 'low',
        actions: [
          {
            title: 'Gestionar finanzas',
            description: 'Controla ingresos, gastos y métricas clave',
            cta: 'Ir a Kônsul Bills',
            type: 'primary',
            icon: 'Calculator',
            action: () => handleKonsulBills()
          },
          {
            title: 'Escalar negocio',
            description: 'Optimiza procesos y busca crecimiento',
            cta: 'Ver estrategias',
            type: 'secondary',
            icon: 'TrendingUp',
            action: () => console.log('Mostrando estrategias de escalamiento...')
          }
        ]
      };
    }
  };

  const nextStepRecommendation = getNextStepRecommendation();



  const tools = [
    {
      category: 'Design / Productivity',
      items: [
        { 
          name: 'Jotform', 
          url: 'https://jotform.com?affiliate=YOUR_AFFILIATE_ID', 
          description: 'No-code forms and apps for idea validation and feedback' 
        },
        { 
          name: 'ClickUp', 
          url: 'https://clickup.com?ref=YOUR_AFFILIATE_ID', 
          description: 'Project management and total productivity for entrepreneurs' 
        }
      ]
    },
    {
      category: 'Marketing',
      items: [
        { 
          name: 'Brevo', 
          url: 'https://brevo.com?affiliate=YOUR_AFFILIATE_ID', 
          description: 'Simple yet powerful email marketing and automation' 
        },
        { 
          name: 'Systeme.io', 
          url: 'https://systeme.io?ref=YOUR_AFFILIATE_ID', 
          description: 'All-in-one platform for sales funnels, email, and online courses' 
        }
      ]
    },
    {
      category: 'Finance',
      items: [
        { 
          name: 'FreshBooks', 
          url: 'https://freshbooks.com?affiliate=YOUR_AFFILIATE_ID', 
          description: 'Easy invoicing and finance for freelancers and small businesses' 
        },
        { 
          name: 'Quipu', 
          url: 'https://quipu.com?ref=YOUR_AFFILIATE_ID', 
          description: 'Agile online accounting for Spanish entrepreneurs' 
        }
      ]
    },
    {
      category: 'Operations / Digital',
      items: [
        { 
          name: 'Notion', 
          url: 'https://notion.so?affiliate=YOUR_AFFILIATE_ID', 
          description: 'Organize, plan and collaborate in one tool' 
        },
        { 
          name: 'Gumroad', 
          url: 'https://gumroad.com?ref=YOUR_AFFILIATE_ID', 
          description: 'Sell digital products and earn with affiliates' 
        }
      ]
    }
  ];

  const actionableResources = [
    {
      type: 'template',
      title: 'Plantilla de Validación',
      description: 'Notion template con framework completo para validar tu idea',
      icon: FileText,
      url: AIService.getActionableResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[0]?.url || 'https://notion.so/templates/startup-validation',
      cta: 'Clonar plantilla'
    },
    {
      type: 'template',
      title: 'Tracker Financiero',
      description: 'Google Sheets para proyecciones y métricas clave',
      icon: Calculator,
      url: AIService.getActionableResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[1]?.url || 'https://docs.google.com/spreadsheets/create',
      cta: 'Obtener plantilla'
    },
    {
      type: 'template',
      title: 'Board de Tareas',
      description: 'Trello board pre-configurado para organizar tu lanzamiento',
      icon: CheckSquare,
      url: AIService.getActionableResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[2]?.url || 'https://trello.com/templates',
      cta: 'Usar template'
    },
    {
      type: 'guide',
      title: 'Cómo Validar tu Idea',
      description: 'Video guía de 10 min para validar demanda real',
      icon: Target,
      url: AIService.getActionableResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[3]?.url || 'https://youtube.com/watch?v=validation-guide',
      cta: 'Ver guía'
    },
    {
      type: 'guide',
      title: 'Tu Primer Pitch',
      description: 'Tutorial para crear un pitch efectivo en 5 pasos',
      icon: Users,
      url: AIService.getActionableResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[4]?.url || 'https://youtube.com/watch?v=pitch-tutorial',
      cta: 'Aprender'
    },
    {
      type: 'guide',
      title: 'Landing Page en 30min',
      description: 'Crea tu primera landing page sin código',
      icon: Play,
      url: AIService.getActionableResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[5]?.url || 'https://youtube.com/watch?v=landing-tutorial',
      cta: 'Ver tutorial'
    }
  ];

  const getPersonalizedSteps = () => {
    const baseSteps = {
      'SaaS': [
        {
          title: 'Validar la demanda con landing page',
          description: 'Crea una página simple que explique tu SaaS y capture emails de interesados',
          guide: {
            type: 'template',
            title: 'Plantilla de Landing Page',
            content: 'Usa Carrd.co para crear una landing en 30 minutos. Incluye: título claro, 3 beneficios principales, formulario de email y botón CTA.',
            link: 'https://carrd.co'
          }
        },
        {
          title: 'Crear un MVP o prototipo funcional',
          description: 'Desarrolla la versión más simple de tu producto que resuelva el problema principal',
          guide: {
            type: 'tutorial',
            title: 'Guía de MVP para SaaS',
            content: 'Define las 3 funcionalidades core. Usa herramientas no-code como Bubble, Webflow o Airtable para el prototipo inicial.',
            link: 'https://bubble.io'
          }
        },
        {
          title: 'Configurar sistema de pagos',
          description: 'Implementa Stripe para procesar suscripciones y pagos recurrentes',
          guide: {
            type: 'tutorial',
            title: 'Setup de Stripe para SaaS',
            content: 'Configura productos recurrentes en Stripe Dashboard. Integra con tu app usando Stripe Checkout o Elements.',
            link: 'https://stripe.com/docs/billing'
          }
        }
      ],
      'Physical Product': [
        {
          title: 'Validar demanda con encuestas',
          description: 'Confirma que existe interés real en tu producto antes de invertir en producción',
          guide: {
            type: 'template',
            title: 'Plantilla de Encuesta de Validación',
            content: 'Usa Google Forms con 8-10 preguntas clave sobre el problema, soluciones actuales y disposición a pagar.',
            link: 'https://forms.google.com'
          }
        },
        {
          title: 'Crear prototipo o muestra',
          description: 'Desarrolla una versión inicial del producto para mostrar a potenciales clientes',
          guide: {
            type: 'tutorial',
            title: 'Guía de Prototipado',
            content: 'Considera impresión 3D, fabricación local o servicios como Alibaba para muestras pequeñas.',
            link: 'https://www.alibaba.com'
          }
        },
        {
          title: 'Definir canales de distribución',
          description: 'Identifica cómo vas a hacer llegar tu producto a los clientes',
          guide: {
            type: 'tutorial',
            title: 'Estrategias de Distribución',
            content: 'Evalúa: venta directa online, marketplaces (Amazon, MercadoLibre), tiendas físicas o distribuidores.',
            link: 'https://sell.amazon.com'
          }
        }
      ],
      'Ecommerce': [
        {
          title: 'Investigar productos y proveedores',
          description: 'Identifica productos rentables y proveedores confiables',
          guide: {
            type: 'tutorial',
            title: 'Research de Productos',
            content: 'Usa herramientas como Jungle Scout, analiza tendencias en Google Trends y valida proveedores en Alibaba.',
            link: 'https://trends.google.com'
          }
        },
        {
          title: 'Crear tienda online',
          description: 'Configura tu ecommerce con todas las funcionalidades necesarias',
          guide: {
            type: 'template',
            title: 'Setup de Tienda',
            content: 'Usa Shopify o WooCommerce. Configura: productos, pagos, envíos, políticas y diseño responsive.',
            link: 'https://shopify.com'
          }
        },
        {
          title: 'Lanzar campaña de marketing',
          description: 'Atrae tus primeros clientes con publicidad dirigida',
          guide: {
            type: 'tutorial',
            title: 'Marketing para Ecommerce',
            content: 'Combina Facebook/Instagram Ads, Google Ads y email marketing. Presupuesto inicial: $500-1000.',
            link: 'https://business.facebook.com'
          }
        }
      ],
      'Service': [
        {
          title: 'Definir paquetes de servicio',
          description: 'Estructura tu oferta en paquetes claros con precios específicos',
          guide: {
            type: 'template',
            title: 'Plantilla de Paquetes',
            content: 'Crea 3 niveles: Básico, Estándar, Premium. Define qué incluye cada uno y tiempo de entrega.',
            link: 'https://docs.google.com/spreadsheets'
          }
        },
        {
          title: 'Conseguir primeros 5 clientes',
          description: 'Valida tu servicio con clientes reales y obtén testimonios',
          guide: {
            type: 'tutorial',
            title: 'Estrategia de Primeros Clientes',
            content: 'Ofrece descuento del 50% a cambio de testimonio detallado. Usa LinkedIn, networking y referidos.',
            link: 'https://linkedin.com'
          }
        },
        {
          title: 'Automatizar procesos clave',
          description: 'Optimiza tu tiempo con herramientas que automaticen tareas repetitivas',
          guide: {
            type: 'tutorial',
            title: 'Automatización para Servicios',
            content: 'Usa Calendly para citas, Zapier para integraciones, y plantillas para propuestas y contratos.',
            link: 'https://calendly.com'
          }
        }
      ],
      otro: [
        {
          title: 'Validar la oportunidad de mercado',
          description: 'Confirma que existe demanda real para tu idea de negocio',
          guide: {
            type: 'template',
            title: 'Framework de Validación',
            content: 'Realiza 20 entrevistas de 15 min c/u. Pregunta sobre el problema, soluciones actuales y disposición a pagar.',
            link: 'https://forms.google.com'
          }
        },
        {
          title: 'Crear MVP o prueba de concepto',
          description: 'Desarrolla la versión más simple que demuestre el valor de tu idea',
          guide: {
            type: 'tutorial',
            title: 'Guía de MVP',
            content: 'Define la funcionalidad mínima viable. Usa herramientas no-code o servicios manuales para empezar.',
            link: 'https://www.notion.so'
          }
        },
        {
          title: 'Definir modelo de monetización',
          description: 'Establece cómo vas a generar ingresos de manera sostenible',
          guide: {
            type: 'tutorial',
            title: 'Modelos de Monetización',
            content: 'Evalúa: suscripción, pago único, freemium, comisiones, publicidad. Elige según tu audiencia.',
            link: 'https://stripe.com'
          }
        }
      ],
      'Other': [
        {
          title: 'Definir propuesta de valor única',
          description: 'Identifica qué hace que tu idea sea diferente y valiosa',
          guide: {
            type: 'template',
            title: 'Plantilla de Propuesta de Valor',
            content: 'Completa: "Para [usuarios] que [problema], [nombre del producto] es [categoría] que [beneficio clave]. A diferencia de [alternativas], nuestro producto [diferenciación principal]."',
            link: 'https://www.strategyzer.com/canvas'
          }
        },
        {
          title: 'Validar demanda del mercado',
          description: 'Confirma que existe interés real en tu solución',
          guide: {
            type: 'tutorial',
            title: 'Validación de Mercado',
            content: 'Usa Google Trends, encuestas online, entrevistas con usuarios potenciales y análisis de competencia.',
            link: 'https://trends.google.com'
          }
        },
        {
          title: 'Crear plan de acción inicial',
          description: 'Define los próximos 3 pasos críticos para avanzar',
          guide: {
            type: 'template',
            title: 'Plan de Acción de 90 Días',
            content: 'Divide en sprints de 30 días. Cada sprint debe tener un objetivo claro y métricas de éxito.',
            link: 'https://www.notion.so'
          }
        }
      ]
    };

    return baseSteps[projectType as keyof typeof baseSteps] || baseSteps['Other'];
  };

  const personalizedStepsDetailed = getPersonalizedSteps();

  // Check if a step can be completed (must complete previous steps first)
  const canCompleteStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) return true; // First step can always be completed
    return completedSteps.includes(stepIndex - 1); // Must complete previous step
  };

  const toggleStepCompletion = (stepIndex: number) => {
    console.log('🔄 toggleStepCompletion called with stepIndex:', stepIndex);
    console.log('📊 Current completedSteps:', completedSteps);
    console.log('📝 Current stepNotes:', stepNotes);
    console.log('🆔 previewSessionId:', previewSessionId);
    
    const wasCompleted = completedSteps.includes(stepIndex);
    
    // Check if user can complete this step (must complete previous steps first)
    if (!wasCompleted) {
      // Check if all previous steps are completed
      const canComplete = stepIndex === 0 || completedSteps.includes(stepIndex - 1);
      
      if (!canComplete) {
        // Show error message for trying to skip steps
        const previousStep = stepIndex === 0 ? 'el primer paso' : `el paso ${stepIndex}`;
        setMotivationMessage(`⚠️ Debes completar ${previousStep} antes de continuar. Los pasos deben completarse en orden.`);
        setShowMotivation(true);
        setTimeout(() => setShowMotivation(false), 4000);
        return;
      }
    }
    
    const newCompletedSteps = wasCompleted 
      ? completedSteps.filter(i => i !== stepIndex)
      : [...completedSteps, stepIndex];
    
    console.log('🔄 New completedSteps:', newCompletedSteps);
    setCompletedSteps(newCompletedSteps);
    
    // Save to Airtable
    const currentDashboardId = dashboardId || previewSessionId;
    if (currentDashboardId) {
      console.log('💾 Attempting to save to Airtable with ID:', currentDashboardId);
      AirtableService.saveCompletedSteps(currentDashboardId, newCompletedSteps, stepNotes)
        .then(result => {
          console.log('📤 Airtable response:', result);
          if (result.success) {
            console.log('✅ Completed steps saved to Airtable');
          } else {
            console.error('❌ Error saving completed steps:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ Error saving completed steps:', error);
        });
    } else {
      console.error('❌ No dashboard ID available for saving');
    }
    
    // Show congratulation message when completing a step
    if (!wasCompleted) {
      const stepNumber = stepIndex + 1;
      const congratulationMessages = [
        `¡Excelente! 🎉 Has completado el paso ${stepNumber}. Cada paso te acerca más a tu objetivo.`,
        `¡Genial! 🚀 Paso ${stepNumber} completado. Estás construyendo algo increíble.`,
        `¡Fantástico! ⭐ Paso ${stepNumber} terminado. Tu idea está tomando forma.`,
        `¡Increíble! 💪 Paso ${stepNumber} completado. Sigues avanzando hacia el éxito.`,
        `¡Perfecto! 🎯 Paso ${stepNumber} terminado. Cada acción cuenta para tu futuro negocio.`,
        `¡Bien hecho! 🌟 Paso ${stepNumber} completado. Tu progreso es inspirador.`,
        `¡Sobresaliente! 🏆 Paso ${stepNumber} terminado. Estás en el camino correcto.`,
        `¡Magnífico! ✨ Paso ${stepIndex + 1} completado. Tu dedicación se nota.`
      ];
      setMotivationMessage(congratulationMessages[Math.floor(Math.random() * congratulationMessages.length)]);
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 4000);
    }
  };

  const toggleStepExpansion = (stepIndex: number) => {
    setExpandedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const updateStepNote = (stepIndex: number, note: string) => {
    console.log('📝 updateStepNote called with stepIndex:', stepIndex, 'note:', note);
    console.log('📊 Current completedSteps:', completedSteps);
    console.log('📝 Current stepNotes:', stepNotes);
    console.log('🆔 previewSessionId:', previewSessionId);
    
    const newStepNotes = {
      ...stepNotes,
      [stepIndex]: note
    };
    
    console.log('🔄 New stepNotes:', newStepNotes);
    setStepNotes(newStepNotes);
    
    // Save to Airtable
    const currentDashboardId = dashboardId || previewSessionId;
    if (currentDashboardId) {
      console.log('💾 Attempting to save notes to Airtable with ID:', currentDashboardId);
      AirtableService.saveCompletedSteps(currentDashboardId, completedSteps, newStepNotes)
        .then(result => {
          console.log('📤 Airtable response for notes:', result);
          if (result.success) {
            console.log('✅ Step notes saved to Airtable');
          } else {
            console.error('❌ Error saving step notes:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ Error saving step notes:', error);
        });
    } else {
      console.error('❌ No dashboard ID available for saving notes');
    }
  };

  const sendFollowUpEmail = async () => {
    // Prevent email sending if dashboard is not ready
    if (isGeneratingContent || !aiContent) {
      console.log('⏳ Dashboard not ready yet, cannot send email');
      setMotivationMessage('⚠️ El dashboard aún no está listo. Espera a que se complete la generación de contenido.');
      setTimeout(() => setMotivationMessage(''), 3000);
      return;
    }
    
    try {
      console.log('📧 Starting follow-up email process...');
      setEmailSent(true);
      setMotivationMessage('📧 Enviando email de seguimiento...');
      
      // Ensure bitacoraSteps is available
      const currentSteps = getBitacoraSteps();
      if (!currentSteps || currentSteps.length === 0) {
        console.error('❌ No steps available for email');
        setMotivationMessage('❌ No hay pasos disponibles para el email. Intenta de nuevo.');
        setEmailSent(false);
        setTimeout(() => setMotivationMessage(''), 3000);
        return;
      }
      
      // Get the next step to complete
      const nextStep = currentSteps.find((_: any, index: number) => !completedSteps.includes(index))?.title;
      
      // Prepare email data
      const emailData = {
        userEmail: email, // Use the email prop passed from App.tsx
        userName: name, // Use the name prop passed from App.tsx
        idea,
        projectType,
        completedSteps: completedSteps.length,
        totalSteps: currentSteps.length,
        nextStep,
        projectDetails: {
          problem,
          idealUser,
          region,
          alternatives,
          businessModel
        }
      };
      
      console.log('📧 Sending follow-up email with data:', emailData);
      
      // Send email using EmailService
      const success = await EmailService.sendFollowUpEmail(emailData);
      
      if (success) {
        console.log('✅ Follow-up email sent successfully to:', email);
        setMotivationMessage('✅ ¡Email de seguimiento enviado exitosamente! Revisa tu bandeja de entrada.');
        // Show success message for 5 seconds
        setTimeout(() => {
          setEmailSent(false);
          setMotivationMessage('');
        }, 5000);
      } else {
        console.error('❌ Failed to send follow-up email');
        setMotivationMessage('❌ Error al enviar el email. Intenta de nuevo o verifica tu conexión.');
        setEmailSent(false);
        setTimeout(() => setMotivationMessage(''), 3000);
      }
      
    } catch (error) {
      console.error('❌ Error sending follow-up email:', error);
      setMotivationMessage('❌ Error inesperado al enviar el email. Intenta de nuevo.');
      setEmailSent(false);
      setTimeout(() => setMotivationMessage(''), 3000);
    }
  };

  const sendFeedbackEmails = async () => {
    // Prevent email sending if dashboard is not ready
    if (isGeneratingContent || !aiContent) {
      console.log('⏳ Dashboard not ready yet, cannot send feedback emails');
      setMotivationMessage('⚠️ El dashboard aún no está listo. Espera a que se complete la generación de contenido.');
      setTimeout(() => setMotivationMessage(''), 3000);
      return;
    }
    
    const validEmails = feedbackEmails.filter(email => email.trim() && email.includes('@'));
    if (validEmails.length === 0) {
      setMotivationMessage('⚠️ No hay emails válidos para enviar. Añade al menos un email válido.');
      setTimeout(() => setMotivationMessage(''), 3000);
      return;
    }
    
    setFeedbackSent(true);
    setShowFeedbackForm(false);
    
    try {
      console.log('📧 Starting feedback emails process...');
      setMotivationMessage(`📧 Enviando ${validEmails.length} email(s) de feedback...`);
      
      // Prepare project data for feedback emails
      const projectData = {
        idea,
        projectType,
        region
      };
      
      console.log('📧 Sending feedback request emails to:', validEmails, projectData);
      
      // Send feedback emails using EmailService
      const success = await EmailService.sendFeedbackEmails(validEmails, projectData);
      
      if (success) {
        console.log('✅ Feedback emails sent successfully');
        setMotivationMessage(`✅ ¡${validEmails.length} email(s) de feedback enviado(s) exitosamente!`);
        // Show success message for 5 seconds
        setTimeout(() => {
          setFeedbackSent(false);
          setMotivationMessage('');
        }, 5000);
      } else {
        console.error('❌ Failed to send feedback emails');
        setMotivationMessage('❌ Error al enviar los emails de feedback. Intenta de nuevo.');
        setFeedbackSent(false);
        setTimeout(() => setMotivationMessage(''), 3000);
      }
      
    } catch (error) {
      console.error('❌ Error sending feedback emails:', error);
      setMotivationMessage('❌ Error inesperado al enviar los emails. Intenta de nuevo.');
      setFeedbackSent(false);
      setTimeout(() => setMotivationMessage(''), 3000);
    }
  };

  const shareToSocial = (platform: 'twitter' | 'linkedin') => {
    try {
      console.log(`📱 Sharing to ${platform}...`);
      
    const messages = {
      twitter: `🚀 Estoy trabajando en una nueva idea: "${idea}". ¿Qué opinas? #startup #emprendimiento #${projectType}`,
      linkedin: `Estoy desarrollando una nueva propuesta de negocio: "${idea}". Me encantaría conocer sus perspectivas y feedback. #emprendimiento #startup #innovacion`
    };
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(messages.linkedin)}`
    };
    
      console.log(`📱 Opening ${platform} share URL:`, urls[platform]);
      
      // Open sharing window
      const shareWindow = window.open(urls[platform], '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
      
      if (shareWindow) {
        console.log(`✅ ${platform} share window opened successfully`);
        
        // Mark as shared
    setSocialShares(prev => ({
      ...prev,
      [platform]: { shared: true, interactions: 0 }
    }));
    
        // Show congratulation message for sharing
        setMotivationMessage(`🎉 ¡Excelente! Has compartido tu idea en ${platform === 'twitter' ? 'Twitter/X' : 'LinkedIn'}. Cada compartir aumenta las posibilidades de encontrar feedback valioso y conexiones importantes. ¡Sigue así!`);
        setTimeout(() => setMotivationMessage(''), 5000);
        
      } else {
        console.error(`❌ Failed to open ${platform} share window`);
        setMotivationMessage(`❌ Error al abrir ${platform === 'twitter' ? 'Twitter/X' : 'LinkedIn'}. Intenta de nuevo.`);
        setTimeout(() => setMotivationMessage(''), 3000);
      }
      
    } catch (error) {
      console.error(`❌ Error sharing to ${platform}:`, error);
      setMotivationMessage(`❌ Error al compartir en ${platform === 'twitter' ? 'Twitter/X' : 'LinkedIn'}. Intenta de nuevo.`);
      setTimeout(() => setMotivationMessage(''), 3000);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Show loading state
      setIsExportingPDF(true);
      console.log('Starting comprehensive PDF export...');

      // Create a professional PDF using jsPDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Set up fonts and colors
      pdf.setFont('helvetica');
      pdf.setTextColor(0, 0, 0); // Black text
      
      // Page dimensions
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;
      
      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11) => {
        pdf.setFontSize(fontSize);
        
        // Ensure text is properly cleaned and trimmed
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        // Split text into lines with proper word wrapping
        const lines = pdf.splitTextToSize(cleanText, maxWidth);
        
        let currentY = y;
        lines.forEach((line: string, index: number) => {
          // Check if we need a new page before adding the line
          if (currentY + 6 > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
          
          // Ensure the line fits within the page width
          const lineWidth = pdf.getTextWidth(line);
          if (lineWidth > maxWidth) {
            // If line is still too wide, split it further
            const words = line.split(' ');
            let currentLine = '';
            let lineIndex = 0;
            
            for (const word of words) {
              const testLine = currentLine + (currentLine ? ' ' : '') + word;
              const testWidth = pdf.getTextWidth(testLine);
              
              if (testWidth > maxWidth && currentLine) {
                // Add the current line and start a new one
                if (currentY + 6 > pageHeight - 30) {
                  pdf.addPage();
                  currentY = margin;
                }
                pdf.text(currentLine, x, currentY);
                currentY += 6;
                currentLine = word;
                lineIndex++;
              } else {
                currentLine = testLine;
              }
            }
            
            // Add the last line
            if (currentLine) {
              if (currentY + 6 > pageHeight - 30) {
                pdf.addPage();
                currentY = margin;
              }
              pdf.text(currentLine, x, currentY);
              currentY += 6;
            }
          } else {
            // Line fits, add it normally
            pdf.text(line, x, currentY);
            currentY += 6;
          }
        });
        
        return currentY + 8;
      };
      
      // Helper function to add section with proper spacing
      const addSection = (title: string, content: string[] | string, yStart: number, includeBullets: boolean = true) => {
        let currentY = yStart;
        
        // Check if we need a new page
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = margin;
        }
        
        // Section title with underline
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, currentY);
        currentY += 8;
        
        // Add underline
        pdf.setDrawColor(100, 100, 100);
        pdf.line(margin, currentY, margin + 100, currentY);
        currentY += 12;
        
        // Section content
        if (Array.isArray(content)) {
          content.forEach((item, index) => {
            // Check if we need a new page
            if (currentY > pageHeight - 40) {
              pdf.addPage();
              currentY = margin;
            }
            
            if (includeBullets) {
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'normal');
              
              // Clean the item text
              const cleanItem = item.replace(/\s+/g, ' ').trim();
              
              // Use addWrappedText for bullet points to ensure proper wrapping
              currentY = addWrappedText(`• ${cleanItem}`, margin + 5, currentY, contentWidth - 5, 11);
            } else {
              currentY = addWrappedText(item, margin + 5, currentY, contentWidth - 5);
            }
          });
        } else {
          currentY = addWrappedText(content, margin + 5, currentY, contentWidth - 5);
        }
        
        return currentY + 10; // Return next Y position
      };
      
      // Helper function to add table-like section
      const addTableSection = (title: string, data: Array<{name: string, description: string}>, yStart: number) => {
        let currentY = yStart;
        
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = margin;
        }
        
        // Section title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, currentY);
        currentY += 8;
        
        // Add underline
        pdf.setDrawColor(100, 100, 100);
        pdf.line(margin, currentY, margin + 100, currentY);
        currentY += 12;
        
        data.forEach((item, index) => {
          if (currentY > pageHeight - 50) {
            pdf.addPage();
            currentY = margin;
          }
          
          // Item name
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          
          // Clean and wrap item name if needed
          const cleanName = item.name.replace(/\s+/g, ' ').trim();
          currentY = addWrappedText(cleanName, margin + 5, currentY, contentWidth - 5, 12);
          currentY += 3;
          
          // Item description
          const cleanDescription = item.description.replace(/\s+/g, ' ').trim();
          currentY = addWrappedText(cleanDescription, margin + 10, currentY, contentWidth - 10, 10);
          currentY += 8;
        });
        
        return currentY + 10;
      };
      
      // Header with professional styling
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Add border line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(0, 35, pageWidth, 35);
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Konsul Plan', pageWidth / 2, 22, { align: 'center' });
      
      yPosition = 45;
      
      // Main title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Plan de Negocio Completo', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;
      
      // Business idea
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(idea, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Business Information Box
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition, contentWidth, 30, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPosition, contentWidth, 30, 'S');
      
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Información del Negocio', margin + 5, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`• Tipo de proyecto: ${projectType}`, margin + 10, yPosition);
      yPosition += 5;
      pdf.text(`• Región objetivo: ${region}`, margin + 10, yPosition);
      yPosition += 5;
      pdf.text(`• Generado el: ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin + 10, yPosition);
      
      yPosition += 25;
      
      // Add Table of Contents
      yPosition = addSection('Índice de Contenido', [
        'Información del Negocio',
        'Resumen Ejecutivo del Negocio',
        'Análisis del Tamaño del Mercado',
        'Sugerencias de Nombres de Marca',
        'Herramientas Recomendadas',
        'Análisis del Negocio',
        'Estrategia de Precios',
        'Plan de Acción Personalizado',
        'Términos de Búsqueda para Investigación',
        'Métodos de Investigación Recomendados',
        'Progreso del Plan',
        'Resumen del Documento'
      ], yPosition);
      
      yPosition += 15;
      
      // Business Summary Section
      if (aiContent?.businessSummary) {
        yPosition = addSection('Resumen Ejecutivo del Negocio', aiContent.businessSummary, yPosition, false);
      }
      
      // Market Size Section
      if (aiContent?.marketSize) {
        yPosition = addSection('Análisis del Tamaño del Mercado', aiContent.marketSize, yPosition, false);
      }
      
      // Brand Suggestions Section with reasoning
      if (aiContent?.brandSuggestions && aiContent.brandSuggestions.length > 0) {
        const brandData = aiContent.brandSuggestions.map((brand, index) => ({
          name: brand,
          description: aiContent.brandReasoning && aiContent.brandReasoning[index] 
              ? aiContent.brandReasoning[index] 
            : 'Justificación estratégica generada por IA'
        }));
        yPosition = addTableSection('Sugerencias de Nombres de Marca', brandData, yPosition);
      }
      
      // Recommended Tools Section - Use the same tools that are displayed visually
      if (tools && tools.length > 0) {
        const toolsData = tools.flatMap(category => 
          category.items.map(item => ({
            name: `${item.name} (${category.category})`,
            description: item.description
          }))
        );
        yPosition = addTableSection('Herramientas Recomendadas', toolsData, yPosition);
      }
      
      // Business Sub-sections
      if (businessSubSections) {
        yPosition = addSection('Análisis del Negocio', [
          `Propuesta de Valor: ${businessSubSections.propuestaValor}`,
          `Modelo de Negocio: ${businessSubSections.modeloNegocio}`,
          `Ventaja Competitiva: ${businessSubSections.ventajaCompetitiva}`
        ], yPosition);
      }
      
      // Pricing Sub-sections
      if (pricingSubSections) {
        yPosition = addSection('Estrategia de Precios', [
          `Modelo de Precios: ${pricingSubSections.modeloPrecios}`,
          `Estrategia Competitiva: ${pricingSubSections.estrategiaCompetitiva}`,
          `Recomendaciones: ${pricingSubSections.recomendaciones}`,
          `Análisis de Competidores: ${pricingSubSections.analisisCompetidores}`
        ], yPosition);
      }
      
      // Action Plan Section
      if (aiContent?.actionPlan && aiContent.actionPlan.length > 0) {
        yPosition = addSection('Plan de Acción Personalizado', aiContent.actionPlan, yPosition);
      }
      
      // Market Research Section
      if (aiContent?.marketResearch) {
        const { searchTerms, validationTopics, researchMethods } = aiContent.marketResearch;
        
        if (searchTerms && searchTerms.length > 0) {
          yPosition = addSection('Términos de Búsqueda para Investigación', searchTerms, yPosition);
        }
        
        if (validationTopics && validationTopics.length > 0) {
          yPosition = addSection('Temas de Validación de Mercado', validationTopics, yPosition);
        }
        
        if (researchMethods && researchMethods.length > 0) {
          yPosition = addSection('Métodos de Investigación Recomendados', researchMethods, yPosition);
        }
      }
      
      // Competitive Intelligence Section (if available)
      if (aiContent && 'competitiveIntelligence' in aiContent) {
        const competitors = (aiContent as any).competitiveIntelligence?.competitors;
        if (competitors && Array.isArray(competitors) && competitors.length > 0) {
          const competitorData = competitors.map((comp: any) => ({
            name: comp.name || 'Competidor',
            description: comp.description || 'Información del competidor'
          }));
          yPosition = addTableSection('Análisis de Competencia', competitorData, yPosition);
        }
      }
      
      // Strategic Insights Section (if available)
      if (aiContent && 'strategicInsights' in aiContent) {
        const insights = (aiContent as any).strategicInsights;
        if (insights && Array.isArray(insights) && insights.length > 0) {
          yPosition = addSection('Insights Estratégicos', insights, yPosition);
        }
      }
      
      
      // Add completed steps progress if available
      if (completedSteps && completedSteps.length > 0) {
        const progressPercentage = Math.round((completedSteps.length / personalizedSteps.length) * 100);
        yPosition = addSection('Progreso del Plan', [
          `Pasos completados: ${completedSteps.length}/${personalizedSteps.length}`,
          `Progreso: ${progressPercentage}%`,
          `Estado: ${progressPercentage === 100 ? 'Plan Completado' : 'En Progreso'}`
        ], yPosition);
      }
      
      // Add next steps recommendation if available
      if (completedSteps.length === personalizedSteps.length) {
        const nextSteps = getNextStepRecommendation();
        if (nextSteps && nextSteps.actions) {
          yPosition = addSection('Próximos Pasos Recomendados', [
            `Etapa: ${nextSteps.stage}`,
            `Título: ${nextSteps.title}`,
            `Descripción: ${nextSteps.description}`,
            `Prioridad: ${nextSteps.priority}`,
            ...nextSteps.actions.map(action => `• ${action.title}: ${action.description}`)
          ], yPosition);
        }
      }
      
      
      
      // Add competitive analysis summary if available
      if (aiContent && 'competitiveIntelligence' in aiContent) {
        const competitors = (aiContent as any).competitiveIntelligence?.competitors;
        if (competitors && Array.isArray(competitors) && competitors.length > 0) {
          const summary = [
            `Total de competidores analizados: ${competitors.length}`,
            'Principales competidores identificados:',
            ...competitors.slice(0, 3).map((comp: any, index: number) => 
              `${index + 1}. ${comp.name || 'Competidor'} - ${comp.description || 'Sin descripción'}`
            )
          ];
          yPosition = addSection('Resumen de Análisis Competitivo', summary, yPosition);
        }
      }
      
      
      
      // Footer with branding
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Add decorative line
      pdf.setDrawColor(180, 180, 180);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;
      
      // Add final summary box
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition, contentWidth, 30, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(margin, yPosition, contentWidth, 30, 'S');
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text('Resumen del Documento', margin + 8, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      
      // Use addWrappedText for the summary to ensure proper line wrapping
      const summaryText = `Este plan de negocio incluye análisis completo de mercado, estrategia de marca, herramientas recomendadas y plan de acción personalizado para "${idea}".`;
      yPosition = addWrappedText(summaryText, margin + 8, yPosition, contentWidth - 16, 10);
      
      yPosition += 25;
      
      // Footer with professional styling
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.line(0, pageHeight - 25, pageWidth, pageHeight - 25);
      
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Este documento fue generado automáticamente por Konsul Plan', pageWidth / 2, pageHeight - 15, { align: 'center' });
      pdf.text('Plataforma integral para emprendedores - Transformando ideas en negocios exitosos', pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      
      // Save PDF with comprehensive filename
      const timestamp = new Date().toISOString().split('T')[0];
      const cleanIdea = idea.substring(0, 30).replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_');
      const filename = `Plan_Negocio_${cleanIdea}_${timestamp}.pdf`;
      
      console.log('Saving comprehensive PDF as:', filename);
      pdf.save(filename);
      console.log('Comprehensive PDF saved successfully');

      // Show success notification
      setPdfNotification({
        type: 'success',
        message: '✅ PDF completo exportado exitosamente',
        show: true
      });

      // Hide notification after 3 seconds
      setTimeout(() => {
        setPdfNotification(prev => ({ ...prev, show: false }));
      }, 3000);

    } catch (error) {
      console.error('Error exporting comprehensive PDF:', error);
      
      // Show error notification
      setPdfNotification({
        type: 'error',
        message: `❌ Error al exportar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        show: true
      });

      // Hide notification after 5 seconds
      setTimeout(() => {
        setPdfNotification(prev => ({ ...prev, show: false }));
      }, 5000);
    } finally {
      // Restore button state
      setIsExportingPDF(false);
    }
  };



  const handleKonsulTasks = () => {
    console.log('Derivando a Kônsul Tasks...');
  };

  const handleKonsulBills = () => {
    console.log('Derivando a Kônsul Bills...');
  };

  // ===== FUNCIONES DE SESIÓN DE USUARIO =====
  
  // Verificar estado de pago desde Airtable
  const checkPaymentStatus = async () => {
    if (!previewSessionId) return;
    
    try {
      console.log('🔍 Verificando estado de pago para preview session:', previewSessionId);
      const result = await AirtableService.getDashboardById(previewSessionId);
      
      if (result.success && result.dashboard) {
        const isActive = result.dashboard.is_active;
        const hasPayment = result.dashboard.payment_at || result.dashboard.stripe_payment_id;
        
        console.log('📊 Estado de pago:', { isActive, hasPayment });
        
        // El pago está registrado si hay payment_at o stripe_payment_id
        if (hasPayment) {
          setIsPaymentRegistered(true);
          console.log('✅ Pago registrado, habilitando botón Crear Sesión');
        } else {
          setIsPaymentRegistered(false);
          console.log('❌ Pago no registrado aún');
        }
      }
    } catch (error) {
      console.error('❌ Error verificando estado de pago:', error);
    }
  };
  
  const handleCreateSession = async () => {
    if (!email || !previewSessionId) {
      console.error('❌ Email o previewSessionId faltante');
      return;
    }

    setIsCreatingSession(true);
    try {
      const result = await AirtableService.createUserSession(email, previewSessionId);
      
      if (result.success && result.password) {
        setGeneratedPassword(result.password);
        setShowPasswordDisplay(true);
        console.log('✅ Sesión creada exitosamente');
      } else {
        console.error('❌ Error creando sesión:', result.error);
        alert('Error creando sesión: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error creando sesión:', error);
      alert('Error creando sesión');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleLoginSuccess = (dashboard: any) => {
    console.log('✅ Login exitoso, cargando dashboard:', dashboard);
    // Aquí podrías cargar el dashboard del usuario
    setShowLogin(false);
    // Por ahora, solo cerramos el modal
  };

  const handleClosePasswordDisplay = () => {
    setShowPasswordDisplay(false);
    setGeneratedPassword('');
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  // Validate AI content structure to prevent rendering errors
  const validateAIContent = (content: any) => {
    if (!content) return false;
    
    const requiredArrays = [
      'brandSuggestions',
      'recommendedTools', 
      'actionPlan',
      'marketResearch'
    ];
    
    for (const key of requiredArrays) {
      if (!content[key] || !Array.isArray(content[key])) {
        console.warn(`⚠️ Missing or invalid array for: ${key}`, content[key]);
        return false;
      }
    }
    
    // Validate nested structures
    if (content.recommendedTools && Array.isArray(content.recommendedTools)) {
      for (const category of content.recommendedTools) {
        if (!category.items || !Array.isArray(category.items)) {
          console.warn(`⚠️ Invalid category structure:`, category);
          return false;
        }
      }
    }
    
    if (content.marketResearch && Array.isArray(content.marketResearch.searchTerms)) {
      // Additional validation for market research
    }
    
    return true;
  };

  // Organize main sections from existing AI content (using section-specific Airtable fields)
  const organizeMainSectionsFromExisting = (existingContent: any) => {
    console.log('🔧 Organizing main sections from existing content (dashboard_data approach)');
    console.log('📊 Existing content keys:', safeObjectKeys(existingContent));
    
    // Direct mapping from dashboard_data structure to GeneratedContent
    const organizedContent: GeneratedContent = {
      // SECTION 1: Business Summary - EXECUTIVE OVERVIEW ONLY
      businessSummary: existingContent.businessSummary || existingContent.executiveSummary || 
                      `Resumen ejecutivo: ${idea} representa una oportunidad de negocio sólida en ${region}. La propuesta de valor se centra en resolver "${problem}" para ${idealUser}, utilizando un modelo de negocio ${businessModel} que ofrece viabilidad para este ${projectType}.`,
      
      // SECTION 2: Market Size - MARKET METRICS ONLY  
      marketSize: existingContent.marketSize || existingContent.externalData?.marketSize?.totalAddressableMarket ||
                 `El mercado objetivo en ${region} presenta oportunidades significativas. Análisis de mercado basado en datos existentes que muestran potencial de crecimiento y demanda sostenida para soluciones como ${idea}.`,
      
      // SECTION 3: Brand Suggestions - NAMING ONLY
      brandSuggestions: existingContent.brandSuggestions || 
                       [`${idea}Pro`, `${idea}Hub`, `${idea}Flow`],
      brandReasoning: existingContent.brandReasoning || 
                     [
                       `Refleja la naturaleza profesional de ${idea}`,
                       `Transmite innovación y modernidad`,
                       `Fácil de recordar y pronunciar`
                     ],
      
      // SECTION 4: Recommended Tools - TOOL RECOMMENDATIONS ONLY
      recommendedTools: existingContent.externalData?.competitors || 
                       [
                         {
                           category: "Desarrollo",
                           items: [
                             { name: "React", description: "Framework frontend", url: "https://reactjs.org" },
                             { name: "Node.js", description: "Backend runtime", url: "https://nodejs.org" }
                           ]
                         },
                         {
                           category: "Marketing",
                           items: [
                             { name: "Google Analytics", description: "Análisis web", url: "https://analytics.google.com" },
                             { name: "Mailchimp", description: "Email marketing", url: "https://mailchimp.com" }
                           ]
                         }
                       ],
      
      // SECTION 5: Action Plan - INTELLIGENT 7-STEP PLAN
      actionPlan: existingContent.actionableRecommendation ? [existingContent.actionableRecommendation] :
                 [
                   `1. Validar la idea de negocio "${idea}" ${idealUser} mediante entrevistas y encuestas para confirmar el problema y la solución propuesta`,
                   `2. Desarrollar MVP basado en el modelo ${businessModel}`,
                   `3. Crear estrategia de marketing para ${region}`,
                   `4. Establecer métricas de éxito y KPIs`,
                   `5. Lanzar beta con usuarios piloto`,
                   `6. Iterar basado en feedback inicial`,
                   `7. Escalar operaciones y expandir mercado`
                 ],
      
      // SECTION 6: Market Research - VALIDATION METHODS ONLY
      marketResearch: {
        searchTerms: existingContent.marketResearch?.searchTerms || 
                    existingContent.externalData?.marketTrends?.map((trend: any) => trend.keyword) || 
                    [`${idea} ${region}`, `${businessModel} ${projectType}`, `${problem} solución`],
        validationTopics: existingContent.marketResearch?.validationTopics || 
                         existingContent.externalData?.insights?.strategicRecommendations || 
                         [`Validación de ${idea}`, `Análisis de competencia en ${region}`, `Modelo de negocio ${businessModel}`],
        researchMethods: existingContent.marketResearch?.researchMethods || 
                        ["Análisis de mercado", "Investigación de competencia", "Validación de usuarios", "Encuestas online"]
      }
    };
    
    // Update aiContent with organized data
    setAiContent(organizedContent);
    
    // Set up section loading states to show content is ready
    const sectionsToLoad = [
      'Resumen Ejecutivo',
      'Punto Fuerte', 
      'Riesgos Críticos',
      'Recomendación Accionable',
      'Inteligencia de Mercado',
      'Sugerencias de Marca',
      'Plan de Acción',
      'businessSummary', // For "Resumen del Negocio" section
      'marketSize'       // For "Tamaño del Mercado" section
    ];
    
    sectionsToLoad.forEach(section => {
      setSectionLoadingStates(prev => ({
        ...prev,
        [section]: false // Content is ready, no loading needed
      }));
    });
    
    console.log('✅ Main sections organized from dashboard_data');
    console.log('📊 Final organized content structure:', organizedContent);
    console.log('📊 Action plan length:', organizedContent.actionPlan?.length);
    console.log('📊 Market research search terms:', organizedContent.marketResearch?.searchTerms);
    console.log('📊 Brand suggestions:', organizedContent.brandSuggestions);
  };

  // Create business sub-sections from existing AI content (replicating AI Service logic)
  const createBusinessSubSectionsFromExisting = (existingContent: any) => {
    console.log('🔧 Creating business sub-sections from existing content using AI Service logic');
    
    // Extract data from existing content to replicate the AI Service prompts
    const businessData = {
      idea: idea || existingContent.businessIdea || "Idea de negocio",
      problem: problem || existingContent.problem || "Problema identificado",
      idealUser: idealUser || existingContent.idealUser || "Usuario objetivo",
      region: region || existingContent.region || "Europa",
      alternatives: alternatives || existingContent.alternatives || "Competencia",
      businessModel: businessModel || existingContent.businessModel || "Subscription",
      projectType: projectType || existingContent.projectType || "SaaS"
    };
    
    console.log('📊 Business data extracted for sub-sections:', businessData);
    
    // Replicate the AI Service logic for Propuesta de Valor
    const propuestaValor = existingContent.strongPoint || 
      `Ofrecemos una solución innovadora que transforma la experiencia del usuario mediante tecnología avanzada y diseño intuitivo. Nuestros clientes obtienen resultados medibles en tiempo real, con una interfaz que simplifica procesos complejos y maximiza la productividad.`;
    
    // Replicate the AI Service logic for Modelo de Negocio  
    const modeloNegocio = existingContent.businessModel || 
      `El modelo ${businessData.businessModel} garantiza ingresos sostenibles a través de suscripciones recurrentes, escalabilidad automática y bajos costos operativos. Los márgenes saludables permiten reinversión continua en innovación y expansión del mercado.`;
    
    // Replicate the AI Service logic for Ventaja Competitiva
    const ventajaCompetitiva = existingContent.externalData?.competitors?.map((comp: any) => 
      `${comp.name}: ${comp.description}`).join('\n\n') || 
      `Nuestra diferenciación se basa en tecnología patentada, atención al cliente 24/7 y resultados garantizados que superan las expectativas del mercado. Ofrecemos una experiencia superior que los usuarios no encuentran en ${businessData.alternatives}.`;
    
    const businessSubs = {
      propuestaValor,
      modeloNegocio,
      ventajaCompetitiva
    };
    
    console.log('✅ Business sub-sections created using AI Service logic:', businessSubs);
    return businessSubs;
  };

  // Create pricing sub-sections from existing AI content (replicating AI Service logic)
  const createPricingSubSectionsFromExisting = (existingContent: any) => {
    console.log('🔧 Creating pricing sub-sections from existing content using AI Service logic');
    
    // Extract data from existing content to replicate the AI Service prompts
    const businessData = {
      idea: idea || existingContent.businessIdea || "Idea de negocio",
      problem: problem || existingContent.problem || "Problema identificado",
      idealUser: idealUser || existingContent.idealUser || "Usuario objetivo",
      region: region || existingContent.region || "Europa",
      alternatives: alternatives || existingContent.alternatives || "Competencia",
      businessModel: businessModel || existingContent.businessModel || "Subscription",
      projectType: projectType || existingContent.projectType || "SaaS"
    };
    
    console.log('📊 Business data extracted for pricing sub-sections:', businessData);
    
    // Replicate the AI Service logic for Modelo de Precios
    const modeloPrecios = existingContent.externalData?.marketSize?.serviceableObtainableMarket ||
      `• Modelo recomendado: Precios basados en valor percibido para ${businessData.businessModel}\n• Estructura de precios: Opciones escalonadas según funcionalidades\n• Rango de precios: $29-$99 mensuales para ${businessData.idealUser} en ${businessData.region}\n• Factores de decisión: Escalabilidad y valor del usuario`;
    
    // Replicate the AI Service logic for Estrategia Competitiva
    const estrategiaCompetitiva = existingContent.externalData?.competitors?.map((comp: any) => 
      `• ${comp.name}: ${comp.funding?.totalRaised || 'No disponible'}`).join('\n') ||
      `• Posicionamiento vs competencia: Precios premium justificados por valor superior\n• Estrategia de precios: Penetración de mercado con escalabilidad\n• Diferenciación por valor: Resultados garantizados vs ${businessData.alternatives}\n• Ventaja competitiva: Atención personalizada y soporte 24/7`;
    
    // Replicate the AI Service logic for Recomendaciones
    const recomendaciones = existingContent.actionableRecommendation ||
      `• Recomendación 1: Implementar modelo freemium para captar usuarios\n• Recomendación 2: Precios escalonados según funcionalidades\n• Recomendación 3: Descuentos por pago anual para mejorar cash flow\n• Implementación: Comenzar con precios conservadores y ajustar según feedback`;
    
    // Replicate the AI Service logic for Análisis de Competidores
    const analisisCompetidores = existingContent.externalData?.competitors?.map((comp: any) => 
      `• ${comp.name}: Rango de precios $${comp.funding?.totalRaised || 'No disponible'}\n• Descripción: ${comp.description}`).join('\n') ||
      `• ${businessData.alternatives}: Rango de precios $29-$199 mensuales\n• Competidores locales: Precios $19-$149 en ${businessData.region}\n• Estrategia de posicionamiento: Precio medio-alto con valor superior\n• Recomendación de precios: $39-$89 mensuales para diferenciación`;
    
    const pricingSubs = {
      modeloPrecios,
      estrategiaCompetitiva,
      recomendaciones,
      analisisCompetidores
    };
    
    console.log('✅ Pricing sub-sections created using AI Service logic:', pricingSubs);
    return pricingSubs;
  };

  // Update Airtable with full dashboard content
  const updateAirtableWithFullContent = async (aiContentData?: any, businessSubsData?: any, pricingSubsData?: any) => {
    try {
      console.log('🔄 Updating Airtable with full dashboard content...');
      
      // Use the preview session ID passed as prop
      if (!previewSessionId) {
        console.error('❌ No preview session ID provided');
        return;
      }

      const projectInfo = {
        projectName: idea,
        projectType: projectType,
        businessModel: businessModel,
        region: region,
        businessIdea: idea
      };

      // Use passed parameters or fall back to state values
      const currentAiContent = aiContentData || aiContent;
      const currentBusinessSubs = businessSubsData || businessSubSections;
      const currentPricingSubs = pricingSubsData || pricingSubSections;

      console.log('🔄 Using data for Airtable:');
      console.log('📊 currentAiContent:', currentAiContent);
      console.log('📊 currentBusinessSubs:', currentBusinessSubs);
      console.log('📊 currentPricingSubs:', currentPricingSubs);

      // Build complete dashboard data with all generated content
      const completeDashboardData = {
        ...currentAiContent,
        businessSubSections: currentBusinessSubs || {},
        pricingSubSections: currentPricingSubs || {},
        // Add any other generated content that should be saved
        generatedAt: new Date().toISOString(),
        version: '1.0'
      };

      console.log('🔄 Updating Airtable with complete dashboard data:');
      console.log('📊 Complete dashboard data keys:', safeObjectKeys(completeDashboardData));
      console.log('📊 Complete dashboard data sample:', {
        executiveSummary: completeDashboardData.executiveSummary?.substring(0, 100),
        strongPoint: completeDashboardData.strongPoint?.substring(0, 100),
        hasBusinessSubs: !!completeDashboardData.businessSubSections,
        hasPricingSubs: !!completeDashboardData.pricingSubSections
      });
      
      const result = await AirtableService.updatePreviewToFullDashboard(email, completeDashboardData, projectInfo, previewSessionId, currentBusinessSubs, currentPricingSubs);
      
      if (result.success && result.dashboard) {
        const fullDashboardId = result.dashboard.dashboard_id;
        console.log('✅ Airtable updated successfully with full dashboard ID:', fullDashboardId);
        
        // Update URL with new full dashboard ID
        const newUrl = `${window.location.pathname}?dashboard=${fullDashboardId}`;
        window.history.pushState({ dashboardId: fullDashboardId }, '', newUrl);
        console.log('🔗 URL updated with full dashboard ID:', newUrl);
        
      } else {
        console.error('❌ Failed to update Airtable:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Error updating Airtable:', error);
    }
  };

  // Generate AI content for the dashboard
  const generateAIContent = async () => {
    console.log('🔍 generateAIContent - Debug info:');
    console.log('📊 existingAIContent:', existingAIContent);
    console.log('📊 existingAIContent type:', typeof existingAIContent);
    console.log('📊 existingAIContent is null:', existingAIContent === null);
    console.log('📊 existingAIContent is undefined:', existingAIContent === undefined);
    console.log('📊 existingAIContent is object:', typeof existingAIContent === 'object');
    console.log('📊 existingAIContent keys:', existingAIContent && typeof existingAIContent === 'object' ? safeObjectKeys(existingAIContent) : 'N/A');
    
    // Handle case where existingAIContent might be a string
    let parsedExistingContent = existingAIContent;
    if (typeof existingAIContent === 'string') {
      console.log('🔧 existingAIContent is string, parsing to object');
      try {
        parsedExistingContent = JSON.parse(existingAIContent);
        console.log('✅ Successfully parsed existingAIContent from string');
        console.log('📊 Parsed type:', typeof parsedExistingContent);
        console.log('📊 Parsed keys:', safeObjectKeys(parsedExistingContent));
      } catch (error) {
        console.error('❌ Error parsing existingAIContent from string:', error);
        parsedExistingContent = null;
      }
    }
    
    // If we have existing full dashboard AI content, use it directly
    // Check if parsedExistingContent has the expected structure (has executiveSummary or other AI content fields)
    const hasValidAIContent = parsedExistingContent && 
      (parsedExistingContent.executiveSummary || 
       parsedExistingContent.strongPoint || 
       parsedExistingContent.criticalRisks || 
       parsedExistingContent.brandSuggestions);
       
    if (hasValidAIContent) {
      console.log('✅ Using existing full dashboard AI content from dashboard_data');
      console.log('📊 Existing content structure:', parsedExistingContent);
      console.log('📊 Content keys available:', safeObjectKeys(parsedExistingContent));
      
      // Organize existing data into sections (same process as when creating new content)
      console.log('🔧 Organizing existing data into sections...');
      
      // Organize main sections from existing content (this will set aiContent)
      organizeMainSectionsFromExisting(parsedExistingContent);
      
      // Generate business sub-sections from existing data
      let businessSubs;
      if (parsedExistingContent.businessSubSections) {
        businessSubs = parsedExistingContent.businessSubSections;
        setBusinessSubSections(businessSubs);
        console.log('✅ Business sub-sections loaded from existing data');
      } else {
        // Create business sub-sections from existing content
        businessSubs = createBusinessSubSectionsFromExisting(parsedExistingContent);
        setBusinessSubSections(businessSubs);
        console.log('✅ Business sub-sections created from existing data');
      }
      
      // Generate pricing sub-sections from existing data
      let pricingSubs;
      if (parsedExistingContent.pricingSubSections) {
        pricingSubs = parsedExistingContent.pricingSubSections;
        setPricingSubSections(pricingSubs);
        console.log('✅ Pricing sub-sections loaded from existing data');
      } else {
        // Create pricing sub-sections from existing content
        pricingSubs = createPricingSubSectionsFromExisting(parsedExistingContent);
        setPricingSubSections(pricingSubs);
        console.log('✅ Pricing sub-sections created from existing data');
      }
      
      setIsGeneratingContent(false);
      setIsDashboardUnlocked(true); // Dashboard desbloqueado después de cargar contenido existente
      console.log('🎉 Existing dashboard content organized and loaded successfully');
      console.log('📊 Final aiContent state:', parsedExistingContent);
      console.log('📊 Final businessSubSections state:', businessSubs);
      console.log('📊 Final pricingSubSections state:', pricingSubs);
      return;
    } else if (previewContent && previewContent.aiContent) {
      console.log('✅ Using preview content for dashboard display');
      console.log('📊 Preview content structure:', previewContent.aiContent);
      console.log('📊 Preview content keys:', safeObjectKeys(previewContent.aiContent));
      
      // Use preview content directly
      setAiContent(previewContent.aiContent);
      
      // Set business and pricing sub-sections if available
      if (previewContent.businessSubSections) {
        setBusinessSubSections(previewContent.businessSubSections);
        console.log('✅ Business sub-sections loaded from preview content');
      }
      
      if (previewContent.pricingSubSections) {
        setPricingSubSections(previewContent.pricingSubSections);
        console.log('✅ Pricing sub-sections loaded from preview content');
      }
      
      setIsGeneratingContent(false);
      setIsDashboardUnlocked(true);
      console.log('🎉 Preview content loaded successfully');
      return;
    } else {
      console.log('⚠️ No existing full dashboard content found, will generate new content');
      console.log('📊 Preview content available:', !!previewContent);
      console.log('📊 Preview session ID:', previewSessionId);
      console.log('📊 Form data available:', {
        idea: !!idea,
        problem: !!problem,
        idealUser: !!idealUser,
        region: !!region,
        alternatives: !!alternatives,
        businessModel: !!businessModel,
        projectType: !!projectType
      });
    }

    // Check if we have existing content first (loaded from Airtable)
    if (hasValidAIContent) {
      console.log('✅ Using existing content from Airtable, skipping form validation');
      return;
    }
    
    // Only validate form data if we're generating new content AND we don't have preview content
    // AND we don't have existing content from Airtable
    if (!previewContent && !hasValidAIContent && (!idea || !problem || !idealUser || !region || !alternatives || !businessModel || !projectType)) {
      console.log('❌ Missing required form data, no preview content, and no existing content - skipping AI content generation');
      console.log('📊 Form data status:', {
        idea: !!idea,
        problem: !!problem,
        idealUser: !!idealUser,
        region: !!region,
        alternatives: !!alternatives,
        businessModel: !!businessModel,
        projectType: !!projectType
      });
      console.log('📊 Preview content available:', !!previewContent);
      console.log('📊 Has valid AI content:', hasValidAIContent);
      return;
    }

    try {
      setIsGeneratingContent(true);
      setGenerationProgress(10);
      console.log('🚀 Starting AI content generation...');
      console.log('📊 Form data from props:', {
        idea,
        problem,
        idealUser,
        region,
        alternatives,
        businessModel,
        projectType
      });

      // Use preview content data if available, otherwise use form data
      const businessData: BusinessData = previewContent ? {
        idea: previewContent.userInputs?.idea || idea,
        problem: previewContent.userInputs?.problem || problem,
        idealUser: previewContent.userInputs?.idealUser || idealUser,
        region: previewContent.userInputs?.region || region,
        alternatives: previewContent.userInputs?.alternatives || alternatives,
        businessModel: previewContent.userInputs?.businessModel || businessModel,
        projectType: previewContent.userInputs?.projectType || projectType
      } : {
        idea,
        problem,
        idealUser,
        region,
        alternatives,
        businessModel,
        projectType
      };

      console.log('📝 Business data for AI generation:', businessData);
      console.log('📊 Using preview content:', !!previewContent);
      console.log('📊 Preview content structure:', previewContent);

      // Generate complete dashboard content
      setGenerationProgress(25);
      console.log('Step 1: Calling AIService.generateOptimizedDashboardContent...');
      
      // Check if the method exists
      if (typeof AIService.generateOptimizedDashboardContent !== 'function') {
        throw new Error('generateOptimizedDashboardContent method not found in AIService');
      }
      
      setGenerationProgress(40);
      const dashboardContent = await AIService.generateOptimizedDashboardContent(businessData);
      console.log('✅ Dashboard content received:', dashboardContent);
      
      setGenerationProgress(60);

      // Use the brand data that was already generated by generateOptimizedDashboardContent
      console.log('🏷️ Brand data from dashboard content:', {
        suggestions: dashboardContent.brandSuggestions,
        reasoning: dashboardContent.brandReasoning
      });

      // Generate action plan separately to ensure it's available
      setGenerationProgress(70);
      console.log('📋 Generating action plan...');
      const actionPlan = await AIService.generateActionPlan(businessData);
      console.log('✅ Action plan generated:', actionPlan);

      // Consolidate all content into a single aiContent object
      // Use the brand data from dashboardContent since it was already generated there
      const consolidatedContent = {
        ...dashboardContent,
        brandSuggestions: dashboardContent.brandSuggestions || [],
        brandReasoning: dashboardContent.brandReasoning || [],
        actionPlan: actionPlan || dashboardContent.actionPlan || []
      };

      // Set all generated content at once
      setAiContent(consolidatedContent);
      console.log('✅ AI content consolidated and set to state successfully');
      console.log('🔍 Final brand suggestions:', consolidatedContent.brandSuggestions);
      console.log('🔍 Final brand reasoning:', consolidatedContent.brandReasoning);
      console.log('🔍 Final brand reasoning length:', consolidatedContent.brandReasoning?.length);
      console.log('🔍 Final action plan:', consolidatedContent.actionPlan);
      
      // Log the raw dashboard content to debug
      console.log('🔍 Raw dashboard content brand suggestions:', dashboardContent.brandSuggestions);
      console.log('🔍 Raw dashboard content brand reasoning:', dashboardContent.brandReasoning);
      console.log('🔍 Raw dashboard content brand reasoning length:', dashboardContent.brandReasoning?.length);
      
      // Validate that content is AI-generated, not fallback
      const isFallbackContent = consolidatedContent.brandSuggestions?.includes('InnovateHub') || 
                               consolidatedContent.brandSuggestions?.includes('FutureFlow') ||
                               consolidatedContent.brandSuggestions?.includes('SmartStart');
      
      if (isFallbackContent) {
        console.warn('⚠️ WARNING: Dashboard is showing fallback content instead of AI-generated content!');
        console.warn('⚠️ This means the AI generation failed and fell back to hardcoded content.');
      } else {
        console.log('✅ SUCCESS: Dashboard is showing real AI-generated content!');
      }

      // Generate business sub-sections with real, actionable content
      setGenerationProgress(70);
      console.log('🎯 Generating business sub-sections...');
      const subSections = await AIService.generateBusinessSubSections(businessData);
      setBusinessSubSections(subSections);
      console.log('✅ Business sub-sections generated successfully');

      // Generate pricing sub-sections with real, actionable content
      setGenerationProgress(85);
      console.log('💰 Generating pricing sub-sections...');
      const pricingSubs = await AIService.generatePricingSubSections(businessData);
      setPricingSubSections(pricingSubs);
      console.log('✅ Pricing sub-sections generated successfully');

      setGenerationProgress(100);
      console.log('🎉 AI content generation completed successfully');
      
      // Wait a bit for state to be updated before saving to Airtable
      console.log('⏳ Waiting for state updates to complete...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update Airtable with the generated full dashboard content
      console.log('💾 Updating Airtable with full dashboard content...');
      console.log('📊 Current aiContent before saving:', aiContent);
      console.log('📊 Current businessSubSections before saving:', businessSubSections);
      console.log('📊 Current pricingSubSections before saving:', pricingSubSections);
      
      // Pass the generated data directly to avoid state timing issues
      await updateAirtableWithFullContent(consolidatedContent, subSections, pricingSubs);

    } catch (error) {
      console.error('❌ Error generating AI content:', error);
      // Use fallback content if AI fails
      const businessData: BusinessData = {
        idea,
        problem,
        idealUser,
        region,
        alternatives,
        businessModel,
        projectType
      };
      
      console.log('🔄 Using fallback content...');
      const fallbackContent = AIService.getFallbackDashboardContent(businessData);
      console.log('📋 Fallback content:', fallbackContent);
      console.log('🔍 Brand suggestions in fallback content:', fallbackContent.brandSuggestions);
      console.log('🔍 Brand reasoning in fallback content:', fallbackContent.brandReasoning);
      setAiContent(fallbackContent);
      
      // Update Airtable with fallback content as well
      console.log('💾 Updating Airtable with fallback content...');
      await updateAirtableWithFullContent(fallbackContent, {}, {});
    } finally {
      console.log('🏁 Setting isGeneratingContent to false');
      setIsGeneratingContent(false);
      setIsDashboardUnlocked(true); // Dashboard desbloqueado después de generar contenido
    }
  };

  // Verificar estado de pago cuando se carga el componente
  useEffect(() => {
    if (previewSessionId) {
      checkPaymentStatus();
    }
  }, [previewSessionId]);

  // Generate content when component mounts
  useEffect(() => {
    console.log('🎯 Dashboard useEffect triggered - calling generateAIContent');
    console.log('📊 Existing AI content available:', !!existingAIContent);
    if (existingAIContent && typeof existingAIContent === 'object') {
      console.log('📊 Existing AI content keys:', safeObjectKeys(existingAIContent));
      console.log('📊 Existing AI content sample:', {
        executiveSummary: existingAIContent.executiveSummary?.substring(0, 100) + '...',
        strongPoint: existingAIContent.strongPoint?.substring(0, 100) + '...',
        hasBrandSuggestions: !!existingAIContent.brandSuggestions,
        hasCriticalRisks: !!existingAIContent.criticalRisks
      });
    } else {
      console.log('⚠️ existingAIContent is not a valid object:', existingAIContent);
    }
    
    generateAIContent();
  }, [existingAIContent]);

  // Calculate deadlines when aiContent changes
  useEffect(() => {
    if (aiContent) {
      // Calculate deadlines for action plan based on actual step content
      if (aiContent.actionPlan && Array.isArray(aiContent.actionPlan)) {
        const actionPlanDeadlines = calculateDeadlines(aiContent.actionPlan);
        setActionPlanDeadlines(actionPlanDeadlines);
        console.log('📅 Action plan deadlines calculated:', actionPlanDeadlines);
      }
      
      // Calculate deadlines for bitácora (same as action plan for now)
      const bitacoraSteps = getBitacoraSteps();
      if (bitacoraSteps && Array.isArray(bitacoraSteps)) {
        // Extract descriptions from bitácora steps for difficulty analysis
        const bitacoraStepDescriptions = bitacoraSteps.map(step => step.description || step.title || '');
        const bitacoraDeadlines = calculateDeadlines(bitacoraStepDescriptions);
        setBitacoraDeadlines(bitacoraDeadlines);
        console.log('📅 Bitácora deadlines calculated:', bitacoraDeadlines);
      }
    }
  }, [aiContent]);

  // Load completed steps from Airtable when component mounts
  useEffect(() => {
    const loadCompletedSteps = async () => {
      const currentDashboardId = dashboardId || previewSessionId;
      if (currentDashboardId) {
        try {
          console.log('📥 Loading completed steps for dashboard:', currentDashboardId);
          const result = await AirtableService.loadCompletedSteps(currentDashboardId);
          
          if (result.success && result.completedSteps) {
            setCompletedSteps(result.completedSteps);
            console.log('✅ Completed steps loaded:', result.completedSteps);
          }
          
          if (result.success && result.stepNotes) {
            setStepNotes(result.stepNotes);
            console.log('✅ Step notes loaded:', result.stepNotes);
          }
        } catch (error) {
          console.error('❌ Error loading completed steps:', error);
        }
      }
    };

    loadCompletedSteps();
  }, [dashboardId, previewSessionId]);

  // Check for overdue steps daily
  useEffect(() => {
    const checkOverdueSteps = () => {
      if (actionPlanDeadlines.length > 0) {
        const overdueSteps = actionPlanDeadlines.filter((deadline, index) => {
          const deadlineInfo = getDeadlineInfo(deadline, completedSteps.includes(index));
          return deadlineInfo.isOverdue;
        });
        
        if (overdueSteps.length > 0) {
          console.log('⚠️ Overdue action plan steps detected:', overdueSteps.length);
          // Here you could trigger email notifications or other alerts
        }
      }
      
      if (bitacoraDeadlines.length > 0) {
        const overdueSteps = bitacoraDeadlines.filter((deadline, index) => {
          const deadlineInfo = getDeadlineInfo(deadline, completedSteps.includes(index));
          return deadlineInfo.isOverdue;
        });
        
        if (overdueSteps.length > 0) {
          console.log('⚠️ Overdue bitácora steps detected:', overdueSteps.length);
          // Here you could trigger email notifications or other alerts
        }
      }
    };

    // Check immediately
    checkOverdueSteps();
    
    // Check every 24 hours
    const interval = setInterval(checkOverdueSteps, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [actionPlanDeadlines, bitacoraDeadlines, completedSteps]);

  // Helper function to convert AI content to Bitácora format
  const getBitacoraSteps = () => {
    // Safety check: ensure we have valid data
    console.log('🔍 getBitacoraSteps - aiContent structure:', {
      hasAiContent: !!aiContent,
      hasActionPlan: !!(aiContent && aiContent.actionPlan),
      actionPlanLength: aiContent?.actionPlan?.length || 0,
      hasActionableRecommendation: !!(aiContent && (aiContent as any).actionableRecommendation),
      aiContentKeys: safeObjectKeys(aiContent)
    });
    
    if (!aiContent) {
      console.log('🔄 Using fallback steps - no AI content');
      return personalizedStepsDetailed || [];
    }
    
    // If we have actionPlan (from full AI generation), use it
    if (aiContent.actionPlan && Array.isArray(aiContent.actionPlan) && aiContent.actionPlan.length > 0) {
      console.log('✅ Using AI-generated actionPlan');
      return aiContent.actionPlan.map((step: string, index: number) => ({
        title: `Paso ${index + 1}`,
        description: step,
        guide: {
          type: 'ai-generated',
          title: 'Paso Generado por IA',
          content: 'Este paso fue generado específicamente para tu proyecto basado en tu idea, tipo de negocio y región.',
          link: '#'
        }
      }));
    }
    
    // If we have actionableRecommendation (from preview), convert it to steps
    if ((aiContent as any).actionableRecommendation) {
      console.log('✅ Using actionableRecommendation from preview');
      // Split the recommendation into steps
      const steps = (aiContent as any).actionableRecommendation.split(/[.!?]+/).filter((step: string) => step.trim().length > 0);
      return steps.map((step: string, index: number) => ({
        title: `Paso ${index + 1}`,
        description: step.trim(),
        guide: {
          type: 'ai-generated',
          title: 'Paso Generado por IA',
          content: 'Este paso fue generado específicamente para tu proyecto basado en tu idea, tipo de negocio y región.',
          link: '#'
        }
      }));
    }
    
    // Fallback to personalized steps
    console.log('🔄 Using fallback steps - no actionable content found');
    return personalizedStepsDetailed || [];
  };

  // Get the steps for Bitácora (either AI-generated or fallback)
  const bitacoraSteps = getBitacoraSteps();
  
  // Safety check: ensure bitacoraSteps is always a valid array
  if (!Array.isArray(bitacoraSteps) || bitacoraSteps.length === 0) {
    console.warn('⚠️ bitacoraSteps is invalid, using fallback');
    // This should never happen, but just in case
  }

  // Si el dashboard está expirado, mostrar mensaje de expiración
  if (isExpired) {
    return <ExpirationMessage onRenew={onRenew || (() => {})} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      {/* AI Content Loading Screen */}
      {isGeneratingContent && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800/90 border border-gray-700 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="mb-6">
              <Building2 className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">Análisis Profundo en Progreso</h2>
              <p className="text-gray-300">Nuestros expertos están realizando un análisis exhaustivo de tu idea de negocio...</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            
            <div className="text-sm text-gray-400 mb-2">
              {generationProgress < 10 && '🚀 Iniciando análisis profundo...'}
              {generationProgress >= 10 && generationProgress < 25 && '📝 Generando resumen ejecutivo...'}
              {generationProgress >= 25 && generationProgress < 40 && '🌟 Creando nombres de marca...'}
              {generationProgress >= 40 && generationProgress < 60 && '📊 Analizando tamaño del mercado...'}
              {generationProgress >= 60 && generationProgress < 70 && '🛠️ Configurando herramientas recomendadas...'}
              {generationProgress >= 70 && generationProgress < 85 && '📋 Generando plan de acción personalizado...'}
              {generationProgress >= 85 && generationProgress < 100 && '🔍 Optimizando investigación de mercado...'}
              {generationProgress >= 100 && '✅ Análisis completo finalizado'}
            </div>
            
            <div className="text-xs text-gray-500 mb-4">
              {generationProgress}% del análisis completado
            </div>
            
            {/* Current Step Indicator */}
            <div className="text-xs text-cyan-400 font-medium mb-4">
              {generationProgress < 10 && 'Paso 1: Inicialización'}
              {generationProgress >= 10 && generationProgress < 25 && 'Paso 2: Resumen Ejecutivo'}
              {generationProgress >= 25 && generationProgress < 40 && 'Paso 3: Nombres de Marca'}
              {generationProgress >= 40 && generationProgress < 60 && 'Paso 4: Análisis de Mercado'}
              {generationProgress >= 60 && generationProgress < 70 && 'Paso 5: Herramientas'}
              {generationProgress >= 70 && generationProgress < 85 && 'Paso 6: Plan de Acción'}
              {generationProgress >= 85 && generationProgress < 100 && 'Paso 7: Investigación'}
              {generationProgress >= 100 && 'Completado'}
            </div>
            
            <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400">
                💼 Análisis profesional • 🎯 Enfoque realista • 📊 Datos específicos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Loading Indicators */}
      {!isGeneratingContent && (
        <div className="fixed top-4 left-4 z-40 space-y-2">
          {safeObjectEntries(sectionLoadingStates).map(([sectionName, isLoading]) => 
            isLoading && (
              <div key={sectionName} className="bg-gray-800/90 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span>Generando {sectionName}...</span>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Motivation Toast */}
      {showMotivation && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          {motivationMessage}
        </div>
      )}
      
      {/* Email Sent Toast */}
      {emailSent && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg">
          📧 ¡Email de seguimiento enviado!
        </div>
      )}
      
      {/* Feedback Sent Toast */}
      {feedbackSent && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg shadow-lg">
          💌 ¡Solicitudes de feedback enviadas!
        </div>
      )}
      
      {/* Social Stats Toast */}
      {showSocialStats && (
        <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">¡Actividad en redes!</span>
          </div>
          <div className="text-sm space-y-1">
            {socialShares.twitter.shared && (
              <div>Twitter: ¡Compartido! 🎯</div>
            )}
            {socialShares.linkedin.shared && (
              <div>LinkedIn: ¡Compartido! 🎯</div>
            )}
          </div>
          <button 
            onClick={() => setShowSocialStats(false)}
            className="absolute top-1 right-2 text-white/70 hover:text-white text-lg"
          >
            ×
          </button>
        </div>
      )}

      {/* Copy Notification Toast */}
      {copyNotification.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          📋 ¡Copiado al portapapeles!
          <div className="text-sm text-purple-100 mt-1 max-w-xs truncate">
            {copyNotification.text}
          </div>
        </div>
      )}

      {/* PDF Export Notification Toast */}
      {pdfNotification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          pdfNotification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
        }`}>
          {pdfNotification.message}
        </div>
      )}

      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 lg:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            {/* Logo KONSUL pequeño */}
            <img 
              src="https://konsul.digital/wp-content/uploads/2025/07/Logo-en-BW-e1751712792454.png" 
              alt="KONSUL" 
              className="h-6 w-auto"
            />
            <div className="text-xs text-cyan-400 font-medium">CONSULTORÍA DIGITAL</div>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white truncate">Plan de Negocio</h1>
          <p className="text-sm lg:text-base text-gray-400 truncate">{idea} • {region}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isExportingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Exportando...</span>
                  <span className="sm:hidden">PDF</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  PDF
                </>
              )}
            </button>
            
            {/* Session Status Indicator */}
            {email && (
              <div className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs lg:text-sm font-medium">
                  <span className="hidden sm:inline">{email.split('@')[0]} • </span>Sesión activa
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Deadline Summary */}
        {aiContent && (actionPlanDeadlines.length > 0 || bitacoraDeadlines.length > 0) && (
          <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Bitácora de Progreso</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {(() => {
                // Use actionPlanDeadlines as the primary source since they're the same
                const deadlines = actionPlanDeadlines.length > 0 ? actionPlanDeadlines : bitacoraDeadlines;
                
                const overdue = deadlines.filter((deadline, index) => {
                  const deadlineInfo = getDeadlineInfo(deadline, completedSteps.includes(index));
                  return deadlineInfo.isOverdue;
                }).length;
                
                const dueToday = deadlines.filter((deadline, index) => {
                  const deadlineInfo = getDeadlineInfo(deadline, completedSteps.includes(index));
                  return deadlineInfo.status === 'due_today';
                }).length;
                
                const upcoming = deadlines.filter((deadline, index) => {
                  const deadlineInfo = getDeadlineInfo(deadline, completedSteps.includes(index));
                  return deadlineInfo.status === 'upcoming' && deadlineInfo.daysRemaining <= 3;
                }).length;
                
                return (
                  <>
                    {overdue > 0 && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <span>⚠️</span>
                        <span>{overdue} paso{overdue !== 1 ? 's' : ''} vencido{overdue !== 1 ? 's' : ''}</span>
          </div>
                    )}
                    {dueToday > 0 && (
                      <div className="flex items-center gap-2 text-orange-400 text-sm">
                        <span>🔥</span>
                        <span>{dueToday} paso{dueToday !== 1 ? 's' : ''} vence{dueToday !== 1 ? 'n' : ''} hoy</span>
        </div>
                    )}
                    {upcoming > 0 && (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <span>📅</span>
                        <span>{upcoming} paso{upcoming !== 1 ? 's' : ''} próximo{upcoming !== 1 ? 's' : ''} a vencer</span>
                      </div>
                    )}
                    {overdue === 0 && dueToday === 0 && upcoming === 0 && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <span>✅</span>
                        <span>Todo al día</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Sticky Tab Navigation */}
        <div className="sticky top-4 z-30 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl mb-6">
          <div className="p-2">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                    section.special
                      ? 'bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-cyan-400 transition-all duration-300"
              >
                <Menu className="w-5 h-5" />
                <span className="text-sm font-medium">Menú</span>
              </button>
              
              {/* Mobile Progress Indicator */}
              <div className="text-xs text-gray-400">
                {sections.length} secciones
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business Summary */}
          <div id="resumen" className="lg:col-span-2 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Resumen del Negocio
                {sectionLoadingStates.businessSummary && (
                  <div className="inline-block w-3 h-3 bg-cyan-400 rounded-full animate-pulse ml-2"></div>
                )}
              </h2>
            </div>
            <div className="space-y-4">
              {aiContent ? (
                <div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {aiContent.businessSummary}
                  </p>
                  
                  {/* AI-Generated Business Insights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-cyan-400 font-medium mb-2">Propuesta de Valor</h4>
                      <p className="text-gray-300 text-sm">
                        {businessSubSections ? 
                          businessSubSections.propuestaValor : 
                          'Generando propuesta de valor...'
                        }
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-cyan-400 font-medium mb-2">Modelo de Negocio</h4>
                      <p className="text-gray-300 text-sm">
                        {businessSubSections ? 
                          businessSubSections.modeloNegocio : 
                          'Generando modelo de negocio...'
                        }
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-cyan-400 font-medium mb-2">Ventaja Competitiva</h4>
                      <p className="text-gray-300 text-sm">
                        {businessSubSections ? 
                          businessSubSections.ventajaCompetitiva : 
                          'Generando ventaja competitiva...'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Generando análisis de IA para tu idea de negocio...</p>
                  <p className="text-gray-500 text-sm mt-2">Esto puede tomar unos momentos</p>
                </div>
              )}
            </div>
          </div>

          {/* Market Size */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Tamaño del Mercado</h2>
            </div>
            <div className="space-y-4">
              {aiContent ? (
                <div>
                  {/* AI-Generated Market Size Content - Simple Text with Bullet Separation */}
                  <div 
                    className="text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: aiContent.marketSize ? 
                        cleanAndLimitMarketSizeContent(aiContent.marketSize) : 
                        'Analizando tamaño del mercado...'
                    }}
                  />
                  
                  {/* AI-Generated Market Metrics */}
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs">Tamaño del Mercado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getMarketSizeCategory(aiContent.marketSize) === 'Alto' ? 'bg-green-500/20 text-green-400' :
                          getMarketSizeCategory(aiContent.marketSize) === 'Medio' ? 'bg-cyan-500/20 text-cyan-400' :
                          getMarketSizeCategory(aiContent.marketSize) === 'Bajo' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {getMarketSizeCategory(aiContent.marketSize)}
                        </span>

                      </div>
                      <div className="text-lg font-bold text-cyan-400">
                        {aiContent.marketSize ? 
                          formatMarketSizeValue(aiContent.marketSize) : 
                          'Analizando...'
                        }
                      </div>
                      <div className="text-gray-400 text-xs">
                        {aiContent.marketSize ? 
                          getMarketSizeDescription(aiContent.marketSize) : 
                          'Valor de mercado'
                        }
                      </div>
                    </div>
                    
                    {/* Market Opportunity Indicator */}
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Oportunidad de Mercado</div>
                        <div className="text-2xl font-bold text-green-400">
                          {aiContent.marketSize ? getMarketTrend(aiContent.marketSize).emoji : '📊'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {aiContent.marketSize ? 
                            getMarketTrend(aiContent.marketSize).description : 
                            'Analizando tendencias'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Analizando tamaño del mercado...</p>
                  <p className="text-gray-500 text-sm mt-2">Evaluando oportunidades y tendencias</p>
                </div>
              )}
            </div>
        </div>

          {/* Pricing Strategy - Same Structure as Above Sections */}
          <div className="lg:col-span-2 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Estrategia de Precios</h2>
            </div>
            
            {aiContent ? (
              <div>
                {/* AI-Generated Pricing Insights - Compact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-600/50 hover:border-purple-500/30 transition-all duration-300">
                    <h4 className="text-purple-400 font-semibold mb-2 text-sm text-center break-words">Modelo de Precios</h4>
                    <div className="text-gray-200 text-xs leading-relaxed break-words whitespace-pre-line">
                      {pricingSubSections ? 
                        pricingSubSections.modeloPrecios : 
                        'Generando modelo de precios...'
                      }
                    </div>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-600/50 hover:border-blue-500/30 transition-all duration-300">
                    <h4 className="text-blue-400 font-semibold mb-2 text-sm text-center break-words">Estrategia Competitiva</h4>
                    <div className="text-gray-200 text-xs leading-relaxed break-words whitespace-pre-line">
                      {pricingSubSections ? 
                        pricingSubSections.estrategiaCompetitiva : 
                        'Generando estrategia competitiva...'
                      }
                    </div>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-600/50 hover:border-green-500/30 transition-all duration-300">
                    <h4 className="text-green-400 font-semibold mb-2 text-sm text-center break-words">Recomendaciones</h4>
                    <div className="text-gray-200 text-xs leading-relaxed break-words whitespace-pre-line">
                      {pricingSubSections ? 
                        pricingSubSections.recomendaciones : 
                        'Generando recomendaciones...'
                      }
                    </div>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-600/50 hover:border-cyan-500/30 transition-all duration-300">
                    <h4 className="text-cyan-400 font-semibold mb-2 text-sm text-center break-words">Análisis de Competidores</h4>
                    <div className="text-gray-200 text-xs leading-relaxed break-words whitespace-pre-line">
                      {pricingSubSections ? 
                        pricingSubSections.analisisCompetidores : 
                        'Generando análisis de competidores...'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 mx-auto mb-3"></div>
                <p className="text-gray-300 text-base mb-1">Generando estrategia de precios...</p>
                <p className="text-gray-500 text-sm">Analizando modelo de negocio y competencia</p>
              </div>
            )}
          </div>

          {/* Brand Names - Same Structure as Above Sections */}
          <div id="marcas" className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Tag className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Nombres de Marca</h2>
              </div>
              <button
                onClick={handleRegenerateNames}
                disabled={isRegeneratingNames || regenerationAttempts >= 2}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                  regenerationAttempts >= 2
                    ? 'bg-gray-600/20 border border-gray-500/30 text-gray-500 cursor-not-allowed'
                    : isRegeneratingNames
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                      : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                }`}
                title={regenerationAttempts >= 2 ? 'Límite de regeneraciones alcanzado' : `Regeneraciones restantes: ${2 - regenerationAttempts}`}
              >
                {isRegeneratingNames ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    Regenerando...
                  </>
                ) : regenerationAttempts >= 2 ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Límite alcanzado
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerar ({2 - regenerationAttempts} restantes)
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              {aiContent && aiContent.brandSuggestions && aiContent.brandSuggestions.length > 0 ? (
                aiContent.brandSuggestions.map((brand, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-white text-base">{brand}</div>
                        {/* Favorite Star Icon */}
                        <button
                          onClick={() => handleFavoriteNameChange(brand)}
                          className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${
                            favoriteName === brand
                              ? 'text-yellow-400 bg-yellow-400/20'
                              : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                          }`}
                          title={favoriteName === brand ? 'Quitar de favoritos' : 'Marcar como favorito'}
                        >
                          {favoriteName === brand ? (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="text-gray-300 text-xs leading-relaxed">
                        {(() => {
                          console.log('🔍 Brand reasoning debug for index', index);
                          console.log('🔍 aiContent.brandReasoning:', aiContent.brandReasoning);
                          console.log('🔍 aiContent.brandReasoning type:', typeof aiContent.brandReasoning);
                          console.log('🔍 aiContent.brandReasoning length:', aiContent.brandReasoning?.length);
                          console.log('🔍 aiContent.brandReasoning[index]:', aiContent.brandReasoning?.[index]);
                          
                          if (aiContent.brandReasoning && aiContent.brandReasoning[index]) {
                            console.log('✅ Using AI-generated reasoning for index', index);
                            return aiContent.brandReasoning[index];
                          } else {
                            console.log('⚠️ Using fallback reasoning for index', index);
                            return 'Nombre estratégicamente seleccionado por IA basado en tu idea de negocio, mercado objetivo y posicionamiento deseado.';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Generando nombres de marca...</p>
                  <p className="text-gray-500 text-sm mt-2">Creando opciones estratégicas y memorables</p>
                </div>
              )}
            </div>
          </div>

          {/* Domain Verification Section - Only show when a brand is marked as favorite */}
          {aiContent && aiContent.brandSuggestions && aiContent.brandSuggestions.length > 0 && (
            <div className="lg:col-span-3 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">🌐 Verificación de Dominios</h3>
                {favoriteName ? (
                  <p className="text-gray-400 text-sm">
                    Verificando disponibilidad de dominios para tu marca favorita: <span className="text-yellow-400 font-semibold">"{favoriteName}"</span>
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm">
                    💡 <span className="text-yellow-400">Marca una marca como favorita</span> (⭐) en la sección de nombres de marca para verificar la disponibilidad de dominios.
                  </p>
                )}
              </div>
              {favoriteName && (
                <DomainChecker 
                  key={favoriteName} // Force re-render when favorite brand changes
                  brandNames={[favoriteName]} // Only check domains for the favorite brand
                />
              )}
            </div>
          )}

          {/* Recommended Tools */}
          <div id="herramientas" className="lg:col-span-3 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Wrench className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Herramientas Recomendadas</h2>
              <span className="text-sm text-gray-400 ml-auto">Herramientas probadas para emprendedores</span>
            </div>
            
            {/* Design / Productivity Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Design / Productivity
                    </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools[0].items.map((tool, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 hover:border-blue-400/40 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white text-base group-hover:text-blue-200 transition-colors">
                        {tool.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1 group-hover:text-blue-300 transition-colors" />
                          </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                            {tool.description}
                          </p>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50"
                          >
                            Visitar herramienta
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                ))}
                    </div>
            </div>

            {/* Marketing Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                Marketing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools[1].items.map((tool, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/40 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white text-base group-hover:text-purple-200 transition-colors">
                        {tool.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1 group-hover:text-purple-300 transition-colors" />
                    </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 hover:text-purple-300 transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50"
                    >
                      Visitar herramienta
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Finance Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Finance
                    </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools[2].items.map((tool, index) => (
                  <div key={index} className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4 hover:border-green-400/40 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white text-base group-hover:text-green-200 transition-colors">
                        {tool.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-green-400 flex-shrink-0 mt-1 group-hover:text-green-300 transition-colors" />
                          </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                            {tool.description}
                          </p>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 hover:text-green-300 transition-all duration-300 border border-green-500/30 hover:border-green-400/50"
                          >
                            Visitar herramienta
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
            </div>

            {/* Operations / Digital Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                Operations / Digital
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools[3].items.map((tool, index) => (
                  <div key={index} className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-400/40 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white text-base group-hover:text-cyan-200 transition-colors">
                        {tool.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1 group-hover:text-cyan-300 transition-colors" />
                    </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 hover:text-cyan-300 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400/50"
                    >
                      Visitar herramienta
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Affiliate Note */}
            <div className="mt-6 p-4 bg-gray-700/20 border border-gray-600/30 rounded-lg">
              <p className="text-xs text-gray-400 text-center">
                💡 <strong>Nota:</strong> Usa estas herramientas para lograr llevar tu proyecto de idea a MVP.
              </p>
            </div>
          </div>

          {/* Actionable Resources - Optimized */}
          <div className="lg:col-span-3 bg-gray-800/30 border border-gray-700 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Recursos Listos para Usar</h2>
              <span className="text-sm text-gray-400 ml-auto">Plantillas y guías accionables</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {actionableResources.map((resource, index) => {
                const IconComponent = resource.icon;
                const isTemplate = resource.type === 'template';
                
                return (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-3 rounded-lg border transition-all duration-300 group hover:scale-[1.02] ${
                      isTemplate 
                        ? 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400' 
                        : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        isTemplate ? 'bg-cyan-500/20' : 'bg-cyan-500/20'
                      }`}>
                        <IconComponent className={`w-3.5 h-3.5 ${
                          isTemplate ? 'text-cyan-400' : 'text-cyan-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium mb-1 group-hover:${
                          isTemplate ? 'text-cyan-400' : 'text-cyan-400'
                        } transition-colors text-white text-sm`}>
                          {resource.title}
                        </h3>
                        <p className="text-gray-300 text-xs leading-relaxed">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isTemplate 
                          ? 'bg-cyan-500/20 text-cyan-400' 
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {isTemplate ? 'Plantilla' : 'Guía'}
                      </span>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        isTemplate ? 'text-cyan-400' : 'text-cyan-400'
                      }`}>
                        {resource.cta}
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-medium text-sm">Tip Pro</span>
              </div>
              <p className="text-gray-300 text-sm">
                Comienza con la plantilla de validación y el tracker financiero. 
                Son los recursos más importantes para estructurar tu idea desde el día 1.
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div id="plan" className="lg:col-span-3 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Plan de Acción Personalizado</h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:ml-auto">
                <span className="text-sm text-gray-400 order-2 sm:order-1">
                  {completedSteps.length}/7 completados
                  {completedSteps.length > 0 && (
                    <span className="ml-2 text-cyan-400">
                      • Próximo: Paso {completedSteps.length + 1}
                    </span>
                  )}
                </span>
                <button
                  onClick={sendFollowUpEmail}
                  disabled={isGeneratingContent || !aiContent}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm transition-all duration-300 order-1 sm:order-2 ${
                    isGeneratingContent || !aiContent
                      ? 'bg-gray-600/30 text-gray-400 border-gray-500/30 cursor-not-allowed'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                  title={isGeneratingContent || !aiContent ? 'Dashboard no está listo aún' : 'Enviar email de seguimiento'}
                >
                  {isGeneratingContent ? '⏳ Generando...' : '📧 Enviar seguimiento'}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {aiContent && aiContent.actionPlan && Array.isArray(aiContent.actionPlan) ? (
                aiContent.actionPlan.map((step: string, index: number) => {
                  const isCompleted = completedSteps.includes(index);
                  const isExpanded = expandedSteps.includes(index);
                  
                  // Get deadline info for this step
                  const deadline = actionPlanDeadlines[index];
                  const deadlineInfo = deadline ? getDeadlineInfo(deadline, isCompleted) : null;
                  
                  return (
                    <div key={index} className={`border rounded-lg transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-cyan-500/10 border-cyan-500/30' 
                        : deadlineInfo?.isOverdue
                          ? 'bg-red-500/10 border-red-500/30'
                          : deadlineInfo?.status === 'due_today'
                            ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-gray-900/50 border-gray-600'
                    }`}>
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStepCompletion(index)}
                            disabled={!canCompleteStep(index)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
                              isCompleted
                                ? 'bg-cyan-500 text-white'
                                : canCompleteStep(index)
                                  ? 'bg-gray-700 border-2 border-gray-600 hover:border-cyan-400'
                                  : 'bg-gray-800 border-2 border-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                            title={!canCompleteStep(index) ? `Debes completar el paso ${index} primero` : 'Completar paso'}
                          >
                            {isCompleted ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-medium transition-colors ${
                              isCompleted 
                                  ? 'text-cyan-400 line-through' 
                                : canCompleteStep(index)
                                  ? 'text-white'
                                  : 'text-gray-500'
                            }`}>
                              Paso {index + 1}
                              {!canCompleteStep(index) && !isCompleted && (
                                <span className="ml-2 text-xs text-gray-500">(Bloqueado)</span>
                              )}
                            </h3>
                              {isCompleted ? (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                  <span>🎉</span>
                                  <span>¡Felicidades, vas avanzando!</span>
                                </div>
                              ) : deadlineInfo && (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(deadlineInfo.urgencyLevel)}`}>
                                  <span>{getDeadlineIcon(deadlineInfo.status)}</span>
                                  <span>
                                    {deadlineInfo.isOverdue 
                                      ? `Vencido hace ${Math.abs(deadlineInfo.daysRemaining)} días`
                                      : deadlineInfo.status === 'due_today'
                                        ? 'Vence hoy'
                                        : `Vence ${formatDeadlineDate(deadlineInfo.dueDate)}`
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-3">
                              {step}
                            </p>
                            <button
                              onClick={() => toggleStepExpansion(index)}
                              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                            >
                              Ver cómo hacerlo
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 ml-9 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                            <h4 className="text-cyan-400 font-medium mb-2">Guía de Implementación</h4>
                            <p className="text-gray-300 text-sm leading-relaxed mb-3">
                              Implementa este paso siguiendo las mejores prácticas para tu tipo de proyecto. Enfócate en la ejecución práctica y la validación con usuarios reales.
                            </p>
                            <div className="flex gap-2">
                              <a
                                href={AIService.getStepResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[index]?.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 text-sm"
                                title={AIService.getStepResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[index]?.description || 'Ver recursos relacionados'}
                              >
                                <ExternalLink className="w-3 h-3" />
                                {AIService.getStepResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[index]?.title || 'Ver recursos'}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {/* Notes Section */}
                        <div className="mt-3 ml-9">
                          <textarea
                            value={stepNotes[index] || ''}
                            onChange={(e) => updateStepNote(index, e.target.value)}
                            placeholder="Añade notas, ideas o próximos pasos..."
                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-300"
                            rows={2}
                          />
                          {stepNotes[index] && (
                            <div className="mt-2 text-xs text-gray-400">
                              💡 Nota guardada automáticamente
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Generando plan de acción personalizado...</p>
                  <p className="text-gray-500 text-sm mt-2">Creando 7 pasos específicos para tu tipo de proyecto</p>
                </div>
              )}
            </div>
          </div>

          {/* Market Research & Validation Section */}
          <div id="validacion" className="lg:col-span-3 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">🔍 Investigación de Mercado & Validación</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed">
                Valida el interés real del mercado para tu idea: <span className="text-purple-400 font-medium">"{idea}"</span>. 
                Usa estos términos de búsqueda para investigar la demanda, competencia y tendencias del mercado.
              </p>
            </div>

            {/* Search Terms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">🔍 Términos de Búsqueda Principales</h4>
                <p className="text-gray-400 text-xs mb-3">Palabras clave para investigar en Google, Google Trends, y herramientas de análisis de mercado</p>
                <div className="space-y-2">
                  {aiContent && aiContent.marketResearch && aiContent.marketResearch.searchTerms && Array.isArray(aiContent.marketResearch.searchTerms) ? (
                    aiContent.marketResearch.searchTerms.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-600">
                        <span className="text-gray-300 text-sm">{topic}</span>
                        <button
                          onClick={() => copyToClipboard(topic)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-300 ${
                            recentlyCopied.includes(topic)
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          }`}
                        >
                          {recentlyCopied.includes(topic) ? '✅ Copiado' : '📋 Copiar'}
                        </button>
                      </div>
                    ))
                  ) : (
                    generatePrimarySearchTerms(idea, projectType).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-600">
                        <span className="text-gray-300 text-sm">{topic}</span>
                        <button
                          onClick={() => copyToClipboard(topic)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-300 ${
                            recentlyCopied.includes(topic)
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          }`}
                        >
                          {recentlyCopied.includes(topic) ? '✅ Copiado' : '📋 Copiar'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">🎯 Temas de Validación Clave</h4>
                <p className="text-gray-400 text-xs mb-3">Conceptos que puedes investigar en Google Trends, SEMrush, y herramientas de análisis</p>
                <div className="space-y-2">
                  {aiContent && aiContent.marketResearch && aiContent.marketResearch.validationTopics && Array.isArray(aiContent.marketResearch.validationTopics) ? (
                    aiContent.marketResearch.validationTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-600">
                        <span className="text-gray-300 text-sm">{topic}</span>
                        <button
                          onClick={() => copyToClipboard(topic)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-300 ${
                            recentlyCopied.includes(topic)
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          }`}
                        >
                          {recentlyCopied.includes(topic) ? '✅ Copiado' : '📋 Copiar'}
                        </button>
                      </div>
                    ))
                  ) : (
                    generateMarketValidationTopics(idea, projectType).map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-600">
                        <span className="text-gray-300 text-sm">{topic}</span>
                        <button
                          onClick={() => copyToClipboard(topic)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-300 ${
                            recentlyCopied.includes(topic)
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          }`}
                        >
                          {recentlyCopied.includes(topic) ? '✅ Copiado' : '📋 Copiar'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Research Tools & Methods */}
            <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-4">🛠️ Herramientas y Métodos de Investigación</h3>
              <p className="text-gray-400 text-sm mb-4">Técnicas específicas para validar tu idea de negocio y entender el mercado</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm">📊 Análisis de Datos</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    {aiContent && aiContent.marketResearch && aiContent.marketResearch.researchMethods && Array.isArray(aiContent.marketResearch.researchMethods) ? (
                      aiContent.marketResearch.researchMethods.slice(0, 2).map((method, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>{method}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>Análisis de Google Trends por región y sector</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>Auditoría de sitios web de competidores</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm">📱 Redes Sociales</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    {aiContent && aiContent.marketResearch && aiContent.marketResearch.researchMethods && Array.isArray(aiContent.marketResearch.researchMethods) ? (
                      aiContent.marketResearch.researchMethods.slice(2, 4).map((method, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>{method}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>Análisis de sentimiento en redes sociales</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>Encuestas online con herramientas como Typeform</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm">🎯 Validación Directa</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    {aiContent && aiContent.marketResearch && aiContent.marketResearch.researchMethods && Array.isArray(aiContent.marketResearch.researchMethods) ? (
                      aiContent.marketResearch.researchMethods.slice(4, 6).map((method, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>{method}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>Análisis de métricas de mercado con SEMrush</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>Entrevistas con usuarios potenciales del sector</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Research Progress & Next Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {aiContent && aiContent.marketResearch && aiContent.marketResearch.searchTerms && Array.isArray(aiContent.marketResearch.searchTerms) 
                    ? aiContent.marketResearch.searchTerms.length 
                    : generatePrimarySearchTerms(idea, projectType).length}
                </div>
                <div className="text-gray-300 text-sm">Términos Principales</div>
                <div className="text-xs text-gray-400 mt-1">Para investigar</div>
              </div>
              
              <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {aiContent && aiContent.marketResearch && aiContent.marketResearch.validationTopics && Array.isArray(aiContent.marketResearch.validationTopics) 
                    ? aiContent.marketResearch.validationTopics.length 
                    : generateMarketValidationTopics(idea, projectType).length}
                </div>
                <div className="text-gray-300 text-sm">Temas Clave</div>
                <div className="text-xs text-gray-400 mt-1">Para validar</div>
              </div>
              
              <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                <div className="text-2xl font-bold text-cyan-400 mb-1">3</div>
                <div className="text-gray-300 text-sm">Herramientas</div>
                <div className="text-xs text-gray-400 mt-1">Para usar</div>
              </div>
            </div>

            {/* Research Action Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowBitacora(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                🔬 Comenzar Investigación de Mercado
              </button>
              <p className="text-gray-400 text-xs mt-2">
                Ve a la Bitácora para hacer seguimiento detallado de tu investigación
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-2 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Acciones Rápidas</h2>
            </div>
            
            {/* Feedback Request */}
            <div className="mb-6">
              <button
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium text-white">Pide Feedback</div>
                    <div className="text-xs text-blue-300">Envía tu idea a 3 personas de confianza</div>
                  </div>
                </div>
                {showFeedbackForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showFeedbackForm && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                  <p className="text-gray-300 text-sm mb-4">
                    Enviaremos un email personalizado con tu idea a estas personas para que te den feedback honesto:
                  </p>
                  <div className="space-y-3 mb-4">
                    {feedbackEmails.map((email, index) => (
                      <input
                        key={index}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...feedbackEmails];
                          newEmails[index] = e.target.value;
                          setFeedbackEmails(newEmails);
                        }}
                        placeholder={`Email ${index + 1} (ej: mentor, amigo, colega)`}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all duration-300 text-sm"
                      />
                    ))}
                  </div>
                  <button
                    onClick={sendFeedbackEmails}
                    disabled={feedbackEmails.filter(email => email.trim() && email.includes('@')).length === 0 || isGeneratingContent || !aiContent}
                    className={`w-full py-2 px-4 font-medium rounded-lg transition-all duration-300 text-sm ${
                      feedbackEmails.filter(email => email.trim() && email.includes('@')).length === 0 || isGeneratingContent || !aiContent
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                    }`}
                    title={isGeneratingContent || !aiContent ? 'Dashboard no está listo aún' : 'Enviar solicitudes de feedback'}
                  >
                    {isGeneratingContent ? '⏳ Generando...' : '📤 Enviar solicitudes de feedback'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Social Sharing */}
            <div className="space-y-3">
              <h3 className="text-white font-medium mb-3">Compartir en Redes</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-400/20 to-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 hover:bg-blue-400/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">𝕏</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">Twitter/X</div>
                      <div className="text-xs text-blue-300">Comparte tu idea públicamente</div>
                    </div>
                  </div>
                  {socialShares.twitter.shared && (
                    <div className="text-right">
                      <div className="text-xs text-blue-300">¡Compartido!</div>
                      <div className="text-sm font-medium text-white">
                        🎯
                      </div>
                    </div>
                  )}
                </button>
                
                <button
                  onClick={() => shareToSocial('linkedin')}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">in</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">LinkedIn</div>
                      <div className="text-xs text-blue-300">Comparte profesionalmente</div>
                    </div>
                  </div>
                  {socialShares.linkedin.shared && (
                    <div className="text-right">
                      <div className="text-xs text-blue-300">¡Compartido!</div>
                      <div className="text-sm font-medium text-white">
                        🎯
                      </div>
                    </div>
                  )}
                </button>
              </div>
              
              {(socialShares.twitter.shared || socialShares.linkedin.shared) && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-medium text-sm">¡Excelente Compartir!</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Has compartido tu idea en <strong className="text-white">
                      {socialShares.twitter.shared && socialShares.linkedin.shared ? 'Twitter y LinkedIn' : 
                       socialShares.twitter.shared ? 'Twitter' : 'LinkedIn'}
                    </strong>
                  </p>
                  <p className="text-purple-300 text-xs mt-1">
                    🎯 Cada compartir aumenta las posibilidades de encontrar feedback valioso
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Konsul Services */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-4">¿Necesitas ayuda?</h2>
            <div className="space-y-3">
              <button
                disabled
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-lg text-gray-400 cursor-not-allowed opacity-60"
              >
                <Zap className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Kônsul Tasks</div>
                  <div className="text-xs text-gray-300">Coming Soon</div>
                </div>
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-lg text-gray-400 cursor-not-allowed opacity-60"
              >
                <Calculator className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Kônsul Bills</div>
                  <div className="text-xs text-gray-300">Coming Soon</div>
                </div>
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* Bitácora del Proyecto View */}
      {showBitacora && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen p-4">
            <div className="w-full">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3 lg:gap-4">
                  <button
                    onClick={() => setShowBitacora(false)}
                    className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-cyan-400 transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Bitácora del Proyecto</h1>
                    <p className="text-sm lg:text-base text-gray-400 truncate">Ruta de progreso de tu negocio: {idea}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center lg:justify-end">
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center lg:text-right">
                    <div className="text-2xl lg:text-3xl font-bold text-cyan-400 mb-1">
                      {Math.round((completedSteps.length / bitacoraSteps.length) * 100)}%
                    </div>
                    <div className="text-sm lg:text-base text-gray-400 font-medium">Completado</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {completedSteps.length} de {bitacoraSteps.length} pasos
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Route Map */}
              <div className="relative">
                {/* Start Line - Hidden on mobile, visible on desktop */}
                <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-green-500 to-blue-600 rounded-full"></div>
                
                {/* Start Point */}
                <div className="relative mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25 flex-shrink-0 mx-auto sm:mx-0">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <div className="sm:ml-8 min-w-0 flex-1 text-center sm:text-left">
                      <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">🚀 Inicio del Proyecto</h2>
                      <p className="text-gray-300 text-base lg:text-lg truncate">Tu idea: {idea}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 lg:gap-4 text-xs lg:text-sm text-gray-400">
                        <span>📅 {new Date().toLocaleDateString('es-ES')}</span>
                        <span>🏗️ {projectType}</span>
                        <span>🌎 {region}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-8">
                  {/* Mobile Progress Line - Only shows over completed steps */}
                  {completedSteps.length > 0 && (() => {
                    const lastCompletedIndex = Math.max(...completedSteps);
                    const lineHeight = (lastCompletedIndex + 1) * 180; // 180px per step
                    return (
                      <div className="sm:hidden absolute left-1/2 w-0.5 bg-gradient-to-b from-cyan-500 via-green-500 to-blue-600 transform -translate-x-1/2" 
                           style={{
                             top: '0px',
                             height: `${Math.max(lineHeight, 80)}px`
                           }}>
                      </div>
                    );
                  })()}
                  {bitacoraSteps.map((step: any, index: number) => {
                    const isCompleted = completedSteps.includes(index);
                    const completionDate = isCompleted ? new Date().toLocaleDateString('es-ES') : null;
                    
                    // Get deadline info for this step
                    const deadline = bitacoraDeadlines[index];
                    const deadlineInfo = deadline ? getDeadlineInfo(deadline, isCompleted) : null;
                    
                    return (
                      <div key={index} className="relative flex flex-col sm:block">
                        {/* Step Circle - Centered on mobile, positioned on desktop */}
                        <div className={`hidden sm:flex absolute left-8 w-8 h-8 rounded-full items-center justify-center border-4 ${
                          isCompleted 
                            ? 'bg-cyan-500 border-cyan-400 shadow-lg shadow-cyan-500/25' 
                            : deadlineInfo?.isOverdue
                              ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/25'
                              : deadlineInfo?.status === 'due_today'
                                ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/25'
                                : 'bg-gray-800 border-gray-600'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-gray-400 font-medium text-sm leading-none">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Mobile Step Circle - Inline with content */}
                        <div className={`sm:hidden flex items-center justify-center w-8 h-8 rounded-full border-4 mx-auto mb-4 ${
                          isCompleted 
                            ? 'bg-cyan-500 border-cyan-400 shadow-lg shadow-cyan-500/25' 
                            : deadlineInfo?.isOverdue
                              ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/25'
                              : deadlineInfo?.status === 'due_today'
                                ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/25'
                            : 'bg-gray-800 border-gray-600'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-gray-400 font-medium text-sm">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Step Content */}
                        <div className={`sm:ml-16 p-4 sm:p-6 rounded-xl border transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-cyan-500/10 border-cyan-500/30' 
                            : deadlineInfo?.isOverdue
                              ? 'bg-red-500/10 border-red-500/30'
                              : deadlineInfo?.status === 'due_today'
                                ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-gray-800/30 border-gray-700'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                            <div className="flex-1 min-w-0 text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                <h3 className={`text-lg sm:text-xl font-bold ${
                                  isCompleted ? 'text-cyan-400' : 'text-white'
                              }`}>
                                {step.title}
                              </h3>
                                {isCompleted ? (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                    <span>🎉</span>
                                    <span>¡Felicidades, vas avanzando!</span>
                                  </div>
                                ) : deadlineInfo && (
                                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(deadlineInfo.urgencyLevel)}`}>
                                    <span>{getDeadlineIcon(deadlineInfo.status)}</span>
                                    <span>
                                      {deadlineInfo.isOverdue 
                                        ? `Vencido hace ${Math.abs(deadlineInfo.daysRemaining)} días`
                                        : deadlineInfo.status === 'due_today'
                                          ? 'Vence hoy'
                                          : `Vence ${formatDeadlineDate(deadlineInfo.dueDate)}`
                                      }
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-300 leading-relaxed mb-3 text-sm sm:text-base">
                                {step.description}
                              </p>
                              
                              {/* Completion Status */}
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm">
                                <span className={`px-2 sm:px-3 py-1 rounded-full ${
                                  isCompleted 
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                                    : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                                }`}>
                                  {isCompleted ? '✅ Completado' : '⏳ Pendiente'}
                                </span>
                                {completionDate && (
                                  <span className="text-gray-400">
                                    Completado el {completionDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          {!isCompleted && (
                            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                              <button
                                onClick={() => toggleStepCompletion(index)}
                                disabled={!canCompleteStep(index)}
                                className={`px-3 sm:px-4 py-2 border rounded-lg transition-all duration-300 text-sm ${
                                  canCompleteStep(index)
                                    ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30'
                                    : 'bg-gray-600/20 border-gray-600/30 text-gray-500 cursor-not-allowed'
                                }`}
                                title={!canCompleteStep(index) ? `Debes completar el paso ${index} primero` : 'Completar paso'}
                              >
                                ✅ <span className="hidden sm:inline">Marcar como completado</span><span className="sm:hidden">Completar</span>
                              </button>
                              <a
                                href={AIService.getStepResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[index]?.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 text-sm"
                                title={AIService.getStepResourceLinks({ idea, problem, idealUser, region, alternatives, businessModel, projectType } as BusinessData)[index]?.description || 'Ver recursos relacionados'}
                              >
                                🎥 <span className="hidden sm:inline">Ver recursos</span><span className="sm:hidden">Recursos</span>
                              </a>
                            </div>
                          )}
                          
                          {/* Notes Section in Bitácora */}
                          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                            <h4 className="text-cyan-400 font-medium mb-2">📝 Notas del Proyecto</h4>
                            <textarea
                              value={stepNotes[index] || ''}
                              onChange={(e) => updateStepNote(index, e.target.value)}
                              placeholder="Añade notas, ideas o próximos pasos para este paso..."
                              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-300"
                              rows={3}
                            />
                            {stepNotes[index] && (
                              <div className="mt-2 text-xs text-gray-400">
                                💡 Nota guardada automáticamente
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Finish Line */}
                <div className="relative mt-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-8">
                      <h2 className="text-2xl font-bold text-white mb-2">🎯 Meta del Proyecto</h2>
                      <p className="text-gray-300 text-lg">Validación completa de tu idea de negocio</p>
                      <div className="mt-3 text-sm text-gray-400">
                        <span>🚀 Listo para el siguiente nivel</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary - Moved to top */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <CheckSquare className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-semibold">Progreso General</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">
                      {Math.round((completedSteps.length / bitacoraSteps.length) * 100)}%
                    </div>
                    <div className="text-gray-300 text-sm mb-3">Completado</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(completedSteps.length / bitacoraSteps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-white font-semibold">Próximo Paso</h3>
                  </div>
                  <div className="text-center">
                                          <div className="text-2xl font-bold text-cyan-400 mb-2">
                        {completedSteps.length === bitacoraSteps.length ? '🎉' : '⏳'}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {completedSteps.length === bitacoraSteps.length 
                          ? '¡Completado!' 
                          : `${bitacoraSteps.length - completedSteps.length} pendientes`
                        }
                      </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold">Actividad Reciente</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {completedSteps.length > 0 ? '📈' : '📊'}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {completedSteps.length > 0 
                        ? `${completedSteps.length} pasos completados`
                        : 'Sin actividad aún'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback and Social Actions */}
              <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-6">Acciones de Validación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Feedback Request */}
                  <div>
                    <h4 className="text-cyan-400 font-medium mb-3">📧 Solicitar Feedback</h4>
                    <button
                      onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium text-white">Pide Feedback</div>
                          <div className="text-xs text-blue-300">Envía tu idea a 3 personas de confianza</div>
                        </div>
                      </div>
                      {showFeedbackForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {showFeedbackForm && (
                      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                        <p className="text-gray-300 text-sm mb-4">
                          Enviaremos un email personalizado con tu idea a estas personas:
                        </p>
                        <div className="space-y-3 mb-4">
                          {feedbackEmails.map((email, index) => (
                            <input
                              key={index}
                              type="email"
                              value={email}
                              onChange={(e) => {
                                const newEmails = [...feedbackEmails];
                                newEmails[index] = e.target.value;
                                setFeedbackEmails(newEmails);
                              }}
                              placeholder={`Email ${index + 1} (ej: mentor, amigo, colega)`}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all duration-300 text-sm"
                            />
                          ))}
                        </div>
                        <button
                          onClick={sendFeedbackEmails}
                          disabled={feedbackEmails.filter(email => email.trim() && email.includes('@')).length === 0 || isGeneratingContent || !aiContent}
                          className={`w-full py-2 px-4 font-medium rounded-lg transition-all duration-300 text-sm ${
                            feedbackEmails.filter(email => email.trim() && email.includes('@')).length === 0 || isGeneratingContent || !aiContent
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                          }`}
                          title={isGeneratingContent || !aiContent ? 'Dashboard no está listo aún' : 'Enviar solicitudes de feedback'}
                        >
                          {isGeneratingContent ? '⏳ Generando...' : '📤 Enviar solicitudes de feedback'}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Social Sharing */}
                  <div>
                    <h4 className="text-cyan-400 font-medium mb-3">📱 Compartir en Redes</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => shareToSocial('twitter')}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-400/20 to-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 hover:bg-blue-400/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">𝕏</span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-white">Twitter/X</div>
                            <div className="text-xs text-blue-300">Comparte tu idea públicamente</div>
                          </div>
                        </div>
                        {socialShares.twitter.shared && (
                          <div className="text-right">
                            <div className="text-xs text-blue-300">¡Compartido!</div>
                            <div className="text-sm font-medium text-white">
                              🎯
                            </div>
                          </div>
                        )}
                      </button>
                      
                      <button
                        onClick={() => shareToSocial('linkedin')}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">in</span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-white">LinkedIn</div>
                            <div className="text-xs text-blue-300">Comparte profesionalmente</div>
                          </div>
                        </div>
                        {socialShares.linkedin.shared && (
                          <div className="text-right">
                            <div className="text-xs text-blue-300">¡Compartido!</div>
                            <div className="text-sm font-medium text-white">
                              🎯
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps Recommendation - Only show when all 7 steps are completed */}
              {completedSteps.length === personalizedSteps.length && (
              <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${
                    nextStepRecommendation.priority === 'high' 
                      ? 'bg-red-500/20' 
                      : nextStepRecommendation.priority === 'medium' 
                      ? 'bg-cyan-500/20' 
                      : 'bg-cyan-500/20'
                  }`}>
                    <Zap className={`w-5 h-5 ${
                      nextStepRecommendation.priority === 'high' 
                        ? 'text-red-400' 
                        : nextStepRecommendation.priority === 'medium' 
                        ? 'text-cyan-400' 
                        : 'text-cyan-400'
                    }`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">¿Qué sigue para ti?</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      nextStepRecommendation.priority === 'high' 
                        ? 'bg-red-500/20 text-red-400' 
                        : nextStepRecommendation.priority === 'medium' 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {nextStepRecommendation.stage}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${
                    nextStepRecommendation.priority === 'high' 
                      ? 'text-red-400' 
                      : nextStepRecommendation.priority === 'medium' 
                      ? 'text-cyan-400' 
                      : 'text-cyan-400'
                  }`}>
                    {nextStepRecommendation.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {nextStepRecommendation.description}
                  </p>
                </div>
                
                <div className={`grid gap-4 mb-6 ${
                  nextStepRecommendation.stage === 'MVP con Tracción' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}>
                  {nextStepRecommendation.actions && Array.isArray(nextStepRecommendation.actions) ? nextStepRecommendation.actions.map((action, index) => {
                    const IconComponent = action.icon === 'Zap' ? Zap :
                                        action.icon === 'Target' ? Target :
                                        action.icon === 'Users' ? Users :
                                        action.icon === 'FileText' ? FileText :
                                        action.icon === 'Rocket' ? Zap :
                                        action.icon === 'CreditCard' ? DollarSign :
                                        action.icon === 'Calculator' ? Calculator :
                                        action.icon === 'TrendingUp' ? TrendingUp : Zap;
                    
                    const isPrimary = action.type === 'primary';
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          isPrimary
                            ? nextStepRecommendation.priority === 'high'
                              ? 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30'
                              : nextStepRecommendation.priority === 'medium'
                              ? 'bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border-cyan-500/30'
                              : 'bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border-cyan-500/30'
                            : 'bg-gray-900/50 border-gray-600'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            isPrimary
                              ? nextStepRecommendation.priority === 'high'
                                ? 'bg-red-500/30'
                                : nextStepRecommendation.priority === 'medium'
                                ? 'bg-cyan-500/30'
                                : 'bg-cyan-500/30'
                              : 'bg-gray-700/50'
                          }`}>
                            <IconComponent className={`w-4 h-4 ${
                              isPrimary
                                ? nextStepRecommendation.priority === 'high'
                                  ? 'text-red-400'
                                  : nextStepRecommendation.priority === 'medium'
                                  ? 'text-cyan-400'
                                  : 'text-cyan-400'
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium mb-1 ${
                              isPrimary ? 'text-white' : 'text-gray-300'
                            }`}>
                              {action.title}
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            isPrimary 
                              ? nextStepRecommendation.priority === 'high'
                                ? 'bg-red-500/20 text-red-400'
                                : nextStepRecommendation.priority === 'medium'
                                ? 'bg-red-500/20 text-cyan-400'
                                : 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-gray-700/50 text-gray-400'
                          }`}>
                            {isPrimary ? 'Recomendado' : 'Opcional'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Gestionar en Bitácora →
                          </span>
                        </div>
                      </div>
                    );
                  }) : null}
                </div>
              </div>
              )}

              {/* Konsul Services */}
              <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4">¿Necesitas ayuda?</h2>
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-lg text-gray-400 cursor-not-allowed opacity-60"
                  >
                    <Zap className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Kônsul Tasks</div>
                      <div className="text-xs text-gray-300">Coming Soon</div>
                    </div>
                  </button>
                  <button
                    disabled
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-lg text-gray-400 cursor-not-allowed opacity-60"
                  >
                    <Calculator className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Kônsul Bills</div>
                      <div className="text-xs text-gray-300">Coming Soon</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Mobile Menu Modal */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="flex flex-col h-full animate-in slide-in-from-top duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Menu className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Navegación</h2>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-cyan-400 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      scrollToSection(section.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] ${
                      section.special
                        ? 'bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border-cyan-500/30'
                        : 'bg-gray-800/30 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50 hover:border-gray-600'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        section.special ? 'bg-white' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium text-left">{section.label}</span>
                  </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                ))}
                    </div>
                    </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/50">
              <div className="text-center text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  {sections.length} secciones disponibles
                          </div>
                          </div>
                      </div>
                    </div>
                </div>
              )}

      {/* Modales de Sesión */}
      {showLogin && (
        <UserLogin
          onLoginSuccess={handleLoginSuccess}
          onClose={handleCloseLogin}
        />
      )}

      {showPasswordDisplay && (
        <PasswordDisplay
          email={email}
          password={generatedPassword}
          onClose={handleClosePasswordDisplay}
        />
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { useAirtableDashboard } from './hooks/useAirtableDashboard';
import { Rocket } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AnalysisPreview from './components/AnalysisPreview';
import AirtableTest from './components/AirtableTest';
import { CredentialsModal } from './components/CredentialsModal';
import { PaymentSuccessLoading } from './components/PaymentSuccessLoading';
import { Login } from './components/Login';
import { AIService } from './services/aiService';
import { getWorkingModel } from './config/ai';
import { AirtableService } from './services/airtableService';
import { EmailService } from './services/emailService';
import { safeObjectKeys } from './utils/safeObjectUtils';
import jsPDF from 'jspdf';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [idea, setIdea] = useState('');
  const [problem, setProblem] = useState('');
  const [idealUser, setIdealUser] = useState('');
  const [region, setRegion] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [projectType, setProjectType] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [isPaymentRegistered, setIsPaymentRegistered] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSessionCreated, setIsSessionCreated] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({ email: '', password: '' });
  const [aiPreviewContent, setAiPreviewContent] = useState<{
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
  } | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [isValidatingAI, setIsValidatingAI] = useState(false);
  const [previewSessionId, setPreviewSessionId] = useState<string>('');
  const [dashboardId, setDashboardId] = useState<string>('');
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(false);
  const [isDashboardExpired, setIsDashboardExpired] = useState(false);
  const [dashboardAIContent, setDashboardAIContent] = useState<any>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPaymentSuccessLoading, setShowPaymentSuccessLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail.trim() === '') {
      setEmailError('');
    } else if (!validateEmail(newEmail)) {
      setEmailError('Por favor ingresa un email válido (ej: usuario@dominio.com)');
    } else {
      setEmailError('');
    }
  };

  // Check dashboard unlock status from Airtable
  const checkDashboardUnlockStatus = async (dashboardId: string) => {
    try {
      console.log('🔍 Checking dashboard unlock status for ID:', dashboardId);
      
      const result = await AirtableService.getDashboardById(dashboardId);
      
      if (result.success && result.dashboard) {
        const isActiveValue = result.dashboard.is_active;
        const hasPayment = result.dashboard.payment_at || result.dashboard.stripe_payment_id;
        const isExpired = result.isExpired || false;
        
        // Si el dashboard está expirado, no está desbloqueado
        const isUnlocked = !isExpired && isActiveValue === true && isActiveValue !== null && isActiveValue !== undefined;
        
        // Actualizar estados
        setIsPaymentRegistered(!!hasPayment);
        setIsDashboardExpired(isExpired);
        
        console.log('📊 Dashboard data received:', {
          dashboard_id: result.dashboard.dashboard_id,
          is_active: isActiveValue,
          has_payment: hasPayment,
          is_expired: isExpired,
          is_active_type: typeof isActiveValue,
          isUnlocked: isUnlocked,
          isActiveStrictlyTrue: isActiveValue === true
        });
        setIsDashboardUnlocked(isUnlocked);
        return isUnlocked;
      } else {
        console.error('❌ Failed to get dashboard status:', result.error);
        setIsDashboardUnlocked(false);
        setIsDashboardExpired(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking dashboard unlock status:', error);
      setIsDashboardUnlocked(false);
      setIsDashboardExpired(false);
      return false;
    }
  };
  
  // Airtable dashboard integration - only initialize when email is available
  // Note: createOrUpdateDashboard no longer needed, using createFullDashboard instead
  useAirtableDashboard(email && email.trim().length > 0 ? email : '');

  const fullText = 'validar tu idea y montar tu negocio';



    // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypewriterText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Handle payment success - check if user has active session
  const handlePaymentSuccess = useCallback(async () => {
    try {
      console.log('💳 Procesando pago exitoso...');
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('📱 Es móvil:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      
      // Show payment success loading screen
      setShowPaymentSuccessLoading(true);
      
      // Check if user has an active session in localStorage
      let storedSession = localStorage.getItem('user_session');
      
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          console.log('📱 Sesión encontrada en localStorage:', sessionData);
          
          // Verify session exists in Airtable
          const result = await AirtableService.findUserSession(sessionData.email, sessionData.password);
          
          if (result.success && result.dashboardId) {
            console.log('✅ Sesión verificada en Airtable');
            
            // Mark session as created and payment as registered
            setIsSessionCreated(true);
            setIsPaymentRegistered(true);
            setIsDashboardUnlocked(true);
            
            // Try to load real preview data from Airtable first
            try {
              const dashboardResult = await AirtableService.getDashboardById(sessionData.previewId);
              
              if (dashboardResult.success && dashboardResult.dashboard) {
                const dashboardData = dashboardResult.dashboard.dashboard_data;
                console.log('📊 Dashboard data loaded from Airtable:', dashboardData);
                setDashboardAIContent(dashboardData);
              }
            } catch (error) {
              console.warn('⚠️ Could not load dashboard data from Airtable:', error);
            }
            
            // Update session with payment info
            const updatedSession = {
              ...sessionData,
              paymentCompleted: true,
              paymentDate: new Date().toISOString()
            };
            localStorage.setItem('user_session', JSON.stringify(updatedSession));
            
            // Send payment success email
            const dashboardUrl = `${window.location.origin}?preview=${sessionData.previewId}`;
            const emailSent = await EmailService.sendPaymentSuccessEmail({
              userEmail: sessionData.email,
              userName: sessionData.email.split('@')[0],
              dashboardId: sessionData.previewId,
              password: sessionData.password,
              idea: dashboardData?.idea || idea || 'Tu idea de negocio',
              creationDate: new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              dashboardUrl: dashboardUrl
            });
            
            if (emailSent) {
              console.log('✅ Email de pago exitoso enviado');
            } else {
              console.warn('⚠️ No se pudo enviar el email de pago exitoso');
            }
            
            // Hide loading screen and show dashboard
            setTimeout(() => {
              setShowPaymentSuccessLoading(false);
              setShowDashboard(true);
              setShowForm(false);
              setShowLogin(false);
              
              // Clear URL parameters
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, '', newUrl);
            }, 2000);
            
            return;
          }
        } catch (error) {
          console.error('❌ Error processing stored session:', error);
        }
      }
      
      // If no valid session, show error
      console.log('❌ No se encontró sesión válida para el pago');
      setShowPaymentSuccessLoading(false);
      setShowForm(true);
      
    } catch (error) {
      console.error('❌ Error in handlePaymentSuccess:', error);
      setShowPaymentSuccessLoading(false);
      setShowForm(true);
    }
  }, [idea, dashboardAIContent]);

  // Listen for URL changes (especially important for mobile)
  useEffect(() => {
    const handleUrlChange = () => {
      console.log('🔄 URL cambió, verificando parámetros...', window.location.href);
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment_success');
      
      if (paymentSuccess === 'true') {
        console.log('💳 Detección tardía de pago exitoso en móvil...');
        handlePaymentSuccess();
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    
    // Also check on focus (when user returns from external app)
    window.addEventListener('focus', handleUrlChange);
    
    // Check immediately in case we missed the initial load
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('focus', handleUrlChange);
    };
  }, [handlePaymentSuccess]);

  // Load preview or dashboard from URL on component mount
  useEffect(() => {
    const loadFromUrl = async () => {
      console.log('🔍 Verificando parámetros de URL...', window.location.href);
      const urlParams = new URLSearchParams(window.location.search);
      const previewId = urlParams.get('preview');
      const dashboardId = urlParams.get('dashboard');
      const testMode = urlParams.get('test');
      const sessionEmail = urlParams.get('session_email');
      const sessionPassword = urlParams.get('session_password');
      const sessionPreviewId = urlParams.get('session_preview_id');
      
      console.log('📊 Parámetros detectados:', {
        previewId,
        dashboardId,
        testMode,
        sessionEmail,
        sessionPassword,
        sessionPreviewId,
        paymentSuccess: urlParams.get('payment_success')
      });
      
      if (testMode === 'airtable') {
        console.log('🧪 Modo de prueba de Airtable activado');
        setShowTest(true);
        return;
      }

      // Payment success detection - user returning from Stripe
      const paymentSuccess = urlParams.get('payment_success');
      if (paymentSuccess === 'true') {
        console.log('💳 Usuario regresando de pago exitoso, validando sesión...');
        await handlePaymentSuccess();
        return;
      }
      
      if (previewId) {
        console.log('🔍 Loading preview from URL:', previewId);
        setPreviewSessionId(previewId);
        
        try {
          // Get dashboard data from Airtable
          const result = await AirtableService.getDashboardById(previewId);
          
          if (result.success && result.dashboard) {
            console.log('✅ Preview loaded from Airtable:', result.dashboard);
            
            // Parse dashboard data
            let dashboardData;
            try {
              dashboardData = typeof result.dashboard.dashboard_data === 'string' 
                ? JSON.parse(result.dashboard.dashboard_data)
                : result.dashboard.dashboard_data;
            } catch (parseError) {
              console.error('❌ Error parsing dashboard data:', parseError);
              dashboardData = {
                executiveSummary: 'Error al cargar el preview',
                strongPoint: 'No se pudo cargar el contenido',
                criticalRisks: ['Error de carga'],
                actionableRecommendation: 'Recarga la página'
              };
            }
            
            // Set the preview content
            setAiPreviewContent(dashboardData);
            
            // If dashboard data is empty or has default values, generate new content
            if (!dashboardData || 
                !dashboardData.executiveSummary || 
                dashboardData.executiveSummary === 'Análisis en progreso...' ||
                dashboardData.executiveSummary === 'Error al cargar el preview') {
              console.log('🔄 Dashboard data is empty or default, generating new content...');
              
              // Generate new preview content
              const previewContent = await generatePreviewContent();
              const safePreviewContent = (previewContent || {
                executiveSummary: 'Análisis en progreso...',
                strongPoint: 'Validando tu idea...',
                criticalRisks: ['Analizando riesgos...'],
                actionableRecommendation: 'Generando recomendaciones...',
                dataBackedInsights: false,
                externalData: {},
                brandSuggestions: [],
                brandReasoning: [],
                intelligentlySearched: false,
                searchQueries: []
              }) as any;
              
              // Set the new content
              setAiPreviewContent(safePreviewContent);
              
              // Update Airtable with the new content
              const projectInfo = {
                projectName: result.dashboard.project_name || idea,
                projectType: result.dashboard.project_type || projectType,
                businessModel: result.dashboard.business_model || businessModel,
                region: result.dashboard.region || region,
                businessIdea: result.dashboard.business_idea || idea,
                problem: result.dashboard.problem || problem,
                idealUser: result.dashboard.ideal_user || idealUser,
                alternatives: result.dashboard.alternatives || alternatives
              };
              
              try {
                const updateResult = await AirtableService.updatePreviewData(previewId, safePreviewContent, projectInfo);
                if (updateResult.success) {
                  console.log('✅ Contenido del preview actualizado en Airtable');
                } else {
                  console.error('❌ Error actualizando contenido del preview:', updateResult.error);
                }
              } catch (error) {
                console.error('❌ Error guardando contenido del preview:', error);
              }
            }
            
            setShowPreview(true);
            
            // Set form data from the dashboard record
            setName(result.dashboard.project_name || '');
            setEmail(result.dashboard.user_email || '');
            setIdea(result.dashboard.business_idea || '');
            setProjectType(result.dashboard.project_type || '');
            setBusinessModel(result.dashboard.business_model || '');
            setRegion(result.dashboard.region || '');
            setProblem(result.dashboard.problem || '');
            setIdealUser(result.dashboard.ideal_user || '');
            setAlternatives(result.dashboard.alternatives || '');
            
            // Check dashboard unlock status - handle empty/undefined values as false
            const isActiveValue = result.dashboard.is_active;
            const isUnlocked = isActiveValue === true && isActiveValue !== null && isActiveValue !== undefined;
            setIsDashboardUnlocked(isUnlocked);
            console.log('🔓 Dashboard unlock status from URL load:', {
              isActiveValue,
              isActiveType: typeof isActiveValue,
              isUnlocked
            });
            
            console.log('✅ Preview loaded successfully from URL');
          } else {
            console.error('❌ Failed to load preview from Airtable:', result.error);
            // Show error message or redirect
            setShowPreview(false);
            setShowForm(false);
          }
        } catch (error) {
          console.error('❌ Error loading preview from URL:', error);
          setShowPreview(false);
          setShowForm(false);
        }
      } else if (dashboardId) {
        console.log('🔍 Loading dashboard from URL:', dashboardId);
        setDashboardId(dashboardId);
        
        try {
          // Get dashboard data from Airtable
          const result = await AirtableService.getDashboardById(dashboardId);
          
          if (result.success && result.dashboard) {
            console.log('✅ Dashboard loaded from Airtable:', result.dashboard);
            
            // Parse dashboard data
            let dashboardData;
            try {
              console.log('🔍 Parsing dashboard data from Airtable:');
              console.log('📊 Raw dashboard_data type:', typeof result.dashboard.dashboard_data);
              console.log('📊 Raw dashboard_data sample:', result.dashboard.dashboard_data?.substring(0, 200));
              
              dashboardData = typeof result.dashboard.dashboard_data === 'string' 
                ? JSON.parse(result.dashboard.dashboard_data)
                : result.dashboard.dashboard_data;
                
              console.log('✅ Dashboard data parsed successfully:');
              console.log('📊 Parsed dashboard_data type:', typeof dashboardData);
              console.log('📊 Parsed dashboard_data keys:', dashboardData && typeof dashboardData === 'object' ? Object.keys(dashboardData) : 'N/A');
            } catch (parseError) {
              console.error('❌ Error parsing dashboard data:', parseError);
              dashboardData = {
                executiveSummary: 'Error al cargar el dashboard',
                strongPoint: 'No se pudo cargar el contenido',
                criticalRisks: ['Error de carga'],
                actionableRecommendation: 'Recarga la página'
              };
            }
            
            // Set the dashboard content
            console.log('🔍 Setting dashboard content:');
            console.log('📊 dashboardData type before setting:', typeof dashboardData);
            console.log('📊 dashboardData keys before setting:', dashboardData && typeof dashboardData === 'object' ? Object.keys(dashboardData) : 'N/A');
            console.log('📊 Setting aiPreviewContent to:', dashboardData);
            console.log('📊 Setting dashboardAIContent to:', dashboardData);
            
            // Verify dashboard data structure
            if (dashboardData && typeof dashboardData === 'object') {
              console.log('✅ Dashboard data structure verification:');
              console.log('📊 executiveSummary exists:', !!dashboardData.executiveSummary);
              console.log('📊 strongPoint exists:', !!dashboardData.strongPoint);
              console.log('📊 criticalRisks exists:', !!dashboardData.criticalRisks);
              console.log('📊 brandSuggestions exists:', !!dashboardData.brandSuggestions);
              console.log('📊 businessSubSections exists:', !!dashboardData.businessSubSections);
              console.log('📊 pricingSubSections exists:', !!dashboardData.pricingSubSections);
            }
            
            setAiPreviewContent(dashboardData);
            setDashboardAIContent(dashboardData);
            setShowDashboard(true);
            
            // Set form data from the dashboard record
            setName(result.dashboard.project_name || '');
            setEmail(result.dashboard.user_email || '');
            setIdea(result.dashboard.business_idea || '');
            setProjectType(result.dashboard.project_type || '');
            setBusinessModel(result.dashboard.business_model || '');
            setRegion(result.dashboard.region || '');
            setProblem(result.dashboard.problem || '');
            setIdealUser(result.dashboard.ideal_user || '');
            setAlternatives(result.dashboard.alternatives || '');
            
            console.log('✅ Dashboard loaded successfully from URL');
          } else {
            console.error('❌ Failed to load dashboard from Airtable:', result.error);
            // Show error message or redirect
            setShowDashboard(false);
            setShowForm(false);
          }
        } catch (error) {
          console.error('❌ Error loading dashboard from URL:', error);
          setShowDashboard(false);
          setShowForm(false);
        }
      }
    };

    loadFromUrl();
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const previewId = urlParams.get('preview');
      const dashboardId = urlParams.get('dashboard');
      
      if (previewId) {
        console.log('🔄 Browser navigation detected, loading preview:', previewId);
        setPreviewSessionId(previewId);
        // The preview will be loaded by the URL loading effect
      } else if (dashboardId) {
        console.log('🔄 Browser navigation detected, loading dashboard:', dashboardId);
        setDashboardId(dashboardId);
        // The dashboard will be loaded by the URL loading effect
      } else {
        console.log('🔄 Browser navigation detected, no ID, showing form');
        setShowPreview(false);
        setShowDashboard(false);
        setShowForm(true);
        setPreviewSessionId('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Check dashboard unlock status periodically when preview is shown
  useEffect(() => {
    if (showPreview && previewSessionId) {
      // Check immediately
      checkDashboardUnlockStatus(previewSessionId);
      
      // Check every 30 seconds
      const interval = setInterval(() => {
        checkDashboardUnlockStatus(previewSessionId);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [showPreview, previewSessionId]);

  // Generate AI content for preview
  const generatePreviewContent = async () => {
    try {
      const businessData = {
        idea,
        problem,
        idealUser,
        region,
        alternatives,
        businessModel,
        projectType
      };
      
      // Call AI service to generate preview content
      const previewContent = await AIService.generatePreviewContent(businessData);
      console.log('🔍 App.tsx - Preview content generated:', previewContent);
      console.log('🔍 App.tsx - Critical risks:', previewContent?.criticalRisks);
      console.log('🔍 App.tsx - Critical risks type:', typeof previewContent?.criticalRisks);
      console.log('🔍 App.tsx - Critical risks length:', previewContent?.criticalRisks?.length);
      return previewContent;
    } catch (error) {
      console.error('Error generating preview content:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission attempt:', {
      name: name.trim(),
      email: email.trim(),
      idea: idea.trim(),
      problem: problem.trim(),
      idealUser: idealUser.trim(),
      region: region,
      alternatives: alternatives.trim(),
      businessModel: businessModel,
      projectType: projectType,
      acceptedTerms: acceptedTerms
    });
    
    if (name.trim() && email.trim() && idea.trim() && problem.trim() && idealUser.trim() && region && alternatives.trim() && businessModel && projectType && acceptedTerms) {
      console.log('All fields valid, generating AI preview...');
      setIsGeneratingPreview(true);
      
      try {
        console.log('🤖 Calling generatePreviewContent...');
        const previewContent = await generatePreviewContent();
        console.log('✅ generatePreviewContent completed, result:', previewContent);
        console.log('✅ generatePreviewContent type:', typeof previewContent);
        console.log('✅ generatePreviewContent is null:', previewContent === null);
        console.log('✅ generatePreviewContent is undefined:', previewContent === undefined);
        // Ensure previewContent is never null
        const safePreviewContent = (previewContent || {
          executiveSummary: 'Análisis en progreso...',
          strongPoint: 'Validando tu idea...',
          criticalRisks: ['Analizando riesgos...'],
          actionableRecommendation: 'Generando recomendaciones...',
          dataBackedInsights: false,
          externalData: {},
          brandSuggestions: [],
          brandReasoning: [],
          intelligentlySearched: false,
          searchQueries: []
        }) as any;
        setAiPreviewContent(safePreviewContent as any);
        
        // Save preview session to Airtable
        console.log('💾 Saving preview session to Airtable...');
        const projectInfo = {
          projectName: idea,
          projectType: projectType,
          businessModel: businessModel,
          region: region,
          businessIdea: idea,
          problem: problem,
          idealUser: idealUser,
          alternatives: alternatives
        };
        
        console.log('🔄 About to call AirtableService.createPreviewSession...');
        console.log('📧 Email:', email);
        console.log('📊 Safe preview content:', safePreviewContent);
        console.log('📊 Safe preview content type:', typeof safePreviewContent);
        console.log('📊 Safe preview content keys:', Object.keys(safePreviewContent || {}));
        console.log('📋 Project info:', projectInfo);
        console.log('📋 Project info type:', typeof projectInfo);
        console.log('📋 Project info keys:', Object.keys(projectInfo || {}));
        
        console.log('🔄 Calling AirtableService.createPreviewSession...');
        const previewResult = await AirtableService.createPreviewSession(email, safePreviewContent, projectInfo);
        console.log('✅ AirtableService.createPreviewSession completed');
        console.log('📋 Preview result received:', previewResult);
        console.log('📋 Preview result success:', previewResult.success);
        console.log('📋 Preview result dashboard:', previewResult.dashboard);
        
        if (previewResult.success && previewResult.dashboard) {
          setPreviewSessionId(previewResult.dashboard.dashboard_id);
          // Set initial unlock status - new previews are always locked
          setIsDashboardUnlocked(false);
          console.log('✅ Preview session saved successfully:', previewResult.dashboard.dashboard_id);
          console.log('🔒 Initial dashboard unlock status: false (new preview)');
        } else {
          console.error('❌ Failed to save preview session:', previewResult.error);
          console.error('❌ Preview result details:', JSON.stringify(previewResult, null, 2));
          setIsDashboardUnlocked(false);
        }
        
        console.log('🔄 Setting showPreview to true...');
        setShowPreview(true);
        console.log('✅ showPreview set to true');
        setIsGeneratingPreview(false);
        
        // Update URL with dashboard ID
        if (previewResult.success && previewResult.dashboard) {
          const newUrl = `${window.location.pathname}?preview=${previewResult.dashboard.dashboard_id}`;
          window.history.pushState({ previewId: previewResult.dashboard.dashboard_id }, '', newUrl);
          console.log('🔗 URL updated with dashboard ID:', newUrl);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
        // Show preview with fallback content
        const fallbackContent = {
          executiveSummary: 'Error al generar análisis. Usando contenido de respaldo.',
          strongPoint: 'Tu idea muestra potencial. Necesitamos más análisis.',
          criticalRisks: ['Requiere validación de mercado', 'Necesita análisis de competencia'],
          actionableRecommendation: 'Contacta soporte para regenerar el análisis.',
          dataBackedInsights: false,
          externalData: {},
          brandSuggestions: [],
          brandReasoning: [],
          intelligentlySearched: false,
          searchQueries: []
        } as any;
        setAiPreviewContent(fallbackContent);
        
        // Save fallback preview session to Airtable
        console.log('💾 Saving fallback preview session to Airtable...');
        const projectInfo = {
          projectName: idea,
          projectType: projectType,
          businessModel: businessModel,
          region: region,
          businessIdea: idea,
          problem: problem,
          idealUser: idealUser,
          alternatives: alternatives
        };
        
        console.log('🔄 About to call AirtableService.createPreviewSession (fallback)...');
        const previewResult = await AirtableService.createPreviewSession(email, fallbackContent, projectInfo);
        console.log('📋 Fallback preview result received:', previewResult);
        
        if (previewResult.success && previewResult.dashboard) {
          setPreviewSessionId(previewResult.dashboard.dashboard_id);
          // Set initial unlock status - new previews are always locked
          setIsDashboardUnlocked(false);
          console.log('✅ Fallback preview session saved successfully:', previewResult.dashboard.dashboard_id);
          console.log('🔒 Initial dashboard unlock status: false (fallback preview)');
        } else {
          console.error('❌ Failed to save fallback preview session:', previewResult.error);
          console.error('❌ Fallback preview result details:', JSON.stringify(previewResult, null, 2));
          setIsDashboardUnlocked(false);
        }
        
        setShowPreview(true);
        setIsGeneratingPreview(false);
        
        // Update URL with dashboard ID for fallback
        if (previewResult.success && previewResult.dashboard) {
          const newUrl = `${window.location.pathname}?preview=${previewResult.dashboard.dashboard_id}`;
          window.history.pushState({ previewId: previewResult.dashboard.dashboard_id }, '', newUrl);
          console.log('🔗 URL updated with fallback dashboard ID:', newUrl);
        }
      } finally {
        // Loading states are now set manually after each operation
        console.log('🏁 handleSubmit finally block - loading states already set');
      }
    } else {
      if (!acceptedTerms) {
        console.log('Terms and conditions not accepted');
        alert('Debes aceptar los términos y condiciones para continuar');
    } else {
      console.log('Some fields are missing or invalid');
      }
    }
  };

  const handleBackToWelcome = () => {
    setShowDashboard(false);
    setDashboardAIContent(null);
    setShowLogin(false);
    // Clear URL parameters when going back
    const newUrl = window.location.pathname;
    window.history.pushState({}, '', newUrl);
    console.log('🔗 URL cleared, returning to welcome page');
  };

  const handleLoginSuccess = async (dashboardId: string, userEmail: string) => {
    try {
      console.log('🔐 Login exitoso, cargando dashboard:', dashboardId);
      
      // Set user data
      setEmail(userEmail);
      setName(userEmail.split('@')[0]);
      setDashboardId(dashboardId);
      
      // Load dashboard data
      const result = await AirtableService.getDashboardById(dashboardId);
      if (result.success && result.dashboard) {
        console.log('✅ Dashboard cargado exitosamente');
        
        // Parse dashboard data
        let dashboardData;
        try {
          dashboardData = typeof result.dashboard.dashboard_data === 'string' 
            ? JSON.parse(result.dashboard.dashboard_data)
            : result.dashboard.dashboard_data;
        } catch (parseError) {
          console.error('❌ Error parsing dashboard data:', parseError);
          dashboardData = null;
        }
        
        // Set dashboard content
        setDashboardAIContent(dashboardData);
        
        // Set form data from dashboard
        if (result.dashboard.business_idea) setIdea(result.dashboard.business_idea);
        if (result.dashboard.problem) setProblem(result.dashboard.problem);
        if (result.dashboard.ideal_user) setIdealUser(result.dashboard.ideal_user);
        if (result.dashboard.alternatives) setAlternatives(result.dashboard.alternatives);
        if (result.dashboard.business_model) setBusinessModel(result.dashboard.business_model);
        if (result.dashboard.project_type) setProjectType(result.dashboard.project_type);
        if (result.dashboard.region) setRegion(result.dashboard.region);
        
        // Mark as unlocked and show dashboard
        setIsDashboardUnlocked(true);
        setShowDashboard(true);
        setShowForm(false);
        setShowLogin(false);
        
        // Update URL
        const newUrl = `${window.location.pathname}?dashboard=${dashboardId}`;
        window.history.pushState({}, '', newUrl);
        
        console.log('✅ Usuario redirigido al dashboard');
      } else {
        console.error('❌ Error cargando dashboard:', result.error);
        alert('Error cargando el dashboard. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('❌ Error en login success:', error);
      alert('Error accediendo al dashboard. Por favor, intenta de nuevo.');
    }
  };

  const handleContinueToDashboard = async () => {
    // Check if dashboard is unlocked before proceeding
    if (previewSessionId) {
      const isUnlocked = await checkDashboardUnlockStatus(previewSessionId);
      if (!isUnlocked) {
        console.log('🔒 Dashboard is locked, cannot proceed');
        alert('El dashboard completo no está desbloqueado. Por favor, completa el proceso de pago para acceder al dashboard completo.');
        return;
      }
    } else {
      console.log('🔒 No preview session ID, cannot proceed');
      alert('No se encontró la sesión del preview. Por favor, genera un nuevo preview.');
      return;
    }

    // Create full dashboard with new ID
    if (email && email.trim().length > 0 && aiPreviewContent) {
      console.log('🚀 Creating full dashboard from preview...');
      console.log('📊 Preview session ID:', previewSessionId);
      
      try {
        // Show loading screen
        
        // Clear any existing dashboard content to force new generation
        setDashboardAIContent(null);
        
        // Show dashboard with loading state
        console.log('🤖 Starting full dashboard generation...');
        console.log('📊 Preview content available for dashboard generation:', !!aiPreviewContent);
        setShowPreview(false);
        setShowDashboard(true); // This will trigger the loading modal in Dashboard component
        
        // Hide loading screen after a short delay to allow dashboard to start
        setTimeout(() => {
        }, 1000);
        
        // The Dashboard component will detect that there's no existingAIContent
        // and will generate new full content with the loading modal using previewContent
        
      } catch (error) {
        console.error('❌ Error starting full dashboard generation:', error);
        alert('Error al iniciar la generación del dashboard completo. Por favor, intenta de nuevo.');
        setShowPreview(true); // Go back to preview if error
        setShowDashboard(false);
      }
    } else {
      console.log('⚠️ Cannot create full dashboard - email or content missing');
      alert('No se puede crear el dashboard completo. Faltan datos necesarios.');
    }
  };

  // Crear sesión de usuario
  const handleCreateSession = async () => {
    if (!email || !previewSessionId) {
      console.error('❌ Email o previewSessionId faltante');
      return;
    }

    setIsCreatingSession(true);
    try {
      const result = await AirtableService.createUserSession(email, previewSessionId);
      
      if (result.success && result.password) {
        console.log('✅ Sesión creada exitosamente');
        
        // Guardar sesión en localStorage para persistencia
        const sessionData = {
          email,
          password: result.password,
          previewId: previewSessionId,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('user_session', JSON.stringify(sessionData));
        
        console.log('💾 Sesión guardada en localStorage:', sessionData);
        
        // Guardar credenciales para el modal
        setGeneratedCredentials({ email, password: result.password });
        
        // Marcar sesión como creada y hacer auto-login
        setIsSessionCreated(true);
        setIsPaymentRegistered(true); // Asumimos que el pago se hará después
        
        console.log('✅ Estados actualizados - isSessionCreated: true, isPaymentRegistered: true');
        console.log('🔍 Estado actual - isSessionCreated:', true);
        console.log('🔍 Estado actual - isPaymentRegistered:', true);
        
        // Enviar email con credenciales
        try {
          await EmailService.sendCredentialsEmail(email, result.password);
          console.log('✅ Email de credenciales enviado');
        } catch (emailError) {
          console.error('❌ Error enviando email:', emailError);
          // No mostramos error al usuario, solo lo logueamos
        }
        
        // Mostrar modal personalizado con URL de redirección
        setShowCredentialsModal(true);
        
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

  // Manejar cierre del modal de credenciales
  const handleCloseCredentialsModal = () => {
    setShowCredentialsModal(false);
  };

  // Continuar al dashboard después de crear sesión
  const handleContinueAfterSession = () => {
    setShowCredentialsModal(false);
    // Auto-login: simular que el usuario ya está logueado
    // Esto activará el botón "Desbloquear Dashboard Completo"
    setIsDashboardUnlocked(true);
    console.log('✅ Modal cerrado, usuario logueado, dashboard desbloqueado');
  };

  // Load real preview data from Airtable
  const loadRealPreviewData = async (previewId: string) => {
    try {
      console.log('📊 Cargando datos reales del preview desde Airtable...');
      
      // Get the preview record from Airtable
      const previewRecord = await AirtableService.getPreviewRecord(previewId);
      
      if (previewRecord && previewRecord.dashboard_data) {
        console.log('✅ Datos del preview encontrados en Airtable');
        
        // Parse the dashboard data
        const dashboardData = JSON.parse(previewRecord.dashboard_data);
        console.log('📊 Dashboard data cargada:', dashboardData);
        
        // Set the AI preview content with real data
        setAiPreviewContent({
          executiveSummary: dashboardData.executiveSummary || '',
          strongPoint: dashboardData.strongPoint || '',
          criticalRisks: dashboardData.criticalRisks || [],
          actionableRecommendation: dashboardData.actionableRecommendation || '',
          brandSuggestions: dashboardData.brandSuggestions || '',
          brandReasoning: dashboardData.brandReasoning || [],
          intelligentlySearched: dashboardData.intelligentlySearched || false,
          searchQueries: dashboardData.searchQueries || [],
          externalData: {
            marketSize: dashboardData.marketSize || {
              totalAddressableMarket: '',
              serviceableAddressableMarket: '',
              serviceableObtainableMarket: ''
            },
            competitors: dashboardData.competitors || [],
            trends: dashboardData.trends || [],
            insights: dashboardData.insights || {
              strategicRecommendations: []
            },
            marketTrends: dashboardData.marketTrends || []
          }
        });

        // Also load the form data from the preview record (only if fields exist)
        // Note: Some fields may not exist in Airtable, so we check for them
        if (previewRecord.business_idea) setIdea(previewRecord.business_idea);
        // problem, ideal_user, alternatives fields don't exist in Airtable, so we skip them
        if (previewRecord.region) setRegion(previewRecord.region);
        if (previewRecord.business_model) setBusinessModel(previewRecord.business_model);
        if (previewRecord.project_type) setProjectType(previewRecord.project_type);
        
        console.log('✅ Datos reales del preview cargados exitosamente');
        return true;
      } else {
        console.log('⚠️ No se encontraron datos del preview en Airtable, generando nuevo contenido...');
        return false;
      }
    } catch (error) {
      console.error('❌ Error cargando datos reales del preview:', error);
      return false;
    }
  };


  const handleExportPDF = async () => {
    try {
      console.log('Starting preview PDF export...');
      console.log('📊 Form data for PDF:', { idea, problem, idealUser, region, alternatives, businessModel, projectType });
      console.log('📊 AI content for PDF:', aiPreviewContent);

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
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;
        
        // Add content
        if (Array.isArray(content)) {
          content.forEach((item, index) => {
            if (currentY > pageHeight - 30) {
              pdf.addPage();
              currentY = margin;
            }
            
            if (includeBullets) {
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'normal');
              pdf.text('• ', margin, currentY);
              currentY = addWrappedText(item, margin + 5, currentY, contentWidth - 5);
            } else {
              currentY = addWrappedText(item, margin, currentY, contentWidth);
            }
          });
        } else {
          currentY = addWrappedText(content, margin, currentY, contentWidth);
        }
        
        return currentY + 10;
      };
      
      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Vista Previa del Análisis', margin, yPosition);
      yPosition += 15;
      
      // Project info
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Información del Proyecto', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addWrappedText(`Idea: ${idea}`, margin, yPosition, contentWidth);
      yPosition = addWrappedText(`Problema: ${problem}`, margin, yPosition, contentWidth);
      yPosition = addWrappedText(`Usuario Ideal: ${idealUser}`, margin, yPosition, contentWidth);
      yPosition = addWrappedText(`Región: ${region}`, margin, yPosition, contentWidth);
      yPosition = addWrappedText(`Alternativas: ${alternatives}`, margin, yPosition, contentWidth);
      yPosition = addWrappedText(`Modelo de Negocio: ${businessModel}`, margin, yPosition, contentWidth);
      yPosition = addWrappedText(`Tipo de Proyecto: ${projectType}`, margin, yPosition, contentWidth);
      yPosition += 10;
      
      // Executive Summary
      if (aiPreviewContent?.executiveSummary) {
        yPosition = addSection('Resumen Ejecutivo', aiPreviewContent.executiveSummary, yPosition, false);
      }
      
      // Strong Points
      if (aiPreviewContent?.strongPoint) {
        yPosition = addSection('Puntos Fuertes', aiPreviewContent.strongPoint, yPosition, false);
      }
      
      // Critical Risks
      if (aiPreviewContent?.criticalRisks && aiPreviewContent.criticalRisks.length > 0) {
        yPosition = addSection('Riesgos Críticos', aiPreviewContent.criticalRisks, yPosition, true);
      }
      
      // Actionable Recommendations
      if (aiPreviewContent?.actionableRecommendation) {
        yPosition = addSection('Recomendaciones Accionables', aiPreviewContent.actionableRecommendation, yPosition, false);
      }
      
      // Market Size
      if (aiPreviewContent?.externalData?.marketSize) {
        const marketSize = aiPreviewContent.externalData.marketSize;
        const marketSizeContent = [
          `TAM (Total Addressable Market): ${marketSize.totalAddressableMarket}`,
          `SAM (Serviceable Addressable Market): ${marketSize.serviceableAddressableMarket}`,
          `SOM (Serviceable Obtainable Market): ${marketSize.serviceableObtainableMarket}`
        ];
        yPosition = addSection('Tamaño del Mercado', marketSizeContent, yPosition, true);
      }
      
      // Competitors
      if (aiPreviewContent?.externalData?.competitors && aiPreviewContent.externalData.competitors.length > 0) {
        const competitorsContent = aiPreviewContent.externalData.competitors.map(comp => 
          `${comp.name}${comp.funding ? ` - Financiación: ${comp.funding.totalRaised}` : ''}${comp.traffic ? ` - Tráfico: ${comp.traffic}` : ''}`
        );
        yPosition = addSection('Competidores', competitorsContent, yPosition, true);
      }
      
      // Market Trends
      if (aiPreviewContent?.externalData?.trends && aiPreviewContent.externalData.trends.length > 0) {
        yPosition = addSection('Tendencias del Mercado', aiPreviewContent.externalData.trends, yPosition, true);
      }
      
      // Brand Suggestions
      if (aiPreviewContent?.brandSuggestions) {
        const brandSuggestions = Array.isArray(aiPreviewContent.brandSuggestions) 
          ? aiPreviewContent.brandSuggestions 
          : [aiPreviewContent.brandSuggestions];
        
        if (brandSuggestions.length > 0) {
          yPosition = addSection('Sugerencias de Marca', brandSuggestions, yPosition, true);
        }
      }
      
      
      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
        pdf.text('Generado por KONSUL - Consultoría Digital', margin, pageHeight - 10);
      }
      
      // Save the PDF
      const fileName = `Vista_Previa_${idea.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('Preview PDF exported successfully');
    } catch (error) {
      console.error('Error exporting preview PDF:', error);
      alert('Error al exportar el PDF. Por favor, intenta de nuevo.');
    }
  };

  const handleStartForm = async () => {
    // Original logic - AI validation and form start
    try {
      setIsValidatingAI(true);
      
      // First validate all Gemini models
      console.log('🧪 Validando modelos de IA antes de comenzar...');
      console.log('🧪 Validating AI models before starting form...');
      
      // Safety check: ensure getWorkingModel is available
      if (typeof getWorkingModel !== 'function') {
        throw new Error('getWorkingModel function not available');
      }
      
      const workingModel = await getWorkingModel();
      
      // Safety check: ensure workingModel is valid
      if (!workingModel) {
        throw new Error('No working AI model returned');
      }
      
      console.log('✅ Working model found:', workingModel);
      
      // Show success message briefly
      console.log('✅ ¡IA validada exitosamente! Redirigiendo al formulario...');
      
      // Wait a moment for user to see the success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear test result and show form
      setShowForm(true);
      setCurrentStep(0);
      
    } catch (error) {
      console.error('❌ Model validation failed:', error);
      console.log('❌ Error al validar la IA. Por favor, recarga la página e intenta de nuevo.');
      
      // Don't show form if AI validation fails
      // User can try again by refreshing
    } finally {
      setIsValidatingAI(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceedToNext()) {
      e.preventDefault();
      nextStep();
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: return name.trim() && email.trim() && validateEmail(email) && emailError === '';
      case 1: return idea.trim();
      case 2: return problem.trim();
      case 3: return idealUser.trim() && region;
      case 4: return alternatives.trim();
      case 5: return businessModel && projectType;
      default: return false;
    }
  };

  const getStepProgress = () => {
    const completedSteps = [
      name.trim() ? 1 : 0,
      email.trim() ? 1 : 0,
      idea.trim() ? 1 : 0,
      problem.trim() ? 1 : 0,
      idealUser.trim() ? 1 : 0,
      region ? 1 : 0,
      alternatives.trim() ? 1 : 0,
      businessModel ? 1 : 0,
      projectType ? 1 : 0
    ].reduce((sum, val) => sum + val, 0);
    return (completedSteps / 9) * 100;
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 0: return 'Tu nombre y email';
      case 1: return 'Vista general del proyecto';
      case 2: return 'El problema';
      case 3: return 'Usuario ideal y región';
      case 4: return 'Alternativas y competidores';
      case 5: return 'Modelo de negocio';
      default: return '';
    }
  };

  console.log('🔍 App render - showPreview:', showPreview);
  console.log('🔍 App render - previewSessionId:', previewSessionId);
  console.log('🔍 App render - aiPreviewContent:', aiPreviewContent);
  console.log('🔍 App render - isSessionCreated:', isSessionCreated);
  console.log('🔍 App render - isCreatingSession:', isCreatingSession);

  if (showPreview) {
    console.log('✅ Rendering AnalysisPreview component');
    return (
      <AnalysisPreview
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          // Clear URL parameters when closing preview
          const newUrl = window.location.pathname;
          window.history.pushState({}, '', newUrl);
          setPreviewSessionId('');
          console.log('🔗 URL cleared, preview closed');
        }}
        onContinue={handleContinueToDashboard}
        onExportPDF={handleExportPDF}
        onCreateSession={handleCreateSession}
        isPaymentRegistered={isPaymentRegistered}
        isCreatingSession={isCreatingSession}
        isSessionCreated={isSessionCreated}
        userEmail={email}
        aiContent={aiPreviewContent || {}} // AI-generated content for preview
        userInputs={{
          idea,
          problem,
          idealUser,
          region,
          alternatives,
          businessModel,
          projectType
        }}
        isDashboardUnlocked={isDashboardUnlocked}
        previewSessionId={previewSessionId}
        isExpired={isDashboardExpired}
        onRenew={() => {
          // Redirigir al link de renovación
          // Crear URL de redirección con parámetros de sesión y pago exitoso
          const currentUrl = window.location.origin + window.location.pathname;
          const redirectUrl = `${currentUrl}?session_email=${encodeURIComponent(email)}&session_password=${encodeURIComponent('temp_password')}&session_preview_id=${previewSessionId}&payment_success=true`;
          const stripeUrl = `https://buy.stripe.com/5kQ7sL3T51j40m0aoggjC03?success_url=${encodeURIComponent(redirectUrl)}`;
          window.location.href = stripeUrl;
        }}
      />
    );
  }

  if (showTest) {
    return (
      <AirtableTest />
    );
  }

  if (showDashboard) {
    return (
      <Dashboard 
        name={name}
        email={email}
        idea={idea} 
        problem={problem}
        idealUser={idealUser}
        region={region}
        alternatives={alternatives}
        businessModel={businessModel}
        projectType={projectType}
        onBack={handleBackToWelcome}
        existingAIContent={(() => {
          console.log('🔍 App.tsx - Passing existingAIContent to Dashboard:');
          console.log('📊 dashboardAIContent:', dashboardAIContent);
          console.log('📊 dashboardAIContent type:', typeof dashboardAIContent);
          console.log('📊 dashboardAIContent is null:', dashboardAIContent === null);
          console.log('📊 dashboardAIContent is undefined:', dashboardAIContent === undefined);
          
          // Parse if it's a string
          if (typeof dashboardAIContent === 'string') {
            console.log('🔧 Parsing dashboardAIContent from string to object');
            try {
              const parsed = JSON.parse(dashboardAIContent);
              console.log('✅ Successfully parsed dashboardAIContent');
              console.log('📊 Parsed type:', typeof parsed);
              console.log('📊 Parsed keys:', Object.keys(parsed));
              return parsed;
            } catch (error) {
              console.error('❌ Error parsing dashboardAIContent:', error);
              return null;
            }
          }
          
          return dashboardAIContent;
        })()} // Only pass full dashboard content, not preview content
        previewContent={aiPreviewContent} // Pass preview content separately
        previewSessionId={previewSessionId} // Pass preview session ID
        dashboardId={dashboardId} // Pass dashboard ID for full dashboard
        isExpired={isDashboardExpired}
        onRenew={() => {
          // Redirigir al link de renovación
          // Crear URL de redirección con parámetros de sesión y pago exitoso
          const currentUrl = window.location.origin + window.location.pathname;
          const redirectUrl = `${currentUrl}?session_email=${encodeURIComponent(email)}&session_password=${encodeURIComponent('temp_password')}&session_preview_id=${previewSessionId}&payment_success=true`;
          const stripeUrl = `https://buy.stripe.com/5kQ7sL3T51j40m0aoggjC03?success_url=${encodeURIComponent(redirectUrl)}`;
          window.location.href = stripeUrl;
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-2xl mx-auto text-center">
        {/* Logo KONSUL */}
        <div className="flex flex-col items-center justify-center mb-8">
          {/* Logo KONSUL */}
          <div className="flex flex-col items-center mb-4">
            <img 
              src="https://konsul.digital/wp-content/uploads/2025/07/Logo-en-BW-e1751712792454.png" 
              alt="KONSUL" 
              className="h-16 w-auto mb-2"
            />
            {/* Plan */}
            <div className="text-lg font-semibold bg-gradient-to-r from-cyan-400 via-green-500 to-blue-600 bg-clip-text text-transparent">
              Plan
          </div>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-in fade-in duration-1000">
          <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            La forma más fácil y rápida de{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-green-500 to-blue-600 bg-clip-text text-transparent relative">
            {typewriterText}
            <span className="animate-pulse">|</span>
          </span>
            {' '}crear tu plan de negocio
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-in fade-in duration-1000" style={{animationDelay: '0.3s'}}>
          Aquí encuentras consultoría automatizada con inteligencia artificial para PYMES, marketing digital y prueba de concepto, todo en un mismo lugar.
        </p>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-green-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-4 mb-8 backdrop-blur-sm animate-in fade-in duration-1000">
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
            <span className="text-cyan-400 text-sm font-medium">Formulario inteligente • Solo 6 pasos • 100% gratuito</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Strong CTA Button */}
        {!showForm && (
          <div className="text-center mb-8 animate-in fade-in duration-700">
            

              <button
                onClick={handleStartForm}
                disabled={isValidatingAI}
                className={`group relative px-12 py-6 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-bold text-xl rounded-2xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-2 border-cyan-400/30 hover:border-cyan-300/50 ${
                  isValidatingAI ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isValidatingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Validando IA...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-6 h-6 animate-bounce" />
                      ¡COMENZAR AHORA!
                      <Rocket className="w-6 h-6 animate-bounce" />
                    </>
                  )}
                </span>
                
                {/* Button glow effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-green-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-green-400 to-blue-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-2xl"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </button>
            
            <p className="text-gray-400 text-sm mt-4 animate-pulse">
              ⚡ Solo toma 2 minutos • Sin registro • Resultado inmediato
            </p>
            
            {/* Login Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-3 bg-gray-800/50 border border-gray-600/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-700/50 hover:border-gray-500/50 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                🔐 Ya tengo una cuenta
              </button>
            </div>
            
            {/* Urgency indicator */}
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-xs font-medium">🚀 Empieza tu prueba de concepto y dale vida a tu emprendimiento con ayuda de expertos HOY</span>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>100% Gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Resultado Inmediato</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>PYMES</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>benchmarks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>dominio web</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>inteligencia artificial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>estrategia de precios</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>competidores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>nombres sugeridos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span>plan de acción</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>herramientas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span>feedback</span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-bottom-8 duration-700">
            {/* Progress Indicator */}
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm transition-all duration-500 ease-in-out">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Paso {currentStep + 1} de 6</span>
                <span className="text-sm text-cyan-400 font-medium">
                  {Math.round(getStepProgress())}% completado
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${getStepProgress()}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center transition-all duration-300">
                {getStepProgress() === 100 
                  ? '🎉 ¡Listo para generar tu dashboard!' 
                  : `Paso ${currentStep + 1}: ${getStepTitle(currentStep)}`
                }
              </p>
            </div>

          {/* Personal Info Section */}
          {currentStep === 0 && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-white mb-3">🚀 ¡Hola! Comencemos tu viaje</h3>
                <p className="text-gray-300">Solo necesitamos un par de datos para personalizar tu experiencia</p>
              </div>
              
              <div className="space-y-4">
                {/* Name Input */}
                <div className="text-left">
                  <label htmlFor="name" className="block text-sm font-medium text-lime-300 mb-2">
                    👋 ¿Cómo te llamas?
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
                    required
                    autoFocus
                  />
                </div>

                {/* Email Input */}
                <div className="text-left">
                  <label htmlFor="email" className="block text-sm font-medium text-lime-300 mb-2">
                    📧 ¿Cuál es tu email?
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyPress={handleKeyPress}
                    placeholder="tu@email.com"
                    className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm text-lg ${
                      emailError 
                        ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20' 
                        : 'border-gray-700 focus:border-cyan-400 focus:ring-cyan-400/20'
                    }`}
                    required
                  />
                  {emailError && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      {emailError}
                    </p>
                  )}
                </div>
              </div>

              {/* Next Button */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!name.trim() || !email.trim() || !validateEmail(email) || emailError !== ''}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Project Overview */}
          {currentStep === 1 && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-white mb-3">🚀 Vista General del Proyecto</h3>
                <p className="text-gray-300">Comencemos con una descripción clara de tu idea</p>
              </div>
              
          <div className="text-left">
            <label htmlFor="idea" className="block text-sm font-medium text-lime-300 mb-2">
                  💡 Describe tu idea en una sola oración
            </label>
            <input
              type="text"
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. 'A platform that automates invoicing for freelancers.'"
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
              required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Sé específico y conciso. Una oración clara es mejor que un párrafo confuso
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300"
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!idea.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: The Problem */}
          {currentStep === 2 && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-white mb-3">🎯 El Problema</h3>
                <p className="text-gray-300">Ahora identifiquemos el problema que tu idea resuelve</p>
          </div>

          <div className="text-left">
                <label htmlFor="problem" className="block text-sm font-medium text-lime-300 mb-2">
                  🎯 ¿Cuál es el problema principal que quieres resolver?
            </label>
                <input
                  type="text"
                  id="problem"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. 'Too much time wasted on manual billing and paperwork.'"
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
              required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Sé específico sobre el dolor que experimentan tus usuarios
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300"
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!problem.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ideal User & Region */}
          {currentStep === 3 && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-white mb-3">👥 Usuario Ideal & Región</h3>
                <p className="text-gray-300">Definamos quién es tu usuario objetivo y dónde se encuentra</p>
          </div>

              <div className="text-left space-y-6">
                <div>
                  <label htmlFor="idealUser" className="block text-sm font-medium text-lime-300 mb-2">
                    👥 ¿Quién es tu usuario ideal? (perfil, ocupación, sector)
                  </label>
                  <input
                    type="text"
                    id="idealUser"
                    value={idealUser}
                    onChange={(e) => setIdealUser(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g. 'Small business owners, IT freelancers, local services.'"
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Sé específico sobre el tipo de persona o empresa que necesita tu solución
                  </p>
                </div>

                <div>
            <label htmlFor="region" className="block text-sm font-medium text-lime-300 mb-2">
                    🌎 ¿En qué región o país te enfocarás primero?
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
              required
            >
              <option value="" disabled className="text-gray-400">
                Selecciona tu región
              </option>
              <option value="latam" className="bg-gray-800">Latinoamérica</option>
              <option value="usa" className="bg-gray-800">Estados Unidos</option>
              <option value="europa" className="bg-gray-800">Europa</option>
              <option value="asia" className="bg-gray-800">Asia</option>
                    <option value="global" className="bg-gray-800">Global / Múltiples regiones</option>
            </select>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300"
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!idealUser.trim() || !region}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Alternatives & Competitors */}
          {currentStep === 4 && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-white mb-3">🔍 Alternativas & Competidores</h3>
                <p className="text-gray-300">Identifiquemos qué soluciones existen actualmente</p>
          </div>

          <div className="text-left">
                <label htmlFor="alternatives" className="block text-sm font-medium text-lime-300 mb-2">
                  🔍 ¿Qué alternativas o competidores tienen tus usuarios hoy?
            </label>
            <input
              type="text"
                  id="alternatives"
                  value={alternatives}
                  onChange={(e) => setAlternatives(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. 'Excel, QuickBooks, manual paperwork, traditional agencies.'"
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Piensa en todas las formas en que tus usuarios resuelven este problema actualmente
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300"
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!alternatives.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Business Model */}
          {currentStep === 5 && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-white mb-3">💰 Modelo de Negocio</h3>
                <p className="text-gray-300">¿Cómo planeas generar ingresos?</p>
          </div>

              <div className="text-left">
                <label htmlFor="businessModel" className="block text-sm font-medium text-lime-300 mb-2">
                  💰 ¿Cómo planeas hacer dinero?
                </label>
                <select
                  id="businessModel"
                  value={businessModel}
                  onChange={(e) => setBusinessModel(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
                  required
                  autoFocus
                >
                  <option value="" disabled className="text-gray-400">
                    Selecciona tu modelo de negocio
                  </option>
                  <option value="Subscription" className="bg-gray-800">Subscription - Suscripción mensual/anual</option>
                  <option value="One-time payment" className="bg-gray-800">One-time payment - Pago único</option>
                  <option value="Commission" className="bg-gray-800">Commission - Comisión por transacción</option>
                  <option value="Marketplace" className="bg-gray-800">Marketplace - Plataforma de intermediación</option>
                  <option value="Freemium" className="bg-gray-800">Freemium - Básico gratis, premium de pago</option>
                  <option value="Not sure yet" className="bg-gray-800">Not sure yet - Aún no estoy seguro</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Elige el modelo que mejor se adapte a tu idea y usuarios
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300"
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!businessModel}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Project Type */}
          {currentStep === 6 && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-white mb-3">🏗️ Tipo de Proyecto</h3>
                <p className="text-gray-300">¿Qué estás construyendo exactamente?</p>
              </div>

          <div className="text-left">
                <label htmlFor="projectType" className="block text-sm font-medium text-lime-300 mb-2">
                  🏗️ ¿Qué tipo de proyecto estás construyendo?
            </label>
            <select
                  id="projectType"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all duration-300 backdrop-blur-sm text-lg"
              required
                  autoFocus
            >
              <option value="" disabled className="text-gray-400">
                    Selecciona el tipo de proyecto
              </option>
                  <option value="SaaS" className="bg-gray-800">SaaS - Software como servicio</option>
                  <option value="Physical Product" className="bg-gray-800">Physical Product - Producto físico</option>
                  <option value="Ecommerce" className="bg-gray-800">Ecommerce - Tienda online</option>
                  <option value="Service" className="bg-gray-800">Service - Servicio profesional</option>
                  <option value="Content" className="bg-gray-800">Content - Contenido digital</option>
                  <option value="Other" className="bg-gray-800">Other - Otro tipo</option>
            </select>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Esto nos ayuda a personalizar las herramientas y estrategias para ti
                </p>
          </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300"
                >
                  ← Atrás
                </button>
          <button
            type="submit"
                  disabled={isGeneratingPreview || !acceptedTerms}
                  className={`px-8 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform ${
                    acceptedTerms && !isGeneratingPreview
                      ? 'bg-gradient-to-r from-cyan-500 via-green-500 to-blue-600 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:shadow-xl hover:scale-[1.02]'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isGeneratingPreview ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generando análisis AI...
            </span>
                  ) : !acceptedTerms ? (
                    '📋 Acepta los términos para continuar'
                  ) : (
                    '🚀 ¡Generar mi Dashboard!'
                  )}
          </button>
              </div>
              
              {/* Terms and Conditions Checkbox */}
              <div className="mt-6 p-4 bg-gray-900/30 border border-gray-600/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                  />
                  <label htmlFor="terms-checkbox" className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-medium text-white">Acepto los términos y condiciones</span>
                    <br />
                    <span className="text-xs text-gray-400">
                      Al continuar, confirmo que he leído y acepto la{' '}
                      <button
                        type="button"
                        onClick={() => window.open('https://konsul.digital/privacy-policy/', '_blank')}
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Política de Privacidad
                      </button>
                      {' '}y los{' '}
                      <button
                        type="button"
                        onClick={() => window.open('https://konsul.digital/privacy-policy/', '_blank')}
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Términos de Servicio
                      </button>
                      . Entiendo que mis datos serán procesados por IA para generar mi plan de negocio personalizado.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button - Only show on final step */}
          {currentStep === 6 && (
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">🎉 ¡Estás listo para despegar!</h3>
                <p className="text-sm text-gray-400 mb-4">Tu plan de negocio está a solo un clic de distancia</p>
                
                <div className="bg-gradient-to-r from-cyan-500/10 via-green-500/10 to-blue-600/10 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Rocket className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-400 font-medium">Formulario completado al 100%</span>
                  </div>
                  <p className="text-xs text-gray-400">
          ✨ En segundos tendrás un plan detallado listo para ejecutar
        </p>
                </div>
              </div>
            </div>
          )}
        </form>
      )}


      </div>

      {/* Modal de Credenciales */}
      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={handleCloseCredentialsModal}
        email={generatedCredentials.email}
        password={generatedCredentials.password}
        onContinue={handleContinueAfterSession}
        previewSessionId={previewSessionId}
      />

      {/* Payment Success Loading Screen */}
      <PaymentSuccessLoading isVisible={showPaymentSuccessLoading} />

      {/* Login Screen */}
      {showLogin && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}

export default App;

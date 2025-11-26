// API Keys Configuration
// IMPORTANT: API keys should be stored in environment variables for security
// In production (Vercel), set VITE_GEMINI_API_KEY in your environment variables
// For local development, add it to your .env file

export const getGeminiApiKey = (): string => {
  // Try to get from environment variable first (recommended for production)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (envKey && envKey.trim().length > 0) {
    console.log('✅ [SECURE] Using Gemini API key from environment variable (VITE_GEMINI_API_KEY)');
    console.log('🔒 [SECURITY] API key source: Environment variable - Secure method');
    return envKey.trim();
  }
  
  // Fallback for local development (not recommended for production)
  // This will show a warning if used
  const fallbackKey = 'AIzaSyAReWFWLXcSF-HKRdDW65bFsSopTr631zo';
  
  if (import.meta.env.DEV) {
    console.warn('⚠️ [WARNING] Using hardcoded API key fallback (DEVELOPMENT ONLY)');
    console.warn('⚠️ [SECURITY] For production, use VITE_GEMINI_API_KEY environment variable');
    console.warn('⚠️ Set VITE_GEMINI_API_KEY in your .env file or Vercel environment variables');
  } else {
    console.error('❌ [ERROR] VITE_GEMINI_API_KEY environment variable is not set!');
    console.error('❌ [SECURITY] Production requires environment variable - hardcoded keys are blocked');
    console.error('❌ Please configure VITE_GEMINI_API_KEY in your Vercel project settings');
    throw new Error('VITE_GEMINI_API_KEY environment variable is required in production');
  }
  
  return fallbackKey;
};

export const getSimilarWebApiKey = (): string => {
  // SimilarWeb API key from environment variable
  const envKey = import.meta.env.VITE_SIMILARWEB_API_KEY;
  
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  
  // Fallback for local development
  return 'b38b0c5b7e204802b93f258fb6f6883c';
};


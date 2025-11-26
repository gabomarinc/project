import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from './apiKeys';

// Get API key from config file
const API_KEY = getGeminiApiKey();

// Safety check: ensure API key is valid
if (!API_KEY || typeof API_KEY !== 'string' || API_KEY.length < 10) {
  console.error('❌ Invalid API key:', {
    type: typeof API_KEY,
    length: API_KEY?.length,
    value: API_KEY ? 'Present but invalid' : 'Missing'
  });
  throw new Error('Invalid Gemini API key: API key is missing or too short');
}

// Validate API key format (should start with AIzaSy)
if (!API_KEY.startsWith('AIzaSy')) {
  console.error('❌ API key format invalid - should start with "AIzaSy"');
  console.error('💡 Please verify your API key in src/config/apiKeys.ts');
  throw new Error('Invalid Gemini API key format: API key should start with "AIzaSy"');
}

// Debug: Confirm API key is loaded (but don't log the full key for security)
const isFromEnv = !!import.meta.env.VITE_GEMINI_API_KEY;
console.log('🔑 AI Config: API Key loaded successfully:', {
  keyLength: API_KEY.length,
  keyStart: API_KEY.substring(0, 10) + '...',
  keyEnd: '...' + API_KEY.substring(API_KEY.length - 10),
  formatValid: API_KEY.startsWith('AIzaSy'),
  source: isFromEnv ? 'Environment Variable (VITE_GEMINI_API_KEY) ✅ SECURE' : 'Fallback (Development Only) ⚠️'
});

// Initialize Gemini AI with safety check
let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log('✅ GoogleGenerativeAI initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize GoogleGenerativeAI:', error);
  throw new Error('Failed to initialize AI service');
}

// Available Gemini models in order of preference
// NOTE: gemini-1.5-flash and older versions are no longer available
// Google has updated to newer versions (2.0, 2.5, etc.)
// Based on user's GCP quotas, gemini-2.5-flash is available and active
const AVAILABLE_MODELS = [
  'gemini-2.5-flash',          // Latest available model (from GCP quotas)
  'gemini-2.0-flash-exp',      // Experimental 2.0 (fallback)
  'gemini-1.5-flash',          // Old version (may not be available)
  'gemini-1.5-pro',            // Old version (may not be available)
  'gemini-pro'                 // Legacy fallback (may not be available)
];

// Function to get the best available model
const getBestAvailableModel = () => {
  console.log('🔍 Available Gemini models:', AVAILABLE_MODELS);
  console.log('🚀 Using model:', AVAILABLE_MODELS[0], '(gemini-2.5-flash - latest available)');
  return AVAILABLE_MODELS[0]; // gemini-2.5-flash
};

// Get the generative model with realistic, consultant-like settings
export const model = genAI.getGenerativeModel({ 
  model: getBestAvailableModel(),
  generationConfig: {
    temperature: 0.3, // Lower temperature for more consistent, realistic responses
    topK: 20, // Reduced for more focused responses
    topP: 0.8, // Lower for more conservative, realistic outputs
    maxOutputTokens: 8192, // Increased token limit for better responses
  }
});

// AI configuration for business consulting
export const AI_CONFIG = {
  temperature: 0.3, // More conservative, realistic responses
  topK: 20, // Focused, consistent outputs
  topP: 0.8, // Conservative creativity
  maxOutputTokens: 8192, // Increased token limit
};

// Helper function to extract retry delay from error
const extractRetryDelay = (error: any): number => {
  try {
    // Try to extract from error message
    const retryMatch = error?.message?.match(/retry in ([\d.]+)s/i) || 
                      error?.message?.match(/retryDelay["']?\s*:\s*"?(\d+)/i);
    if (retryMatch) {
      return Math.ceil(parseFloat(retryMatch[1]) * 1000);
    }
    
    // Try to extract from error details
    if (error?.details && Array.isArray(error.details)) {
      for (const detail of error.details) {
        if (detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' && detail.retryDelay) {
          const seconds = parseInt(detail.retryDelay.replace('s', ''));
          return seconds * 1000;
        }
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  // Default retry delay for 429 errors
  return 30000; // 30 seconds
};

// Helper function to wait
const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Function to test and get working model with intelligent retry
export const getWorkingModel = async (retryCount: number = 0): Promise<any> => {
  // Safety check: ensure genAI is properly initialized
  if (!genAI) {
    console.error('❌ genAI is not initialized');
    throw new Error('GoogleGenerativeAI not initialized');
  }
  
  const MAX_RETRIES = 3;
  
  // Prevent infinite retries
  if (retryCount >= MAX_RETRIES) {
    throw new Error('Max retries exceeded');
  }
  
  console.log(`🔍 Testing Gemini models (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
  
  let all403Errors = true; // Track if all errors are 403
  
  // Try all models in order until one works
  for (let modelIndex = 0; modelIndex < AVAILABLE_MODELS.length; modelIndex++) {
    const modelName = AVAILABLE_MODELS[modelIndex];
    console.log(`🧪 Testing model ${modelIndex + 1}/${AVAILABLE_MODELS.length}: ${modelName}`);
    
    try {
      const testModel = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: AI_CONFIG
      });
      
      // Quick test with minimal prompt
      const result = await testModel.generateContent('Hi');
      const response = await result.response;
      const text = response.text();
      
      if (text && typeof text === 'string') {
        console.log(`✅ Model ${modelName} working! Using for all AI operations.`);
        return testModel;
      }
    } catch (error: any) {
      const errorStatus = error?.status || error?.response?.status;
      const errorMessage = error?.message || String(error);
      
      // If not 403, mark that we have non-403 errors
      if (errorStatus !== 403) {
        all403Errors = false;
      }
      
      // Handle rate limit (429) - wait and retry
      if (errorStatus === 429) {
        const retryDelay = extractRetryDelay(error);
        console.log(`⏰ Model ${modelName} rate limited (429). Waiting ${retryDelay / 1000}s before retry...`);
        
        // If we haven't exceeded max retries, wait and try again
        if (retryCount < MAX_RETRIES - 1) {
          await wait(retryDelay);
          console.log(`🔄 Retrying after rate limit cooldown...`);
          return getWorkingModel(retryCount + 1);
        } else {
          console.log(`⚠️ Max retries reached for rate limit. Trying next model...`);
          continue; // Try next model
        }
      }
      
      // Handle model not found (404) - try next model
      if (errorStatus === 404) {
        console.log(`🚫 Model ${modelName} not found (404) - trying next model`);
        continue;
      }
      
      // Handle permission denied (403) - try next model but track it
      if (errorStatus === 403) {
        console.log(`🔒 Model ${modelName} access denied (403) - trying next model`);
        continue;
      }
      
      // For other errors, log and try next model
      console.log(`❌ Model ${modelName} failed:`, {
        error: errorMessage.substring(0, 100),
        status: errorStatus,
        code: error?.code
      });
      
      // If it's a network error and we have retries left, retry this model
      if ((errorStatus >= 500 || !errorStatus) && retryCount < MAX_RETRIES - 1) {
        console.log(`🔄 Network/server error, retrying model ${modelName}...`);
        await wait(2000 * (retryCount + 1)); // Exponential backoff
        return getWorkingModel(retryCount + 1);
      }
      
      continue; // Try next model
    }
  }
  
  // If ALL models returned 403, it's definitely an API key issue - don't retry
  if (all403Errors) {
    console.error('❌ CRITICAL: All models returned 403 (Forbidden)');
    console.error('🔑 This indicates an API key problem:');
    console.error('   - API key may be invalid or expired');
    console.error('   - API key may not have proper permissions');
    console.error('   - API key may be restricted to certain models/regions');
    console.error('   - API key may have been revoked');
    console.error('');
    console.error('💡 Solutions:');
    console.error('   1. Verify your API key in Google AI Studio: https://aistudio.google.com/apikey');
    console.error('   2. Check that the API key has access to Gemini models');
    console.error('   3. Generate a new API key if needed');
    console.error('   4. Ensure the API key is correctly set in src/config/apiKeys.ts');
    
    throw new Error('API_KEY_INVALID: All Gemini models returned 403 Forbidden. Please check your API key configuration.');
  }
  
  // If all models failed with mixed errors and we have retries left, wait and try again
  if (retryCount < MAX_RETRIES - 1) {
    const waitTime = 5000 * (retryCount + 1); // Exponential backoff: 5s, 10s, 15s
    console.log(`⏳ All models failed. Waiting ${waitTime / 1000}s before retrying all models...`);
    await wait(waitTime);
    return getWorkingModel(retryCount + 1);
  }
  
  // All models failed after all retries
  console.error('❌ All Gemini models failed after all retries');
  console.error('🔍 This could be due to:');
  console.error('   - API key issues');
  console.error('   - All models rate limited');
  console.error('   - Network connectivity issues');
  console.error('   - Google API service outage');
  
  throw new Error('No working Gemini model available after all retries');
};

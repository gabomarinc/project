import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from './apiKeys';

// Get API key from config file
const API_KEY = getGeminiApiKey();

// Safety check: ensure API key is valid
if (!API_KEY || typeof API_KEY !== 'string' || API_KEY.length < 10) {
  console.error('❌ Invalid API key:', {
    type: typeof API_KEY,
    length: API_KEY?.length,
    value: API_KEY
  });
  throw new Error('Invalid Gemini API key');
}

// Debug: Confirm API key is loaded
console.log('🔑 AI Config: API Key loaded successfully:', {
  keyLength: API_KEY.length,
  keyStart: API_KEY.substring(0, 10) + '...',
  keyEnd: '...' + API_KEY.substring(API_KEY.length - 10)
});

// Test the API key immediately
console.log('🧪 Testing API key immediately...');
console.log('🔑 API Key value:', API_KEY);
console.log('🔑 API Key starts with:', API_KEY.startsWith('AIzaSy'));
console.log('🔑 API Key ends with:', API_KEY.endsWith('ZokfZ0'));

// Initialize Gemini AI with safety check
let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log('✅ GoogleGenerativeAI initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize GoogleGenerativeAI:', error);
  throw new Error('Failed to initialize AI service');
}

// Available Gemini models in order of preference (newest first)
const AVAILABLE_MODELS = [
  'gemini-1.5-flash',      // Latest and fastest
  'gemini-1.5-pro',        // Latest pro version
  'gemini-1.5-flash-001',  // Specific version
  'gemini-1.5-pro-001',    // Specific pro version
  'gemini-pro'             // Fallback to older version
];

// Function to get the best available model
const getBestAvailableModel = () => {
  console.log('🔍 Available Gemini models:', AVAILABLE_MODELS);
  console.log('🚀 Using latest model:', AVAILABLE_MODELS[0]);
  return AVAILABLE_MODELS[0];
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

// Function to test and get working model
export const getWorkingModel = async () => {
  // Safety check: ensure genAI is properly initialized
  if (!genAI) {
    console.error('❌ genAI is not initialized');
    throw new Error('GoogleGenerativeAI not initialized');
  }
  
  for (const modelName of AVAILABLE_MODELS) {
    try {
      console.log(`🧪 Testing model: ${modelName}`);
      
      // Safety check: ensure modelName is valid
      if (!modelName || typeof modelName !== 'string') {
        console.warn(`⚠️ Invalid model name: ${modelName}, skipping...`);
        continue;
      }
      
      const testModel = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: AI_CONFIG
      });
      
      // Safety check: ensure testModel is properly created
      if (!testModel) {
        console.warn(`⚠️ Failed to create model for ${modelName}, skipping...`);
        continue;
      }
      
      // Safety check: ensure generateContent method exists
      if (typeof testModel.generateContent !== 'function') {
        console.warn(`⚠️ Model ${modelName} missing generateContent method, skipping...`);
        continue;
      }
      
      const result = await testModel.generateContent('Say "Hello"');
      
      // Safety check: ensure result is valid
      if (!result) {
        console.warn(`⚠️ Model ${modelName} returned null result, skipping...`);
        continue;
      }
      
      const response = await result.response;
      
      // Safety check: ensure response is valid
      if (!response) {
        console.warn(`⚠️ Model ${modelName} returned null response, skipping...`);
        continue;
      }
      
      const text = response.text();
      
      // Safety check: ensure text method exists and works
      if (typeof text !== 'string') {
        console.warn(`⚠️ Model ${modelName} text() returned non-string: ${typeof text}, skipping...`);
        continue;
      }
      
      console.log(`✅ Model ${modelName} working! Response: ${text}`);
      return testModel;
    } catch (error) {
      console.log(`❌ Model ${modelName} failed:`, error);
      continue;
    }
  }
  
  console.error('❌ All models failed, using fallback');
  
  // Safety check: ensure fallback model is valid
  if (!model) {
    console.error('❌ Fallback model is also null/undefined');
    throw new Error('No working AI model available');
  }
  
  return model; // Return the default model as last resort
};

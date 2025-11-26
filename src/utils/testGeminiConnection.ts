// Utility to test Gemini API connection
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '../config/apiKeys';

export async function testGeminiConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('🧪 [TEST] Iniciando prueba de conexión con Gemini API...');
    
    // Get API key
    const apiKey = getGeminiApiKey();
    console.log('🔑 [TEST] API Key obtenida:', {
      keyLength: apiKey.length,
      keyStart: apiKey.substring(0, 15) + '...',
      keyEnd: '...' + apiKey.substring(apiKey.length - 10),
      fromEnv: !!import.meta.env.VITE_GEMINI_API_KEY
    });
    
    if (!apiKey || apiKey.length < 10) {
      return {
        success: false,
        message: 'API Key no válida o muy corta',
        details: { keyLength: apiKey?.length || 0 }
      };
    }
    
    if (!apiKey.startsWith('AIzaSy')) {
      return {
        success: false,
        message: 'API Key no tiene el formato correcto (debe empezar con AIzaSy)',
        details: { keyStart: apiKey.substring(0, 10) }
      };
    }
    
    // Initialize Gemini
    console.log('🔧 [TEST] Inicializando GoogleGenerativeAI...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with the most basic model first
    const testModels = [
      'gemini-2.5-flash',        // Latest available model (from GCP quotas)
      'gemini-2.0-flash-exp',    // Experimental 2.0 (fallback)
      'gemini-1.5-flash',        // Old version (may not be available)
      'gemini-1.5-pro'           // Old version (may not be available)
    ];
    
    for (const modelName of testModels) {
      try {
        console.log(`🧪 [TEST] Probando modelo: ${modelName}...`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100
          }
        });
        
        const result = await model.generateContent('Say "Hello" in one word');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ [TEST] Modelo ${modelName} respondió:`, text);
        
        return {
          success: true,
          message: `Conexión exitosa con ${modelName}`,
          details: {
            model: modelName,
            response: text,
            apiKeySource: import.meta.env.VITE_GEMINI_API_KEY ? 'Environment Variable' : 'Fallback'
          }
        };
      } catch (modelError: any) {
        const errorStatus = modelError?.status || modelError?.response?.status;
        const errorMessage = modelError?.message || String(modelError);
        
        console.log(`❌ [TEST] Modelo ${modelName} falló:`, {
          status: errorStatus,
          message: errorMessage.substring(0, 100)
        });
        
        // Si es 404, probar siguiente modelo
        if (errorStatus === 404) {
          console.log(`⚠️ [TEST] Modelo ${modelName} no encontrado (404), probando siguiente...`);
          continue;
        }
        
        // Si es 429, esperar un poco y probar siguiente
        if (errorStatus === 429) {
          console.log(`⏰ [TEST] Modelo ${modelName} rate limited (429), probando siguiente...`);
          continue;
        }
        
        // Si es 403, el problema es de permisos/API key
        if (errorStatus === 403) {
          return {
            success: false,
            message: `Error 403: API Key sin permisos o inválida para modelo ${modelName}`,
            details: {
              model: modelName,
              error: errorMessage
            }
          };
        }
        
        // Para otros errores, continuar con siguiente modelo
        continue;
      }
    }
    
    // Si llegamos aquí, todos los modelos fallaron
    return {
      success: false,
      message: 'Todos los modelos de Gemini fallaron',
      details: {
        modelsTested: testModels.length
      }
    };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [TEST] Error en prueba de conexión:', error);
    
    return {
      success: false,
      message: `Error al probar conexión: ${errorMessage}`,
      details: { error }
    };
  }
}

// Make it available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).testGeminiConnection = testGeminiConnection;
  console.log('💡 [TEST] Función testGeminiConnection() disponible en consola. Ejecuta: testGeminiConnection()');
}



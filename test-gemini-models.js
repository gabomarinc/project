// Script de prueba para verificar los modelos de Gemini
// Ejecutar con: node test-gemini-models.js

import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key
const API_KEY = 'AIzaSyDOHC6sTNMpkn94JrtyU47t8J6n7ZokfZ0';

// Modelos a probar
const MODELS_TO_TEST = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-pro-001',
  'gemini-pro',
  'gemini-2.0-flash-exp'
];

async function testGeminiModels() {
  console.log('🧪 Iniciando prueba de modelos de Gemini...');
  console.log('🔑 API Key:', API_KEY.substring(0, 10) + '...');
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  for (const modelName of MODELS_TO_TEST) {
    try {
      console.log(`\n🧪 Probando modelo: ${modelName}`);
      
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1000,
        }
      });
      
      console.log(`🔄 Generando contenido con ${modelName}...`);
      const result = await model.generateContent('Say "Hello, this is a test"');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} funcionando! Respuesta: ${text}`);
      
    } catch (error) {
      console.log(`❌ ${modelName} falló:`, {
        error: error.message,
        status: error.status,
        code: error.code,
        details: error.details
      });
      
      if (error.status === 404) {
        console.log(`🚫 Modelo ${modelName} no encontrado (404) - puede no estar disponible en tu región`);
      } else if (error.status === 403) {
        console.log(`🔒 Modelo ${modelName} acceso denegado (403) - verificar permisos de API key`);
      } else if (error.status === 429) {
        console.log(`⏰ Modelo ${modelName} limitado por tasa (429) - demasiadas solicitudes`);
      }
    }
  }
  
  console.log('\n🏁 Prueba completada');
}

// Ejecutar la prueba
testGeminiModels().catch(console.error);

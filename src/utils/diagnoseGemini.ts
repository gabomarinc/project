// Simple diagnostic function to check Gemini API key and connection
import { getGeminiApiKey } from '../config/apiKeys';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function diagnoseGemini(): Promise<void> {
  console.log('🔍 === DIAGNÓSTICO DE GEMINI API ===');
  console.log('');
  
  // 1. Check API Key
  console.log('1️⃣ Verificando API Key...');
  const apiKey = getGeminiApiKey();
  const fromEnv = !!import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('   ✅ API Key obtenida:', {
    length: apiKey.length,
    startsWith: apiKey.substring(0, 15) + '...',
    endsWith: '...' + apiKey.substring(apiKey.length - 10),
    fromEnv: fromEnv ? 'SÍ (Variable de entorno) ✅' : 'NO (Fallback) ⚠️',
    formatValid: apiKey.startsWith('AIzaSy') ? 'SÍ ✅' : 'NO ❌'
  });
  
  if (!fromEnv) {
    console.warn('   ⚠️ ADVERTENCIA: No se está usando variable de entorno');
    console.warn('   💡 Verifica que VITE_GEMINI_API_KEY esté en tu archivo .env');
  }
  
  if (!apiKey.startsWith('AIzaSy')) {
    console.error('   ❌ ERROR: API Key no tiene el formato correcto');
    return;
  }
  
  console.log('');
  
  // 2. List available models first
  console.log('2️⃣ Listando modelos disponibles para tu API key...');
  try {
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listResponse.ok) {
      const listData = await listResponse.json();
      const availableModels = listData.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        ?.map((m: any) => m.name.replace('models/', ''))
        || [];
      
      console.log(`   ✅ Encontrados ${availableModels.length} modelos disponibles:`);
      availableModels.forEach((model: string) => {
        console.log(`      - ${model}`);
      });
      console.log('');
      
      // 3. Test API Key with available models
      console.log('3️⃣ Probando conexión con modelos disponibles...');
      
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Prioritize gemini-2.5-flash (from GCP quotas) over other models
      const preferredModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-exp'];
      const modelsToTest = [];
      
      // Add preferred models first if they're available
      for (const preferred of preferredModels) {
        if (availableModels.includes(preferred)) {
          modelsToTest.push(preferred);
        }
      }
      
      // Add other available models (excluding already added ones)
      for (const model of availableModels) {
        if (!modelsToTest.includes(model) && modelsToTest.length < 5) {
          modelsToTest.push(model);
        }
      }
      
      // Fallback if no models found
      if (modelsToTest.length === 0) {
        modelsToTest.push('gemini-2.5-flash', 'gemini-2.0-flash-exp');
      }
      
      let workingModel: string | null = null;
      
      for (const modelName of modelsToTest) {
        try {
          console.log(`   🧪 Probando modelo: ${modelName}...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          
          const result = await model.generateContent('Say "Hello" in one word');
          const response = await result.response;
          const text = response.text();
          
          console.log(`   ✅ ¡MODELO ${modelName} FUNCIONA!`);
          console.log('   📝 Respuesta:', text);
          workingModel = modelName;
          break; // Si funciona, no probar más
          
        } catch (error: any) {
          const errorStatus = error?.status || error?.response?.status || error?.code;
          const errorMessage = error?.message || String(error);
          
          if (errorStatus === 404) {
            console.log(`   🚫 ${modelName}: No encontrado (404)`);
          } else if (errorStatus === 403) {
            console.error(`   🔒 ${modelName}: Sin permisos (403) - API Key inválida`);
            // Si es 403, no tiene sentido probar más modelos
            console.error('');
            console.error('   🔒 ERROR 403: API Key inválida o sin permisos');
            console.error('   💡 Soluciones:');
            console.error('      1. Verifica tu API key en: https://aistudio.google.com/apikey');
            console.error('      2. Asegúrate de que la key tenga permisos para Gemini API');
            console.error('      3. Genera una nueva API key si es necesario');
            console.error('      4. Verifica que la key esté correctamente en tu .env');
            console.error('');
            console.error('🔍 === FIN DEL DIAGNÓSTICO ===');
            return;
          } else if (errorStatus === 429) {
            console.log(`   ⏰ ${modelName}: Rate limited (429) - El modelo existe pero está limitado`);
            // Si es 429, el modelo existe, solo está rate limited
            workingModel = modelName;
            console.log(`   💡 El modelo ${modelName} está disponible pero rate limited. Espera unos minutos.`);
            break;
          } else {
            console.log(`   ❌ ${modelName}: Error ${errorStatus || 'unknown'} - ${errorMessage.substring(0, 100)}`);
          }
        }
      }
      
      if (workingModel) {
        console.log('');
        console.log(`✅ Gemini API está funcionando correctamente con el modelo: ${workingModel}`);
        console.log('💡 Actualiza tu configuración para usar este modelo');
      } else {
        console.log('');
        console.error('❌ Ningún modelo funcionó. Revisa los errores arriba.');
        console.error('💡 Todos los modelos probados fallaron. Verifica:');
        console.error('   1. Que tu API key sea válida');
        console.error('   2. Que tengas conexión a internet');
        console.error('   3. Que la API key tenga permisos para Gemini API');
        console.error('   4. Si todos dan 404, puede que necesites habilitar los modelos en Google AI Studio');
      }
      
    } else {
      console.error('   ❌ No se pudo listar modelos. Probando con lista predeterminada...');
      console.log('');
      throw new Error('Cannot list models');
    }
  } catch (listError) {
    console.error('   ⚠️ No se pudo listar modelos disponibles. Probando con lista predeterminada...');
    console.log('');
    
    // Fallback: test with known models
    console.log('3️⃣ Probando conexión con modelos conocidos...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Lista de modelos a probar (priorizando gemini-2.5-flash de GCP quotas)
    const modelsToTest = [
      'gemini-2.5-flash',            // Modelo que aparece en las cuotas de GCP
      'gemini-2.0-flash-exp',        // Experimental 2.0
      'gemini-1.5-flash',            // Versión estable flash
      'gemini-1.5-pro',              // Versión estable pro
      'gemini-pro'                   // Legacy fallback
    ];
    
    let workingModel: string | null = null;
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`   🧪 Probando modelo: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Say "Hello" in one word');
        const response = await result.response;
        const text = response.text();
        
        console.log(`   ✅ ¡MODELO ${modelName} FUNCIONA!`);
        console.log('   📝 Respuesta:', text);
        workingModel = modelName;
        break; // Si funciona, no probar más
        
      } catch (error: any) {
        const errorStatus = error?.status || error?.response?.status || error?.code;
        const errorMessage = error?.message || String(error);
        
        if (errorStatus === 404) {
          console.log(`   🚫 ${modelName}: No encontrado (404)`);
        } else if (errorStatus === 403) {
          console.error(`   🔒 ${modelName}: Sin permisos (403) - API Key inválida`);
          // Si es 403, no tiene sentido probar más modelos
          console.error('');
          console.error('   🔒 ERROR 403: API Key inválida o sin permisos');
          console.error('   💡 Soluciones:');
          console.error('      1. Verifica tu API key en: https://aistudio.google.com/apikey');
          console.error('      2. Asegúrate de que la key tenga permisos para Gemini API');
          console.error('      3. Genera una nueva API key si es necesario');
          console.error('      4. Verifica que la key esté correctamente en tu .env');
          console.error('');
          console.error('🔍 === FIN DEL DIAGNÓSTICO ===');
          return;
        } else if (errorStatus === 429) {
          console.log(`   ⏰ ${modelName}: Rate limited (429) - El modelo existe pero está limitado`);
          // Si es 429, el modelo existe, solo está rate limited
          workingModel = modelName;
          console.log(`   💡 El modelo ${modelName} está disponible pero rate limited. Espera unos minutos.`);
          break;
        } else {
          console.log(`   ❌ ${modelName}: Error ${errorStatus || 'unknown'} - ${errorMessage.substring(0, 100)}`);
        }
      }
    }
    
    if (workingModel) {
      console.log('');
      console.log(`✅ Gemini API está funcionando correctamente con el modelo: ${workingModel}`);
      console.log('💡 Actualiza tu configuración para usar este modelo');
    } else {
      console.log('');
      console.error('❌ Ningún modelo funcionó. Revisa los errores arriba.');
      console.error('💡 Todos los modelos probados fallaron. Verifica:');
      console.error('   1. Que tu API key sea válida');
      console.error('   2. Que tengas conexión a internet');
      console.error('   3. Que la API key tenga permisos para Gemini API');
      console.error('   4. Si todos dan 404, puede que necesites habilitar los modelos en Google AI Studio');
    }
  }
  
  console.log('');
  console.log('🔍 === FIN DEL DIAGNÓSTICO ===');
}

// Make it available in browser console
if (typeof window !== 'undefined') {
  (window as any).diagnoseGemini = diagnoseGemini;
  console.log('💡 Función diagnoseGemini() disponible en consola. Ejecuta: diagnoseGemini()');
}


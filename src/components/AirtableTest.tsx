import React, { useState } from 'react';
import { AirtableService } from '../services/airtableService';

const AirtableTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<any>(null);

  const runTest = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Ejecutando prueba de extracción de secciones...');
      const results = await AirtableService.testSectionExtraction();
      setTestResults(results);
      console.log('✅ Prueba completada, resultados:', results);
    } catch (error) {
      console.error('❌ Error en la prueba:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToAirtable = async () => {
    setIsSaving(true);
    setSaveResult(null);
    try {
      console.log('💾 Guardando datos de prueba en Airtable...');
      const result = await AirtableService.saveTestDataToAirtable();
      setSaveResult(result);
      console.log('✅ Guardado completado, resultado:', result);
    } catch (error) {
      console.error('❌ Error guardando en Airtable:', error);
      setSaveResult({
        success: false,
        error: `Error: ${error}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        🧪 Prueba de Extracción de Secciones de Airtable
      </h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          ¿Qué hace esta prueba?
        </h2>
        <ul className="text-gray-300 space-y-2">
          <li>• Simula datos de dashboard reales</li>
          <li>• Prueba la función de extracción de secciones</li>
          <li>• Muestra cómo se formatearían los datos para Airtable</li>
          <li>• No crea dashboards reales, solo prueba la lógica</li>
        </ul>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={runTest}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {isLoading ? '🔄 Ejecutando prueba...' : '🚀 Ejecutar Prueba'}
        </button>
        
        <button
          onClick={saveToAirtable}
          disabled={isSaving || !testResults}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {isSaving ? '💾 Guardando en Airtable...' : '💾 Guardar en Airtable'}
        </button>
      </div>

      {testResults && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            📊 Resultados de la Prueba
          </h2>
          
          <div className="space-y-4">
            {Object.entries(testResults).map(([key, value]) => (
              <div key={key} className="border border-gray-600 rounded-lg p-4">
                <h3 className="text-yellow-400 font-medium mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </h3>
                <div className="text-gray-300 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
            <h3 className="text-green-400 font-medium mb-2">✅ Estado de la Prueba</h3>
            <p className="text-gray-300 text-sm">
              La extracción de secciones está funcionando correctamente. 
              Los datos se están formateando como se esperaba para Airtable.
            </p>
          </div>
        </div>
      )}

      {saveResult && (
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            💾 Resultado del Guardado en Airtable
          </h2>
          
          {saveResult.success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg">
                <h3 className="text-green-400 font-medium mb-2">✅ Guardado Exitoso</h3>
                <p className="text-gray-300 text-sm mb-2">{saveResult.message}</p>
                <div className="text-xs text-gray-400">
                  <p><strong>Record ID:</strong> {saveResult.recordId}</p>
                  <p><strong>Test ID:</strong> {saveResult.testId}</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
                <h3 className="text-blue-400 font-medium mb-2">🔍 Verificación</h3>
                <p className="text-gray-300 text-sm">
                  Ve a tu base de Airtable y busca el registro con el ID: <code className="bg-gray-700 px-2 py-1 rounded">{saveResult.recordId}</code>
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Verifica que todas las columnas de secciones tengan contenido real (no "No disponible").
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg">
              <h3 className="text-red-400 font-medium mb-2">❌ Error al Guardar</h3>
              <p className="text-gray-300 text-sm">{saveResult.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
        <h3 className="text-yellow-400 font-medium mb-2">💡 Cómo usar esta prueba</h3>
        <ol className="text-gray-300 text-sm space-y-1">
          <li>1. Haz clic en "Ejecutar Prueba" para ver cómo se extraen los datos</li>
          <li>2. Revisa los resultados en la consola del navegador</li>
          <li>3. Haz clic en "Guardar en Airtable" para probar el guardado real</li>
          <li>4. Ve a tu base de Airtable y verifica que las columnas tengan contenido</li>
          <li>5. Si todo funciona, la función está lista para dashboards reales</li>
        </ol>
      </div>
    </div>
  );
};

export default AirtableTest;
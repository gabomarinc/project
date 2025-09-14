import { CompetitiveIntelligence } from './externalDataService';
import { model, getWorkingModel } from '../config/ai';



export interface BusinessData {
  idea: string;
  problem: string;
  idealUser: string;
  region: string;
  alternatives: string;
  businessModel: string;
  projectType: string;
  randomSeed?: number;
  regenerationAttempt?: number;
}

export interface GeneratedContent {
  businessSummary: string;
  marketSize: string;
  brandSuggestions: string[];
  brandReasoning: string[];
  recommendedTools: Array<{
    category: string;
    items: Array<{
      name: string;
      description: string;
      url: string;
    }>;
  }>;
  actionPlan: string[];
  marketResearch: {
    searchTerms: string[];
    validationTopics: string[];
    researchMethods: string[];
  };
}

export class AIService {
  // Test method to verify AI connection
  static async testAIConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing AI connection...');
      console.log('🔑 Using model from config:', model);
      console.log('🔑 Model type:', typeof model);
      console.log('🔑 Model methods:', Object.getOwnPropertyNames(model));
      
      // Simple test with minimal prompt
      const testResult = await model.generateContent('Say "Hello"');
      console.log('✅ generateContent call successful');
      
      const testResponse = await testResult.response;
      console.log('✅ response call successful');
      
      const testText = testResponse.text();
      console.log('✅ text() call successful');
      
      console.log('✅ AI test successful:', testText);
      return true;
    } catch (error) {
      console.error('❌ AI test failed:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      return false;
    }
  }

  // Main method that orchestrates the two-step process
  static async generateBusinessContent(data: BusinessData): Promise<GeneratedContent> {
    try {
      console.log('🚀 Starting two-step AI process in generateBusinessContent...');
      console.log('📊 Input data:', data);
      
      // Step 1: Deep Analysis (70% of progress)
      console.log('📝 Step 1: Calling performDeepAnalysis...');
      const deepAnalysis = await this.performDeepAnalysis(data);
      console.log('✅ Deep analysis completed:', deepAnalysis);
      
             // Step 2: Dashboard Content Creation (30% of progress)
       console.log('🔄 Step 2: Calling createDashboardContent...');
       const dashboardContent = await this.createDashboardContent(deepAnalysis, data);
       console.log('✅ Dashboard content created:', dashboardContent);
       console.log('🔍 Dashboard brand suggestions:', dashboardContent.brandSuggestions);
       console.log('🔍 Dashboard brand reasoning:', dashboardContent.brandReasoning);
       console.log('🔍 Brand reasoning length:', dashboardContent.brandReasoning?.length);
       
       return dashboardContent;
    } catch (error) {
      console.error('❌ Error in two-step AI process:', error);
      console.log('🔄 Using fallback content...');
      return this.getFallbackDashboardContent(data);
    }
  }

      // Generate AI-powered market intelligence instead of external APIs
  private static async generateAIMarketIntelligence(data: BusinessData, hasRealCompetitors: boolean): Promise<any> {
    try {
      console.log('🧠 Generating AI-powered market intelligence...');
      
      const prompt = `
        Eres un experto en inteligencia de mercado y análisis competitivo con 15+ años de experiencia.
        Tu tarea es generar datos de inteligencia de mercado REALISTAS y ÚTILES para una idea de negocio.
        
        IDEA DE NEGOCIO: "${data.idea}"
        PROBLEMA: "${data.problem}"
        USUARIO IDEAL: "${data.idealUser}"
        REGIÓN: ${data.region}
        ALTERNATIVAS/COMPETIDORES: "${data.alternatives}"
        MODELO DE NEGOCIO: ${data.businessModel}
        TIPO DE PROYECTO: ${data.projectType}
        TIENE COMPETIDORES REALES: ${hasRealCompetitors ? 'SÍ' : 'NO'}
        
        TAREA: Genera datos de inteligencia de mercado REALISTAS y ÚTILES:
        
                1. COMPETIDORES:
            - Si tiene competidores reales: Analiza los competidores mencionados
            - Si no tiene competidores reales: Identifica competidores potenciales del mercado
            - Incluye: nombre, sitio web, financiamiento estimado, métricas de tráfico, tecnologías
            - Los datos deben ser REALISTAS, no inventados
            - MÉTRICAS DE TRÁFICO: Genera números realistas basados en el tipo de proyecto y región
            - monthlyVisits: NÚMERO realista entre 1,000-1,000,000 según el tamaño del competidor (NO string)
            - globalRank: NÚMERO realista entre 10,000-1,000,000 según el tráfico (NO string)
            - categoryRank: NÚMERO realista entre 100-10,000 según la competencia (NO string)
            - DESCRIPCIÓN: Una oración específica que describa al competidor y su posición en el mercado
        
        2. TENDENCIAS DE MERCADO:
           - Análisis de tendencias para términos relacionados con la idea
           - Patrones de crecimiento, estabilidad o declive
           - Interés geográfico por región
           - Consultas relacionadas
        
        3. TAMAÑO DEL MERCADO:
           - Estimaciones realistas basadas en el tipo de proyecto y región
           - TAM, SAM, SOM con justificación
           - Factores de crecimiento y barreras de entrada
        
        4. INSIGHTS ESTRATÉGICOS:
           - Ventajas competitivas identificadas
           - Oportunidades de mercado
           - Riesgos específicos del sector
           - Recomendaciones estratégicas accionables
        
        CRITERIOS:
        - Los datos deben ser REALISTAS y ÚTILES
        - Basados en conocimiento del mercado, no inventados
        - Específicos para la idea y región del usuario
        - Formato JSON estructurado
        - No uses datos de APIs externas, genera análisis inteligente
        - Cada competidor debe tener una DESCRIPCIÓN única y específica
        
        FORMATO: JSON con estructura:
        {
          "competitors": [
            {
              "name": "Nombre del competidor",
              "website": "sitio.com",
              "description": "Descripción específica de una oración sobre el competidor y su posición en el mercado",
              "funding": {"totalRaised": "Estimación realista", "lastRound": "Última ronda", "investors": ["Inversor 1", "Inversor 2"]},
              "metrics": {"employees": "Rango realista", "founded": "Año", "industry": "Industria"},
                          "traffic": {"monthlyVisits": 50000, "globalRank": 150000, "categoryRank": 500},
              "technologies": ["Tecnología 1", "Tecnología 2"]
            }
          ],
          "marketTrends": [
            {
              "keyword": "Término clave",
              "trend": "rising|stable|declining",
              "growthRate": 15,
              "relatedQueries": ["Consulta 1", "Consulta 2"],
              "geographicInterest": [{"region": "Región", "interest": 85}]
            }
          ],
          "marketSize": {
            "totalAddressableMarket": "Estimación realista",
            "serviceableAddressableMarket": "Estimación realista", 
            "serviceableObtainableMarket": "Estimación realista"
          },
          "insights": {
            "competitiveAdvantages": ["Ventaja 1", "Ventaja 2"],
            "marketOpportunities": ["Oportunidad 1", "Oportunidad 2"],
            "risks": ["Riesgo 1", "Riesgo 2"],
            "strategicRecommendations": ["Recomendación 1", "Recomendación 2"]
          }
        }
      `;
      
      console.log('🧪 Making AI call for market intelligence...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('📝 Raw AI market intelligence response:', text);
      
      // Parse JSON response
      let parsed: any = null;
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Market intelligence JSON parsed successfully:', parsed);
          return parsed;
        } catch (parseError) {
          console.error('❌ Error parsing market intelligence JSON:', parseError);
        }
      }
      
      // Fallback to generated mock data if parsing fails
      console.log('🔄 Using fallback market intelligence...');
      return this.generateFallbackMarketIntelligence(data, hasRealCompetitors);
      
    } catch (error) {
      console.error('❌ Error generating AI market intelligence:', error);
      return this.generateFallbackMarketIntelligence(data, hasRealCompetitors);
    }
  }

  // Generate fallback market intelligence when AI fails
  private static generateFallbackMarketIntelligence(data: BusinessData, hasRealCompetitors: boolean): any {
    console.log('🔄 Generating fallback market intelligence...');
    
         const competitors = hasRealCompetitors && data.alternatives ? 
       data.alternatives.split(',').map(alt => alt.trim()).filter(alt => alt.length > 0) :
       ['Competidor Principal', 'Alternativa A', 'Alternativa B'];
     
     return {
       competitors: competitors.map((name, index) => ({
         name: name,
         website: `${name.toLowerCase().replace(/\s+/g, '')}.com`,
         description: this.generateCompetitorDescription(name, data, index),
         funding: {
           totalRaised: index === 0 ? '$2M - $5M' : '$500K - $2M',
           lastRound: index === 0 ? 'Serie A' : 'Seed',
           investors: ['Inversor Local', 'Aceleradora Regional']
         },
         metrics: {
           employees: index === 0 ? '20-50' : '5-20',
           founded: (2020 + index).toString(),
           industry: data.projectType
         },
         traffic: {
           monthlyVisits: this.generateRealisticTrafficData(data.projectType, index),
           globalRank: this.generateRealisticGlobalRank(data.projectType, index),
           categoryRank: this.generateRealisticCategoryRank(data.projectType, index)
         },
         technologies: ['React', 'Node.js', 'MongoDB']
       })),
      marketTrends: [
        {
          keyword: data.idea,
          trend: 'rising' as const,
          growthRate: 25,
          relatedQueries: [`${data.idea} ${data.region}`, `${data.idea} mejores opciones`],
          geographicInterest: [{ region: data.region, interest: 85 }]
        }
      ],
      marketSize: {
        totalAddressableMarket: this.getMarketSizeEstimate(data.projectType, data.region),
        serviceableAddressableMarket: this.getServiceableMarketEstimate(data.projectType, data.region),
        serviceableObtainableMarket: this.getObtainableMarketEstimate(data.projectType, data.region)
      },
      insights: {
        competitiveAdvantages: [
          'Enfoque en mercado local específico',
          'Solución personalizada para la región',
          'Conocimiento profundo del usuario objetivo'
        ],
        marketOpportunities: [
          'Mercado en crecimiento en la región',
          'Demanda insatisfecha identificada',
          'Oportunidad de diferenciación clara'
        ],
        risks: [
          'Competencia establecida en el sector',
          'Barreras de entrada regulatorias',
          'Dependencia de tecnologías externas'
        ],
        strategicRecommendations: [
          'Enfócate en validación temprana del mercado',
          'Desarrolla propuesta de valor única',
          'Construye relaciones con usuarios iniciales'
        ]
      }
    };
  }

  // Helper methods for market size estimates
  private static getMarketSizeEstimate(projectType: string, region: string): string {
    const estimates: { [key: string]: { [key: string]: string } } = {
      'SaaS': {
        'US': '$157B (2024)',
        'Europe': '$45B (2024)',
        'Latin America': '$8B (2024)',
        'Asia': '$35B (2024)'
      },
      'Ecommerce': {
        'US': '$1.1T (2024)',
        'Europe': '$800B (2024)',
        'Latin America': '$100B (2024)',
        'Asia': '$2.5T (2024)'
      },
      'Physical Product': {
        'US': '$2.5T (2024)',
        'Europe': '$2.1T (2024)',
        'Latin America': '$300B (2024)',
        'Asia': '$3.2T (2024)'
      },
      'Service': {
        'US': '$800B (2024)',
        'Europe': '$600B (2024)',
        'Latin America': '$80B (2024)',
        'Asia': '$1.2T (2024)'
      }
    };
    
    return estimates[projectType]?.[region] || 'Analizando...';
  }

  private static getServiceableMarketEstimate(projectType: string, region: string): string {
    const estimates: { [key: string]: { [key: string]: string } } = {
      'SaaS': {
        'US': '$45B (2024)',
        'Europe': '$15B (2024)',
        'Latin America': '$2.5B (2024)',
        'Asia': '$12B (2024)'
      },
      'Ecommerce': {
        'US': '$300B (2024)',
        'Europe': '$200B (2024)',
        'Latin America': '$25B (2024)',
        'Asia': '$600B (2024)'
      },
      'Physical Product': {
        'US': '$500B (2024)',
        'Europe': '$400B (2024)',
        'Latin America': '$60B (2024)',
        'Asia': '$800B (2024)'
      },
      'Service': {
        'US': '$200B (2024)',
        'Europe': '$150B (2024)',
        'Latin America': '$20B (2024)',
        'Asia': '$300B (2024)'
      }
    };
    
    return estimates[projectType]?.[region] || 'Analizando...';
  }

  private static getObtainableMarketEstimate(projectType: string, region: string): string {
    const estimates: { [key: string]: { [key: string]: string } } = {
      'SaaS': {
        'US': '$5B (2024)',
        'Europe': '$2B (2024)',
        'Latin America': '$500M (2024)',
        'Asia': '$2.5B (2024)'
      },
      'Ecommerce': {
        'US': '$50B (2024)',
        'Europe': '$35B (2024)',
        'Latin America': '$5B (2024)',
        'Asia': '$100B (2024)'
      },
      'Physical Product': {
        'US': '$100B (2024)',
        'Europe': '$80B (2024)',
        'Latin America': '$12B (2024)',
        'Asia': '$200B (2024)'
      },
      'Service': {
        'US': '$40B (2024)',
        'Europe': '$30B (2024)',
        'Latin America': '$4B (2024)',
        'Asia': '$60B (2024)'
      }
    };
    
    return estimates[projectType]?.[region] || 'Analizando...';
  }

  // Generate preview content (executive summary)
  static async generatePreviewContent(data: BusinessData): Promise<any> {
    try {
      console.log('🚀 Generating DEEP and USEFUL preview content...');
      
      // Get working model
      const model = await getWorkingModel();
      if (!model) {
        throw new Error('No working AI model available');
      }
      
      // Generate brand suggestions first
      console.log('🌟 Generating brand suggestions...');
      const brandData = await this.generateBrandSuggestions(data);
      console.log('✅ Brand data generated:', brandData);
      
      // Generate market intelligence
      console.log('📊 Generating market intelligence...');
      const marketIntelligence = await this.generateMarketIntelligence(data);
      console.log('✅ Market intelligence generated:', marketIntelligence);
      
      // Create a focused, high-quality prompt
      const previewPrompt = `
        Eres un consultor de startups senior con 15+ años de experiencia. Analiza esta idea de negocio y crea un preview detallado y personalizado.
        
        DATOS DEL NEGOCIO:
        - IDEA: "${data.idea}"
        - PROBLEMA QUE RESUELVE: "${data.problem}"
        - USUARIO IDEAL: "${data.idealUser}"
        - REGIÓN: ${data.region}
        - COMPETENCIA ACTUAL: "${data.alternatives}"
        - MODELO DE NEGOCIO: ${data.businessModel}
        - TIPO DE PROYECTO: ${data.projectType}
        - NOMBRES DE MARCA SUGERIDOS: ${brandData?.names?.join(', ') || 'Generando...'}
        
        INTELIGENCIA DE MERCADO GENERADA:
        ${JSON.stringify(marketIntelligence, null, 2)}

        INSTRUCCIONES ESPECÍFICAS:
        1. ANALIZA PROFUNDAMENTE la idea específica del usuario
        2. USA los datos reales proporcionados, no generalidades
        3. MENCIONA competidores específicos si los hay
        4. INCLUYE métricas o datos del mercado cuando sea relevante
        5. SE ESPECÍFICO para su región y tipo de negocio
        6. DALE VALOR REAL que justifique ver el dashboard completo

        FORMATO REQUERIDO (JSON):
        {
          "executiveSummary": "Análisis ejecutivo de 3-4 párrafos que demuestre comprensión profunda del negocio, mencione competidores específicos, datos de mercado relevantes, y muestre por qué esta idea tiene potencial. Debe ser específico para su idea, no genérico.",
          "strongPoint": "El punto más fuerte de esta idea específica, basado en análisis real. Menciona ventajas competitivas, oportunidades de mercado, o fortalezas únicas. Debe ser convincente y específico.",
          "criticalRisks": [
            "Riesgo específico 1: Análisis detallado del primer riesgo más importante para esta idea específica",
            "Riesgo específico 2: Análisis detallado del segundo riesgo más importante para esta idea específica", 
            "Riesgo específico 3: Análisis detallado del tercer riesgo más importante para esta idea específica"
          ],
          "actionableRecommendation": "Una recomendación específica y accionable que el usuario puede implementar inmediatamente. Debe ser valiosa y específica para su negocio."
        }
        
        CRITERIOS DE CALIDAD:
        - Cada sección debe ser sustancial (mínimo 2-3 oraciones)
        - Usa datos específicos del usuario, no generalidades
        - Menciona competidores reales si los hay
        - Incluye insights del mercado cuando sea relevante
        - Tono profesional de consultor senior
        - Contenido específico para su idea, no genérico
        - Debe demostrar comprensión profunda del negocio

        IMPORTANTE: Este preview debe ser TAN BUENO que el usuario sienta que ya está recibiendo valor sustancial, pero que también quiera desesperadamente ver el dashboard completo.
      `;
      
      console.log('🧪 Making AI call for DEEP preview content...');
      const result = await model.generateContent(previewPrompt);
      console.log('✅ AI call successful, getting response...');
      const response = await result.response;
      console.log('✅ Response received, extracting text...');
      const text = response.text();
      console.log('📝 Raw AI response:', text);
      
      // Parse JSON response with multiple strategies
      let parsed: any = null;
      
      // Strategy 1: Direct JSON parsing
      try {
        parsed = JSON.parse(text);
        console.log('✅ JSON parsed successfully:', parsed);
      } catch (parseError) {
        console.log('🔄 Trying JSON extraction from text...');
        
        // Strategy 2: Extract JSON from text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
            console.log('✅ JSON extracted and parsed:', parsed);
          } catch (extractError) {
            console.log('🔄 Trying field-by-field extraction...');
            
            // Strategy 3: Extract individual fields
            const executiveSummaryMatch = text.match(/"executiveSummary"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            const strongPointMatch = text.match(/"strongPoint"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            const criticalRisksMatch = text.match(/"criticalRisks"\s*:\s*\[(.*?)\]/s);
            const actionableRecommendationMatch = text.match(/"actionableRecommendation"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
            
            if (executiveSummaryMatch || strongPointMatch || actionableRecommendationMatch) {
              console.log('✅ Found content using field extraction');
              
              // Parse critical risks array
              let criticalRisks: string[] = [];
              if (criticalRisksMatch) {
                const risksText = criticalRisksMatch[1];
                const riskMatches = risksText.match(/"([^"]*(?:\\.[^"]*)*)"/g);
                if (riskMatches) {
                  criticalRisks = riskMatches.map((risk: string) => risk.replace(/^"|"$/g, '').replace(/\\"/g, '"'));
                }
              }
              
            parsed = {
                executiveSummary: executiveSummaryMatch ? executiveSummaryMatch[1].replace(/\\"/g, '"') : '',
                strongPoint: strongPointMatch ? strongPointMatch[1].replace(/\\"/g, '"') : '',
                criticalRisks: criticalRisks.length > 0 ? criticalRisks : ['Análisis de riesgos en progreso...'],
                actionableRecommendation: actionableRecommendationMatch ? actionableRecommendationMatch[1].replace(/\\"/g, '"') : ''
              };
            }
          }
        }
      }
      
      if (parsed) {
        console.log('✅ Content parsed successfully:', parsed);
        
        // Validate and enhance the content
        const validatedContent = this.validateAndEnhancePreviewContent(parsed, data);
        console.log('✅ Content validated and enhanced:', validatedContent);
        
        // Add additional metadata
        validatedContent.dataBackedInsights = true;
        validatedContent.externalData = marketIntelligence;
        validatedContent.brandSuggestions = brandData?.names || [];
        validatedContent.brandReasoning = brandData?.reasoning || [];
        validatedContent.intelligentlySearched = true;
        validatedContent.searchQueries = [];
        
        return validatedContent;
      } else {
        console.warn('⚠️ Failed to parse AI response, using fallback content');
        return this.getFallbackPreviewContent(data);
      }
      
    } catch (error) {
      console.error('❌ Error generating preview content:', error);
      return this.getFallbackPreviewContent(data);
    }
  }

  // Generate market intelligence for preview
  private static async generateMarketIntelligence(data: BusinessData): Promise<any> {
    try {
      console.log('📊 Generating market intelligence for preview...');
      
      const model = await getWorkingModel();
      if (!model) {
        throw new Error('No working AI model available');
      }

      const marketIntelligencePrompt = `
        Eres un analista de mercado senior con acceso a datos de mercado en tiempo real.
        Genera inteligencia de mercado específica para esta idea de negocio.

        DATOS DEL NEGOCIO:
        - IDEA: "${data.idea}"
        - PROBLEMA: "${data.problem}"
        - USUARIO IDEAL: "${data.idealUser}"
        - REGIÓN: ${data.region}
        - COMPETENCIA ACTUAL: "${data.alternatives}"
        - MODELO DE NEGOCIO: ${data.businessModel}
        - TIPO DE PROYECTO: ${data.projectType}

        TAREA: Genera inteligencia de mercado realista y específica:

        FORMATO REQUERIDO (JSON):
        {
          "marketSize": {
            "totalAddressableMarket": "Estimación realista del TAM en ${data.region}",
            "serviceableAddressableMarket": "Estimación realista del SAM en ${data.region}",
            "serviceableObtainableMarket": "Estimación realista del SOM en ${data.region}"
          },
          "competitors": [
            {
              "name": "Nombre del competidor principal",
              "description": "Descripción de lo que hace",
              "funding": {
                "totalRaised": "Cantidad de financiamiento si es conocido"
              },
              "traffic": "Nivel de tráfico estimado",
              "tech": ["Tecnologías que usa"]
            }
          ],
          "trends": [
            "Tendencia 1 específica para ${data.projectType} en ${data.region}",
            "Tendencia 2 específica para ${data.projectType} en ${data.region}",
            "Tendencia 3 específica para ${data.projectType} en ${data.region}"
          ],
          "insights": {
            "strategicRecommendations": [
              "Recomendación estratégica 1 basada en el mercado",
              "Recomendación estratégica 2 basada en el mercado"
            ]
          },
          "marketTrends": [
            {
              "keyword": "Término clave relacionado",
              "trend": "rising|stable|declining",
              "growthRate": 15
            }
          ]
        }

        INSTRUCCIONES:
        - Usa datos realistas pero específicos para ${data.region}
        - Menciona competidores reales si los conoces
        - Incluye métricas creíbles
        - Sé específico para ${data.projectType}
        - Usa información actual del mercado
      `;

      const result = await model.generateContent(marketIntelligencePrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📝 Raw market intelligence response:', text);
      
      // Parse JSON response
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
        console.log('✅ Market intelligence JSON parsed successfully:', parsed);
      } catch (parseError) {
        console.log('🔄 Trying JSON extraction from market intelligence text...');
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            console.log('✅ Market intelligence JSON extracted and parsed:', parsed);
          } catch (extractError) {
            console.error('❌ Failed to parse market intelligence JSON:', extractError);
            parsed = this.getFallbackMarketIntelligence(data);
          }
        } else {
          console.error('❌ No JSON found in market intelligence response');
          parsed = this.getFallbackMarketIntelligence(data);
        }
      }
      
      return parsed;
      
    } catch (error) {
      console.error('❌ Error generating market intelligence:', error);
      return this.getFallbackMarketIntelligence(data);
    }
  }

  // Fallback market intelligence
  private static getFallbackMarketIntelligence(data: BusinessData): any {
    console.log('🔄 Using fallback market intelligence...');
    
    return {
      marketSize: {
        totalAddressableMarket: this.getMarketSizeEstimate(data.projectType, data.region),
        serviceableAddressableMarket: this.getServiceableMarketEstimate(data.projectType, data.region),
        serviceableObtainableMarket: this.getObtainableMarketEstimate(data.projectType, data.region)
      },
      competitors: data.alternatives ? 
        data.alternatives.split(',').map((alt, index) => ({
          name: alt.trim(),
          description: `Alternativa ${index + 1} en el mercado de ${data.projectType}`,
          funding: { totalRaised: 'No disponible' },
          traffic: 'Moderado',
          tech: ['Tecnología estándar']
        })) : 
        [
          {
            name: `Competidor principal en ${data.region}`,
            description: `Empresa establecida en el mercado de ${data.projectType}`,
            funding: { totalRaised: 'No disponible' },
            traffic: 'Alto',
            tech: ['Tecnología avanzada']
          }
        ],
      trends: [
        `Crecimiento del mercado ${data.projectType} en ${data.region}`,
        `Adopción de nuevas tecnologías en ${data.region}`,
        `Cambio en preferencias de ${data.idealUser}`
      ],
      insights: {
        strategicRecommendations: [
          `Enfócate en diferenciación en ${data.region}`,
          `Considera el modelo ${data.businessModel} para este mercado`
        ]
      },
      marketTrends: [
        {
          keyword: data.idea,
          trend: 'rising' as const,
          growthRate: 12
        }
      ]
    };
  }

  // Intelligent competitor search when user doesn't provide real competitors
  private static async searchIntelligentCompetitors(data: BusinessData): Promise<any> {
    console.log('🔍 Searching for intelligent competitors based on idea, region, and project type...');
    
    try {
      // Create intelligent search queries based on the user's idea
      const searchQueries = [
        `${data.idea} ${data.projectType} ${data.region}`,
        `${data.projectType} ${data.region} ${data.businessModel}`,
        `${data.idea} ${data.region} startup`,
        `${data.projectType} ${data.region} empresas`,
        `${data.idea} ${data.region} competencia`
      ];
      
      // Use the first query to search for competitors
      console.log('🔍 Using primary search query:', searchQueries[0]);
      
      // For now, return a structured response that indicates we searched intelligently
      // In a real implementation, this would call external APIs to find actual competitors
      return {
        competitors: [
          {
            name: `Competidor identificado en ${data.region}`,
            description: `Empresa de ${data.projectType} operando en ${data.region}`,
            region: data.region,
            projectType: data.projectType,
            searchQuery: searchQueries[0],
            intelligentlySearched: true
          }
        ],
        marketSize: {
          totalAddressableMarket: `Mercado ${data.projectType} en ${data.region}`,
          searchBased: true
        },
        marketTrends: [
          {
            trend: `Crecimiento de ${data.projectType} en ${data.region}`,
            searchQuery: searchQueries[0]
          }
        ],
        intelligentlySearched: true,
        searchQueries: searchQueries
      };
      
    } catch (error) {
      console.error('❌ Error in intelligent competitor search:', error);
      return {
        competitors: [],
        marketSize: {},
        marketTrends: [],
        intelligentlySearched: false,
        error: 'Error en búsqueda inteligente de competidores'
      };
    }
  }

  // Manual content extraction when JSON parsing fails
  private static extractManualContent(text: string, data: BusinessData, competitiveIntelligence: any, brandData: any): any {
    console.log('🔍 Attempting manual content extraction from AI response...');
    
    try {
      // Look for content patterns in the AI response
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let executiveSummary = '';
      let strongPoint = '';
      let criticalRisks: string[] = [];
      let actionableRecommendation = '';
      
      let currentSection = '';
      let currentContent: string[] = [];
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        // Detect section headers
        if (lowerLine.includes('resumen ejecutivo') || lowerLine.includes('executive summary')) {
          if (currentSection && currentContent.length > 0) {
            // Save previous section
            this.saveSectionContent(currentSection, currentContent, {
              executiveSummary,
              strongPoint,
              criticalRisks,
              actionableRecommendation
            });
          }
          currentSection = 'executiveSummary';
          currentContent = [];
          continue;
        }
        
        if (lowerLine.includes('punto fuerte') || lowerLine.includes('strong point')) {
          if (currentSection && currentContent.length > 0) {
            this.saveSectionContent(currentSection, currentContent, {
              executiveSummary,
              strongPoint,
              criticalRisks,
              actionableRecommendation
            });
          }
          currentSection = 'strongPoint';
          currentContent = [];
          continue;
        }
        
        if (lowerLine.includes('riesgos críticos') || lowerLine.includes('critical risks')) {
          if (currentSection && currentContent.length > 0) {
            this.saveSectionContent(currentSection, currentContent, {
              executiveSummary,
              strongPoint,
              criticalRisks,
              actionableRecommendation
            });
          }
          currentSection = 'criticalRisks';
          currentContent = [];
          continue;
        }
        
        if (lowerLine.includes('recomendación accionable') || lowerLine.includes('actionable recommendation')) {
          if (currentSection && currentContent.length > 0) {
            this.saveSectionContent(currentSection, currentContent, {
              executiveSummary,
              strongPoint,
              criticalRisks,
              actionableRecommendation
            });
          }
          currentSection = 'actionableRecommendation';
          currentContent = [];
          continue;
        }
        
        // Add content to current section
        if (currentSection && line.length > 10) {
          currentContent.push(line);
        }
      }
      
      // Save last section
      if (currentSection && currentContent.length > 0) {
        this.saveSectionContent(currentSection, currentContent, {
          executiveSummary,
          strongPoint,
          criticalRisks,
          actionableRecommendation
        });
      }
      
      // If we found any content, return it
      if (executiveSummary || strongPoint || criticalRisks.length > 0 || actionableRecommendation) {
        console.log('✅ Manual content extraction successful');
        
        // Sanitize competitive intelligence data
        const sanitizedCompetitiveIntelligence = this.sanitizeCompetitiveIntelligence(competitiveIntelligence);
        
        return {
          executiveSummary: executiveSummary || this.getEnhancedFallbackExecutiveSummary(data, sanitizedCompetitiveIntelligence),
          strongPoint: strongPoint || this.getEnhancedFallbackStrongPoint(data, sanitizedCompetitiveIntelligence),
          criticalRisks: criticalRisks.length > 0 ? criticalRisks : this.getEnhancedFallbackCriticalRisks(data, sanitizedCompetitiveIntelligence),
          actionableRecommendation: actionableRecommendation || this.getEnhancedFallbackActionableRecommendation(data, sanitizedCompetitiveIntelligence),
          externalData: sanitizedCompetitiveIntelligence,
          dataBackedInsights: !!sanitizedCompetitiveIntelligence,
          brandSuggestions: brandData.names || [],
          brandReasoning: brandData.reasoning || []
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Error in manual content extraction:', error);
      return null;
    }
  }

  // Helper method to save section content
  private static saveSectionContent(section: string, content: string[], result: any): void {
    if (content.length === 0) return;
    
    const contentText = content.join(' ').trim();
    
    switch (section) {
      case 'executiveSummary':
        result.executiveSummary = contentText;
        break;
      case 'strongPoint':
        result.strongPoint = contentText;
        break;
      case 'criticalRisks':
        result.criticalRisks = [contentText];
        break;
      case 'actionableRecommendation':
        result.actionableRecommendation = contentText;
        break;
    }
  }

  // Transform AI response format to expected format
  private static transformAIResponseFormat(parsed: any): any {
    console.log('🔄 Transforming AI response format...');
    console.log('📝 Original parsed content:', parsed);
    
    const transformed: any = { ...parsed };
    
    // Transform critical risks from "riesgo1", "riesgo2", "riesgo3" format to array
    if (!transformed.criticalRisks || !Array.isArray(transformed.criticalRisks)) {
      const risks: string[] = [];
      
      // Look for riesgo1, riesgo2, riesgo3, etc.
      for (let i = 1; i <= 10; i++) {
        const riskKey = `riesgo${i}`;
        if (parsed[riskKey]) {
          risks.push(parsed[riskKey]);
          console.log(`✅ Found ${riskKey}:`, parsed[riskKey]);
        }
      }
      
      // Also look for risk1, risk2, risk3, etc.
      for (let i = 1; i <= 10; i++) {
        const riskKey = `risk${i}`;
        if (parsed[riskKey]) {
          risks.push(parsed[riskKey]);
          console.log(`✅ Found ${riskKey}:`, parsed[riskKey]);
        }
      }
      
      if (risks.length > 0) {
        transformed.criticalRisks = risks;
        console.log('✅ Transformed critical risks:', risks);
      }
    }
    
    // Transform executive summary from "resumen" or "resumenEjecutivo" to "executiveSummary"
    if (!transformed.executiveSummary) {
      if (parsed.resumen) {
        transformed.executiveSummary = this.convertParagraphObjectToString(parsed.resumen);
        console.log('✅ Found resumen:', transformed.executiveSummary);
      } else if (parsed.resumenEjecutivo) {
        transformed.executiveSummary = this.convertParagraphObjectToString(parsed.resumenEjecutivo);
        console.log('✅ Found resumenEjecutivo:', transformed.executiveSummary);
      }
    }
    
    // Transform strong point from "puntoFuerte" or "fortaleza" to "strongPoint"
    if (!transformed.strongPoint) {
      if (parsed.puntoFuerte) {
        transformed.strongPoint = this.convertParagraphObjectToString(parsed.puntoFuerte);
        console.log('✅ Found puntoFuerte:', transformed.strongPoint);
      } else if (parsed.fortaleza) {
        transformed.strongPoint = this.convertParagraphObjectToString(parsed.fortaleza);
        console.log('✅ Found fortaleza:', transformed.strongPoint);
      }
    }
    
    // Transform actionable recommendation from "recomendacion" or "recomendacionAccionable" to "actionableRecommendation"
    if (!transformed.actionableRecommendation) {
      if (parsed.recomendacion) {
        transformed.actionableRecommendation = this.convertParagraphObjectToString(parsed.recomendacion);
        console.log('✅ Found recomendacion:', transformed.actionableRecommendation);
      } else if (parsed.recomendacionAccionable) {
        transformed.actionableRecommendation = this.convertParagraphObjectToString(parsed.recomendacionAccionable);
        console.log('✅ Found recomendacionAccionable:', transformed.actionableRecommendation);
      }
    }
    
    // Handle the new format with paragraph objects
    if (transformed.executiveSummary && typeof transformed.executiveSummary === 'object') {
      transformed.executiveSummary = this.convertParagraphObjectToString(transformed.executiveSummary);
      console.log('✅ Converted executiveSummary from object to string:', transformed.executiveSummary);
    }
    
    if (transformed.strongPoint && typeof transformed.strongPoint === 'object') {
      transformed.strongPoint = this.convertParagraphObjectToString(transformed.strongPoint);
      console.log('✅ Converted strongPoint from object to string:', transformed.strongPoint);
    }
    
    if (transformed.actionableRecommendation && typeof transformed.actionableRecommendation === 'object') {
      transformed.actionableRecommendation = this.convertParagraphObjectToString(transformed.actionableRecommendation);
      console.log('✅ Converted actionableRecommendation from object to string:', transformed.actionableRecommendation);
    }
    
    console.log('✅ Transformed content:', transformed);
    return transformed;
  }

  // Helper method to convert paragraph objects to strings
  private static convertParagraphObjectToString(content: any): string {
    if (typeof content === 'string') {
      return content;
    }
    
    if (typeof content === 'object' && content !== null) {
      // Handle format: {parrafo1: "text", parrafo2: "text", parrafo3: "text"}
      if (content.parrafo1 || content.parrafo2 || content.parrafo3) {
        const paragraphs = [];
        for (let i = 1; i <= 10; i++) {
          const paragraphKey = `parrafo${i}`;
          if (content[paragraphKey]) {
            paragraphs.push(content[paragraphKey]);
          }
        }
        return paragraphs.join('\n\n');
      }
      
      // Handle format: {p1: "text", p2: "text", p3: "text"}
      if (content.p1 || content.p2 || content.p3) {
        const paragraphs = [];
        for (let i = 1; i <= 10; i++) {
          const paragraphKey = `p${i}`;
          if (content[paragraphKey]) {
            paragraphs.push(content[paragraphKey]);
          }
        }
        return paragraphs.join('\n\n');
      }
      
      // Handle any other object format by converting to string
      try {
        return JSON.stringify(content);
      } catch (error) {
        return String(content);
      }
    }
    
    return String(content);
  }

  // STRICT SECTION ISOLATION SYSTEM - No content overlap allowed
  static async generateOptimizedDashboardContent(data: BusinessData): Promise<GeneratedContent> {
    try {
      console.log('🚀 Starting STRICT SECTION ISOLATION system...');
      console.log('📊 Input data:', data);
      
      // Step 1: Generate comprehensive business content
      console.log('📝 Step 1: Calling generateBusinessContent...');
      const fullContent = await this.generateBusinessContent(data);
      console.log('✅ Full AI content generated:', {
        hasBusinessSummary: !!fullContent.businessSummary,
        hasMarketSize: !!fullContent.marketSize,
        hasBrandSuggestions: !!fullContent.brandSuggestions,
        hasRecommendedTools: !!fullContent.recommendedTools
      });
      console.log('✅ Full AI content generated, now enforcing strict section boundaries...');
      
      // Step 2: Generate each section with ABSOLUTE isolation
      console.log('🎯 Step 2: Generating sections with ABSOLUTE isolation...');
      const isolatedContent = await this.generateIsolatedSections(data, fullContent);
      
      console.log('✅ Strict section isolation completed - NO content overlap');
      return isolatedContent;
    } catch (error) {
      console.error('❌ Error in strict section isolation:', error);
      console.log('🔄 Using fallback content...');
      return this.getFallbackDashboardContent(data);
    }
  }

  // Generate each section with ABSOLUTE isolation - NO content overlap
  private static async generateIsolatedSections(data: BusinessData, fullContent: GeneratedContent): Promise<GeneratedContent> {
    console.log('🔒 Generating sections with ABSOLUTE isolation...');
    
          const isolatedContent: GeneratedContent = {
        businessSummary: '',
        marketSize: '',
        brandSuggestions: [],
        brandReasoning: [],
        recommendedTools: [],
        actionPlan: [],
        marketResearch: {
          searchTerms: [],
          validationTopics: [],
          researchMethods: []
        }
      };

    try {
      // SECTION 1: Business Summary - EXECUTIVE OVERVIEW ONLY
      console.log('📋 SECTION 1: Generating Business Summary (Executive Overview ONLY)...');
      isolatedContent.businessSummary = await this.generateBusinessSummarySection(data, fullContent);
      
      // SECTION 2: Market Size - MARKET METRICS ONLY
      console.log('📊 SECTION 2: Generating Market Size (Market Metrics ONLY)...');
      isolatedContent.marketSize = await this.generateMarketSizeSection(data, fullContent);
      
             // SECTION 3: Brand Suggestions - NAMING ONLY
       console.log('🌟 SECTION 3: Generating Brand Suggestions (Naming ONLY)...');
       const brandData = await this.generateBrandSuggestions(data);
       console.log('✅ Brand suggestions generated:', {
         names: brandData.names,
         reasoning: brandData.reasoning,
         isFallback: brandData.names.includes('InnovateHub') // Check if fallback content
       });
       isolatedContent.brandSuggestions = brandData.names;
       isolatedContent.brandReasoning = brandData.reasoning;
       
       // Ensure we're using AI-generated reasoning, not fallback
       if (brandData.reasoning && brandData.reasoning.length > 0) {
         console.log('✅ Using AI-generated brand reasoning:', brandData.reasoning);
         isolatedContent.brandReasoning = brandData.reasoning;
       } else {
         console.warn('⚠️ No AI-generated reasoning found, generating fallback');
         isolatedContent.brandReasoning = this.generateCreativeFallbackReasoning(data, brandData.names);
       }
       
       // Final validation: ensure we have reasoning for each name
       if (isolatedContent.brandSuggestions.length > 0 && isolatedContent.brandReasoning.length === 0) {
         console.warn('⚠️ Still no reasoning found, generating final fallback');
         isolatedContent.brandReasoning = this.generateCreativeFallbackReasoning(data, isolatedContent.brandSuggestions);
       }
       
       console.log('🔍 Final isolated brand reasoning after validation:', isolatedContent.brandReasoning);
       console.log('🔍 Final isolated brand reasoning length:', isolatedContent.brandReasoning?.length);
      
      // SECTION 4: Recommended Tools - TOOL RECOMMENDATIONS ONLY
      console.log('🛠️ SECTION 4: Generating Recommended Tools (Tool Recommendations ONLY)...');
      isolatedContent.recommendedTools = await this.generateRecommendedToolsSection(data, fullContent);
      
      // SECTION 5: Action Plan - INTELLIGENT 7-STEP PLAN BASED ON PROJECT TYPE
      console.log('✅ SECTION 5: Generating Intelligent Action Plan with 7 steps based on project type...');
      isolatedContent.actionPlan = await this.generateActionPlanSection(data);
      
      // SECTION 6: Market Research - VALIDATION METHODS ONLY
      console.log('🔍 SECTION 6: Generating Market Research (Validation Methods ONLY)...');
      isolatedContent.marketResearch = await this.generateMarketResearchSection(data);
      
             console.log('✅ All sections generated with ABSOLUTE isolation');
       console.log('🔍 Final isolated brand suggestions:', isolatedContent.brandSuggestions);
       console.log('🔍 Final isolated brand reasoning:', isolatedContent.brandReasoning);
       console.log('🔍 Final brand reasoning length:', isolatedContent.brandReasoning?.length);
       
       return isolatedContent;
      
    } catch (error) {
      console.error('❌ Error generating isolated sections:', error);
      return this.getFallbackDashboardContent(data);
    }
  }

  // SECTION 1: Business Summary - EXECUTIVE OVERVIEW ONLY
  private static async generateBusinessSummarySection(data: BusinessData, fullContent: GeneratedContent): Promise<string> {
    console.log('📋 Generating Business Summary with STRICT isolation...');
    
    const prompt = `
      Eres un consultor de negocios senior especializado en RESUMENES EJECUTIVOS.
      
      IDEA: "${data.idea}"
      PROBLEMA: "${data.problem}"
      USUARIO: "${data.idealUser}"
      REGIÓN: ${data.region}
      MODELO: ${data.businessModel}
      TIPO: ${data.projectType}
      
      CONTEXTO DISPONIBLE: ${fullContent.businessSummary || 'Análisis general disponible'}
      
      TAREA: Crea EXCLUSIVAMENTE un RESUMEN EJECUTIVO del negocio.
      
      AISLAMIENTO ESTRICTO REQUERIDO:
      ✅ INCLUIR: Propuesta de valor, viabilidad básica, oportunidad de mercado
      ❌ NO INCLUIR: Análisis de competencia, plan de acción, métricas de mercado, herramientas, investigación
      
      FORMATO: 2-3 párrafos concisos, máximo 200 palabras
      TONO: CEO/Inversor - alto nivel, estratégico
      ENFOQUE: Solo lo que un ejecutivo necesita saber en 30 segundos
      
      RECUERDA: Esta sección es SOLO para resumen ejecutivo. NO incluir información de otras secciones.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Error generating Business Summary section:', error);
      return `Tu idea "${data.idea}" representa una oportunidad de negocio en ${data.region}. La propuesta de valor se centra en resolver "${data.problem}" para ${data.idealUser}. El modelo de negocio ${data.businessModel} ofrece viabilidad para este ${data.projectType}.`;
    }
  }

  // Generate the 3 sub-sections with real, actionable content
  static async generateBusinessSubSections(data: BusinessData): Promise<{
    propuestaValor: string;
    modeloNegocio: string;
    ventajaCompetitiva: string;
  }> {
    console.log('🎯 Generating Business Sub-Sections with real, actionable content...');
    
    try {
      // Generate Propuesta de Valor
      const propuestaPrompt = `
        Eres un experto senior en propuestas de valor y diferenciación de startups.
        
        IDEA: "${data.idea}"
        PROBLEMA: "${data.problem}"
        USUARIO: "${data.idealUser}"
        REGIÓN: ${data.region}
        
        TAREA: Crea EXCLUSIVAMENTE la PROPUESTA DE VALOR para esta idea.
        
        REQUISITOS:
        - Crear una propuesta de valor REAL y ACCIONABLE
        - NO explicar los inputs del formulario
        - NO repetir la idea o el problema
        - Enfocarse en el VALOR que se entrega al usuario
        - Describir beneficios concretos y medibles
        - Explicar la diferencia clave de la solución
        - Hacer el contenido comprensible y atractivo
        
        FORMATO: Máximo 150 palabras, 2-3 oraciones claras
        TONO: Profesional pero accesible, orientado al usuario
        ENFOQUE: Solo el VALOR que se entrega, NO explicación de inputs
        
        CRÍTICO: 
        - NO usar corchetes [] ni placeholders
        - NO repetir "Tu idea resuelve el problema"
        - Generar contenido REAL sobre el VALOR entregado
        - Máximo 150 palabras
      `;
      
      const propuestaResult = await model.generateContent(propuestaPrompt);
      const propuestaResponse = await propuestaResult.response;
      const propuestaValor = propuestaResponse.text();
      
      // Generate Modelo de Negocio
      const modeloPrompt = `
        Eres un experto senior en modelos de negocio y estrategias de ingresos.
        
        IDEA: "${data.idea}"
        MODELO: ${data.businessModel}
        TIPO: ${data.projectType}
        REGIÓN: ${data.region}
        
        TAREA: Crea EXCLUSIVAMENTE el MODELO DE NEGOCIO para esta idea.
        
        REQUISITOS:
        - Explicar cómo se generan ingresos con el modelo ${data.businessModel}
        - Detallar la estructura de costos y márgenes
        - Describir la escalabilidad del modelo
        - Hacer el contenido accionable y comprensible
        
        FORMATO: Máximo 150 palabras, 2-3 oraciones claras
        TONO: Profesional pero accesible
        ENFOQUE: Solo modelo de negocio, NO otros aspectos del negocio
        
        CRÍTICO: 
        - NO usar corchetes [] ni placeholders
        - Generar contenido REAL y ACCIONABLE
        - Máximo 150 palabras
      `;
      
      const modeloResult = await model.generateContent(modeloPrompt);
      const modeloResponse = await modeloResult.response;
      const modeloNegocio = modeloResponse.text();
      
      // Generate Ventaja Competitiva
      const ventajaPrompt = `
        Eres un experto senior en análisis competitivo y ventajas competitivas.
        
        IDEA: "${data.idea}"
        COMPETENCIA: "${data.alternatives}"
        REGIÓN: ${data.region}
        TIPO: ${data.projectType}
        
        TAREA: Crea EXCLUSIVAMENTE la VENTAJA COMPETITIVA para esta idea.
        
        REQUISITOS:
        - Explicar cómo se diferencia de ${data.alternatives}
        - Detallar características únicas y sostenibles
        - Describir por qué los usuarios elegirían esta solución
        - Hacer el contenido accionable y comprensible
        
        FORMATO: Máximo 150 palabras, 2-3 oraciones claras
        TONO: Profesional pero accesible
        ENFOQUE: Solo ventaja competitiva, NO otros aspectos del negocio
        
        CRÍTICO: 
        - NO usar corchetes [] ni placeholders
        - Generar contenido REAL y ACCIONABLE
        - Máximo 150 palabras
      `;
      
      const ventajaResult = await model.generateContent(ventajaPrompt);
      const ventajaResponse = await ventajaResult.response;
      const ventajaCompetitiva = ventajaResponse.text();
      
      console.log('✅ Business Sub-Sections generated successfully');
      
      return {
        propuestaValor,
        modeloNegocio,
        ventajaCompetitiva
      };
      
    } catch (error) {
      console.error('❌ Error generating Business Sub-Sections:', error);
      
      // Fallback content without placeholders - max 150 words each
      return {
        propuestaValor: `Ofrecemos una solución innovadora que transforma la experiencia del usuario mediante tecnología avanzada y diseño intuitivo. Nuestros clientes obtienen resultados medibles en tiempo real, con una interfaz que simplifica procesos complejos y maximiza la productividad.`,
        modeloNegocio: `El modelo ${data.businessModel} garantiza ingresos sostenibles a través de suscripciones recurrentes, escalabilidad automática y bajos costos operativos. Los márgenes saludables permiten reinversión continua en innovación y expansión del mercado.`,
        ventajaCompetitiva: `Nuestra diferenciación se basa en tecnología patentada, atención al cliente 24/7 y resultados garantizados que superan las expectativas del mercado. Ofrecemos una experiencia superior que los usuarios no encuentran en ${data.alternatives}.`
      };
    }
  }

  // Generate pricing strategy sub-sections with real, actionable content
  static async generatePricingSubSections(data: BusinessData): Promise<{
    modeloPrecios: string;
    estrategiaCompetitiva: string;
    recomendaciones: string;
    analisisCompetidores: string;
  }> {
    console.log('💰 Generating Pricing Strategy Sub-Sections with real, actionable content...');
    
    try {
      // Generate Modelo de Precios
      const modeloPreciosPrompt = `
        Eres un experto senior en estrategias de precios y modelos de monetización.
        
        IDEA: "${data.idea}"
        PROBLEMA: "${data.problem}"
        USUARIO: "${data.idealUser}"
        REGIÓN: ${data.region}
        MODELO: ${data.businessModel}
        TIPO: ${data.projectType}
        COMPETENCIA: "${data.alternatives}"
        
        TAREA: Crea EXCLUSIVAMENTE el MODELO DE PRECIOS para esta idea.
        
        REQUISITOS:
        - Explicar qué modelo de precios es más adecuado para ${data.businessModel}
        - Detallar la estructura de precios recomendada
        - Incluir rangos de precios específicos para ${data.idealUser}
        - Hacer el contenido accionable y comprensible
        
        FORMATO BULLETS REQUERIDO:
        • Cada punto importante debe empezar con un bullet (•)
        • Cada bullet debe estar en una nueva línea
        • Usar bullets para: modelo recomendado, estructura, rangos
        • Máximo 150 palabras total
        • Estructura: 1 bullet por aspecto importante
        
        EJEMPLO DE FORMATO:
        • Modelo recomendado: [descripción del modelo]
        • Estructura de precios: [descripción de la estructura]
        • Rango de precios: [rangos específicos]
        • Factores de decisión: [factores importantes]
        
        TONO: Profesional pero accesible
        ENFOQUE: Solo modelo de precios, NO otros aspectos del negocio
        
        CRÍTICO: NO usar corchetes [] ni placeholders. Generar contenido REAL y ACCIONABLE.
        FORMATO OBLIGATORIO: Usar bullets (•) para cada punto importante
      `;
      
      const modeloPreciosResult = await model.generateContent(modeloPreciosPrompt);
      const modeloPreciosResponse = await modeloPreciosResult.response;
      const modeloPrecios = modeloPreciosResponse.text();
      
      // Generate Estrategia Competitiva
      const estrategiaCompetitivaPrompt = `
        Eres un experto senior en análisis competitivo de precios y posicionamiento.
        
        IDEA: "${data.idea}"
        COMPETENCIA: "${data.alternatives}"
        REGIÓN: ${data.region}
        TIPO: ${data.projectType}
        USUARIO: "${data.idealUser}"
        
        TAREA: Crea EXCLUSIVAMENTE la ESTRATEGIA COMPETITIVA de precios para esta idea.
        
        REQUISITOS:
        - Explicar cómo posicionar precios vs ${data.alternatives}
        - Detallar estrategia de precios competitivos
        - Incluir diferenciación por valor vs precio
        - Hacer el contenido accionable y comprensible
        
        FORMATO BULLETS REQUERIDO:
        • Cada punto importante debe empezar con un bullet (•)
        • Cada bullet debe estar en una nueva línea
        • Usar bullets para: posicionamiento, estrategia, diferenciación
        • Máximo 150 palabras total
        • Estructura: 1 bullet por estrategia importante
        
        EJEMPLO DE FORMATO:
        • Posicionamiento vs competencia: [descripción de la estrategia]
        • Estrategia de precios: [descripción de la táctica]
        • Diferenciación por valor: [cómo diferenciarse]
        • Ventaja competitiva: [descripción de la ventaja]
        
        TONO: Profesional pero accesible
        ENFOQUE: Solo estrategia competitiva de precios, NO otros aspectos
        
        CRÍTICO: NO usar corchetes [] ni placeholders. Generar contenido REAL y ACCIONABLE.
        FORMATO OBLIGATORIO: Usar bullets (•) para cada punto importante
      `;
      
      const estrategiaCompetitivaResult = await model.generateContent(estrategiaCompetitivaPrompt);
      const estrategiaCompetitivaResponse = await estrategiaCompetitivaResult.response;
      const estrategiaCompetitiva = estrategiaCompetitivaResponse.text();
      
      // Generate Recomendaciones
      const recomendacionesPrompt = `
        Eres un experto senior en recomendaciones de precios para startups.
        
        IDEA: "${data.idea}"
        MODELO: ${data.businessModel}
        TIPO: ${data.projectType}
        REGIÓN: ${data.region}
        USUARIO: "${data.idealUser}"
        
        TAREA: Crea EXCLUSIVAMENTE RECOMENDACIONES de precios para esta idea.
        
        REQUISITOS:
        - Proporcionar 2-3 recomendaciones específicas de precios
        - Incluir consejos de implementación práctica
        - Enfocarse en maximizar valor percibido
        - Hacer el contenido accionable y comprensible
        
        FORMATO BULLETS REQUERIDO:
        • Cada recomendación debe empezar con un bullet (•)
        • Cada bullet debe estar en una nueva línea
        • Usar bullets para: cada recomendación específica
        • Máximo 150 palabras total
        • Estructura: 1 bullet por recomendación
        
        EJEMPLO DE FORMATO:
        • Recomendación 1: [descripción específica de la recomendación]
        • Recomendación 2: [descripción específica de la recomendación]
        • Recomendación 3: [descripción específica de la recomendación]
        • Implementación: [consejo práctico de implementación]
        
        TONO: Profesional pero accesible
        ENFOQUE: Solo recomendaciones de precios, NO otros aspectos
        
        CRÍTICO: NO usar corchetes [] ni placeholders. Generar contenido REAL y ACCIONABLE.
        FORMATO OBLIGATORIO: Usar bullets (•) para cada punto importante
      `;
      
      const recomendacionesResult = await model.generateContent(recomendacionesPrompt);
      const recomendacionesResponse = await recomendacionesResult.response;
      const recomendaciones = recomendacionesResponse.text();
      
      // Generate Análisis de Competidores
      const analisisCompetidoresPrompt = `
        Eres un experto senior en análisis de precios de competidores y posicionamiento de mercado.
        
        IDEA: "${data.idea}"
        COMPETENCIA ESPECÍFICA: "${data.alternatives}"
        REGIÓN: ${data.region}
        TIPO: ${data.projectType}
        USUARIO: "${data.idealUser}"
        
        TAREA: Crea EXCLUSIVAMENTE el ANÁLISIS DE PRECIOS DE COMPETIDORES para esta idea.
        
        REQUISITOS:
        - Analizar precios de ${data.alternatives} en ${data.region}
        - Identificar competidores relevantes adicionales en el mercado
        - Detallar rangos de precios competitivos
        - Incluir estrategias de posicionamiento por precio
        - Hacer el contenido accionable y comprensible
        
        FORMATO BULLETS REQUERIDO:
        • Cada punto importante debe empezar con un bullet (•)
        • Cada bullet debe estar en una nueva línea
        • Usar bullets para: competidores, rangos de precios, estrategias
        • Máximo 150 palabras total
        • Estructura: 1 bullet por competidor/estrategia
        
        EJEMPLO DE FORMATO:
        • [Competidor 1]: Rango de precios $X-$Y
        • [Competidor 2]: Rango de precios $X-$Y
        • Estrategia de posicionamiento: [descripción]
        • Recomendación de precios: [descripción]
        
        TONO: Profesional pero accesible
        ENFOQUE: Solo análisis de precios de competidores, NO otros aspectos
        
        CRÍTICO: NO usar corchetes [] ni placeholders. Generar contenido REAL y ACCIONABLE.
        FORMATO OBLIGATORIO: Usar bullets (•) para cada punto importante
      `;
      
      const analisisCompetidoresResult = await model.generateContent(analisisCompetidoresPrompt);
      const analisisCompetidoresResponse = await analisisCompetidoresResult.response;
      const analisisCompetidores = analisisCompetidoresResponse.text();
      
      console.log('✅ Pricing Strategy Sub-Sections generated successfully');
      
      return {
        modeloPrecios,
        estrategiaCompetitiva,
        recomendaciones,
        analisisCompetidores
      };
      
    } catch (error) {
      console.error('❌ Error generating Pricing Strategy Sub-Sections:', error);
      
      // Fallback content without placeholders - max 150 words each
      return {
        modeloPrecios: `• Modelo recomendado: Precios basados en valor percibido para ${data.businessModel}\n• Estructura de precios: Opciones escalonadas según funcionalidades\n• Rango de precios: $29-$99 mensuales para ${data.idealUser} en ${data.region}\n• Factores de decisión: Escalabilidad y valor del usuario`,
        estrategiaCompetitiva: `• Posicionamiento vs competencia: Premium vs ${data.alternatives}\n• Estrategia de precios: 20-30% más altos que la competencia\n• Diferenciación por valor: Beneficios claros que justifiquen la diferencia\n• Ventaja competitiva: Valor superior percibido`,
        recomendaciones: `• Recomendación 1: Implementa precios psicológicos ($97 en lugar de $100)\n• Recomendación 2: Ofrece prueba gratuita de 14 días\n• Recomendación 3: Crea paquetes que faciliten la decisión del usuario\n• Implementación: Enfócate en maximizar valor percibido`,
        analisisCompetidores: `• ${data.alternatives}: Precios entre $19-$79 mensuales en ${data.region}\n• Competidores locales similares: Rango $25-$89\n• Posicionamiento recomendado: Rango medio-alto ($49-$99)\n• Estrategia: Ofrecer valor superior justificando precios premium`
      };
    }
  }

  // SECTION 2: Market Size - MARKET METRICS ONLY
  private static async generateMarketSizeSection(data: BusinessData, fullContent: GeneratedContent): Promise<string> {
    console.log('📊 Generating Market Size with STRICT isolation...');
    
    const prompt = `
      Eres un analista de mercado senior especializado en métricas TAM/SAM/SOM.
      
      IDEA: "${data.idea}"
      REGIÓN: ${data.region}
      TIPO: ${data.projectType}
      
      CONTEXTO DISPONIBLE: ${fullContent.marketSize || 'Análisis de mercado disponible'}
      
      TAREA: Crea EXCLUSIVAMENTE un análisis de TAMAÑO DEL MERCADO.
      
      AISLAMIENTO ESTRICTO REQUERIDO:
      ✅ INCLUIR: TAM, SAM, SOM, factores de crecimiento, barreras de entrada, métricas cuantitativas
      ❌ NO INCLUIR: Análisis de competencia, plan de acción, propuesta de valor, herramientas, investigación
      
      FORMATO BULLETS REQUERIDO:
      • Cada concepto importante debe empezar con un bullet (•)
      • Cada bullet debe estar en una nueva línea
      • Usar bullets para: TAM, SAM, SOM, factores de crecimiento, barreras
      • Estructura: 1 bullet por concepto importante
      • Explicar cada sigla de manera simple y accesible
      
      ESTRUCTURA REQUERIDA CON BULLETS:
      • TAM (Mercado Total Disponible): [explicación simple + número]
      • SAM (Mercado que Puedes Atender): [explicación simple + número]
      • SOM (Mercado que Realmente Puedes Capturar): [explicación simple + número]
      • Factores de Crecimiento: [tendencias y factores importantes]
      • Barreras de Entrada: [obstáculos y consideraciones]
      
      TONO: Profesional pero accesible, explicar conceptos técnicos de manera simple
      ENFOQUE: Solo métricas de mercado, NO análisis del negocio
      LÍMITE: Máximo 300 palabras, bien estructurado
      TERMINOLOGÍA: Usar términos del día a día, explicar siglas de manera simple
      
      NO USAR: Símbolos *, #, o formato markdown
      LENGUAJE: Español claro y accesible
      
      FORMATO MONETARIO REQUERIDO:
      - Usar formato: [Número][Letra]+ (ejemplo: 50M+, 100B+, 25K+)
      - K = Miles (thousands)
      - M = Millones (millions) 
      - B = Billones (billions)
      - SIEMPRE incluir el símbolo + después de la letra
      
      RECUERDA: Esta sección es SOLO para tamaño del mercado. NO incluir información de otras secciones.
      FORMATO OBLIGATORIO: Usar bullets (•) para cada punto importante
      EXPLICAR SIGLAS: TAM, SAM, SOM deben explicarse de manera simple y accesible
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Error generating Market Size section:', error);
      return `• TAM (Mercado Total Disponible): El mercado total para ${data.idea} en ${data.region} es sustancial, representando una oportunidad masiva de crecimiento\n• SAM (Mercado que Puedes Atender): Puedes atender efectivamente al 15-20% del mercado total, enfocándote en ${data.idealUser}\n• SOM (Mercado que Realmente Puedes Capturar): En 3-5 años, puedes capturar de manera realista una porción de 50M+ del mercado\n• Factores de Crecimiento: El mercado muestra tendencias de crecimiento del 12-15% anual, impulsado por la demanda de soluciones como la tuya\n• Barreras de Entrada: Considera la competencia existente y los recursos necesarios para posicionarte efectivamente`;
    }
  }

  // SECTION 3: Brand Suggestions with Reasoning - NAMING AND EXPLANATION
  private static async generateBrandSuggestionsSection(data: BusinessData): Promise<{ names: string[], reasoning: string[] }> {
    console.log('🌟 Generating Brand Suggestions with Reasoning...');
    
    const prompt = `
      Eres un experto senior en naming y branding de startups.
      
      IDEA: "${data.idea}"
      PROBLEMA: "${data.problem}"
      USUARIO: "${data.idealUser}"
      REGIÓN: ${data.region}
      TIPO: ${data.projectType}
      
      TAREA: Crea 5 nombres de marca únicos y memorables, cada uno con una explicación específica de por qué es recomendado.
      
      CRITERIOS PARA CADA NOMBRE:
      - Debe ser culturalmente apropiado para ${data.region}
      - Debe reflejar la esencia de "${data.idea}"
      - Debe ser memorable y fácil de pronunciar
      - Debe tener potencial de marca registrada
      
      FORMATO REQUERIDO:
      NOMBRES:
      [Nombre1, Nombre2, Nombre3, Nombre4, Nombre5]
      
      EXPLICACIONES:
      [Explicación1, Explicación2, Explicación3, Explicación4, Explicación5]
      
      TONO: Naming profesional - creativo pero estratégico
      ENFOQUE: Nombres de marca con justificación estratégica
      
      RECUERDA: Cada nombre debe tener una explicación clara de por qué es recomendado para este proyecto específico.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract names
      const namesMatch = text.match(/NOMBRES:\s*\[([^\]]+)\]/);
      const reasoningMatch = text.match(/EXPLICACIONES:\s*\[([^\]]+)\]/);
      
      if (namesMatch && reasoningMatch) {
        const names = namesMatch[1].split(',').map((name: string) => name.trim().replace(/['"]/g, ''));
        const reasoning = reasoningMatch[1].split(',').map((reason: string) => reason.trim().replace(/['"]/g, ''));
        
        return { names, reasoning };
      }
      
      // Fallback with reasoning
      const fallbackNames = ['InnovateHub', 'FutureFlow', 'SmartStart', 'GrowthGenius', 'SuccessSphere'];
      const fallbackReasoning = [
        'Combina innovación con colaboración, ideal para plataformas tecnológicas',
        'Sugiere flujo continuo y progreso hacia el futuro',
        'Enfatiza el inicio inteligente y estratégico del proyecto',
        'Destaca la genialidad en el crecimiento y desarrollo',
        'Representa un ecosistema completo de éxito y oportunidades'
      ];
      
      return { names: fallbackNames, reasoning: fallbackReasoning };
    } catch (error) {
      console.error('❌ Error generating Brand Suggestions section:', error);
      
      // Fallback with reasoning
      const fallbackNames = ['InnovateHub', 'FutureFlow', 'SmartStart', 'GrowthGenius', 'SuccessSphere'];
      const fallbackReasoning = [
        'Combina innovación con colaboración, ideal para plataformas tecnológicas',
        'Sugiere flujo continuo y progreso hacia el futuro',
        'Enfatiza el inicio inteligente y estratégico del proyecto',
        'Destaca la genialidad en el crecimiento y desarrollo',
        'Representa un ecosistema completo de éxito y oportunidades'
      ];
      
      return { names: fallbackNames, reasoning: fallbackReasoning };
    }
  }

    // SECTION 4: Recommended Tools - ALWAYS RETURN FIXED TOOLS FOR AFFILIATE LINKS
   private static async generateRecommendedToolsSection(data: BusinessData, fullContent: GeneratedContent): Promise<any[]> {
     console.log('🛠️ Returning FIXED Recommended Tools for affiliate links...');
     
     // Always return the same fixed tools for affiliate link consistency
     return this.getFixedRecommendedTools();
   }

  // SECTION 5: Action Plan - INTELLIGENT 7-STEP PLAN BASED ON PROJECT TYPE
  private static async generateActionPlanSection(data: BusinessData): Promise<string[]> {
    console.log('🚀 Generating Intelligent Action Plan with 7 steps based on project type...');
    
    const prompt = `
      Eres un consultor estratégico senior especializado en lanzamiento de startups y desarrollo de MVPs.
      
      IDEA: "${data.idea}"
      PROBLEMA: "${data.problem}"
      USUARIO IDEAL: "${data.idealUser}"
      REGIÓN: ${data.region}
      ALTERNATIVAS: "${data.alternatives}"
      MODELO DE NEGOCIO: ${data.businessModel}
      TIPO DE PROYECTO: ${data.projectType}
      
      TAREA: Crea EXCLUSIVAMENTE un plan de acción INTELIGENTE con 7 pasos ejecutables.
      
      FÓRMULA INTELIGENTE REQUERIDA:
      Cada paso debe ser específico para ${data.projectType} y adaptado a ${data.businessModel} en ${data.region}.
      
      ESTRUCTURA OBLIGATORIA DE 7 PASOS:
      
      1. VALIDACIÓN DE MERCADO (Siempre el primer paso)
         - Específico para ${data.projectType}
         - Métodos adaptados a ${data.region}
         - Métricas de validación claras
      
      2. DESARROLLO DE MVP (Siempre el segundo paso)
         - Características mínimas para ${data.projectType}
         - Tecnología apropiada para ${data.businessModel}
         - Timeline realista
      
      3. VALIDACIÓN DE USUARIOS (Siempre el tercer paso)
         - Pruebas específicas para ${data.idealUser}
         - Métodos de feedback adaptados
         - Iteración rápida
      
      4. ESTRATEGIA DE LANZAMIENTO (Siempre el cuarto paso)
         - Canales específicos para ${data.projectType}
         - Enfoque en ${data.region}
         - Métricas de lanzamiento
      
      5. OPERACIONES Y ESCALABILIDAD (Siempre el quinto paso)
         - Procesos para ${data.businessModel}
         - Sistemas de soporte
         - Preparación para crecimiento
      
      6. MONETIZACIÓN Y CRECIMIENTO (Siempre el sexto paso)
         - Estrategias para ${data.businessModel}
         - Métricas de ingresos
         - Plan de expansión
      
      7. OPTIMIZACIÓN Y EXPANSIÓN (Siempre el séptimo paso)
         - Mejoras continuas
         - Nuevos mercados
         - Productos complementarios
      
      ADAPTACIONES ESPECÍFICAS POR TIPO DE PROYECTO:
      
      ${data.projectType === 'SaaS' ? `
      - SaaS: Enfoque en desarrollo de software, onboarding de usuarios, métricas de retención
      - Validación: Pruebas de usabilidad, feedback de usuarios beta, métricas de engagement
      - MVP: Funcionalidades core, sistema de usuarios, dashboard básico
      - Lanzamiento: Product Hunt, comunidades de desarrolladores, freemium model
      - Operaciones: Soporte técnico, documentación, actualizaciones automáticas
      - Monetización: Modelos de suscripción, pricing tiers, enterprise sales
      - Expansión: Integraciones, API, marketplace de plugins` : ''}
      
      ${data.projectType === 'Ecommerce' ? `
      - Ecommerce: Enfoque en experiencia de compra, logística, conversión
      - Validación: Pruebas de concepto, encuestas de compra, análisis de competencia
      - MVP: Catálogo básico, carrito de compras, sistema de pagos
      - Lanzamiento: Redes sociales, influencers locales, marketing de contenidos
      - Operaciones: Inventario, logística, atención al cliente
      - Monetización: Margen de productos, cross-selling, programas de fidelidad
      - Expansión: Nuevos productos, mercados internacionales, marketplace` : ''}
      
      ${data.projectType === 'Service' ? `
      - Service: Enfoque en expertise, credibilidad, relaciones con clientes
      - Validación: Pruebas de servicio, testimonios, casos de estudio
      - MVP: Servicio básico, proceso de ventas, propuesta de valor
      - Lanzamiento: Networking, contenido educativo, referencias
      - Operaciones: Calendario, facturación, seguimiento de proyectos
      - Monetización: Pricing por hora/proyecto, paquetes de servicios, retención
      - Expansión: Nuevos servicios, consultoría, formación` : ''}
      
      ${data.projectType === 'Physical Product' ? `
      - Physical Product: Enfoque en prototipado, manufactura, distribución
      - Validación: Pruebas de concepto, focus groups, análisis de costos
      - MVP: Prototipo funcional, pruebas de usuario, validación técnica
      - Lanzamiento: Crowdfunding, ferias comerciales, partnerships
      - Operaciones: Supply chain, calidad, cumplimiento normativo
      - Monetización: Pricing competitivo, márgenes, ventas directas
      - Expansión: Variaciones del producto, nuevos mercados, licencias` : ''}
      
      FORMATO REQUERIDO:
      Cada paso debe ser una oración completa, específica y accionable.
      Máximo 25 palabras por paso.
      TONO: Consultor estratégico - práctico, ejecutable, realista
      ENFOQUE: Solo pasos de acción específicos para ${data.projectType}, NO análisis genérico
      
      FORMATO DE TEXTO:
      - NO usar asteriscos (**texto**) ni formato markdown
      - NO usar corchetes [] ni símbolos especiales
      - Solo texto plano y limpio
      - Cada paso debe ser una oración completa y clara
      
      RECUERDA: Este plan debe ser TAN ESPECÍFICO que un emprendedor pueda ejecutarlo inmediatamente.
      Cada paso debe ser diferente para cada tipo de proyecto y adaptado a los inputs del usuario.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract steps using multiple parsing strategies
      let steps: string[] = [];
      
      // Strategy 1: Look for numbered list
      const numberedMatch = text.match(/(?:^|\n)\s*(?:[0-9]+\.|\([0-9]+\)|PASO\s*[0-9]+:?)\s*([^\n]+)/gm);
      if (numberedMatch) {
        steps = numberedMatch.map(match => match.replace(/^(?:[0-9]+\.|\([0-9]+\)|PASO\s*[0-9]+:?)\s*/, '').trim());
      }
      
      // Strategy 2: Look for bullet points
      if (steps.length === 0) {
        const bulletMatch = text.match(/(?:^|\n)\s*[•·-]\s*([^\n]+)/gm);
        if (bulletMatch) {
          steps = bulletMatch.map(match => match.replace(/^(?:^|\n)\s*[•·-]\s*/, '').trim());
        }
      }
      
      // Strategy 3: Split by newlines and filter
      if (steps.length === 0) {
        const lines = text.split('\n').filter(line => line.trim().length > 20 && line.trim().length < 100);
        steps = lines.slice(0, 7);
      }
      
      // Ensure we have exactly 7 steps
      if (steps.length >= 7) {
        // Clean asterisks from steps before returning
        return steps.slice(0, 7).map(step => step.replace(/\*\*/g, '').trim());
      } else if (steps.length > 0) {
        // Fill remaining steps with intelligent defaults
        const defaultSteps = this.getDefaultActionPlanSteps(data);
        const allSteps = [...steps, ...defaultSteps.slice(steps.length, 7)];
        // Clean asterisks from all steps
        return allSteps.map(step => step.replace(/\*\*/g, '').trim());
      } else {
        // Use intelligent defaults based on project type
        const defaultSteps = this.getDefaultActionPlanSteps(data);
        // Clean asterisks from default steps
        return defaultSteps.map(step => step.replace(/\*\*/g, '').trim());
      }
      
    } catch (error) {
      console.error('❌ Error generating Intelligent Action Plan section:', error);
      return this.getDefaultActionPlanSteps(data);
    }
  }

  // Helper method to generate intelligent default steps based on project type
  private static getDefaultActionPlanSteps(data: BusinessData): string[] {
    const baseSteps = [
      `Validar la demanda real de "${data.idea}" en ${data.region} mediante investigación de mercado rigurosa`,
      `Desarrollar un MVP mínimo viable que resuelva los problemas específicos identificados para "${data.idea}"`,
      `Validar el producto con usuarios reales de ${data.idealUser} y recopilar feedback detallado`,
      `Crear estrategias de lanzamiento específicas para ${data.projectType} en el mercado de ${data.region}`,
      `Configurar sistemas operativos y procesos adaptados a las necesidades de "${data.idea}"`,
      `Implementar estrategias de monetización para ${data.businessModel} con métricas claras de éxito`,
      `Establecer procesos de iteración y expansión basados en datos reales del mercado`
    ];

    // Customize based on project type
    if (data.projectType === 'SaaS') {
      return [
        `Validar la demanda de software "${data.idea}" mediante pruebas de concepto con ${data.idealUser}`,
        `Desarrollar MVP SaaS con funcionalidades core, sistema de usuarios y dashboard básico`,
        `Realizar pruebas de usabilidad con usuarios beta y medir engagement y retención`,
        `Lanzar en Product Hunt y comunidades de desarrolladores con modelo freemium`,
        `Configurar soporte técnico, documentación y sistema de actualizaciones automáticas`,
        `Implementar modelos de suscripción con pricing tiers y métricas de LTV`,
        `Expandir con integraciones, API y marketplace de plugins para escalabilidad`
      ];
    } else if (data.projectType === 'Ecommerce') {
      return [
        `Validar la demanda de productos "${data.idea}" mediante encuestas y análisis de competencia`,
        `Crear MVP con catálogo básico, carrito de compras y sistema de pagos seguro`,
        `Probar la experiencia de compra con usuarios reales y optimizar conversión`,
        `Lanzar en redes sociales e influencers locales con marketing de contenidos`,
        `Configurar inventario, logística y sistema de atención al cliente`,
        `Implementar estrategias de cross-selling y programas de fidelidad`,
        `Expandir con nuevos productos y mercados internacionales`
      ];
    } else if (data.projectType === 'Service') {
      return [
        `Validar la demanda de servicios "${data.idea}" mediante networking y casos de estudio`,
        `Crear MVP de servicio con proceso de ventas y propuesta de valor clara`,
        `Probar el servicio con clientes piloto y recopilar testimonios`,
        `Lanzar mediante contenido educativo, networking y referencias`,
        `Configurar calendario, facturación y seguimiento de proyectos`,
        `Implementar pricing por hora/proyecto y estrategias de retención`,
        `Expandir con nuevos servicios, consultoría y formación`
      ];
    } else if (data.projectType === 'Physical Product') {
      return [
        `Validar la demanda de producto "${data.idea}" mediante focus groups y análisis de costos`,
        `Desarrollar prototipo funcional y realizar pruebas técnicas de usuario`,
        `Probar el prototipo con usuarios reales y validar funcionalidad`,
        `Lanzar mediante crowdfunding, ferias comerciales y partnerships`,
        `Configurar supply chain, control de calidad y cumplimiento normativo`,
        `Implementar pricing competitivo y estrategias de ventas directas`,
        `Expandir con variaciones del producto y nuevos mercados`
      ];
    }

    return baseSteps;
  }

  // Helper method to generate relevant links for each action plan step
  static getStepResourceLinks(data: BusinessData): Array<{ title: string; url: string; description: string }> {
    // Generate specific YouTube search links for each step of the action plan
    const stepLinks = [
      {
        title: "Validar Idea de Negocio (YouTube)",
        url: `https://www.youtube.com/results?search_query=como+validar+idea+negocio+entrevistas+encuestas+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre validación de ideas de negocio con entrevistas y encuestas"
      },
      {
        title: "Desarrollar MVP (YouTube)",
        url: `https://www.youtube.com/results?search_query=desarrollar+mvp+${encodeURIComponent(data.businessModel)}+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre desarrollo de MVP y modelos de negocio"
      },
      {
        title: "Estrategia de Marketing (YouTube)",
        url: `https://www.youtube.com/results?search_query=estrategia+marketing+${encodeURIComponent(data.region)}+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre estrategias de marketing regional"
      },
      {
        title: "Métricas y KPIs (YouTube)",
        url: `https://www.youtube.com/results?search_query=metricas+kpis+startup+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre métricas de éxito y KPIs para startups"
      },
      {
        title: "Lanzamiento Beta (YouTube)",
        url: `https://www.youtube.com/results?search_query=lanzamiento+beta+usuarios+piloto+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre lanzamiento de beta con usuarios piloto"
      },
      {
        title: "Feedback e Iteración (YouTube)",
        url: `https://www.youtube.com/results?search_query=feedback+iteracion+startup+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre recolección de feedback e iteración de productos"
      },
      {
        title: "Escalamiento y Expansión (YouTube)",
        url: `https://www.youtube.com/results?search_query=escalamiento+expansion+startup+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre escalamiento de operaciones y expansión de mercado"
      }
    ];

    // Return the specific step links for all project types
    return stepLinks;
  }

  // Legacy method - kept for backward compatibility
  static getStepResourceLinksLegacy(data: BusinessData): Array<{ title: string; url: string; description: string }> {
    // Customize links based on project type - each link must match the specific step content
    if (data.projectType === 'SaaS') {
      return [
        {
          title: "Validación de Software SaaS (YouTube)",
          url: `https://www.youtube.com/results?search_query=validacion+software+saas+startup+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre validación de productos SaaS"
        },
        {
          title: "MVP SaaS con Sistema de Usuarios (YouTube)",
          url: `https://www.youtube.com/results?search_query=mvp+saas+sistema+usuarios+dashboard+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre desarrollo de MVP SaaS"
        },
        {
          title: "Testing de Usabilidad SaaS (YouTube)",
          url: `https://www.youtube.com/results?search_query=testing+usabilidad+saas+usuarios+beta+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre pruebas de usabilidad SaaS"
        },
        {
          title: "Lanzamiento SaaS en Product Hunt (YouTube)",
          url: `https://www.youtube.com/results?search_query=lanzamiento+saas+product+hunt+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre lanzamiento en Product Hunt"
        },
        {
          title: "Soporte Técnico SaaS (YouTube)",
          url: `https://www.youtube.com/results?search_query=soporte+tecnico+saas+documentacion+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre soporte técnico SaaS"
        },
        {
          title: "Modelos de Suscripción SaaS (YouTube)",
          url: `https://www.youtube.com/results?search_query=modelos+suscripcion+saas+pricing+tiers+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre modelos de suscripción SaaS"
        },
        {
          title: "Integraciones y API SaaS (YouTube)",
          url: `https://www.youtube.com/results?search_query=integraciones+api+saas+marketplace+plugins+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre integraciones y API SaaS"
        }
      ];
    } else if (data.projectType === 'Ecommerce') {
      return [
        {
          title: "Validación de Productos Ecommerce (YouTube)",
          url: `https://www.youtube.com/results?search_query=validacion+productos+ecommerce+encuestas+competencia+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre validación de productos ecommerce"
        },
        {
          title: "MVP Ecommerce con Catálogo y Pagos (YouTube)",
          url: `https://www.youtube.com/results?search_query=mvp+ecommerce+catalogo+carrito+pagos+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre MVP de ecommerce"
        },
        {
          title: "Testing de Experiencia de Compra (YouTube)",
          url: `https://www.youtube.com/results?search_query=testing+experiencia+compra+ecommerce+conversion+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre testing de experiencia de compra"
        },
        {
          title: "Marketing Ecommerce en Redes Sociales (YouTube)",
          url: `https://www.youtube.com/results?search_query=marketing+ecommerce+redes+sociales+influencers+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre marketing en redes sociales para ecommerce"
        },
        {
          title: "Inventario y Logística Ecommerce (YouTube)",
          url: `https://www.youtube.com/results?search_query=inventario+logistica+ecommerce+atencion+cliente+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre inventario y logística ecommerce"
        },
        {
          title: "Cross-selling y Programas de Fidelidad (YouTube)",
          url: `https://www.youtube.com/results?search_query=cross+selling+fidelidad+ecommerce+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre cross-selling y fidelidad ecommerce"
        },
        {
          title: "Expansión Internacional Ecommerce (YouTube)",
          url: `https://www.youtube.com/results?search_query=expansion+internacional+ecommerce+mercados+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre expansión internacional ecommerce"
        }
      ];
    } else if (data.projectType === 'Service') {
      return [
        {
          title: "Validación de Servicios mediante Networking (YouTube)",
          url: `https://www.youtube.com/results?search_query=validacion+servicios+networking+casos+estudio+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre validación de servicios mediante networking"
        },
        {
          title: "MVP de Servicio con Proceso de Ventas (YouTube)",
          url: `https://www.youtube.com/results?search_query=mvp+servicio+proceso+ventas+propuesta+valor+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre MVP de servicios"
        },
        {
          title: "Testing con Clientes Piloto (YouTube)",
          url: `https://www.youtube.com/results?search_query=testing+clientes+piloto+servicios+testimonios+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre testing con clientes piloto"
        },
        {
          title: "Lanzamiento de Servicios con Contenido Educativo (YouTube)",
          url: `https://www.youtube.com/results?search_query=lanzamiento+servicios+contenido+educativo+networking+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre lanzamiento de servicios"
        },
        {
          title: "Calendario y Facturación de Servicios (YouTube)",
          url: `https://www.youtube.com/results?search_query=calendario+facturacion+servicios+seguimiento+proyectos+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre calendario y facturación de servicios"
        },
        {
          title: "Pricing por Hora y Proyecto (YouTube)",
          url: `https://www.youtube.com/results?search_query=pricing+hora+proyecto+servicios+retencion+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre pricing de servicios"
        },
        {
          title: "Expansión de Servicios y Consultoría (YouTube)",
          url: `https://www.youtube.com/results?search_query=expansion+servicios+consultoria+formacion+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre expansión de servicios"
        }
      ];
    } else if (data.projectType === 'Physical Product') {
      return [
        {
          title: "Validación con Focus Groups (YouTube)",
          url: `https://www.youtube.com/results?search_query=validacion+focus+groups+productos+analisis+costos+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre validación con focus groups"
        },
        {
          title: "Prototipo Funcional y Pruebas Técnicas (YouTube)",
          url: `https://www.youtube.com/results?search_query=prototipo+funcional+pruebas+tecnicas+usuario+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre prototipado funcional"
        },
        {
          title: "Testing de Prototipo con Usuarios (YouTube)",
          url: `https://www.youtube.com/results?search_query=testing+prototipo+usuarios+reales+funcionalidad+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre testing de prototipos"
        },
        {
          title: "Crowdfunding y Ferias Comerciales (YouTube)",
          url: `https://www.youtube.com/results?search_query=crowdfunding+ferias+comerciales+partnerships+productos+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre crowdfunding y ferias comerciales"
        },
        {
          title: "Supply Chain y Control de Calidad (YouTube)",
          url: `https://www.youtube.com/results?search_query=supply+chain+control+calidad+cumplimiento+normativo+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre supply chain y control de calidad"
        },
        {
          title: "Pricing Competitivo y Ventas Directas (YouTube)",
          url: `https://www.youtube.com/results?search_query=pricing+competitivo+ventas+directas+productos+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre pricing competitivo de productos"
        },
        {
          title: "Variaciones del Producto y Nuevos Mercados (YouTube)",
          url: `https://www.youtube.com/results?search_query=variaciones+producto+nuevos+mercados+licencias+${encodeURIComponent(data.idea)}`,
          description: "Videos de YouTube sobre variaciones de productos y expansión"
        }
      ];
    }

    // Default fallback links
    return [
      {
        title: "Validación de Idea de Negocio (YouTube)",
        url: `https://www.youtube.com/results?search_query=como+validar+idea+negocio+entrevistas+encuestas+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre validación de ideas de negocio"
      },
      {
        title: "Desarrollo de MVP (YouTube)",
        url: `https://www.youtube.com/results?search_query=desarrollar+mvp+${encodeURIComponent(data.businessModel)}+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre desarrollo de MVP"
      },
      {
        title: "Marketing Digital (YouTube)",
        url: `https://www.youtube.com/results?search_query=marketing+digital+startup+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre marketing digital para startups"
      },
      {
        title: "Análisis de Competencia (YouTube)",
        url: `https://www.youtube.com/results?search_query=analisis+competencia+startup+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre análisis de competencia"
      },
      {
        title: "Escalamiento de Negocio (YouTube)",
        url: `https://www.youtube.com/results?search_query=escalamiento+negocio+startup+${encodeURIComponent(data.idea)}`,
        description: "Videos de YouTube sobre escalamiento de operaciones"
      }
    ];
  }

  // SECTION 6: Market Research - VALIDATION METHODS ONLY
  private static async generateMarketResearchSection(data: BusinessData): Promise<any> {
    console.log('🔍 Generating Market Research with STRICT isolation...');
    
    const prompt = `
      Eres un experto senior en investigación de mercado y validación de startups.
      
      IDEA: "${data.idea}"
      PROBLEMA: "${data.problem}"
      USUARIO: "${data.idealUser}"
      REGIÓN: ${data.region}
      ALTERNATIVAS: "${data.alternatives}"
      TIPO: ${data.projectType}
      MODELO: ${data.businessModel}
      
      TAREA: Crea EXCLUSIVAMENTE métodos de investigación de mercado ESPECÍFICOS y ACCIONABLES para validar esta idea.
      
      REQUISITOS CRÍTICOS:
      - Generar contenido REAL y ESPECÍFICO para esta idea, NO genérico
      - NO repetir la idea o el problema del formulario
      - Crear términos de búsqueda ESPECÍFICOS para esta idea
      - Generar temas de validación CONCRETOS para este negocio
      - Crear métodos de investigación ACCIONABLES para este proyecto
      
      FORMATO REQUERIDO: JSON estructurado
      {
        "searchTerms": [
          "término específico 1 para esta idea",
          "término específico 2 para este mercado",
          "término específico 3 para validar demanda",
          "término específico 4 para competencia",
          "término específico 5 para tendencias"
        ],
        "validationTopics": [
          "tema específico 1 para validar esta idea",
          "tema específico 2 para entender el mercado",
          "tema específico 3 para analizar competencia",
          "tema específico 4 para medir demanda"
        ],
        "researchMethods": [
          "método específico 1 para esta idea",
          "método específico 2 para este mercado",
          "método específico 3 para validar usuarios",
          "método específico 4 para analizar competencia",
          "método específico 5 para medir tendencias",
          "método específico 6 para validar viabilidad"
        ]
      }
      
      TONO: Investigador de mercado - metodológico, práctico, ejecutable
      ENFOQUE: Solo métodos de validación ESPECÍFICOS para esta idea
      
      CRÍTICO: 
      - NO usar corchetes [] ni placeholders
      - NO repetir "tu idea" o "este problema"
      - Generar contenido REAL y ESPECÍFICO
      - Cada término/tema/método debe ser ACCIONABLE
      - Enfocarse en VALIDAR esta idea específica
      
      RECUERDA: Esta sección es SOLO para investigación de mercado ESPECÍFICA de esta idea.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const marketResearchMatch = response.text().match(/\{[\s\S]*\}/);
      
      if (marketResearchMatch) {
        return JSON.parse(marketResearchMatch[0]);
      }
      
      return {
        searchTerms: [
          `"${data.idea}" mercado ${data.region} 2024`,
          `"${data.idea}" competencia ${data.region}`,
          `"${data.idea}" demanda ${data.region}`,
          `"${data.idea}" tendencias ${data.region}`,
          `"${data.idea}" validación mercado ${data.region}`
        ],
        validationTopics: [
          `Demanda real de "${data.idea}" en ${data.region}`,
          `Competencia directa para "${data.idea}" en el mercado`,
          `Tendencias de adopción para soluciones como "${data.idea}"`,
          `Barreras de entrada para "${data.idea}" en ${data.region}`
        ],
        researchMethods: [
          `Análisis de Google Trends para "${data.idea}" en ${data.region}`,
          `Auditoría de competidores directos de "${data.idea}"`,
          `Encuestas a ${data.idealUser} sobre necesidad de "${data.idea}"`,
          `Análisis de sentimiento en redes sociales sobre "${data.idea}"`,
          `Entrevistas con usuarios potenciales de "${data.idea}"`,
          `Validación de precio para "${data.idea}" en ${data.region}`
        ]
      };
    } catch (error) {
      console.error('❌ Error generating Market Research section:', error);
      return {
        searchTerms: [
          `"${data.idea}" mercado ${data.region} 2024`,
          `"${data.idea}" competencia ${data.region}`,
          `"${data.idea}" demanda ${data.region}`,
          `"${data.idea}" tendencias ${data.region}`,
          `"${data.idea}" validación mercado ${data.region}`
        ],
        validationTopics: [
          `Demanda real de "${data.idea}" en ${data.region}`,
          `Competencia directa para "${data.idea}" en el mercado`,
          `Tendencias de adopción para soluciones como "${data.idea}"`,
          `Barreras de entrada para "${data.idea}" en ${data.region}`
        ],
        researchMethods: [
          `Análisis de Google Trends para "${data.idea}" en ${data.region}`,
          `Auditoría de competidores directos de "${data.idea}"`,
          `Encuestas a ${data.idealUser} sobre necesidad de "${data.idea}"`,
          `Análisis de sentimiento en redes sociales sobre "${data.idea}"`,
          `Entrevistas con usuarios potenciales de "${data.idea}"`,
          `Validación de precio para "${data.idea}" en ${data.region}`
        ]
      };
    }
  }

  // Optimize content for specific sections using targeted AI calls
  static async optimizeSectionContent(content: GeneratedContent, data: BusinessData): Promise<GeneratedContent> {
    const optimizedContent = { ...content };
    
    try {
      // Optimize Business Summary section - Focus on EXECUTIVE OVERVIEW
      if (content.businessSummary) {
        console.log('🎯 Optimizing Business Summary section for EXECUTIVE OVERVIEW...');
        const businessSummaryPrompt = `
          Eres un consultor de negocios senior especializado en crear RESUMENES EJECUTIVOS.
          
          ANÁLISIS COMPLETO DISPONIBLE:
          ${content.businessSummary}
          
          IDEA ESPECÍFICA: "${data.idea}"
          PROBLEMA: "${data.problem}"
          USUARIO: "${data.idealUser}"
          REGIÓN: ${data.region}
          MODELO: ${data.businessModel}
          TIPO: ${data.projectType}
          
          TAREA ESPECÍFICA: Crea un RESUMEN DEL NEGOCIO que sea EXCLUSIVAMENTE un resumen ejecutivo:
          
          REQUISITOS DEL RESUMEN EJECUTIVO:
          - Máximo 2-3 párrafos concisos
          - Enfoque en la propuesta de valor CLAVE
          - Viabilidad del negocio en términos simples
          - Oportunidad de mercado específica
          - NO incluir detalles técnicos o pasos de implementación
          - NO incluir análisis de competencia detallado
          - NO incluir plan de acción
          
          FORMATO: Resumen ejecutivo profesional y conciso
          TONO: CEO/Inversor - alto nivel, estratégico
          ENFOQUE: Solo lo que un ejecutivo necesita saber en 30 segundos
        `;
        
        const businessSummaryResult = await model.generateContent(businessSummaryPrompt);
        const businessSummaryResponse = await businessSummaryResult.response;
        optimizedContent.businessSummary = businessSummaryResponse.text();
        console.log('✅ Business Summary optimized for EXECUTIVE OVERVIEW');
      }

      // Optimize Market Size section - Focus on MARKET METRICS & ANALYSIS
      if (content.marketSize) {
        console.log('🎯 Optimizing Market Size section for MARKET METRICS & ANALYSIS...');
        const marketSizePrompt = `
          Eres un analista de mercado senior especializado en métricas de mercado y análisis TAM/SAM/SOM.
          
          ANÁLISIS COMPLETO DISPONIBLE:
          ${content.marketSize}
          
          IDEA ESPECÍFICA: "${data.idea}"
          REGIÓN: ${data.region}
          TIPO: ${data.projectType}
          
          TAREA ESPECÍFICA: Crea un análisis de TAMAÑO DEL MERCADO que sea EXCLUSIVAMENTE métricas de mercado:
          
          REQUISITOS DEL ANÁLISIS DE MERCADO:
          - TAM (Total Addressable Market): Tamaño total del mercado objetivo con cifras específicas
          - SAM (Serviceable Addressable Market): Segmento específico alcanzable con métricas reales
          - SOM (Serviceable Obtainable Market): Porción realista capturable en 3-5 años
          - FACTORES DE CRECIMIENTO: Tendencias específicas que favorecen tu idea
          - BARRERAS DE ENTRADA: Desafíos reales para capturar el mercado
          - OPORTUNIDAD DE CRECIMIENTO: Porcentajes y proyecciones específicas
          
          FORMATO: Análisis con métricas específicas, números y proyecciones
          TONO: Analista de mercado - basado en datos, cuantitativo
          ENFOQUE: Solo métricas de mercado, NO análisis general del negocio
          INCLUIR: Cifras específicas, porcentajes, proyecciones temporales
        `;
        
        const marketSizeResult = await model.generateContent(marketSizePrompt);
        const marketSizeResponse = await marketSizeResult.response;
        optimizedContent.marketSize = marketSizeResponse.text();
        console.log('✅ Market Size optimized for MARKET METRICS & ANALYSIS');
      }

      // Optimize Brand Suggestions section - Focus on NAMING & BRANDING
      if (content.brandSuggestions && content.brandSuggestions.length > 0) {
        console.log('🎯 Optimizing Brand Suggestions section for NAMING & BRANDING...');
        const brandPrompt = `
          Eres un experto senior en naming y branding de startups con 15+ años de experiencia.
          
          IDEA ESPECÍFICA: "${data.idea}"
          PROBLEMA: "${data.problem}"
          USUARIO: "${data.idealUser}"
          REGIÓN: ${data.region}
          TIPO: ${data.projectType}
          
          NOMBRES EXISTENTES: ${content.brandSuggestions.join(', ')}
          
          TAREA ESPECÍFICA: Crea 5 NOMBRES DE MARCA que sean EXCLUSIVAMENTE para naming:
          
          REQUISITOS DEL NAMING:
          - REFLEJAR la propuesta de valor específica de "${data.idea}"
          - SER MEMORABLES y fáciles de pronunciar en ${data.region}
          - FUNCIONAR culturalmente en ${data.region} (idioma, tradiciones, valores)
          - DIFERENCIAR claramente de competidores existentes
          - ESCALAR internacionalmente (funcionar en otros idiomas)
          - TENER DOMINIOS disponibles (.com, .io, .app)
          - SER ÚNICOS y no infringir marcas existentes
          
          FORMATO: Lista de 5 nombres únicos, creativos y estratégicos
          TONO: Naming profesional - creativo pero estratégico
          ENFOQUE: Solo nombres de marca, NO análisis del negocio
          INCLUIR: Nombres que capturen la esencia de "${data.idea}"
        `;
        
        const brandResult = await model.generateContent(brandPrompt);
        const brandResponse = await brandResult.response;
        const brandMatch = brandResponse.text().match(/\[([^\]]+)\]/);
        
        if (brandMatch) {
          optimizedContent.brandSuggestions = brandMatch[1].split(',').map((name: string) => name.trim().replace(/['"]/g, ''));
          console.log('✅ Brand Suggestions optimized for NAMING & BRANDING');
        }
      }

      // Optimize Action Plan section - Focus on ACTIONABLE STEPS & TIMELINES
      if (content.actionPlan && content.actionPlan.length > 0) {
        console.log('🎯 Optimizing Action Plan section for ACTIONABLE STEPS & TIMELINES...');
        const actionPlanPrompt = `
          Eres un consultor de estrategia senior especializado en planes de acción ejecutables.
          
          IDEA ESPECÍFICA: "${data.idea}"
          PROBLEMA: "${data.problem}"
          USUARIO: "${data.idealUser}"
          REGIÓN: ${data.region}
          MODELO: ${data.businessModel}
          
          PLAN EXISTENTE: ${content.actionPlan.join(' | ')}
          
          TAREA ESPECÍFICA: Crea un PLAN DE ACCIÓN que sea EXCLUSIVAMENTE pasos ejecutables:
          
          REQUISITOS DEL PLAN DE ACCIÓN:
          - 6 PASOS ESPECÍFICOS para "${data.idea}" (NO genéricos del sector)
          - TIMELINES REALISTAS con fechas/plazos específicos
          - MÉTRICAS DE ÉXITO cuantificables para cada paso
          - ACCIONES INMEDIATAS que se puedan hacer hoy/esta semana
          - ORDEN LÓGICO de ejecución (dependencias claras)
          - RECURSOS NECESARIOS (tiempo, dinero, personas)
          - RIESGOS y mitigaciones para cada paso
          - CRITERIOS DE COMPLETADO para cada paso
          
          FORMATO: Lista de 6 pasos con timeline, métricas y recursos
          TONO: Consultor estratégico - práctico, ejecutable, realista
          ENFOQUE: Solo pasos de acción, NO análisis del negocio
          INCLUIR: Qué hacer, cuándo, cómo medir éxito, qué recursos necesitas
        `;
        
        const actionPlanResult = await model.generateContent(actionPlanPrompt);
        const actionPlanResponse = await actionPlanResult.response;
        const actionPlanMatch = actionPlanResponse.text().match(/\[([^\]]+)\]/);
        
        if (actionPlanMatch) {
          optimizedContent.actionPlan = actionPlanMatch[1].split('|').map((step: string) => step.trim());
          console.log('✅ Action Plan optimized for ACTIONABLE STEPS & TIMELINES');
        }
      }

      // Optimize Market Research section - Focus on VALIDATION METHODS & RESEARCH
      if (content.marketResearch) {
        console.log('🎯 Optimizing Market Research section for VALIDATION METHODS & RESEARCH...');
        const marketResearchPrompt = `
          Eres un experto senior en investigación de mercado y validación de startups.
          
          IDEA ESPECÍFICA: "${data.idea}"
          PROBLEMA: "${data.problem}"
          USUARIO: "${data.idealUser}"
          REGIÓN: ${data.region}
          ALTERNATIVAS: "${data.alternatives}"
          
          INVESTIGACIÓN EXISTENTE: ${JSON.stringify(content.marketResearch)}
          
          TAREA ESPECÍFICA: Crea una INVESTIGACIÓN DE MERCADO que sea EXCLUSIVAMENTE para validación:
          
          REQUISITOS DE LA INVESTIGACIÓN:
          - TÉRMINOS DE BÚSQUEDA: 5 términos específicos para validar en Google Trends para "${data.idea}"
          - TEMAS DE VALIDACIÓN: 3 temas clave para confirmar demanda real del mercado
          - MÉTODOS DE INVESTIGACIÓN: 6 métodos prácticos y ejecutables para validar
          - MÉTRICAS DE ÉXITO: Indicadores cuantificables para medir validación
          - HERRAMIENTAS ESPECÍFICAS: Qué usar para cada método de investigación
          - TIMELINE DE VALIDACIÓN: Cuándo y cómo ejecutar cada método
          - CRITERIOS DE ÉXITO: Qué resultados indican validación exitosa
          
          FORMATO: JSON estructurado con métodos ejecutables
          TONO: Investigador de mercado - metodológico, práctico, ejecutable
          ENFOQUE: Solo métodos de validación, NO análisis del negocio
          INCLUIR: Cómo validar "${data.idea}" específicamente, paso a paso
        `;
        
        const marketResearchResult = await model.generateContent(marketResearchPrompt);
        const marketResearchResponse = await marketResearchResult.response;
        const marketResearchMatch = marketResearchResponse.text().match(/\{[\s\S]*\}/);
        
        if (marketResearchMatch) {
          const parsedMarketResearch = JSON.parse(marketResearchMatch[0]);
          optimizedContent.marketResearch = {
            ...content.marketResearch,
            ...parsedMarketResearch
          };
          console.log('✅ Market Research optimized for VALIDATION METHODS & RESEARCH');
        }
      }

      // Optimize Recommended Tools section - ALWAYS USE FIXED TOOLS
      if (content.recommendedTools && content.recommendedTools.length > 0) {
        console.log('🎯 Using FIXED Recommended Tools for affiliate link consistency...');
        // Always use fixed tools for affiliate link consistency
        optimizedContent.recommendedTools = this.getFixedRecommendedTools();
        console.log('✅ Recommended Tools set to FIXED tools for affiliate links');
      }

      return optimizedContent;
    } catch (error) {
      console.error('Error optimizing section content:', error);
      return content; // Return original content if optimization fails
    }
  }

  // Step 1: Deep Analysis with granular steps and artificial delays
  private static async performDeepAnalysis(data: BusinessData): Promise<string> {
    console.log('Step 1: Starting deep analysis...');
    
    try {
      // Break down analysis into smaller, more deliberate steps
      const analysisSteps = [
        this.analyzeBusinessIdea.bind(this, data),
        this.analyzeMarketContext.bind(this, data),
        this.analyzeCompetition.bind(this, data),
        this.analyzeViability.bind(this, data),
        this.generateStrategicRecommendations.bind(this, data)
      ];

      let fullAnalysis = '';
      
      for (let i = 0; i < analysisSteps.length; i++) {
        console.log(`Analysis step ${i + 1}/${analysisSteps.length}...`);
        
        // Add artificial delay to ensure deeper processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const stepResult = await analysisSteps[i]();
        fullAnalysis += stepResult + '\n\n';
        
        console.log(`Step ${i + 1} completed`);
      }
      
      console.log('Deep analysis completed successfully');
      return fullAnalysis;
    } catch (error) {
      console.error('Error in deep analysis:', error);
      return this.getFallbackDeepAnalysis(data);
    }
  }

  // Step 2: Create dashboard content from analysis
  private static async createDashboardContent(deepAnalysis: string, data: BusinessData): Promise<GeneratedContent> {
    console.log('Step 2: Creating dashboard content...');
    
    try {
      // Generate brand suggestions directly for better results
      console.log('🌟 Generating brand suggestions directly...');
      const brandData = await this.generateBrandSuggestions(data);
      
      const contentPrompt = `
        Eres un consultor de negocios senior creando contenido para un dashboard ejecutivo.
        
        ANÁLISIS PREVIO COMPLETO:
        ${deepAnalysis}
        
        DATOS DEL NEGOCIO:
        IDEA: "${data.idea}"
        PROBLEMA: "${data.problem}"
        USUARIO IDEAL: "${data.idealUser}"
        REGIÓN: ${data.region}
        ALTERNATIVAS: "${data.alternatives}"
        MODELO DE NEGOCIO: ${data.businessModel}
        TIPO DE PROYECTO: ${data.projectType}
        
        NOMBRES DE MARCA YA GENERADOS: ${brandData.names.join(', ')}
        
        TAREA: Basándote en el análisis previo, crea contenido específico para cada sección del dashboard:
        
        1. RESUMEN DEL NEGOCIO: 2-3 párrafos concisos sobre la propuesta de valor y viabilidad
        2. TAMAÑO DEL MERCADO: Análisis del mercado objetivo y oportunidades específicas
        3. HERRAMIENTAS RECOMENDADAS: 4 categorías con 2-3 herramientas por categoría
        4. PLAN DE ACCIÓN: 6 pasos específicos y accionables
        5. INVESTIGACIÓN DE MERCADO: Términos de búsqueda, temas de validación y métodos
        
        FORMATO: JSON con las secciones anteriores
        TONO: Profesional, crítico pero constructivo
        ENFOQUE: Basar TODO en el análisis previo, no repetir información del formulario
      `;
      
      const result = await model.generateContent(contentPrompt);
      const response = await result.response;
      const jsonMatch = response.text().match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Dashboard content created successfully');
        
                 // Add the brand data we generated directly
         parsed.brandSuggestions = brandData.names;
         parsed.brandReasoning = brandData.reasoning;
         
         // Ensure we have proper brand reasoning
         if (!parsed.brandReasoning || parsed.brandReasoning.length === 0) {
           console.warn('⚠️ No brand reasoning in parsed content, using AI-generated reasoning');
           parsed.brandReasoning = brandData.reasoning;
         }
         
         // Always use fixed tools for affiliate link consistency
         parsed.recommendedTools = this.getFixedRecommendedTools();
         
         return parsed;
      }
      
      console.log('JSON parsing failed, using fallback dashboard content');
      const fallbackContent = this.getFallbackDashboardContent(data);
      
             // Add the brand data we generated directly to fallback content
       fallbackContent.brandSuggestions = brandData.names;
       fallbackContent.brandReasoning = brandData.reasoning;
       
       // Ensure we have proper brand reasoning in fallback
       if (!fallbackContent.brandReasoning || fallbackContent.brandReasoning.length === 0) {
         console.warn('⚠️ No brand reasoning in fallback content, using AI-generated reasoning');
         fallbackContent.brandReasoning = brandData.reasoning;
       }
       
       // Always use fixed tools for affiliate link consistency
       fallbackContent.recommendedTools = this.getFixedRecommendedTools();
       
       return fallbackContent;
    } catch (error) {
      console.error('Error creating dashboard content:', error);
      const fallbackContent = this.getFallbackDashboardContent(data);
      
             // Try to generate brand suggestions even if main generation fails
       try {
         const brandData = await this.generateBrandSuggestions(data);
         fallbackContent.brandSuggestions = brandData.names;
         fallbackContent.brandReasoning = brandData.reasoning;
         
         // Ensure we have proper brand reasoning
         if (!fallbackContent.brandReasoning || fallbackContent.brandReasoning.length === 0) {
           console.warn('⚠️ No brand reasoning generated, using creative fallback reasoning');
           fallbackContent.brandReasoning = this.generateCreativeFallbackReasoning(data, brandData.names);
         }
       } catch (brandError) {
         console.error('Error generating brand suggestions:', brandError);
         // Use creative fallback reasoning if AI generation fails
         fallbackContent.brandReasoning = this.generateCreativeFallbackReasoning(data, fallbackContent.brandSuggestions);
       }
       
       // Always use fixed tools for affiliate link consistency
       fallbackContent.recommendedTools = this.getFixedRecommendedTools();
       
       return fallbackContent;
    }
  }

  // Individual analysis steps with specific focus
  private static async analyzeBusinessIdea(data: BusinessData): Promise<string> {
    const prompt = `
      Analiza críticamente la IDEA DE NEGOCIO: "${data.idea}"
      
      Enfócate en:
      - Propuesta de valor real vs. percibida
      - Viabilidad técnica y operativa
      - Fortalezas únicas de la idea
      - Debilidades y riesgos principales
      
      TONO: Consultor senior crítico pero constructivo
      ENFOQUE: Analiza la IDEA específica, no el sector general
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private static async analyzeMarketContext(data: BusinessData): Promise<string> {
    const prompt = `
      Analiza el CONTEXTO DE MERCADO para la idea: "${data.idea}"
      
      Enfócate en:
      - Tamaño real del mercado en ${data.region}
      - Oportunidades específicas para esta idea
      - Factores de éxito clave
      - Barreras de entrada reales
      
      TONO: Consultor senior crítico pero constructivo
      ENFOQUE: Analiza en relación a la IDEA específica, no al sector general
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private static async analyzeCompetition(data: BusinessData): Promise<string> {
    const prompt = `
      Analiza la COMPETENCIA para la idea: "${data.idea}"
      
      Enfócate en:
      - Análisis de alternativas existentes: ${data.alternatives}
      - Diferenciación real vs. percibida
      - Ventajas competitivas sostenibles
      - Estrategias para superar barreras
      
      TONO: Consultor senior crítico pero constructivo
      ENFOQUE: Analiza en relación a la IDEA específica, no al sector general
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private static async analyzeViability(data: BusinessData): Promise<string> {
    const prompt = `
      Analiza la VIABILIDAD de la idea: "${data.idea}"
      
      Enfócate en:
      - Modelo de negocio: ${data.businessModel}
      - Tipo de proyecto: ${data.projectType}
      - Recursos necesarios vs. disponibles
      - Timeline realista de ejecución
      
      TONO: Consultor senior crítico pero constructivo
      ENFOQUE: Analiza en relación a la IDEA específica, no al sector general
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private static async generateStrategicRecommendations(data: BusinessData): Promise<string> {
    const prompt = `
      Genera RECOMENDACIONES ESTRATÉGICAS para la idea: "${data.idea}"
      
      Enfócate en:
      - Próximos pasos críticos y prioritarios
      - Estrategias de validación de mercado
      - Enfoque de desarrollo y lanzamiento
      - Métricas de éxito y seguimiento
      
      TONO: Consultor senior crítico pero constructivo
      ENFOQUE: Basa las recomendaciones en la IDEA específica, no en el sector general
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // Helper methods for specific content generation
  static async generateBusinessSummary(data: BusinessData): Promise<string> {
    const deepAnalysis = await this.performDeepAnalysis(data);
    const dashboardContent = await this.createDashboardContent(deepAnalysis, data);
    return dashboardContent.businessSummary;
  }

  static async generateMarketSize(data: BusinessData): Promise<string> {
    const deepAnalysis = await this.performDeepAnalysis(data);
    const dashboardContent = await this.createDashboardContent(deepAnalysis, data);
    return dashboardContent.marketSize;
  }

  static async generateBrandSuggestions(data: BusinessData): Promise<{ names: string[], reasoning: string[] }> {
    try {
      console.log('🌟 Generating brand suggestions directly...');
      console.log('📊 Input data received:', {
        idea: data.idea,
        problem: data.problem,
        idealUser: data.idealUser,
        region: data.region,
        projectType: data.projectType
      });
      
      // Validate and provide default values for missing data
      const validatedData = {
        idea: data.idea || 'idea de negocio',
        problem: data.problem || 'problema a resolver',
        idealUser: data.idealUser || 'usuarios objetivo',
        region: data.region || 'región global',
        projectType: data.projectType || 'Other',
        alternatives: data.alternatives || 'alternativas existentes',
        businessModel: data.businessModel || 'modelo de negocio'
      };
      
      console.log('📊 Validated data for brand suggestions:', validatedData);
      
      // Test if AI is working at all with a simple call
      console.log('🧪 Testing AI connection with simple call...');
      console.log('🔑 Model being used:', model);
      console.log('🔑 Model type:', typeof model);
      console.log('🔑 Model methods available:', Object.getOwnPropertyNames(model));
      
      try {
        const testResult = await model.generateContent('Say "Hello" in Spanish');
        console.log('✅ generateContent call successful');
        
        const testResponse = await testResult.response;
        console.log('✅ response call successful');
        
        const testText = testResponse.text();
        console.log('✅ text() call successful');
        
        console.log('✅ AI test successful:', testText);
      } catch (testError) {
        console.error('❌ AI test failed:', testError);
        console.error('❌ Error details:', {
          name: testError instanceof Error ? testError.name : 'Unknown',
          message: testError instanceof Error ? testError.message : String(testError),
          stack: testError instanceof Error ? testError.stack : 'No stack trace'
        });
        throw new Error(`AI connection failed: ${testError}`);
      }
      
      // Add timestamp and random seed to ensure different results
      const timestamp = Date.now();
      const randomSeed = data.randomSeed ? Math.floor(data.randomSeed) : Math.floor(Math.random() * 1000);
      const regenerationAttempt = data.regenerationAttempt || 0;
      
      console.log('🌱 Using seed for brand generation:', randomSeed);
      console.log('🔄 Regeneration attempt:', regenerationAttempt);
      
      const prompt = `
        Eres un experto senior en naming y branding de startups con 15+ años de experiencia.
        
        IDEA: "${validatedData.idea}"
        PROBLEMA: "${validatedData.problem}"
        USUARIO: "${validatedData.idealUser}"
        REGIÓN: ${validatedData.region}
        TIPO: ${validatedData.projectType}
        
        TAREA: Crea 5 nombres de marca COMPLETAMENTE NUEVOS, únicos, creativos y memorables, cada uno con una explicación PERSONALIZADA y específica.
        
        IMPORTANTE: Esta es una regeneración (intento ${regenerationAttempt + 1}), por lo que DEBES generar nombres COMPLETAMENTE DIFERENTES a cualquier generación anterior.
        
        ESTRUCTURA CREATIVA REQUERIDA:
        - NOMBRE 1: Enfoque DESCRIPTIVO (describe la función o beneficio principal)
        - NOMBRE 2: Enfoque EMOCIONAL (evoca sentimientos o valores)
        - NOMBRE 3: Enfoque LINGÜÍSTICO (usa raíces griegas, latinas o del idioma local)
        - NOMBRE 4: Enfoque ABSTRACTO (palabra inventada o concepto único)
        - NOMBRE 5: Enfoque CULTURAL (inspirado en la cultura de ${validatedData.region})
        
        CRITERIOS PARA CADA NOMBRE:
        - Debe ser culturalmente apropiado para ${validatedData.region}
        - Debe reflejar la esencia específica de "${validatedData.idea}"
        - Debe ser memorable y fácil de pronunciar
        - Debe tener potencial de marca registrada
        - Debe ser COMPLETAMENTE DIFERENTE a los otros 4 nombres
        
        INSTRUCCIONES ESPECIALES PARA REGENERACIÓN:
        - Cada nombre debe usar una estrategia de naming DIFERENTE
        - Varía entre nombres cortos (2-4 letras) y largos (6-10 letras)
        - Considera diferentes idiomas o raíces lingüísticas apropiadas para ${validatedData.region}
        - Evita nombres genéricos como "Book", "Logo", "Reason" - sé más creativo
        - Para ecommerce de libros de filosofía, piensa en conceptos como: sabiduría, conocimiento, reflexión, pensamiento, etc.
        - REGENERACIÓN: Usa el seed ${randomSeed} para generar nombres completamente únicos
        - CREATIVIDAD: Sé más creativo y experimental en esta regeneración
        - DIVERSIDAD: Máxima diversidad en estilos, longitudes y enfoques
        
        FORMATO REQUERIDO:
        NOMBRES:
        [Nombre1, Nombre2, Nombre3, Nombre4, Nombre5]
        
        EXPLICACIONES:
        [Explicación1, Explicación2, Explicación3, Explicación4, Explicación5]
        
        TONO: Naming profesional - creativo pero estratégico
        ENFOQUE: Nombres de marca con justificación estratégica única
        VARIEDAD: Máxima diversidad y originalidad
        
        RECUERDA: 
        - Cada nombre debe ser ÚNICO y usar una estrategia DIFERENTE
        - Cada explicación debe ser PERSONALIZADA para ese nombre específico
        - Genera nombres que no se parezcan entre sí
        - Sé creativo y específico para "${validatedData.idea}"
        - REGENERACIÓN: Genera nombres completamente diferentes a cualquier generación anterior
        - JUSTIFICACIONES: Cada explicación debe ser única, detallada y específica para ese nombre
        - Timestamp: ${timestamp} - Random: ${randomSeed} - Attempt: ${regenerationAttempt + 1}
      `;
      
      console.log('📡 Making AI call to model.generateContent...');
      console.log('🔑 Using model:', model);
      console.log('🔑 Model type:', typeof model);
      console.log('🔑 Model methods:', Object.getOwnPropertyNames(model));
      console.log('📝 Prompt length:', prompt.length);
      console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');
      
      let text: string;
      try {
        const result = await model.generateContent(prompt);
        console.log('✅ generateContent call successful');
        
        const response = await result.response;
        console.log('✅ response call successful');
        
        text = response.text();
        console.log('✅ text() call successful');
        
        console.log('📄 AI Response for brand suggestions:', text);
        console.log('📏 Response length:', text.length);
      } catch (aiCallError) {
        console.error('❌ AI generateContent failed:', aiCallError);
        console.error('❌ AI call error details:', {
          name: aiCallError instanceof Error ? aiCallError.name : 'Unknown',
          message: aiCallError instanceof Error ? aiCallError.message : String(aiCallError),
          stack: aiCallError instanceof Error ? aiCallError.stack : 'No stack trace'
        });
        throw aiCallError;
      }
      
      // Extract names with better regex patterns - handle multiple formats
      console.log('🔍 Attempting to parse AI response...');
      
      // Try the expected format first: [name1, name2, name3]
      let namesMatch = text.match(/NOMBRES:\s*\[([^\]]+)\]/i);
      let reasoningMatch = text.match(/EXPLICACIONES:\s*\[([^\]]+)\]/i);
      
      if (namesMatch && reasoningMatch) {
        console.log('✅ Found expected format with brackets');
        const names = namesMatch[1].split(',').map((name: string) => name.trim().replace(/['"]/g, ''));
        const reasoning = reasoningMatch[1].split(',').map((reason: string) => reason.trim().replace(/['"]/g, ''));
        
        console.log('✅ Extracted names:', names);
        console.log('✅ Extracted reasoning:', reasoning);
        
        if (names.length === 5 && reasoning.length === 5) {
                 console.log('✅ SUCCESS: Brand suggestions generated successfully with AI!');
       console.log('🔍 Final AI-generated names:', names);
       console.log('🔍 Final AI-generated reasoning:', reasoning);
       console.log('🔍 Reasoning length:', reasoning.length);
       console.log('🔍 Names length:', names.length);
       return { names, reasoning };
        }
      }
      
      // Try alternative format: numbered list format
      console.log('🔍 Trying alternative numbered list format...');
      
      // Extract names from the numbered list - improved regex
      const nameLines = text.match(/^\d+\.\s*\*\*([^*]+)\*\*:/gm);
      if (nameLines && nameLines.length === 5) {
        console.log('✅ Found numbered list format for names');
        const names = nameLines.map((line: string) => {
          const match = line.match(/^\d+\.\s*\*\*([^*]+)\*\*:/);
          if (match && match[1]) {
            const name = match[1].trim();
            // Filter out any names that are just "nombre" or similar placeholder text
            if (name.toLowerCase() === 'nombre' || name.length < 3) {
              return '';
            }
            return name;
          }
          return '';
        }).filter(name => name.length > 0);
        
        // Extract reasoning from the numbered list
        const reasoningLines = text.split(/\d+\.\s*\*\*[^*]+\*\*:/).slice(1);
        const reasoning = reasoningLines.map((line: string) => {
          // Clean up the reasoning text
          return line
            .replace(/^\s*\([^)]+\)\s*/, '') // Remove (Enfoque: ...) part
            .trim()
            .split('\n')[0] // Take first line
            .trim();
        }).filter(reason => reason.length > 0);
        
        console.log('✅ Extracted names from numbered list:', names);
        console.log('✅ Extracted reasoning from numbered list:', reasoning);
        
        if (names.length === 5 && reasoning.length === 5) {
          console.log('✅ SUCCESS: Brand suggestions parsed from numbered list format!');
          // Final cleanup: ensure all names are properly trimmed and formatted
          const cleanNames = names.map(name => name.trim().replace(/['"]/g, ''));
          const cleanReasoning = reasoning.map(reason => reason.trim());
          return { names: cleanNames, reasoning: cleanReasoning };
        }
      }
      
      // Try simple name extraction as fallback
      console.log('🔍 Trying simple name extraction...');
      const simpleNames = text.match(/[A-Z][a-zA-Z]+(?:[A-Z][a-zA-Z]+)*/g);
      if (simpleNames && simpleNames.length >= 5) {
        console.log('✅ Found simple names:', simpleNames);
        // Take first 5 names that look like brand names
        const names = simpleNames
          .filter(name => {
            // Filter out placeholder text and ensure proper length
            const cleanName = name.trim();
            return cleanName.length > 3 && 
                   cleanName.length < 15 && 
                   cleanName.toLowerCase() !== 'nombre' &&
                   cleanName.toLowerCase() !== 'nombres' &&
                   cleanName.toLowerCase() !== 'explicaciones';
          })
          .slice(0, 5)
          .map(name => name.trim()); // Ensure no extra spaces
        
        if (names.length === 5) {
          // Generate simple reasoning for each name
          const reasoning = names.map(name => 
            `Nombre estratégicamente seleccionado por IA basado en tu idea de negocio "${data.idea}" y mercado objetivo.`
          );
          
          console.log('✅ SUCCESS: Brand suggestions extracted with simple parsing!');
          // Final cleanup: ensure all names are properly trimmed and formatted
          const cleanNames = names.map(name => name.trim().replace(/['"]/g, ''));
          const cleanReasoning = reasoning.map(reason => reason.trim());
          return { names: cleanNames, reasoning: cleanReasoning };
        }
      }
      
             console.warn('⚠️ WARNING: All parsing methods failed, using fallback');
       console.warn('⚠️ Raw response:', text.substring(0, 300) + '...');
       
       console.log('🔄 Using fallback content due to parsing failure');
       
       // Try one more time with a simpler prompt before falling back
       try {
         console.log('🔄 Attempting one more AI generation with simpler prompt...');
         const simplePrompt = `
           Genera 5 nombres de marca para: "${data.idea}"
           
           FORMATO:
           NOMBRES: [Nombre1, Nombre2, Nombre3, Nombre4, Nombre5]
           EXPLICACIONES: [Explicación1, Explicación2, Explicación3, Explicación4, Explicación5]
         `;
         
         const simpleResult = await model.generateContent(simplePrompt);
         const simpleResponse = await simpleResult.response;
         const simpleText = simpleResponse.text();
         
         const simpleNamesMatch = simpleText.match(/NOMBRES:\s*\[([^\]]+)\]/i);
         const simpleReasoningMatch = simpleText.match(/EXPLICACIONES:\s*\[([^\]]+)\]/i);
         
         if (simpleNamesMatch && simpleReasoningMatch) {
           const names = simpleNamesMatch[1].split(',').map((name: string) => name.trim().replace(/['"]/g, ''));
           const reasoning = simpleReasoningMatch[1].split(',').map((reason: string) => reason.trim().replace(/['"]/g, ''));
           
           if (names.length === 5 && reasoning.length === 5) {
             console.log('✅ SUCCESS: Brand suggestions generated with simple prompt!');
             console.log('🔍 Simple prompt names:', names);
             console.log('🔍 Simple prompt reasoning:', reasoning);
             return { names, reasoning };
           }
         }
       } catch (simpleError) {
         console.error('❌ Simple prompt also failed:', simpleError);
       }
       
       // Final fallback with reasoning - more creative and varied
       const fallbackNames = this.generateCreativeFallbackNames(data);
       const fallbackReasoning = this.generateCreativeFallbackReasoning(data, fallbackNames);
       
       console.log('⚠️ FALLBACK: Using creative fallback data instead of AI-generated content');
       return { names: fallbackNames, reasoning: fallbackReasoning };
      
    } catch (error) {
      console.error('❌ Error generating brand suggestions:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Fallback with reasoning - more creative and varied
      const fallbackNames = this.generateCreativeFallbackNames(data);
      const fallbackReasoning = this.generateCreativeFallbackReasoning(data, fallbackNames);
      
      console.log('⚠️ FALLBACK: Using creative fallback data due to AI error');
      return { names: fallbackNames, reasoning: fallbackReasoning };
    }
  }

     static async generateRecommendedTools(data: BusinessData): Promise<Array<{
     category: string;
     items: Array<{
       name: string;
       description: string;
       url: string;
     }>;
   }>> {
     // Always return fixed tools for affiliate link consistency
     return this.getFixedRecommendedTools();
   }

  static async generateActionPlan(data: BusinessData): Promise<string[]> {
    const deepAnalysis = await this.performDeepAnalysis(data);
    const dashboardContent = await this.createDashboardContent(deepAnalysis, data);
    return dashboardContent.actionPlan;
  }

  static async generateMarketResearch(data: BusinessData): Promise<{
    searchTerms: string[];
    validationTopics: string[];
    researchMethods: string[];
  }> {
    const deepAnalysis = await this.performDeepAnalysis(data);
    const dashboardContent = await this.createDashboardContent(deepAnalysis, data);
    return dashboardContent.marketResearch;
  }

  // Fallback methods
  private static getFallbackDeepAnalysis(data: BusinessData): string {
    return `ANÁLISIS DE LA IDEA DE NEGOCIO: "${data.idea}"

    IDEA PRINCIPAL: Tu idea de "${data.idea}" es el elemento central de este análisis. Esta idea específica presenta tanto oportunidades como desafíos significativos que requieren análisis cuidadoso. La propuesta de valor debe ser claramente diferenciadora para capturar mercado en un sector que puede estar saturado.

    PROBLEMA A RESOLVER: El problema que identificaste "${data.problem}" es fundamental para entender la viabilidad de tu idea. Esta idea específica enfrenta competencia establecida y barreras de entrada que pueden requerir más recursos de los que tienes disponibles.

    USUARIO IDEAL: Tu usuario ideal "${data.idealUser}" en ${data.region} es clave para el análisis. El mercado para proyectos tipo ${data.projectType} en ${data.region} muestra un panorama mixto, con competencia establecida que tiene ventajas considerables.

    ANÁLISIS DE COMPETENCIA: Para esta idea específica, la competencia en ${data.region} presenta barreras de entrada que incluyen costos de adquisición de clientes, regulaciones específicas, y la necesidad de diferenciación clara. El tamaño real del mercado disponible para nuevos entrantes puede ser sustancialmente menor de lo que inicialmente parece.

    ALTERNATIVAS EXISTENTES: Con las alternativas existentes (${data.alternatives}), es crucial validar la demanda real antes de comprometer inversiones significativas. Esta idea específica puede requerir más capital inicial y tiempo de desarrollo del que tienes disponible.

    MODELO DE NEGOCIO: Tu modelo de negocio (${data.businessModel}) es fundamental para la viabilidad. Para diferenciar esta idea en el mercado competitivo, necesitarás desarrollar una propuesta de valor única que resuelva problemas específicos que los competidores no están abordando.

    PLAN DE ACCIÓN: Tu plan de acción debe comenzar con validación rigurosa de la demanda del mercado para esta idea específica, seguida por el desarrollo de un MVP que resuelva problemas específicos identificados. Las estrategias de marketing deben ser diferenciadas para el mercado específico de ${data.region}.

    HERRAMIENTAS Y RECURSOS: Las herramientas recomendadas deben incluir soluciones de análisis de mercado, gestión de proyectos, y comunicación con clientes, específicamente adaptadas a las necesidades de esta idea. Es esencial implementar métricas de seguimiento relevantes para tu idea específica.

    RIESGOS Y MITIGACIÓN: Los riesgos principales para esta idea incluyen subestimar la competencia, sobreestimar la demanda del mercado, y no tener suficientes recursos para el desarrollo y lanzamiento. La mitigación requiere investigación exhaustiva, validación constante, y un enfoque iterativo.

    CONCLUSIÓN: Mientras que tu idea específica "${data.idea}" tiene potencial en ${data.region}, la viabilidad depende de tu capacidad para diferenciarte significativamente, validar la demanda real, y tener los recursos necesarios para superar las barreras de entrada.`;
  }

     static getFallbackDashboardContent(data: BusinessData): GeneratedContent {
     // Generate creative fallback names and reasoning instead of generic ones
     const fallbackNames = this.generateCreativeFallbackNames(data);
     const fallbackReasoning = this.generateCreativeFallbackReasoning(data, fallbackNames);
     
     return {
       businessSummary: this.getFallbackDeepAnalysis(data).split('\n\n')[0] + '\n\n' + this.getFallbackDeepAnalysis(data).split('\n\n')[1],
       marketSize: this.getFallbackDeepAnalysis(data).split('\n\n')[2] + '\n\n' + this.getFallbackDeepAnalysis(data).split('\n\n')[3],
       brandSuggestions: fallbackNames,
       brandReasoning: fallbackReasoning,
       recommendedTools: this.getFixedRecommendedTools(),
      actionPlan: [
        `Validar la demanda real de tu idea "${data.idea}" en ${data.region} mediante investigación de mercado rigurosa`,
        `Desarrollar un MVP mínimo viable que resuelva los problemas específicos identificados para tu idea "${data.idea}"`,
        `Crear estrategias de marketing diferenciadas específicamente para tu idea "${data.idea}" en el mercado de ${data.region}`,
        `Configurar sistemas operativos adaptados específicamente a las necesidades de tu idea "${data.idea}"`,
        `Implementar métricas de seguimiento relevantes específicamente para tu idea "${data.idea}" y objetivos`,
        `Establecer procesos de iteración basados en feedback real del mercado para tu idea "${data.idea}"`
      ],
      marketResearch: {
        searchTerms: [
          `${data.projectType} mercado ${data.region} 2024`,
          `tendencias ${data.projectType} ${data.region}`,
          `competencia ${data.projectType} ${data.region}`,
          `startup funding ${data.region}`,
          `emprendimiento digital ${data.region}`
        ],
        validationTopics: [
          'Crecimiento del mercado digital en Latinoamérica',
          'Adopción de tecnología en pequeñas empresas',
          'Tendencias de trabajo remoto y freelancing',
          'Inversión en startups tecnológicas'
        ],
        researchMethods: [
          'Análisis de Google Trends por región y sector',
          'Auditoría de sitios web de competidores',
          'Análisis de sentimiento en redes sociales',
          'Encuestas online con herramientas como Typeform',
          'Análisis de métricas de mercado con SEMrush',
          'Entrevistas con usuarios potenciales del sector'
        ]
      }
    };
  }

  // Validate and enhance preview content
  private static validateAndEnhancePreviewContent(parsed: any, data: BusinessData): any {
    const validated: any = { ...parsed };
    
    // Ensure all required fields exist and are substantial
    if (!validated.executiveSummary || validated.executiveSummary.length < 100) {
      validated.executiveSummary = `Tu idea "${data.idea}" aborda el problema específico de "${data.problem}" para ${data.idealUser} en ${data.region}. El modelo de negocio ${data.businessModel} es apropiado para este tipo de ${data.projectType}. Las alternativas existentes (${data.alternatives}) representan tanto competencia como validación del mercado. Esta idea tiene potencial significativo si se ejecuta correctamente.`;
    }
    
    if (!validated.strongPoint || validated.strongPoint.length < 50) {
      validated.strongPoint = `Tu enfoque específico en ${data.region} y la claridad del problema que resuelves es una fortaleza clave. La combinación de idea bien definida con usuario objetivo específico muestra pensamiento estratégico sólido.`;
    }
    
    if (!validated.criticalRisks || !Array.isArray(validated.criticalRisks) || validated.criticalRisks.length === 0) {
      validated.criticalRisks = [
        `Competencia establecida: Las alternativas existentes (${data.alternatives}) pueden tener ventajas de mercado que requieren diferenciación clara.`,
        `Validación de mercado: Necesitas confirmar que ${data.idealUser} realmente pagará por esta solución en ${data.region}.`,
        `Modelo de negocio: El modelo ${data.businessModel} debe validarse con usuarios reales antes de escalar.`
      ];
    }
    
    if (!validated.actionableRecommendation || validated.actionableRecommendation.length < 50) {
      validated.actionableRecommendation = `Antes de construir el MVP, entrevista a 3-5 usuarios objetivo reales para confirmar: 1) Qué problemas específicos realmente les duelen, 2) Qué los convencería de cambiar de ${data.alternatives}, 3) Cuánto están dispuestos a pagar. Esto te dará la validación necesaria para proceder con confianza.`;
    }
    
    return validated;
  }

  // Fallback preview content
  private static getFallbackPreviewContent(data: BusinessData): any {
    return {
      executiveSummary: `Tu idea "${data.idea}" está bien enfocada y aborda un problema específico. El problema "${data.problem}" es concreto y relevante para ${data.idealUser} en ${data.region}. Sin embargo, necesitamos validar mejor la diferenciación de las alternativas existentes (${data.alternatives}) y confirmar que el modelo de negocio ${data.businessModel} es el más adecuado para este ${data.projectType}.`,
      strongPoint: `Tu enfoque en ${data.region} y la claridad del problema que resuelves es prometedor. La combinación de idea específica con usuario bien definido muestra que has pensado en la ejecución.`,
      criticalRisks: [
        `Competencia fuerte: Las alternativas existentes (${data.alternatives}) pueden tener ventajas establecidas que requieren una diferenciación clara.`,
        `Validación de mercado: Necesitas confirmar que ${data.idealUser} realmente está dispuesto a pagar por esta solución y que puede cambiar de ${data.alternatives}.`
      ],
      actionableRecommendation: `Antes de construir el MVP, entrevista a 3-5 usuarios objetivo reales para confirmar: 1) Qué problemas específicos realmente les duelen, 2) Qué los convencería de cambiar de ${data.alternatives}, 3) Cuánto están dispuestos a pagar. Esto te dará la validación necesaria para proceder con confianza.`
    };
  }

  // Fallback preview content with external data
  static getFallbackPreviewContentWithExternalData(data: BusinessData, externalData: CompetitiveIntelligence): any {
    return {
      executiveSummary: `Tu idea "${data.idea}" está bien enfocada y aborda un problema específico. El problema "${data.problem}" es concreto y relevante para ${data.idealUser} en ${data.region}. Análisis de competencia revela ${externalData.competitors.length} alternativas principales, con ${externalData.competitors.filter(c => c.funding?.totalRaised !== 'Unknown').length} competidores bien financiados. El mercado ${data.projectType} en ${data.region} tiene un tamaño estimado de ${externalData.marketSize.totalAddressableMarket}.`,
      strongPoint: `Tu enfoque en ${data.region} y la claridad del problema que resuelves es prometedor. Los datos de mercado muestran tendencias ${externalData.marketTrends[0]?.trend} para términos relacionados, indicando oportunidad de mercado.`,
      criticalRisks: [
        `Competencia financiada: ${externalData.competitors.filter(c => c.funding?.totalRaised !== 'Unknown').length} competidores tienen capital significativo, requiriendo diferenciación clara.`,
        `Presencia de mercado: ${externalData.competitors.filter(c => c.traffic?.monthlyVisits && c.traffic.monthlyVisits > 100000).length} competidores tienen alto tráfico web, indicando mercado establecido.`
      ],
      actionableRecommendation: `Basándote en los datos de competencia, antes del MVP: 1) Analiza las tecnologías usadas por competidores (${externalData.competitors[0]?.technologies?.slice(0, 3).join(', ')}), 2) Valida tendencias de mercado en Google Trends para "${data.idea}", 3) Entrevista usuarios reales para confirmar disposición a pagar.`
    };
  }

  // Fallback methods for preview content
  private static getFallbackExecutiveSummary(data: BusinessData): string {
    return `Análisis ejecutivo de "${data.idea}": Tu idea aborda un problema real en ${data.region} con un enfoque ${data.businessModel}. El usuario objetivo está bien definido, pero necesitamos validar la diferenciación de las alternativas existentes. El modelo de negocio ${data.businessModel} es apropiado para este tipo de proyecto.`;
  }

  private static getFallbackStrongPoint(data: BusinessData): string {
    return `Validación prometedora: Tu enfoque en ${data.region} con el modelo ${data.businessModel} muestra comprensión del mercado local. La definición del problema y usuario ideal es clara y accionable.`;
  }

  private static getFallbackCriticalRisks(data: BusinessData): string[] {
    return [
      'Necesitamos validar la diferenciación real de las alternativas existentes',
      'Falta análisis detallado de la competencia y posicionamiento en el mercado'
    ];
  }

  private static getFallbackActionableRecommendation(data: BusinessData): string {
    return `Recomendación: Antes de proceder, investiga profundamente a tus competidores directos en ${data.region}, identifica tu propuesta de valor única, y valida que tu modelo ${data.businessModel} resuelva realmente el problema de tu usuario ideal.`;
  }

  // Enhanced fallback methods for preview content
  private static getEnhancedFallbackExecutiveSummary(data: BusinessData, competitiveIntelligence: any): string {
    if (competitiveIntelligence && competitiveIntelligence.competitors && competitiveIntelligence.competitors.length > 0) {
      const competitorNames = competitiveIntelligence.competitors.slice(0, 3).map((c: any) => c.name).join(', ');
      return `Análisis ejecutivo de "${data.idea}": Tu idea aborda un problema real en ${data.region} con un enfoque ${data.businessModel}. El análisis de competencia revela que ${competitorNames} operan en este espacio, pero tu diferenciación en ${data.projectType} muestra potencial. El modelo de negocio ${data.businessModel} es estratégicamente sólido para este mercado.`;
    }
    return `Análisis ejecutivo de "${data.idea}": Tu idea aborda un problema real en ${data.region} con un enfoque ${data.businessModel}. El usuario objetivo está bien definido, pero necesitamos validar la diferenciación de las alternativas existentes. El modelo de negocio ${data.businessModel} es apropiado para este tipo de proyecto.`;
  }

  private static getEnhancedFallbackStrongPoint(data: BusinessData, competitiveIntelligence: any): string {
    if (competitiveIntelligence && competitiveIntelligence.marketSize) {
      return `Validación prometedora: Tu enfoque en ${data.region} con el modelo ${data.businessModel} muestra comprensión del mercado local. El análisis de competencia confirma que hay espacio para diferenciación en ${data.projectType}, y tu definición del problema y usuario ideal es clara y accionable.`;
    }
    return `Validación prometedora: Tu enfoque en ${data.region} con el modelo ${data.businessModel} muestra comprensión del mercado local. La definición del problema y usuario ideal es clara y accionable.`;
  }

  private static getEnhancedFallbackCriticalRisks(data: BusinessData, competitiveIntelligence: any): string[] {
    const risks = [];
    if (competitiveIntelligence && competitiveIntelligence.competitors && competitiveIntelligence.competitors.length > 0) {
      risks.push('Necesitamos validar la diferenciación real de competidores establecidos en el mercado');
    } else {
      risks.push('Necesitamos validar la diferenciación real de las alternativas existentes');
    }
    risks.push('Falta análisis detallado de la competencia y posicionamiento en el mercado');
    if (competitiveIntelligence && competitiveIntelligence.marketSize) {
      risks.push('Requiere validación del tamaño real del mercado objetivo');
    }
    return risks;
  }

  private static getEnhancedFallbackActionableRecommendation(data: BusinessData, competitiveIntelligence: any): string {
    if (competitiveIntelligence && competitiveIntelligence.competitors && competitiveIntelligence.competitors.length > 0) {
      const competitorNames = competitiveIntelligence.competitors.slice(0, 2).map((c: any) => c.name).join(' y ');
      return `Recomendación: Antes de proceder, investiga profundamente a ${competitorNames} en ${data.region}, identifica tu propuesta de valor única en ${data.projectType}, y valida que tu modelo ${data.businessModel} resuelva realmente el problema de tu usuario ideal.`;
    }
    return `Recomendación: Antes de proceder, investiga profundamente a tus competidores directos en ${data.region}, identifica tu propuesta de valor única, y valida que tu modelo ${data.businessModel} resuelva realmente el problema de tu usuario ideal.`;
  }

  private static getEnhancedFallbackPreviewContent(data: BusinessData, competitiveIntelligence: any, brandData: any): any {
    // Sanitize competitive intelligence data to prevent React rendering errors
    const sanitizedCompetitiveIntelligence = this.sanitizeCompetitiveIntelligence(competitiveIntelligence);
    
    const result = {
      executiveSummary: this.getEnhancedFallbackExecutiveSummary(data, sanitizedCompetitiveIntelligence),
      strongPoint: this.getEnhancedFallbackStrongPoint(data, sanitizedCompetitiveIntelligence),
      criticalRisks: this.getEnhancedFallbackCriticalRisks(data, sanitizedCompetitiveIntelligence),
      actionableRecommendation: this.getEnhancedFallbackActionableRecommendation(data, sanitizedCompetitiveIntelligence),
      externalData: sanitizedCompetitiveIntelligence,
      dataBackedInsights: !!sanitizedCompetitiveIntelligence,
      brandSuggestions: brandData?.names || [],
      brandReasoning: brandData?.reasoning || []
    };
    
    console.log('🔍 getEnhancedFallbackPreviewContent - brandData received:', brandData);
    console.log('🔍 getEnhancedFallbackPreviewContent - result.brandSuggestions:', result.brandSuggestions);
    console.log('🔍 getEnhancedFallbackPreviewContent - result.brandReasoning:', result.brandReasoning);
    
    return result;
  }

  // Clean and sanitize competitive intelligence data for React rendering
  private static sanitizeCompetitiveIntelligence(data: any): any {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const sanitized: any = {};

         // Clean competitors array
     if (Array.isArray(data.competitors)) {
       sanitized.competitors = data.competitors.map((competitor: any) => ({
         name: competitor.name || 'Competidor',
         website: competitor.website || '',
         description: competitor.description || 'Descripción del competidor no disponible',
         funding: competitor.funding ? {
           totalRaised: competitor.funding.totalRaised || 'Unknown',
           lastRound: competitor.funding.lastRound || 'Unknown',
           investors: Array.isArray(competitor.funding.investors) ? competitor.funding.investors : []
         } : undefined,
         metrics: competitor.metrics ? {
           employees: competitor.metrics.employees || 'Unknown',
           founded: competitor.metrics.founded || 'Unknown',
           industry: competitor.metrics.industry || 'Unknown'
         } : undefined,
         traffic: competitor.traffic ? {
           monthlyVisits: typeof competitor.traffic.monthlyVisits === 'number' ? competitor.traffic.monthlyVisits.toLocaleString() : 'Unknown',
           globalRank: typeof competitor.traffic.globalRank === 'number' ? competitor.traffic.globalRank.toLocaleString() : 'Unknown',
           categoryRank: typeof competitor.traffic.categoryRank === 'number' ? competitor.traffic.categoryRank.toLocaleString() : 'Unknown'
         } : undefined,
         technologies: Array.isArray(competitor.technologies) ? competitor.technologies : []
       }));
     }

    // Clean market trends
    if (Array.isArray(data.marketTrends)) {
      sanitized.marketTrends = data.marketTrends.map((trend: any) => ({
        keyword: trend.keyword || 'Keyword',
        trend: trend.trend || 'stable',
        growthRate: typeof trend.growthRate === 'number' ? trend.growthRate.toFixed(1) + '%' : 'Unknown',
        relatedQueries: Array.isArray(trend.relatedQueries) ? trend.relatedQueries : []
      }));
    }

    // Clean market size
    if (data.marketSize) {
      sanitized.marketSize = {
        totalAddressableMarket: data.marketSize.totalAddressableMarket || 'Unknown',
        serviceableAddressableMarket: data.marketSize.serviceableAddressableMarket || 'Unknown',
        serviceableObtainableMarket: data.marketSize.serviceableObtainableMarket || 'Unknown'
      };
    }

    // Clean insights
    if (data.insights) {
      sanitized.insights = {
        competitiveAdvantages: Array.isArray(data.insights.competitiveAdvantages) ? data.insights.competitiveAdvantages : [],
        marketOpportunities: Array.isArray(data.insights.marketOpportunities) ? data.insights.marketOpportunities : [],
        risks: Array.isArray(data.insights.risks) ? data.insights.risks : [],
        strategicRecommendations: Array.isArray(data.insights.strategicRecommendations) ? data.insights.strategicRecommendations : []
      };
    }

    // Copy other properties
    if (data.intelligentlySearched !== undefined) {
      sanitized.intelligentlySearched = data.intelligentlySearched;
    }
    if (data.searchQueries) {
      sanitized.searchQueries = Array.isArray(data.searchQueries) ? data.searchQueries : [];
    }

    return sanitized;
  }

  // Helper method to generate creative fallback names based on business data
  private static generateCreativeFallbackNames(data: BusinessData): string[] {
    const { idea, projectType, region } = data;
    
    // Generate names based on project type and idea
    if (projectType === 'Ecommerce' && idea.toLowerCase().includes('filosofía')) {
      return [
        'SophiaSage',      // Descriptive: combines wisdom (Sophia) with sage
        'MenteClara',      // Emotional: clear mind concept
        'Phronesis',       // Linguistic: Greek word for practical wisdom
        'Lumivox',         // Abstract: invented word combining light and voice
        'SabiduríaViva'    // Cultural: wisdom alive in Spanish
      ];
    } else if (projectType === 'SaaS') {
      return [
        'FlowLogic',       // Descriptive: describes the flow of logic
        'PulseCore',       // Emotional: evokes energy and centrality
        'NexusTech',       // Linguistic: Latin root for connection
        'Zentrix',         // Abstract: invented word suggesting centrality
        'TechFlow'         // Cultural: tech flow concept
      ];
    } else if (projectType === 'Physical Product') {
      return [
        'CraftCore',       // Descriptive: core of craftsmanship
        'Vitality',        // Emotional: evokes life and energy
        'InnovateLab',     // Linguistic: laboratory of innovation
        'QuantumCraft',    // Abstract: quantum + craft
        'MakerSpace'       // Cultural: maker culture
      ];
    } else if (projectType === 'Service') {
      return [
        'ExpertFlow',      // Descriptive: flow of expertise
        'TrustBridge',     // Emotional: builds trust
        'ConsultPro',      // Linguistic: professional consultation
        'SynergyHub',      // Abstract: synergy + hub
        'ServiceCore'      // Cultural: service at the core
      ];
    } else {
      // Generic creative names
      return [
        'VisionCraft',     // Descriptive: crafting vision
        'Momentum',        // Emotional: forward movement
        'InnovateHub',     // Linguistic: hub of innovation
        'QuantumFlow',     // Abstract: quantum + flow
        'FutureCore'       // Cultural: core of the future
      ];
    }
  }

  // Helper method to generate creative fallback reasoning based on business data
  private static generateCreativeFallbackReasoning(data: BusinessData, names: string[]): string[] {
    const { idea, problem, idealUser, projectType, region } = data;
    
    if (projectType === 'Ecommerce' && idea.toLowerCase().includes('filosofía')) {
      return [
        `"${names[0]}" combina "Sophia" (sabiduría en griego) con "Sage" (sabio), perfecto para resolver el problema de "${problem}" que enfrentan ${idealUser} en ${region}, transmitiendo conocimiento ancestral de manera accesible.`,
        `"${names[1]}" evoca la claridad mental que buscan los lectores de filosofía para resolver "${problem}", sugiriendo que tus libros ayudan a pensar con mayor lucidez y encontrar soluciones prácticas.`,
        `"${names[2]}" es la palabra griega para "sabiduría práctica", conectando directamente con el valor que ofrecen los libros de filosofía para resolver "${problem}" de manera concreta y aplicable.`,
        `"${names[3]}" es una palabra inventada que combina "lumen" (luz) y "vox" (voz), sugiriendo que tus libros iluminan el pensamiento de ${idealUser} para resolver "${problem}" con mayor claridad.`,
        `"${names[4]}" en español transmite que la sabiduría está viva y activa, perfecto para el mercado hispanohablante de ${region} que busca resolver "${problem}" con conocimiento filosófico aplicado.`
      ];
    } else if (projectType === 'Ecommerce' && (idea.toLowerCase().includes('parches') || idea.toLowerCase().includes('pines'))) {
      return [
        `"${names[0]}" combina "Craft" (artesanía) con "Core" (núcleo), sugiriendo que tu tienda es el centro de la artesanía de parches y pines, donde ${idealUser} encuentran productos únicos y hechos a mano en ${region}.`,
        `"${names[1]}" evoca la energía vital y la fuerza que tus parches y pines aportan a la vida de ${idealUser}, siendo una fuente de expresión personal y creatividad que resuelve "${problem}".`,
        `"${names[2]}" sugiere un laboratorio de innovación, ideal para productos que rompen moldes y resuelven "${problem}" de manera creativa para ${idealUser} en ${region}, siendo pioneros en diseño.`,
        `"${names[3]}" combina "Quantum" con "Craft", sugiriendo que tus parches y pines están en la vanguardia de la innovación para resolver "${problem}" con tecnología avanzada y artesanía tradicional.`,
        `"${names[4]}" conecta con la cultura maker, sugiriendo que tu tienda es parte de un movimiento creativo que resuelve "${problem}" de manera colaborativa para ${idealUser}, siendo el espacio donde se reúnen los creadores.`
      ];
    } else if (projectType === 'SaaS') {
      return [
        `"${names[0]}" describe perfectamente cómo tu software maneja la lógica de flujo de trabajo para resolver "${problem}", ideal para ${idealUser} que necesitan herramientas de productividad específicas en ${region}.`,
        `"${names[1]}" sugiere que tu SaaS es el núcleo energético que impulsa los procesos de ${idealUser} para resolver "${problem}", siendo el centro de su flujo de trabajo diario.`,
        `"${names[2]}" usa raíces latinas para conectar tecnología con conexiones, perfecto para software que conecta a ${idealUser} con soluciones para "${problem}" en ${region}.`,
        `"${names[3]}" es una palabra inventada que sugiere centralidad y tecnología, ideal para plataformas SaaS que centralizan la solución a "${problem}" para ${idealUser}.`,
        `"${names[4]}" combina tecnología con flujo, sugiriendo que tu software optimiza procesos de manera fluida para resolver "${problem}" que enfrentan ${idealUser} en ${region}.`
      ];
    } else if (projectType === 'Physical Product') {
      return [
        `"${names[0]}" enfatiza que tu producto es el núcleo de la artesanía, perfecto para resolver "${problem}" con productos hechos a mano que ${idealUser} en ${region} valoran por su calidad y autenticidad.`,
        `"${names[1]}" evoca la energía vital y la fuerza que tu producto aporta a la vida de ${idealUser} para resolver "${problem}", siendo una fuente de energía y motivación.`,
        `"${names[2]}" sugiere un laboratorio de innovación, ideal para productos que rompen moldes y resuelven "${problem}" de manera creativa para ${idealUser} en ${region}.`,
        `"${names[3]}" combina "quantum" con "craft", sugiriendo que tu producto está en la vanguardia de la innovación para resolver "${problem}" con tecnología avanzada y artesanía.`,
        `"${names[4]}" conecta con la cultura maker, sugiriendo que tu producto es parte de un movimiento creativo que resuelve "${problem}" de manera colaborativa para ${idealUser}.`
      ];
    } else if (projectType === 'Service') {
      return [
        `"${names[0]}" describe cómo tu servicio fluye de manera experta para resolver "${problem}", sugiriendo eficiencia y conocimiento especializado que ${idealUser} en ${region} necesitan para superar sus desafíos.`,
        `"${names[1]}" construye confianza desde el nombre, esencial para servicios de consultoría que resuelven "${problem}" complejos que ${idealUser} enfrentan, creando un puente de confianza.`,
        `"${names[2]}" enfatiza el aspecto profesional de tu servicio de consultoría para resolver "${problem}", posicionándote como experto que ${idealUser} en ${region} pueden confiar.`,
        `"${names[3]}" sugiere que tu servicio es un centro de sinergias y colaboraciones para resolver "${problem}", conectando a ${idealUser} con soluciones integradas en ${region}.`,
        `"${names[4]}" posiciona el servicio como el núcleo de tu propuesta de valor para resolver "${problem}", siendo el centro de todas las soluciones que ofreces a ${idealUser}.`
      ];
    } else {
      // Generic creative reasoning with specific business context
      return [
        `"${names[0]}" sugiere que ayudas a ${idealUser} a crear y materializar su visión de resolver "${problem}" de manera artesanal, siendo el artesano de soluciones en ${region}.`,
        `"${names[1]}" evoca el impulso hacia adelante y la energía que tu negocio aporta al mercado de ${region} para resolver "${problem}", siendo la fuerza motriz del cambio.`,
        `"${names[2]}" posiciona tu empresa como el centro de innovación en tu sector para resolver "${problem}", siendo el hub donde ${idealUser} encuentran soluciones innovadoras.`,
        `"${names[3]}" combina "quantum" con "flow", sugiriendo que estás en la vanguardia del cambio para resolver "${problem}" con tecnología de punta para ${idealUser} en ${region}.`,
        `"${names[4]}" sugiere que tu empresa es el núcleo del futuro en tu industria para resolver "${problem}", siendo la base sobre la cual ${idealUser} construyen su futuro en ${region}.`
      ];
    }
  }

  // Helper methods to generate realistic traffic data
  private static generateRealisticTrafficData(projectType: string, competitorIndex: number): number {
    // Base traffic varies by project type
    const baseTraffic = {
      'SaaS': 25000,
      'Ecommerce': 50000,
      'Physical Product': 15000,
      'Service': 8000
    };
    
    const base = baseTraffic[projectType as keyof typeof baseTraffic] || 20000;
    
    // Vary traffic based on competitor position (index 0 = market leader)
    const multiplier = competitorIndex === 0 ? 1.0 : 0.3 + (0.7 * (1 / (competitorIndex + 1)));
    
    // Add some randomness to make it more realistic
    const randomFactor = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
    
    return Math.round(base * multiplier * randomFactor);
  }

  private static generateRealisticGlobalRank(projectType: string, competitorIndex: number): number {
    // Base ranking varies by project type
    const baseRank = {
      'SaaS': 80000,
      'Ecommerce': 120000,
      'Physical Product': 150000,
      'Service': 200000
    };
    
    const base = baseRank[projectType as keyof typeof baseRank] || 100000;
    
    // Vary ranking based on competitor position
    const multiplier = competitorIndex === 0 ? 1.0 : 1.5 + (competitorIndex * 0.3);
    
    // Add some randomness
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    
    return Math.round(base * multiplier * randomFactor);
  }

     private static generateRealisticCategoryRank(projectType: string, competitorIndex: number): number {
     // Base category ranking varies by project type
     const baseCategoryRank = {
       'SaaS': 800,
       'Ecommerce': 1200,
       'Physical Product': 1500,
       'Service': 2000
     };
     
     const base = baseCategoryRank[projectType as keyof typeof baseCategoryRank] || 1000;
     
     // Vary category ranking based on competitor position
     const multiplier = competitorIndex === 0 ? 1.0 : 1.2 + (competitorIndex * 0.2);
     
     // Add some randomness
     const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
     
     return Math.round(base * multiplier * randomFactor);
   }

   // Generate competitor descriptions for fallback content
   private static generateCompetitorDescription(name: string, data: BusinessData, index: number): string {
     const { idea, projectType, region, businessModel } = data;
     
     if (projectType === 'Ecommerce' && idea.toLowerCase().includes('filosofía')) {
       const descriptions = [
         `Empresa establecida que vende libros de filosofía online en ${region}, con enfoque en autores clásicos y contemporáneos.`,
         `Plataforma de ecommerce especializada en literatura filosófica, ofreciendo títulos raros y ediciones especiales.`,
         `Tienda online de libros de filosofía con servicio de suscripción mensual y recomendaciones personalizadas.`
       ];
       return descriptions[index] || descriptions[0];
     } else if (projectType === 'SaaS') {
       const descriptions = [
         `Plataforma SaaS líder en ${region} que ofrece soluciones similares a "${idea}" con base de usuarios establecida.`,
         `Software empresarial que compite directamente en el espacio de "${idea}" con integraciones avanzadas.`,
         `Herramienta SaaS emergente que está ganando tracción en el mercado de "${idea}" en ${region}.`
       ];
       return descriptions[index] || descriptions[0];
     } else if (projectType === 'Physical Product') {
       const descriptions = [
         `Fabricante establecido de productos físicos en el sector de "${idea}" con distribución en ${region}.`,
         `Empresa local que produce alternativas a "${idea}" con enfoque en calidad artesanal.`,
         `Startup emergente que está innovando en el espacio de productos físicos para "${idea}".`
       ];
       return descriptions[index] || descriptions[0];
     } else if (projectType === 'Service') {
       const descriptions = [
         `Proveedor de servicios establecido que ofrece soluciones similares a "${idea}" en ${region}.`,
         `Consultoría especializada en el sector de "${idea}" con clientes corporativos.`,
         `Servicio boutique que se enfoca en nichos específicos del mercado de "${idea}".`
       ];
       return descriptions[index] || descriptions[0];
     } else {
       const descriptions = [
         `Competidor principal en el mercado de "${idea}" en ${region} con presencia establecida.`,
         `Alternativa emergente que está ganando participación en el sector de "${idea}".`,
         `Empresa establecida que ofrece soluciones complementarias a "${idea}".`
       ];
       return descriptions[index] || descriptions[0];
     }
   }

   // Helper method to get FIXED recommended tools for affiliate link consistency
   static getFixedRecommendedTools(): Array<{
     category: string;
     items: Array<{
       name: string;
       description: string;
       url: string;
     }>;
   }> {
     // Always return the same fixed tools for affiliate link consistency
     return [
       {
         category: 'Gestión y Productividad',
         items: [
           { name: 'Figma', description: 'Diseño de interfaces y prototipado', url: 'https://figma.com' },
           { name: 'Notion', description: 'Gestión de proyectos y documentación', url: 'https://notion.so' },
           { name: 'Trello', description: 'Organización de tareas y proyectos', url: 'https://trello.com' }
         ]
       },
       {
         category: 'Marketing y Comunicación',
         items: [
           { name: 'Mailchimp', description: 'Email marketing y automatización', url: 'https://mailchimp.com' },
           { name: 'Canva', description: 'Diseño gráfico y contenido visual', url: 'https://canva.com' },
           { name: 'Hootsuite', description: 'Gestión de redes sociales', url: 'https://hootsuite.com' }
         ]
       },
       {
         category: 'Análisis y Métricas',
         items: [
           { name: 'Google Analytics', description: 'Análisis de tráfico web', url: 'https://analytics.google.com' },
           { name: 'Hotjar', description: 'Análisis de comportamiento de usuarios', url: 'https://hotjar.com' },
           { name: 'SEMrush', description: 'Análisis de SEO y competencia', url: 'https://semrush.com' }
         ]
       },
       {
         category: 'Desarrollo y Tecnología',
         items: [
           { name: 'GitHub', description: 'Control de versiones y colaboración', url: 'https://github.com' },
           { name: 'Vercel', description: 'Despliegue y hosting de aplicaciones', url: 'https://vercel.com' },
           { name: 'Stripe', description: 'Procesamiento de pagos online', url: 'https://stripe.com' }
         ]
       }
     ];
   }

   // Helper method to generate relevant links for actionable resources
   static getActionableResourceLinks(data: BusinessData): Array<{ title: string; url: string; description: string }> {
     // Base links for any project type - focused on general "idea to MVP" concepts instead of specific idea keywords
     const baseLinks = [
       {
         title: "Plantilla de Validación (YouTube)",
         url: `https://www.youtube.com/results?search_query=plantilla+validacion+idea+startup+mvp`,
         description: "Videos de YouTube sobre plantillas de validación de ideas"
       },
       {
         title: "Tracker Financiero (YouTube)",
         url: `https://www.youtube.com/results?search_query=tracker+financiero+startup+proyecciones+mvp`,
         description: "Videos de YouTube sobre trackers financieros para startups"
       },
       {
         title: "Board de Tareas (YouTube)",
         url: `https://www.youtube.com/results?search_query=board+tareas+startup+organizacion+mvp`,
         description: "Videos de YouTube sobre organización de tareas para startups"
       },
       {
         title: "Cómo Validar tu Idea (YouTube)",
         url: `https://www.youtube.com/results?search_query=como+validar+idea+startup+demanda+mvp`,
         description: "Videos de YouTube sobre validación de ideas de negocio"
       },
       {
         title: "Tu Primer Pitch (YouTube)",
         url: `https://www.youtube.com/results?search_query=primer+pitch+startup+presentacion+mvp`,
         description: "Videos de YouTube sobre cómo hacer tu primer pitch"
       },
       {
         title: "Landing Page en 30min (YouTube)",
         url: `https://www.youtube.com/results?search_query=landing+page+30+minutos+startup+mvp`,
         description: "Videos de YouTube sobre crear landing pages rápidamente"
       }
     ];

     // Customize links based on project type - each link must match the specific resource content
     if (data.projectType === 'SaaS') {
       return [
         {
           title: "Plantilla de Validación SaaS (YouTube)",
           url: `https://www.youtube.com/results?search_query=plantilla+validacion+saas+software+mvp`,
           description: "Videos de YouTube sobre validación de software SaaS"
         },
         {
           title: "Tracker Financiero SaaS (YouTube)",
           url: `https://www.youtube.com/results?search_query=tracker+financiero+saas+recurring+revenue+mvp`,
           description: "Videos de YouTube sobre finanzas para SaaS"
         },
         {
           title: "Board de Tareas SaaS (YouTube)",
           url: `https://www.youtube.com/results?search_query=board+tareas+saas+desarrollo+software+mvp`,
           description: "Videos de YouTube sobre organización de desarrollo SaaS"
         },
         {
           title: "Validación de Software (YouTube)",
           url: `https://www.youtube.com/results?search_query=validacion+software+saas+usuarios+beta+mvp`,
           description: "Videos de YouTube sobre validación de software"
         },
         {
           title: "Pitch para SaaS (YouTube)",
           url: `https://www.youtube.com/results?search_query=pitch+saas+software+startup+mvp`,
           description: "Videos de YouTube sobre pitch para software SaaS"
         },
         {
           title: "Landing Page SaaS (YouTube)",
           url: `https://www.youtube.com/results?search_query=landing+page+saas+software+demo+mvp`,
           description: "Videos de YouTube sobre landing pages para SaaS"
         }
       ];
     } else if (data.projectType === 'Ecommerce') {
       return [
         {
           title: "Plantilla de Validación Ecommerce (YouTube)",
           url: `https://www.youtube.com/results?search_query=plantilla+validacion+ecommerce+productos+mvp`,
           description: "Videos de YouTube sobre validación de productos ecommerce"
         },
         {
           title: "Tracker Financiero Ecommerce (YouTube)",
           url: `https://www.youtube.com/results?search_query=tracker+financiero+ecommerce+inventario+mvp`,
           description: "Videos de YouTube sobre finanzas para ecommerce"
         },
         {
           title: "Board de Tareas Ecommerce (YouTube)",
           url: `https://www.youtube.com/results?search_query=board+tareas+ecommerce+tienda+online+mvp`,
           description: "Videos de YouTube sobre organización de tiendas online"
         },
         {
           title: "Validación de Productos (YouTube)",
           url: `https://www.youtube.com/results?search_query=validacion+productos+ecommerce+mercado+mvp`,
           description: "Videos de YouTube sobre validación de productos"
         },
         {
           title: "Pitch para Ecommerce (YouTube)",
           url: `https://www.youtube.com/results?search_query=pitch+ecommerce+tienda+online+mvp`,
           description: "Videos de YouTube sobre pitch para ecommerce"
         },
         {
           title: "Landing Page Ecommerce (YouTube)",
           url: `https://www.youtube.com/results?search_query=landing+page+ecommerce+productos+mvp`,
           description: "Videos de YouTube sobre landing pages para ecommerce"
         }
       ];
     } else if (data.projectType === 'Physical Product') {
       return [
         {
           title: "Plantilla de Validación Producto (YouTube)",
           url: `https://www.youtube.com/results?search_query=plantilla+validacion+producto+fisico+mvp`,
           description: "Videos de YouTube sobre validación de productos físicos"
         },
         {
           title: "Tracker Financiero Producto (YouTube)",
           url: `https://www.youtube.com/results?search_query=tracker+financiero+producto+fisico+manufactura+mvp`,
           description: "Videos de YouTube sobre finanzas para productos físicos"
         },
         {
           title: "Board de Tareas Producto (YouTube)",
           url: `https://www.youtube.com/results?search_query=board+tareas+producto+fisico+prototipo+mvp`,
           description: "Videos de YouTube sobre organización de productos físicos"
         },
         {
           title: "Validación de Producto Físico (YouTube)",
           url: `https://www.youtube.com/results?search_query=validacion+producto+fisico+prototipo+mvp`,
           description: "Videos de YouTube sobre validación de productos físicos"
         },
         {
           title: "Pitch para Producto (YouTube)",
           url: `https://www.youtube.com/results?search_query=pitch+producto+fisico+invento+mvp`,
           description: "Videos de YouTube sobre pitch para productos físicos"
         },
         {
           title: "Landing Page Producto (YouTube)",
           url: `https://www.youtube.com/results?search_query=landing+page+producto+fisico+venta+mvp`,
           description: "Videos de YouTube sobre landing pages para productos físicos"
         }
       ];
     } else if (data.projectType === 'Service') {
       return [
         {
           title: "Plantilla de Validación Servicio (YouTube)",
           url: `https://www.youtube.com/results?search_query=plantilla+validacion+servicio+consultoria+mvp`,
           description: "Videos de YouTube sobre validación de servicios"
         },
         {
           title: "Tracker Financiero Servicio (YouTube)",
           url: `https://www.youtube.com/results?search_query=tracker+financiero+servicio+consultoria+mvp`,
           description: "Videos de YouTube sobre finanzas para servicios"
         },
         {
           title: "Board de Tareas Servicio (YouTube)",
           url: `https://www.youtube.com/results?search_query=board+tareas+servicio+consultoria+mvp`,
           description: "Videos de YouTube sobre organización de servicios"
         },
         {
           title: "Validación de Servicios (YouTube)",
           url: `https://www.youtube.com/results?search_query=validacion+servicio+consultoria+clientes+mvp`,
           description: "Videos de YouTube sobre validación de servicios"
         },
         {
           title: "Pitch para Servicio (YouTube)",
           url: `https://www.youtube.com/results?search_query=pitch+servicio+consultoria+mvp`,
           description: "Videos de YouTube sobre pitch para servicios"
         },
         {
           title: "Landing Page Servicio (YouTube)",
           url: `https://www.youtube.com/results?search_query=landing+page+servicio+consultoria+mvp`,
           description: "Videos de YouTube sobre landing pages para servicios"
         }
       ];
     }

     return baseLinks;
   }
 }

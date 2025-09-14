import axios from 'axios';
import { safeObjectKeys, safeObjectEntries } from '../utils/safeObjectUtils';



// Types for external data
export interface CompetitorData {
  name: string;
  website?: string;
  funding?: {
    totalRaised: string;
    lastRound: string;
    investors: string[];
  };
  metrics?: {
    employees: string;
    founded: string;
    industry: string;
  };

  
  traffic?: {
    monthlyVisits: number;
    globalRank: number;
    categoryRank: number;
  };
  technologies?: string[];
}

export interface MarketTrendsData {
  keyword: string;
  trend: 'rising' | 'stable' | 'declining';
  growthRate: number;
  relatedQueries: string[];
  geographicInterest: Array<{
    region: string;
    interest: number;
  }>;
}

export interface CompetitiveIntelligence {
  competitors: CompetitorData[];
  marketTrends: MarketTrendsData[];
  marketSize: {
    totalAddressableMarket: string;
    serviceableAddressableMarket: string;
    serviceableObtainableMarket: string;
  };
  insights: {
    competitiveAdvantages: string[];
    marketOpportunities: string[];
    risks: string[];
    strategicRecommendations: string[];
  };
}

export class ExternalDataService {
  // Main method to gather all competitive intelligence
  static async gatherCompetitiveIntelligence(businessData: {
    idea: string;
    alternatives: string;
    region: string;
    projectType: string;
  }): Promise<CompetitiveIntelligence> {
    console.log('Gathering competitive intelligence...');
    
    try {
      // Extract competitor names from alternatives
      const competitors = businessData.alternatives
        .split(',')
        .map(alt => alt.trim())
        .filter(alt => alt.length > 0)
        .slice(0, 5); // Limit to top 5 competitors

      // Convert competitor names to domains for SimilarWeb API
      const competitorDomains = competitors.map(competitor => {
        // Simple domain extraction - you might want to enhance this
        if (competitor.includes('.com') || competitor.includes('.org') || competitor.includes('.net')) {
          return competitor;
        }
        // Add .com if no domain extension
        return `${competitor.toLowerCase().replace(/\s+/g, '')}.com`;
      });

      console.log('Competitor domains for SimilarWeb:', competitorDomains);

      // Gather data for each competitor
      const competitorData = await Promise.all(
        competitorDomains.map(async (domain, index) => {
          const crunchbaseData = await this.getCrunchbaseData(competitors[index]);
          const similarWebData = await this.getSimilarWebData(domain);
          const builtWithData = await this.getBuiltWithData(domain);

          return {
            name: competitors[index],
            website: domain,
            ...crunchbaseData,
            ...similarWebData,
            technologies: builtWithData
          } as CompetitorData;
        })
      );

      // Get market trends for key terms
      const keyTerms = [
        businessData.idea,
        businessData.projectType,
        businessData.alternatives.split(',')[0]?.trim() || ''
      ].filter(term => term.length > 0);

      const marketTrends = await Promise.all(
        keyTerms.map(term => this.getGoogleTrendsData(term, businessData.region))
      );

      // Generate insights based on gathered data
      const insights = this.generateInsights(competitorData, marketTrends);

      return {
        competitors: competitorData,
        marketTrends,
        marketSize: this.estimateMarketSize(businessData),
        insights
      };
    } catch (error) {
      console.error('Error gathering competitive intelligence:', error);
      return this.getMockCompetitiveIntelligence(businessData);
    }
  }

  // Generate strategic insights from gathered data
  private static generateInsights(
    competitors: CompetitorData[],
    trends: MarketTrendsData[]
  ) {
    const insights = {
      competitiveAdvantages: [] as string[],
      marketOpportunities: [] as string[],
      risks: [] as string[],
      strategicRecommendations: [] as string[]
    };

    // Analyze competitors
    const fundedCompetitors = competitors.filter(c => c.funding?.totalRaised && c.funding.totalRaised !== 'Unknown');
    const highTrafficCompetitors = competitors.filter(c => c.traffic?.monthlyVisits && c.traffic.monthlyVisits > 100000);

    if (fundedCompetitors.length > 0) {
      insights.risks.push(`Competition is well-funded: ${fundedCompetitors.length} competitors have raised significant capital`);
      insights.strategicRecommendations.push('Focus on differentiation and unique value proposition to compete with funded players');
    }

    if (highTrafficCompetitors.length > 0) {
      insights.risks.push(`Strong market presence: ${highTrafficCompetitors.length} competitors have high website traffic`);
      insights.strategicRecommendations.push('Analyze competitor websites to identify gaps in user experience or features');
    }

    // Analyze trends
    const risingTrends = trends.filter(t => t.trend === 'rising');
    if (risingTrends.length > 0) {
      insights.marketOpportunities.push(`Growing interest in: ${risingTrends.map(t => t.keyword).join(', ')}`);
      insights.strategicRecommendations.push('Leverage rising trends in your marketing and positioning');
    }

    // Technology insights
    const commonTechnologies = this.analyzeCommonTechnologies(competitors);
    if (commonTechnologies.length > 0) {
      insights.strategicRecommendations.push(`Consider using proven technologies: ${commonTechnologies.slice(0, 3).join(', ')}`);
    }

    return insights;
  }

  // Analyze common technologies used by competitors
  private static analyzeCommonTechnologies(competitors: CompetitorData[]): string[] {
    const techCount: { [key: string]: number } = {};
    
    competitors.forEach(competitor => {
      competitor.technologies?.forEach(tech => {
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    });

    return safeObjectEntries(techCount)
      .sort(([,a], [,b]) => b - a)
      .map(([tech]) => tech);
  }

  // Estimate market size based on project type and region
  private static estimateMarketSize(businessData: any) {
    const marketSizes: { [key: string]: { [key: string]: string } } = {
      'SaaS': {
        'US': '$157B (2024)',
        'Europe': '$45B (2024)',
        'Latin America': '$8B (2024)'
      },
      'Ecommerce': {
        'US': '$1.1T (2024)',
        'Europe': '$800B (2024)',
        'Latin America': '$100B (2024)'
      },
      'Physical Product': {
        'US': '$2.5T (2024)',
        'Europe': '$2.1T (2024)',
        'Latin America': '$300B (2024)'
      }
    };

    const region = businessData.region || 'US';
    const projectType = businessData.projectType || 'SaaS';
    
    return {
      totalAddressableMarket: marketSizes[projectType]?.[region] || 'Unknown',
      serviceableAddressableMarket: 'Estimate 10-20% of TAM',
      serviceableObtainableMarket: 'Estimate 1-5% of TAM'
    };
  }

  // Mock data methods for when APIs are not configured
  private static getMockCrunchbaseData(companyName: string): Partial<CompetitorData> {
    const mockData = {
      'QuickBooks': {
        funding: { totalRaised: '$1.2B', lastRound: 'Series C', investors: ['Sequoia', 'Kleiner Perkins'] },
        metrics: { employees: '10,000+', founded: '1983', industry: 'Financial Software' }
      },
      'Excel': {
        funding: { totalRaised: 'N/A (Microsoft)', lastRound: 'N/A', investors: ['Microsoft'] },
        metrics: { employees: 'N/A', founded: '1985', industry: 'Productivity Software' }
      },
      'Holded': {
        funding: { totalRaised: '$80M', lastRound: 'Series B', investors: ['Lakestar', 'Nauta Capital'] },
        metrics: { employees: '200+', founded: '2016', industry: 'Business Management' }
      }
    };

    return mockData[companyName as keyof typeof mockData] || {
      funding: { totalRaised: 'Unknown', lastRound: 'Unknown', investors: [] },
      metrics: { employees: 'Unknown', founded: 'Unknown', industry: 'Unknown' }
    };
  }

  private static getMockSimilarWebData(domain: string): Partial<CompetitorData> {
    const mockData = {
      'quickbooks.com': { traffic: { monthlyVisits: 5000000, globalRank: 1500, categoryRank: 15 } },
      'excel.com': { traffic: { monthlyVisits: 2000000, globalRank: 3000, categoryRank: 25 } },
      'holded.com': { traffic: { monthlyVisits: 150000, globalRank: 25000, categoryRank: 150 } }
    };

    return mockData[domain as keyof typeof mockData] || {
      traffic: { monthlyVisits: 50000, globalRank: 50000, categoryRank: 500 }
    };
  }

  private static getMockBuiltWithData(domain: string): string[] {
    const mockData = {
      'quickbooks.com': ['React', 'Node.js', 'AWS', 'Stripe', 'Analytics'],
      'excel.com': ['Angular', 'Azure', 'Microsoft Graph', 'Power BI'],
      'holded.com': ['Vue.js', 'Laravel', 'PostgreSQL', 'Redis', 'AWS']
    };

    return mockData[domain as keyof typeof mockData] || ['HTML', 'CSS', 'JavaScript', 'Analytics'];
  }

  private static getMockGoogleTrendsData(keyword: string, region: string): MarketTrendsData {
    const trends = ['rising', 'stable', 'declining'];
    const randomTrend = trends[Math.floor(Math.random() * trends.length)] as 'rising' | 'stable' | 'declining';
    
    return {
      keyword,
      trend: randomTrend,
      growthRate: randomTrend === 'rising' ? Math.random() * 100 + 20 : randomTrend === 'stable' ? Math.random() * 20 : -Math.random() * 50,
      relatedQueries: [`${keyword} alternatives`, `${keyword} pricing`, `${keyword} reviews`],
      geographicInterest: [
        { region: region || 'US', interest: Math.floor(Math.random() * 100) + 50 },
        { region: 'Global', interest: Math.floor(Math.random() * 100) + 30 }
      ]
    };
  }

  private static getMockCompetitiveIntelligence(businessData: any): CompetitiveIntelligence {
    return {
      competitors: [
        {
          name: 'Competitor A',
          website: 'competitora.com',
          funding: { totalRaised: '$50M', lastRound: 'Series A', investors: ['VC Fund'] },
          metrics: { employees: '100+', founded: '2020', industry: businessData.projectType },
          traffic: { monthlyVisits: 100000, globalRank: 10000, categoryRank: 100 },
          technologies: ['React', 'Node.js', 'AWS']
        }
      ],
      marketTrends: [
        {
          keyword: businessData.idea,
          trend: 'rising',
          growthRate: 45,
          relatedQueries: [`${businessData.idea} alternatives`, `${businessData.idea} pricing`],
          geographicInterest: [{ region: businessData.region, interest: 75 }]
        }
      ],
      marketSize: {
        totalAddressableMarket: '$10B (2024)',
        serviceableAddressableMarket: '$1B (10% of TAM)',
        serviceableObtainableMarket: '$50M (0.5% of TAM)'
      },
      insights: {
        competitiveAdvantages: ['First-mover advantage in region', 'Local market knowledge'],
        marketOpportunities: ['Growing market demand', 'Technology adoption increasing'],
        risks: ['Established competitors', 'Market saturation'],
        strategicRecommendations: ['Focus on local market first', 'Build strong differentiation']
      }
    };
  }

  // API methods (placeholder implementations)
  private static async getCrunchbaseData(companyName: string): Promise<Partial<CompetitorData>> {
    // Placeholder for Crunchbase API integration
    return this.getMockCrunchbaseData(companyName);
  }

  private static async getSimilarWebData(domain: string): Promise<Partial<CompetitorData>> {
    try {
      // Use the provided SimilarWeb API key
      const apiKey = 'b38b0c5b7e204802b93f258fb6f6883c';
      
      if (!apiKey) {
        console.log('SimilarWeb API key not configured, using mock data');
        return this.getMockSimilarWebData(domain);
      }

      console.log(`🔍 Fetching SimilarWeb data for: ${domain}`);
      
      // Use only the free tier endpoint: total-traffic-and-engagement/visits
      // This endpoint provides basic traffic data without requiring premium access
      const response = await axios.get(`https://api.similarweb.com/v1/website/${domain}/total-traffic-and-engagement/visits`, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        },
        params: {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          country: 'us',
          granularity: 'monthly'
        }
      });

      if (response.data) {
        console.log('✅ SimilarWeb API response received:', response.data);
        
        // Extract traffic data from response
        const trafficData = response.data;
        
        // For free tier, we only get basic traffic data
        // Don't try to fetch premium endpoints like /overview
        return {
          traffic: {
            monthlyVisits: trafficData.visits || trafficData.total_visits || 0,
            globalRank: 0, // Not available in free tier
            categoryRank: 0 // Not available in free tier
          }
        };
      }
    } catch (error: any) {
      console.error('❌ Error fetching SimilarWeb data:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('📊 Response status:', error.response.status);
        console.error('📊 Response headers:', error.response.headers);
        console.error('📊 Response data:', error.response.data);
        
        // Check if it's a premium endpoint error
        if (error.response.status === 401 && error.response.data?.includes('sales')) {
          console.log('💡 This endpoint requires premium access. Using free tier data only.');
        }
      } else if (error.request) {
        console.error('📊 Request was made but no response received');
      } else {
        console.error('📊 Error setting up request:', error.message);
      }
      
      // If API fails, fall back to mock data
      console.log('🔄 Falling back to mock data due to API error');
    }
    
    return this.getMockSimilarWebData(domain);
  }

  private static async getBuiltWithData(domain: string): Promise<string[]> {
    // Placeholder for BuiltWith API integration
    return this.getMockBuiltWithData(domain);
  }

  private static async getGoogleTrendsData(keyword: string, region: string): Promise<MarketTrendsData> {
    // Placeholder for Google Trends API integration
    return this.getMockGoogleTrendsData(keyword, region);
  }

  // Test method to verify SimilarWeb API connection
  static async testSimilarWebConnection(): Promise<boolean> {
    try {
      const apiKey = 'b38b0c5b7e204802b93f258fb6f6883c';
      const testDomain = 'google.com';
      
      console.log('🧪 Testing SimilarWeb API connection (Free Tier)...');
      console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
      console.log('🌐 Testing domain:', testDomain);
      console.log('📡 Endpoint: /total-traffic-and-engagement/visits (Free Tier)');
      
      // Test with the traffic endpoint (free tier)
      const response = await axios.get(`https://api.similarweb.com/v1/website/${testDomain}/total-traffic-and-engagement/visits`, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        },
        params: {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          country: 'us',
          granularity: 'monthly'
        }
      });
      
      console.log('✅ SimilarWeb API test successful (Free Tier):', response.status);
      console.log('📊 Response data sample:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: safeObjectKeys(response.data)
      });
      return true;
    } catch (error: any) {
      console.error('❌ SimilarWeb API test failed:', error);
      
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📊 Data:', error.response.data);
        console.error('📊 Headers:', error.response.headers);
        
        // Provide helpful error messages
        if (error.response.status === 401) {
          if (error.response.data?.includes('sales')) {
            console.log('💡 This endpoint requires premium access. Check your plan.');
          } else {
            console.log('🔑 Authentication failed. Check your API key.');
          }
        } else if (error.response.status === 429) {
          console.log('⏰ Rate limit exceeded. Try again later.');
        } else if (error.response.status === 404) {
          console.log('🔍 Endpoint not found. Check the API documentation.');
        }
      } else if (error.request) {
        console.error('📊 No response received:', error.request);
      } else {
        console.error('📊 Error message:', error.message);
      }
      
      return false;
    }
  }

  // Alternative test method with different endpoint structure
  static async testSimilarWebAlternative(): Promise<boolean> {
    try {
      const apiKey = 'b38b0c5b7e204802b93f258fb6f6883c';
      const testDomain = 'google.com';
      
      console.log('🧪 Testing SimilarWeb API alternative endpoint...');
      console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
      
      // Try alternative endpoint structure
      const response = await axios.get(`https://api.similarweb.com/v1/website/${testDomain}/overview`, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ SimilarWeb alternative endpoint test successful:', response.status);
      console.log('📊 Response data:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ SimilarWeb alternative endpoint test failed:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      }
      
      return false;
    }
  }

  // Alternative method for free tier data only
  static async getBasicSimilarWebData(domain: string): Promise<Partial<CompetitorData>> {
    try {
      const apiKey = 'b38b0c5b7e204802b93f258fb6f6883c';
      
      if (!apiKey) {
        console.log('🔑 SimilarWeb API key not configured, using mock data');
        return this.getMockSimilarWebData(domain);
      }

      console.log(`🔍 Fetching basic SimilarWeb data (Free Tier) for: ${domain}`);
      
      // Only use the free tier endpoint
      const response = await axios.get(`https://api.similarweb.com/v1/website/${domain}/total-traffic-and-engagement/visits`, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        },
        params: {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          country: 'us',
          granularity: 'monthly'
        }
      });

      if (response.data) {
        console.log('✅ Basic SimilarWeb data received (Free Tier)');
        
        const trafficData = response.data;
        const monthlyVisits = trafficData.visits || trafficData.total_visits || 0;
        
        // Return only data available in free tier
        return {
          traffic: {
            monthlyVisits: monthlyVisits,
            globalRank: 0, // Premium feature
            categoryRank: 0 // Premium feature
          }
        };
      }
    } catch (error: any) {
      console.error('❌ Error fetching basic SimilarWeb data:', error);
      
      if (error.response) {
        if (error.response.status === 401 && error.response.data?.includes('sales')) {
          console.log('💡 Premium endpoint detected. Using free tier fallback.');
        }
      }
    }
    
    // Fallback to mock data
    console.log('🔄 Using mock data as fallback');
    return this.getMockSimilarWebData(domain);
  }
}

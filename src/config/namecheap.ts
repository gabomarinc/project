// Namecheap API Configuration
export const namecheapConfig = {
  // API Credentials - These should be set in your .env file
  apiUser: import.meta.env.VITE_NAMECHEAP_API_USER || '',
  apiKey: import.meta.env.VITE_NAMECHEAP_API_KEY || '',
  userName: import.meta.env.VITE_NAMECHEAP_USERNAME || '',
  clientIp: import.meta.env.VITE_NAMECHEAP_CLIENT_IP || '',
  
  // Environment settings
  sandbox: import.meta.env.VITE_NAMECHEAP_SANDBOX === 'true',
  
  // Affiliate settings
  affiliateId: import.meta.env.VITE_NAMECHEAP_AFFILIATE_ID || '',
  
  // API Endpoints
  endpoints: {
    sandbox: 'https://api.sandbox.namecheap.com/xml.response',
    production: 'https://api.namecheap.com/xml.response'
  },
  
  // Domain extensions to check
  extensions: [
    '.com',
    '.net', 
    '.org',
    '.io',
    '.co',
    '.app',
    '.ai',
    '.tech',
    '.co.uk',
    '.es'
  ],
  
  // Validation settings
  validation: {
    minDomainLength: 2,
    maxDomainLength: 63,
    allowedCharacters: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?$/
  }
};

// Helper function to get the correct API endpoint
export const getNamecheapEndpoint = (): string => {
  return namecheapConfig.sandbox 
    ? namecheapConfig.endpoints.sandbox 
    : namecheapConfig.endpoints.production;
};

// Helper function to validate configuration
export const isNamecheapConfigValid = (): boolean => {
  return !!(
    namecheapConfig.apiUser &&
    namecheapConfig.apiKey &&
    namecheapConfig.userName &&
    namecheapConfig.clientIp
  );
};

// Helper function to generate affiliate link
export const generateNamecheapAffiliateLink = (domain: string): string => {
  const baseUrl = 'https://www.namecheap.com/domains/registration/results.aspx';
  
  if (namecheapConfig.affiliateId) {
    return `${baseUrl}?domain=${domain}&affiliate=${namecheapConfig.affiliateId}`;
  }
  
  return `${baseUrl}?domain=${domain}`;
};


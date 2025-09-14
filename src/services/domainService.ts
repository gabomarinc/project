interface DomainAvailability {
  domain: string;
  available: boolean;
  price?: number;
  currency?: string;
  error?: string;
}

interface NamecheapConfig {
  apiUser: string;
  apiKey: string;
  userName: string;
  clientIp: string;
  sandbox?: boolean;
}

class DomainService {
  private config: NamecheapConfig;

  constructor() {
    this.config = {
      apiUser: import.meta.env.VITE_NAMECHEAP_API_USER || '',
      apiKey: import.meta.env.VITE_NAMECHEAP_API_KEY || '',
      userName: import.meta.env.VITE_NAMECHEAP_USERNAME || '',
      clientIp: import.meta.env.VITE_NAMECHEAP_CLIENT_IP || '',
      sandbox: import.meta.env.VITE_NAMECHEAP_SANDBOX === 'true'
    };
  }

  /**
   * Verifica la disponibilidad de un dominio usando Namecheap API
   */
  async checkDomainAvailability(domain: string): Promise<DomainAvailability> {
    try {
      if (!this.isConfigValid()) {
        throw new Error('Namecheap API configuration is missing');
      }

      // Limpiar el dominio (remover www, http, etc.)
      const cleanDomain = this.cleanDomain(domain);
      
      // Verificar que el dominio tenga un formato válido
      if (!this.isValidDomainFormat(cleanDomain)) {
      return {
          domain: cleanDomain,
          available: false,
          error: 'Formato de dominio inválido'
        };
      }

      const baseUrl = this.config.sandbox 
        ? 'https://api.sandbox.namecheap.com/xml.response'
        : 'https://api.namecheap.com/xml.response';

      const params = new URLSearchParams({
        ApiUser: this.config.apiUser,
        ApiKey: this.config.apiKey,
        UserName: this.config.userName,
        Command: 'namecheap.domains.check',
        ClientIp: this.config.clientIp,
        DomainList: cleanDomain
      });

      const response = await fetch(`${baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/xml',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      return this.parseDomainCheckResponse(xmlText, cleanDomain);

    } catch (error) {
      console.error('Error checking domain availability:', error);
      return {
        domain: domain,
        available: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verifica múltiples dominios en paralelo
   */
  async checkMultipleDomains(domains: string[]): Promise<DomainAvailability[]> {
    const promises = domains.map(domain => this.checkDomainAvailability(domain));
    return Promise.all(promises);
  }

  /**
   * Genera variaciones de un nombre de marca para verificar dominios
   */
  generateDomainVariations(brandName: string): string[] {
    const cleanName = brandName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, ''); // Remover espacios

    const variations = [
      `${cleanName}.com`,
      `${cleanName}.net`,
      `${cleanName}.org`,
      `${cleanName}.io`,
      `${cleanName}.co`,
      `${cleanName}.app`,
      `${cleanName}.ai`,
      `${cleanName}.tech`,
      `get${cleanName}.com`,
      `${cleanName}app.com`,
      `${cleanName}.co.uk`,
      `${cleanName}.es`
    ];

    return variations;
  }

  /**
   * Genera enlace de afiliado para compra de dominio
   */
  generateAffiliateLink(domain: string): string {
    const affiliateId = import.meta.env.VITE_NAMECHEAP_AFFILIATE_ID || '';
    const baseUrl = 'https://www.namecheap.com/domains/registration/results.aspx';
    
    if (affiliateId) {
      return `${baseUrl}?domain=${domain}&affiliate=${affiliateId}`;
    }
    
    return `${baseUrl}?domain=${domain}`;
  }

  /**
   * Limpia el dominio removiendo prefijos comunes
   */
  private cleanDomain(domain: string): string {
    return domain
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '') // Remover http, https, www
      .replace(/\/$/, '') // Remover barra final
      .trim();
  }

  /**
   * Valida el formato del dominio
   */
  private isValidDomainFormat(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  /**
   * Verifica si la configuración de Namecheap es válida
   */
  private isConfigValid(): boolean {
    return !!(
      this.config.apiUser &&
      this.config.apiKey &&
      this.config.userName &&
      this.config.clientIp
    );
  }

  /**
   * Parsea la respuesta XML de Namecheap
   */
  private parseDomainCheckResponse(xmlText: string, domain: string): DomainAvailability {
    try {
      // Parsear XML básico (en un entorno real, usarías una librería XML)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Verificar errores de parsing
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Error parsing XML response');
      }

      // Buscar el resultado del dominio
      const domainResult = xmlDoc.querySelector(`DomainCheckResult[Domain="${domain}"]`);
      
      if (!domainResult) {
        throw new Error('Domain result not found in response');
      }

      const available = domainResult.getAttribute('Available') === 'true';
      const price = domainResult.getAttribute('PremiumRegistrationPrice');
      const currency = domainResult.getAttribute('Currency');

      return {
        domain,
        available,
        price: price ? parseFloat(price) : undefined,
        currency: currency || 'USD'
      };

    } catch (error) {
      console.error('Error parsing domain check response:', error);
      return {
        domain,
        available: false,
        error: 'Error parsing response'
      };
    }
  }
}

export const domainService = new DomainService();
export type { DomainAvailability, NamecheapConfig };


import { 
  AIRTABLE_CONFIG, 
  AIRTABLE_TABLE_URL, 
  DASHBOARD_FIELDS, 
  DASHBOARD_EXPIRATION_DAYS 
} from '../config/airtable';
import axios from 'axios';
import { safeObjectKeys } from '../utils/safeObjectUtils';

// Types for dashboard data
export interface DashboardRecord {
  id?: string;
  user_email: string;
  dashboard_id: string;
  dashboard_data: any;
  project_name: string;
  project_type: string;
  business_model: string;
  region: string;
  business_idea: string;
  problem?: string;
  ideal_user?: string;
  alternatives?: string;
  validation_status: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  is_active: boolean;
  payment_at?: string;
  stripe_payment_id?: string;
}

export interface DashboardSearchResult {
  success: boolean;
  dashboard?: DashboardRecord;
  error?: string;
  isExpired?: boolean;
}

export class AirtableService {
  // Generate a unique dashboard ID
  private static generateDashboardId(): string {
    return `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate a unique preview session ID
  private static generatePreviewSessionId(): string {
    return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate a unique full dashboard ID
  private static generateFullDashboardId(): string {
    return `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calculate expiration date for Airtable (YYYY-MM-DD format)
  private static calculateExpirationDate(): string {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + DASHBOARD_EXPIRATION_DAYS);
    return expirationDate.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  // Get current date for Airtable (YYYY-MM-DD format)
  private static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  // Check if dashboard is expired
  private static isDashboardExpired(expiresAt: string): boolean {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    return expirationDate < now;
  }

  // Find existing dashboard by email
  static async findDashboardByEmail(email: string): Promise<DashboardSearchResult> {
    try {
      console.log('�� Searching for existing dashboard for email:', email);
      
      // Safety check: ensure email is valid
      if (!email || email.trim().length === 0) {
        console.log('⚠️ Skipping dashboard search - email is empty');
        return { success: true, dashboard: undefined };
      }
      
      // Use direct HTTP request with Bearer token authentication
      const response = await axios.get(AIRTABLE_TABLE_URL, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          filterByFormula: `{${DASHBOARD_FIELDS.USER_EMAIL}} = '${email}'`,
          maxRecords: 1
        }
      });

      if (!response.data.records || response.data.records.length === 0) {
        console.log('✅ No existing dashboard found for email:', email);
        return { success: true, dashboard: undefined };
      }

      const record = response.data.records[0];
      const dashboardData = record.fields;
      
      console.log('✅ Existing dashboard found:', dashboardData.dashboard_id);
      
      // Check if dashboard is expired
      const isExpired = this.isDashboardExpired(dashboardData.expires_at);
      
      if (isExpired) {
        console.log('⚠️ Dashboard is expired:', dashboardData.expires_at);
        return {
          success: true,
          dashboard: {
            id: record.id,
            user_email: dashboardData.user_email,
            dashboard_id: dashboardData.dashboard_id,
            dashboard_data: dashboardData.dashboard_data,
            project_name: dashboardData.project_name,
            project_type: dashboardData.project_type,
            business_model: dashboardData.business_model,
            region: dashboardData.region,
            business_idea: dashboardData.business_idea,
            validation_status: dashboardData.validation_status,
            created_at: dashboardData.created_at,
            updated_at: dashboardData.updated_at,
            expires_at: dashboardData.expires_at,
            is_active: false
          },
          isExpired: true
        };
      }

      return {
        success: true,
        dashboard: {
          id: record.id,
          user_email: dashboardData.user_email,
          dashboard_id: dashboardData.dashboard_id,
          dashboard_data: dashboardData.dashboard_data,
          project_name: dashboardData.project_name,
          project_type: dashboardData.project_type,
          business_model: dashboardData.business_model,
          region: dashboardData.region,
          business_idea: dashboardData.business_idea,
          validation_status: dashboardData.validation_status,
          created_at: dashboardData.created_at,
          updated_at: dashboardData.updated_at,
          expires_at: dashboardData.expires_at,
          is_active: true
        },
        isExpired: false
      };

    } catch (error) {
      console.error('❌ Error finding dashboard by email:', error);
      return {
        success: false,
        error: `Error finding dashboard: ${error}`
      };
    }
  }

  // Create new dashboard
  static async createDashboard(email: string, dashboardData: any, projectInfo: any): Promise<DashboardSearchResult> {
    try {
      console.log('🚀 Creating new dashboard for email:', email);
      
      const dashboardId = this.generateDashboardId();
      const now = this.getCurrentDate();
      const expiresAt = this.calculateExpirationDate();

      // Sanitize and validate the data before sending to Airtable
      const sanitizedDashboardData = this.sanitizeDataForAirtable(dashboardData);
      
      console.log('🧹 Sanitized dashboard data:', JSON.stringify(sanitizedDashboardData, null, 2));

      // Validate and sanitize all field values
      const validatedProjectName = (projectInfo.projectName || 'Unnamed Project').trim();
      const validatedProjectType = (projectInfo.projectType || 'Unknown').trim();
      const validatedBusinessModel = (projectInfo.businessModel || 'Not sure yet').trim();
      const validatedRegion = (projectInfo.region || 'global').trim();
      const validatedBusinessIdea = (projectInfo.businessIdea || 'No idea specified').trim();
      
      // Ensure all values are valid strings and not empty
      if (!validatedProjectName || !validatedProjectType || !validatedBusinessModel || !validatedRegion || !validatedBusinessIdea) {
        throw new Error('Invalid project information: all fields must have valid values');
      }
      
      // Log field validation results
      console.log('🔍 Field validation results:', {
        projectName: { value: validatedProjectName, length: validatedProjectName.length },
        projectType: { value: validatedProjectType, length: validatedProjectType.length },
        businessModel: { value: validatedBusinessModel, length: validatedBusinessModel.length },
        region: { value: validatedRegion, length: validatedRegion.length },
        businessIdea: { value: validatedBusinessIdea, length: validatedBusinessIdea.length }
      });

      const newDashboard: DashboardRecord = {
        user_email: email,
        dashboard_id: dashboardId,
        dashboard_data: sanitizedDashboardData,
        project_name: validatedProjectName,
        business_idea: validatedBusinessIdea,
        created_at: now,
        updated_at: now,
        expires_at: expiresAt,
        is_active: true,
        
        // Campos opcionales sin select (agregar solo si existen y no son valores por defecto)
        ...(validatedProjectType && validatedProjectType !== 'Unknown' && { project_type: validatedProjectType }),
        ...(validatedBusinessModel && validatedBusinessModel !== 'Not sure yet' && { business_model: validatedBusinessModel }),
        ...(validatedRegion && validatedRegion !== 'global' && { region: validatedRegion }),
        
        // Nota: validation_status se omite para evitar problemas con campos select
      };

      console.log('📤 Final dashboard record being sent:', JSON.stringify(newDashboard, null, 2));

      // Use direct HTTP request with Bearer token authentication
      const response = await axios.post(AIRTABLE_TABLE_URL, {
        records: [
        {
          fields: newDashboard
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const record = response.data.records;

      console.log('✅ New dashboard created successfully:', dashboardId);
      
      return {
        success: true,
        dashboard: {
          ...newDashboard,
          id: record[0].id
        }
      };

    } catch (error: any) {
      console.error('❌ Error creating dashboard:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('📊 Error response status:', error.response.status);
        console.error('📊 Error response data:', error.response.data);
        console.error('📊 Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('📊 Error request:', error.request);
      } else {
        console.error('📊 Error message:', error.message);
      }
      
      return {
        success: false,
        error: `Error creating dashboard: ${error.response?.data?.error || error.message || error}`
      };
    }
  }

  // Update existing dashboard
  static async updateDashboard(recordId: string, dashboardData: any, projectInfo: any): Promise<DashboardSearchResult> {
    try {
      console.log('🔄 Updating existing dashboard:', recordId);
      
      const now = this.getCurrentDate();
      const expiresAt = this.calculateExpirationDate();

      // Sanitize dashboard data before updating
      const sanitizedDashboardData = this.sanitizeDataForAirtable(dashboardData);
      
      // Validate and sanitize all field values
      const validatedProjectName = (projectInfo.projectName || 'Unnamed Project').trim();
      const validatedProjectType = (projectInfo.projectType || 'Unknown').trim();
      const validatedBusinessModel = (projectInfo.businessModel || 'Not sure yet').trim();
      const validatedRegion = (projectInfo.region || 'global').trim();
      const validatedBusinessIdea = (projectInfo.businessIdea || 'No idea specified').trim();
      
      // Ensure all values are valid strings and not empty
      if (!validatedProjectName || !validatedProjectType || !validatedBusinessModel || !validatedRegion || !validatedBusinessIdea) {
        throw new Error('Invalid project information: all fields must have valid values');
      }
      
      const updateData = {
        [DASHBOARD_FIELDS.DASHBOARD_DATA]: sanitizedDashboardData,
        [DASHBOARD_FIELDS.PROJECT_NAME]: validatedProjectName,
        [DASHBOARD_FIELDS.PROJECT_TYPE]: validatedProjectType,
        [DASHBOARD_FIELDS.BUSINESS_MODEL]: validatedBusinessModel,
        [DASHBOARD_FIELDS.REGION]: validatedRegion,
        [DASHBOARD_FIELDS.BUSINESS_IDEA]: validatedBusinessIdea,
        [DASHBOARD_FIELDS.VALIDATION_STATUS]: 'active',
        [DASHBOARD_FIELDS.UPDATED_AT]: now,
        [DASHBOARD_FIELDS.EXPIRES_AT]: expiresAt,
        [DASHBOARD_FIELDS.IS_ACTIVE]: true
      };

      // Use direct HTTP request with Bearer token authentication
      const response = await axios.patch(AIRTABLE_TABLE_URL, {
        records: [
        {
          id: recordId,
          fields: updateData
        }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const record = response.data.records;

      console.log('✅ Dashboard updated successfully:', recordId);
      
      return {
        success: true,
        dashboard: {
          id: recordId,
          user_email: record[0].fields.user_email,
          dashboard_id: record[0].fields.dashboard_id,
          dashboard_data: record[0].fields.dashboard_data,
          project_name: record[0].fields.project_name,
          project_type: record[0].fields.project_type,
          business_model: record[0].fields.business_model,
          region: record[0].fields.region,
          business_idea: record[0].fields.business_idea,
          validation_status: record[0].fields.validation_status,
          created_at: record[0].fields.created_at,
          updated_at: record[0].fields.updated_at,
          expires_at: record[0].fields.expires_at,
          is_active: record[0].fields.is_active
        }
      };

    } catch (error) {
      console.error('❌ Error updating dashboard:', error);
      return {
        success: false,
        error: `Error updating dashboard: ${error}`
      };
    }
  }

  // Extend dashboard expiration
  static async extendDashboardExpiration(recordId: string): Promise<DashboardSearchResult> {
    try {
      console.log('⏰ Extending dashboard expiration:', recordId);
      
      const expiresAt = this.calculateExpirationDate();
      const now = this.getCurrentDate();

      // Use direct HTTP request with Bearer token authentication
      const response = await axios.patch(AIRTABLE_TABLE_URL, {
        records: [
        {
          id: recordId,
          fields: {
            [DASHBOARD_FIELDS.EXPIRES_AT]: expiresAt,
            [DASHBOARD_FIELDS.UPDATED_AT]: now,
            [DASHBOARD_FIELDS.IS_ACTIVE]: true
          }
        }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const record = response.data.records;

      console.log('✅ Dashboard expiration extended successfully');
      
      return {
        success: true,
        dashboard: {
          id: recordId,
          user_email: record[0].fields.user_email,
          dashboard_id: record[0].fields.dashboard_id,
          dashboard_data: record[0].fields.dashboard_data,
          project_name: record[0].fields.project_name,
          project_type: record[0].fields.project_type,
          business_model: record[0].fields.business_model,
          region: record[0].fields.region,
          business_idea: record[0].fields.business_idea,
          validation_status: record[0].fields.validation_status,
          created_at: record[0].fields.created_at,
          updated_at: record[0].fields.updated_at,
          expires_at: record[0].fields.expires_at,
          is_active: record[0].fields.is_active
        }
      };

    } catch (error) {
      console.error('❌ Error extending dashboard expiration:', error);
      return {
        success: false,
        error: `Error extending dashboard expiration: ${error}`
      };
    }
  }

  // Delete dashboard
  static async deleteDashboard(recordId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting dashboard:', recordId);
      
      // Use direct HTTP request with Bearer token authentication
      await axios.delete(`${AIRTABLE_TABLE_URL}/${recordId}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Dashboard deleted successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Error deleting dashboard:', error);
      return {
        success: false,
        error: `Error deleting dashboard: ${error}`
      };
    }
  }

  // Get dashboard by ID
  static async getDashboardById(dashboardId: string): Promise<DashboardSearchResult> {
    try {
      console.log('🔍 Getting dashboard by ID:', dashboardId);
      
      // Use direct HTTP request with Bearer token authentication
      const response = await axios.get(AIRTABLE_TABLE_URL, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          filterByFormula: `{${DASHBOARD_FIELDS.DASHBOARD_ID}} = '${dashboardId}'`,
          maxRecords: 1
        }
      });

      if (!response.data.records || response.data.records.length === 0) {
        console.log('❌ Dashboard not found:', dashboardId);
        return {
          success: false,
          error: 'Dashboard not found'
        };
      }

      // Log the raw Airtable response
      console.log('📋 Raw Airtable response for dashboard:', {
        dashboardId,
        recordCount: response.data.records.length,
        rawRecord: response.data.records[0]
      });

      const record = response.data.records[0];
      const dashboardData = record.fields;
      
      // Log the is_active field specifically
      console.log('🔍 is_active field analysis:', {
        dashboardId,
        isActiveField: dashboardData[DASHBOARD_FIELDS.IS_ACTIVE],
        isActiveType: typeof dashboardData[DASHBOARD_FIELDS.IS_ACTIVE],
        allFields: safeObjectKeys(dashboardData)
      });
      
      // Check if dashboard is expired
      const isExpired = this.isDashboardExpired(dashboardData.expires_at);
      
      // Handle is_active field - if it doesn't exist, default to false (locked)
      const isActiveValue = dashboardData[DASHBOARD_FIELDS.IS_ACTIVE];
      const isActive = isActiveValue === true; // Only true if explicitly true
      
      console.log('🔧 Setting is_active value:', {
        rawValue: isActiveValue,
        processedValue: isActive,
        fieldExists: isActiveValue !== undefined
      });

      return {
        success: true,
        dashboard: {
          id: record.id,
          user_email: dashboardData.user_email,
          dashboard_id: dashboardData.dashboard_id,
          dashboard_data: dashboardData.dashboard_data,
          project_name: dashboardData.project_name,
          project_type: dashboardData.project_type,
          business_model: dashboardData.business_model,
          region: dashboardData.region,
          business_idea: dashboardData.business_idea,
          problem: dashboardData.problem,
          ideal_user: dashboardData.ideal_user,
          alternatives: dashboardData.alternatives,
          validation_status: dashboardData.validation_status,
          created_at: dashboardData.created_at,
          updated_at: dashboardData.updated_at,
          expires_at: dashboardData.expires_at,
          is_active: isActive,
          payment_at: dashboardData.payment_at,
          stripe_payment_id: dashboardData.stripe_payment_id
        },
        isExpired
      };

    } catch (error) {
      console.error('❌ Error getting dashboard by ID:', error);
      return {
        success: false,
        error: `Error getting dashboard: ${error}`
      };
    }
  }

  // Create preview session (without payment columns)
  static async createPreviewSession(email: string, previewData: any, projectInfo: any): Promise<DashboardSearchResult> {
    try {
      console.log('🚀 Creating preview session for email:', email);
      console.log('📊 Preview data received:', previewData);
      console.log('📋 Project info received:', projectInfo);
      
      const previewSessionId = this.generatePreviewSessionId();
      const now = this.getCurrentDate();
      const expiresAt = this.calculateExpirationDate();

      // Sanitize and validate the preview data before sending to Airtable
      const sanitizedPreviewData = this.sanitizeDataForAirtable(previewData);
      
      console.log('🧹 Sanitized preview data:', JSON.stringify(sanitizedPreviewData, null, 2));

      // Validate and sanitize all field values
      const validatedProjectName = (projectInfo.projectName || 'Unnamed Project').trim();
      const validatedProjectType = (projectInfo.projectType || 'Unknown').trim();
      const validatedBusinessModel = (projectInfo.businessModel || 'Not sure yet').trim();
      const validatedRegion = (projectInfo.region || 'global').trim();
      const validatedBusinessIdea = (projectInfo.businessIdea || 'No idea specified').trim();
      const validatedProblem = (projectInfo.problem || '').trim();
      const validatedIdealUser = (projectInfo.idealUser || '').trim();
      const validatedAlternatives = (projectInfo.alternatives || '').trim();
      
      // Ensure all values are valid strings and not empty
      if (!validatedProjectName || !validatedProjectType || !validatedBusinessModel || !validatedRegion || !validatedBusinessIdea) {
        throw new Error('Invalid project information: all fields must have valid values');
      }
      
      // Log field validation results
      console.log('🔍 Field validation results:', {
        projectName: { value: validatedProjectName, length: validatedProjectName.length },
        projectType: { value: validatedProjectType, length: validatedProjectType.length },
        businessModel: { value: validatedBusinessModel, length: validatedBusinessModel.length },
        region: { value: validatedRegion, length: validatedRegion.length },
        businessIdea: { value: validatedBusinessIdea, length: validatedBusinessIdea.length }
      });

      const newPreviewSession = {
        [DASHBOARD_FIELDS.USER_EMAIL]: email,
        [DASHBOARD_FIELDS.DASHBOARD_ID]: previewSessionId,
        [DASHBOARD_FIELDS.DASHBOARD_DATA]: sanitizedPreviewData,
        [DASHBOARD_FIELDS.PROJECT_NAME]: validatedProjectName,
        [DASHBOARD_FIELDS.BUSINESS_IDEA]: validatedBusinessIdea,
        [DASHBOARD_FIELDS.EXPIRES_AT]: expiresAt,
        [DASHBOARD_FIELDS.IS_ACTIVE]: false, // Preview sessions are not active (no payment)
        
        // Campos opcionales sin select (agregar solo si existen y no son valores por defecto)
        ...(validatedProjectType && validatedProjectType !== 'Unknown' && { [DASHBOARD_FIELDS.PROJECT_TYPE]: validatedProjectType }),
        ...(validatedBusinessModel && validatedBusinessModel !== 'Not sure yet' && { [DASHBOARD_FIELDS.BUSINESS_MODEL]: validatedBusinessModel }),
        ...(validatedRegion && validatedRegion !== 'global' && { [DASHBOARD_FIELDS.REGION]: validatedRegion }),
        
        // Campos adicionales del formulario - COMENTADOS PORQUE NO EXISTEN EN AIRTABLE
        // ...(validatedProblem && { [DASHBOARD_FIELDS.PROBLEM]: validatedProblem }),
        // ...(validatedIdealUser && { [DASHBOARD_FIELDS.IDEAL_USER]: validatedIdealUser }),
        // ...(validatedAlternatives && { [DASHBOARD_FIELDS.ALTERNATIVES]: validatedAlternatives }),
        
        // Nota: validation_status se omite para evitar problemas con campos select
        // Nota: created_at y updated_at son manejados automáticamente por Airtable
        // Nota: payment_at y stripe_payment_id no se establecen debido a restricciones de formato
        // Nota: Previews se distinguen por is_active=false y campos de pago vacíos
      };

      console.log('📤 Final preview session record being sent:', JSON.stringify(newPreviewSession, null, 2));
      console.log('🔗 Airtable URL:', AIRTABLE_TABLE_URL);
      console.log('🔑 Using token:', AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN ? 'Token present' : 'No token');

      // Use direct HTTP request with Bearer token authentication
      const response = await axios.post(AIRTABLE_TABLE_URL, {
        records: [
        {
          fields: newPreviewSession
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const record = response.data.records;

      console.log('📥 Airtable response:', response.data);
      console.log('✅ New preview session created successfully:', previewSessionId);
      
      return {
        success: true,
        dashboard: {
          id: record[0].id,
          user_email: email,
          dashboard_id: previewSessionId,
          dashboard_data: sanitizedPreviewData,
          project_name: validatedProjectName,
          project_type: validatedProjectType,
          business_model: validatedBusinessModel,
          region: validatedRegion,
          business_idea: validatedBusinessIdea,
          validation_status: 'active',
          created_at: record[0].createdTime || now, // Use Airtable's createdTime
          updated_at: record[0].createdTime || now, // Use Airtable's createdTime
          expires_at: expiresAt,
          is_active: false,
          payment_at: undefined,
          stripe_payment_id: undefined
        }
      };

    } catch (error: any) {
      console.error('❌ Error creating preview session:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('📊 Error response status:', error.response.status);
        console.error('📊 Error response data:', JSON.stringify(error.response.data, null, 2));
        console.error('📊 Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('📊 Error request:', error.request);
      } else {
        console.error('📊 Error message:', error.message);
      }
      
      return {
        success: false,
        error: `Error creating preview session: ${error.response?.data?.error || error.message || error}`
      };
    }
  }

  // Update preview to full dashboard (with payment completed)
  static async updatePreviewToFullDashboard(email: string, dashboardData: any, projectInfo: any, previewSessionId: string, businessSubSections?: any, pricingSubSections?: any): Promise<DashboardSearchResult> {
    try {
      console.log('🚀 Updating preview to full dashboard with sections for email:', email);
      console.log('📊 Dashboard data received:', dashboardData);
      console.log('📋 Project info received:', projectInfo);
      console.log('🔗 Preview session ID:', previewSessionId);
      console.log('📊 businessSubSections:', businessSubSections);
      console.log('📊 pricingSubSections:', pricingSubSections);

      // First, get the existing preview record
      const existingPreview = await this.getDashboardById(previewSessionId);
      if (!existingPreview.success || !existingPreview.dashboard) {
        throw new Error(`Preview session not found: ${previewSessionId}`);
      }

      const recordId = existingPreview.dashboard.id;
      const fullDashboardId = this.generateFullDashboardId();
      const now = this.getCurrentDate(); // Use consistent date format
      const expiresAt = this.calculateExpirationDate();

      // Validate and sanitize project info
      const validatedProjectName = projectInfo.projectName?.toString().substring(0, 100) || 'Untitled Project';
      const validatedProjectType = projectInfo.projectType?.toString().substring(0, 100) || 'Unknown';
      const validatedBusinessModel = projectInfo.businessModel?.toString().substring(0, 100) || 'Unknown';
      const validatedRegion = projectInfo.region?.toString().substring(0, 100) || 'Unknown';
      const validatedBusinessIdea = projectInfo.businessIdea?.toString().substring(0, 1000) || 'No description';

      // Sanitize dashboard data
      console.log('📊 Raw dashboard data received:', dashboardData);
      
      // Handle case when dashboardData is null or undefined
      if (!dashboardData) {
        console.warn('⚠️ Dashboard data is null/undefined, using existing preview data');
        // Use the existing preview data as fallback
        const existingData = existingPreview.dashboard.dashboard_data;
        if (existingData) {
          console.log('📊 Using existing preview data as fallback');
          // Parse the JSON string if it's a string
          if (typeof existingData === 'string') {
            try {
              dashboardData = JSON.parse(existingData);
              console.log('📊 Parsed existing data successfully');
            } catch (error) {
              console.error('❌ Error parsing existing data:', error);
              dashboardData = { error: 'Error parsing existing data' };
            }
          } else {
          dashboardData = existingData;
          }
        } else {
          console.error('❌ No dashboard data available, creating minimal data');
          dashboardData = { error: 'No dashboard data available' };
        }
      }
      
      // Build complete dashboard data with all sections
      const completeDashboardData = {
        ...dashboardData,
        businessSubSections: businessSubSections || {},
        pricingSubSections: pricingSubSections || {},
        // Add metadata
        generatedAt: new Date().toISOString(),
        version: '1.0',
        isFullDashboard: true
      };

      const sanitizedDashboardData = this.sanitizeDataForAirtable(completeDashboardData);
      console.log('📊 Complete dashboard data built:', completeDashboardData);
      console.log('📊 Sanitized dashboard data:', sanitizedDashboardData);

      // Extraer secciones específicas para enviar a columnas separadas
      const sections = this.extractDashboardSections(completeDashboardData, businessSubSections, pricingSubSections);
      console.log('🧹 Secciones extraídas:', Object.keys(sections));

      const updateData = {
        [DASHBOARD_FIELDS.DASHBOARD_ID]: fullDashboardId,
        [DASHBOARD_FIELDS.DASHBOARD_DATA]: sanitizedDashboardData,
        [DASHBOARD_FIELDS.PROJECT_NAME]: validatedProjectName,
        [DASHBOARD_FIELDS.BUSINESS_IDEA]: validatedBusinessIdea,
        [DASHBOARD_FIELDS.CREATED_AT]: existingPreview.dashboard.created_at || now, // Keep original created_at or use current time
        [DASHBOARD_FIELDS.UPDATED_AT]: now, // Set updated timestamp
        [DASHBOARD_FIELDS.EXPIRES_AT]: expiresAt,
        [DASHBOARD_FIELDS.IS_ACTIVE]: true, // Full dashboard is active
        [DASHBOARD_FIELDS.VALIDATION_STATUS]: 'active', // Set validation status to active for full dashboard
        
        // Campos opcionales sin select (agregar solo si existen en projectInfo)
        ...(validatedProjectType && validatedProjectType !== 'Unknown' && { [DASHBOARD_FIELDS.PROJECT_TYPE]: validatedProjectType }),
        ...(validatedBusinessModel && validatedBusinessModel !== 'Unknown' && { [DASHBOARD_FIELDS.BUSINESS_MODEL]: validatedBusinessModel }),
        ...(validatedRegion && validatedRegion !== 'Unknown' && { [DASHBOARD_FIELDS.REGION]: validatedRegion }),
        
        // Agregar todas las secciones específicas del dashboard
        [DASHBOARD_FIELDS.BUSINESS_SUMMARY]: this.truncateForAirtable(sections.business_summary),
        [DASHBOARD_FIELDS.MARKET_SIZE]: this.truncateForAirtable(sections.market_size),
        [DASHBOARD_FIELDS.BRAND_SUGGESTIONS]: this.truncateForAirtable(sections.brand_suggestions),
        [DASHBOARD_FIELDS.BRAND_REASONING]: this.truncateForAirtable(sections.brand_reasoning),
        [DASHBOARD_FIELDS.RECOMMENDED_TOOLS]: this.truncateForAirtable(sections.recommended_tools),
        [DASHBOARD_FIELDS.ACTION_PLAN]: this.truncateForAirtable(sections.action_plan),
        [DASHBOARD_FIELDS.MARKET_RESEARCH]: this.truncateForAirtable(sections.market_research),
        
        // Subsecciones de Business
        [DASHBOARD_FIELDS.PROPUESTA_VALOR]: this.truncateForAirtable(sections.propuesta_valor),
        [DASHBOARD_FIELDS.MODELO_NEGOCIO]: this.truncateForAirtable(sections.modelo_negocio),
        [DASHBOARD_FIELDS.VENTAJA_COMPETITIVA]: this.truncateForAirtable(sections.ventaja_competitiva),
        
        // Subsecciones de Pricing
        [DASHBOARD_FIELDS.MODELO_PRECIOS]: this.truncateForAirtable(sections.modelo_precios),
        [DASHBOARD_FIELDS.ESTRATEGIA_COMPETITIVA]: this.truncateForAirtable(sections.estrategia_competitiva),
        [DASHBOARD_FIELDS.RECOMENDACIONES_PRECIOS]: this.truncateForAirtable(sections.recomendaciones_precios),
        [DASHBOARD_FIELDS.ANALISIS_COMPETIDORES]: this.truncateForAirtable(sections.analisis_competidores)
        
        // Note: payment_at, stripe_payment_id have format restrictions
      };

      console.log('📤 SENDING DATA TO AIRTABLE WITH SECTIONS:');
      console.log('🆔 Record ID to update:', recordId);
      console.log('📊 Dashboard data being sent (length):', sanitizedDashboardData.length);
      console.log('📋 Sections being sent:', Object.keys(sections));

      const response = await axios.patch(AIRTABLE_TABLE_URL, {
        records: [
        {
          id: recordId,
          fields: updateData
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const record = response.data.records;

      console.log('📥 Airtable response for updated dashboard with sections:', response.data);
      console.log('📊 Updated record fields:', record[0].fields);
      console.log('✅ Preview updated to full dashboard with sections successfully:', fullDashboardId);
      
      return {
        success: true,
        dashboard: {
          id: recordId, // Keep the same record ID
          user_email: email,
          dashboard_id: fullDashboardId,
          dashboard_data: sanitizedDashboardData,
          project_name: validatedProjectName,
          project_type: validatedProjectType,
          business_model: validatedBusinessModel,
          region: validatedRegion,
          business_idea: validatedBusinessIdea,
          validation_status: 'active',
          created_at: record[0].fields.created_at || existingPreview.dashboard.created_at, // Keep original created_at
          updated_at: record[0].fields.updated_at || now, // Use updated timestamp
          expires_at: expiresAt,
          is_active: true,
          payment_at: undefined, // Not set due to format restrictions
          stripe_payment_id: undefined // Not set due to format restrictions
        }
      };

    } catch (error: any) {
      console.error('❌ Error updating preview to full dashboard:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('📊 Error response status:', error.response.status);
        console.error('📊 Error response data:', JSON.stringify(error.response.data, null, 2));
        console.error('📊 Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('📊 Error request:', error.request);
      } else {
        console.error('📊 Error message:', error.message);
      }
      
      return {
        success: false,
        error: `Error updating preview to full dashboard: ${error.response?.data?.error || error.message || error}`
      };
    }
  }



  // Función para extraer información del dashboard por secciones
  private static extractDashboardSections(dashboardData: any, businessSubSections: any, pricingSubSections: any) {
    console.log('🔧 Extrayendo secciones del dashboard para Airtable');
    console.log('📊 dashboardData keys:', Object.keys(dashboardData || {}));
    console.log('📊 businessSubSections:', businessSubSections);
    console.log('📊 pricingSubSections:', pricingSubSections);
    
    // Debug detallado de las subsecciones
    if (businessSubSections) {
      console.log('🔍 businessSubSections detallado:');
      console.log('🔑 Claves disponibles en businessSubSections:', Object.keys(businessSubSections));
      Object.keys(businessSubSections).forEach(key => {
        console.log(`  ${key}:`, businessSubSections[key]);
      });
    } else {
      console.log('⚠️ businessSubSections es null/undefined');
    }
    
    if (pricingSubSections) {
      console.log('🔍 pricingSubSections detallado:');
      console.log('🔑 Claves disponibles en pricingSubSections:', Object.keys(pricingSubSections));
      Object.keys(pricingSubSections).forEach(key => {
        console.log(`  ${key}:`, pricingSubSections[key]);
      });
    } else {
      console.log('⚠️ pricingSubSections es null/undefined');
    }
    
    const sections = {
      // Sección 1: Business Summary (desde executiveSummary)
      business_summary: dashboardData?.executiveSummary || dashboardData?.businessSummary || 'No disponible',
      
      // Sección 2: Market Size (desde externalData.marketSize)
      market_size: dashboardData?.externalData?.marketSize ? 
        `TAM: ${dashboardData.externalData.marketSize.totalAddressableMarket || 'No disponible'}\n` +
        `SAM: ${dashboardData.externalData.marketSize.serviceableAddressableMarket || 'No disponible'}\n` +
        `SOM: ${dashboardData.externalData.marketSize.serviceableObtainableMarket || 'No disponible'}`
        : dashboardData?.marketSize || 'No disponible',
      
      // Sección 3: Brand Suggestions
      brand_suggestions: dashboardData?.brandSuggestions ? 
        dashboardData.brandSuggestions.map((brand: string, index: number) => {
          const reasoning = dashboardData.brandReasoning && dashboardData.brandReasoning[index] 
            ? `\nRazón: ${dashboardData.brandReasoning[index]}` 
            : '';
          return `${index + 1}. ${brand}${reasoning}`;
        }).join('\n\n')
        : 'No disponible',
      
      // Sección 3b: Brand Reasoning (separado)
      brand_reasoning: dashboardData?.brandReasoning ? 
        dashboardData.brandReasoning.map((reason: string, index: number) => 
          `${index + 1}. ${reason}`
        ).join('\n\n')
        : 'No disponible',
      
      // Sección 4: Recommended Tools (desde externalData.competitors)
      recommended_tools: dashboardData?.externalData?.competitors ? 
        dashboardData.externalData.competitors.map((competitor: any, index: number) => 
          `${index + 1}. ${competitor.name}: ${competitor.description || 'Sin descripción'}${competitor.traffic ? `\n  Tráfico: ${competitor.traffic}` : ''}${competitor.tech ? `\n  Tecnologías: ${competitor.tech.join(', ')}` : ''}`
        ).join('\n\n')
        : dashboardData?.recommendedTools ? 
          dashboardData.recommendedTools.map((category: any) => 
            `${category.category}:\n${category.items.map((item: any) => 
              `• ${item.name}: ${item.description}${item.url ? `\n  Enlace: ${item.url}` : ''}`
            ).join('\n')}`
          ).join('\n\n')
          : 'No disponible',
      
      // Sección 5: Action Plan (desde actionableRecommendation)
      action_plan: dashboardData?.actionableRecommendation ? 
        `1. ${dashboardData.actionableRecommendation}`
        : dashboardData?.actionPlan ? 
          dashboardData.actionPlan.map((step: string, index: number) => 
            `${index + 1}. ${step}`
          ).join('\n\n')
          : 'No disponible',
      
      // Sección 6: Market Research (desde externalData.marketTrends)
      market_research: dashboardData?.externalData?.marketTrends ? 
        `Términos de Búsqueda:\n${dashboardData.externalData.marketTrends.map((trend: any) => trend.keyword).join('\n')}\n\n` +
        `Tendencias:\n${dashboardData.externalData.marketTrends.map((trend: any) => `${trend.keyword}: ${trend.trend} (${trend.growthRate}%)`).join('\n')}`
        : dashboardData?.marketResearch ? 
          `Términos de Búsqueda:\n${dashboardData.marketResearch.searchTerms?.join('\n') || 'No disponible'}\n\n` +
          `Temas de Validación:\n${dashboardData.marketResearch.validationTopics?.join('\n') || 'No disponible'}\n\n` +
          `Métodos de Investigación:\n${dashboardData.marketResearch.researchMethods?.join('\n') || 'No disponible'}`
          : 'No disponible',
      
      // Subsecciones de Business - mapear desde camelCase del Dashboard a snake_case de Airtable
      propuesta_valor: businessSubSections?.propuestaValor || businessSubSections?.propuesta_valor || 'No disponible',
      modelo_negocio: businessSubSections?.modeloNegocio || businessSubSections?.modelo_negocio || 'No disponible',
      ventaja_competitiva: businessSubSections?.ventajaCompetitiva || businessSubSections?.ventaja_competitiva || 'No disponible',
      
      // Subsecciones de Pricing - mapear desde camelCase del Dashboard a snake_case de Airtable
      modelo_precios: pricingSubSections?.modeloPrecios || pricingSubSections?.modelo_precios || 'No disponible',
      estrategia_competitiva: pricingSubSections?.estrategiaCompetitiva || pricingSubSections?.estrategia_competitiva || 'No disponible',
      recomendaciones_precios: pricingSubSections?.recomendaciones || pricingSubSections?.recomendaciones_precios || 'No disponible',
      analisis_competidores: pricingSubSections?.analisisCompetidores || pricingSubSections?.analisis_competidores || 'No disponible'
    };
    
    console.log('✅ Secciones extraídas:', Object.keys(sections));
    
    // Logging específico para subsecciones
    console.log('🔍 Valores de subsecciones extraídos:');
    console.log('  propuesta_valor:', sections.propuesta_valor);
    console.log('  modelo_negocio:', sections.modelo_negocio);
    console.log('  ventaja_competitiva:', sections.ventaja_competitiva);
    console.log('  modelo_precios:', sections.modelo_precios);
    console.log('  estrategia_competitiva:', sections.estrategia_competitiva);
    console.log('  recomendaciones_precios:', sections.recomendaciones_precios);
    console.log('  analisis_competidores:', sections.analisis_competidores);
    
    console.log('📊 Valores extraídos:', {
      business_summary: sections.business_summary.substring(0, 100) + '...',
      market_size: sections.market_size.substring(0, 100) + '...',
      brand_suggestions: sections.brand_suggestions.substring(0, 100) + '...',
      brand_reasoning: sections.brand_reasoning.substring(0, 100) + '...',
      recommended_tools: sections.recommended_tools.substring(0, 100) + '...',
      action_plan: sections.action_plan.substring(0, 100) + '...',
      market_research: sections.market_research.substring(0, 100) + '...',
      propuesta_valor: sections.propuesta_valor.substring(0, 100) + '...',
      modelo_negocio: sections.modelo_negocio.substring(0, 100) + '...',
      ventaja_competitiva: sections.ventaja_competitiva.substring(0, 100) + '...',
      modelo_precios: sections.modelo_precios.substring(0, 100) + '...',
      estrategia_competitiva: sections.estrategia_competitiva.substring(0, 100) + '...',
      recomendaciones_precios: sections.recomendaciones_precios.substring(0, 100) + '...',
      analisis_competidores: sections.analisis_competidores.substring(0, 100) + '...'
    });
    return sections;
  }

  // Función para truncar texto largo para Airtable
  private static truncateForAirtable(text: string, maxLength: number = 100000): string {
    if (!text || text.length <= maxLength) return text;
    
    console.warn(`⚠️ Texto truncado para Airtable: ${text.length} -> ${maxLength} caracteres`);
    return text.substring(0, maxLength) + '... [TRUNCADO]';
  }

  // Función de prueba para testear la extracción de secciones
  static async testSectionExtraction() {
    console.log('🧪 Iniciando prueba de extracción de secciones...');
    
    // Datos de prueba basados en la estructura real que vemos en los logs
    const testDashboardData = {
      executiveSummary: "La idea de una aplicación para organizar tareas que envía recordatorios vía SMS en LATAM presenta un potencial significativo...",
      externalData: {
        marketSize: {
          totalAddressableMarket: "Aproximadamente 150 millones de personas en LATAM se identifican como freelancers o estudiantes...",
          serviceableAddressableMarket: "El SAM se reduce considerando la penetración de smartphones...",
          serviceableObtainableMarket: "El SOM, considerando una estrategia de lanzamiento focalizada..."
        },
        competitors: [
          {
            name: "Todoist",
            description: "Aplicación de gestión de tareas con funciones de colaboración y recordatorios",
            traffic: "Alto tráfico estimado, con una fuerte presencia en LATAM",
            tech: ["React Native", "Cloud Databases", "API integrations"]
          },
          {
            name: "Any.do",
            description: "Aplicación de gestión de tareas con enfoque en simplicidad y productividad",
            traffic: "Moderado tráfico estimado en LATAM",
            tech: ["React Native", "Cloud Databases", "API integrations"]
          }
        ],
        marketTrends: [
          {
            keyword: "Gestión de tareas móvil",
            trend: "rising",
            growthRate: 25
          },
          {
            keyword: "SaaS en Latinoamérica",
            trend: "rising",
            growthRate: 20
          }
        ]
      },
      brandSuggestions: ["RecordaSMS", "Fluir", "MensajeroFacil", "Taksync", "Ayarachi"],
      brandReasoning: [
        "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio",
        "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio",
        "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio",
        "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio",
        "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio"
      ],
      actionableRecommendation: "Como primera acción, se recomienda realizar un estudio de mercado más profundo en los tres países objetivo (Brasil, México y Colombia) para validar la hipótesis de la preferencia por SMS como método de recordatorio."
    };

    const testBusinessSubSections = {
      propuestaValor: "Propuesta de valor: App de organización de tareas con recordatorios vía SMS",
      modeloNegocio: "Modelo de negocio: Suscripción mensual de $5 USD",
      ventajaCompetitiva: "Ventaja competitiva: Confiabilidad a través de SMS sin dependencia de internet"
    };

    const testPricingSubSections = {
      modeloPrecios: "Modelo de precios: Freemium con suscripción premium",
      estrategiaCompetitiva: "Estrategia competitiva: Precios accesibles para LATAM",
      recomendaciones: "Recomendaciones: Empezar con prueba gratuita de 30 días",
      analisisCompetidores: "Análisis de competidores: Todoist, Any.do, Google Tasks"
    };

    console.log('📊 Datos de prueba preparados');
    console.log('📊 testDashboardData keys:', Object.keys(testDashboardData));
    console.log('📊 testBusinessSubSections:', testBusinessSubSections);
    console.log('📊 testPricingSubSections:', testPricingSubSections);

    // Probar la extracción
    const sections = this.extractDashboardSections(testDashboardData, testBusinessSubSections, testPricingSubSections);
    
    console.log('✅ Prueba de extracción completada');
    console.log('📋 Secciones extraídas:');
    
    // Mostrar cada sección con preview
    Object.entries(sections).forEach(([key, value]) => {
      const preview = typeof value === 'string' ? value.substring(0, 100) + '...' : value;
      console.log(`  ${key}: ${preview}`);
    });

    return sections;
  }

  // Función para obtener opciones válidas de campos select de Airtable
  static async getAirtableFieldOptions() {
    try {
      console.log('🔍 Obteniendo opciones de campos de Airtable...');
      
      // Obtener metadatos de la tabla
      const response = await axios.get(AIRTABLE_TABLE_URL, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          maxRecords: 1 // Solo necesitamos un registro para obtener la estructura
        }
      });

      console.log('📊 Estructura de tabla obtenida');
      return response.data;
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener las opciones de campos:', error);
      return null;
    }
  }

  // Función para guardar datos de prueba en Airtable
  static async saveTestDataToAirtable() {
    console.log('🧪 Guardando datos de prueba en Airtable...');
    
    try {
      // Primero probemos con un registro mínimo
      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = this.getCurrentDate();
      const expiresAt = this.calculateExpirationDate();

      // Registro mínimo para probar - solo campos obligatorios sin select
      const minimalRecord = {
        [DASHBOARD_FIELDS.USER_EMAIL]: 'test@example.com',
        [DASHBOARD_FIELDS.DASHBOARD_ID]: testId,
        [DASHBOARD_FIELDS.PROJECT_NAME]: 'Prueba de Secciones Airtable',
        [DASHBOARD_FIELDS.BUSINESS_IDEA]: 'App para organizar tareas con SMS',
        [DASHBOARD_FIELDS.CREATED_AT]: now,
        [DASHBOARD_FIELDS.UPDATED_AT]: now,
        [DASHBOARD_FIELDS.EXPIRES_AT]: expiresAt,
        [DASHBOARD_FIELDS.IS_ACTIVE]: false
      };

      console.log('📤 Probando con registro mínimo...');
      console.log('📊 Minimal record:', minimalRecord);

      // Probar primero con registro mínimo
      const minimalResponse = await axios.post(AIRTABLE_TABLE_URL, {
        records: [
          {
            fields: minimalRecord
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Registro mínimo creado exitosamente');
      console.log('📊 Minimal response:', minimalResponse.data);

      // Si el registro mínimo funciona, ahora agregamos las secciones
      const recordId = minimalResponse.data.records[0].id;
      console.log('📊 Record ID:', recordId);

      // Generar datos de prueba
      const testDashboardData = {
        executiveSummary: "La idea de una aplicación para organizar tareas que envía recordatorios vía SMS en LATAM presenta un potencial significativo...",
        externalData: {
          marketSize: {
            totalAddressableMarket: "Aproximadamente 150 millones de personas en LATAM se identifican como freelancers o estudiantes...",
            serviceableAddressableMarket: "El SAM se reduce considerando la penetración de smartphones...",
            serviceableObtainableMarket: "El SOM, considerando una estrategia de lanzamiento focalizada..."
          },
          competitors: [
            {
              name: "Todoist",
              description: "Aplicación de gestión de tareas con funciones de colaboración y recordatorios",
              traffic: "Alto tráfico estimado, con una fuerte presencia en LATAM",
              tech: ["React Native", "Cloud Databases", "API integrations"]
            },
            {
              name: "Any.do",
              description: "Aplicación de gestión de tareas con enfoque en simplicidad y productividad",
              traffic: "Moderado tráfico estimado en LATAM",
              tech: ["React Native", "Cloud Databases", "API integrations"]
            }
          ],
          marketTrends: [
            {
              keyword: "Gestión de tareas móvil",
              trend: "rising",
              growthRate: 25
            },
            {
              keyword: "SaaS en Latinoamérica",
              trend: "rising",
              growthRate: 20
            }
          ]
        },
        brandSuggestions: ["RecordaSMS", "Fluir", "MensajeroFacil", "Taksync", "Ayarachi"],
        brandReasoning: [
          "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio",
          "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio",
          "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio",
          "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio",
          "Nombre estratégicamente seleccionado por IA basado en tu idea de negocio"
        ],
        actionableRecommendation: "Como primera acción, se recomienda realizar un estudio de mercado más profundo en los tres países objetivo (Brasil, México y Colombia) para validar la hipótesis de la preferencia por SMS como método de recordatorio."
      };

      const testBusinessSubSections = {
        propuestaValor: "Propuesta de valor: App de organización de tareas con recordatorios vía SMS",
        modeloNegocio: "Modelo de negocio: Suscripción mensual de $5 USD",
        ventajaCompetitiva: "Ventaja competitiva: Confiabilidad a través de SMS sin dependencia de internet"
      };

      const testPricingSubSections = {
        modeloPrecios: "Modelo de precios: Freemium con suscripción premium",
        estrategiaCompetitiva: "Estrategia competitiva: Precios accesibles para LATAM",
        recomendaciones: "Recomendaciones: Empezar con prueba gratuita de 30 días",
        analisisCompetidores: "Análisis de competidores: Todoist, Any.do, Google Tasks"
      };

      // Extraer secciones
      const sections = this.extractDashboardSections(testDashboardData, testBusinessSubSections, testPricingSubSections);
      
      // Crear el registro de prueba con campos mínimos requeridos
      const testRecord = {
        // Campos básicos requeridos (sin campos select problemáticos)
        [DASHBOARD_FIELDS.USER_EMAIL]: 'test@example.com',
        [DASHBOARD_FIELDS.DASHBOARD_ID]: testId,
        [DASHBOARD_FIELDS.PROJECT_NAME]: 'Prueba de Secciones Airtable',
        [DASHBOARD_FIELDS.BUSINESS_IDEA]: 'App para organizar tareas con SMS',
        [DASHBOARD_FIELDS.CREATED_AT]: now,
        [DASHBOARD_FIELDS.UPDATED_AT]: now,
        [DASHBOARD_FIELDS.EXPIRES_AT]: expiresAt,
        [DASHBOARD_FIELDS.IS_ACTIVE]: false, // Marcar como inactivo para pruebas
        
        // Datos del dashboard (puede ser opcional)
        [DASHBOARD_FIELDS.DASHBOARD_DATA]: this.sanitizeDataForAirtable(testDashboardData),
        
        // Agregar todas las secciones específicas del dashboard
        [DASHBOARD_FIELDS.BUSINESS_SUMMARY]: this.truncateForAirtable(sections.business_summary),
        [DASHBOARD_FIELDS.MARKET_SIZE]: this.truncateForAirtable(sections.market_size),
        [DASHBOARD_FIELDS.BRAND_SUGGESTIONS]: this.truncateForAirtable(sections.brand_suggestions),
        [DASHBOARD_FIELDS.BRAND_REASONING]: this.truncateForAirtable(sections.brand_reasoning),
        [DASHBOARD_FIELDS.RECOMMENDED_TOOLS]: this.truncateForAirtable(sections.recommended_tools),
        [DASHBOARD_FIELDS.ACTION_PLAN]: this.truncateForAirtable(sections.action_plan),
        [DASHBOARD_FIELDS.MARKET_RESEARCH]: this.truncateForAirtable(sections.market_research),
        
        // Subsecciones de Business
        [DASHBOARD_FIELDS.PROPUESTA_VALOR]: this.truncateForAirtable(sections.propuesta_valor),
        [DASHBOARD_FIELDS.MODELO_NEGOCIO]: this.truncateForAirtable(sections.modelo_negocio),
        [DASHBOARD_FIELDS.VENTAJA_COMPETITIVA]: this.truncateForAirtable(sections.ventaja_competitiva),
        
        // Subsecciones de Pricing
        [DASHBOARD_FIELDS.MODELO_PRECIOS]: this.truncateForAirtable(sections.modelo_precios),
        [DASHBOARD_FIELDS.ESTRATEGIA_COMPETITIVA]: this.truncateForAirtable(sections.estrategia_competitiva),
        [DASHBOARD_FIELDS.RECOMENDACIONES_PRECIOS]: this.truncateForAirtable(sections.recomendaciones_precios),
        [DASHBOARD_FIELDS.ANALISIS_COMPETIDORES]: this.truncateForAirtable(sections.analisis_competidores)
      };

      console.log('📤 Enviando datos de prueba a Airtable...');
      console.log('🆔 Test ID:', testId);
      console.log('📋 Secciones a guardar:', Object.keys(sections));
      console.log('📊 Test record completo:', testRecord);

      // Enviar a Airtable
      const response = await axios.post(AIRTABLE_TABLE_URL, {
        records: [
          {
            fields: testRecord
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const record = response.data.records[0];

      console.log('✅ Datos de prueba guardados exitosamente en Airtable');
      console.log('📊 Record ID:', record.id);
      console.log('📊 Response:', response.data);

      return {
        success: true,
        recordId: record.id,
        testId: testId,
        message: 'Datos de prueba guardados exitosamente en Airtable'
      };

    } catch (error: any) {
      console.error('❌ Error guardando datos de prueba en Airtable:', error);
      
      if (error.response) {
        console.error('📊 Error response status:', error.response.status);
        console.error('📊 Error response data:', error.response.data);
        console.error('📊 Error response headers:', error.response.headers);
        
        // Mostrar detalles específicos del error 422
        if (error.response.status === 422) {
          console.error('🔍 Error 422 - Detalles específicos:');
          if (error.response.data?.error) {
            console.error('📋 Error message:', error.response.data.error);
          }
          if (error.response.data?.message) {
            console.error('📋 Error details:', error.response.data.message);
          }
        }
      }
      
      return {
        success: false,
        error: `Error guardando datos de prueba: ${error.response?.data?.error || error.response?.data?.message || error.message || error}`
      };
    }
  }

  // Sanitize data for Airtable to prevent 422 errors
  private static sanitizeDataForAirtable(data: any): any {
    if (!data) return '';
    
    try {
      // Convert to string if it's an object, but limit length to prevent Airtable field size issues
      const jsonString = JSON.stringify(data);
      
      // Airtable has field size limits, so truncate if too long
      if (jsonString.length > 100000) { // 100KB limit
        console.warn('⚠️ Dashboard data too large, truncating for Airtable');
        return jsonString.substring(0, 100000) + '... [TRUNCATED]';
      }
      
      return jsonString;
    } catch (error) {
      console.warn('⚠️ Error stringifying dashboard data, using fallback:', error);
      return 'Error processing dashboard data';
    }
  }

  // ===== FUNCIONES DE SESIÓN DE USUARIO =====

  // Generar contraseña automática basada en email
  static generateUserPassword(email: string): string {
    // Extraer la parte antes del @ del email
    const emailPrefix = email.split('@')[0];
    // Agregar timestamp para hacerla única
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
    return `${emailPrefix}${timestamp}`;
  }

  // Crear sesión de usuario (generar contraseña automáticamente)
  static async createUserSession(email: string, previewSessionId: string): Promise<{success: boolean, password?: string, error?: string}> {
    try {
      console.log('🔐 Creando sesión de usuario para:', email);
      
      // Generar contraseña automática
      const password = this.generateUserPassword(email);
      console.log('🔑 Contraseña generada:', password);
      
      // Buscar el preview existente
      const existingPreview = await this.getDashboardById(previewSessionId);
      if (!existingPreview.success || !existingPreview.dashboard) {
        return { success: false, error: 'Preview session not found' };
      }

      const recordId = existingPreview.dashboard.id;
      const now = this.getCurrentDate();

      // Actualizar el preview con la clave de usuario
      const updateData = {
        [DASHBOARD_FIELDS.USER_EMAIL]: email,
        [DASHBOARD_FIELDS.USER_PASSWORD]: password,
        [DASHBOARD_FIELDS.SESSION_CREATED_AT]: now,
        [DASHBOARD_FIELDS.IS_SESSION_ACTIVE]: true,
        [DASHBOARD_FIELDS.UPDATED_AT]: now
      };

      console.log('📤 Actualizando preview con clave de usuario...');
      
      await axios.patch(`${AIRTABLE_TABLE_URL}/${recordId}`, {
        fields: updateData
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Sesión de usuario creada exitosamente');
      return { success: true, password };

    } catch (error: any) {
      console.error('❌ Error creando sesión de usuario:', error);
      return { 
        success: false, 
        error: `Error creando sesión: ${error.response?.data?.error || error.message || error}` 
      };
    }
  }

  // Verificar login de usuario
  static async verifyUserLogin(email: string, password: string): Promise<{success: boolean, dashboard?: any, error?: string}> {
    try {
      console.log('🔍 Verificando login para:', email);
      
      // Buscar dashboards del usuario
      const response = await axios.get(AIRTABLE_TABLE_URL, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          filterByFormula: `AND({user_email} = '${email}', {user_password} = '${password}', {is_session_active} = TRUE())`,
          sort: [{ field: 'created_at', direction: 'desc' }]
        }
      });

      const records = response.data.records;
      
      if (records.length === 0) {
        return { success: false, error: 'Email o clave incorrectos' };
      }

      // Tomar el dashboard más reciente
      const dashboard = records[0];
      const now = this.getCurrentDate();

      // Actualizar último login
      await axios.patch(`${AIRTABLE_TABLE_URL}/${dashboard.id}`, {
        fields: {
          [DASHBOARD_FIELDS.LAST_LOGIN_AT]: now,
          [DASHBOARD_FIELDS.UPDATED_AT]: now
        }
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Login verificado exitosamente');
      return { success: true, dashboard };

    } catch (error: any) {
      console.error('❌ Error verificando login:', error);
      return { 
        success: false, 
        error: `Error verificando login: ${error.response?.data?.error || error.message || error}` 
      };
    }
  }

  // Cerrar sesión de usuario
  static async closeUserSession(dashboardId: string): Promise<{success: boolean, error?: string}> {
    try {
      console.log('🔒 Cerrando sesión para dashboard:', dashboardId);
      
      await axios.patch(`${AIRTABLE_TABLE_URL}/${dashboardId}`, {
        fields: {
          [DASHBOARD_FIELDS.IS_SESSION_ACTIVE]: false,
          [DASHBOARD_FIELDS.UPDATED_AT]: this.getCurrentDate()
        }
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Sesión cerrada exitosamente');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error cerrando sesión:', error);
      return { 
        success: false, 
        error: `Error cerrando sesión: ${error.response?.data?.error || error.message || error}` 
      };
    }
  }

  // Obtener registro de preview por ID
  static async getPreviewRecord(previewId: string): Promise<any> {
    try {
      console.log('📊 Obteniendo registro de preview:', previewId);
      
      const response = await axios.get(
        `${AIRTABLE_TABLE_URL}/${previewId}`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Registro de preview obtenido exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo registro de preview:', error);
      return null;
    }
  }

  // Update preview data in Airtable
  static async updatePreviewData(previewId: string, previewData: any, projectInfo: any): Promise<{success: boolean, error?: string}> {
    try {
      console.log('🔄 Actualizando datos del preview:', previewId);
      
      // Sanitize and validate the preview data before sending to Airtable
      const sanitizedPreviewData = this.sanitizeDataForAirtable(previewData);
      
      // Validate and sanitize all field values
      const validatedProjectName = (projectInfo.projectName || 'Unnamed Project').trim();
      const validatedProjectType = (projectInfo.projectType || 'Unknown').trim();
      const validatedBusinessModel = (projectInfo.businessModel || 'Not sure yet').trim();
      const validatedRegion = (projectInfo.region || 'global').trim();
      const validatedBusinessIdea = (projectInfo.businessIdea || 'No idea specified').trim();
      const validatedProblem = (projectInfo.problem || '').trim();
      const validatedIdealUser = (projectInfo.idealUser || '').trim();
      const validatedAlternatives = (projectInfo.alternatives || '').trim();
      
      const updateData = {
        [DASHBOARD_FIELDS.DASHBOARD_DATA]: sanitizedPreviewData,
        [DASHBOARD_FIELDS.PROJECT_NAME]: validatedProjectName,
        [DASHBOARD_FIELDS.BUSINESS_IDEA]: validatedBusinessIdea,
        [DASHBOARD_FIELDS.UPDATED_AT]: this.getCurrentDate(),
        
        // Campos opcionales sin select (agregar solo si existen y no son valores por defecto)
        ...(validatedProjectType && validatedProjectType !== 'Unknown' && { [DASHBOARD_FIELDS.PROJECT_TYPE]: validatedProjectType }),
        ...(validatedBusinessModel && validatedBusinessModel !== 'Not sure yet' && { [DASHBOARD_FIELDS.BUSINESS_MODEL]: validatedBusinessModel }),
        ...(validatedRegion && validatedRegion !== 'global' && { [DASHBOARD_FIELDS.REGION]: validatedRegion }),
        
        // Campos adicionales del formulario
        ...(validatedProblem && { [DASHBOARD_FIELDS.PROBLEM]: validatedProblem }),
        ...(validatedIdealUser && { [DASHBOARD_FIELDS.IDEAL_USER]: validatedIdealUser }),
        ...(validatedAlternatives && { [DASHBOARD_FIELDS.ALTERNATIVES]: validatedAlternatives }),
      };

      // First, get the record ID for the preview
      const getResponse = await axios.get(`${AIRTABLE_TABLE_URL}?filterByFormula={dashboard_id}='${previewId}'`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (getResponse.data.records.length === 0) {
        throw new Error('Preview record not found');
      }

      const recordId = getResponse.data.records[0].id;

      // Update the record
      await axios.patch(`${AIRTABLE_TABLE_URL}/${recordId}`, {
        fields: updateData
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Datos del preview actualizados exitosamente');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error actualizando datos del preview:', error);
      return { 
        success: false, 
        error: `Error actualizando preview: ${error.response?.data?.error || error.message || error}` 
      };
    }
  }

  // Update a specific field in a dashboard record
  static async updateDashboardField(dashboardId: string, fieldName: string, value: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Updating dashboard field:', { dashboardId, fieldName, value });
      
      // First, get the record ID for the dashboard
      const getResponse = await axios.get(`${AIRTABLE_TABLE_URL}?filterByFormula={dashboard_id}='${dashboardId}'`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!getResponse.data.records || getResponse.data.records.length === 0) {
        console.error('❌ Dashboard record not found:', dashboardId);
        return { success: false, error: 'Dashboard record not found' };
      }

      const recordId = getResponse.data.records[0].id;
      
      // Prepare the update data
      const updateData = {
        [fieldName]: value
      };

      // Update the record
      await axios.patch(`${AIRTABLE_TABLE_URL}/${recordId}`, {
        fields: updateData
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Dashboard field updated successfully:', fieldName);
      return { success: true };

    } catch (error) {
      console.error('❌ Error updating dashboard field:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Save completed steps to Airtable
  static async saveCompletedSteps(dashboardId: string, completedSteps: number[], stepNotes: {[key: number]: string}): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Saving completed steps:', { dashboardId, completedSteps, stepNotes });
      
      // Get the dashboard record first
      const getResponse = await axios.get(`${AIRTABLE_TABLE_URL}?filterByFormula={dashboard_id}='${dashboardId}'`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!getResponse.data.records || getResponse.data.records.length === 0) {
        console.error('❌ Dashboard record not found:', dashboardId);
        return { success: false, error: 'Dashboard record not found' };
      }

      const recordId = getResponse.data.records[0].id;
      
      // Update the completed steps and step notes
      const updateData = {
        [DASHBOARD_FIELDS.COMPLETED_STEPS]: JSON.stringify(completedSteps),
        [DASHBOARD_FIELDS.STEP_NOTES]: JSON.stringify(stepNotes)
      };

      await axios.patch(`${AIRTABLE_TABLE_URL}/${recordId}`, 
        { fields: updateData }, 
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Completed steps saved successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving completed steps:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Load completed steps from Airtable
  static async loadCompletedSteps(dashboardId: string): Promise<{ success: boolean; completedSteps?: number[]; stepNotes?: {[key: number]: string}; error?: string }> {
    try {
      console.log('📥 Loading completed steps for dashboard:', dashboardId);
      
      const response = await axios.get(`${AIRTABLE_TABLE_URL}?filterByFormula={dashboard_id}='${dashboardId}'`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.records || response.data.records.length === 0) {
        console.error('❌ Dashboard record not found:', dashboardId);
        return { success: false, error: 'Dashboard record not found' };
      }

      const record = response.data.records[0];
      const completedStepsData = record.fields[DASHBOARD_FIELDS.COMPLETED_STEPS];
      const stepNotesData = record.fields[DASHBOARD_FIELDS.STEP_NOTES];

      let completedSteps: number[] = [];
      let stepNotes: {[key: number]: string} = {};

      if (completedStepsData) {
        try {
          completedSteps = JSON.parse(completedStepsData);
        } catch (e) {
          console.warn('⚠️ Error parsing completed steps data:', e);
        }
      }

      if (stepNotesData) {
        try {
          stepNotes = JSON.parse(stepNotesData);
        } catch (e) {
          console.warn('⚠️ Error parsing step notes data:', e);
        }
      }

      console.log('✅ Completed steps loaded successfully:', { completedSteps, stepNotes });
      return { success: true, completedSteps, stepNotes };
    } catch (error) {
      console.error('❌ Error loading completed steps:', error);
      return {
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Find user session by email and password
  static async findUserSession(email: string, password: string): Promise<{ success: boolean; dashboardId?: string; error?: string }> {
    try {
      console.log('🔍 Buscando sesión de usuario:', email);
      
      // Search for user sessions in the Dashboards table
      const response = await axios.get(`${AIRTABLE_TABLE_URL}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          filterByFormula: `AND({${DASHBOARD_FIELDS.USER_EMAIL}} = "${email}", {${DASHBOARD_FIELDS.USER_PASSWORD}} = "${password}", {${DASHBOARD_FIELDS.IS_ACTIVE}} = TRUE())`,
          maxRecords: 1,
          sort: [{ field: DASHBOARD_FIELDS.CREATED_AT, direction: 'desc' }]
        }
      });

      if (response.data.records && response.data.records.length > 0) {
        const record = response.data.records[0];
        const dashboardId = record.fields[DASHBOARD_FIELDS.DASHBOARD_ID] || record.id;
        
        if (dashboardId) {
          console.log('✅ Sesión encontrada, dashboard ID:', dashboardId);
          return {
            success: true,
            dashboardId: dashboardId
          };
        } else {
          console.log('❌ Sesión encontrada pero sin dashboard ID');
          return {
            success: false,
            error: 'Sesión sin dashboard asociado'
          };
        }
      } else {
        console.log('❌ No se encontró sesión para:', email);
        return {
          success: false,
          error: 'Credenciales incorrectas o sesión no encontrada'
        };
      }
    } catch (error) {
      console.error('❌ Error buscando sesión de usuario:', error);
      return {
        success: false,
        error: 'Error de conexión. Por favor, intenta de nuevo.'
      };
    }
  }
}

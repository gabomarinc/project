// Airtable Configuration for Personal Access Tokens
// Note: Airtable now uses Personal Access Tokens (PATs) with Bearer authentication
// Your token should start with 'pat' (Personal Access Token)
const envToken = import.meta.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN;
const fallbackToken = 'pateQ54vtA6JFAAyN.fca739fac3390851f60d85713590549737ca7ec7cf27ad087c67ae18a02f01be';
const airtableToken = envToken || fallbackToken;

// Log token status (without exposing full token)
const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || 'appHgGF7B9ojxqRnA';
const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Dashboards';

if (envToken) {
  console.log('✅ [AIRTABLE] Using token from environment variable');
  console.log('🔑 [AIRTABLE] Token starts with:', airtableToken.substring(0, 15) + '...');
  console.log('🔑 [AIRTABLE] Token length:', airtableToken.length);
  console.log('🔑 [AIRTABLE] Base ID:', baseId);
  console.log('🔑 [AIRTABLE] Table Name:', tableName);
} else {
  console.warn('⚠️ [AIRTABLE] Using fallback token (not from environment)');
  console.warn('⚠️ [AIRTABLE] Set VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN in .env or Vercel');
  console.log('🔑 [AIRTABLE] Token starts with:', airtableToken.substring(0, 15) + '...');
  console.log('🔑 [AIRTABLE] Token length:', airtableToken.length);
  console.log('🔑 [AIRTABLE] Base ID:', baseId);
  console.log('🔑 [AIRTABLE] Table Name:', tableName);
}

// Validate token format
if (!airtableToken.startsWith('pat')) {
  console.error('❌ [AIRTABLE] Token format invalid - should start with "pat"');
} else if (airtableToken.length < 50) {
  console.error('❌ [AIRTABLE] Token appears to be incomplete (too short)');
  console.error('❌ [AIRTABLE] Airtable tokens typically have two parts separated by a dot');
}

export const AIRTABLE_CONFIG = {
  PERSONAL_ACCESS_TOKEN: airtableToken,
  BASE_ID: baseId, // Your Airtable Base ID
  TABLE_NAME: tableName, // Your table name
  VIEW_NAME: 'Grid view' // Your view name
};

// For Personal Access Tokens, we need to use the newer Airtable API with Bearer authentication
// The old airtable library doesn't support Bearer tokens properly
// We'll use direct HTTP requests with axios instead

// Airtable API endpoints
export const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';
export const AIRTABLE_BASE_URL = `${AIRTABLE_API_BASE}/${AIRTABLE_CONFIG.BASE_ID}`;
export const AIRTABLE_TABLE_URL = `${AIRTABLE_BASE_URL}/${AIRTABLE_CONFIG.TABLE_NAME}`;

// Dashboard field mappings
// IMPORTANT: These field names must EXACTLY match the column names in your Airtable base
// Check your Airtable base to ensure these names are correct (case-sensitive)
export const DASHBOARD_FIELDS = {
  USER_EMAIL: 'user_email',
  USER_PASSWORD: 'user_password',
  SESSION_CREATED_AT: 'session_created_at',
  IS_SESSION_ACTIVE: 'is_session_active',
  LAST_LOGIN_AT: 'last_login_at',
  DASHBOARD_ID: 'dashboard_id',
  DASHBOARD_DATA: 'dashboard_data',
  PROJECT_NAME: 'project_name',
  PROJECT_TYPE: 'project_type',
  BUSINESS_MODEL: 'business_model',
  REGION: 'region',
  BUSINESS_IDEA: 'business_idea',
  PROBLEM: 'problem',
  IDEAL_USER: 'ideal_user',
  ALTERNATIVES: 'alternatives',
  VALIDATION_STATUS: 'validation_status',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  EXPIRES_AT: 'expires_at',
  IS_ACTIVE: 'is_active',
  PAYMENT_AT: 'payment_at',
  STRIPE_PAYMENT_ID: 'stripe_payment_id',
  
  // Campos para secciones específicas del dashboard
  BUSINESS_SUMMARY: 'business_summary',
  MARKET_SIZE: 'market_size',
  BRAND_SUGGESTIONS: 'brand_suggestions',
  BRAND_REASONING: 'brand_reasoning',
  RECOMMENDED_TOOLS: 'recommended_tools',
  ACTION_PLAN: 'action_plan',
  MARKET_RESEARCH: 'market_research',
  
  // Subsecciones de Business
  PROPUESTA_VALOR: 'propuesta_valor',
  MODELO_NEGOCIO: 'modelo_negocio',
  VENTAJA_COMPETITIVA: 'ventaja_competitiva',
  
  // Subsecciones de Pricing
  MODELO_PRECIOS: 'modelo_precios',
  ESTRATEGIA_COMPETITIVA: 'estrategia_competitiva',
  RECOMENDACIONES_PRECIOS: 'recomendaciones_precios',
  ANALISIS_COMPETIDORES: 'analisis_competidores',
  
  // Campos para seguimiento de progreso
  COMPLETED_STEPS: 'completed_steps',
  STEP_NOTES: 'step_notes',
  
  // Campos para emails programados del plan de acción
  SCHEDULED_ACTION_PLAN_EMAILS: 'scheduled_action_plan_emails',
  ACTION_PLAN_EMAILS_LAST_UPDATED: 'action_plan_emails_last_updated',
  ACTION_PLAN_EMAILS_LAST_PROCESSED: 'action_plan_emails_last_processed'
};

// Dashboard expiration settings (in days)
export const DASHBOARD_EXPIRATION_DAYS = 30; // 30 days default

# Airtable Integration Setup

## Overview
This project now integrates with Airtable to manage dashboard data with user authentication, expiration dates, and one-user-one-dashboard rules.

## Setup Instructions

### 1. Airtable Base Setup
1. Go to [Airtable.com](https://airtable.com) and create a new base
2. Create a table called "Dashboards" with the following fields:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| user_email | Single line text | User's email address (unique) |
| dashboard_id | Single line text | Unique dashboard identifier |
| dashboard_data | Long text | JSON data of dashboard content |
| project_name | Single line text | Name of the project |
| project_type | Single select | Type of project (SaaS, Ecommerce, etc.) |
| business_idea | Long text | Business idea description |
| validation_status | Single select | Status (active, expired, etc.) |
| created_at | Date | Creation timestamp |
| updated_at | Date | Last update timestamp |
| expires_at | Date | Expiration timestamp |
| is_active | Checkbox | Whether dashboard is active |

### 2. Get Your Base ID
1. In your Airtable base, click on "Help" → "API Documentation"
2. Copy the "Base ID" from the URL (format: `appXXXXXXXXXXXXXX`)

### 3. Update Configuration
1. Open `src/config/airtable.ts`
2. Replace `your_base_id_here` with your actual Base ID:

```typescript
export const AIRTABLE_CONFIG = {
  API_KEY: 'patR2UdwZcHXP3keq', // Your token is already set
  BASE_ID: 'appXXXXXXXXXXXXXX', // Replace with your Base ID
  TABLE_NAME: 'Dashboards',
  VIEW_NAME: 'Grid view'
};
```

### 4. API Key
The API key `patR2UdwZcHXP3keq` is already configured in the code.

## Features

### User Management
- **One User, One Dashboard**: Each email can only have one active dashboard
- **Automatic Updates**: Existing dashboards are updated instead of creating duplicates
- **Email-based Authentication**: Users are identified by their email address

### Dashboard Expiration
- **30-Day Expiration**: Dashboards expire after 30 days by default
- **Expiration Modal**: Users see a modal when their dashboard expires
- **Renewal Option**: Users can extend their dashboard access
- **Automatic Cleanup**: Expired dashboards are marked as inactive

### Data Storage
- **Essential Fields Only**: Stores only necessary dashboard information
- **JSON Data**: Dashboard content is stored as structured JSON
- **Efficient Queries**: Minimizes API calls and data redundancy
- **Automatic Timestamps**: Creation and update times are automatically managed

## API Endpoints

The service provides the following operations:

- `findDashboardByEmail(email)`: Find existing dashboard for a user
- `createDashboard(email, data, projectInfo)`: Create new dashboard
- `updateDashboard(id, data, projectInfo)`: Update existing dashboard
- `extendDashboardExpiration(id)`: Extend dashboard access
- `deleteDashboard(id)`: Delete dashboard
- `getDashboardById(id)`: Get dashboard by ID

## Usage in Components

### Hook Usage
```typescript
const {
  dashboard,
  isLoading,
  error,
  isExpired,
  createOrUpdateDashboard,
  extendDashboard,
  deleteDashboard,
  refreshDashboard
} = useAirtableDashboard(email);
```

### Automatic Integration
- Dashboard data is automatically saved when users complete the form
- Expiration checks happen automatically on component mount
- Users can renew or delete expired dashboards

## Error Handling

- **Network Errors**: Automatic retry and fallback
- **Validation Errors**: Clear error messages for users
- **Expiration Handling**: Graceful degradation for expired content

## Security

- **API Key Protection**: API key is stored in configuration
- **User Isolation**: Users can only access their own dashboards
- **Data Validation**: Input validation before Airtable operations

## Testing

1. **Create Dashboard**: Fill out the form and submit
2. **Check Airtable**: Verify data appears in your Airtable base
3. **Test Expiration**: Manually set expiration date in Airtable
4. **Test Renewal**: Use the expiration modal to extend access

## Troubleshooting

### Common Issues
1. **"Base not found"**: Check your Base ID in the configuration
2. **"Permission denied"**: Verify your API key has access to the base
3. **"Table not found"**: Ensure the "Dashboards" table exists with correct field names

### Debug Mode
Check the browser console for detailed logging of all Airtable operations.

## Support

For Airtable-specific issues, refer to the [Airtable API Documentation](https://airtable.com/developers/web/api/introduction).

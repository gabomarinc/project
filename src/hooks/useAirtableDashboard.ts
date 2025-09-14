import { useState, useEffect, useCallback } from 'react';
import { AirtableService, DashboardRecord, DashboardSearchResult } from '../services/airtableService';

interface UseAirtableDashboardReturn {
  dashboard: DashboardRecord | null;
  isLoading: boolean;
  error: string | null;
  isExpired: boolean;
  createOrUpdateDashboard: (email: string, dashboardData: any, projectInfo: any) => Promise<boolean>;
  extendDashboard: () => Promise<boolean>;
  deleteDashboard: () => Promise<boolean>;
  refreshDashboard: () => Promise<void>;
}

export const useAirtableDashboard = (email: string): UseAirtableDashboardReturn => {
  const [dashboard, setDashboard] = useState<DashboardRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Load dashboard on mount
  useEffect(() => {
    if (email && email.trim().length > 0) {
      loadDashboard();
    }
  }, [email]);

  // Load dashboard from Airtable
  const loadDashboard = useCallback(async () => {
    if (!email || email.trim().length === 0) {
      console.log('⚠️ Skipping dashboard load - email is empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await AirtableService.findDashboardByEmail(email);
      
      if (result.success) {
        if (result.dashboard) {
          setDashboard(result.dashboard);
          setIsExpired(result.isExpired || false);
        } else {
          setDashboard(null);
          setIsExpired(false);
        }
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      setError(`Error loading dashboard: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Create or update dashboard
  const createOrUpdateDashboard = useCallback(async (
    email: string, 
    dashboardData: any, 
    projectInfo: any
  ): Promise<boolean> => {
    if (!email || email.trim().length === 0) {
      console.error('❌ Cannot create/update dashboard - email is empty');
      return false;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // First check if dashboard exists
      const existingResult = await AirtableService.findDashboardByEmail(email);
      
      let result: DashboardSearchResult;
      
      if (existingResult.success && existingResult.dashboard) {
        // Update existing dashboard
        result = await AirtableService.updateDashboard(
          existingResult.dashboard.id!,
          dashboardData,
          projectInfo
        );
      } else {
        // Create new dashboard
        result = await AirtableService.createDashboard(email, dashboardData, projectInfo);
      }

      if (result.success && result.dashboard) {
        setDashboard(result.dashboard);
        setIsExpired(false);
        return true;
      } else {
        setError(result.error || 'Failed to save dashboard');
        return false;
      }
    } catch (err) {
      setError(`Error loading dashboard: ${err}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Extend dashboard expiration
  const extendDashboard = useCallback(async (): Promise<boolean> => {
    if (!dashboard?.id) return false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await AirtableService.extendDashboardExpiration(dashboard.id);
      
      if (result.success && result.dashboard) {
        setDashboard(result.dashboard);
        setIsExpired(false);
        return true;
      } else {
        setError(result.error || 'Failed to extend dashboard');
        return false;
      }
    } catch (err) {
      setError(`Error extending dashboard: ${err}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [dashboard?.id]);

  // Delete dashboard
  const deleteDashboard = useCallback(async (): Promise<boolean> => {
    if (!dashboard?.id) return false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await AirtableService.deleteDashboard(dashboard.id);
      
      if (result.success) {
        setDashboard(null);
        setIsExpired(false);
        return true;
      } else {
        setError(result.error || 'Failed to delete dashboard');
        return false;
      }
    } catch (err) {
      setError(`Error deleting dashboard: ${err}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [dashboard?.id]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,
    isLoading,
    error,
    isExpired,
    createOrUpdateDashboard,
    extendDashboard,
    deleteDashboard,
    refreshDashboard
  };
};

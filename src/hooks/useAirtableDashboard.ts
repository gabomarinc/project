import { useState, useEffect, useCallback } from 'react';
import { AirtableService, DashboardRecord, DashboardSearchResult } from '../services/airtableService';

interface UseAirtableDashboardReturn {
  dashboard: DashboardRecord | null;
  isLoading: boolean;
  error: string | null;
  isExpired: boolean;
  createOrUpdateDashboard: (email: string, dashboardData: any, projectInfo: any, replaceExisting?: boolean) => Promise<boolean>;
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
  // replaceExisting: si es true, siempre crea un nuevo dashboard (desactivando los anteriores)
  // si es false, actualiza el dashboard activo existente si existe
  const createOrUpdateDashboard = useCallback(async (
    email: string, 
    dashboardData: any, 
    projectInfo: any,
    replaceExisting: boolean = true // Por defecto, reemplazar (crear nuevo)
  ): Promise<boolean> => {
    if (!email || email.trim().length === 0) {
      console.error('❌ Cannot create/update dashboard - email is empty');
      return false;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      let result: DashboardSearchResult;
      
      if (replaceExisting) {
        // Modo reemplazo: siempre crear un nuevo dashboard
        // El método createDashboard ya desactiva automáticamente los dashboards activos anteriores
        console.log('🔄 Modo reemplazo: creando nuevo dashboard (desactivando anteriores)');
        result = await AirtableService.createDashboard(email, dashboardData, projectInfo);
      } else {
        // Modo actualización: buscar dashboard activo y actualizarlo, o crear si no existe
        console.log('🔄 Modo actualización: buscando dashboard activo para actualizar');
        const existingResult = await AirtableService.findDashboardByEmail(email, true);
        
        if (existingResult.success && existingResult.dashboard) {
          // Update existing active dashboard
          result = await AirtableService.updateDashboard(
            existingResult.dashboard.id!,
            dashboardData,
            projectInfo
          );
        } else {
          // Create new dashboard if no active one exists
          result = await AirtableService.createDashboard(email, dashboardData, projectInfo);
        }
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

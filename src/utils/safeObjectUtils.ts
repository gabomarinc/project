/**
 * Safe object utilities to prevent Object.keys() errors
 */

/**
 * Safely get object keys, returning empty array if object is null/undefined
 */
export function safeObjectKeys(obj: any): string[] {
  if (obj && typeof obj === 'object' && obj !== null) {
    try {
      return Object.keys(obj);
    } catch (error) {
      console.warn('⚠️ Error getting object keys:', error);
      return [];
    }
  }
  return [];
}

/**
 * Safely get object entries, returning empty array if object is null/undefined
 */
export function safeObjectEntries(obj: any): [string, any][] {
  if (obj && typeof obj === 'object' && obj !== null) {
    try {
      return Object.entries(obj);
    } catch (error) {
      console.warn('⚠️ Error getting object entries:', error);
      return [];
    }
  }
  return [];
}

/**
 * Safely get object values, returning empty array if object is null/undefined
 */
export function safeObjectValues(obj: any): any[] {
  if (obj && typeof obj === 'object' && obj !== null) {
    try {
      return Object.values(obj);
    } catch (error) {
      console.warn('⚠️ Error getting object values:', error);
      return [];
    }
  }
  return [];
}

/**
 * Safely check if object has keys
 */
export function hasObjectKeys(obj: any): boolean {
  return safeObjectKeys(obj).length > 0;
}

/**
 * Safely get object size (number of keys)
 */
export function getObjectSize(obj: any): number {
  return safeObjectKeys(obj).length;
}


// Utilidades para manejo de fechas de vencimiento del plan de acción

export interface DeadlineInfo {
  dueDate: string; // YYYY-MM-DD format
  daysRemaining: number;
  isOverdue: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'due_today' | 'overdue' | 'completed';
}

/**
 * Analiza la dificultad de un paso basándose en su contenido
 */
const analyzeStepDifficulty = (stepContent: string, stepNumber: number): number => {
  const content = stepContent.toLowerCase();
  
  // Palabras clave que indican dificultad alta
  const highDifficultyKeywords = [
    'desarrollo', 'programación', 'codificación', 'arquitectura', 'sistema',
    'tecnología', 'software', 'aplicación', 'plataforma', 'infraestructura',
    'escalabilidad', 'optimización', 'integración', 'api', 'base de datos',
    'monetización', 'ingresos', 'financiero', 'inversión', 'capital',
    'expansión', 'internacional', 'mercados', 'global', 'multinacional'
  ];
  
  // Palabras clave que indican dificultad media
  const mediumDifficultyKeywords = [
    'validación', 'pruebas', 'testing', 'feedback', 'usuarios',
    'lanzamiento', 'marketing', 'promoción', 'comunicación',
    'operaciones', 'procesos', 'gestión', 'administración',
    'análisis', 'investigación', 'estudio', 'evaluación'
  ];
  
  // Palabras clave que indican dificultad baja
  const lowDifficultyKeywords = [
    'planificación', 'organización', 'estructura', 'diseño',
    'documentación', 'registro', 'creación', 'establecimiento',
    'configuración', 'setup', 'instalación', 'preparación'
  ];
  
  // Contar palabras clave por dificultad
  const highCount = highDifficultyKeywords.filter(keyword => content.includes(keyword)).length;
  const mediumCount = mediumDifficultyKeywords.filter(keyword => content.includes(keyword)).length;
  const lowCount = lowDifficultyKeywords.filter(keyword => content.includes(keyword)).length;
  
  // Dificultad basada en posición del paso (los primeros pasos suelen ser más fáciles)
  const positionDifficulty = stepNumber <= 2 ? 0.5 : stepNumber <= 4 ? 1 : 1.5;
  
  // Calcular dificultad total
  let difficulty = 1; // Base
  
  if (highCount > 0) difficulty += highCount * 2;
  if (mediumCount > 0) difficulty += mediumCount * 1;
  if (lowCount > 0) difficulty += lowCount * 0.5;
  
  difficulty += positionDifficulty;
  
  // Normalizar entre 1 y 5
  return Math.min(5, Math.max(1, difficulty));
};

/**
 * Calcula fechas de vencimiento realistas considerando la dificultad de cada paso.
 * 
 * @param actionPlanSteps Lista de pasos del plan de acción
 * @param baseDate Fecha base desde la cual contar (por defecto, hoy).
 *        IMPORTANTE: para dashboards ya creados, usar siempre la fecha original
 *        (por ejemplo, generatedAt o created_at) para que las fechas no cambien
 *        cada vez que el usuario abre el dashboard.
 */
export const calculateDeadlines = (
  actionPlanSteps: string[],
  baseDate?: string | Date
): string[] => {
  const deadlines: string[] = [];
  const startDate = baseDate ? new Date(baseDate) : new Date();
  const totalSteps = actionPlanSteps.length;
  
  // Analizar dificultad de cada paso
  const stepDifficulties = actionPlanSteps.map((step, index) => 
    analyzeStepDifficulty(step, index + 1)
  );
  
  console.log('📊 Step difficulties:', stepDifficulties);
  
  // Calcular días totales necesarios basándose en dificultad
  const totalDifficultyDays = stepDifficulties.reduce((sum, difficulty) => sum + difficulty, 0);
  const maxDays = 28; // Máximo 28 días para dejar buffer
  
  // Distribuir días proporcionalmente según dificultad
  let currentDay = 2; // Empezar en día 2
  
  for (let i = 0; i < totalSteps; i++) {
    const difficulty = stepDifficulties[i];
    const stepDays = Math.round((difficulty / totalDifficultyDays) * (maxDays - 2));
    const actualStepDays = Math.max(1, Math.min(stepDays, 7)); // Entre 1 y 7 días por paso
    
    currentDay += actualStepDays;
    
    // Asegurar que no exceda 28 días
    currentDay = Math.min(currentDay, 28);
    
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + currentDay);
    
    deadlines.push(dueDate.toISOString().split('T')[0]);
    
    console.log(`📅 Step ${i + 1}: ${actualStepDays} days, due: ${dueDate.toISOString().split('T')[0]}`);
  }
  
  return deadlines;
};

/**
 * Calcula información detallada de vencimiento para un paso específico
 */
export const getDeadlineInfo = (dueDate: string, isCompleted: boolean = false): DeadlineInfo => {
  const today = new Date();
  const due = new Date(dueDate);
  const timeDiff = due.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  const isOverdue = daysRemaining < 0 && !isCompleted;
  const isDueToday = daysRemaining === 0 && !isCompleted;
  
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  let status: 'upcoming' | 'due_today' | 'overdue' | 'completed';
  
  if (isCompleted) {
    urgencyLevel = 'low';
    status = 'completed';
  } else if (isOverdue) {
    urgencyLevel = 'critical';
    status = 'overdue';
  } else if (isDueToday) {
    urgencyLevel = 'high';
    status = 'due_today';
  } else if (daysRemaining <= 2) {
    urgencyLevel = 'high';
    status = 'upcoming';
  } else if (daysRemaining <= 7) {
    urgencyLevel = 'medium';
    status = 'upcoming';
  } else {
    urgencyLevel = 'low';
    status = 'upcoming';
  }
  
  return {
    dueDate,
    daysRemaining,
    isOverdue,
    urgencyLevel,
    status
  };
};

/**
 * Obtiene el color CSS apropiado para el nivel de urgencia
 */
export const getUrgencyColor = (urgencyLevel: string): string => {
  switch (urgencyLevel) {
    case 'critical':
      return 'text-red-500 bg-red-500/10 border-red-500/30';
    case 'high':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    case 'low':
      return 'text-green-500 bg-green-500/10 border-green-500/30';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
  }
};

/**
 * Obtiene el icono apropiado para el estado de vencimiento
 */
export const getDeadlineIcon = (status: string): string => {
  switch (status) {
    case 'overdue':
      return '⚠️';
    case 'due_today':
      return '🔥';
    case 'upcoming':
      return '📅';
    case 'completed':
      return '✅';
    default:
      return '📅';
  }
};

/**
 * Formatea la fecha para mostrar de manera amigable
 */
export const formatDeadlineDate = (dueDate: string): string => {
  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  if (isToday) {
    return 'Hoy';
  } else if (isTomorrow) {
    return 'Mañana';
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }
};

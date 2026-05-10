// Все функции расчёта для "Камней Силы"

export interface AssessmentInput {
  excitability_ms: number; // dT_max - возбудимость
  lability_ms: number;     // dT_min - лабильность
  stability_ms: number;    // dT_rash - устойчивость
}

export interface AssessmentResult {
  energy_pct: number;       // Энергия на основе возбудимости
  flexibility_pct: number;  // Гибкость на основе лабильности
  stability_pct: number;    // Стабильность
  integral_pct: number;     // Интегральный показатель
  stones_awarded: number;   // Получено камней силы
  energy_level: ResourceLevel;
  flexibility_level: ResourceLevel;
  stability_level: ResourceLevel;
  overall_level: ResourceLevel;
  recommendation: string;
}

export type ResourceLevel = 'low' | 'medium' | 'high';

/**
 * Расчёт энергии (возбудимость, dT_max)
 * Норма: 600-1000 мс, оптимум 800 мс
 */
export function calcEnergy(dT_max: number): number {
  // Оптимальный диапазон: 650-950 → 100%
  if (dT_max >= 650 && dT_max <= 950) return 100;
  // Критический выход: < 500 или > 1200 → 0%
  if (dT_max < 500 || dT_max > 1200) return 0;
  // Линейное снижение от оптимума
  if (dT_max < 650) {
    // 500-650: линейный рост от 0 до 100
    return Math.round(((dT_max - 500) / 150) * 100);
  }
  // 950-1200: линейное падение от 100 до 0
  return Math.round(((1200 - dT_max) / 250) * 100);
}

/**
 * Расчёт гибкости (лабильность, dT_min)
 * Норма: 100-300 мс, оптимум 200 мс
 */
export function calcFlexibility(dT_min: number): number {
  // dT_min <= 100: 100%
  if (dT_min <= 100) return 100;
  // dT_min >= 400: 0%
  if (dT_min >= 400) return 0;
  // 100-400: 100% - (dT_min - 100) / 3
  return Math.round(100 - (dT_min - 100) / 3);
}

/**
 * Расчёт стабильности (устойчивость, dT_rash)
 * Норма: 2000-3000 мс, оптимум 2500 мс
 */
export function calcStability(dT_rash: number): number {
  // dT_rash >= 2500: 100%
  if (dT_rash >= 2500) return 100;
  // dT_rash <= 1500: 0%
  if (dT_rash <= 1500) return 0;
  // 1500-2500: (dT_rash - 1500) / 10
  return Math.round((dT_rash - 1500) / 10);
}

/**
 * Интегральный показатель (среднее арифметическое)
 */
export function calcIntegral(energy: number, flexibility: number, stability: number): number {
  return Math.round((energy + flexibility + stability) / 3);
}

/**
 * Расчёт камней силы на основе минимального ресурса
 * Низкий < 40% → 10 камней
 * Средний 40-69% → 25 камней
 * Высокий >= 70% → 40 камней
 */
export function calcStonesAwarded(integral: number): number {
  if (integral < 40) return 10;
  if (integral < 70) return 25;
  return 40;
}

/**
 * Определение уровня ресурса
 */
export function getResourceLevel(percent: number): ResourceLevel {
  if (percent < 40) return 'low';
  if (percent < 70) return 'medium';
  return 'high';
}

/**
 * Генерация рекомендации на основе интегрального показателя
 */
export function getRecommendation(integral: number): string {
  if (integral < 40) {
    return 'Ваш ресурс на критически низком уровне. Рекомендуется отдых и восстановление. Отложите сложные задачи и сосредоточьтесь на базовых активностях.';
  }
  if (integral < 70) {
    return 'Средний уровень ресурса. Вы можете работать, но избегайте перегрузок. Чередуйте задачи с отдыхом.';
  }
  return 'Отличный уровень ресурса! Вы полны энергии и готовы к продуктивной работе. Беритесь за сложные задачи.';
}

/**
 * Полный расчёт всех показателей
 */
export function performFullAssessment(input: AssessmentInput): AssessmentResult {
  const energy_pct = calcEnergy(input.excitability_ms);
  const flexibility_pct = calcFlexibility(input.lability_ms);
  const stability_pct = calcStability(input.stability_ms);
  const integral_pct = calcIntegral(energy_pct, flexibility_pct, stability_pct);
  const stones_awarded = calcStonesAwarded(integral_pct);

  return {
    energy_pct,
    flexibility_pct,
    stability_pct,
    integral_pct,
    stones_awarded,
    energy_level: getResourceLevel(energy_pct),
    flexibility_level: getResourceLevel(flexibility_pct),
    stability_level: getResourceLevel(stability_pct),
    overall_level: getResourceLevel(integral_pct),
    recommendation: getRecommendation(integral_pct),
  };
}

/**
 * Расчёт опыта за задачу
 */
export function calcTaskXp(complexity: 'low' | 'medium' | 'high'): number {
  switch (complexity) {
    case 'low': return 10;
    case 'medium': return 25;
    case 'high': return 50;
  }
}

/**
 * Расчёт уровня на основе XP
 */
export function calcLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * XP needed for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}

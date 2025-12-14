import { SelectOption } from 'src/app/models/types/select-option';

/**
 * Period filter for which debates to include in statistics
 * Uses absolute years for historical analysis
 */
export enum DebatePeriod {
  ALL_TIME = 'all'
  // Additional years are generated dynamically from debate data
}

/**
 * Period filter for member activity - relative time periods
 * Determines which members appear in rankings (must have participated within this window)
 */
export enum ActivityPeriod {
  ALL_TIME = 'all',
  LAST_12_MONTHS = '12m',
  LAST_6_MONTHS = '6m',
  LAST_3_MONTHS = '3m',
  LAST_1_MONTH = '1m'
}

/**
 * Dashboard filter state
 */
export interface DashboardFilters {
  /** Which debates to include (by year) */
  debatePeriod: string;
  /** Which members to show based on recent activity */
  activityPeriod: ActivityPeriod;
  /** Filter by society */
  society: string | null;
  /** Filter by selective process */
  selectiveProcess: string | null;
}

/**
 * Constants for dashboard calculations
 */
export const DASHBOARD_CONSTANTS = {
  /** Minimum debates required for average-based rankings */
  MIN_DEBATES_FOR_AVERAGE: 5,
  /** Number of top placements to show in rankings */
  TOP_PLACEMENTS_COUNT: 3,
  /** Minimum participations to be considered "active" */
  MIN_PARTICIPATIONS_FOR_ACTIVE: 5
};

/**
 * Activity period select options for UI dropdowns
 */
export const ACTIVITY_PERIOD_OPTIONS: SelectOption[] = [
  { value: ActivityPeriod.ALL_TIME, viewValue: 'Todo o tempo' },
  { value: ActivityPeriod.LAST_12_MONTHS, viewValue: 'Últimos 12 meses' },
  { value: ActivityPeriod.LAST_6_MONTHS, viewValue: 'Últimos 6 meses' },
  { value: ActivityPeriod.LAST_3_MONTHS, viewValue: 'Últimos 3 meses' },
  { value: ActivityPeriod.LAST_1_MONTH, viewValue: 'Último mês' }
];

/**
 * Default filter values
 */
export const DEFAULT_FILTERS: DashboardFilters = {
  debatePeriod: DebatePeriod.ALL_TIME,
  activityPeriod: ActivityPeriod.ALL_TIME,
  society: 'SDUFRJ',
  selectiveProcess: null
};

/**
 * Game constants for the Chronicles simulator
 * Centralized configuration for all magic numbers and tunable parameters
 */

// ============================================================================
// INITIAL GAME SETTINGS
// ============================================================================

/** Starting year of the simulation */
export const INITIAL_YEAR = -8000;

/** Number of initial married couples */
export const INITIAL_COUPLES = 100;

/** Starting food supply */
export const INITIAL_FOOD = 2000;

/** Age of initial population */
export const INITIAL_AGE = 15;

// ============================================================================
// MORTALITY MODEL (Gompertz)
// ============================================================================
// μ(age) = a * exp(b * (age - c))
// Tuned for ~60 year average lifespan in pre-modern conditions

/** Baseline mortality rate */
export const GOMPERTZ_A = 0.003;

/** Mortality acceleration factor */
export const GOMPERTZ_B = 0.08;

/** Age offset for mortality calculation */
export const GOMPERTZ_C = 15;

/** Infant mortality rate (age 0-4) - 5% per year */
export const INFANT_MORTALITY_RATE = 0.05;

/** Child mortality rate (age 5-14) - 1% per year */
export const CHILD_MORTALITY_RATE = 0.01;

/** Maximum death probability cap */
export const MAX_DEATH_PROBABILITY = 0.95;

// ============================================================================
// POPULATION MECHANICS
// ============================================================================

/** Minimum age for adulthood (marriage, work) */
export const ADULT_AGE = 15;

/** Maximum age for workers */
export const WORKER_MAX_AGE = 49;

/** Minimum age for fertility */
export const FERTILITY_MIN_AGE = 15;

/** Maximum age for fertility */
export const FERTILITY_MAX_AGE = 30;

/** Annual probability of conception for fertile married women */
export const FERTILITY_RATE = 0.3;

/** Annual probability of unmarried adults getting married */
export const MARRIAGE_RATE = 0.5;

// ============================================================================
// FOOD & ECONOMY
// ============================================================================

/** Food produced per worker per year */
export const FOOD_PER_WORKER = 10;

/** Food consumed per person per year */
export const FOOD_PER_PERSON = 1;

/** Divisor for calculating starvation deaths from food deficit */
export const STARVATION_DIVISOR = 5;

// ============================================================================
// FOOD STATUS THRESHOLDS
// ============================================================================

/** Food per person threshold for "Abundant" status */
export const FOOD_STATUS_ABUNDANT = 20;

/** Food per person threshold for "Sufficient" status */
export const FOOD_STATUS_SUFFICIENT = 10;

/** Food per person threshold for "Scarce" status */
export const FOOD_STATUS_SCARCE = 5;

// ============================================================================
// STORAGE & PERSISTENCE
// ============================================================================

/** LocalStorage key for save data */
export const STORAGE_KEY = "chronicles-save";

/** Save data version for compatibility checking */
export const SAVE_VERSION = 1;

/** Save interval in ticks */
export const SAVE_INTERVAL = 10;

/** Maximum number of log entries to keep */
export const MAX_LOG_ENTRIES = 50;

/** Maximum number of history points to keep */
export const MAX_HISTORY_POINTS = 1000;

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

/** Default chart height in pixels */
export const CHART_HEIGHT = 120;

/** Chart margins */
export const CHART_MARGIN = { top: 20, right: 20, bottom: 30, left: 50 };

/** Throttle interval for chart updates (ms) */
export const CHART_THROTTLE_MS = 100;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

/** Row height for virtualized tables */
export const TABLE_ROW_HEIGHT = 36;

/** Speed options for simulation */
export const SPEED_OPTIONS = [
  { value: 1, key: "1" },
  { value: 2, key: "2" },
  { value: 5, key: "3" },
  { value: 10, key: "4" },
] as const;

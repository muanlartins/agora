import { Member } from 'src/app/models/types/member';

/**
 * A placement within a ranking (1st, 2nd, or 3rd place)
 */
export interface Placement {
  /** Display title with the statistic value (e.g., "Em primeiro lugar, com 15 primeiros") */
  title: string;
  /** Members who achieved this placement (can be multiple in case of ties) */
  members: Member[];
  /** Numeric value used for sorting/comparison */
  value: number;
}

/**
 * A ranking category (e.g., "Most Firsts", "Highest Average")
 */
export interface Rank {
  /** Ranking title with HTML formatting (e.g., "Debatedores que mais <b>primeiraram</b>") */
  title: string;
  /** Optional disclaimer/footnote explaining criteria */
  disclaimer?: string;
  /** Array of placements (typically 3: 1st, 2nd, 3rd) */
  placements: Placement[];
}

/**
 * A field within a statistic section
 */
export interface StatisticField {
  /** Field title */
  title: string;
  /** Optional description */
  description?: string;
  /** Whether this field contains a chart */
  chart?: boolean;
  /** Whether this field should be full-width */
  full?: boolean;
}

/**
 * A statistic section with title and fields (charts or text)
 */
export interface Statistic {
  /** Section title with HTML formatting */
  title: string;
  /** Array of fields (charts, descriptions, etc.) */
  fields: StatisticField[];
}

/**
 * Pre-calculated member statistics used across multiple rankings
 * This is computed once and reused to avoid duplicate calculations
 */
export interface MemberStatistics {
  /** Number of first place finishes per member ID */
  firsts: Record<string, number>;
  /** Number of wins (1st or 2nd place) per member ID */
  wins: Record<string, number>;
  /** Number of debates as debater per member ID */
  participationsAsDebater: Record<string, number>;
  /** Number of debates as judge (chair or wing) per member ID */
  participationsAsJudge: Record<string, number>;
  /** Total speaker points per member ID (to be divided by participations) */
  totalSps: Record<string, number>;
  /** Highest single speaker points score per member ID */
  highestSps: Record<string, number>;
  /** Number of debates including iron (debating twice in same debate) */
  participationsIncludingIron: Record<string, number>;
}

/**
 * Ranking type identifiers for selective generation
 */
export enum RankingType {
  MOST_FIRSTS = 'mostFirsts',
  FIRSTS_AVERAGE = 'firstsAverage',
  MOST_WINS = 'mostWins',
  WINS_AVERAGE = 'winsAverage',
  MOST_ACTIVE_DEBATERS = 'mostActiveDebaters',
  MOST_ACTIVE_JUDGES = 'mostActiveJudges',
  SPS_AVERAGE = 'spsAverage',
  HIGHEST_SPS = 'highestSps'
}

import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Debate } from 'src/app/models/types/debate';
import { Member } from 'src/app/models/types/member';
import { UtilService } from 'src/app/services/util.service';
import {
  DashboardFilters,
  DebatePeriod,
  ActivityPeriod,
  DASHBOARD_CONSTANTS
} from '../models/dashboard-filter.model';

/**
 * Service for filtering debates and members based on dashboard filter criteria
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardFilterService {
  constructor(private utilService: UtilService) {}

  /**
   * Apply all filters to debates and members
   * Note: Activity period filter uses ALL debates to determine member activity,
   * not just the filtered debates. This allows showing "2024 stats for recently active members".
   */
  applyFilters(
    debates: Debate[],
    members: Member[],
    filters: DashboardFilters,
    allDebates?: Debate[]
  ): { filteredDebates: Debate[]; filteredMembers: Member[] } {
    let filteredDebates = debates;
    let filteredMembers = members.filter(m => !m.blocked);

    // 1. Apply debate period filter (which debates to include)
    filteredDebates = this.filterDebatesByDebatePeriod(filteredDebates, filters.debatePeriod);

    // 2. Apply activity period filter (which members to show based on recent activity)
    // Uses ALL debates to check activity, not just filtered debates
    if (filters.activityPeriod !== ActivityPeriod.ALL_TIME) {
      const debatesForActivityCheck = allDebates || debates;
      filteredMembers = this.filterMembersByActivityPeriod(
        filteredMembers,
        debatesForActivityCheck,
        filters.activityPeriod
      );
    }

    // 3. Apply society filter
    if (filters.society) {
      filteredDebates = this.utilService.getDebatesWithSociety(filteredDebates, filters.society);
      filteredMembers = this.utilService.getMembersFromSociety(filteredMembers, filters.society);
    }

    // 4. Apply selective process filter
    if (filters.selectiveProcess) {
      filteredDebates = this.utilService.getDebatesWithSelectiveProcess(
        filteredDebates,
        filters.selectiveProcess
      );
      filteredMembers = this.utilService.getMembersFromSelectiveProcess(
        filteredMembers,
        filters.selectiveProcess
      );
    }

    return { filteredDebates, filteredMembers };
  }

  /**
   * Filter debates by absolute year
   */
  filterDebatesByDebatePeriod(debates: Debate[], period: string): Debate[] {
    if (period === DebatePeriod.ALL_TIME) {
      return debates;
    }

    const year = parseInt(period, 10);
    if (isNaN(year)) {
      return debates;
    }

    return debates.filter(debate => moment(debate.date).year() === year);
  }

  /**
   * Filter members who participated in debates within the activity window
   */
  filterMembersByActivityPeriod(
    members: Member[],
    allDebates: Debate[],
    period: ActivityPeriod
  ): Member[] {
    const cutoffDate = this.getActivityCutoffDate(period);

    // Get debates within the activity window
    const recentDebates = allDebates.filter(debate =>
      moment(debate.date).isAfter(cutoffDate)
    );

    // Get member IDs who participated in recent debates
    const activeMemberIds = new Set<string>();
    recentDebates.forEach(debate => {
      debate.debaters.forEach(d => activeMemberIds.add(d.id));
      activeMemberIds.add(debate.chair.id);
      debate.wings?.forEach(w => activeMemberIds.add(w.id));
    });

    return members.filter(m => activeMemberIds.has(m.id));
  }

  /**
   * Get available years from debates (for dynamic year options)
   */
  getAvailableYears(debates: Debate[]): number[] {
    const years = new Set<number>();
    debates.forEach(debate => years.add(moment(debate.date).year()));
    return Array.from(years).sort((a, b) => b - a); // Descending order (most recent first)
  }

  /**
   * Filter to only members who have participated in the given debates
   */
  filterActiveMembers(members: Member[], debates: Debate[]): Member[] {
    const participatingMemberIds = new Set<string>();

    debates.forEach(debate => {
      // Add debaters
      debate.debaters.forEach(d => participatingMemberIds.add(d.id));
      // Add chair
      participatingMemberIds.add(debate.chair.id);
      // Add wings
      if (debate.wings?.length) {
        debate.wings.forEach(w => participatingMemberIds.add(w.id));
      }
    });

    return members.filter(m => participatingMemberIds.has(m.id));
  }

  /**
   * Get members with minimum participation threshold
   */
  getActiveMembersWithThreshold(
    members: Member[],
    debates: Debate[],
    minParticipations: number = DASHBOARD_CONSTANTS.MIN_DEBATES_FOR_AVERAGE
  ): Member[] {
    const participations = this.calculateParticipations(members, debates);
    return members.filter(m => participations[m.id] >= minParticipations);
  }

  /**
   * Calculate total participations (as debater, chair, or wing) per member
   */
  calculateParticipations(members: Member[], debates: Debate[]): Record<string, number> {
    const participations: Record<string, number> = {};
    members.forEach(m => (participations[m.id] = 0));

    debates.forEach(debate => {
      // Count debater participations
      debate.debaters.forEach(d => {
        if (participations[d.id] !== undefined) {
          participations[d.id]++;
        }
      });
      // Count chair participation
      if (participations[debate.chair.id] !== undefined) {
        participations[debate.chair.id]++;
      }
      // Count wing participations
      if (debate.wings?.length) {
        debate.wings.forEach(w => {
          if (participations[w.id] !== undefined) {
            participations[w.id]++;
          }
        });
      }
    });

    return participations;
  }

  /**
   * Calculate debater-only participations per member
   */
  calculateDebaterParticipations(members: Member[], debates: Debate[]): Record<string, number> {
    const participations: Record<string, number> = {};
    members.forEach(m => (participations[m.id] = 0));

    debates.forEach(debate => {
      debate.debaters.forEach(d => {
        if (participations[d.id] !== undefined) {
          participations[d.id]++;
        }
      });
    });

    return participations;
  }

  /**
   * Calculate judge-only participations (chair + wing) per member
   */
  calculateJudgeParticipations(members: Member[], debates: Debate[]): Record<string, number> {
    const participations: Record<string, number> = {};
    members.forEach(m => (participations[m.id] = 0));

    debates.forEach(debate => {
      if (participations[debate.chair.id] !== undefined) {
        participations[debate.chair.id]++;
      }
      if (debate.wings?.length) {
        debate.wings.forEach(w => {
          if (participations[w.id] !== undefined) {
            participations[w.id]++;
          }
        });
      }
    });

    return participations;
  }

  /**
   * Get cutoff date for activity period
   */
  private getActivityCutoffDate(period: ActivityPeriod): moment.Moment {
    switch (period) {
      case ActivityPeriod.LAST_12_MONTHS:
        return moment().subtract(12, 'months');
      case ActivityPeriod.LAST_6_MONTHS:
        return moment().subtract(6, 'months');
      case ActivityPeriod.LAST_3_MONTHS:
        return moment().subtract(3, 'months');
      case ActivityPeriod.LAST_1_MONTH:
        return moment().subtract(1, 'month');
      default:
        return moment(0); // Unix epoch - effectively "all time"
    }
  }
}

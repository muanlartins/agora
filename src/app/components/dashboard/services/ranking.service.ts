import { Injectable } from '@angular/core';
import { Debate } from 'src/app/models/types/debate';
import { Member } from 'src/app/models/types/member';
import { UtilService } from 'src/app/services/util.service';
import { DASHBOARD_CONSTANTS } from '../models/dashboard-filter.model';
import { MemberStatistics, Placement, Rank } from '../models/ranking.model';

/**
 * Service for calculating dashboard rankings
 */
@Injectable({
  providedIn: 'root'
})
export class RankingService {
  constructor(private utilService: UtilService) {}

  /**
   * Calculate all rankings from filtered debates and members
   */
  calculateAllRankings(
    debates: Debate[],
    members: Member[],
    minDebates: number = DASHBOARD_CONSTANTS.MIN_DEBATES_FOR_AVERAGE,
    topCount: number = DASHBOARD_CONSTANTS.TOP_PLACEMENTS_COUNT
  ): Rank[] {
    // Pre-calculate all member statistics in a single pass
    const stats = this.calculateMemberStatistics(debates, members);

    // Get active members (those with minimum debate threshold)
    const activeMembers = members.filter(m => stats.participationsAsDebater[m.id] >= minDebates);

    // Generate all rankings
    const rankings: Rank[] = [
      this.calculateMostFirsts(stats, members, topCount),
      this.calculateFirstsAverage(stats, members, activeMembers, topCount),
      this.calculateMostWins(stats, members, topCount),
      this.calculateWinsAverage(stats, members, activeMembers, topCount),
      this.calculateMostActiveDebaters(stats, members, topCount),
      this.calculateMostActiveJudges(stats, members, topCount),
      this.calculateSpsAverage(stats, members, activeMembers, topCount),
      this.calculateHighestSps(stats, activeMembers, topCount)
    ];

    // Filter out rankings with empty placements
    return rankings
      .map(rank => ({
        ...rank,
        placements: rank.placements.filter(p => !!p.value)
      }))
      .filter(rank => rank.placements.length > 0);
  }

  /**
   * Calculate all member statistics in a single pass through debates
   */
  calculateMemberStatistics(debates: Debate[], members: Member[]): MemberStatistics {
    const stats: MemberStatistics = {
      firsts: {},
      wins: {},
      participationsAsDebater: {},
      participationsAsJudge: {},
      totalSps: {},
      highestSps: {},
      participationsIncludingIron: {}
    };

    // Initialize all members
    members.forEach(m => {
      stats.firsts[m.id] = 0;
      stats.wins[m.id] = 0;
      stats.participationsAsDebater[m.id] = 0;
      stats.participationsAsJudge[m.id] = 0;
      stats.totalSps[m.id] = 0;
      stats.highestSps[m.id] = 0;
      stats.participationsIncludingIron[m.id] = 0;
    });

    // Process each debate
    debates.forEach(debate => {
      const firstPlaceIndex = debate.points.findIndex(p => p === 3);
      const secondPlaceIndex = debate.points.findIndex(p => p === 2);

      // Process debaters
      const processedDebaterIds = new Set<string>();
      debate.debaters.forEach((debater, index) => {
        const id = debater.id;
        if (stats.participationsAsDebater[id] === undefined) return;

        // Count participation (only once per debate, even for irons)
        if (!processedDebaterIds.has(id)) {
          stats.participationsAsDebater[id]++;
          processedDebaterIds.add(id);
        }

        // Track iron participations
        if (this.utilService.isDebaterIronOnDebate(debate, debater)) {
          stats.participationsIncludingIron[id] = stats.participationsAsDebater[id] + 1;
        } else {
          stats.participationsIncludingIron[id] = stats.participationsAsDebater[id];
        }

        // Process speaker points (skip duplicate entries for irons)
        if (debate.sps?.length) {
          // Skip if this is the second occurrence of an iron debater
          if (index >= 2 && debate.debaters[index - 2]?.id === id) {
            return;
          }
          stats.totalSps[id] += debate.sps[index] || 0;
          stats.highestSps[id] = Math.max(stats.highestSps[id], debate.sps[index] || 0);
        }
      });

      // Calculate firsts and wins
      this.processPlacement(debate, firstPlaceIndex, stats.firsts);
      this.processPlacement(debate, firstPlaceIndex, stats.wins);
      this.processPlacement(debate, secondPlaceIndex, stats.wins);

      // Count judge participations
      if (stats.participationsAsJudge[debate.chair.id] !== undefined) {
        stats.participationsAsJudge[debate.chair.id]++;
      }
      if (debate.wings?.length) {
        debate.wings.forEach(wing => {
          if (stats.participationsAsJudge[wing.id] !== undefined) {
            stats.participationsAsJudge[wing.id]++;
          }
        });
      }
    });

    return stats;
  }

  /**
   * Process a placement (1st or 2nd) and increment the counter for debaters in that house
   */
  private processPlacement(
    debate: Debate,
    houseIndex: number,
    counter: Record<string, number>
  ): void {
    if (houseIndex === -1) return;

    const firstDebaterIndex = this.utilService.getFirstDebaterIndexByHouseIndex(houseIndex);
    const secondDebaterIndex = firstDebaterIndex + 2;

    const firstDebater = debate.debaters[firstDebaterIndex];
    const secondDebater = debate.debaters[secondDebaterIndex];

    if (firstDebater && counter[firstDebater.id] !== undefined) {
      counter[firstDebater.id]++;
    }

    // Only count second debater if different from first (not an iron)
    if (secondDebater && secondDebater.id !== firstDebater?.id && counter[secondDebater.id] !== undefined) {
      counter[secondDebater.id]++;
    }
  }

  /**
   * Get top N unique values and their members
   */
  private getTopPlacements(
    values: Record<string, number>,
    members: Member[],
    topCount: number,
    formatTitle: (value: number, position: string) => string
  ): Placement[] {
    const uniqueValues = [...new Set(Object.values(values))]
      .filter(v => v > 0)
      .sort((a, b) => b - a);

    const positions = ['primeiro', 'segundo', 'terceiro'];
    const placements: Placement[] = [];

    for (let i = 0; i < Math.min(topCount, uniqueValues.length); i++) {
      const value = uniqueValues[i];
      placements.push({
        title: formatTitle(value, positions[i]),
        members: members.filter(m => values[m.id] === value),
        value
      });
    }

    return placements;
  }

  // Individual ranking calculations

  private calculateMostFirsts(stats: MemberStatistics, members: Member[], topCount: number): Rank {
    return {
      title: 'Debatedores que mais <b>primeiraram</b>',
      placements: this.getTopPlacements(
        stats.firsts,
        members,
        topCount,
        (value, pos) => `Em <b>${pos}</b> lugar, com <b>${value}</b> primeiro${value !== 1 ? 's' : ''}`
      )
    };
  }

  private calculateFirstsAverage(
    stats: MemberStatistics,
    allMembers: Member[],
    activeMembers: Member[],
    topCount: number
  ): Rank {
    const averages: Record<string, number> = {};
    activeMembers.forEach(m => {
      averages[m.id] = stats.firsts[m.id] / stats.participationsAsDebater[m.id];
    });

    return {
      title: 'Debatedores com a maior <b>média</b>¹ de <b>primeiros</b>',
      disclaimer: `<b>¹</b> Apenas membros com <b>${DASHBOARD_CONSTANTS.MIN_DEBATES_FOR_AVERAGE}</b> ou mais debates registrados entram para esse ranking`,
      placements: this.getTopPlacements(
        averages,
        activeMembers,
        topCount,
        (value, pos) => `Em <b>${pos}</b> lugar, com uma média de <b>${(value * 100).toFixed(2)}%</b> de primeiros`
      )
    };
  }

  private calculateMostWins(stats: MemberStatistics, members: Member[], topCount: number): Rank {
    return {
      title: 'Debatedores que mais <b>ganharam</b>¹',
      disclaimer: '<b>¹</b> Ganhar é <b>primeirar ou segundar</b>',
      placements: this.getTopPlacements(
        stats.wins,
        members,
        topCount,
        (value, pos) => `Em <b>${pos}</b> lugar, com <b>${value}</b> vitória${value !== 1 ? 's' : ''}`
      )
    };
  }

  private calculateWinsAverage(
    stats: MemberStatistics,
    allMembers: Member[],
    activeMembers: Member[],
    topCount: number
  ): Rank {
    const averages: Record<string, number> = {};
    activeMembers.forEach(m => {
      averages[m.id] = stats.wins[m.id] / stats.participationsAsDebater[m.id];
    });

    return {
      title: 'Debatedores com a maior <b>média</b>¹ de <b>vitórias</b>²',
      disclaimer: `<b>¹</b> Apenas membros com <b>${DASHBOARD_CONSTANTS.MIN_DEBATES_FOR_AVERAGE}</b> ou mais debates registrados entram para esse ranking<br><b>²</b> Ganhar é <b>primeirar ou segundar</b>`,
      placements: this.getTopPlacements(
        averages,
        activeMembers,
        topCount,
        (value, pos) => `Em <b>${pos}</b> lugar, com uma média de <b>${(value * 100).toFixed(2)}%</b> de vitórias`
      )
    };
  }

  private calculateMostActiveDebaters(
    stats: MemberStatistics,
    members: Member[],
    topCount: number
  ): Rank {
    return {
      title: 'Debatedores mais <b>ativos</b>¹',
      disclaimer: '<b>¹</b> Participação nos debates',
      placements: this.getTopPlacements(
        stats.participationsAsDebater,
        members,
        topCount,
        (value, pos) => `Em <b>${pos}</b> lugar, com <b>${value}</b> ${value !== 1 ? 'participações' : 'participação'}`
      )
    };
  }

  private calculateMostActiveJudges(
    stats: MemberStatistics,
    members: Member[],
    topCount: number
  ): Rank {
    return {
      title: 'Juízes mais <b>ativos</b>¹',
      disclaimer: '<b>¹</b> Participação nos debates',
      placements: this.getTopPlacements(
        stats.participationsAsJudge,
        members,
        topCount,
        (value, pos) => `Em <b>${pos}</b> lugar, com <b>${value}</b> ${value !== 1 ? 'participações' : 'participação'}`
      )
    };
  }

  private calculateSpsAverage(
    stats: MemberStatistics,
    allMembers: Member[],
    activeMembers: Member[],
    topCount: number
  ): Rank {
    const averages: Record<string, number> = {};
    activeMembers.forEach(m => {
      const participations = stats.participationsAsDebater[m.id];
      averages[m.id] = participations > 0 ? stats.totalSps[m.id] / participations : 0;
    });

    return {
      title: 'Maiores <b>médias</b>¹ de <b>Speaker Points</b>',
      disclaimer: `<b>¹</b> Apenas membros com <b>${DASHBOARD_CONSTANTS.MIN_DEBATES_FOR_AVERAGE}</b> ou mais debates registrados entram para esse ranking`,
      placements: this.getTopPlacements(
        averages,
        activeMembers,
        topCount,
        (value, pos) => `Em <b>${pos}</b> lugar, com uma média de <b>${value.toFixed(2)}</b> speaker points`
      )
    };
  }

  private calculateHighestSps(
    stats: MemberStatistics,
    activeMembers: Member[],
    topCount: number
  ): Rank {
    // Filter to only active members' highest SPs
    const filteredHighestSps: Record<string, number> = {};
    activeMembers.forEach(m => {
      filteredHighestSps[m.id] = stats.highestSps[m.id];
    });

    return {
      title: 'Maiores¹ <b>Speaker Points absolutos</b>',
      disclaimer: `<b>¹</b> Apenas membros com <b>${DASHBOARD_CONSTANTS.MIN_DEBATES_FOR_AVERAGE}</b> ou mais debates registrados entram para esse ranking`,
      placements: this.getTopPlacements(
        filteredHighestSps,
        activeMembers,
        topCount,
        (value, pos) => `Em <b>${pos}</b> lugar, com <b>${value}</b> speaker points`
      )
    };
  }
}

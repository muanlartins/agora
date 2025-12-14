import { Injectable } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import * as moment from 'moment';
import { Debate } from 'src/app/models/types/debate';
import { Goal } from 'src/app/models/types/goal';
import { Member } from 'src/app/models/types/member';
import { MONTHS, placementColors } from 'src/app/utils/constants';
import { DASHBOARD_CONSTANTS, DebatePeriod } from '../models/dashboard-filter.model';

/**
 * Chart color configuration using design system colors
 */
export const CHART_COLORS = {
  /** Primary gold for bar charts */
  bar: '#906E2E',
  /** Hover state for bars */
  barHover: '#D4A537',
  /** Gold gradient for doughnut charts */
  doughnut: ['#D4A537', '#906E2E'],
  /** Alternative doughnut colors */
  doughnutAlt: ['#FFC040', '#906E2E'],
  /** Text color - matches $text-primary-dark */
  text: '#F5F5F5',
  /** Secondary text color */
  textSecondary: 'rgba(245, 245, 245, 0.65)',
  /** Border color - matches $border-dark */
  border: 'rgba(42, 42, 42, 0.3)',
  /** Grid lines */
  gridLines: 'rgba(245, 245, 245, 0.1)',
  /** Placement colors (1st, 2nd, 3rd, 4th) */
  placements: placementColors
};

/**
 * Base chart options with enhanced tooltips
 */
const BASE_OPTIONS = {
  maintainAspectRatio: false,
  animation: {
    duration: 400,
    easing: 'easeOutQuart' as const
  },
  plugins: {
    legend: {
      labels: {
        color: CHART_COLORS.text,
        font: {
          family: "'DM Sans', sans-serif",
          size: 12
        },
        padding: 16
      }
    },
    tooltip: {
      backgroundColor: '#1E1E1E',
      titleColor: '#D4A537',
      bodyColor: '#F5F5F5',
      borderColor: '#2A2A2A',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        family: "'DM Sans', sans-serif",
        size: 14,
        weight: 'bold' as const
      },
      bodyFont: {
        family: "'DM Sans', sans-serif",
        size: 13
      },
      displayColors: true,
      boxPadding: 4
    }
  },
  scales: {
    x: {
      ticks: {
        color: CHART_COLORS.textSecondary,
        font: {
          family: "'DM Sans', sans-serif",
          size: 11
        }
      },
      grid: {
        color: CHART_COLORS.gridLines
      }
    },
    y: {
      ticks: {
        color: CHART_COLORS.textSecondary,
        font: {
          family: "'DM Sans', sans-serif",
          size: 11
        }
      },
      grid: {
        color: CHART_COLORS.gridLines
      }
    }
  }
};

/**
 * Doughnut chart options (hides axes)
 */
const DOUGHNUT_OPTIONS = {
  maintainAspectRatio: false,
  animation: {
    duration: 400,
    easing: 'easeOutQuart' as const
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: CHART_COLORS.text,
        font: {
          family: "'DM Sans', sans-serif",
          size: 12
        },
        padding: 16
      }
    },
    tooltip: {
      backgroundColor: '#1E1E1E',
      titleColor: '#D4A537',
      bodyColor: '#F5F5F5',
      borderColor: '#2A2A2A',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        family: "'DM Sans', sans-serif",
        size: 14,
        weight: 'bold' as const
      },
      bodyFont: {
        family: "'DM Sans', sans-serif",
        size: 13
      }
    }
  },
  scales: {
    x: { display: false },
    y: { display: false }
  }
};

/**
 * Service for generating Chart.js configurations
 */
@Injectable({
  providedIn: 'root'
})
export class ChartService {
  /**
   * Training venue distribution (Remote vs In-Person)
   */
  createVenueChart(debates: Debate[]): ChartConfiguration {
    const remote = debates.filter(d => d.venue === 'remote').length;
    const inPerson = debates.filter(d => d.venue === 'inPerson').length;
    const total = remote + inPerson;

    return {
      type: 'doughnut' as ChartType,
      options: {
        ...DOUGHNUT_OPTIONS,
        plugins: {
          ...DOUGHNUT_OPTIONS.plugins,
          tooltip: {
            ...DOUGHNUT_OPTIONS.plugins?.tooltip,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      },
      data: {
        labels: ['Remoto', 'Presencial'],
        datasets: [{
          data: [remote, inPerson],
          backgroundColor: CHART_COLORS.doughnutAlt,
          hoverBackgroundColor: ['#FFD060', '#B8922F'],
          borderWidth: 0
        }]
      }
    };
  }

  /**
   * Training frequency by time of day
   */
  createFrequencyByTimeChart(debates: Debate[]): ChartConfiguration {
    const times = [...new Set(debates.map(d => d.time))].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    return {
      type: 'bar' as ChartType,
      options: {
        ...BASE_OPTIONS,
        plugins: {
          ...BASE_OPTIONS.plugins,
          tooltip: {
            ...BASE_OPTIONS.plugins?.tooltip,
            callbacks: {
              title: (items) => `Horário: ${items[0]?.label || ''}`,
              label: (context) => `${context.parsed.y} treinos`
            }
          }
        }
      },
      data: {
        labels: times,
        datasets: [{
          label: 'Quantidade',
          data: times.map(time => debates.filter(d => d.time === time).length),
          backgroundColor: CHART_COLORS.bar,
          hoverBackgroundColor: CHART_COLORS.barHover,
          borderRadius: 4
        }]
      }
    };
  }

  /**
   * Training frequency by month - adapts to selected debate period
   */
  createFrequencyByMonthChart(debates: Debate[], debatePeriod: string = DebatePeriod.ALL_TIME): ChartConfiguration {
    const frequencyByMonth: number[] = new Array(12).fill(0);

    debates.forEach(debate => {
      const month = moment(debate.date).month();
      frequencyByMonth[month]++;
    });

    // Determine which months to show based on period
    let labels: string[];
    let data: number[];

    if (debatePeriod === DebatePeriod.ALL_TIME) {
      // Show all 12 months
      labels = [...MONTHS];
      data = [...frequencyByMonth];
    } else {
      // For specific year, show all months with data or up to current month if current year
      const currentYear = new Date().getFullYear();
      const selectedYear = parseInt(debatePeriod, 10);

      if (selectedYear === currentYear) {
        const currentMonth = new Date().getMonth();
        labels = MONTHS.slice(0, currentMonth + 1);
        data = frequencyByMonth.slice(0, currentMonth + 1);
      } else {
        // Past year - show all months
        labels = [...MONTHS];
        data = [...frequencyByMonth];
      }
    }

    return {
      type: 'bar' as ChartType,
      options: {
        ...BASE_OPTIONS,
        plugins: {
          ...BASE_OPTIONS.plugins,
          tooltip: {
            ...BASE_OPTIONS.plugins?.tooltip,
            callbacks: {
              title: (items) => items[0]?.label || '',
              label: (context) => `${context.parsed.y} treinos`
            }
          }
        }
      },
      data: {
        labels,
        datasets: [{
          label: 'Quantidade',
          data,
          backgroundColor: CHART_COLORS.bar,
          hoverBackgroundColor: CHART_COLORS.barHover,
          borderRadius: 4
        }]
      }
    };
  }

  /**
   * Debaters by society (SDUFRJ vs Others)
   */
  createDebatersBySocietyChart(debates: Debate[]): ChartConfiguration {
    let sdufrj = 0;
    let others = 0;

    debates.forEach(debate => {
      debate.debaters.forEach(debater => {
        if (debater.society === 'SDUFRJ') {
          sdufrj++;
        } else {
          others++;
        }
      });
    });

    const total = sdufrj + others;

    return {
      type: 'doughnut' as ChartType,
      options: {
        ...DOUGHNUT_OPTIONS,
        plugins: {
          ...DOUGHNUT_OPTIONS.plugins,
          tooltip: {
            ...DOUGHNUT_OPTIONS.plugins?.tooltip,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      },
      data: {
        labels: ['SDUFRJ', 'Outras'],
        datasets: [{
          data: [sdufrj, others],
          backgroundColor: CHART_COLORS.doughnutAlt,
          hoverBackgroundColor: ['#FFD060', '#B8922F'],
          borderWidth: 0
        }]
      }
    };
  }

  /**
   * Judges by society (SDUFRJ vs Others)
   */
  createJudgesBySocietyChart(debates: Debate[]): ChartConfiguration {
    let sdufrj = 0;
    let others = 0;

    debates.forEach(debate => {
      // Count chair
      if (debate.chair.society === 'SDUFRJ') {
        sdufrj++;
      } else {
        others++;
      }
      // Count wings
      if (debate.wings?.length) {
        debate.wings.forEach(wing => {
          if (wing.society === 'SDUFRJ') {
            sdufrj++;
          } else {
            others++;
          }
        });
      }
    });

    const total = sdufrj + others;

    return {
      type: 'doughnut' as ChartType,
      options: {
        ...DOUGHNUT_OPTIONS,
        plugins: {
          ...DOUGHNUT_OPTIONS.plugins,
          tooltip: {
            ...DOUGHNUT_OPTIONS.plugins?.tooltip,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      },
      data: {
        labels: ['SDUFRJ', 'Outras'],
        datasets: [{
          data: [sdufrj, others],
          backgroundColor: CHART_COLORS.doughnutAlt,
          hoverBackgroundColor: ['#FFD060', '#B8922F'],
          borderWidth: 0
        }]
      }
    };
  }

  /**
   * Active members activity chart - FIXED tooltip to show member names
   */
  createActiveMembersChart(
    members: Member[],
    debates: Debate[],
    minParticipations: number = DASHBOARD_CONSTANTS.MIN_PARTICIPATIONS_FOR_ACTIVE
  ): ChartConfiguration {
    const participations: Record<string, number> = {};

    members.forEach(member => {
      participations[member.id] = debates.reduce((count, debate) => {
        const isDebater = debate.debaters.some(d => d.id === member.id);
        const isChair = debate.chair.id === member.id;
        const isWing = debate.wings?.some(w => w.id === member.id) || false;
        return count + (isDebater || isChair || isWing ? 1 : 0);
      }, 0);
    });

    // Filter to active members and sort by participation
    const activeEntries = Object.entries(participations)
      .filter(([_, count]) => count >= minParticipations)
      .sort((a, b) => b[1] - a[1]);

    // Create a map for tooltip lookup
    const memberMap = new Map(members.map(m => [m.id, m.name]));

    const labels = activeEntries.map(([id]) => memberMap.get(id) || 'Desconhecido');
    const data = activeEntries.map(([_, count]) => count);

    return {
      type: 'bar' as ChartType,
      options: {
        ...BASE_OPTIONS,
        indexAxis: 'y' as const, // Horizontal bar chart for better name display
        plugins: {
          ...BASE_OPTIONS.plugins,
          legend: {
            display: false
          },
          tooltip: {
            ...BASE_OPTIONS.plugins?.tooltip,
            callbacks: {
              title: (items) => items[0]?.label || '',
              label: (context) => {
                const count = context.parsed.x;
                return `${count} participaç${count === 1 ? 'ão' : 'ões'}`;
              }
            }
          }
        },
        scales: {
          x: {
            ...BASE_OPTIONS.scales['x'],
            beginAtZero: true
          },
          y: {
            ...BASE_OPTIONS.scales['y'],
            ticks: {
              ...BASE_OPTIONS.scales['y'].ticks,
              autoSkip: false
            }
          }
        }
      },
      data: {
        labels,
        datasets: [{
          label: 'Participações',
          data,
          backgroundColor: CHART_COLORS.bar,
          hoverBackgroundColor: CHART_COLORS.barHover,
          borderRadius: 4
        }]
      }
    };
  }

  /**
   * Goals achievement chart
   */
  createGoalsChart(goals: Goal[]): ChartConfiguration {
    const achieved = goals.filter(g => g.currentCount >= g.totalCount).length;
    const notAchieved = goals.length - achieved;
    const total = achieved + notAchieved;

    return {
      type: 'doughnut' as ChartType,
      options: {
        ...DOUGHNUT_OPTIONS,
        plugins: {
          ...DOUGHNUT_OPTIONS.plugins,
          tooltip: {
            ...DOUGHNUT_OPTIONS.plugins?.tooltip,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      },
      data: {
        labels: ['Atingidas', 'Não Atingidas'],
        datasets: [{
          data: [achieved, notAchieved],
          backgroundColor: CHART_COLORS.doughnutAlt,
          hoverBackgroundColor: ['#FFD060', '#B8922F'],
          borderWidth: 0
        }]
      }
    };
  }

  /**
   * Partner societies frequency chart
   */
  createPartnerSocietiesChart(debates: Debate[], members: Member[]): ChartConfiguration {
    const frequencyBySociety: Record<string, number> = {};

    // Initialize all societies
    [...new Set(members.map(m => m.society))].forEach(society => {
      frequencyBySociety[society] = 0;
    });

    // Count participations
    debates.forEach(debate => {
      // Count chair
      if (frequencyBySociety[debate.chair.society] !== undefined) {
        frequencyBySociety[debate.chair.society]++;
      }
      // Count wings
      if (debate.wings?.length) {
        debate.wings.forEach(wing => {
          if (frequencyBySociety[wing.society] !== undefined) {
            frequencyBySociety[wing.society]++;
          }
        });
      }
      // Count debaters
      debate.debaters.forEach(debater => {
        if (frequencyBySociety[debater.society] !== undefined) {
          frequencyBySociety[debater.society]++;
        }
      });
    });

    // Filter out SDUFRJ and sort by frequency
    const sortedEntries = Object.entries(frequencyBySociety)
      .filter(([society]) => society !== 'SDUFRJ')
      .sort((a, b) => b[1] - a[1]);

    return {
      type: 'bar' as ChartType,
      options: {
        ...BASE_OPTIONS,
        indexAxis: 'y' as const, // Horizontal for better society name display
        plugins: {
          ...BASE_OPTIONS.plugins,
          legend: {
            display: false
          },
          tooltip: {
            ...BASE_OPTIONS.plugins?.tooltip,
            callbacks: {
              title: (items) => items[0]?.label || '',
              label: (context) => {
                const count = context.parsed.x;
                return `${count} participaç${count === 1 ? 'ão' : 'ões'}`;
              }
            }
          }
        },
        scales: {
          x: {
            ...BASE_OPTIONS.scales['x'],
            beginAtZero: true
          },
          y: {
            ...BASE_OPTIONS.scales['y'],
            ticks: {
              ...BASE_OPTIONS.scales['y'].ticks,
              autoSkip: false
            }
          }
        }
      },
      data: {
        labels: sortedEntries.map(([society]) => society),
        datasets: [{
          label: 'Participações',
          data: sortedEntries.map(([_, count]) => count),
          backgroundColor: CHART_COLORS.bar,
          hoverBackgroundColor: CHART_COLORS.barHover,
          borderRadius: 4
        }]
      }
    };
  }

  /**
   * Results by house (stacked bar chart)
   */
  createResultsByHouseChart(debates: Debate[]): ChartConfiguration {
    // Initialize placement counts for each house
    // og[0] = 1st places, og[1] = 2nd places, etc.
    const og = [0, 0, 0, 0];
    const oo = [0, 0, 0, 0];
    const cg = [0, 0, 0, 0];
    const co = [0, 0, 0, 0];

    debates.forEach(debate => {
      // points[i] is 0-3, where 3=1st, 2=2nd, 1=3rd, 0=4th
      // We invert to get placement index: 3-points = placement index
      og[3 - debate.points[0]]++;
      oo[3 - debate.points[1]]++;
      cg[3 - debate.points[2]]++;
      co[3 - debate.points[3]]++;
    });

    return {
      type: 'bar' as ChartType,
      options: {
        ...BASE_OPTIONS,
        plugins: {
          ...BASE_OPTIONS.plugins,
          tooltip: {
            ...BASE_OPTIONS.plugins?.tooltip,
            callbacks: {
              title: (items) => {
                const houseNames: Record<string, string> = {
                  '1G': 'Primeira Governista',
                  '1O': 'Primeira Oposição',
                  '2G': 'Segunda Governista',
                  '2O': 'Segunda Oposição'
                };
                return houseNames[items[0]?.label || ''] || items[0]?.label || '';
              },
              label: (context) => `${context.dataset.label}: ${context.parsed.y}`
            }
          }
        },
        scales: {
          x: {
            ...BASE_OPTIONS.scales['x'],
            stacked: true
          },
          y: {
            ...BASE_OPTIONS.scales['y'],
            stacked: true,
            beginAtZero: true
          }
        }
      },
      data: {
        labels: ['1G', '1O', '2G', '2O'],
        datasets: [
          {
            label: 'Primeiros',
            data: [og[0], oo[0], cg[0], co[0]],
            backgroundColor: CHART_COLORS.placements[0],
            borderRadius: 2
          },
          {
            label: 'Segundos',
            data: [og[1], oo[1], cg[1], co[1]],
            backgroundColor: CHART_COLORS.placements[1],
            borderRadius: 2
          },
          {
            label: 'Terceiros',
            data: [og[2], oo[2], cg[2], co[2]],
            backgroundColor: CHART_COLORS.placements[2],
            borderRadius: 2
          },
          {
            label: 'Quartos',
            data: [og[3], oo[3], cg[3], co[3]],
            backgroundColor: CHART_COLORS.placements[3],
            borderRadius: 2
          }
        ]
      }
    };
  }

  /**
   * Get all chart configurations for the dashboard
   */
  generateAllCharts(
    debates: Debate[],
    members: Member[],
    goals: Goal[],
    debatePeriod: string = DebatePeriod.ALL_TIME
  ): ChartConfiguration[] {
    return [
      this.createFrequencyByTimeChart(debates),
      this.createFrequencyByMonthChart(debates, debatePeriod),
      this.createVenueChart(debates),
      this.createDebatersBySocietyChart(debates),
      this.createJudgesBySocietyChart(debates),
      this.createActiveMembersChart(members, debates),
      this.createGoalsChart(goals),
      this.createPartnerSocietiesChart(debates, members),
      this.createResultsByHouseChart(debates)
    ];
  }
}

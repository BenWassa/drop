// === ANALYTICS MODULE ===
// Analytics and calculation functions for the drop life tracker app

const Analytics = {
  /**
   * Calculates streaks for each domain based on recent history.
   */
  calculateStreaks() {
    const history = typeof Store.getHistory === 'function' ? Store.getHistory(7) : [];
    const recent = history.slice(-7);
    const domains = ['sleep', 'fitness', 'mind', 'spirit'];
    const streaks = {};
    const denominator = recent.length === 0 ? 7 : recent.length;

    domains.forEach(domain => {
      const activeDays = recent.reduce((count, entry) => {
        const value = Number(entry?.scores?.[domain]);
        return count + (Number.isFinite(value) && value > 0 ? 1 : 0);
      }, 0);
      const labelDenominator = denominator === 1 ? 'day' : 'days';
      const totalLabel = recent.length === 0 ? `7 ${labelDenominator}` : `${denominator} ${labelDenominator}`;
      streaks[domain] = `${activeDays} of ${totalLabel}`;
    });

    return streaks;
  },

  /**
   * Analyzes the last 7 days of historical data and determines the heatmap mode.
   */
  getWeeklyData() {
    const domains = ['sleep', 'fitness', 'mind', 'spirit'];
    const formatDomain = (domain) => domain.charAt(0).toUpperCase() + domain.slice(1);
    const history = typeof Store.getHistory === 'function' ? Store.getHistory(30, { includeArchived: true }) : [];
    const historyMap = history.reduce((acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    }, {});
    const today = Store.getToday();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const fullDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate the current week (Monday to Sunday)
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate days since last Monday (adjusting so Monday = 0, Sunday = 6)
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    // Build array starting from Monday of the current week
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - daysSinceMonday + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayIndex = d.getDay();
      const entry = historyMap[dateKey] || { date: dateKey, scores: {} };

      last7Days.push({
        dayLabel: dayNames[dayIndex],
        fullDayName: fullDayNames[dayIndex],
        dateKey,
        scores: entry.scores || { sleep: 0, fitness: 0, mind: 0, spirit: 0 },
        isToday: dateKey === today
      });
    }

    const totalDays = last7Days.length || 1;
    const activeDaySet = new Set();
    const domainConsistencies = domains.map(domain => {
      const activeDays = last7Days.reduce((count, day) => {
        const score = Number(day.scores[domain]) || 0;
        if (score >= 50) {
          activeDaySet.add(day.dateKey);
          return count + 1;
        }
        return count;
      }, 0);
      return {
        domain,
        count: activeDays,
        consistency: activeDays / totalDays
      };
    });

    const totalActiveDaysCount = activeDaySet.size;
    const weakestDomain = domainConsistencies.reduce((min, curr) => {
      if (!min || curr.consistency < min.consistency) return curr;
      return min;
    }, null) || { domain: 'sleep', count: 0, consistency: 0 };
    const strongestDomain = domainConsistencies.reduce((max, curr) => {
      if (!max || curr.consistency > max.consistency) return curr;
      return max;
    }, null) || { domain: 'sleep', count: 0, consistency: 0 };

    const requiredDays = Math.ceil(totalDays * 0.5);
    let mode = 'V1';

    if (totalActiveDaysCount === 0) {
      mode = 'V3';
    } else if (weakestDomain.consistency < 0.5) {
      mode = 'V2';
    }

    let summary = '';
    if (mode === 'V3' || !domainConsistencies.length) {
      summary = 'Ready to start? Log an entry now to begin your weekly momentum.';
    } else if (mode === 'V2') {
      const neededDays = Math.max(0, requiredDays - weakestDomain.count);
      const deficitStatement = weakestDomain.count === 0
        ? 'not logged this week'
        : `only tracked ${weakestDomain.count} of ${totalDays} days`;
      const actionStatement = neededDays > 0
        ? `Hit it ${neededDays === 1 ? 'once' : `${neededDays} more times`} this week to rebound.`
        : 'Focus on the missing action today to boost alignment.';
      summary = `${formatDomain(weakestDomain.domain)} shows a clear deficit—${deficitStatement}. ${actionStatement}`;
    } else {
      const allEven = domainConsistencies.every(d => d.count === strongestDomain.count);
      if (allEven) {
        summary = `Exceptional consistency! All domains tracked on ${strongestDomain.count} of ${totalDays} days.`;
      } else {
        summary = `${formatDomain(strongestDomain.domain)} shows great consistency, tracked on ${strongestDomain.count} of ${totalDays} days. Keep pushing for ${formatDomain(weakestDomain.domain)}!`;
      }
    }

    return { last7Days, mode, summary, weakestDomain, strongestDomain, domainConsistencies };
  },

  /**
   * Renders the Weekly Trajectory Heatmap component based on the weekly data.
   */
  renderWeeklyHeatmap() {
    const container = UI.elements.heatmapContainer;
    const summaryEl = UI.elements.heatmapSummary;
    if (!container || !summaryEl) return;

    const { last7Days, mode, summary } = this.getWeeklyData();
    const domains = ['sleep', 'fitness', 'mind', 'spirit'];
    const formatDomain = (domain) => domain.charAt(0).toUpperCase() + domain.slice(1);

    // Build day labels as individual elements
    const dayLabelsHTML = last7Days.map(day => {
      const tooltip = day.isToday ? 'Today' : day.fullDayName;
      return `<div class="day-label" title="${tooltip}">${day.dayLabel}</div>`;
    }).join('');

    // Build rows for each domain
    const rowsHTML = domains.map(domain => {
      const cellsHTML = last7Days.map(day => {
        const score = Number(day.scores[domain]) || 0;
        const intensity = this.getHeatmapIntensity(score);
        const tooltip = `${formatDomain(domain)} on ${day.fullDayName}${day.isToday ? ' (Today)' : ''}: ${score} pts`;
        return `<div class="heatmap-cell" data-intensity="${intensity}" title="${tooltip}"></div>`;
      }).join('');

      return `<div class="domain-label">${formatDomain(domain)}</div>${cellsHTML}`;
    }).join('');

    container.innerHTML = `
      <div class="heatmap-grid">
        <div></div>
        ${dayLabelsHTML}
        ${rowsHTML}
      </div>
    `;

    container.setAttribute('data-mode', mode);
    summaryEl.textContent = summary;
    summaryEl.setAttribute('data-mode', mode);
  },

  /**
   * Maps raw activity score (0-100) to heatmap intensity level.
   */
  getHeatmapIntensity(rawScore) {
    if (!Number.isFinite(rawScore) || rawScore === 0) return 'none';
    if (rawScore < 50) return 'low';
    if (rawScore < 80) return 'med';
    return 'high';
  }
};

// Make Analytics available globally
if (typeof window !== 'undefined') {
  window.Analytics = Analytics;
}
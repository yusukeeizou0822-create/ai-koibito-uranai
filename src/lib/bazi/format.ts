import type { BaziChart } from './calculate';

export function formatBaziSummary(chart: BaziChart): string {
  const pillars = [
    `年柱${chart.year.ganZhi}`,
    `月柱${chart.month.ganZhi}`,
    `日柱${chart.day.ganZhi}`,
    chart.time ? `時柱${chart.time.ganZhi}` : '時柱不明',
  ].join('・');

  const wuxing = Object.entries(chart.wuXingCounts)
    .map(([element, count]) => `${element}${count}`)
    .join(' ');

  return `${pillars} / 五行バランス: ${wuxing}`;
}

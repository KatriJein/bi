import { ChartConfiguration } from 'chart.js';
import { Column } from '../../core/models';
import { toCamelCase } from '../../core/utils';
import { COLORS } from '../../constants';

export function buildChartOptions(
  xAxis: Column[],
  yAxis: Column[],
  chartType: ChartConfiguration['type']
): ChartConfiguration['options'] {
  const xTitle = xAxis.length ? xAxis[0].alias : '';
  const yTitle = yAxis.map((col) => col.alias).join(', ');

  const baseOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (chartType === 'pie') {
    return {
      ...baseOptions,
      aspectRatio: 2,
      layout: {
        padding: { top: 10, bottom: 10, left: 10, right: 10 },
      },
      plugins: {
        ...baseOptions.plugins,
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  return {
    ...baseOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: xTitle,
        },
      },
      y: {
        title: {
          display: true,
          text: yTitle,
        },
      },
    },
  };
}

export function buildChartData(
  rawData: any[],
  xAxis: Column[],
  yAxis: Column[],
  chartType: ChartConfiguration['type'],
  customColors?: string[]
): ChartConfiguration['data'] {
  if (!xAxis.length || !yAxis.length || rawData.length === 0) {
    return { labels: [], datasets: [] };
  }

  const xCol = xAxis[0];
  const labels = rawData.map((row) => row[toCamelCase(xCol.columnName)]);

  const colors = customColors && customColors.length ? customColors : COLORS;

  if (chartType === 'pie') {
    const yCol = yAxis[0];
    const data = rawData.map((row) => row[toCamelCase(yCol.columnName)]);
    return {
      labels,
      datasets: [
        {
          label: yCol.alias,
          data,
          backgroundColor: colors,
        },
      ],
    };
  }

  const datasets = yAxis.map((col, idx) => ({
    label: col.alias,
    data: rawData.map((row) => row[toCamelCase(col.columnName)]),
    backgroundColor: colors[idx % colors.length],
    borderColor: colors[idx % colors.length],
    fill: false,
    tension: 0.2,
  }));

  return { labels, datasets };
}

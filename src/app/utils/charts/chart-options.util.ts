import { ChartConfiguration } from 'chart.js';
import { Column } from '../../core/models';
import { toCamelCase } from '../../core/utils';
import { COLORS } from '../../constants';
import { ChartType } from '../../core/store/charts';

export function buildChartOptions(
  xAxis: Column[],
  yAxis: Column[],
  chartType: ChartType
): ChartConfiguration['options'] {
  const xTitle = xAxis.length ? xAxis[0].alias : '';
  const yTitle = yAxis.map((col) => col.alias).join(', ');

  const baseOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 20 } },
      },
      tooltip: {
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
      },
    },
  };

  const commonScaleSettings = {
    title: {
      display: true,
      font: { size: 20 },
    },
    ticks: {
      font: { size: 14 },
    },
  };

  if (chartType === 'pie' || chartType === 'doughnut') {
    return {
      ...baseOptions,
      aspectRatio: 2,
      layout: {
        padding: { top: 10, bottom: 10, left: 10, right: 10 },
      },
      plugins: {
        ...baseOptions.plugins,
        legend: {
          position: chartType === 'doughnut' ? 'right' : 'bottom',
          labels: { font: { size: 16 } },
        },
      },
    };
  }

  const scales =
    chartType === 'horizontalBar'
      ? {
          y: {
            ...commonScaleSettings,
            title: { ...commonScaleSettings.title, text: xTitle },
          },
          x: {
            ...commonScaleSettings,
            title: { ...commonScaleSettings.title, text: yTitle },
          },
        }
      : {
          x: {
            ...commonScaleSettings,
            title: { ...commonScaleSettings.title, text: xTitle },
          },
          y: {
            ...commonScaleSettings,
            title: { ...commonScaleSettings.title, text: yTitle },
          },
        };

  return {
    ...baseOptions,
    ...(chartType === 'horizontalBar' && { indexAxis: 'y' }),
    scales,
  };
}

export function buildChartData(
  rawData: any[],
  xAxis: Column[],
  yAxis: Column[],
  chartType: ChartType,
  customColors?: string[]
): ChartConfiguration['data'] {
  if (!yAxis.length || rawData.length === 0) {
    return { labels: [], datasets: [] };
  }

  const xCol = xAxis[0];
  const labels = (rawData || []).map((row) => {
    return xCol?.columnName ? row[toCamelCase(xCol.columnName)] : '';
  });
  const colors = customColors && customColors.length ? customColors : COLORS;

  switch (chartType) {
    case 'doughnutPercent':
    case 'pie':
    case 'doughnut':
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

    default:
      const defaultDatasets = yAxis.map((col, idx) => ({
        label: col.alias,
        data: rawData.map((row) => row[toCamelCase(col.columnName)]),
        backgroundColor: colors[idx % colors.length],
        borderColor: colors[idx % colors.length],
        fill: false,
        tension: 0.2,
      }));
      return { labels, datasets: defaultDatasets };
  }
}

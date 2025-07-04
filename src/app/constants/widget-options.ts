import { COLORS } from './colors';

export const fontSizes = [16, 18, 20, 22, 24];

export const predefinedColors = ['#000000', ...COLORS];

export const textAlignOptions = [
  { value: 'left', icon: 'format_align_left' },
  { value: 'center', icon: 'format_align_center' },
  { value: 'right', icon: 'format_align_right' },
  { value: 'justify', icon: 'format_align_justify' },
];

export const verticalAlignOptions = [
  { value: 'top', icon: 'vertical_align_top' },
  { value: 'center', icon: 'vertical_align_center' },
  { value: 'bottom', icon: 'vertical_align_bottom' },
];

export function getChartIcon(
  chartType: 'line' | 'bar' | 'pie' | 'table'
): string {
  const iconMap: Record<'line' | 'bar' | 'pie' | 'table', string> = {
    line: 'show_chart',
    bar: 'bar_chart',
    pie: 'pie_chart',
    table: 'table_chart',
  };

  return iconMap[chartType];
}

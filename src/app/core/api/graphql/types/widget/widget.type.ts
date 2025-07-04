export type Widget = {
  id: string;
  dashboardId: string;
  chartId?: string | null;
  title: string;
  type: WidgetType;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visualSettings?: VisualSettings;
};

export type VisualSettings = {
  fontSizeTitle?: number;
  colorTitle?: string;
  textAlign?: string;
  verticalAlign?: string;
};

export type WidgetType = 'chart' | 'text' | 'table';

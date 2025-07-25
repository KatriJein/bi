export type CreateWidgetFilterBindingVariables = {
  chartFilterId: string;
  dashboardFilterId: string;
  widgetId: string;
};

export type CreateWidgetFilterBindingResponse = {
  createWidgetFilterBinding: {
    widgetFilterBinding: WidgetFilterBinding;
  };
};

export type WidgetFilterBinding = {
  chartFilterId: string;
  dashboardFilterId: string;
  id: string;
  widgetId: string;
};

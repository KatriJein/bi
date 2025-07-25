import { WidgetFilterBinding } from './create-widget-filter-binding.type';

export type UpdateWidgetFilterBindingVariables = {
  id: string;
  patch: {
    chartFilterId?: string;
    dashboardFilterId?: string;
    widgetId?: string;
  };
};

export type UpdateWidgetFilterBindingResponse = {
  updateWidgetFilterBinding: {
    widgetFilterBinding: WidgetFilterBinding;
  };
};

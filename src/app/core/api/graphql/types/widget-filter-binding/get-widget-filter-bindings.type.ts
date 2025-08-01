import { WidgetFilterBinding } from './create-widget-filter-binding.type';

export type GetWidgetFilterBindingResponse = {
  widgetFilterBindings: {
    nodes: WidgetFilterBinding[];
  };
};

export type GetWidgetFilterBindingVariables = {
  widgetId: string;
};

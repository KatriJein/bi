import { gql } from 'apollo-angular';

export const updateChartFilterMutation = gql(`
mutation UpdateChartFilter($patch: ChartFilterPatch!, $id: UUID!) {
  updateChartFilter(input: {patch: $patch, id: $id}) {
    chartFilter {
      chartId
      fieldName
      fieldType
      filterType
      id
    }
  }
}

`);

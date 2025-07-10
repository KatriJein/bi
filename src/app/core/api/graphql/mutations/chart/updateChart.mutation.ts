import { gql } from 'apollo-angular';

export const updateChartMutation = gql(`
mutation updateChart($id: UUID!, $patch: ChartPatch!) {
  updateChart(input: {patch: $patch, id: $id}) {
    chart {
      datasetId
      childId
      name
      filters
      sorting
      id
      settings
      xAxis
      yAxis
    }
  }
}
`);

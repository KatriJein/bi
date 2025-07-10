import { gql } from 'apollo-angular';

export const getChartByIdQuery = gql(`query getChartById($id: UUID) {
  chart(id: $id) {
    datasetId
    childId
    filters
    sorting
    id
    settings
    xAxis
    yAxis
    name
  }
}
`);

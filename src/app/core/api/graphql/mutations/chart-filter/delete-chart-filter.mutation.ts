import { gql } from 'apollo-angular';

export const deleteChartFilterMutation = gql(`
mutation DeleteChartFilter($id: UUID!) {
  deleteChartFilter(input: {id: $id}) {
    chartFilter {
      id
    }
  }
}
`);

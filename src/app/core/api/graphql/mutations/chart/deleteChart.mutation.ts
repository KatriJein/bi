import { gql } from 'apollo-angular';

export const deleteChartMutation = gql(`
mutation deleteChart($id: UUID!) {
  deleteChart(input: {id: $id}) {
    chart {
      id
    }
  }
}
`);

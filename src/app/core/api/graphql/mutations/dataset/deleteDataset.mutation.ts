import { gql } from 'apollo-angular';

export const deleteDatasetMutation = gql(`
mutation deleteDataSet($id: UUID!) {
  deleteDataSet(input: {id: $id}) {
    dataSet {
      id
    }
  }
}
`);

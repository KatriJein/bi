import { gql } from 'apollo-angular';

export const updateDatasetMutation = gql(`
mutation updateDataset($id: UUID!, $patch: DataSetPatch!) {
  updateDataSet(input: {patch: $patch, id: $id}) {
    dataSet {
      id
      name
      query
      settings
    }
  }
}
`);

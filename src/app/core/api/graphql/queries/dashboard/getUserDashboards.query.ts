import { gql } from 'apollo-angular';

export const getUserDashboardsQuery = gql(`query GetUserDashboards($id: UUID!) {
  interfaceDashboards(condition: {interfaceId: $id}) {
    nodes {
      order
      dashboard {
        color
        iconId
        id
        name
        parentId
      }
    }
  }
}`);

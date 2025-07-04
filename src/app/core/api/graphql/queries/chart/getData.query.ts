import { gql } from 'apollo-angular';

export function getDataQuery(tableName: string, columns: string[]) {
  const validColumns = columns.filter(col => col && typeof col === 'string');

  return gql`
    query GetDataForChart {
      ${tableName}(first: 1000) {
        nodes {
          ${validColumns.join('\n')}
        }
      }
    }
  `;
}

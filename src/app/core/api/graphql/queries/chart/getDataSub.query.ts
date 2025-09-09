import { gql } from 'apollo-angular';

export function getDataSub(tableName: string, columns: string[]) {
  const validColumns = columns.filter((col) => col && typeof col === 'string');

  return gql`
    subscription GetDataForChartSub {
      ${tableName}(first: 1000) {
        nodes {
          ${validColumns.join('\n')}
        }
      }
    }
  `;
}

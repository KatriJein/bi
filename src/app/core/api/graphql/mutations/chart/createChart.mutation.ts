import { gql } from 'apollo-angular';

export const createChartMutation = gql(`
  mutation createChart(
    $name: String!,
    $datasetId: UUID!,
    $childId: UUID,
    $xAxis: String!,
    $yAxis: [String]!,
    $filters: JSON,
    $sorting: [JSON],
    $settings: JSON
  ) {
    createChart(
      input: {
        chart: {
          datasetId: $datasetId,
          childId: $childId,
          name: $name,
          xAxis: $xAxis,
          yAxis: $yAxis,
          filters: $filters,
          sorting: $sorting,
          settings: $settings
        }
      }
    ) {
      chart {
        id
        name
        datasetId
        childId
        xAxis
        yAxis
        filters
        sorting
        settings
      }
    }
  }
  `);

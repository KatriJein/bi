import { gql } from 'apollo-angular';

export const createChartMutation = gql(`
  mutation createChart(
    $name: String!,
    $datasetId: UUID!,
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
        xAxis
        yAxis
        filters
        sorting
        settings
      }
    }
  }
  `);

import { Component, inject } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartPageStateService } from '../../../services';
import { ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { toCamelCase } from '../../../core/utils';
import { TableComponent } from '../../table/table/table.component';
import { ColDef } from 'ag-grid-community';
import { COLORS, getAgGridFilterType } from '../../../constants';
import { DoughnutChartComponent } from '../custom-charts/doughnut-procent/doughnut-procent.component';
import { normalizeChartType } from '../../../utils';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
  imports: [
    BaseChartDirective,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    TableComponent,
    DoughnutChartComponent,
  ],
})
export class ChartComponent {
  private chartPageStateService = inject(ChartPageStateService);
  normalizeChartType = normalizeChartType;

  xAxis$ = this.chartPageStateService.xAxis$;
  yAxis$ = this.chartPageStateService.yAxis$;
  colors$ = this.chartPageStateService.colorSettings$;
  chartType$ = this.chartPageStateService.chartType$;

  chartOptions$: Observable<ChartConfiguration['options']> = combineLatest([
    this.chartPageStateService.xAxis$,
    this.chartPageStateService.yAxis$,
    this.chartType$,
  ]).pipe(
    map(([xAxis, yAxis, chartType]) => {
      const xTitle = xAxis.length ? xAxis[0].alias : '';
      const yTitle = yAxis.map((col) => col.alias).join(', ');

      const baseOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 20 } },
          },
          tooltip: {
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
          },
        },
      };

      const commonScaleSettings = {
        title: {
          display: true,
          font: { size: 20 },
        },
        ticks: {
          font: { size: 14 },
        },
      };

      if (chartType === 'pie' || chartType === 'doughnut') {
        return {
          ...baseOptions,
          aspectRatio: 2,
          layout: { padding: { top: 10, bottom: 10, left: 10, right: 10 } },
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: chartType === 'doughnut' ? 'right' : 'bottom',
              labels: { font: { size: 16 } },
            },
          },
        };
      }

      const scales =
        chartType === 'horizontalBar'
          ? {
              y: {
                ...commonScaleSettings,
                title: { ...commonScaleSettings.title, text: xTitle },
              },
              x: {
                ...commonScaleSettings,
                title: { ...commonScaleSettings.title, text: yTitle },
              },
            }
          : {
              x: {
                ...commonScaleSettings,
                title: { ...commonScaleSettings.title, text: xTitle },
              },
              y: {
                ...commonScaleSettings,
                title: { ...commonScaleSettings.title, text: yTitle },
              },
            };

      return {
        ...baseOptions,
        ...(chartType === 'horizontalBar' && { indexAxis: 'y' }),
        scales,
      };
    })
  );

  tableData$ = this.chartPageStateService.chartData$;

  chartData$: Observable<ChartConfiguration['data']> = combineLatest([
    this.chartPageStateService.chartData$,
    this.chartPageStateService.xAxis$,
    this.chartPageStateService.yAxis$,
    this.chartType$,
    this.colors$,
  ]).pipe(
    map(([rawData, xAxis, yAxis, chartType, customColors]) => {
      if (!yAxis.length || rawData.length === 0) {
        return { labels: [], datasets: [] };
      }

      const xCol = xAxis[0];
      const labels = (rawData || []).map((row) => {
        return xCol?.columnName ? row[toCamelCase(xCol.columnName)] : '';
      });

      const colors =
        customColors && customColors.length ? customColors : COLORS;

      switch (chartType) {
        case 'doughnutPercent':
        case 'pie':
        case 'doughnut':
          const yCol = yAxis[0];
          const data = rawData.map((row) => row[toCamelCase(yCol.columnName)]);

          return {
            labels,
            datasets: [
              {
                label: yCol.alias,
                data,
                backgroundColor: colors,
              },
            ],
          };

        default:
          const defaultDatasets = yAxis.map((col, idx) => ({
            label: col.alias,
            data: rawData.map((row) => row[toCamelCase(col.columnName)]),
            backgroundColor: colors[idx % colors.length],
            borderColor: colors[idx % colors.length],
            borderWidth: 2,
            fill: false,
            tension: 0.2,
          }));
          return { labels, datasets: defaultDatasets };
      }
    })
  );

  colDefs$: Observable<ColDef[]> = this.yAxis$.pipe(
    map((columns) =>
      columns.map((column) => ({
        field: toCamelCase(column.columnName),
        headerName: column.alias,
        filter: getAgGridFilterType(column.dataType),
        filterParams: {
          buttons: ['reset', 'apply'],
        },
      }))
    )
  );

  defaultColDef: ColDef = {
    flex: 1,
    floatingFilter: true,
  };
}

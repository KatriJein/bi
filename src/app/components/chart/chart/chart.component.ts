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
  ],
})
export class ChartComponent {
  private chartPageStateService = inject(ChartPageStateService);

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
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 20,
              },
            },
          },
          tooltip: {
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
          },
        },
      };

      if (chartType === 'pie') {
        return {
          ...baseOptions,
          aspectRatio: 2,
          layout: {
            padding: {
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            },
          },
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 16,
                },
              },
            },
          },
        };
      }

      return {
        ...baseOptions,
        scales: {
          x: {
            title: {
              display: true,
              text: xTitle,
              font: {
                size: 20,
              },
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: yTitle,
              font: {
                size: 20,
              },
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
        },
      };
    })
  );

  chartData$: Observable<ChartConfiguration['data']> = combineLatest([
    this.chartPageStateService.chartData$,
    this.chartPageStateService.xAxis$,
    this.chartPageStateService.yAxis$,
    this.chartType$,
    this.colors$,
  ]).pipe(
    map(([rawData, xAxis, yAxis, chartType, colors]) => {
      if (!xAxis.length || !yAxis.length || rawData.length === 0) {
        return { labels: [], datasets: [] };
      }

      const xCol = xAxis[0];
      const labels = rawData.map((row) => row[toCamelCase(xCol.columnName)]);

      if (chartType === 'pie') {
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
      }

      const datasets = yAxis.map((col, idx) => ({
        label: col.alias,
        data: rawData.map((row) => row[toCamelCase(col.columnName)]),
        backgroundColor: colors[idx % colors.length],
        borderColor: colors[idx % colors.length],
        fill: false,
        tension: 0.2,
      }));

      return { labels, datasets };
    })
  );
}

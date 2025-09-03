import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { buildChartOptions } from '../../../../utils';
import { COLORS } from '../../../../constants';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-procent.component.html',
  styleUrls: ['./doughnut-procent.component.scss'],
  imports: [BaseChartDirective],
})
export class DoughnutChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @Input() data: ChartConfiguration['data'] | undefined;

  percentage: number = 0;
  title: string = '';

  private readonly DEFAULT_COLOR = COLORS[0];
  private readonly LIGHT_COLOR = '#E0E0E0';
  private resizeObserver?: ResizeObserver;

  doughnutChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [this.percentage, 100 - this.percentage],
        backgroundColor: [this.DEFAULT_COLOR, this.LIGHT_COLOR],
        borderWidth: 0,
      },
    ],
  };

  doughnutChartOptions: ChartConfiguration['options'] = buildChartOptions(
    [],
    [],
    'doughnut'
  );

  doughnutChartType = 'doughnut' as const;

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => this.updateFontSize());
    this.resizeObserver.observe(this.chartContainer.nativeElement);
    this.updateFontSize();
  }

  private updateFontSize() {
    if (!this.chartContainer) return;

    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const percentageElement =
      this.chartContainer.nativeElement.querySelector('.center-percentage');
    const titleElement =
      this.container.nativeElement.querySelector('.chart-title');

    if (percentageElement) {
      const fontSize = Math.min(Math.max(containerWidth * 0.15, 16), 110);
      percentageElement.style.fontSize = `${fontSize}px`;
    }

    if (titleElement) {
      const titleSize = Math.min(Math.max(containerWidth * 0.06, 14), 48);
      titleElement.style.fontSize = `${titleSize}px`;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.data?.datasets?.length) {
      const dataset = this.data.datasets[0];

      const rawPercentage = (dataset.data?.[0] as number) || 0;

      let processedPercentage = rawPercentage;
      if (rawPercentage >= 0 && rawPercentage <= 1) {
        processedPercentage = rawPercentage * 100;
      }

      this.percentage = parseFloat(processedPercentage.toFixed(1));

      this.title = dataset.label || '';

      this.doughnutChartData = {
        datasets: [
          {
            data: [this.percentage, 100 - this.percentage],
            backgroundColor: this.getBackgroundColors(dataset),
            borderWidth: 0,
          },
        ],
      };
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private getBackgroundColors(
    dataset: ChartConfiguration['data']['datasets'][0]
  ): string[] {
    const primaryColor = this.getPrimaryColor(dataset);

    return [primaryColor, this.LIGHT_COLOR];
  }

  private getPrimaryColor(
    dataset: ChartConfiguration['data']['datasets'][0]
  ): string {
    if (!dataset.backgroundColor) return this.DEFAULT_COLOR;

    if (Array.isArray(dataset.backgroundColor)) {
      const firstColor = dataset.backgroundColor[0];
      return typeof firstColor === 'string' ? firstColor : this.DEFAULT_COLOR;
    }

    if (typeof dataset.backgroundColor === 'string') {
      return dataset.backgroundColor;
    }

    return this.DEFAULT_COLOR;
  }
}

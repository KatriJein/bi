import { Component, Input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-procent.component.html',
  styleUrls: ['./doughnut-procent.component.scss'],
  imports: [BaseChartDirective],
})
export class DoughnutChartComponent {
  @Input() percentage: number = 95;
  @Input() title: string = 'Вып.Выр';

  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Заполнено', 'Осталось'],
    datasets: [
      {
        data: [this.percentage, 100 - this.percentage],
        backgroundColor: ['#50b8c5', '#E0E0E0'],
        borderWidth: 0,
      },
    ],
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  doughnutChartType = 'doughnut' as const;

  ngOnChanges() {
    this.doughnutChartData.datasets[0].data = [
      this.percentage,
      100 - this.percentage,
    ];
  }
}

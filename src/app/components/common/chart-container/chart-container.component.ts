import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChartDto, ChartsSelectors } from '../../../core/store/charts';
import { ChartRendererComponent } from '../../widget/chart-renderer/chart-renderer.component';
import { TableRendererComponent } from '../../widget/table-renderer/table-renderer.component';
import { FilterTypeExp } from '../../../pages';

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [CommonModule, ChartRendererComponent, TableRendererComponent],
  templateUrl: './chart-container.component.html',
  styleUrl: './chart-container.component.scss',
})
export class ChartContainerComponent {
  @Input() chartId!: string;
  @Input() initialFilters?: FilterTypeExp[] | null;
  @Output() chartClick = new EventEmitter<any>();
  private store = inject(Store);

  chart$: Observable<ChartDto | null>;
  isChart$: Observable<boolean>;
  isTable$: Observable<boolean>;
  isDoughnutPercent$: Observable<boolean>;

  constructor() {
    this.chart$ = this.store
      .select(ChartsSelectors.selectChartById(this.chartId))
      .pipe(map((chart) => chart || null));

    this.isChart$ = this.chart$.pipe(
      map((chart) => {
        if (!chart) return false;
        return chart.settings?.chartType !== 'table';
      })
    );

    this.isTable$ = this.chart$.pipe(
      map((chart) => {
        if (!chart) return false;
        return chart.settings?.chartType === 'table';
      })
    );

    this.isDoughnutPercent$ = this.chart$.pipe(
      map((chart) => {
        if (!chart) return false;
        return chart.settings?.chartType === 'doughnutPercent';
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartId']) {
      this.chart$ = this.store
        .select(ChartsSelectors.selectChartById(this.chartId))
        .pipe(map((chart) => chart || null));

      this.isChart$ = this.chart$.pipe(
        map((chart) => {
          if (!chart) return false;
          return chart.settings?.chartType !== 'table';
        })
      );

      this.isTable$ = this.chart$.pipe(
        map((chart) => {
          if (!chart) return false;
          return chart.settings?.chartType === 'table';
        })
      );
    }
  }

  handleClick(event: any): void {
    this.chartClick.emit(event);
  }
}

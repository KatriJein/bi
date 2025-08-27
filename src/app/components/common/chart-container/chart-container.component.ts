import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChartDto, ChartsSelectors } from '../../../core/store/charts';
import { ChartRendererComponent } from '../../widget/chart-renderer/chart-renderer.component';
import { TableRendererComponent } from '../../widget/table-renderer/table-renderer.component';
import { FilterTypeExp } from '../../../pages';
import { WidgetFilterBinding } from '../../../core/api/graphql/types';
import { DashboardsSelectors } from '../../../core/store/dashboards';
import { convertBindingsToFilters } from '../../../utils';

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [CommonModule, ChartRendererComponent, TableRendererComponent],
  templateUrl: './chart-container.component.html',
  styleUrl: './chart-container.component.scss',
})
export class ChartContainerComponent implements OnInit, OnChanges {
  @Input() chartId!: string;
  @Input() initialFilters?: FilterTypeExp[] | null;
  @Input() widgetSelectors?: Observable<WidgetFilterBinding[]> | null;
  @Output() chartClick = new EventEmitter<any>();
  private store = inject(Store);

  chart$: Observable<ChartDto | null>;
  isChart$: Observable<boolean>;
  isTable$: Observable<boolean>;
  isDoughnutPercent$: Observable<boolean>;

  combinedFilters$: Observable<FilterTypeExp[]>;

  ngOnInit(): void {
    this.initCombinedFilters();
  }

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

    this.combinedFilters$ = this.getCombinedFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['chartId'] ||
      changes['initialFilters'] ||
      changes['widgetSelectors']
    ) {
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

    if ( changes['chartId'] ||
      changes['initialFilters'] ||
      changes['widgetSelectors']) {
      this.initCombinedFilters();
    }
  }

  handleClick(event: any): void {
    this.chartClick?.emit(event);
  }

  private initCombinedFilters(): void {
    this.combinedFilters$ = this.getCombinedFilters();
  }

  private getCombinedFilters(): Observable<FilterTypeExp[]> {
    if (!this.widgetSelectors) {
      return of(this.initialFilters || []);
    }

    return this.widgetSelectors.pipe(
      switchMap((widgetSelections) => {
        const chartSelections$ = this.store.select(
          ChartsSelectors.selectSelectionsByChartId(this.chartId)
        );

        const dashboardSelections$ = this.store.select(
          DashboardsSelectors.selectSelectionsByActiveDashboard
        );

        const convertedFilters$ = convertBindingsToFilters(
          of(widgetSelections),
          chartSelections$,
          dashboardSelections$
        );

        return combineLatest([
          convertedFilters$,
          of(this.initialFilters || []),
        ]).pipe(map(([converted, initial]) => [...initial, ...converted]));
      })
    );
  }
}

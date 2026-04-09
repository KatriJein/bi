import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChartContainerComponent } from '../../components/common';
import { CommonModule } from '@angular/common';
import {
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  WidgetDto,
  WidgetsActions,
  WidgetsSelectors,
} from '../../core/store/widgets';
import {
  ChartDto,
  ChartsActions,
  ChartsSelectors,
} from '../../core/store/charts';
import { WidgetFilterBinding } from '../../core/api/graphql/types';
import { DatasetsActions } from '../../core/store/datasets';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-fullscreen-widget',
  imports: [CommonModule, ChartContainerComponent],
  templateUrl: './fullscreen-widget.component.html',
  styleUrl: './fullscreen-widget.component.scss',
})
export class FullscreenWidgetComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private titleService = inject(Title);
  private destroy$ = new Subject<void>();

  widgetId!: string;
  chartId!: string;
  title!: string;
  widgetSelections$!: Observable<WidgetFilterBinding[]>;

  ngOnInit() {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        map((params) => params.get('widgetId')),
        filter((id): id is string => !!id),
        switchMap((widgetId) => {
          this.widgetId = widgetId;
          this.store.dispatch(WidgetsActions.loadWidget({ widgetId }));

          return this.store
            .select(WidgetsSelectors.selectWidgetById(widgetId))
            .pipe(
              filter((w): w is WidgetDto => !!w),
              take(1)
            );
        }),
        tap((widget) => {
          this.title = widget.title?.trim();
          this.titleService.setTitle(this.title || 'Виджет');
          this.chartId = widget.chartId || '';
          this.widgetSelections$ = this.store.select(
            WidgetsSelectors.selectSelectionsByWidgetId(widget.id)
          );

          if (this.chartId) {
            this.store.dispatch(
              ChartsActions.loadChart({ chartId: this.chartId })
            );
            this.store.dispatch(
              ChartsActions.loadChartSelections({ chartId: this.chartId })
            );
          }
        }),

        switchMap((widget) => {
          if (!widget.chartId) {
            return [];
          }
          return this.store
            .select(ChartsSelectors.selectChartById(widget.chartId))
            .pipe(
              filter(
                (chart): chart is ChartDto => !!chart && !!chart.datasetId
              ),
              take(1)
            );
        })
      )
      .subscribe((chart) => {
        this.store.dispatch(
          DatasetsActions.loadDataset({ id: chart.datasetId || '' })
        );
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onChartClick(event: any) {}
}

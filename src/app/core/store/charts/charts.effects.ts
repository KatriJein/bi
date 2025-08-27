import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChartService } from '../../api/services/chart.service';
import { ChartsActions } from '.';
import { toChartCreateRequest } from '../../utils';
import { ChartFiltersService } from '../../api/services';

@Injectable()
export class ChartsEffects {
  private actions$ = inject(Actions);
  private chartService = inject(ChartService);
  private chartFiltersService = inject(ChartFiltersService);

  loadCharts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.loadCharts),
      switchMap(() =>
        this.chartService.getCharts().pipe(
          map((charts) => ChartsActions.loadChartsSuccess({ charts })),
          catchError((error) =>
            of(ChartsActions.loadChartsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createChart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.createChart),
      switchMap(({ chart }) => {
        try {
          const request = toChartCreateRequest(chart);
          return this.chartService.createChart(request).pipe(
            map((createdChart) =>
              ChartsActions.createChartSuccess({ chart: createdChart })
            ),
            catchError((error) =>
              of(ChartsActions.createChartFailure({ error }))
            )
          );
        } catch (error) {
          return of(ChartsActions.createChartFailure({ error }));
        }
      })
    )
  );

  updateChart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.updateChart),
      switchMap(({ chart }) => {
        if (!chart.id) {
          return of(
            ChartsActions.updateChartFailure({
              error: new Error('Chart ID is missing'),
            })
          );
        }

        try {
          const updateRequest = toChartCreateRequest(chart);
          return this.chartService.updateChart(chart.id, updateRequest).pipe(
            map((updatedChart) =>
              ChartsActions.updateChartSuccess({ chart: updatedChart })
            ),
            catchError((error) =>
              of(ChartsActions.updateChartFailure({ error }))
            )
          );
        } catch (error) {
          return of(ChartsActions.updateChartFailure({ error }));
        }
      })
    )
  );

  deleteChart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.deleteChart),
      switchMap(({ id }) =>
        this.chartService.deleteChart(id).pipe(
          map(() => ChartsActions.deleteChartSuccess({ id })),
          catchError((error) => of(ChartsActions.deleteChartFailure({ error })))
        )
      )
    )
  );

  // Фильтры
  loadChartFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.loadChartsSuccess),
      switchMap(() =>
        this.chartFiltersService.getChartFilters().pipe(
          map((filters) => ChartsActions.loadChartFiltersSuccess({ filters })),
          catchError((error) =>
            of(ChartsActions.loadChartFiltersFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createChartFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.createChartFilter),
      switchMap(({ filter }) =>
        this.chartFiltersService.createChartFilter(filter).pipe(
          map((created) =>
            ChartsActions.createChartFilterSuccess({ filter: created })
          ),
          catchError((error) =>
            of(ChartsActions.loadChartFiltersFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateChartFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.updateChartFilter),
      switchMap(({ id, patch }) =>
        this.chartFiltersService.updateChartFilter(id, patch).pipe(
          map((updated) =>
            ChartsActions.updateChartFilterSuccess({ filter: updated })
          ),
          catchError((error) =>
            of(ChartsActions.loadChartFiltersFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteChartFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.deleteChartFilter),
      switchMap(({ id }) =>
        this.chartFiltersService.deleteChartFilter(id).pipe(
          map(() => ChartsActions.deleteChartFilterSuccess({ id })),
          catchError((error) =>
            of(ChartsActions.loadChartFiltersFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // Загрузка графика
  loadChart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.loadChart),
      switchMap(({ chartId }) =>
        
        this.chartService.getChartById(chartId).pipe(
          map((chart) => {
            if (!chart) throw new Error('Chart not found');
            return ChartsActions.loadChartSuccess({ chart });
          }),
          catchError((error) =>
            of(ChartsActions.loadChartFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // Загрузка фильтров графика
  loadChartSelections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChartsActions.loadChartSelections),
      switchMap(({ chartId }) =>
        this.chartFiltersService.getChartFiltersByChartId(chartId).pipe(
          map((filters) =>
            ChartsActions.loadChartSelectionsSuccess({ chartId, filters })
          ),
          catchError((error) =>
            of(
              ChartsActions.loadChartSelectionsFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );
}

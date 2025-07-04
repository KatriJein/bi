import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChartService } from '../../api/services/chart.service';
import { ChartsActions } from '.';
import { toChartCreateRequest } from '../../utils';

@Injectable()
export class ChartsEffects {
  private actions$ = inject(Actions);
  private chartService = inject(ChartService);

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
}

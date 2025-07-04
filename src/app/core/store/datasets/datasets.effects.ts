import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as DatasetsActions from './datasets.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DatasetService } from '../../api/services';
import { Router } from '@angular/router';

@Injectable()
export class DatasetsEffects {
  private actions$ = inject(Actions);
  private datasetService = inject(DatasetService);
  private router = inject(Router);

  loadDatasets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DatasetsActions.loadDatasets),
      switchMap(() =>
        this.datasetService.getDatasets().pipe(
          map((datasets) => DatasetsActions.loadDatasetsSuccess({ datasets })),
          catchError((error) =>
            of(DatasetsActions.loadDatasetsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createDataset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DatasetsActions.addDataset),
      switchMap(({ dataset }) =>
        this.datasetService.createDataset(dataset).pipe(
          map((created) => {
            this.router.navigate(['/dataset', created.id]);
            return DatasetsActions.addDatasetSuccess({ dataset: created });
          }),
          catchError((error) =>
            of(DatasetsActions.addDatasetFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateDataset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DatasetsActions.updateDataset),
      switchMap(({ id, patch }) =>
        this.datasetService.updateDataset(id, patch).pipe(
          map((updated) =>
            DatasetsActions.updateDatasetSuccess({ dataset: updated })
          ),
          catchError((error) =>
            of(DatasetsActions.updateDatasetFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteDataset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DatasetsActions.deleteDataset),
      switchMap(({ id }) =>
        this.datasetService.deleteDataset(id).pipe(
          map(() => DatasetsActions.deleteDatasetSuccess({ id })),
          catchError((error) =>
            of(DatasetsActions.deleteDatasetFailure({ error: error.message }))
          )
        )
      )
    )
  );

  
}

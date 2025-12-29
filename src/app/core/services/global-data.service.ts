import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { DatasetsActions } from '../store/datasets';
import { ChartsActions } from '../store/charts';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {
  private isLoaded = false;

  constructor(private store: Store) {}

  ensureLoaded(): void {
    if (this.isLoaded) return;

    this.store.dispatch(DatasetsActions.loadDatasets());
    this.store.dispatch(ChartsActions.loadCharts());

    this.isLoaded = true;
  }
}

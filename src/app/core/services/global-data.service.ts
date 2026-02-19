import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { DatasetsActions } from '../store/datasets';
import { ChartsActions } from '../store/charts';
import { RolesActions } from '../store/roles';
import { UsersActions } from '../store/users';

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
    this.store.dispatch(RolesActions.loadRoles());
    this.store.dispatch(UsersActions.loadUsers());

    this.isLoaded = true;
  }
}

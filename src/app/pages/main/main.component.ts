import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  InterfaceDto,
  InterfacesActions,
  InterfacesSelectors,
} from '../../core/store/interfaces';
import { InterfaceService } from '../../core/api/services';
import { DashboardDto, DashboardsSelectors } from '../../core/store/dashboards';
import { DatasetsActions } from '../../core/store/datasets';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  providers: [InterfaceService],
})
export class MainComponent implements OnInit {
  private store = inject(Store);

  interfaces$ = this.store.select(InterfacesSelectors.selectAllInterfaces);
  activeInterface$ = this.store.select(
    InterfacesSelectors.selectActiveInterface
  );

  loading$ = combineLatest([
    this.store.select(InterfacesSelectors.selectInterfacesLoading),
    this.store.select(DashboardsSelectors.selectIsLoading),
  ]).pipe(map((loadings) => loadings.some((loading) => loading)));

  dashboardsSplit$ = this.activeInterface$.pipe(
    switchMap((activeInterface) => {
      if (!activeInterface?.id) return of({ first: [], second: [] });

      return this.store
        .select(
          DashboardsSelectors.selectRootDashboardsByInterfaceId(
            activeInterface.id
          )
        )
        .pipe(
          map((dashboards) => {
            const splitIndex = Math.ceil(dashboards.length / 2);
            return {
              first: dashboards.slice(0, splitIndex),
              second: dashboards.slice(splitIndex),
            };
          })
        );
    })
  );
  
  firstColumnDashboards$ = this.dashboardsSplit$.pipe(
    map((split) => split.first)
  );
  secondColumnDashboards$ = this.dashboardsSplit$.pipe(
    map((split) => split.second)
  );

  constructor() {}

  ngOnInit() {
    this.store.dispatch(DatasetsActions.loadDatasets());
  }

  setActiveInterface(id: string | undefined) {
    if (!id) return;
    this.store.dispatch(InterfacesActions.setActiveInterface({ id }));
  }
}

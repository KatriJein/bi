import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  InterfaceDto,
  InterfacesActions,
  InterfacesSelectors,
} from '../../core/store/interfaces';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { InterfaceService } from '../../core/api/services';
import { DashboardDto, DashboardsSelectors } from '../../core/store/dashboards';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatMenuModule } from '@angular/material/menu';
import { DatasetsActions } from '../../core/store/datasets';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
// import { IconMap } from '../../core/utils';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    // LogoComponent,
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule
    // MatMenuModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  providers: [InterfaceService],
})
export class MainComponent implements OnInit {
  // user$: Observable<UserDto | null>;
  interfaces$: Observable<InterfaceDto[]>;
  activeInterface$: Observable<InterfaceDto | null | undefined>;
  loading$: Observable<boolean>;
  firstColumnDashboards$: Observable<DashboardDto[]>;
  secondColumnDashboards$: Observable<DashboardDto[]>;

  constructor(private store: Store) {
    // this.user$ = this.store.select(UserSelectors.selectUser);
    this.interfaces$ = this.store.select(
      InterfacesSelectors.selectAllInterfaces
    );
    this.activeInterface$ = this.store.select(
      InterfacesSelectors.selectActiveInterface
    );
    const dashboardsSplit$ = this.activeInterface$.pipe(
      switchMap((activeInterface) => {
        if (!activeInterface?.id) return of({ first: [], second: [] });

        return this.store
          .select(
            DashboardsSelectors.selectDashboardsByInterfaceId(
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

    this.firstColumnDashboards$ = dashboardsSplit$.pipe(
      map((split) => split.first)
    );
    this.secondColumnDashboards$ = dashboardsSplit$.pipe(
      map((split) => split.second)
    );
    this.loading$ = combineLatest([
      // this.store.select(UserSelectors.selectIsLoading),
      this.store.select(InterfacesSelectors.selectInterfacesLoading),
      this.store.select(DashboardsSelectors.selectIsLoading),
    ]).pipe(map((loadings) => loadings.some((loading) => loading)));
  }

  ngOnInit() {
    // this.store.dispatch(
    //   UserActions.login({
    //     name: 'Администратор',
    //     password:
    //       '$2a$06$DOcdRmKkyE87zfZConVbSO/ueB46STjUZ/tkm.ou1rdFAWA.u4cke',
    //   })
    // );
    this.store.dispatch(DatasetsActions.loadDatasets());
  }

  setActiveInterface(id: string | undefined) {
    if (!id) return;
    this.store.dispatch(InterfacesActions.setActiveInterface({ id }));
  }
}

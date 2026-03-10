import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  combineLatest,
  EMPTY,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import {
  InterfaceDto,
  InterfacesActions,
  InterfacesSelectors,
} from '../../core/store/interfaces';
import { InterfaceService } from '../../core/api/services';
import { DashboardsSelectors } from '../../core/store/dashboards';
import { SmartIconComponent } from '../../components/common';
import { Title } from '@angular/platform-browser';
import { WidgetsSelectors } from '../../core/store/widgets';
import {
  buildDashboardHierarchy,
  findFirstDashboardWithWidgets,
  getFallbackDashboard,
  PermissionMap,
} from '../../utils';
import { GlobalDataService } from '../../core/services/global-data.service';
import { UserSelectors } from '../../core/store/user';

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
    SmartIconComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  providers: [InterfaceService],
})
export class MainComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private titleService = inject(Title);
  // private globalData = inject(GlobalDataService);

  interfaces$ = this.store.select(InterfacesSelectors.selectInterfaces);
  activeInterface$ = this.store.select(
    InterfacesSelectors.selectActiveInterface,
  );
  activeInterfaceId$ = this.store.select(
    InterfacesSelectors.selectActiveInterfaceId,
  );
  
  loading$ = combineLatest([
    this.store.select(InterfacesSelectors.selectIsLoading),
    this.store.select(DashboardsSelectors.selectIsLoading),
  ]).pipe(map((loadings) => loadings.some((loading) => loading)));

  dashboardsSplit$ = this.activeInterface$.pipe(
    switchMap((activeInterface) => {
      if (!activeInterface?.id) return of({ first: [], second: [] });

      return this.store
        .select(
          DashboardsSelectors.selectRootDashboardsByInterfaceId(
            activeInterface.id,
          ),
        )
        .pipe(
          map((dashboards) => {
            const splitIndex = Math.ceil(dashboards.length / 2);
            return {
              first: dashboards.slice(0, splitIndex),
              second: dashboards.slice(splitIndex),
            };
          }),
        );
    }),
  );

  firstColumnDashboards$ = this.dashboardsSplit$.pipe(
    map((split) => split.first),
  );
  secondColumnDashboards$ = this.dashboardsSplit$.pipe(
    map((split) => split.second),
  );

  handleDashboardClick(rootDashboardId: string | undefined): void {
    if (!rootDashboardId) {
      console.warn('Попытка клика по дашборду без id');
      return;
    }

    this.activeInterfaceId$
      .pipe(
        take(1),
        switchMap((activeInterfaceId) => {
          if (!activeInterfaceId) {
            this.router.navigate(['/dashboard', rootDashboardId]);
            return EMPTY;
          }

          const dashboards$ = this.store.select(
            DashboardsSelectors.selectDashboardsByInterfaceId(
              activeInterfaceId,
            ),
          );
          const widgets$ = this.store.select(WidgetsSelectors.selectWidgets);

          return combineLatest([dashboards$, widgets$]).pipe(
            take(1),
            tap(([dashboards, widgetsRecord]) => {
              const hierarchy = buildDashboardHierarchy(dashboards);
              const root = hierarchy.find((d) => d.id === rootDashboardId);

              if (!root) {
                this.router.navigate(['/dashboard', rootDashboardId]);
                return;
              }

              const dashboardWithWidgets = findFirstDashboardWithWidgets(
                root,
                widgetsRecord,
              );

              if (dashboardWithWidgets) {
                this.router.navigate(['/dashboard', dashboardWithWidgets]);
              } else {
                const fallbackId = getFallbackDashboard(root);
                this.router.navigate(['/dashboard', fallbackId]);
              }
            }),
          );
        }),
      )
      .subscribe();
  }

  constructor() {}

  ngOnInit() {
    this.titleService.setTitle('Главная страница');
    // this.globalData.ensureLoaded();
  }

  setActiveInterface(id: string | undefined) {
    if (!id) return;
    this.store.dispatch(InterfacesActions.setActiveInterface({ id }));
  }
}

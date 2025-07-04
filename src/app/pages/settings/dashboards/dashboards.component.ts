import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  DashboardDto,
  DashboardsActions,
  DashboardsSelectors,
} from '../../../core/store/dashboards';
import { InterfacesSelectors } from '../../../core/store/interfaces';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EditDashboardModalComponent } from '../../../components/settings/edit-dashboard/edit-dashboard.component';
import { CreateDashboardModalComponent } from '../../../components/settings/create-dashboard/create-dashboard.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-settings-dashboards',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './dashboards.component.html',
  styleUrl: '../settings.component.scss',
})
export class DashboardsSettingsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private dialog = inject(MatDialog);

  searchQuery = signal('');
  selectedInterfaceId$ = new BehaviorSubject<string | null>(null);

  dashboards$: Observable<DashboardDto[]> = this.selectedInterfaceId$.pipe(
    switchMap((interfaceId) => {
      if (!interfaceId) {
        return of([]);
      }
      return this.store.select(
        DashboardsSelectors.selectDashboardsByInterfaceId(interfaceId)
      );
    })
  );

  interfaces$ = this.store.select(InterfacesSelectors.selectAllInterfaces);

  interfaceWithSelection$ = combineLatest([
    this.interfaces$,
    this.selectedInterfaceId$,
  ]).pipe(map(([interfaces, selectedId]) => ({ interfaces, selectedId })));

  filteredDashboards$ = combineLatest([
    this.dashboards$,
    toObservable(this.searchQuery),
  ]).pipe(
    map(([dashboards, query]) => {
      if (!query.trim()) {
        return dashboards;
      }
      const searchTerm = query.toLowerCase().trim();
      return dashboards.filter(
        (dashboard) =>
          dashboard.name?.toLowerCase().includes(searchTerm) ?? false
      );
    })
  );

  ngOnInit() {
    combineLatest([
      this.route.params.pipe(map((params) => params['interfaceId'])),
      this.interfaces$.pipe(filter((arr) => arr.length > 0)),
    ])
      .pipe(
        tap(([interfaceId]) => {
          this.selectedInterfaceId$.next(interfaceId);
        })
      )
      .subscribe();
  }

  onInterfaceChange(newInterfaceId: string) {
    this.selectedInterfaceId$.next(newInterfaceId);
    this.router.navigate(['/settings/dashboards', newInterfaceId]);
  }

  async openCreateDashboardModal(): Promise<void> {
    const dashboards = await firstValueFrom(this.dashboards$);

    const maxOrder = dashboards.reduce(
      (max, dashboard) => Math.max(max, dashboard.order || 0),
      0
    );

    this.dialog.open(CreateDashboardModalComponent, {
      width: '600px',
      data: {
        order: maxOrder + 1,
      },
    });
  }

  openEditDashboardModal(dashboard: DashboardDto, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.dialog
      .open(EditDashboardModalComponent, {
        width: '600px',
        data: {
          name: dashboard.name,
          icon: dashboard.iconId,
          color: dashboard.color,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          const interfaceId = this.selectedInterfaceId$.value;
          if (!interfaceId) return;

          this.store.dispatch(
            DashboardsActions.updateDashboard({
              id: dashboard.id!,
              patch: {
                name: result.name,
                iconId: result.icon,
                color: result.color,
              },
              interfaceId,
            })
          );
        }
      });
  }

  async moveDashboardUp(dashboard: DashboardDto, event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    const interfaceId = this.selectedInterfaceId$.value;
    if (!interfaceId) return;

    const dashboards = await firstValueFrom(this.dashboards$);
    const currentIndex = dashboards.findIndex((d) => d.id === dashboard.id);

    if (currentIndex > 0) {
      const newOrder = currentIndex;
      const prevDashboard = dashboards[currentIndex - 1];
      const prevNewOrder = currentIndex + 1;

      this.store.dispatch(
        DashboardsActions.updateDashboardOrder({
          dashboardId: dashboard.id!,
          interfaceId,
          order: dashboard.order!,
          newOrder,
        })
      );

      this.store.dispatch(
        DashboardsActions.updateDashboardOrder({
          dashboardId: prevDashboard.id!,
          interfaceId,
          order: prevDashboard.order!,
          newOrder: prevNewOrder,
        })
      );
    }
  }

  async moveDashboardDown(
    dashboard: DashboardDto,
    event: Event
  ): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    const interfaceId = this.selectedInterfaceId$.value;
    if (!interfaceId) return;

    const dashboards = await firstValueFrom(this.dashboards$);
    const currentIndex = dashboards.findIndex((d) => d.id === dashboard.id);

    if (currentIndex < dashboards.length - 1) {
      const newOrder = currentIndex + 2;
      const nextDashboard = dashboards[currentIndex + 1];
      const nextNewOrder = currentIndex + 1;

      this.store.dispatch(
        DashboardsActions.updateDashboardOrder({
          dashboardId: dashboard.id!,
          interfaceId,
          order: dashboard.order!,
          newOrder,
        })
      );

      this.store.dispatch(
        DashboardsActions.updateDashboardOrder({
          dashboardId: nextDashboard.id!,
          interfaceId,
          order: nextDashboard.order!,
          newOrder: nextNewOrder,
        })
      );
    }
  }

  onDelete(dashboardId: string, order: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (confirm('Удалить этот дашборд?')) {
      const interfaceId = this.selectedInterfaceId$.value;
      if (!interfaceId) {
        console.warn('InterfaceId не выбран');
        return;
      }

      this.store.dispatch(
        DashboardsActions.removeDashboard({ dashboardId, interfaceId, order })
      );
    }
  }

  trackById(index: number, item: DashboardDto): string {
    return item.id || '';
  }
}

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { DatasetsActions, DatasetsSelectors } from '../store/datasets';
import { ChartsActions, ChartsSelectors } from '../store/charts';
import { RolesActions, RolesSelectors } from '../store/roles';
import { UsersActions, UsersSelectors } from '../store/users';
import { InterfacesActions, InterfacesSelectors } from '../store/interfaces';
import { Permission } from '../store/user';
import { Actions, ofType } from '@ngrx/effects';

@Injectable({ providedIn: 'root' })
export class DataLoadingService {
  private loadingEntities = new Set<string>();

  private readonly selectorMap: Record<string, any> = {
    datasets: DatasetsSelectors.selectLoaded,
    charts: ChartsSelectors.selectLoaded,
    roles: RolesSelectors.selectLoaded,
    users: UsersSelectors.selectLoaded,
    interfaces: InterfacesSelectors.selectLoaded,
  };

  // Действия для запуска загрузки
  private readonly loadActionMap: Record<string, any> = {
    datasets: DatasetsActions.loadDatasets(),
    charts: ChartsActions.loadCharts(),
    roles: RolesActions.loadRoles(),
    users: UsersActions.loadUsers(),
    interfaces: InterfacesActions.loadAllInterfaces(),
  };

  // Действия успешной загрузки (нужны для снятия блокировки)
  private readonly successActionMap: Record<string, any> = {
    datasets: DatasetsActions.loadDatasetsSuccess,
    charts: ChartsActions.loadChartsSuccess,
    roles: RolesActions.loadRolesSuccess,
    users: UsersActions.loadUsersSuccess,
    interfaces: InterfacesActions.loadAllInterfacesSuccess,
  };

  // Действия ошибки
  private readonly failureActionMap: Record<string, any> = {
    datasets: DatasetsActions.loadDatasetsFailure,
    charts: ChartsActions.loadChartsFailure,
    roles: RolesActions.loadRolesFailure,
    users: UsersActions.loadUsersFailure,
    interfaces: InterfacesActions.loadAllInterfacesFailure,
  };

  constructor(
    private store: Store,
    private actions$: Actions,
  ) {}

  loadRequiredData(permissions: Permission[]): void {
    this.loadIfNeeded('datasets');
    this.loadIfNeeded('charts');

    // Роли
    if (this.hasAnyPermission(permissions, ['roles.manage', 'full_access'])) {
      this.loadIfNeeded('roles');
    }

    // Пользователи
    if (this.hasAnyPermission(permissions, ['users.manage', 'full_access'])) {
      this.loadIfNeeded('roles');
      this.loadIfNeeded('users');
      this.loadIfNeeded('interfaces');
    }

    // Интерфейсы
    if (
      this.hasAnyPermission(permissions, ['interfaces.manage', 'full_access'])
    ) {
      this.loadIfNeeded('interfaces');
    }

    // Дашборды
    if (
      this.hasAnyPermission(permissions, ['dashboards.manage', 'full_access'])
    ) {
      this.loadIfNeeded('interfaces');
    }
  }

  private loadIfNeeded(entity: string): void {
    if (this.loadingEntities.has(entity)) {
      return;
    }

    const loadAction = this.loadActionMap[entity];
    const successAction = this.successActionMap[entity];
    const failureAction = this.failureActionMap[entity];
    const loadedSelector = this.selectorMap[entity];

    if (!loadAction || !successAction || !failureAction) {
      console.warn(
        `DataLoadingService: missing actions for entity "${entity}"`,
      );
      return;
    }

    const checkIfLoaded = (callback: (alreadyLoaded: boolean) => void) => {
      if (loadedSelector) {
        this.store
          .select(loadedSelector)
          .pipe(take(1))
          .subscribe((loaded) => callback(loaded as boolean));
      } else {
        callback(false);
      }
    };

    checkIfLoaded((alreadyLoaded) => {
      if (alreadyLoaded) {
        return;
      }

      this.loadingEntities.add(entity);
      this.store.dispatch(loadAction);

      const successSub = this.actions$
        .pipe(ofType(successAction), take(1))
        .subscribe(() => {
          this.loadingEntities.delete(entity);
          successSub.unsubscribe();
        });

      const failureSub = this.actions$
        .pipe(ofType(failureAction), take(1))
        .subscribe(() => {
          this.loadingEntities.delete(entity);
          failureSub.unsubscribe();
        });
    });
  }

  private hasAnyPermission(
    userPermissions: Permission[],
    required: Permission[],
  ): boolean {
    return required.some((p) => userPermissions.includes(p));
  }
}

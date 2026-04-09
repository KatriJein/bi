import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserSelectors } from '../core/store/user';
import { PermissionMap } from '../utils';

@Injectable({ providedIn: 'root' })
export class SettingsLandingGuard implements CanActivate {
  private readonly settingsSections = [
    'datasets',
    'charts',
    'interfaces',
    'dashboards',
    'users',
    'roles',
  ] as const;

  constructor(
    private store: Store,
    private router: Router,
  ) {}

  canActivate(_: unknown, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    if (state.url !== '/settings' && state.url !== '/settings/') {
      return of(true);
    }

    return this.store.select(UserSelectors.selectCurrentUserPermissions).pipe(
      take(1),
      map((permissions) => {
        const hasFullAccess = permissions.includes('full_access');

        const firstAvailable = this.settingsSections.find((section) => {
          const requiredPermissions = PermissionMap[section];
          return (
            hasFullAccess ||
            requiredPermissions.some((permission) =>
              permissions.includes(permission),
            )
          );
        });

        if (!firstAvailable) {
          return this.router.parseUrl('/');
        }

        return this.router.parseUrl(`/settings/${firstAvailable}`);
      }),
    );
  }
}

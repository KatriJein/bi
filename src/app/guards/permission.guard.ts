import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Permission, UserSelectors } from '../core/store/user';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const requiredPermissions = route.data['permissions'] as
      | Permission[]
      | undefined;

    return this.store.select(UserSelectors.selectCurrentUserPermissions).pipe(
      take(1),
      map((userPermissions) => {
        if (!requiredPermissions || requiredPermissions.length === 0) {
          return true;
        }

        if (userPermissions.includes('full_access')) {
          return true;
        }

        const hasRequired = requiredPermissions.some((p) =>
          userPermissions.includes(p),
        );
        if (!hasRequired) {
          const navigation = this.router.getCurrentNavigation();
          const previousUrl =
            navigation?.previousNavigation?.finalUrl?.toString();
          if (
            previousUrl &&
            !previousUrl.startsWith('/auth') &&
            previousUrl !== state.url
          ) {
            return this.router.parseUrl(previousUrl);
          }
          return this.router.parseUrl('/');
        }
        return true;
      }),
    );
  }
}

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { UserSelectors } from '../core/store/user';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.store.select(UserSelectors.selectUser).pipe(
      take(1),
      map((user) => {
        const onlyUnAuth = route.data['onlyUnAuth'] === true;

        if (!onlyUnAuth && !user) {
          return this.router.createUrlTree(['/auth'], {
            queryParams: { returnUrl: state.url },
          });
        }

        if (onlyUnAuth && user) {
          const returnUrl = route.queryParams['returnUrl'];
          const target = returnUrl && !returnUrl.startsWith('/auth') ? returnUrl : '/';
          return this.router.createUrlTree([target]);
        }

        return true;
      })
    );
  }
}

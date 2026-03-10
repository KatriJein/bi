import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../components/logo/logo.component';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { UserActions, UserDto, UserSelectors } from '../../core/store/user';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PermissionMap } from '../../utils';

@Component({
  selector: 'app-header',
  imports: [
    LogoComponent,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    RouterModule,
    MatIconModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private store = inject(Store);
  private router = inject(Router);

  user$: Observable<UserDto | null>;
  permissions$ = this.store.select(UserSelectors.selectCurrentUserPermissions);

  hasAnySettingsPermission$ = this.permissions$.pipe(
    map((permissions) => {
      const hasFullAccess = permissions.includes('full_access');
      return Object.values(PermissionMap).some(
        (requiredPermissions) =>
          hasFullAccess ||
          requiredPermissions.some((p) => permissions.includes(p)),
      );
    }),
  );

  constructor() {
    this.user$ = this.store.select(UserSelectors.selectUser);
  }

  onLogout(): void {
    this.store.dispatch(UserActions.logout());
    this.router.navigate(['/auth']);
  }
}

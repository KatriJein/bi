import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import {
  Permission,
  UserActions,
  UserDto,
  UserSelectors,
} from '../../core/store/user';
import { filter, first, map, Observable, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  OnMainButtonComponent,
  SmartIconComponent,
} from '../../components/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { GlobalDataService } from '../../core/services/global-data.service';
import { PermissionMap } from '../../utils';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    OnMainButtonComponent,
    MatTooltipModule,
    SmartIconComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private titleService = inject(Title);
  private store = inject(Store);
  // private globalData = inject(GlobalDataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  user$: Observable<UserDto | null> = this.store.select(
    UserSelectors.selectUser,
  );
  permissions$ = this.store.select(UserSelectors.selectCurrentUserPermissions);

  isSidebarCollapsed = false;
  sidenavWidth = 300;
  collapsedWidth = 80;

  filteredButtons$ = this.permissions$.pipe(
    map((permissions) => {
      const hasFullAccess = permissions.includes('full_access');
      return this.buttons.filter((button) => {
        const requiredPermissions = PermissionMap[button.link];
        if (!requiredPermissions) return true;
        return (
          hasFullAccess ||
          requiredPermissions.some((p) => permissions.includes(p))
        );
      });
    }),
  );

  buttons = [
    { link: 'datasets', name: 'Датасеты', icon: 'storage' },
    { link: 'charts', name: 'Графики', icon: 'bar_chart' },
    { link: 'interfaces', name: 'Интерфейсы', icon: 'widgets' },
    { link: 'dashboards', name: 'Дашборды', icon: 'dashboard' },
    { link: 'users', name: 'Пользователи', icon: 'people' },
    { link: 'roles', name: 'Роли', icon: 'security' },
  ];

  constructor() {
    this.titleService.setTitle('Страница настроек');
    // this.globalData.ensureLoaded();
  }

  ngOnInit(): void {
    if (this.route.firstChild === null) {
      this.user$
        .pipe(
          filter((user): user is UserDto => !!user),
          first(),
          switchMap(() => this.permissions$.pipe(first()))
        )
        .subscribe((permissions) => {
          console.log('Permissions loaded:', permissions);
          const hasFullAccess = permissions.includes('full_access');

          const firstAvailable = this.buttons.find((button) => {
            const requiredPermissions = PermissionMap[button.link];
            if (!requiredPermissions) return true;
            return (
              hasFullAccess ||
              requiredPermissions.some((p) => permissions.includes(p))
            );
          });

          if (firstAvailable) {
            this.router.navigate([firstAvailable.link], {
              relativeTo: this.route,
            });
          } else {
            this.router.navigateByUrl('/');
          }
        });
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidenavWidth = this.isSidebarCollapsed ? this.collapsedWidth : 280;
  }
}

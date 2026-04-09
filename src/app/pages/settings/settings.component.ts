import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
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
import {
  filter,
  first,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
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
  private router = inject(Router);
  private destroy$ = new Subject<void>();

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
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.redirectFromBareSettings());

    this.redirectFromBareSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private redirectFromBareSettings(): void {
    const currentUrl = this.router.url;
    if (currentUrl !== '/settings' && currentUrl !== '/settings/') {
      return;
    }

    this.permissions$.pipe(first()).subscribe((permissions) => {
      const hasFullAccess = permissions.includes('full_access');
      const firstAvailable = this.buttons.find((button) => {
        const requiredPermissions = PermissionMap[button.link];
        return (
          hasFullAccess ||
          requiredPermissions.some((permission) =>
            permissions.includes(permission),
          )
        );
      });

      if (!firstAvailable) {
        this.router.navigateByUrl('/');
        return;
      }

      this.router.navigateByUrl(`/settings/${firstAvailable.link}`);
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidenavWidth = this.isSidebarCollapsed ? this.collapsedWidth : 280;
  }
}

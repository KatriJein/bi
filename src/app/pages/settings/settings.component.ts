import { Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { UserActions, UserDto, UserSelectors } from '../../core/store/user';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OnMainButtonComponent, SmartIconComponent } from '../../components/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { GlobalDataService } from '../../core/services/global-data.service';

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
    SmartIconComponent
],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private titleService = inject(Title);
  private store = inject(Store);
  private globalData = inject(GlobalDataService);
  user$: Observable<UserDto | null> = this.store.select(
    UserSelectors.selectUser
  );

  isSidebarCollapsed = false;
  sidenavWidth = 300;
  collapsedWidth = 80;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidenavWidth = this.isSidebarCollapsed ? this.collapsedWidth : 280;
  }

  buttons = [
    { link: 'datasets', name: 'Датасеты', icon: 'storage' },
    { link: 'charts', name: 'Графики', icon: 'bar_chart' },
    { link: 'interfaces', name: 'Интерфейсы', icon: 'widgets' },
    { link: 'dashboards', name: 'Дашборды', icon: 'dashboard' },
  ];

  constructor() {
    this.titleService.setTitle('Страница настроек');
    this.globalData.ensureLoaded();
  }
}

import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { UserActions, UserDto, UserSelectors } from '../../core/store/user';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartsActions } from '../../core/store/charts';
import { DatasetsActions } from '../../core/store/datasets';

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
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private store = inject(Store);
  user$: Observable<UserDto | null> = this.store.select(
    UserSelectors.selectUser
  );

  buttons = [
    { link: 'datasets', name: 'Датасеты' },
    { link: 'charts', name: 'Графики' },
    { link: 'tables', name: 'Таблицы' },
    { link: 'interfaces', name: 'Интерфейсы' },
    { link: 'dashboards', name: 'Дашборды' },
  ];

  constructor() {
    this.store.dispatch(ChartsActions.loadCharts());
    this.store.dispatch(DatasetsActions.loadDatasets());
  }
}

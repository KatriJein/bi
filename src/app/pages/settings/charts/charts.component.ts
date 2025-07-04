import { Component, inject, signal } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ChartDto, ChartsSelectors } from '../../../core/store/charts';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { deleteChart } from '../../../core/store/charts/charts.actions';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { toObservable } from '@angular/core/rxjs-interop';
import { getChartIcon } from '../../../constants';

@Component({
  selector: 'app-settings-charts',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './charts.component.html',
  styleUrl: '../settings.component.scss',
})
export class ChartsSettingsComponent {
  private store = inject(Store);
  searchQuery = signal('');

  getChartIcon = getChartIcon;

  charts$: Observable<ChartDto[]> = this.store.select(
    ChartsSelectors.selectGraphs
  );

  filteredCharts$ = combineLatest([
    this.charts$,
    toObservable(this.searchQuery),
  ]).pipe(
    map(([charts, query]) => {
      if (!query.trim()) {
        return charts;
      }
      const searchTerm = query.toLowerCase().trim();
      return charts.filter(
        (chart) => chart.name?.toLowerCase().includes(searchTerm) ?? false
      );
    })
  );

  constructor() {}

  onDelete(id: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (confirm('Удалить этот график?')) {
      this.store.dispatch(deleteChart({ id }));
    }
  }
}

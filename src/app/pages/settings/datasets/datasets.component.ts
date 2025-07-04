import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { RouterModule } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { DatasetDto, DatasetsSelectors } from '../../../core/store/datasets';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { deleteDataset } from '../../../core/store/datasets/datasets.actions';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-settings-datasets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './datasets.component.html',
  styleUrls: ['../settings.component.scss'],
})
export class DatasetsSettingsComponent {
  private store = inject(Store);
  searchQuery = signal('');

  datasets$: Observable<DatasetDto[]> = this.store.select(
    DatasetsSelectors.selectDatasets
  );

  filteredDatasets$ = combineLatest([
    this.datasets$,
    toObservable(this.searchQuery),
  ]).pipe(
    map(([datasets, query]) => {
      if (!query.trim()) {
        return datasets;
      }
      const searchTerm = query.toLowerCase().trim();
      return datasets.filter(
        (dataset) => dataset.name?.toLowerCase().includes(searchTerm) ?? false
      );
    })
  );

  constructor() {}

  onDelete(id: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (confirm('Удалить этот датасет?')) {
      this.store.dispatch(deleteDataset({ id }));
    }
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Column } from '../../../core/models';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ChartPageStateService,
  FilterColumn,
} from '../../../services';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { FilterModalComponent } from '../filter/filter-modal/filter-modal.component';

export type ColumnKey =
  | 'xAxis'
  | 'yAxis'
  | 'filters'
  | 'sorting'
  | 'dimensions'
  | 'measures';

export type ExtendedColumn = Column | FilterColumn;

@Component({
  selector: 'app-data-selection-chart',
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './data-selection.component.html',
  styleUrl: './data-selection.component.scss',
  standalone: true,
})
export class DataSelectionChartComponent {
  private dialog = inject(MatDialog);
  private stateService = inject(ChartPageStateService);

  dimensions = toSignal(this.stateService.dimensions$, { initialValue: [] });
  measures = toSignal(this.stateService.measures$, { initialValue: [] });

  columns = toSignal(this.stateService.allColumns$, { initialValue: [] });

  xAxis = toSignal(this.stateService.xAxis$, { initialValue: [] });
  yAxis = toSignal(this.stateService.yAxis$, { initialValue: [] });
  filters = toSignal(this.stateService.filters$, {
    initialValue: [] as FilterColumn[],
  });
  sorting = toSignal(this.stateService.sorting$, {
    initialValue: [],
  });

  drop(event: CdkDragDrop<any[]>, target: string) {
    if (event.previousContainer === event.container) return;

    const prevKey = event.previousContainer.id as ColumnKey;
    const targetKey = target as ColumnKey;

    const prevData = [...this.stateService.getSubjectByKey(prevKey).getValue()];
    const targetData = [
      ...this.stateService.getSubjectByKey(targetKey).getValue(),
    ];

    const [movedItem] = prevData.splice(event.previousIndex, 1);

    const newMovedItem: ExtendedColumn =
      targetKey === 'sorting'
        ? { ...movedItem, direction: 'asc' }
        : (() => {
            const { direction, ...rest } = movedItem;
            return rest as Column;
          })();

    const exists = targetData.some(
      (c) => c.columnName === newMovedItem.columnName
    );
    this.stateService.updateColumns(prevKey, prevData);
    if (!exists) {
      targetData.splice(event.currentIndex, 0, newMovedItem);
      this.stateService.updateColumns(targetKey, targetData);
    }
  }

  toggleSortDirection(index: number, event: MouseEvent) {
    event.stopPropagation();
    const sorting = [...this.sorting()];
    sorting[index].direction =
      sorting[index].direction === 'asc' ? 'desc' : 'asc';
    this.stateService.updateColumns('sorting', sorting);
  }

  openAddFilterDialog() {
    this.dialog
      .open(FilterModalComponent, {
        data: {
          columns: this.columns(),
        },
        width: '600px',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: FilterColumn) => {
        if (!result?.columnName) return;

        const currentFilters = [...this.filters()];
        currentFilters.push({
          ...result,
        });

        this.stateService.updateColumns('filters', currentFilters);
      });
  }

  editFilter(filter: FilterColumn) {
    this.dialog
      .open(FilterModalComponent, {
        data: {
          columns: this.columns(),
          filterToEdit: filter,
        },
        width: '600px',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: FilterColumn) => {
        if (!result?.columnName) return;

        const updatedFilters = this.filters().map((f) =>
          f.columnName === filter.columnName && f.tableName === filter.tableName
            ? result
            : f
        );

        this.stateService.updateColumns('filters', updatedFilters);
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DatasetStateService } from '../../../services';
import { Observable } from 'rxjs';
import { Table } from '../../../core/api/graphql/types';

@Component({
  selector: 'app-tables',
  imports: [DragDropModule, CommonModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss',
})
export class TablesComponent implements OnInit {
  tables$: Observable<Table[]>;
  selectedTables$: Observable<Table[]>;
  allTables: Table[] = [];
  selectedTables: Table[] = [];

  constructor(private datasetState: DatasetStateService) {
    this.tables$ = this.datasetState.tables$;
    this.selectedTables$ = this.datasetState.selectedTables$;
  }

  ngOnInit(): void {
    this.datasetState.loadTables();

    this.tables$.subscribe((tables) => {
      this.allTables = tables ?? [];
    });

    this.selectedTables$.subscribe((tables) => {
      this.selectedTables = tables ?? [];
    });
  }

  onTableDrop(event: CdkDragDrop<Table[]>) {
    const item = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) return;

    if (event.container.id === 'selectedTables') {
      this.datasetState.addSelectedTable(item);
    } else if (event.container.id === 'availableTables') {
      this.datasetState.deselectTable(item);
    }
  }
}

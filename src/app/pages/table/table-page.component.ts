import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { TablePageStateService } from '../../services';
import { Dataset } from '../../core/models';
import { DataSelectionTableComponent } from '../../components/table/data-selection/data-selection.component';
import {
  AG_GRID_LOCALE_RU,
  AG_GRID_THEME,
  getAgGridFilterType,
} from '../../constants';
import { toCamelCase } from '../../core/utils';
import { ColDef } from 'ag-grid-community';
import { TableComponent } from '../../components/table/table/table.component';

@Component({
  selector: 'app-table-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    DataSelectionTableComponent,
    MatButtonModule,
    MatInputModule,
    MatExpansionModule,
    TableComponent,
  ],
  templateUrl: './table-page.component.html',
  styleUrl: './table-page.component.scss',
  providers: [Location],
})
export class TablePageComponent implements OnInit {
  private state = inject(TablePageStateService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  datasets$: Observable<Dataset[]> = this.state.datasets$;
  selectedDatasetControl = new FormControl<string | null>(null);
  selectedDatasetControl$ = this.state.selectedDataset$;

  tableColumns$ = this.state.tableColumns$;
  chartData$ = this.state.chartData$;

  nameControl = new FormControl<string>('');

  colDefs$: Observable<ColDef[]> = this.tableColumns$.pipe(
    map((columns) =>
      columns.map((column) => ({
        field: toCamelCase(column.columnName),
        headerName: column.alias,
        filter: getAgGridFilterType(column.dataType),
        filterParams: {
          buttons: ['reset', 'apply'],
        },
      }))
    )
  );

  defaultColDef: ColDef = {
    flex: 1,
    floatingFilter: true,
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const tableId = params.get('id');
      const url = this.route.snapshot.routeConfig?.path;

      if (url === 'table/new') {
        this.state.createNewTable();
      } else if (tableId) {
        this.state.loadTableFromStore(tableId);
      }
    });

    this.state.selectedDataset$.subscribe((dataset) => {
      if (dataset) {
        this.selectedDatasetControl.setValue(dataset.id || '');
      }
    });

    this.selectedDatasetControl.valueChanges
      .pipe(filter((id): id is string => id !== null))
      .subscribe((id) => {
        this.state.setSelectedDatasetId(id);
      });

    this.state.table$.subscribe((table) => {
      if (table?.name != null) {
        this.nameControl.setValue(table.name, { emitEvent: false });
      }
    });

    this.nameControl.valueChanges.subscribe((name) => {
      this.state.updateChartField('name', name || '');
    });
  }

  onSave(): void {
    const table = this.state.getCurrentTable();
    if (table?.id) {
      this.state.updateTable();
    } else {
      this.state.saveTable();
    }
  }

  onDelete(): void {
    const table = this.state.getCurrentTable();
    if (table?.id) {
      this.state.deleteTable(table.id);
    }
  }

  onCancel(): void {
    this.location.back();
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Column, Dataset } from '../core/models';
import { Table } from '../core/api/graphql/types';
import { TableSchemaService, TablesService } from '../core/api/services';
import { pluralizeTableName } from '../core/utils';

@Injectable({ providedIn: 'root' })
export class DatasetStateService {
  constructor(
    private tablesService: TablesService,
    private tableSchemaService: TableSchemaService
  ) {}
  private datasetSubject = new BehaviorSubject<Dataset>(new Dataset({}));
  dataset$ = this.datasetSubject.asObservable();

  private tablesSubject = new BehaviorSubject<Table[]>([]);
  tables$ = this.tablesSubject.asObservable();

  private selectedTablesSubject = new BehaviorSubject<Table[]>([]);
  selectedTables$ = this.selectedTablesSubject.asObservable();

  private allAvailableTablesSubject = new BehaviorSubject<Table[]>([]);

  get tables() {
    return this.tablesSubject.getValue();
  }

  get value() {
    return this.datasetSubject.getValue();
  }

  set(dataset: Dataset) {
    this.datasetSubject.next(dataset);
    this.updateSelectedTables();
  }

  patch(partial: Partial<Dataset>) {
    const updated = new Dataset({ ...this.value, ...partial });
    this.set(updated);
  }

  updateColumn<K extends keyof Column>(
    index: number,
    field: K,
    value: Column[K]
  ) {
    const dataset = this.value;

    if (!dataset.columns) return;

    const newColumns = [...dataset.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };

    this.set(new Dataset({ ...dataset, columns: newColumns }));
  }

  loadTables(): void {
    this.tablesService.getTables().subscribe((tables) => {
      this.tablesSubject.next(tables);
      this.allAvailableTablesSubject.next(tables);

      this.updateSelectedTables();
    });
  }

  private updateSelectedTables(): void {
    const tableNames = new Set(
      this.datasetSubject.getValue().columns?.map((c) => c.tableName)
    );
    const allTables = this.allAvailableTablesSubject.getValue();
    const selectedTables = allTables.filter((t) => tableNames.has(t.tableName));
    this.selectedTablesSubject.next(selectedTables);

    const remainingTables = allTables.filter(
      (t) => !tableNames.has(t.tableName)
    );
    this.tablesSubject.next(remainingTables);
  }

  loadColumnsForTable(table: Table): void {
    this.tableSchemaService
      .getTableColumns(table.tableName)
      .subscribe((columns) => {
        const newColumns: Column[] = columns.map((col) => ({
          columnName: col.columnName,
          alias: col.columnName,
          isVisible: true,
          tableName: table.tableName,
          dataType: col.dataType,
          aggregate: 'NONE',
        }));

        const dataset = this.value;
        const merged = [...(dataset.columns || []), ...newColumns];

        this.set(new Dataset({ ...dataset, columns: merged }));
      });
  }

  addSelectedTable(table: Table): void {
    const current = this.selectedTablesSubject.getValue();
    const alreadySelected = current.find(
      (t) => t.tableName === table.tableName
    );

    if (!alreadySelected) {
      const newSelected = [...current, table];
      this.selectedTablesSubject.next(newSelected);

      const remaining = this.tablesSubject
        .getValue()
        .filter((t) => t.tableName !== table.tableName);
      this.tablesSubject.next(remaining);

      const dataset = this.value;

      const updatedDataset = new Dataset({
        ...dataset,
        tableName: dataset.tableName || table.tableName,
      });

      this.set(updatedDataset);

      this.loadColumnsForTable(table);
    }
  }

  deselectTable(table: Table): void {
    const selected = this.selectedTablesSubject.getValue();
    const updatedSelected = selected.filter(
      (t) => t.tableName !== table.tableName
    );
    this.selectedTablesSubject.next(updatedSelected);

    const all = this.tablesSubject.getValue();
    if (!all.find((t) => t.tableName === table.tableName)) {
      this.tablesSubject.next([...all, table]);
    }

    const dataset = this.value;
    const filteredColumns = (dataset.columns || []).filter(
      (c) => c.tableName !== table.tableName
    );
    this.set(new Dataset({ ...dataset, columns: filteredColumns }));
  }
}

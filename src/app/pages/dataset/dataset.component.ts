import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, Observable, Subscription, take } from 'rxjs';
import {
  MatTabsModule,
  MatTabGroup,
  MatTabChangeEvent,
} from '@angular/material/tabs';
import { Dataset } from '../../core/models';
import { DatasetsActions, DatasetsSelectors } from '../../core/store/datasets';
import {
  ColumnsTableComponent,
  TablesComponent,
} from '../../components/dataset';
import { TableSchemaService } from '../../core/api/services';
import { CommonModule } from '@angular/common';
import { DatasetStateService } from '../../services';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
  standalone: true,
  imports: [
    TablesComponent,
    ColumnsTableComponent,
    MatTabsModule,
    MatTabGroup,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class DatasetComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private router = inject(Router);
  private location = inject(Location);
  dataset$: Observable<Dataset>;
  private sub = new Subscription();
  nameControl = new FormControl('');
  private titleService = inject(Title);

  constructor(private datasetState: DatasetStateService) {
    this.dataset$ = this.datasetState.dataset$;
  }

  selectedTable = 'aircrafts';
  currentTab: 'tables' | 'columns' = 'tables';

  ngOnInit(): void {
    this.datasetState.loadTables();

    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.titleService.setTitle('Редактирование датасета');
          this.sub.add(
            this.store
              .select(DatasetsSelectors.selectDatasetById(id))
              .pipe(
                filter((dataset) => !!dataset),
                take(1)
              )
              .subscribe((dataset) => {
                if (dataset) {
                  this.sub.add(
                    this.datasetState.tables$
                      .pipe(
                        filter((tables) => tables.length > 0),
                        take(1)
                      )
                      .subscribe(() => {
                        this.datasetState.set(new Dataset(dataset));
                        this.nameControl.setValue(dataset.name);
                      })
                  );
                }
              })
          );
        } else {
          this.titleService.setTitle('Создание датасета');
          const newDataset = new Dataset({
            id: '',
            name: 'Новый датасет',
            query: '',
            columns: [],
            connection: '',
            settings: {},
          });

          this.sub.add(
            this.datasetState.tables$
              .pipe(
                filter((tables) => tables.length > 0),
                take(1)
              )
              .subscribe(() => {
                this.datasetState.set(newDataset);
                this.nameControl.setValue(newDataset.name || '');
              })
          );
        }
      })
    );

    this.sub.add(
      this.nameControl.valueChanges.subscribe((newName) => {
        this.datasetState.patch({ name: newName || '' });
      })
    );
  }

  getStatusClass(): string {
    return this.nameControl.dirty ? 'draft' : 'published';
  }

  getStatusText(): string {
    return this.nameControl.dirty ? 'Черновик' : 'Опубликован';
  }

  getColumnsCount(): number {
    return 0;
  }

  handleTabChange(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.currentTab = 'tables';
    } else if (event.index === 1) {
      this.currentTab = 'columns';
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onTabChange(tab: 'tables' | 'columns') {
    this.currentTab = tab;
  }

  onTableChange(tableName: string): void {
    this.selectedTable = tableName;

    const table = this.datasetState.tables.find(
      (t) => t.tableName === tableName
    );

    if (table) {
      this.datasetState.addSelectedTable(table);
    }
  }

  onNameChange(newName: string) {
    this.datasetState.patch({ name: newName });
  }

  onSave() {
    this.dataset$.pipe(take(1)).subscribe((dataset) => {
      if (!dataset.id) {
        this.store.dispatch(DatasetsActions.addDataset({ dataset }));
      } else {
        this.store.dispatch(
          DatasetsActions.updateDataset({
            id: dataset.id,
            patch: dataset,
          })
        );
      }
    });
  }

  onCancel(): void {
    this.location.back();
  }

  onDelete() {
    this.dataset$.pipe(take(1)).subscribe((dataset) => {
      if (dataset.id) {
        this.store.dispatch(DatasetsActions.deleteDataset({ id: dataset.id }));

        this.location.back();
      }
    });
  }
}

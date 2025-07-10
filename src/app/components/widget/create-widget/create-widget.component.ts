import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { WidgetType } from '../../../core/api/graphql/types';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { ChartDto, ChartsSelectors } from '../../../core/store/charts';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-create-widget-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgxMatSelectSearchModule,
    FormsModule,
  ],
  templateUrl: './create-widget.component.html',
  styleUrl: './create-widget.component.scss',
})
export class CreateWidgetModalComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA) as { type: WidgetType };
  type: WidgetType = this.data.type;

  form = this.fb.group({
    name: [''],
    chartId: [''],
  });

  chartSearchCtrl = new FormControl('');
  charts$ = this.store.select(ChartsSelectors.selectCharts);
  filteredCharts$: Observable<ChartDto[]> = combineLatest([
    this.charts$,
    this.chartSearchCtrl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([charts, search]) =>
      charts.filter((c) =>
        c.name.toLowerCase().includes((search ?? '').toLowerCase())
      )
    )
  );

  constructor() {}

  ngOnInit(): void {}

  get isChartWidget(): boolean {
    return this.type === 'chart';
  }

  get isTextWidget(): boolean {
    return this.type === 'text';
  }
}

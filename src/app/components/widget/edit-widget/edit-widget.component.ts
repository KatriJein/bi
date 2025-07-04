import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ColorPickerComponent } from '../../common';
import { Store } from '@ngrx/store';
import { VisualSettings, Widget } from '../../../core/api/graphql/types';
import { DashboardStateService } from '../../../services/dashboards-state.service';
import {
  fontSizes,
  predefinedColors,
  textAlignOptions,
  verticalAlignOptions,
} from '../../../constants';
import { ChartsSelectors } from '../../../core/store/charts';
import { combineLatest, map, startWith } from 'rxjs';

@Component({
  selector: 'app-edit-widget-modal',
  standalone: true,
  templateUrl: './edit-widget.component.html',
  styleUrl: './edit-widget.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatIconModule,
    NgxMatSelectSearchModule,
    ColorPickerComponent,
  ],
})
export class EditWidgetModalComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditWidgetModalComponent>);
  private data = inject(MAT_DIALOG_DATA) as Widget;
  private dashboardStateService = inject(DashboardStateService);

  fontSizes = fontSizes;
  textAlignOptions = textAlignOptions;
  verticalAlignOptions = verticalAlignOptions;
  predefinedColors = predefinedColors;

  chartSearchCtrl = new FormControl('');
  charts$ = this.store.select(ChartsSelectors.selectCharts);
  filteredCharts$ = combineLatest([
    this.charts$,
    this.chartSearchCtrl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([charts, search]) =>
      charts.filter((c) =>
        c.name.toLowerCase().includes((search ?? '').toLowerCase())
      )
    )
  );

  get isChart() {
    return this.data.type === 'chart';
  }

  get isText() {
    return this.data.type === 'text';
  }

  form = this.fb.group({
    name: [''],
    chartId: [''],
    fontSize: [20],
    color: ['#000000'],
    customColor: ['#000000'],
    textAlign: ['left'],
    verticalAlign: ['top'],
  });

  ngOnInit() {
    if (!this.data) return;

    this.form.patchValue({
      name: this.data.title,
      chartId: this.data.chartId ?? '',
    });

    const settings = this.data.visualSettings ?? {};
    this.form.patchValue({
      fontSize: settings.fontSizeTitle ?? 20,
      color: settings.colorTitle ?? '#000000',
      textAlign: settings.textAlign ?? 'left',
      ...(this.isText && { verticalAlign: settings.verticalAlign ?? 'top' }),
    });

    const savedColor = settings.colorTitle ?? '#000000';
    if (!this.predefinedColors.includes(savedColor)) {
      this.form.patchValue({
        color: 'custom',
        customColor: savedColor,
      });
    }
  }

  onTextAlignChange(align: string) {
    this.form.patchValue({
      textAlign: align,
    });
  }

  selectColor(color: string) {
    if (color === 'custom') {
      this.form.patchValue({
        color,
      });
    } else {
      this.form.patchValue({
        color,
      });
    }
  }

  onColorPicked(color: string) {
    this.form.patchValue({ customColor: color });
  }

  onSubmit() {
    if (!this.data) return;

    const {
      name,
      chartId,
      fontSize,
      color,
      customColor,
      textAlign,
      verticalAlign,
    } = this.form.value;

    const visualSettings: VisualSettings = {
      fontSizeTitle: fontSize ?? 20,
      colorTitle: color === 'custom' ? customColor || '' : color || '',
      textAlign: textAlign ?? 'left',
      ...(this.isText && { verticalAlign: verticalAlign ?? 'top' }),
    };

    const payload: Partial<Widget> = {
      title: name!,
      chartId: this.isChart ? chartId! : undefined,
      visualSettings,
    };

    this.dashboardStateService
      .updateWidget(this.data.id, payload)
      .subscribe(() => this.dialogRef.close());
  }

  onDeleteWidget() {
    if (!this.data) return;

    this.dashboardStateService.deleteWidget(this.data).subscribe(() => {
      this.dialogRef.close();
    });
  }
}

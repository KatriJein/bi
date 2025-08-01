import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
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
import {
  VisualSettings,
  Widget,
  WidgetFilterBinding,
} from '../../../core/api/graphql/types';
import { DashboardStateService } from '../../../services/dashboards-state.service';
import {
  fontSizes,
  predefinedColors,
  textAlignOptions,
  verticalAlignOptions,
} from '../../../constants';
import { ChartsSelectors } from '../../../core/store/charts';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import {
  WidgetDto,
  WidgetsActions,
  WidgetsSelectors,
} from '../../../core/store/widgets';
import { DashboardsSelectors } from '../../../core/store/dashboards';
import { MatDivider } from '@angular/material/divider';
import { MatList, MatListModule } from '@angular/material/list';

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
    MatDivider,
    MatList,
    MatListModule,
  ],
})
export class EditWidgetModalComponent implements OnInit {
  private store = inject(Store);
  private actions$ = inject(Actions);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditWidgetModalComponent>);
  private data: { widgetId: string } = inject(MAT_DIALOG_DATA);
  private dashboardStateService = inject(DashboardStateService);

  private destroy$ = new Subject<void>();
  private readonly chartId$ = new BehaviorSubject<string>('');

  private widgetData: Widget | null = null;

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

  form = this.fb.group({
    name: [''],
    chartId: [''],
    fontSize: [20],
    color: ['#000000'],
    customColor: ['#000000'],
    textAlign: ['left'],
    verticalAlign: ['top'],
  });

  newFilterForm = this.fb.group({
    dashboardFilterId: ['', [Validators.required]],
    chartFilterId: ['', [Validators.required]],
  });

  dashboardSelections$ = this.store.select(
    DashboardsSelectors.selectSelectionsByActiveDashboard
  );
  chartSelections$ = this.chartId$.pipe(
    distinctUntilChanged(),
    switchMap((chartId) =>
      this.store.select(ChartsSelectors.selectSelectionsByChartId(chartId))
    )
  );

  widgetFilterBindings: WidgetFilterBinding[] = [];
  showAddFilterForm = false;

  get isChart(): boolean {
    return this.widgetData?.type === 'chart';
  }

  get isText(): boolean {
    return this.widgetData?.type === 'text';
  }

  ngOnInit(): void {
    this.initWidgetSubscription();
    this.initFormSubscriptions();
    this.initActionListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initWidgetSubscription(): void {
    this.store
      .select(WidgetsSelectors.selectWidgetById(this.data.widgetId))
      .pipe(
        filter((widget): widget is WidgetDto => !!widget),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((widget) => {
        this.widgetData = widget;
        this.updateForm(widget);
        // this.updateComponentState(widget);
      });
  }

  private updateForm(widget: WidgetDto): void {
    this.form.patchValue({
      name: widget.title ?? '',
      chartId: widget.chartId ?? '',
    });

    const settings = widget.visualSettings ?? {};
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

    this.chartId$.next(widget.chartId || '');
    this.widgetFilterBindings = widget.selections || [];
  }

  private initFormSubscriptions(): void {
    this.form
      .get('chartId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((chartId) => {
        this.chartId$.next(chartId || '');
      });
  }

  private initActionListeners(): void {
    this.actions$
      .pipe(
        ofType(WidgetsActions.updateWidgetSuccess),
        filter((action) => action.widget.id === this.data.widgetId),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.dialogRef.close());

    this.actions$
      .pipe(
        ofType(WidgetsActions.deleteWidgetSuccess),
        filter((action) => action.widgetId === this.data.widgetId),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.dialogRef.close());
  }

  toggleAddFilterForm() {
    this.showAddFilterForm = !this.showAddFilterForm;
    if (!this.showAddFilterForm) {
      this.newFilterForm.reset();
    }
  }

  onTextAlignChange(align: string) {
    this.form.patchValue({
      textAlign: align,
    });
  }

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  onColorPicked(color: string) {
    this.form.patchValue({ customColor: color });
  }

  onSubmit() {
    if (!this.widgetData) return;

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

    const payload: Partial<WidgetDto> = {
      title: name!,
      chartId: this.isChart ? chartId! : undefined,
      visualSettings,
    };

    this.dashboardStateService.updateWidget(this.widgetData.id, payload);
  }

  onDeleteWidget(): void {
    if (!this.widgetData) return;
    this.dashboardStateService.deleteWidget(this.widgetData.id);
  }

  onAddFilterBinding() {
    const { dashboardFilterId, chartFilterId } = this.newFilterForm.value;
    if (!dashboardFilterId || !chartFilterId || !this.widgetData) return;

    this.store.dispatch(
      WidgetsActions.createWidgetFilterBinding({
        binding: {
          widgetId: this.widgetData.id,
          dashboardFilterId,
          chartFilterId,
        },
      })
    );

    this.showAddFilterForm = false;
    this.newFilterForm.reset();
  }

  onRemoveFilterBinding(bindingId: string) {
    this.store.dispatch(
      WidgetsActions.deleteWidgetFilterBinding({ id: bindingId })
    );
  }

  onChartChange(chartId: string) {
    this.chartSelections$ = this.store.select(
      ChartsSelectors.selectSelectionsByChartId(chartId)
    );
  }

  getDashboardFilterName(filterId: string) {
    return this.dashboardSelections$.pipe(
      map((selections) => {
        const filter = selections.find((f) => f.id === filterId);
        return filter?.name || 'Неизвестный фильтр дашборда';
      })
    );
  }

  getChartFilterName(filterId: string) {
    return this.chartSelections$.pipe(
      map((selections) => {
        const filter = selections.find((f) => f.id === filterId);
        return filter?.fieldName || 'Неизвестный фильтр графика';
      })
    );
  }
}

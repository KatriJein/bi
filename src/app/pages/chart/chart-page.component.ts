import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  filter,
  Observable,
  startWith,
  Subscription,
  take,
} from 'rxjs';
import {
  ChartComponent,
  ChartSelectionModalComponent,
  DataSelectionComponent,
} from '../../components/chart';
import { Dataset } from '../../core/models';
import { ChartPageStateService } from '../../services';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { Location } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChartSettingsComponent } from '../../components/chart/settings';
import { ChartType, SelectionTypeChart } from '../../core/store/charts';
import { MatIconModule } from '@angular/material/icon';
import {
  CHART_TYPES,
  getChartDisplayName,
  getChartIcon,
} from '../../constants';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { ChartFilter } from '../../core/api/graphql/types';

@Component({
  selector: 'app-chart-page',
  standalone: true,
  templateUrl: './chart-page.component.html',
  styleUrl: './chart-page.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    DataSelectionComponent,
    ChartComponent,
    MatButtonModule,
    MatInputModule,
    MatExpansionModule,
    ChartSettingsComponent,
    MatIconModule,
    FormsModule,
    MatIconModule,
    MatChipsModule,
  ],
})
export class ChartPageComponent implements OnInit {
  private state = inject(ChartPageStateService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private dialog = inject(MatDialog);

  chartTypes = CHART_TYPES;
  getIcon = getChartIcon;
  getDisplayName = getChartDisplayName;

  private chartTypeSubscription: Subscription = Subscription.EMPTY;

  chartTypeControl = new FormControl<ChartType>(this.state.getChartType());
  chartType$ = this.chartTypeControl.valueChanges.pipe(
    startWith(this.state.getChartType())
  );

  childChartControl = new FormControl<string | null>(null);
  availableChildCharts$ = this.state.availableChildCharts$;

  datasets$: Observable<Dataset[]> = this.state.datasets$;
  selectedDatasetControl = new FormControl<string | null>(null);
  selectedDatasetControl$ = this.state.selectedDataset$;

  allColumns$ = this.state.allColumns$;
  chart$ = this.state.chart$;

  nameControl = new FormControl<string>('');

  ngOnInit(): void {
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const chartId = params.get('id');
      if (this.route.snapshot.routeConfig?.path === 'chart/new') {
        this.state.createNewChart();
      } else if (chartId) {
        this.state.loadChartFromStore(chartId);
      }
    });

    this.state.chart$.pipe(filter((chart) => !!chart)).subscribe((chart) => {
      this.chartTypeControl.setValue(chart.settings?.chartType || 'line', {
        emitEvent: false,
      });
      this.selectedDatasetControl.setValue(chart.datasetId || null, {
        emitEvent: false,
      });
      this.nameControl.setValue(chart.name || '', { emitEvent: false });
      this.childChartControl.setValue(chart.childId || null, {
        emitEvent: false,
      });
    });

    this.chartTypeControl.valueChanges.subscribe((type) => {
      if (type) this.state.setChartType(type);
    });

    this.selectedDatasetControl.valueChanges
      .pipe(filter((id): id is string => id !== null))
      .subscribe((id) => {
        this.state.setSelectedDatasetId(id);
      });

    this.nameControl.valueChanges.subscribe((name) => {
      this.state.updateChartField('name', name || '');
    });

    this.childChartControl.valueChanges.subscribe((childId) => {
      this.state.updateChartField('childId', childId);
    });
  }

  ngOnDestroy() {
    this.chartTypeSubscription.unsubscribe();
  }

  onSave(): void {
    const chart = this.state.getCurrentChart();
    if (chart?.id) {
      this.state.updateChart();
    } else {
      this.state.saveChart();
    }
  }

  onDelete(): void {
    const chart = this.state.getCurrentChart();
    if (chart?.id) {
      this.state.deleteChart(chart.id);
    }
  }

  onCancel(): void {
    this.location.back();
  }

  addSelection(): void {
    const dialogRef = this.dialog.open(ChartSelectionModalComponent, {
      width: '600px',
      data: {
        columns$: this.allColumns$,
      },
    });

    dialogRef.afterClosed().subscribe((result: SelectionTypeChart) => {
      if (result) {
        this.state.addSelection(result);
      }
    });
  }

  updateSelection(selection: ChartFilter): void {
    const dialogRef = this.dialog.open(ChartSelectionModalComponent, {
      width: '600px',
      data: {
        columns$: this.allColumns$,
        selection,
      },
    });

    dialogRef.afterClosed().subscribe((result: SelectionTypeChart) => {
      if (result) {
        this.state.updateSelection(selection.id, result);
      }
    });
  }

  removeSelection(id: string): void {
    this.state.removeSelection(id);
  }
}

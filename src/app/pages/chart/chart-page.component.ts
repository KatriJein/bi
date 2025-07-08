import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  distinctUntilChanged,
  filter,
  Observable,
  startWith,
  Subscription,
} from 'rxjs';
import {
  ChartComponent,
  DataSelectionChartComponent,
} from '../../components/chart';
import { Dataset } from '../../core/models';
import { ChartPageStateService } from '../../services';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { Location } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChartSettingsComponent } from '../../components/chart/settings';
import { ChartType } from '../../core/store/charts';
import { MatIconModule } from '@angular/material/icon';

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
    DataSelectionChartComponent,
    ChartComponent,
    MatButtonModule,
    MatInputModule,
    MatExpansionModule,
    ChartSettingsComponent,
    MatIconModule,
  ],
})
export class ChartPageComponent implements OnInit {
  private state = inject(ChartPageStateService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  private chartTypeSubscription: Subscription = Subscription.EMPTY;

  chartTypeControl = new FormControl<ChartType>(this.state.getChartType());
  chartType$ = this.chartTypeControl.valueChanges.pipe(
    startWith(this.state.getChartType())
  );

  datasets$: Observable<Dataset[]> = this.state.datasets$;
  selectedDatasetControl = new FormControl<string | null>(null);
  selectedDatasetControl$ = this.state.selectedDataset$;

  nameControl = new FormControl<string>('');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const chartId = params.get('id');
      const url = this.route.snapshot.routeConfig?.path;

      if (url === 'chart/new') {
        this.state.createNewChart();
      } else if (chartId) {
        this.state.loadChartFromStore(chartId);
      }
    });

    this.chartTypeSubscription = this.chartTypeControl.valueChanges.subscribe(
      (type) => {
        if (type) {
          this.state.setChartType(type);
        }
      }
    );

    this.state.chartType$.pipe(distinctUntilChanged()).subscribe((type) => {
      this.chartTypeControl.setValue(type, { emitEvent: false });
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

    this.state.chart$.subscribe((chart) => {
      if (chart?.name != null) {
        this.nameControl.setValue(chart.name, { emitEvent: false });
      }
    });

    this.nameControl.valueChanges.subscribe((name) => {
      this.state.updateChartField('name', name || '');
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

  getDisplayName(value: ChartType | null): string {
    if (!value) return 'Выберите тип';

    const names = {
      line: 'Линейный',
      bar: 'Столбчатый',
      pie: 'Круговой',
      table: 'Таблица',
      doughnut: 'Кольцевой',
      horizontalBar: 'Линейчатый',
    };

    return names[value]; 
  }
}

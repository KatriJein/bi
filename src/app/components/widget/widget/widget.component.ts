import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Widget, WidgetFilterBinding } from '../../../core/api/graphql/types';
import { FilterEmitType } from '../../../pages';
import { ChartContainerComponent } from '../../common';
import { WidgetDto, WidgetsSelectors } from '../../../core/store/widgets';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, ChartContainerComponent],
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent implements OnInit, OnChanges {
  @Input() widget!: WidgetDto;
  @Input() isEditMode: boolean = false;
  @Input() onEditWidget?: (widget: Widget) => void;
  @Input() onChartExpClick?: (event: FilterEmitType) => void;

  private store = inject(Store);

  widgetSelections$!: Observable<WidgetFilterBinding[]>;

  ngOnInit(): void {
    this.initWidgetSelections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['widget']) {
      this.initWidgetSelections();
    }
  }

  getVerticalAlign(value: string | undefined): string {
    switch (value) {
      case 'center':
        return 'center';
      case 'bottom':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  }

  handleClick(event: MouseEvent) {
    if (!this.isEditMode) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const target = event.target as HTMLElement;
    if (
      target.closest('.table-container') ||
      target.closest('.chart-container')
    ) {
      return;
    }

    if (this.onEditWidget) {
      this.onEditWidget(this.widget);
    }
  }

  private initWidgetSelections(): void {
    if (!this.widget?.id) return;

    this.widgetSelections$ = this.store.select(
      WidgetsSelectors.selectSelectionsByWidgetId(this.widget.id)
    );
  }
}

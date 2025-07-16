import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Widget } from '../../../core/api/graphql/types';
import { FilterEmitType } from '../../../pages';
import { ChartContainerComponent } from '../../common';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, ChartContainerComponent],
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent {
  @Input() widget!: Widget;
  @Input() onEditWidget?: (widget: Widget) => void;
  @Input() onChartExpClick?: (event: FilterEmitType) => void;

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
}

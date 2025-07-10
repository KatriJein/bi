import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Widget } from '../../../core/api/graphql/types';
import { ChartRendererComponent } from '../chart-renderer/chart-renderer.component';
import { TableRendererComponent } from '../table-renderer/table-renderer.component';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    ChartRendererComponent,
    TableRendererComponent,
  ],
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent {
  @Input() widget!: Widget;
  @Input() onEditWidget?: (widget: Widget) => void;
  @Input() onTableDoubleClick?: (event: {
    tableId: string;
    field: string;
    value: any;
  }) => void;

  shouldShowTable(): boolean {
    return this.widget.type === 'table';
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
    const target = event.target as HTMLElement;
    if (target.closest('.table-container')) {
      return;
    }

    if (this.onEditWidget) {
      this.onEditWidget(this.widget);
    }
  }
}

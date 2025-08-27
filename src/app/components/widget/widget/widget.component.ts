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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Widget, WidgetFilterBinding } from '../../../core/api/graphql/types';
import { FilterEmitType } from '../../../pages';
import { ChartContainerComponent } from '../../common';
import { WidgetDto, WidgetsSelectors } from '../../../core/store/widgets';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ChartContainerComponent,
  ],
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

  handleChartClick(event: FilterEmitType): void {
    if (this.onChartExpClick) {
      this.onChartExpClick(event);
    }
  }

  expandToFullscreen(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const fullscreenUrl = this.createFullscreenUrl();
    window.open(fullscreenUrl, '_blank');
  }

  private createFullscreenUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/widget-fullscreen/${this.widget.id}`;
  }

  private initWidgetSelections(): void {
    if (!this.widget?.id) return;

    this.widgetSelections$ = this.store.select(
      WidgetsSelectors.selectSelectionsByWidgetId(this.widget.id)
    );
  }
}

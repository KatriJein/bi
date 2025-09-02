import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DashboardDto } from '../../../core/store/dashboards';
import { SmartIconComponent } from '../../common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'dashboard-menu-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    SmartIconComponent,
  ],
  templateUrl: './dashboard-menu-item.component.html',
  styleUrl: './dashboard-menu-item.component.scss',
})
export class DashboadMenuItemComponent {
  @Input() dashboard!: DashboardDto & { children?: DashboardDto[] };
  @Input() activeDashboardId!: string;
  @Input() level: number = 0;
  @Input() isCollapsed: boolean = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  expanded = signal(true);

  get hasChildren(): boolean {
    return !!(this.dashboard.children && this.dashboard.children.length > 0);
  }

  toggleExpanded(): void {
    this.expanded.set(!this.expanded());
    this.expandedChange.emit(this.expanded());
  }
}

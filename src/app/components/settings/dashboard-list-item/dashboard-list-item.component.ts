import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { DashboardDto } from '../../../core/store/dashboards';

@Component({
  selector: 'dashboard-list-item',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
  ],
  templateUrl: './dashboard-list-item.component.html',
  styleUrl: './dashboard-list-item.component.scss',
})
export class DashboardListItemComponent {
  @Input() dashboard!: DashboardDto & { children?: DashboardDto[] };
  @Input() level = 0;
  @Input() isFirst = false;
  @Input() isLast = false;

  @Output() toggleExpand = new EventEmitter<string>();
  @Output() createSubDashboard = new EventEmitter<DashboardDto>();
  @Output() edit = new EventEmitter<DashboardDto>();
  @Output() moveUp = new EventEmitter<DashboardDto>();
  @Output() moveDown = new EventEmitter<DashboardDto>();
  @Output() delete = new EventEmitter<DashboardDto>();
  @Output() select = new EventEmitter<DashboardDto>();

  expanded = signal(false);

  trackById(index: number, item: DashboardDto): string {
    return item.id || '';
  }

   get hasChildren(): boolean {
    return !!(this.dashboard.children && this.dashboard.children.length > 0);
  }

  toggle() {
    this.expanded.set(!this.expanded());
  }
}

import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, map, Observable } from 'rxjs';
import { RolesActions, RolesSelectors } from '../../../core/store/roles';
import { EditRoleModalComponent } from '../../../components/settings';
import { RoleDto } from '../../../core/store/user';

@Component({
  selector: 'app-settings-roles',
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './roles.component.html',
  styleUrl: '../settings.component.scss',
})
export class RolesSettingsComponent {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  searchQuery = signal('');

  roles$: Observable<RoleDto[] | null> = this.store.select(
    RolesSelectors.selectRoles,
  );

  filteredRoles$ = combineLatest([
    this.roles$,
    toObservable(this.searchQuery),
  ]).pipe(
    debounceTime(300),
    map(([roles, query]) => {
      if (!query.trim()) return roles || [];
      const searchTerm = query.toLowerCase().trim();
      return (roles || []).filter((role) =>
        role.name?.toLowerCase().includes(searchTerm),
      );
    }),
  );

  constructor() {
    // this.store.dispatch(RolesActions.loadRoles());
  }

  onDelete(role: RoleDto, event: Event): void {
    event.stopPropagation();

    if (confirm(`Удалить роль "${role.name}"?`)) {
      this.store.dispatch(RolesActions.deleteRole({ id: role.id! }));
    }
  }

  openCreateRoleModal(): void {
    this.dialog.open(EditRoleModalComponent, {
      width: '600px',
      data: { mode: 'create' },
    });
  }

  openEditRoleModal(role: RoleDto): void {
    this.dialog.open(EditRoleModalComponent, {
      width: '600px',
      data: { mode: 'edit', role },
    });
  }

  onRoleClick(role: RoleDto, event: Event): void {
    if ((event.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    this.openEditRoleModal(role);
  }

  trackById(index: number, item: RoleDto): string {
    return item.id || '';
  }
}

import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { InterfaceModalComponent } from '../../../components/settings/interface/edit-interface/interface-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { combineLatest, debounceTime, map, Observable } from 'rxjs';
import { RoleDto, UserDto } from '../../../core/store/user';
import { UsersActions, UsersSelectors } from '../../../core/store/users';
import { RolesActions, RolesSelectors } from '../../../core/store/roles';
import {
  CreateUserModalComponent,
  EditUserModalComponent,
} from '../../../components/settings';

@Component({
  selector: 'app-settings-users',
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: '../settings.component.scss',
})
export class UsersSettingsComponent {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  searchQuery = signal('');

  users$: Observable<UserDto[] | null> = this.store.select(
    UsersSelectors.selectUsers,
  );
  roles$: Observable<RoleDto[] | null> = this.store.select(
    RolesSelectors.selectRoles,
  );

  filteredUsers$ = combineLatest([
    this.users$,
    toObservable(this.searchQuery),
  ]).pipe(
    debounceTime(300),
    map(([users, query]) => {
      if (!query.trim()) return users || [];
      const searchTerm = query.toLowerCase().trim();
      return (users || []).filter((user) =>
        user.name?.toLowerCase().includes(searchTerm),
      );
    }),
  );

  constructor() {
    this.store.dispatch(RolesActions.loadRoles());
    this.store.dispatch(UsersActions.loadUsers());
  }

  onDelete(user: UserDto, event: Event): void {
    event.stopPropagation(); // ← остаётся, чтобы не сработал клик по списку

    if (!user.role) {
      alert('Невозможно удалить пользователя без роли');
      return;
    }

    if (confirm(`Удалить пользователя "${user.name}"?`)) {
      this.store.dispatch(
        UsersActions.deleteUserWithRole({
          userId: user.id!,
          roleId: user.role.id,
        }),
      );
    }
  }

  onUserClick(user: UserDto, event: Event): void {
    // Не открываем редактирование, если кликнули по кнопке удаления
    if ((event.target as HTMLElement).closest('.delete-button')) {
      return;
    }

    this.openEditUserModal(user);
  }

  openCreateUserModal(): void {
    this.dialog.open(CreateUserModalComponent, { width: '600px' });
  }

  openEditUserModal(user: UserDto): void {
    this.dialog.open(EditUserModalComponent, {
      width: '600px',
      data: user,
    });
  }

  trackById(index: number, item: UserDto): string {
    return item.id || '';
  }
}

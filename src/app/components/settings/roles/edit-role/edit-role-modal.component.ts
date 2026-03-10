import { Component, inject, } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RoleDto, Permission } from '../../../../core/store/user';
import { RolesActions } from '../../../../core/store/roles';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  mode: 'create' | 'edit';
  role?: RoleDto;
}

@Component({
  selector: 'app-edit-role-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './edit-role-modal.component.html',
  styleUrls: ['./edit-role-modal.component.scss'],
})
export class EditRoleModalComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EditRoleModalComponent>);
  data = inject(MAT_DIALOG_DATA) as DialogData;

  private originalName: string = '';
  private originalPermissions: Permission[] = [];

  allPermissions: Permission[] = [
    'full_access',
    'roles.manage',
    'users.manage',
    'interfaces.manage',
    'datasets.manage',
    'charts.manage',
    'dashboards.manage',
    'dashboard_filters.manage',
  ];

  permissionLabels: Record<Permission, string> = {
    full_access: 'Полный доступ ко всем функциям',
    'roles.manage': 'Управление ролями и правами',
    'users.manage': 'Управление пользователями',
    'interfaces.manage': 'Управление интерфейсами',
    'datasets.manage': 'Управление датасетами',
    'charts.manage': 'Управление графиками',
    'dashboards.manage': 'Управление дашбордами',
    'dashboard_filters.manage': 'Управление фильтрами в дашбордах',
  };

  searchTerm: string = '';

  roleForm: FormGroup = this.fb.group({
    id: [
      {
        value: this.data.mode === 'edit' ? this.data.role?.id : '',
        disabled: true,
      },
    ],
    name: [
      this.data.mode === 'edit' ? this.data.role?.name : '',
      [Validators.required],
    ],
    permissions: [[]],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.role) {
      const perms = this.data.role.permissions || [];
      this.roleForm.patchValue({ permissions: perms });
      this.originalName = this.data.role.name || '';
      this.originalPermissions = [...perms];
    }
  }

  get filteredPermissions(): Permission[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.allPermissions;
    return this.allPermissions.filter((perm) =>
      this.permissionLabels[perm].toLowerCase().includes(term),
    );
  }

  togglePermission(permission: Permission): void {
    const current = this.roleForm.get('permissions')!.value as Permission[];
    let newPermissions: Permission[];

    if (permission === 'full_access') {
      newPermissions = ['full_access'];
    } else {
      if (current.includes(permission)) {
        newPermissions = current.filter((p) => p !== permission);
      } else {
        newPermissions = current.includes('full_access')
          ? [permission]
          : [...current, permission];
      }
    }

    this.roleForm.patchValue({ permissions: newPermissions });
  }

  private hasChanges(): boolean {
    const name = this.roleForm.get('name')?.value;
    const permissions = this.roleForm.get('permissions')?.value as Permission[];
    if (this.data.mode === 'create') return true;
    return (
      name !== this.originalName ||
      JSON.stringify(permissions) !== JSON.stringify(this.originalPermissions)
    );
  }

  onSubmit(): void {
    if (this.roleForm.invalid) return;

    if (!this.hasChanges()) {
      this.dialogRef.close();
      return;
    }

    const { name, permissions } = this.roleForm.value;

    if (this.data.mode === 'create') {
      this.store.dispatch(RolesActions.createRole({ name, permissions }));
    } else {
      const id = this.data.role!.id!;
      this.store.dispatch(RolesActions.updateRole({ id, name, permissions }));
    }

    this.dialogRef.close();
  }
}

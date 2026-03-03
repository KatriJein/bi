import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RoleDto, Permission } from '../../../../core/store/user';
import { RolesActions } from '../../../../core/store/roles';

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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose
  ],
  templateUrl: './edit-role-modal.component.html',
  styleUrls: ['../user-modal.component.scss'],
})
export class EditRoleModalComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EditRoleModalComponent>);
  data = inject(MAT_DIALOG_DATA) as DialogData;

  allPermissions: Permission[] = [
    'full_access',
    'roles.manage',
    'users.manage',
    'interfaces.manage',
    'datasets.manage',
    'charts.manage',
    'dashboards.manage',
    'dashboard_filters.manage'
  ];

  permissionLabels: Record<Permission, string> = {
    'full_access': 'Полный доступ ко всем функциям',
    'roles.manage': 'Управление ролями и правами',
    'users.manage': 'Управление пользователями',
    'interfaces.manage': 'Управление интерфейсами',
    'datasets.manage': 'Управление датасетами',
    'charts.manage': 'Управление графиками',
    'dashboards.manage': 'Управление дашбордами',
    'dashboard_filters.manage': 'Управление фильтрами в дашбордах'
  };

  roleForm: FormGroup = this.fb.group({
    id: [{ value: this.data.mode === 'edit' ? this.data.role?.id : '', disabled: true }],
    name: [this.data.mode === 'edit' ? this.data.role?.name : '', [Validators.required]],
    permissions: [[]]
  });

  constructor() {
    if (this.data.mode === 'edit') {
      const permissions = this.data.role?.permissions || [];
      this.roleForm.patchValue({ permissions });
    }
  }

  togglePermission(permission: Permission): void {
    const currentPermissions = this.roleForm.get('permissions')!.value || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((p: string) => p !== permission)
      : [...currentPermissions, permission];

    // Обработка full_access
    if (permission === 'full_access') {
      this.roleForm.patchValue({ permissions: ['full_access'] });
    } else if (newPermissions.includes('full_access')) {
      this.roleForm.patchValue({
        permissions: newPermissions.filter((p: string) => p !== 'full_access')
      });
    } else {
      this.roleForm.patchValue({ permissions: newPermissions });
    }
  }

  onSubmit(): void {
    if (this.roleForm.invalid) return;

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

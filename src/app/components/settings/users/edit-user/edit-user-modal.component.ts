import { Component, Inject, inject, Input } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { RoleDto, UserDto } from '../../../../core/store/user';
import { RolesSelectors } from '../../../../core/store/roles';
import { UsersActions } from '../../../../core/store/users';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['../user-modal.component.scss']
})
export class EditUserModalComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EditUserModalComponent>);

  user: UserDto;
  roles$: Observable<RoleDto[] | null>;
  userForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) user: UserDto) {
    this.user = user;
    this.roles$ = this.store.select(RolesSelectors.selectRoles);


    this.userForm = this.fb.group({
      id: [{ value: this.user.id, disabled: true }],
      name: [this.user.name || '', [Validators.required]],
      roleId: [this.user.role?.id || '', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const { name } = this.userForm.value;
    const newRoleId = this.userForm.get('roleId')!.value;
    const oldRoleId = this.user.role?.id || '';

    const userId = this.user.id!;

    // Обновляем имя
    this.store.dispatch(UsersActions.updateUser({ id: userId, name }));

    // Если роль изменилась — обновляем её
    if (oldRoleId !== newRoleId) {
      this.store.dispatch(
        UsersActions.updateUserRole({ userId, oldRoleId, newRoleId }),
      );
    }

    this.dialogRef.close();
  }
}

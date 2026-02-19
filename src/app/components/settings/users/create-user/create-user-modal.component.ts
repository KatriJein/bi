import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogModule,
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
import { RoleDto } from '../../../../core/store/user';
import { RolesSelectors } from '../../../../core/store/roles';
import { UsersActions } from '../../../../core/store/users';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogModule,
  ],
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['../user-modal.component.scss'],
})
export class CreateUserModalComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<CreateUserModalComponent>);

  roles$: Observable<RoleDto[] | null> = this.store.select(
    RolesSelectors.selectRoles,
  );

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    roleId: ['', [Validators.required]],
    password: [''],
  });

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const { name, password, roleId } = this.userForm.value;
    this.store.dispatch(
      UsersActions.createUserWithRole({ name, password, roleId }),
    );
    this.dialogRef.close();
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import {
  InterfaceDto,
  InterfacesSelectors,
} from '../../../core/store/interfaces';
import { UserSelectors } from '../../../core/store/user';
import { DashboardsActions } from '../../../core/store/dashboards';

@Component({
  selector: 'app-dashboard-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-dashboard.component.html',
  styleUrl: './create-dashboard.component.scss',
})
export class CreateDashboardModalComponent {
  private store = inject(Store);
  private actions$ = inject(Actions);
  private dialogRef = inject(MatDialogRef<CreateDashboardModalComponent>);
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA) as { order: number };

  interfaces$: Observable<InterfaceDto[]> = this.store.select(
    InterfacesSelectors.selectAllInterfaces
  );
  private userId = this.store.select(UserSelectors.selectUserId);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(52)]],
    interfaceId: [null, Validators.required],
  });

  constructor() {
    this.actions$
      .pipe(ofType(DashboardsActions.addDashboardSuccess), takeUntilDestroyed())
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  onSave() {
    if (this.form.invalid) return;

    const { name, interfaceId } = this.form.value;

    this.userId.pipe(take(1)).subscribe((userId) => {
      if (userId) {
        this.store.dispatch(
          DashboardsActions.addDashboard({
            name,
            interfaceId,
            order: this.data.order,
          })
        );
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}

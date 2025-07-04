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
  InterfacesActions,
} from '../../../../core/store/interfaces';

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
  templateUrl: './interface-modal.component.html',
  styleUrl: './interface-modal.component.scss',
})
export class InterfaceModalComponent {
  private store = inject(Store);
  private actions$ = inject(Actions);
  private dialogRef = inject(MatDialogRef<InterfaceModalComponent>);
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA) as {
    interface: InterfaceDto;
    order: number;
  };

  isEditMode = false;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(25)]],
  });

  constructor() {
    if (this.data?.interface) {
      this.isEditMode = true;
      this.form.patchValue({
        name: this.data.interface.name,
      });
    }

    this.actions$
      .pipe(
        ofType(
          InterfacesActions.createInterfaceSuccess,
          InterfacesActions.updateInterfaceNameSuccess
        ),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  onSave(event: Event) {
    event.preventDefault();

    if (this.form.invalid) return;
    const { name } = this.form.value;

    if (this.isEditMode) {
      this.store.dispatch(
        InterfacesActions.updateInterfaceName({
          id: this.data.interface.id || '',
          name,
        })
      );
    } else {
      this.store.dispatch(
        InterfacesActions.createInterface({ name, order: this.data.order })
      );
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  get title(): string {
    return this.isEditMode
      ? 'Редактирование интерфейса'
      : 'Создание интерфейса';
  }

  get saveButtonText(): string {
    return this.isEditMode ? 'Обновить' : 'Создать';
  }
}

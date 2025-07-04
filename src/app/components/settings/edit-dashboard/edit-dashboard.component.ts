import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ColorPickerComponent } from '../../common/color-picker/color-picker.component';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-icon',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    ColorPickerComponent,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-dashboard.component.html',
  styleUrl: './edit-dashboard.component.scss',
})
export class EditDashboardModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA) as {
    icon: string;
    color: string;
    name: string;
  };
  private dialogRef = inject(MatDialogRef<EditDashboardModalComponent>);

  icons: string[] = [
    'actions',
    'analytics',
    'chart-organisation',
    'chart',
    'group-team',
    'group',
  ];

  form: FormGroup = this.fb.group({
    icon: [this.data.icon, Validators.required],
    selectedColor: [this.data.color, Validators.required],
    customColor: ['#000000'],
    name: [this.data.name, [Validators.required, Validators.maxLength(52)]],
  });

  ngOnInit(): void {
    this.form.patchValue({
      icon: this.data.icon,
      selectedColor: this.data.color,
      name: this.data.name,
    });
  }

  get nameControl(): FormControl<string> {
    return this.form.get('name') as FormControl<string>;
  }

  get currentColor(): string {
    const value = this.form.value;
    return value.selectedColor === 'custom'
      ? value.customColor
      : value.selectedColor;
  }

  selectIcon(icon: string) {
    this.form.patchValue({ icon });
  }

  onSelectedColorChange(color: string) {
    this.form.patchValue({ selectedColor: color });
  }

  onCustomColorChange(color: string) {
    this.form.patchValue({ customColor: color });
  }

  save() {
    const value = this.form.value;

    this.dialogRef.close({
      icon: value.icon,
      color: this.currentColor,
      name: value.name,
    });
  }
}

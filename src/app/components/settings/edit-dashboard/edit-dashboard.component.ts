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
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ICONS, ICONS_DEFAULT } from '../../../constants';
import { SmartIconComponent } from "../../common";

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
    FormsModule,
    SmartIconComponent
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

  showAllIcons = false;

  ICONS = ICONS;
  iconsDefault = ICONS_DEFAULT;

  form: FormGroup = this.fb.group({
    icon: [this.data.icon, Validators.required],
    selectedColor: [this.data.color, Validators.required],
    customColor: ['#000000'],
    name: [this.data.name, [Validators.required, Validators.maxLength(52)]],
    iconSearch: [''],
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

  get iconSearchControl(): FormControl<string> {
    return this.form.get('iconSearch') as FormControl<string>;
  }

  isDefaultIcon(icon: string): boolean {
    return this.iconsDefault.includes(icon);
  }

  filteredIcons(): string[] {
    const search = this.iconSearchControl.value.toLowerCase();
    return this.ICONS.filter((icon) => icon.toLowerCase().includes(search));
  }

  selectIcon(icon: string) {
    this.form.patchValue({ icon });
    this.showAllIcons = false;
  }

  onSelectedColorChange(color: string) {
    this.form.patchValue({ selectedColor: color });
  }

  onCustomColorChange(color: string) {
    this.form.patchValue({ customColor: color });
  }

  onSave() {
    const value = this.form.value;

    this.dialogRef.close({
      icon: value.icon,
      color: this.currentColor,
      name: value.name,
    });
  }
}

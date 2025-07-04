import { Component, EventEmitter, Input, Output } from '@angular/core';
import { predefinedColors } from '../../../constants';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
})
export class ColorPickerComponent {
  @Input() selectedColor: string = '#000000';
  @Input() customColor: string = '#000000';
  @Input() label: string = 'Цвет: ';

  @Output() selectedColorChange = new EventEmitter<string>();
  @Output() customColorChange = new EventEmitter<string>();

  predefinedColors = predefinedColors;

  selectColor(color: string) {
    this.selectedColorChange.emit(color);
  }

  onCustomColorPicked(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.customColorChange.emit(value);
  }
}

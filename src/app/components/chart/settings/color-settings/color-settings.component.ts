import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-color-settings',
  imports: [MatDialogModule, MatIconModule, CommonModule, MatButtonModule],
  templateUrl: './color-settings.component.html',
  styleUrl: './color-settings.component.scss',
})
export class ChartColorSettingsDialogComponent {
  colors: string[];

  constructor(
    private dialogRef: MatDialogRef<ChartColorSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { colors: string[] }
  ) {
    this.colors = [...data.colors];
  }

  addColor(): void {
    this.colors.push('#000000');
  }

  onColorInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateColor(index, input.value);
  }

  updateColor(index: number, newColor: string): void {
    this.colors[index] = newColor;
  }

  removeColor(index: number): void {
    this.colors.splice(index, 1);
  }

  save(): void {
    this.dialogRef.close(this.colors);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  moveUp(index: number): void {
    if (index > 0) {
      [this.colors[index - 1], this.colors[index]] = [
        this.colors[index],
        this.colors[index - 1],
      ];
    }
  }

  moveDown(index: number): void {
    if (index < this.colors.length - 1) {
      [this.colors[index + 1], this.colors[index]] = [
        this.colors[index],
        this.colors[index + 1],
      ];
    }
  }
}

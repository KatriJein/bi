import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChartColorSettingsDialogComponent } from './color-settings/color-settings.component';
import { CommonModule } from '@angular/common';
import { ChartPageStateService } from '../../../services';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-chart-settings',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class ChartSettingsComponent {
  private dialog = inject(MatDialog);
  private chartService = inject(ChartPageStateService);

  colors$: Observable<string[]> = this.chartService.colorSettings$;

  constructor() {}

  openColorSettings(): void {
    this.colors$
      .subscribe((currentColors) => {
        const dialogRef = this.dialog.open(ChartColorSettingsDialogComponent, {
          data: { colors: [...currentColors] },
        });

        dialogRef.afterClosed().subscribe((result: string[] | undefined) => {
          if (result) {
            this.chartService.setColorSettings(result);
          }
        });
      })
      .unsubscribe();
  }
}

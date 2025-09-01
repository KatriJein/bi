import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICONS_DEFAULT } from '../../../constants';

@Component({
  selector: 'smart-icon',
  imports: [CommonModule, MatIconModule],
  templateUrl: './smart-icon.component.html',
  styleUrl: './smart-icon.component.scss',
})
export class SmartIconComponent {
  @Input() iconName: string = 'chart';
  @Input() color: string = '#000000';
  @Input() iconClass: string = '';
  @Input() size: string = '24px';

  private iconsDefault = ICONS_DEFAULT;

  isDefaultIcon(icon: string): boolean {
    return this.iconsDefault.includes(icon);
  }
}

import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-svg-icon-initializer',
  standalone: true,
  template: '',
})
export class SvgIconInitializerComponent {
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    const icons = [
      'actions',
      'analytics',
      'chart-organisation',
      'chart',
      'group-team',
      'group',
    ];

    icons.forEach((iconName) => {
      this.iconRegistry.addSvgIcon(
        iconName,
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `assets/svg/${iconName}.svg`
        )
      );
    });
  }
}

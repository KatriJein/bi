import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterModule],
  template: `
    <a class="logo-container" routerLink="/">
      <img class="logo" src="assets/svg/logo.svg" alt="logo" />
    </a>
  `,
  styles: `
    .logo-container {
      display: block;
      width: 340px;
      cursor: pointer;
      text-decoration: none;

      .logo {
        width: 100%;
        pointer-events: none;
      }
    }
  `,
})
export class LogoComponent {}


import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-header-layout',
  imports: [HeaderComponent, RouterOutlet, RouterModule],
  template: `<app-header></app-header>
    <router-outlet class="content"></router-outlet> `,
  styles: [`
  :host {
    display: block;
    height: 100%;
  }

  .content {
    height: 100%;
  }
`]

})
export class HeaderLayoutComponent {}

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-button',
  imports: [MatIconModule, MatButtonModule, RouterModule,],
  templateUrl: './on-main-button.component.html',
  styleUrl: './on-main-button.component.scss'
})
export class OnMainButtonComponent {

}

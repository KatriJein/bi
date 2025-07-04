import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [RouterModule],
})
export class ModalComponent {
  constructor(private router: Router) {}

  close() {
    this.router.navigate([{ outlets: { modal: null } }]);
  }
}

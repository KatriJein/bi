import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../components/logo/logo.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserDto, UserSelectors } from '../../core/store/user';
import { RouterModule } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-header',
  imports: [
    LogoComponent,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    RouterModule,
    MatIconModule
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private store = inject(Store);
  user$: Observable<UserDto | null>;

  constructor() {
    this.user$ = this.store.select(UserSelectors.selectUser);
  }
}

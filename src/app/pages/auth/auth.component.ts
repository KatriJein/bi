import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { LogoComponent } from '../../components/logo/logo.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { UserActions, UserSelectors } from '../../core/store/user';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-auth',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LogoComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  providers: [],
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);

  authForm: FormGroup;
  isShowPassword = false;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  isChecking$ = this.store.select(UserSelectors.selectIsChecking);

  constructor() {
    this.titleService.setTitle('Вход в систему');

    this.authForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.store
      .select(UserSelectors.selectIsAuthenticated)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          const targetUrl =
            returnUrl && !returnUrl.startsWith('/auth') ? returnUrl : '/';

          this.router.navigateByUrl(targetUrl).then((navigated) => {
            if (!navigated) {
              this.router.navigateByUrl('/');
            }
          });
        }
      });

    this.store
      .select(UserSelectors.selectError)
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.errorMessage = error;
      });
  }

  toggleShowPassword() {
    this.isShowPassword = !this.isShowPassword;
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.errorMessage = 'Заполните все поля';
      return;
    }

    this.errorMessage = null;

    const login = this.authForm.controls['login'].value;
    const password = this.authForm.controls['password'].value;

    this.store.dispatch(
      UserActions.login({
        name: login,
        password: password,
      }),
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

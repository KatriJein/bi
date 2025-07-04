import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { LogoComponent } from '../../components/logo/logo.component';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, LogoComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  providers: [],
})
export class AuthComponent {
  authForm: FormGroup;
  isShowPassword = false;

  constructor(private fb: FormBuilder) {
    this.authForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  toggleShowPassword() {
    this.isShowPassword = !this.isShowPassword;
  }

  onSubmit() {
    if (this.authForm.invalid) {
      alert('Заполните все поля');
      return;
    }
    console.log(
      this.authForm.controls['login'].value,
      this.authForm.controls['password'].value
    );
  }
}

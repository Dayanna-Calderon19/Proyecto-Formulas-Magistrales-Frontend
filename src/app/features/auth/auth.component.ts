import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideLoaderCircle } from '@lucide/angular';
import { AuthService, LoginRequest } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideEye, LucideEyeOff, LucideLoaderCircle],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const sessionExpired = this.route.snapshot.queryParams['sessionExpired'];
    if (sessionExpired === 'true') {
      this.errorMessage =
        'Su sesión ha expirado o las credenciales no son válidas. Por favor, inicie sesión nuevamente.';
    }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  /** Toggle password visibility */
  showPassword = false;
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const credentials: LoginRequest = this.loginForm.value;
    this.authService.login(credentials).subscribe((success) => {
      this.loading = false;
      if (success) {
        const returnUrl =
          this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.errorMessage = 'Credenciales incorrectas o error en el servidor. Intente nuevamente.';
      }
    });
  }
}

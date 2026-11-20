import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatFormField, MatInput, MatLabel, MatError} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../servicios/auth.service';
import {Login as LoginDatos} from '../../models/login';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatError, MatButton],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  snackBar: MatSnackBar = inject(MatSnackBar);
  // En signal para que el botón se actualice cuando responde la API
  cargando = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    let login = new LoginDatos();
    login = this.loginForm.value;
    this.cargando.set(true);
    this.authService.login(login).subscribe({
      next: data => {
        console.log('Login correcto, rol:', data.rol);
        this.authService.guardarSesion(data);
        this.cargando.set(false);
        if (this.authService.onboardingVisto()) {
          this.router.navigate([this.authService.panelSegunRol()]);
        } else {
          this.router.navigate(['/bienvenida']);
        }
      },
      error: err => {
        console.log('Error en el login:', err.status);
        this.cargando.set(false);
        this.snackBar.open('Correo o contraseña incorrectos', 'Cerrar', {duration: 4000});
      }
    });
  }
}

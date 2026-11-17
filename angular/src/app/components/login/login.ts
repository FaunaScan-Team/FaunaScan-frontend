import {Component, inject} from '@angular/core';
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
  cargando: boolean = false;

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
    this.cargando = true;
    this.authService.login(login).subscribe({
      next: data => {
        console.log('Login correcto, rol:', data.rol);
        this.authService.guardarSesion(data);
        this.cargando = false;
        this.router.navigate([this.destino(data.rol)]);
      },
      error: err => {
        console.log('Error en el login:', err.status);
        this.cargando = false;
        this.snackBar.open('Correo o contraseña incorrectos', 'Cerrar', {duration: 4000});
      }
    });
  }

  // Panel según el rol que devuelve el backend (ROLE_INVESTIGADOR, ROLE_VOLUNTARIO o ROLE_ADMIN)
  private destino(rol: string): string {
    if (rol === 'ROLE_VOLUNTARIO') {
      return '/panel/voluntario';
    }
    return '/panel/investigador';
  }
}

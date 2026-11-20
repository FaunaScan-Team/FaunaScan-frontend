import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatFormField, MatInput, MatLabel, MatError} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../servicios/auth.service';
import {RecuperarContrasena} from '../../models/recuperar-contrasena';

@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatError, MatButton],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
})
export class Recuperar {
  recuperarForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  snackBar: MatSnackBar = inject(MatSnackBar);
  cargando = signal(false);
  temporal = signal('');

  constructor() {
    this.recuperarForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched();
      return;
    }
    let datos = new RecuperarContrasena();
    datos = this.recuperarForm.value;
    this.cargando.set(true);
    this.authService.recuperarContrasena(datos).subscribe({
      next: data => {
        console.log('Contraseña temporal generada');
        this.cargando.set(false);
        this.temporal.set(data.contrasenaTemporal);
      },
      error: err => {
        console.log('Error al recuperar la contraseña:', err.status);
        this.cargando.set(false);
        let mensaje = 'No se pudo recuperar la contraseña. Intenta de nuevo.';
        if (err.status === 404) {
          mensaje = 'No existe una cuenta con ese correo.';
        }
        this.snackBar.open(mensaje, 'Cerrar', {duration: 4000});
      }
    });
  }
}

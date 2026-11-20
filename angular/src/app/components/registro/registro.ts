import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatFormField, MatInput, MatLabel, MatError} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../servicios/auth.service';
import {UsuarioRegistro} from '../../models/usuario-registro';

// ids de la tabla roles (orden de import.sql: 1 ADMIN, 2 INVESTIGADOR, 3 VOLUNTARIO)
const ID_ROL_INVESTIGADOR = 2;
const ID_ROL_VOLUNTARIO = 3;

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatError, MatButton, MatCheckbox],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  registroForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  snackBar: MatSnackBar = inject(MatSnackBar);
  cargando: boolean = false;
  rolInvestigador = ID_ROL_INVESTIGADOR;
  rolVoluntario = ID_ROL_VOLUNTARIO;

  constructor() {
    this.registroForm = this.fb.group({
      idRol: [ID_ROL_VOLUNTARIO, Validators.required],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      repetir: ['', Validators.required],
      terminos: [false, Validators.requiredTrue],
    });
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    if (this.registroForm.value.contrasena !== this.registroForm.value.repetir) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', {duration: 4000});
      return;
    }
    let usuario = new UsuarioRegistro();
    usuario.idRol = this.registroForm.value.idRol;
    usuario.nombre = this.registroForm.value.nombre;
    usuario.apellido = this.registroForm.value.apellido;
    usuario.correo = this.registroForm.value.correo;
    usuario.contrasena = this.registroForm.value.contrasena;
    this.cargando = true;
    this.authService.registrar(usuario).subscribe({
      next: data => {
        console.log('Usuario registrado:', data);
        this.cargando = false;
        this.snackBar.open('Cuenta creada. Ahora inicia sesión.', 'Cerrar', {duration: 4000});
        this.router.navigate(['/login']);
      },
      error: err => {
        console.log('Error en el registro:', err.status);
        this.cargando = false;
        let mensaje = 'No se pudo crear la cuenta. Revisa los datos.';
        // El backend responde 400 con este mensaje cuando el correo ya está registrado
        if (err.status === 400 && err.error.message === 'Ya existe una cuenta registrada con ese correo') {
          mensaje = 'Ya existe una cuenta con ese correo.';
        }
        this.snackBar.open(mensaje, 'Cerrar', {duration: 4000});
      }
    });
  }
}

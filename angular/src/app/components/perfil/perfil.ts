import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatInput, MatLabel, MatError} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../servicios/auth.service';
import {PerfilService} from '../../servicios/perfil.service';
import {PerfilUsuario} from '../../models/perfil-usuario';
import {ProgresoUsuario} from '../../models/progreso-usuario';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, MatCard, MatCardTitle, MatCardContent,
    MatFormField, MatLabel, MatInput, MatError, MatButton],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  perfilForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  perfilService: PerfilService = inject(PerfilService);
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  snackBar: MatSnackBar = inject(MatSnackBar);
  // Lo que llega de la API va en signal para que la vista se actualice
  perfil = signal<PerfilUsuario | null>(null);
  progreso = signal<ProgresoUsuario | null>(null);
  editando = signal(false);
  guardando = signal(false);

  constructor() {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      ubicacion: [''],
      biografia: [''],
    });
  }

  ngOnInit() {
    this.cargarPerfil();
    this.cargarProgreso();
  }

  private cargarPerfil() {
    this.perfilService.obtener().subscribe({
      next: data => {
        console.log('Perfil traído por API:', data);
        this.perfil.set(data);
        this.perfilForm.patchValue(data);
      }
    });
  }

  private cargarProgreso() {
    this.perfilService.progreso(this.authService.idUsuario()).subscribe({
      next: data => {
        console.log('Progreso traído por API:', data);
        this.progreso.set(data);
      }
    });
  }

  editar() {
    this.editando.set(true);
  }

  cancelar() {
    this.perfilForm.patchValue(this.perfil()!);
    this.editando.set(false);
  }

  onSubmit() {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }
    let perfil = new PerfilUsuario();
    perfil = this.perfilForm.value;
    this.guardando.set(true);
    this.perfilService.update(perfil).subscribe({
      next: data => {
        console.log('Perfil actualizado:', data);
        this.perfil.set(data);
        this.guardando.set(false);
        this.editando.set(false);
        this.snackBar.open('Perfil actualizado', 'Cerrar', {duration: 3000});
      },
      error: err => {
        console.log('Error al actualizar el perfil:', err.status);
        this.guardando.set(false);
        this.snackBar.open('No se pudo guardar el perfil. Revisa los datos.', 'Cerrar', {duration: 4000});
      }
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  esInvestigador(): boolean {
    return this.perfil()?.nombreRol === 'ROLE_INVESTIGADOR';
  }

  nombreRol(): string {
    const rol = this.perfil()?.nombreRol;
    if (rol === 'ROLE_INVESTIGADOR') {
      return 'Investigador';
    }
    if (rol === 'ROLE_ADMIN') {
      return 'Administrador';
    }
    return 'Voluntario';
  }

  iniciales(): string {
    const usuario = this.perfil();
    if (!usuario) {
      return '?';
    }
    return (usuario.nombre.charAt(0) + usuario.apellido.charAt(0)).toUpperCase();
  }

  // Insignias según el progreso que devuelve el backend
  logros(): string[] {
    const lista = [this.nombreRol()];
    const datos = this.progreso();
    if (!datos) {
      return lista;
    }
    for (const meta of [5, 10, 25, 50]) {
      if (datos.totalAvistamientos >= meta) {
        lista.push(meta + '+ avistamientos');
      }
    }
    for (const meta of [3, 5, 10]) {
      if (datos.zonasVisitadas >= meta) {
        lista.push(meta + '+ zonas');
      }
    }
    return lista;
  }
}

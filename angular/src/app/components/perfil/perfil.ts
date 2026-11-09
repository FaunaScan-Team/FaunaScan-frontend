import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';

@Component({ selector: 'app-perfil', imports: [FormsModule, RouterLink], templateUrl: './perfil.html', styleUrl: '../cuenta.css' })
export class Perfil {
  readonly usuarios = inject(UsuarioService);
  private router = inject(Router);
  editando = signal(false);
  error = signal('');
  nombre = ''; apellido = ''; telefono = ''; institucion = ''; bio = ''; especialidad = '';

  editar(): void {
    const u = this.usuarios.actual();
    if (!u) return;
    this.nombre = u.nombre; this.apellido = u.apellido; this.telefono = u.telefono || '';
    this.institucion = u.institucion || ''; this.bio = u.bio || ''; this.especialidad = u.especialidad || '';
    this.editando.set(true);
  }

  guardar(): void {
    const u = this.usuarios.actual();
    if (!u) return;
    if (!this.nombre.trim() || !this.apellido.trim()) { this.error.set('Nombre y apellido son obligatorios.'); return; }
    this.usuarios.guardar({ ...u, nombre: this.nombre.trim(), apellido: this.apellido.trim(), telefono: this.telefono.trim(), institucion: this.institucion.trim(), bio: this.bio.trim(), especialidad: this.especialidad.trim() });
    this.error.set(''); this.editando.set(false);
  }

  async salir(): Promise<void> {
    this.usuarios.salir();
    await this.router.navigateByUrl('/login');
  }
}

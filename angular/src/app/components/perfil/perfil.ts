import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';
import { AvistamientosService } from '../../servicios/avistamientos.service';

@Component({ selector: 'app-perfil', imports: [FormsModule, RouterLink], templateUrl: './perfil.html', styleUrl: './perfil.css' })
export class Perfil {
  readonly usuarios = inject(UsuarioService);
  private avistamientos = inject(AvistamientosService);
  private router = inject(Router);
  editando = signal(false);
  mostrarSalida = signal(false);
  mostrarMenu = signal(false);
  error = signal('');
  readonly propios = computed(() => this.avistamientos.lista().filter(a => a.registradoPorEmail === this.usuarios.actual()?.email));
  readonly especies = computed(() => new Set(this.propios().map(a => a.especie.nombre)).size);
  readonly zonas = computed(() => new Set(this.propios().map(a => a.area)).size);
  readonly logros = computed(() => {
    const lista = [this.usuarios.actual()?.rol === 'investigador' ? 'Investigador' : 'Voluntario'];
    const total = this.propios().length;
    for (const umbral of [5, 10, 25, 50, 100]) if (total >= umbral) lista.push(`${umbral}+ avistamientos`);
    for (const umbral of [3, 5, 10, 20]) if (this.zonas() >= umbral) lista.push(`${umbral}+ zonas`);
    return lista;
  });
  readonly miembroDesde = computed(() => {
    const fecha = this.usuarios.actual()?.creadoEn;
    return fecha && !Number.isNaN(new Date(fecha).getTime())
      ? new Date(fecha).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }) : 'No disponible';
  });
  readonly iniciales = computed(() => {
    const u = this.usuarios.actual();
    return u ? ((u.nombre[0] || '') + (u.apellido[0] || '')).toUpperCase() : '?';
  });
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

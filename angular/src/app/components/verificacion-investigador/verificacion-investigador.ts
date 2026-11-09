import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';

@Component({ selector: 'app-verificacion-investigador', templateUrl: './verificacion-investigador.html', styleUrl: '../cuenta.css' })
export class VerificacionInvestigador {
  private usuarios = inject(UsuarioService);
  private router = inject(Router);
  nombre = signal('');
  error = signal('');

  seleccionar(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    this.error.set(''); this.nombre.set('');
    if (!archivo) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(archivo.type)) { this.error.set('Formato permitido: PDF, JPG o PNG.'); return; }
    if (archivo.size > 5 * 1024 * 1024) { this.error.set('El archivo debe pesar 5 MB o menos.'); return; }
    this.nombre.set(archivo.name);
  }

  async continuar(): Promise<void> {
    const usuario = this.usuarios.actual();
    if (!usuario || usuario.rol !== 'investigador' || !this.nombre()) return;
    // Solo marca el estado local para la demostración; no sube ni valida el documento.
    const actualizado = { ...usuario, credencialVerificada: true };
    this.usuarios.guardar(actualizado);
    await this.router.navigateByUrl(this.usuarios.destino(actualizado));
  }
}

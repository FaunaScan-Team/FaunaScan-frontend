import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({ selector: 'app-registro', imports: [FormsModule, RouterLink], templateUrl: './registro.html', styleUrl: '../cuenta.css' })
export class Registro {
  private usuarios = inject(UsuarioService);
  private router = inject(Router);
  nombre = ''; apellido = ''; email = ''; clave = ''; repetir = '';
  rol: Usuario['rol'] = 'voluntario';
  terminos = false;
  error = signal('');
  cargando = signal(false);

  async registrar(): Promise<void> {
    this.error.set('');
    if (!this.nombre.trim() || !this.apellido.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.error.set('Completa tu nombre, apellido y un correo válido.'); return;
    }
    if (this.clave.length < 8 || this.clave !== this.repetir) {
      this.error.set('La contraseña debe tener al menos 8 caracteres y coincidir con la confirmación.'); return;
    }
    if (!this.terminos) { this.error.set('Debes aceptar los términos.'); return; }
    if (this.usuarios.actual()?.email === this.email.trim()) { this.error.set('Ya existe una cuenta con ese correo en este navegador.'); return; }
    this.cargando.set(true);
    try {
      const usuario: Usuario = {
        nombre: this.nombre.trim(), apellido: this.apellido.trim(), email: this.email.trim(),
        passwordHash: await this.usuarios.hash(this.clave), rol: this.rol, estado: 'ACTIVO',
        credencialVerificada: false, onboardingCompletado: false, creadoEn: new Date().toISOString()
      };
      this.usuarios.guardar(usuario);
      this.usuarios.iniciar(usuario);
      await this.router.navigateByUrl(this.usuarios.destino(usuario));
    } finally { this.cargando.set(false); }
  }
}

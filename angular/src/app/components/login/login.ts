import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';

@Component({ selector: 'app-login', imports: [FormsModule, RouterLink], templateUrl: './login.html', styleUrl: '../cuenta.css' })
export class Login {
  private usuarios = inject(UsuarioService);
  private router = inject(Router);
  email = '';
  clave = '';
  error = signal('');
  cargando = signal(false);

  async ingresar(): Promise<void> {
    this.error.set('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) || this.clave.length < 6) {
      this.error.set('Ingresa un correo válido y tu contraseña.');
      return;
    }
    this.cargando.set(true);
    try {
      const usuario = this.usuarios.actual();
      if (!usuario || usuario.email !== this.email.trim() || usuario.passwordHash !== await this.usuarios.hash(this.clave)) {
        this.error.set('Credenciales inválidas.');
        return;
      }
      if (usuario.estado === 'INACTIVO') {
        this.error.set('Cuenta inactiva. Contacta al administrador.');
        return;
      }
      this.usuarios.iniciar(usuario);
      await this.router.navigateByUrl(this.usuarios.destino(usuario));
    } finally {
      this.cargando.set(false);
    }
  }
}

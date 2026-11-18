import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';

@Component({ selector: 'app-recuperar', imports: [FormsModule, RouterLink], templateUrl: './recuperar.html', styleUrl: './recuperar.css' })
export class Recuperar {
  private usuarios = inject(UsuarioService);
  email = ''; clave = ''; repetir = ''; codigoIngresado = '';
  codigoDemo = signal('');
  paso = signal(2);
  error = signal('');

  comprobar(): void {
    this.error.set('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) { this.error.set('Ingresa un correo válido.'); return; }
    // Demostración local: no se envía correo ni código de recuperación.
    if (this.usuarios.actual()?.email !== this.email.trim()) { this.error.set('No hay una cuenta local con ese correo.'); return; }
    this.reenviar();
    this.paso.set(3);
  }

  reenviar(): void {
    const valor = new Uint32Array(1);
    crypto.getRandomValues(valor);
    this.codigoDemo.set(String(100000 + valor[0] % 900000));
    this.codigoIngresado = '';
  }

  verificar(): void {
    this.error.set('');
    if (this.codigoIngresado !== this.codigoDemo()) { this.error.set('El código de demostración no coincide.'); return; }
    this.paso.set(4);
  }

  async cambiar(): Promise<void> {
    this.error.set('');
    if (this.clave.length < 8 || this.clave !== this.repetir) { this.error.set('Usa al menos 8 caracteres y confirma la misma contraseña.'); return; }
    const usuario = this.usuarios.actual();
    if (!usuario || usuario.email !== this.email.trim()) return;
    this.usuarios.guardar({ ...usuario, passwordHash: await this.usuarios.hash(this.clave) });
    this.codigoDemo.set('');
    this.paso.set(5);
  }
}

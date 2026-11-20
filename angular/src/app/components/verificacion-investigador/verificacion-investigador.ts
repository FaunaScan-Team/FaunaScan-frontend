import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatFormField, MatInput, MatLabel, MatError, MatHint} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../servicios/auth.service';
import {PerfilService} from '../../servicios/perfil.service';
import {Credencial} from '../../models/credencial';

@Component({
  selector: 'app-verificacion-investigador',
  imports: [ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatError, MatHint, MatButton],
  templateUrl: './verificacion-investigador.html',
  styleUrl: './verificacion-investigador.css',
})
export class VerificacionInvestigador {
  credencialForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  perfilService: PerfilService = inject(PerfilService);
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  snackBar: MatSnackBar = inject(MatSnackBar);
  credencialActual = signal('');
  guardando = signal(false);

  constructor() {
    this.credencialForm = this.fb.group({
      urlCredencial: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^https?://.+')]],
    });
  }

  ngOnInit() {
    this.perfilService.listId(this.authService.idUsuario()).subscribe({
      next: data => {
        console.log('Usuario traído por API:', data);
        if (data.urlCredencial) {
          this.credencialActual.set(data.urlCredencial);
          this.credencialForm.patchValue({urlCredencial: data.urlCredencial});
        }
      }
    });
  }

  onSubmit() {
    if (this.credencialForm.invalid) {
      this.credencialForm.markAllAsTouched();
      return;
    }
    let credencial = new Credencial();
    credencial = this.credencialForm.value;
    this.guardando.set(true);
    this.perfilService.registrarCredencial(this.authService.idUsuario(), credencial).subscribe({
      next: data => {
        console.log('Credencial registrada:', data);
        this.guardando.set(false);
        this.snackBar.open('Credencial registrada', 'Cerrar', {duration: 3000});
        this.router.navigate(['/panel/investigador']);
      },
      error: err => {
        console.log('Error al registrar la credencial:', err.status);
        this.guardando.set(false);
        this.snackBar.open('No se pudo registrar la credencial. Revisa el enlace.', 'Cerrar', {duration: 4000});
      }
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

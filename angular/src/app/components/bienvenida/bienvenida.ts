import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {AuthService} from '../../servicios/auth.service';
import {PasoTutorial} from '../../models/paso-tutorial';

@Component({
  selector: 'app-bienvenida',
  imports: [MatCard, MatCardContent, MatButton],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css',
})
export class Bienvenida {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  pasoActual: number = 0;
  pasos: PasoTutorial[] = [
    {
      icono: '🌿',
      titulo: 'Bienvenido a FaunaScan',
      descripcion: 'Con FaunaScan registras la fauna silvestre que observas y ayudas a conocer la biodiversidad del Perú. Te mostramos lo básico en cinco pasos.'
    },
    {
      icono: '🔍',
      titulo: 'Explora el catálogo',
      descripcion: 'Busca especies por nombre común o científico y revisa su familia y su categoría de conservación.'
    },
    {
      icono: '📷',
      titulo: 'Registra un avistamiento',
      descripcion: 'Elige la especie, agrega una foto, la ubicación y tus observaciones. Un investigador lo revisará y validará.'
    },
    {
      icono: '🗺️',
      titulo: 'Consulta el mapa y tu historial',
      descripcion: 'Mira dónde se observó cada especie y revisa el estado de tus registros: pendiente, validado o rechazado.'
    },
    {
      icono: '🏅',
      titulo: 'Sigue tu progreso',
      descripcion: 'En Mi perfil verás tus avistamientos, las especies y zonas que registraste y los logros que vas desbloqueando.'
    },
  ];

  siguiente() {
    if (this.pasoActual < this.pasos.length - 1) {
      this.pasoActual++;
    }
  }

  anterior() {
    if (this.pasoActual > 0) {
      this.pasoActual--;
    }
  }

  esUltimo(): boolean {
    return this.pasoActual === this.pasos.length - 1;
  }

  terminar() {
    this.authService.marcarOnboardingVisto();
    this.router.navigate([this.authService.panelSegunRol()]);
  }
}

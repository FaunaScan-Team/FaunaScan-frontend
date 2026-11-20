
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../servicios/auth.service';
import { SesionConsultaService } from '../../servicios/sesion-consulta.service';
import {
  PreferenciasApi,
  PreferenciasApiService
} from '../../servicios/preferencias-api.service';

type CategoriaPreferenciaApi = keyof PreferenciasApi;

interface OpcionPreferencia {
  clave: CategoriaPreferenciaApi;
  icono: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-configuracion-notificaciones',
  imports: [RouterLink],
  templateUrl: './configuracion-notificaciones.html',
  styleUrl: './configuracion-notificaciones.css',
})
export class ConfiguracionNotificaciones implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly preferenciasApi = inject(PreferenciasApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sesionService = inject(SesionConsultaService);

  email = this.sesionService.usuarioActual()?.email ?? '';

  borrador: PreferenciasApi = {
    criticas: true,
    sistema: true,
    alertas: true
  };

  mensaje = '';
  guardado = false;
  cargando = false;
  guardando = false;

  readonly opciones: OpcionPreferencia[] = [
    {
      clave: 'criticas',
      icono: '🚨',
      titulo: 'Alertas críticas',
      descripcion: 'Avisos relacionados con especies vulnerables y eventos críticos.'
    },
    {
      clave: 'sistema',
      icono: '⚙️',
      titulo: 'Notificaciones del sistema',
      descripcion: 'Actualizaciones, cambios y mantenimiento de FaunaScan.'
    },
    {
      clave: 'alertas',
      icono: '🔔',
      titulo: 'Alertas y recordatorios',
      descripcion: 'Novedades y recordatorios relacionados con tu participación.'
    }
  ];

  ngOnInit(): void {
    this.cargarPreferencias();
  }


cargarPreferencias(): void {
  const idUsuario = this.authService.idUsuario();

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    this.cargando = false;
    this.guardado = false;
    this.mensaje = 'Debes iniciar sesión para consultar tus preferencias.';
    this.cdr.markForCheck();
    return;
  }

  this.cargando = true;
  this.mensaje = '';

  this.preferenciasApi.obtener(idUsuario).subscribe({
    next: (preferencias) => {
      this.borrador = {
        criticas: preferencias.criticas ?? true,
        sistema: preferencias.sistema ?? true,
        alertas: preferencias.alertas ?? true
      };

      this.cargando = false;
      this.cdr.markForCheck();
    },
    error: () => {
      this.cargando = false;
      this.guardado = false;
      this.mensaje = 'No se pudieron cargar las preferencias desde la API.';
      this.cdr.markForCheck();
    }
  });
}


  get categoriasActivas(): number {
    return Object.values(this.borrador).filter(Boolean).length;
  }

  cambiar(clave: CategoriaPreferenciaApi, evento: Event): void {
    const activo = (evento.target as HTMLInputElement).checked;

    this.borrador = {
      ...this.borrador,
      [clave]: activo
    };

    this.guardado = false;
    this.mensaje = '';
  }

  
guardar(evento: Event): void {
  evento.preventDefault();

  if (this.cargando || this.guardando) {
    return;
  }

  const idUsuario = this.authService.idUsuario();

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    this.guardado = false;
    this.mensaje = 'Debes iniciar sesión para guardar tus preferencias.';
    this.cdr.markForCheck();
    return;
  }

  this.guardando = true;
  this.guardado = false;
  this.mensaje = '';

  this.preferenciasApi.guardar(idUsuario, this.borrador).subscribe({
    next: (preferencias) => {
      this.borrador = {
        criticas: preferencias.criticas ?? true,
        sistema: preferencias.sistema ?? true,
        alertas: preferencias.alertas ?? true
      };

      this.guardando = false;
      this.guardado = true;
      this.mensaje = 'Preferencias guardadas correctamente en FaunaScan.';
      this.cdr.markForCheck();
    },
    error: () => {
      this.guardando = false;
      this.guardado = false;
      this.mensaje = 'No se pudieron guardar las preferencias en el servidor.';
      this.cdr.markForCheck();
    }
  });
}
}

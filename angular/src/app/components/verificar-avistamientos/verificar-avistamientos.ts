
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';
import {
  MatSort,
  MatSortModule
} from '@angular/material/sort';
import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  AvistamientoApi,
  DecisionValidacion,
  ValidacionService
} from '../../servicios/validacion.service';

@Component({
  selector: 'app-verificar-avistamientos',
  imports: [
    DatePipe,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule
  ],
  templateUrl: './verificar-avistamientos.html',
  styleUrl: './verificar-avistamientos.css',
})
export class VerificarAvistamientos
  implements OnInit, AfterViewInit {

  private readonly validacionService = inject(ValidacionService);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  columnas: string[] = [
    'idAvistamiento',
    'nombreEspecie',
    'nombreUsuario',
    'fechaAvistamiento',
    'estadoValidacion',
    'acciones'
  ];

  dataSource = new MatTableDataSource<AvistamientoApi>([]);

  cargando = false;
  procesandoId: number | null = null;
  error = '';

  ngOnInit(): void {
    this.cargarPendientes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarPendientes(): void {
    this.cargando = true;
    this.error = '';

    this.validacionService.obtenerPendientes().subscribe({
      next: (registros: AvistamientoApi[]) => {
        this.dataSource.data = registros;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.error = this.obtenerMensajeError(error);
      }
    });
  }

  resolver(id: number, estado: DecisionValidacion): void {
    if (this.procesandoId !== null) {
      return;
    }

    this.procesandoId = id;
    this.error = '';

    this.validacionService.resolver(id, estado).subscribe({
      next: () => {
        this.procesandoId = null;

        const mensaje = estado === 'validado'
          ? 'Avistamiento validado correctamente.'
          : 'Avistamiento rechazado correctamente.';

        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 4000
        });

        this.cargarPendientes();
      },
      error: (error: HttpErrorResponse) => {
        this.procesandoId = null;
        this.error = this.obtenerMensajeError(error);

        this.snackBar.open(this.error, 'Cerrar', {
          duration: 5000
        });
      }
    });
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el backend. Verifica que Spring Boot esté ejecutándose.';
    }

    if (error.status === 401) {
      return 'Tu sesión ha vencido. Inicia sesión nuevamente.';
    }

    if (error.status === 403) {
      return 'No tienes permisos para validar avistamientos.';
    }

    if (error.status === 404) {
      return 'El avistamiento solicitado no existe.';
    }

    if (error.status === 409) {
      return 'El avistamiento ya fue validado o rechazado.';
    }

    return 'Ocurrió un error al consultar o validar el avistamiento.';
  }
}

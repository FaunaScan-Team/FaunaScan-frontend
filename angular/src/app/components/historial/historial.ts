import {Component, inject, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef, MatTable, MatTableDataSource
} from '@angular/material/table';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatFormField, MatHint, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatSelect, MatOption} from '@angular/material/select';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AvistamientoDTO} from '../../models/avistamiento-dto';
import {AvistamientoCompartido} from '../../models/avistamiento-compartido';
import {HistorialService} from '../../servicios/historial.service';
import {AuthService} from '../../servicios/auth.service';

@Component({
  selector: 'app-historial',
  imports: [
    DatePipe, ReactiveFormsModule, RouterLink,
    MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatCell, MatCellDef,
    MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow,
    MatSort, MatSortHeader, MatPaginator,
    MatFormField, MatLabel, MatInput, MatHint, MatSuffix, MatSelect, MatOption,
    MatDatepicker, MatDatepickerInput, MatDatepickerToggle, MatNativeDateModule, MatButton, MatAnchor,
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial {
  displayedColumns: string[] = ['favorito', 'nombreEspecie', 'fechaAvistamiento', 'estadoValidacion', 'detalle'];
  dataSource: MatTableDataSource<AvistamientoDTO> = new MatTableDataSource<AvistamientoDTO>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  todos: AvistamientoDTO[] = [];
  idsFavoritos: number[] = [];
  compartidos: AvistamientoCompartido[] = [];
  cargando: boolean = true;
  filtrosForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  historialService: HistorialService = inject(HistorialService);
  authService: AuthService = inject(AuthService);
  snackBar: MatSnackBar = inject(MatSnackBar);
  idUsuario: number = 0;

  constructor() {
    this.filtrosForm = this.fb.group({
      especie: [''],
      zona: [''],
      estado: [''],
      desde: [null],
      hasta: [null],
    });
  }

  ngOnInit() {
    this.idUsuario = this.authService.idUsuario();
    this.cargarLista();
    this.cargarFavoritos();
    if (this.esInvestigador()) {
      this.cargarCompartidos();
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private cargarLista() {
    this.historialService.historial(this.idUsuario).subscribe({
      next: data => {
        console.log('Historial traído por API:', data);
        this.todos = data;
        this.dataSource.data = data;
        this.cargando = false;
      },
      error: err => {
        console.log('Error al cargar el historial:', err.status);
        this.cargando = false;
        this.snackBar.open('No se pudo cargar tu historial', 'Cerrar', {duration: 4000});
      }
    });
  }

  private cargarFavoritos() {
    this.historialService.favoritos(this.idUsuario).subscribe({
      next: data => this.idsFavoritos = data.map(f => f.idAvistamiento),
      error: err => console.log('Error al cargar favoritos:', err.status)
    });
  }

  private cargarCompartidos() {
    this.historialService.compartidosRecibidos(this.idUsuario).subscribe({
      next: data => this.compartidos = data,
      error: err => console.log('Error al cargar compartidos:', err.status)
    });
  }

  // HU-25: especie, zona y estado los filtra el backend; el período se filtra aquí
  buscar() {
    const f = this.filtrosForm.value;
    this.historialService.historialFiltrado(this.idUsuario, f.especie, f.zona, f.estado).subscribe({
      next: data => {
        this.dataSource.data = data.filter(av => this.dentroDelPeriodo(av, f.desde, f.hasta));
      },
      error: err => console.log('Error al filtrar:', err.status)
    });
  }

  limpiar() {
    this.filtrosForm.reset({especie: '', zona: '', estado: '', desde: null, hasta: null});
    this.dataSource.data = this.todos;
  }

  private dentroDelPeriodo(av: AvistamientoDTO, desde: Date | null, hasta: Date | null): boolean {
    const fecha = new Date(av.fechaAvistamiento);
    if (desde && fecha < desde) return false;
    if (hasta) {
      const finDelDia = new Date(hasta);
      finDelDia.setHours(23, 59, 59);
      if (fecha > finDelDia) return false;
    }
    return true;
  }

  // HU-26: marcar o quitar favorito
  esFavorito(idAvistamiento: number): boolean {
    return this.idsFavoritos.includes(idAvistamiento);
  }

  alternarFavorito(av: AvistamientoDTO) {
    if (this.esFavorito(av.idAvistamiento)) {
      this.historialService.quitarFavorito(av.idAvistamiento).subscribe({
        next: () => this.idsFavoritos = this.idsFavoritos.filter(id => id !== av.idAvistamiento),
        error: () => this.snackBar.open('No se pudo quitar de favoritos', 'Cerrar', {duration: 3000})
      });
    } else {
      this.historialService.marcarFavorito(av.idAvistamiento).subscribe({
        next: () => this.idsFavoritos = [...this.idsFavoritos, av.idAvistamiento],
        error: () => this.snackBar.open('No se pudo marcar como favorito', 'Cerrar', {duration: 3000})
      });
    }
  }

  favoritos(): AvistamientoDTO[] {
    return this.todos.filter(av => this.esFavorito(av.idAvistamiento));
  }

  esInvestigador(): boolean {
    const rol = this.authService.rol();
    return rol === 'ROLE_INVESTIGADOR' || rol === 'ROLE_ADMIN';
  }
}

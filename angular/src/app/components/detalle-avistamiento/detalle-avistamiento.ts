import {Component, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatFormField, MatInput, MatLabel, MatError} from '@angular/material/input';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AvistamientoDTO} from '../../models/avistamiento-dto';
import {AvistamientoCompartido} from '../../models/avistamiento-compartido';
import {Ubicacion} from '../../models/ubicacion';
import {ImagenAvistamiento} from '../../models/imagen-avistamiento';
import {HistorialService} from '../../servicios/historial.service';
import {AuthService} from '../../servicios/auth.service';

@Component({
  selector: 'app-detalle-avistamiento',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatError, MatButton, MatAnchor],
  templateUrl: './detalle-avistamiento.html',
  styleUrl: './detalle-avistamiento.css',
})
export class DetalleAvistamiento {
  avistamiento: AvistamientoDTO | null = null;
  ubicacion: Ubicacion | null = null;
  imagenes: ImagenAvistamiento[] = [];
  noEncontrado: boolean = false;
  confirmandoEliminar: boolean = false;
  id: number = 0;
  compartirForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  historialService: HistorialService = inject(HistorialService);
  authService: AuthService = inject(AuthService);
  snackBar: MatSnackBar = inject(MatSnackBar);

  constructor() {
    this.compartirForm = this.fb.group({
      idInvestigadorDestino: [null, [Validators.required, Validators.min(1)]],
      mensaje: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
      console.log('ID recibido:', this.id);
      this.cargarAvistamiento();
    });
  }

  private cargarAvistamiento() {
    this.historialService.listId(this.id).subscribe({
      next: data => {
        console.log('Avistamiento traído por API:', data);
        this.avistamiento = data;
        this.noEncontrado = false;
        this.cargarUbicacion(data.idUbicacion);
        this.cargarImagenes();
      },
      error: err => {
        console.log('Avistamiento no encontrado:', err.status);
        this.avistamiento = null;
        this.noEncontrado = true;
      }
    });
  }

  private cargarUbicacion(idUbicacion: number) {
    this.historialService.ubicacion(idUbicacion).subscribe({
      next: data => this.ubicacion = data,
      error: () => this.ubicacion = null
    });
  }

  private cargarImagenes() {
    this.historialService.imagenes(this.id).subscribe({
      next: data => this.imagenes = data,
      error: () => this.imagenes = []
    });
  }

  foto(): string {
    return this.imagenes.length > 0 ? this.imagenes[0].rutaImagen : 'assets/images/LogoFaunaScan.png';
  }

  urlMapa(): string {
    if (!this.ubicacion) return '';
    return 'https://www.openstreetmap.org/?mlat=' + this.ubicacion.latitud + '&mlon=' + this.ubicacion.longitud + '#map=13/'
      + this.ubicacion.latitud + '/' + this.ubicacion.longitud;
  }

  esDueno(): boolean {
    return this.avistamiento != null && this.avistamiento.idUsuario === this.authService.idUsuario();
  }

  esInvestigador(): boolean {
    const rol = this.authService.rol();
    return rol === 'ROLE_INVESTIGADOR' || rol === 'ROLE_ADMIN';
  }

  // HU-48: solo se edita mientras está pendiente de validación
  puedeEditar(): boolean {
    return this.esDueno() && this.avistamiento?.estadoValidacion === 'pendiente';
  }

  editar() {
    this.router.navigate(['/registrar', this.id]);
  }

  // HU-47
  eliminar() {
    this.historialService.delete(this.id).subscribe({
      next: () => {
        this.snackBar.open('Avistamiento eliminado', 'Cerrar', {duration: 3000});
        this.router.navigate(['/historial']);
      },
      error: err => {
        console.log('Error al eliminar:', err.status);
        this.confirmandoEliminar = false;
        this.snackBar.open('No se pudo eliminar el avistamiento', 'Cerrar', {duration: 4000});
      }
    });
  }

  // HU-56: compartir con un investigador por su id
  compartir() {
    if (this.compartirForm.invalid) {
      this.compartirForm.markAllAsTouched();
      return;
    }
    let compartido = new AvistamientoCompartido();
    compartido.idInvestigadorDestino = this.compartirForm.value.idInvestigadorDestino;
    compartido.mensaje = this.compartirForm.value.mensaje;
    this.historialService.compartir(this.id, compartido).subscribe({
      next: data => {
        console.log('Avistamiento compartido:', data);
        this.compartirForm.reset({idInvestigadorDestino: null, mensaje: ''});
        this.snackBar.open('Avistamiento compartido', 'Cerrar', {duration: 3000});
      },
      error: err => {
        console.log('Error al compartir:', err.status);
        this.snackBar.open('No se pudo compartir. Revisa el id del investigador.', 'Cerrar', {duration: 4000});
      }
    });
  }
}

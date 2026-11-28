import {Component, computed, inject, signal} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatFormField, MatInput, MatLabel, MatError} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AvistamientoDTO} from '../../models/avistamiento-dto';
import {AvistamientoCompartido} from '../../models/avistamiento-compartido';
import {Ubicacion} from '../../models/ubicacion';
import {ImagenAvistamiento} from '../../models/imagen-avistamiento';
import {HistorialService} from '../../servicios/historial.service';
import {AuthService} from '../../servicios/auth.service';

@Component({
  selector: 'app-detalle-avistamiento',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatError, MatButton],
  templateUrl: './detalle-avistamiento.html',
  styleUrl: './detalle-avistamiento.css',
})
export class DetalleAvistamiento {
  avistamiento = signal<AvistamientoDTO | null>(null);
  ubicacion = signal<Ubicacion | null>(null);
  imagenes = signal<ImagenAvistamiento[]>([]);
  noEncontrado = signal<boolean>(false);
  confirmandoEliminar = signal<boolean>(false);
  esFavorito = signal<boolean>(false);
  mostrandoCompartir = signal<boolean>(false);
  fotoElegida = signal<number>(0);
  id: number = 0;
  compartirForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  historialService: HistorialService = inject(HistorialService);
  authService: AuthService = inject(AuthService);
  snackBar: MatSnackBar = inject(MatSnackBar);
  sanitizer: DomSanitizer = inject(DomSanitizer);

  // Mapa de OpenStreetMap centrado en el punto del avistamiento
  mapaEmbebido = computed<SafeResourceUrl | null>(() => {
    const ubicacion = this.ubicacion();
    if (!ubicacion) return null;
    const lat = ubicacion.latitud;
    const lon = ubicacion.longitud;
    const url = 'https://www.openstreetmap.org/export/embed.html?bbox=' + (lon - 0.05) + ',' + (lat - 0.03) + ',' + (lon + 0.05) + ',' + (lat + 0.03)
      + '&layer=mapnik&marker=' + lat + ',' + lon;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

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
        this.avistamiento.set(data);
        this.noEncontrado.set(false);
        this.cargarUbicacion(data.idUbicacion);
        this.cargarImagenes();
        this.cargarFavorito();
      },
      error: err => {
        console.log('Avistamiento no encontrado:', err.status);
        this.avistamiento.set(null);
        this.noEncontrado.set(true);
      }
    });
  }

  private cargarUbicacion(idUbicacion: number) {
    this.historialService.ubicacion(idUbicacion).subscribe({
      next: data => this.ubicacion.set(data),
      error: () => this.ubicacion.set(null)
    });
  }

  private cargarImagenes() {
    this.historialService.imagenes(this.id).subscribe({
      next: data => this.imagenes.set(data),
      error: () => this.imagenes.set([])
    });
  }

  foto(): string {
    const imagenes = this.imagenes();
    if (imagenes.length === 0) return 'assets/images/LogoFaunaScan.png';
    return (imagenes[this.fotoElegida()] ?? imagenes[0]).rutaImagen;
  }

  private cargarFavorito() {
    this.historialService.favoritos(this.authService.idUsuario()).subscribe({
      next: data => this.esFavorito.set(data.some(favorito => favorito.idAvistamiento === this.id)),
      error: () => this.esFavorito.set(false)
    });
  }

  // HU-26
  alternarFavorito() {
    const peticion = this.esFavorito()
      ? this.historialService.quitarFavorito(this.id)
      : this.historialService.marcarFavorito(this.id);
    peticion.subscribe({
      next: () => this.esFavorito.set(!this.esFavorito()),
      error: err => {
        console.log('Error al cambiar el favorito:', err.status);
        this.snackBar.open('No se pudo actualizar el favorito', 'Cerrar', {duration: 3000});
      }
    });
  }

  iniciales(nombre: string): string {
    if (!nombre) return '?';
    return nombre.trim().split(/\s+/).slice(0, 2).map(parte => parte.charAt(0).toUpperCase()).join('');
  }

  etiquetaEstado(estado: string): string {
    return estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : 'Pendiente';
  }

  urlMapa(): string {
    const ubicacion = this.ubicacion();
    if (!ubicacion) return '';
    return 'https://www.openstreetmap.org/?mlat=' + ubicacion.latitud + '&mlon=' + ubicacion.longitud + '#map=13/'
      + ubicacion.latitud + '/' + ubicacion.longitud;
  }

  esDueno(): boolean {
    const avistamiento = this.avistamiento();
    return avistamiento != null && avistamiento.idUsuario === this.authService.idUsuario();
  }

  esInvestigador(): boolean {
    const rol = this.authService.rol();
    return rol === 'ROLE_INVESTIGADOR' || rol === 'ROLE_ADMIN';
  }

  // HU-48: solo se edita mientras está pendiente de validación
  puedeEditar(): boolean {
    return this.esDueno() && this.avistamiento()?.estadoValidacion === 'pendiente';
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
        this.confirmandoEliminar.set(false);
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

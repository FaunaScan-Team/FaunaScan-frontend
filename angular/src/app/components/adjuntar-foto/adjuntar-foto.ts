import {Component, OnChanges, inject, input, signal} from '@angular/core';
import {switchMap} from 'rxjs';
import {CloudinaryService} from '../../servicios/cloudinary.service';
import {ImagenAvistamientoService} from '../../servicios/imagen-avistamiento.service';
import {ImagenAvistamiento} from '../../models/imagen-avistamiento';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_MB = 5;

// HU-10: adjuntar fotografía al avistamiento.
// 1) Se valida el archivo y se muestra la vista previa.
// 2) Se sube a Cloudinary (API externa) y se obtiene la URL.
// 3) Se guarda la URL en nuestra API con POST /avistamientos/{id}/imagenes.
@Component({
  selector: 'app-adjuntar-foto',
  templateUrl: './adjuntar-foto.html',
  styleUrl: './adjuntar-foto.css',
})
export class AdjuntarFoto implements OnChanges {
  private readonly cloudinaryService = inject(CloudinaryService);
  private readonly imagenService = inject(ImagenAvistamientoService);

  readonly idAvistamiento = input.required<number>();

  protected readonly imagenes = signal<ImagenAvistamiento[]>([]);
  protected readonly archivo = signal<File | null>(null);
  protected readonly vistaPrevia = signal('');
  protected readonly subiendo = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');

  ngOnChanges(): void {
    if (this.idAvistamiento() > 0) {
      this.cargar();
    }
  }

  private cargar(): void {
    this.imagenService.list(this.idAvistamiento()).subscribe({
      next: (data) => this.imagenes.set(data),
      error: () => this.imagenes.set([]),
    });
  }

  protected elegir(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    this.error.set('');
    this.mensaje.set('');
    if (!archivo) return;

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      this.error.set('Solo se permiten imágenes JPG, PNG o WEBP.');
      input.value = '';
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      this.error.set('La imagen pesa más de ' + TAMANO_MAXIMO_MB + ' MB.');
      input.value = '';
      return;
    }
    this.archivo.set(archivo);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  protected cancelar(): void {
    URL.revokeObjectURL(this.vistaPrevia());
    this.archivo.set(null);
    this.vistaPrevia.set('');
  }

  protected subir(): void {
    const archivo = this.archivo();
    if (!archivo || this.subiendo()) return;
    this.subiendo.set(true);
    this.error.set('');
    // La primera foto del avistamiento queda como principal (la que se ve en el detalle)
    const esPrincipal = this.imagenes().length === 0;

    this.cloudinaryService.subir(archivo).pipe(
      switchMap((url) => this.imagenService.insert(this.idAvistamiento(), url, esPrincipal)),
    ).subscribe({
      next: (imagen) => {
        this.imagenes.update((lista) => [...lista, imagen]);
        this.cancelar();
        this.subiendo.set(false);
        this.mensaje.set('Foto adjuntada al avistamiento.');
      },
      error: () => {
        this.subiendo.set(false);
        this.error.set('No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.');
      },
    });
  }

  protected eliminar(imagen: ImagenAvistamiento): void {
    if (!confirm('¿Eliminar esta foto del avistamiento?')) return;
    this.imagenService.delete(this.idAvistamiento(), imagen.idImagen).subscribe({
      next: () => this.imagenes.update((lista) => lista.filter((i) => i.idImagen !== imagen.idImagen)),
      error: () => this.error.set('No se pudo eliminar la foto.'),
    });
  }
}

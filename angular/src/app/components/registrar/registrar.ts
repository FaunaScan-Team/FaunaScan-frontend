import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AvistamientoService } from '../../servicios/avistamiento.service';
import { EspecieService } from '../../servicios/especie.service';
import { AvistamientoDTO } from '../../models/avistamiento-dto';
import { Especie } from '../../models/especie';
import { Ubicacion } from '../../models/ubicacion';
import { ColaOfflineService } from '../../servicios/cola-offline.service';
import { RegistroOffline } from '../../models/registro-offline';

// Copia de las especies para poder registrar sin conexión (HU-35)
const CLAVE_ESPECIES = 'faunascan-especies';

/** Valida que la fecha elegida no sea posterior al momento actual. */
function fechaNoFutura(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) return null;
  return new Date(control.value).getTime() > Date.now() ? { fechaFutura: true } : null;
}

/** Fecha y hora local en el formato que usa <input type="datetime-local">. */
function ahoraLocal(): string {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
}

@Component({
  selector: 'app-registrar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registrar.html',
  styleUrl: './registrar.css',
})
export class Registrar implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  protected readonly ruta = inject(ActivatedRoute);
  private readonly avistamientoService = inject(AvistamientoService);
  private readonly especieService = inject(EspecieService);
  protected readonly colaOffline = inject(ColaOfflineService);

  protected readonly especies = signal<Especie[]>([]);
  protected readonly guardado = signal(false);
  protected readonly guardadoOffline = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorApi = signal('');
  protected readonly ubicando = signal(false);
  protected readonly errorUbicacion = signal('');
  protected readonly maxFecha = ahoraLocal();

  // Modo edición: /registrar/:id (HU-48)
  protected readonly edicion = signal(false);
  private avistamiento: AvistamientoDTO = new AvistamientoDTO();
  private idUbicacion = 0;
  private temporizador?: ReturnType<typeof setTimeout>;

  protected readonly formulario = this.fb.group({
    especieId: this.fb.control<number | null>(null, Validators.required),
    fecha: [ahoraLocal(), [Validators.required, fechaNoFutura]],
    area: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    latitud: this.fb.control<number | null>(null, [Validators.required, Validators.min(-90), Validators.max(90)]),
    longitud: this.fb.control<number | null>(null, [Validators.required, Validators.min(-180), Validators.max(180)]),
    descripcion: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.especieService.list().subscribe({
      next: (data) => {
        this.especies.set(data);
        localStorage.setItem(CLAVE_ESPECIES, JSON.stringify(data));
      },
      error: () => {
        // Sin conexión se usa la última lista descargada
        const copia = localStorage.getItem(CLAVE_ESPECIES);
        if (copia) {
          this.especies.set(JSON.parse(copia));
        } else {
          this.errorApi.set('No se pudo cargar la lista de especies.');
        }
      },
    });

    // Contrato con la selección de especie: /registrar?idEspecie=ID
    const idEspecie = Number(this.ruta.snapshot.queryParamMap.get('idEspecie'));
    if (idEspecie > 0) {
      this.formulario.controls.especieId.setValue(idEspecie);
    }

    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.edicion.set(true);
      this.cargarAvistamiento(id);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  private cargarAvistamiento(id: number): void {
    this.avistamientoService.listId(id).subscribe({
      next: (data) => {
        this.avistamiento = data;
        this.idUbicacion = data.idUbicacion;
        this.formulario.patchValue({
          especieId: data.idEspecie,
          fecha: data.fechaAvistamiento ? data.fechaAvistamiento.slice(0, 16) : ahoraLocal(),
          descripcion: data.observaciones ?? '',
        });
        if (data.idUbicacion) {
          this.avistamientoService.listUbicacion(data.idUbicacion).subscribe({
            next: (u) => this.formulario.patchValue({
              area: u.direccion ?? '',
              latitud: u.latitud,
              longitud: u.longitud,
            }),
          });
        }
      },
      error: () => this.errorApi.set('No se encontró el avistamiento o no tienes permiso para editarlo.'),
    });
  }

  protected seleccionarEspecie(id: number): void {
    this.formulario.controls.especieId.setValue(id);
    this.formulario.controls.especieId.markAsTouched();
  }

  protected tieneError(campo: keyof typeof this.formulario.controls, error?: string): boolean {
    const control = this.formulario.controls[campo];
    if (!control.invalid || !control.touched) return false;
    return error ? control.hasError(error) : true;
  }

  protected usarUbicacion(): void {
    if (!navigator.geolocation) {
      this.errorUbicacion.set('Tu navegador no permite obtener la ubicación.');
      return;
    }
    this.ubicando.set(true);
    this.errorUbicacion.set('');
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        this.formulario.patchValue({
          latitud: Number(posicion.coords.latitude.toFixed(6)),
          longitud: Number(posicion.coords.longitude.toFixed(6)),
        });
        this.ubicando.set(false);
      },
      () => {
        this.errorUbicacion.set('No se pudo obtener la ubicación. Ingrésala manualmente.');
        this.ubicando.set(false);
      },
    );
  }

  protected guardar(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.errorApi.set('');
    const valores = this.formulario.getRawValue();

    // HU-35: sin conexión, un registro nuevo se guarda en la cola local y se sincroniza después
    if (!navigator.onLine && !this.edicion()) {
      this.guardarSinConexion();
      return;
    }
    this.guardando.set(true);

    // 1) Ubicación (el backend guarda el avistamiento con idUbicacion)
    const ubicacion = new Ubicacion();
    ubicacion.idUbicacion = this.idUbicacion;
    ubicacion.latitud = valores.latitud!;
    ubicacion.longitud = valores.longitud!;
    ubicacion.direccion = valores.area.trim();
    const peticionUbicacion = this.edicion() && this.idUbicacion
      ? this.avistamientoService.updateUbicacion(ubicacion)
      : this.avistamientoService.insertUbicacion(ubicacion);

    // 2) Avistamiento
    peticionUbicacion.pipe(
      switchMap((u) => {
        const av = this.avistamiento;
        av.idEspecie = valores.especieId!;
        av.idUbicacion = u.idUbicacion;
        // El backend usa LocalDateTime: "2026-11-19T10:30:00", sin zona horaria
        av.fechaAvistamiento = valores.fecha + ':00';
        av.observaciones = valores.descripcion.trim();
        return this.edicion()
          ? this.avistamientoService.update(av)
          : this.avistamientoService.insert(av);
      }),
    ).subscribe({
      next: (guardado) => {
        this.guardado.set(true);
        this.guardando.set(false);
        // Nuevo registro: sigue con las observaciones (clima y notas). Edición: vuelve al historial.
        this.temporizador = setTimeout(() => this.edicion()
          ? this.router.navigate(['/historial'])
          : this.router.navigate(['/observaciones'], { queryParams: { id: guardado.idAvistamiento } }), 1200);
      },
      error: (err) => {
        this.guardando.set(false);
        // status 0: no hubo respuesta (se cortó la red). Un registro nuevo pasa a la cola local.
        if (err.status === 0 && !this.edicion()) {
          this.guardarSinConexion();
          return;
        }
        this.errorApi.set(err.status === 400
          ? 'Revisa los datos: la API rechazó el registro.'
          : 'No se pudo guardar el avistamiento. Intenta de nuevo.');
      },
    });
  }

  private guardarSinConexion(): void {
    const valores = this.formulario.getRawValue();
    const registro = new RegistroOffline();
    registro.latitud = valores.latitud!;
    registro.longitud = valores.longitud!;
    registro.direccion = valores.area.trim();
    registro.idEspecie = valores.especieId!;
    registro.fechaAvistamiento = valores.fecha + ':00';
    registro.observaciones = valores.descripcion.trim();
    this.colaOffline.agregar(registro);

    this.guardado.set(true);
    this.guardadoOffline.set(true);
    // Sin conexión no se puede ir a observaciones (necesita el id que da la API): vuelve al formulario limpio
    this.temporizador = setTimeout(() => {
      this.guardado.set(false);
      this.guardadoOffline.set(false);
      this.formulario.reset({ especieId: null, fecha: ahoraLocal(), area: '', latitud: null, longitud: null, descripcion: '' });
    }, 2500);
  }
}

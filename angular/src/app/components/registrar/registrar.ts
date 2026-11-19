import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { ESPECIES_REGISTRO } from './especies-registro';

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
  private readonly ruta = inject(ActivatedRoute);
  protected readonly servicio = inject(AvistamientosService);

  protected readonly especies = ESPECIES_REGISTRO;
  protected readonly guardado = signal(false);
  protected readonly ubicando = signal(false);
  protected readonly errorUbicacion = signal('');
  protected readonly maxFecha = ahoraLocal();
  private temporizador?: ReturnType<typeof setTimeout>;

  protected readonly formulario = this.fb.group({
    especieId: this.fb.control<number | null>(null, Validators.required),
    fecha: [ahoraLocal(), [Validators.required, fechaNoFutura]],
    area: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    latitud: this.fb.control<number | null>(null, [Validators.min(-90), Validators.max(90)]),
    longitud: this.fb.control<number | null>(null, [Validators.min(-180), Validators.max(180)]),
    descripcion: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    const borrador = this.servicio.borrador();
    if (borrador) {
      this.formulario.patchValue(borrador);
    }

    // Permite llegar desde el detalle de especie: /registrar?especie=3
    const especieUrl = Number(this.ruta.snapshot.queryParamMap.get('especie'));
    if (this.especies.some((especie) => especie.id === especieUrl)) {
      this.formulario.controls.especieId.setValue(especieUrl);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
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

  /** Guarda lo escrito y abre la pantalla de observaciones detalladas. */
  protected irAObservaciones(): void {
    this.servicio.borrador.set(this.formulario.getRawValue());
    this.router.navigate(['/observaciones']);
  }

  protected guardar(): void {
    if (this.formulario.invalid || this.guardado()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const especie = this.especies.find((item) => item.id === valores.especieId);
    if (!especie) return;

    this.servicio.registrar({
      especie: { ...especie },
      fecha: new Date(valores.fecha).toISOString(),
      area: valores.area.trim(),
      latitud: valores.latitud,
      longitud: valores.longitud,
      descripcion: valores.descripcion.trim(),
      observaciones: this.servicio.observacionesBorrador(),
    });

    this.guardado.set(true);
    this.temporizador = setTimeout(() => this.router.navigate(['/historial']), 1200);
  }
}

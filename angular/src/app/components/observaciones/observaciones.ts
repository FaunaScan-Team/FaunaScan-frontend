import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Clima } from '../../models/avistamiento';
import { AvistamientosService } from '../../servicios/avistamientos.service';
import { ESPECIES_REGISTRO } from '../registrar/especies-registro';

interface OpcionClima {
  valor: Clima;
  icono: string;
}

@Component({
  selector: 'app-observaciones',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './observaciones.html',
  styleUrl: './observaciones.css',
})
export class Observaciones {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly servicio = inject(AvistamientosService);

  protected readonly climas: readonly OpcionClima[] = [
    { valor: 'Soleado', icono: '☀️' },
    { valor: 'Parcial nublado', icono: '🌤️' },
    { valor: 'Lluvioso', icono: '🌧️' },
    { valor: 'Nublado', icono: '☁️' },
    { valor: 'Ventoso', icono: '🌬️' },
    { valor: 'Tormenta', icono: '⛈️' },
    { valor: 'Frío intenso', icono: '❄️' },
    { valor: 'Caluroso', icono: '🌡️' },
  ];

  protected readonly formulario = this.fb.group({
    clima: this.fb.control<Clima | null>(null),
    temperatura: this.fb.control<number | null>(null, [Validators.min(-30), Validators.max(50)]),
    humedad: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(100)]),
    individuos: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(1000), Validators.pattern(/^\d+$/)]),
    notas: ['', Validators.maxLength(500)],
  });

  protected readonly etiquetas = signal<string[]>([]);
  protected readonly valores = toSignal(this.formulario.valueChanges, {
    initialValue: this.formulario.getRawValue(),
  });

  /** Especie elegida en /registrar, para mostrarla en el resumen. */
  protected readonly especie = computed(() => {
    const id = this.servicio.borrador()?.especieId;
    return ESPECIES_REGISTRO.find((item) => item.id === id) ?? null;
  });
  protected readonly iconoClima = computed(
    () => this.climas.find((clima) => clima.valor === this.valores().clima)?.icono ?? '',
  );

  constructor() {
    const previas = this.servicio.observacionesBorrador();
    if (previas) {
      this.formulario.patchValue(previas);
      this.etiquetas.set([...previas.etiquetas]);
    }
  }

  protected elegirClima(clima: Clima): void {
    const actual = this.formulario.controls.clima.value;
    this.formulario.controls.clima.setValue(actual === clima ? null : clima);
  }

  protected tieneError(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  protected agregarEtiqueta(evento: Event): void {
    evento.preventDefault();
    const input = evento.target as HTMLInputElement;
    const texto = input.value.trim();
    if (texto && texto.length <= 30 && !this.etiquetas().includes(texto) && this.etiquetas().length < 10) {
      this.etiquetas.update((lista) => [...lista, texto]);
    }
    input.value = '';
  }

  protected quitarEtiqueta(etiqueta: string): void {
    this.etiquetas.update((lista) => lista.filter((item) => item !== etiqueta));
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    this.servicio.observacionesBorrador.set({
      ...valores,
      notas: valores.notas.trim(),
      etiquetas: this.etiquetas(),
    });
    this.router.navigate(['/registrar']);
  }
}

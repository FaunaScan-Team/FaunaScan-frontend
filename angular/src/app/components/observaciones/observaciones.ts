import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Clima } from '../../models/avistamiento';
import { AvistamientoDTO } from '../../models/avistamiento-dto';
import { AvistamientoService } from '../../servicios/avistamiento.service';
import { ClimaService } from '../../servicios/clima.service';
import { AdjuntarFoto } from '../adjuntar-foto/adjuntar-foto';

interface OpcionClima {
  valor: Clima;
  icono: string;
}

/** Traduce el weather_code de Open-Meteo (códigos WMO) a las opciones de clima del formulario. */
function climaDesdeCodigo(codigo: number, temperatura: number): Clima {
  if (codigo >= 95) return 'Tormenta';
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) return 'Frío intenso';
  if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) return 'Lluvioso';
  if (codigo === 3 || codigo === 45 || codigo === 48) return 'Nublado';
  if (codigo === 1 || codigo === 2) return 'Parcial nublado';
  return temperatura >= 30 ? 'Caluroso' : 'Soleado';
}

@Component({
  selector: 'app-observaciones',
  imports: [ReactiveFormsModule, RouterLink, AdjuntarFoto],
  templateUrl: './observaciones.html',
  styleUrl: './observaciones.css',
})
export class Observaciones implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly avistamientoService = inject(AvistamientoService);
  private readonly climaService = inject(ClimaService);

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
  protected readonly iconoClima = computed(
    () => this.climas.find((clima) => clima.valor === this.valores().clima)?.icono ?? '',
  );

  // Avistamiento al que pertenecen las observaciones: /observaciones?id=ID
  protected readonly idAvistamiento = signal(0);
  protected readonly avistamiento = signal<AvistamientoDTO | null>(null);
  private latitud: number | null = null;
  private longitud: number | null = null;

  protected readonly errorApi = signal('');
  protected readonly guardando = signal(false);
  protected readonly guardado = signal(false);

  // Open-Meteo (API externa)
  protected readonly consultandoClima = signal(false);
  protected readonly mensajeClima = signal('');

  // Dictado por voz (Web Speech API)
  private reconocimiento: any = null;
  protected readonly dictadoDisponible = signal(false);
  protected readonly escuchando = signal(false);
  private temporizador?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const ventana = window as any;
    const Reconocimiento = ventana.SpeechRecognition || ventana.webkitSpeechRecognition;
    if (Reconocimiento) {
      this.reconocimiento = new Reconocimiento();
      this.reconocimiento.lang = 'es-PE';
      this.reconocimiento.interimResults = false;
      this.reconocimiento.continuous = false;
      this.reconocimiento.onresult = (evento: any) => this.agregarDictado(evento.results[0][0].transcript);
      this.reconocimiento.onend = () => this.escuchando.set(false);
      this.reconocimiento.onerror = () => this.escuchando.set(false);
      this.dictadoDisponible.set(true);
    }

    const id = Number(this.ruta.snapshot.queryParamMap.get('id'));
    if (id > 0) {
      this.idAvistamiento.set(id);
      this.cargarAvistamiento(id);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
    this.reconocimiento?.abort();
  }

  private cargarAvistamiento(id: number): void {
    this.avistamientoService.listId(id).subscribe({
      next: (data) => {
        this.avistamiento.set(data);
        this.formulario.patchValue({ notas: data.observaciones ?? '' });
        this.leerCondiciones(data.condicionesEntorno ?? '');
        if (data.idUbicacion) {
          this.avistamientoService.listUbicacion(data.idUbicacion).subscribe({
            next: (u) => {
              this.latitud = Number(u.latitud);
              this.longitud = Number(u.longitud);
            },
          });
        }
      },
      error: () => this.errorApi.set('No se encontró el avistamiento o no tienes permiso para verlo.'),
    });
  }

  /**
   * El backend guarda las condiciones como un solo texto (condicionesEntorno).
   * Formato: "Clima: Soleado · Temperatura: 18 °C · Humedad: 60 % · Individuos: 2 · Etiquetas: a, b"
   */
  private armarCondiciones(): string {
    const v = this.formulario.getRawValue();
    const partes: string[] = [];
    if (v.clima) partes.push('Clima: ' + v.clima);
    if (v.temperatura != null) partes.push('Temperatura: ' + v.temperatura + ' °C');
    if (v.humedad != null) partes.push('Humedad: ' + v.humedad + ' %');
    if (v.individuos != null) partes.push('Individuos: ' + v.individuos);
    if (this.etiquetas().length) partes.push('Etiquetas: ' + this.etiquetas().join(', '));
    return partes.join(' · ');
  }

  private leerCondiciones(texto: string): void {
    const valor = (clave: string) => texto.match(new RegExp(clave + ':\\s*([^·]+)'))?.[1].trim() ?? null;
    const clima = valor('Clima');
    const numero = (clave: string) => {
      const n = parseFloat(valor(clave) ?? '');
      return isNaN(n) ? null : n;
    };
    this.formulario.patchValue({
      clima: this.climas.some((c) => c.valor === clima) ? (clima as Clima) : null,
      temperatura: numero('Temperatura'),
      humedad: numero('Humedad'),
      individuos: numero('Individuos'),
    });
    const etiquetas = valor('Etiquetas');
    this.etiquetas.set(etiquetas ? etiquetas.split(',').map((e) => e.trim()).filter((e) => e) : []);
  }

  /** Botón "Completar clima": consulta Open-Meteo con la ubicación del avistamiento. */
  protected completarClima(): void {
    if (this.latitud == null || this.longitud == null) {
      this.mensajeClima.set('El avistamiento no tiene latitud y longitud para consultar el clima.');
      return;
    }
    this.consultandoClima.set(true);
    this.mensajeClima.set('');
    this.climaService.actual(this.latitud, this.longitud).subscribe({
      next: (c) => {
        this.formulario.patchValue({
          clima: climaDesdeCodigo(c.codigo, c.temperatura),
          temperatura: c.temperatura,
          humedad: c.humedad,
        });
        this.formulario.markAsDirty();
        this.mensajeClima.set('Clima completado con Open-Meteo para la ubicación del avistamiento.');
        this.consultandoClima.set(false);
      },
      error: () => {
        this.mensajeClima.set('No se pudo consultar el clima. Complétalo manualmente.');
        this.consultandoClima.set(false);
      },
    });
  }

  protected alternarDictado(): void {
    if (!this.reconocimiento) return;
    if (this.escuchando()) {
      this.reconocimiento.stop();
      return;
    }
    this.escuchando.set(true);
    this.reconocimiento.start();
  }

  private agregarDictado(texto: string): void {
    const notas = this.formulario.controls.notas;
    const nuevo = (notas.value ? notas.value.trimEnd() + ' ' : '') + texto.trim();
    notas.setValue(nuevo.slice(0, 500));
    notas.markAsDirty();
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
    const texto = input.value.trim().replace(/[·,]/g, ' ');
    if (texto && texto.length <= 30 && !this.etiquetas().includes(texto) && this.etiquetas().length < 10) {
      this.etiquetas.update((lista) => [...lista, texto]);
    }
    input.value = '';
  }

  protected quitarEtiqueta(etiqueta: string): void {
    this.etiquetas.update((lista) => lista.filter((item) => item !== etiqueta));
  }

  protected guardar(): void {
    if (this.formulario.invalid || !this.idAvistamiento() || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorApi.set('');
    const notas = this.formulario.controls.notas.value.trim();
    this.avistamientoService.actualizarObservaciones(this.idAvistamiento(), notas, this.armarCondiciones()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardado.set(true);
        this.temporizador = setTimeout(() => this.router.navigate(['/historial']), 1200);
      },
      error: () => {
        this.guardando.set(false);
        this.errorApi.set('No se pudieron guardar las observaciones. Intenta de nuevo.');
      },
    });
  }
}

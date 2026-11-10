import { Injectable, computed, inject, signal } from '@angular/core';
import { Avistamiento, EstadoValidacion, NuevoAvistamiento, ObservacionesDetalladas } from '../models/avistamiento';
import { UsuarioSesion } from '../models/usuario-sesion';
import { SesionConsultaService } from './sesion-consulta.service';

/** Valores temporales del formulario de /registrar, sin cambios de contrato. */
export interface BorradorRegistro {
  especieId: number | null;
  fecha: string;
  area: string;
  latitud: number | null;
  longitud: number | null;
  descripcion: string;
}

const CLAVE_ALMACENAMIENTO = 'faunascan-angular-avistamientos';

/**
 * Servicio compartido de avistamientos; el responsable del módulo es Añamauro.
 * Implementación local temporal, SIN autorización segura de servidor.
 */
@Injectable({ providedIn: 'root' })
export class AvistamientosService {
  private readonly sesion = inject(SesionConsultaService);
  private readonly datos = signal<Avistamiento[]>(this.leerAlmacenamiento());
  readonly lista = this.datos.asReadonly();
  readonly total = computed(() => this.datos().length);
  readonly borrador = signal<BorradorRegistro | null>(null);
  readonly observacionesBorrador = signal<ObservacionesDetalladas | null>(null);

  constructor() {
    // Sincroniza otras pestañas del mismo origen durante las pruebas compartidas.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (evento) => {
        if (evento.key === CLAVE_ALMACENAMIENTO) this.datos.set(this.leerAlmacenamiento());
      });
    }
  }

  obtenerPorId(id: string): Avistamiento | undefined {
    return this.datos().find((av) => av.id === id);
  }

  registrar(nuevo: NuevoAvistamiento): Avistamiento {
    const usuario = this.sesion.usuarioActual();
    const avistamiento: Avistamiento = {
      ...nuevo,
      id: this.generarId(),
      registradoPor: usuario
        ? { email: usuario.email, nombre: usuario.nombre }
        : { email: '', nombre: 'Usuario no identificado' },
      estadoValidacion: 'Pendiente',
      validadoPor: null,
      validadoEn: null,
      creadoEn: new Date().toISOString(),
    };
    this.datos.update((lista) => [avistamiento, ...lista]);
    this.guardarAlmacenamiento();
    this.limpiarBorrador();
    return avistamiento;
  }

  /**
   * Resuelve un registro SOLO si está pendiente, fue creado por otro usuario
   * y el investigador coincide con la sesión del prototipo. No reemplaza al backend.
   */
  validar(
    id: string,
    estado: Exclude<EstadoValidacion, 'Pendiente'>,
    investigador: UsuarioSesion,
  ): boolean {
    const actual = this.sesion.usuarioActual();
    if (!actual || actual.rol !== 'investigador' || !actual.credencialVerificada) return false;
    if (!investigador || investigador.email.toLowerCase() !== actual.email.toLowerCase()) return false;
    if (estado !== 'Validado' && estado !== 'Rechazado') return false;
    const av = this.obtenerPorId(id);
    if (!av || av.estadoValidacion !== 'Pendiente') return false;
    if (av.registradoPor.email && av.registradoPor.email.toLowerCase() === actual.email.toLowerCase()) return false;
    this.datos.update((lista) => lista.map((item) => item.id === id
      ? { ...item, estadoValidacion: estado, validadoPor: actual.email, validadoEn: new Date().toISOString() }
      : item));
    this.guardarAlmacenamiento();
    return true;
  }

  /**
   * Edita los datos básicos de un registro propio que siga pendiente.
   * Pedido por Suárez para /avistamientos/:id; revisar con Añamauro (responsable del módulo).
   */
  actualizar(id: string, cambios: Pick<Avistamiento, 'fecha' | 'area' | 'descripcion'>): boolean {
    const actual = this.sesion.usuarioActual();
    const av = this.obtenerPorId(id);
    if (!actual || !av) return false;
    if (av.registradoPor.email.toLowerCase() !== actual.email.toLowerCase()) return false;
    if (av.estadoValidacion !== 'Pendiente') return false;
    const area = cambios.area.trim();
    if (!area || !cambios.fecha) return false;
    this.datos.update((lista) => lista.map((item) => item.id === id
      ? { ...item, fecha: cambios.fecha, area, descripcion: cambios.descripcion.trim() }
      : item));
    this.guardarAlmacenamiento();
    return true;
  }

  /** Borra un registro propio. La baja definitiva la decidirá el backend. */
  eliminar(id: string): boolean {
    const actual = this.sesion.usuarioActual();
    const av = this.obtenerPorId(id);
    if (!actual || !av) return false;
    if (av.registradoPor.email.toLowerCase() !== actual.email.toLowerCase()) return false;
    this.datos.update((lista) => lista.filter((item) => item.id !== id));
    this.guardarAlmacenamiento();
    return true;
  }

  limpiarBorrador(): void {
    this.borrador.set(null);
    this.observacionesBorrador.set(null);
  }

  private generarId(): string {
    return `av-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private leerAlmacenamiento(): Avistamiento[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const almacenados: unknown = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO) ?? '[]');
      if (!Array.isArray(almacenados)) return [];
      // Compatibilidad con los avistamientos guardados antes de agregar el contrato.
      return almacenados.flatMap((dato: unknown): Avistamiento[] => {
        if (!dato || typeof dato !== 'object') return [];
        const av = dato as Partial<Avistamiento>;
        if (typeof av.id !== 'string' || !av.especie || typeof av.fecha !== 'string') return [];
        const autor = av.registradoPor;
        return [{
          ...av,
          id: av.id,
          especie: av.especie,
          fecha: av.fecha,
          area: typeof av.area === 'string' ? av.area : '',
          latitud: typeof av.latitud === 'number' ? av.latitud : null,
          longitud: typeof av.longitud === 'number' ? av.longitud : null,
          descripcion: typeof av.descripcion === 'string' ? av.descripcion : '',
          observaciones: av.observaciones ?? null,
          registradoPor: autor && typeof autor.email === 'string' && typeof autor.nombre === 'string'
            ? { email: autor.email, nombre: autor.nombre }
            : { email: '', nombre: 'Usuario no identificado' },
          estadoValidacion: av.estadoValidacion === 'Validado' || av.estadoValidacion === 'Rechazado'
            ? av.estadoValidacion : 'Pendiente',
          validadoPor: typeof av.validadoPor === 'string' ? av.validadoPor : null,
          validadoEn: typeof av.validadoEn === 'string' ? av.validadoEn : null,
          creadoEn: typeof av.creadoEn === 'string' ? av.creadoEn : av.fecha,
        }];
      });
    } catch { return []; }
  }

  private guardarAlmacenamiento(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(this.datos()));
    } catch {
      // Si no hay almacenamiento disponible, los datos permanecen en memoria.
    }
  }
}

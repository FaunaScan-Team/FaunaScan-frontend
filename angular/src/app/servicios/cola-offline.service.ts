import {inject, Service, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {RegistroOffline} from '../models/registro-offline';

const CLAVE_COLA = 'faunascan-cola-offline';

// HU-35 y HU-36: modo offline.
// Los avistamientos registrados sin conexión se guardan en una cola en localStorage
// y se envían juntos a POST /api/avistamientos/sincronizar cuando vuelve la conexión.
@Service()
export class ColaOfflineService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);

  readonly enLinea = signal(navigator.onLine);
  readonly pendientes = signal<RegistroOffline[]>(this.leer());
  readonly sincronizando = signal(false);
  readonly mensaje = signal('');

  constructor() {
    window.addEventListener('online', () => {
      this.enLinea.set(true);
      this.sincronizar();
    });
    window.addEventListener('offline', () => this.enLinea.set(false));
    // Si la app se abre con registros pendientes y con red, se envían de una vez
    if (navigator.onLine) {
      this.sincronizar();
    }
  }

  agregar(registro: RegistroOffline): void {
    const cola = [...this.pendientes(), registro];
    this.guardar(cola);
  }

  sincronizar(): void {
    const cola = this.pendientes();
    // Sin registros, sin red o sin sesión no hay nada que enviar
    if (cola.length === 0 || !navigator.onLine || !localStorage.getItem('token') || this.sincronizando()) {
      return;
    }
    this.sincronizando.set(true);
    this.enviar(cola).subscribe({
      next: () => {
        this.guardar([]);
        this.sincronizando.set(false);
        this.mensaje.set(cola.length + (cola.length === 1 ? ' avistamiento sincronizado.' : ' avistamientos sincronizados.'));
        setTimeout(() => this.mensaje.set(''), 4000);
      },
      error: () => {
        // Se quedan en la cola y se vuelve a intentar con el botón o en el próximo evento online
        this.sincronizando.set(false);
        this.mensaje.set('No se pudo sincronizar. Se intentará de nuevo.');
      },
    });
  }

  private enviar(registros: RegistroOffline[]): Observable<unknown> {
    return this.httpClient.post(this.url + '/avistamientos/sincronizar', {registros: registros});
  }

  private leer(): RegistroOffline[] {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_COLA) ?? '[]');
    } catch {
      return [];
    }
  }

  private guardar(cola: RegistroOffline[]): void {
    localStorage.setItem(CLAVE_COLA, JSON.stringify(cola));
    this.pendientes.set(cola);
  }
}

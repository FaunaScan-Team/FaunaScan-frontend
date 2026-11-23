// HU-35 y HU-36: avistamiento guardado sin conexión.
// Tiene los mismos campos que RegistroOfflineDTO del backend (POST /api/avistamientos/sincronizar).
export class RegistroOffline {
  latitud: number = 0;
  longitud: number = 0;
  direccion: string = '';
  idEspecie: number = 0;
  fechaAvistamiento: string = '';
  observaciones: string = '';
  condicionesEntorno: string = '';
  rutaImagen: string = '';
}

// Mismos campos que AvistamientoDTO del backend.
// Las fechas llegan como texto ISO, por ejemplo "2026-11-16T10:30:00".
export class AvistamientoDTO {
  idAvistamiento: number = 0;
  idUsuario: number = 0;
  nombreUsuario: string = '';
  idEspecie: number = 0;
  nombreEspecie: string = '';
  idUbicacion: number = 0;
  fechaAvistamiento: string = '';
  observaciones: string = '';
  condicionesEntorno: string = '';
  estadoValidacion: string = '';
  fechaValidacion: string = '';
  idInvestigadorValidador: number = 0;
  sincronizadoLocal: boolean = false;
  fechaRegistro: string = '';
}

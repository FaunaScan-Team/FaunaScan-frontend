import {ProgresoUsuario} from './progreso-usuario';
import {GuiaIdentificacion} from './guia-identificacion';

// Mismos campos que DashboardVoluntarioDTO del backend
export class DashboardVoluntario {
  idUsuario: number = 0;
  nombre: string = '';
  apellido: string = '';
  rol: string = '';
  progreso: ProgresoUsuario = new ProgresoUsuario();
  guias: GuiaIdentificacion[] = [];
}

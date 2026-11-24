import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {DashboardInvestigador} from '../models/dashboard-investigador';
import {DashboardVoluntario} from '../models/dashboard-voluntario';
import {Contribucion} from '../models/contribucion';
import {ReporteMensual} from '../models/reporte-mensual';

@Service()
export class PanelesService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);

  // HU-52: el backend saca el investigador del token
  dashboardInvestigador(): Observable<DashboardInvestigador> {
    return this.httpClient.get<DashboardInvestigador>(this.url + '/dashboard/investigador');
  }

  // HU-53: el backend saca el voluntario del token
  dashboardVoluntario(): Observable<DashboardVoluntario> {
    return this.httpClient.get<DashboardVoluntario>(this.url + '/dashboard/voluntario');
  }

  // HU-54: avistamientos del usuario por estado de validación
  contribucion(idUsuario: number): Observable<Contribucion> {
    return this.httpClient.get<Contribucion>(this.url + '/usuarios/' + idUsuario + '/contribucion');
  }

  // HU-19: resumen mensual de avistamientos validados (solo INVESTIGADOR o ADMIN)
  resumenMensual(): Observable<ReporteMensual> {
    return this.httpClient.get<ReporteMensual>(this.url + '/reportes/mensuales');
  }
}

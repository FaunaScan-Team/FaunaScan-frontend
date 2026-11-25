import {Component, inject, input, output} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../servicios/auth.service';
import {IdiomaService} from '../../servicios/idioma.service';

interface EnlaceLateral {
    ruta: string;
    texto: string;
    icono: string;
}

// Menú lateral de la aplicación, igual al prototipo (FaunaScan/FaunaScan, dashboard.html)
@Component({
    selector: 'app-barra-lateral',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './barra-lateral.html',
    styleUrl: './barra-lateral.css',
})
export class BarraLateral {
    abierta = input<boolean>(false);
    cerrar = output<void>();
    authService: AuthService = inject(AuthService);
    idioma: IdiomaService = inject(IdiomaService);
    private router: Router = inject(Router);

    // Los enlaces cambian según el rol: Reportes y Verificar son solo para investigadores
    enlaces(): EnlaceLateral[] {
        const investigador = this.authService.rol() !== 'ROLE_VOLUNTARIO';
        const lista: EnlaceLateral[] = [
            {ruta: this.authService.panelSegunRol(), texto: 'Principal', icono: 'Principal.png'},
            {ruta: '/registrar', texto: 'Registrar', icono: 'Registrar.png'},
            {ruta: '/mapa', texto: 'Mapa', icono: 'Mapa.png'},
            {ruta: '/catalogo', texto: 'Catálogo', icono: 'CatalogoBlanco.png'},
        ];
        if (investigador) {
            lista.push({ruta: '/reportes', texto: 'Reportes', icono: 'Reportes.png'});
            lista.push({ruta: '/verificar', texto: 'Verificar', icono: 'VerificarBlanco.png'});
        } else {
            lista.push({ruta: '/mi-contribucion', texto: 'Mi contribución', icono: 'Reportes.png'});
        }
        lista.push({ruta: '/historial', texto: 'Historial', icono: 'Historial.png'});
        return lista;
    }

    // HU-08: borra el token y vuelve al inicio
    cerrarSesion() {
        this.authService.logout();
        this.cerrar.emit();
        this.router.navigate(['/']);
    }
}

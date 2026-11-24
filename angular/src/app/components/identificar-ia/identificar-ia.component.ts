import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {ResultadoIdentificacion, SugerenciaEspecie} from '../../models/resultado-identificacion';
import {IaService} from '../../servicios/ia.service';

@Component({
    selector: 'app-identificar-ia',
    imports: [MatButton],
    templateUrl: './identificar-ia.component.html',
    styleUrl: './identificar-ia.component.css'
})
export class IdentificarIaComponent {
    imagen: string = '';
    resultado: ResultadoIdentificacion | null = null;
    cargando: boolean = false;
    mensaje: string = '';
    iaService: IaService = inject(IaService);
    router: Router = inject(Router);

    seleccionarImagen(evento: Event) {
        const input = evento.target as HTMLInputElement;
        const archivo = input.files?.[0];
        if (!archivo) {
            return;
        }
        const lector = new FileReader();
        lector.onload = () => {
            this.imagen = String(lector.result);
            this.resultado = null;
            this.mensaje = '';
        };
        lector.readAsDataURL(archivo);
    }

    analizar() {
        if (!this.imagen) {
            this.mensaje = 'Selecciona una imagen primero.';
            return;
        }
        this.cargando = true;
        this.iaService.identificar(this.imagen).subscribe({
            next: data => {
                console.log('Resultado de la IA:', data);
                this.resultado = data;
                this.cargando = false;
            },
            error: err => {
                console.log('Error en la IA:', err.status);
                this.cargando = false;
                this.mensaje = 'No se pudo analizar la imagen. Intenta más tarde.';
            }
        });
    }

    // Lleva la especie sugerida al registro de avistamiento
    usarEspecie(sugerencia: SugerenciaEspecie) {
        this.router.navigate(['/registrar'], {queryParams: {idEspecie: sugerencia.idEspecie}});
    }
}
import {Component, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Especie} from '../../models/especie';
import {GuiaIdentificacion} from '../../models/guia-identificacion';
import {EspecieService} from '../../servicios/especie.service';

@Component({
    selector: 'app-detalle-especie',
    imports: [RouterLink],
    templateUrl: './detalle-especie.html',
    styleUrl: './detalle-especie.css',
})
export class DetalleEspecie {
    especie: Especie | null = null;
    guia: GuiaIdentificacion | null = null;
    noEncontrada: boolean = false;
    id: number = 0;
    route: ActivatedRoute = inject(ActivatedRoute);
    especieService: EspecieService = inject(EspecieService);

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.id = +params['id'];
            console.log('ID recibido:', this.id);
            this.cargarEspecie();
        });
    }

    private cargarEspecie() {
        this.especieService.listId(this.id).subscribe({
            next: data => {
                console.log('Especie traída por API:', data);
                this.especie = data;
                this.noEncontrada = false;
                this.cargarGuia();
            },
            error: err => {
                console.log('Especie no encontrada:', err.status);
                this.especie = null;
                this.noEncontrada = true;
            }
        });
    }


    private cargarGuia() {
        this.especieService.guia(this.id).subscribe({
            next: data => this.guia = data,
            error: () => this.guia = null
        });
    }

    imagen(): string {
        return this.especie && this.especie.imagenReferencia ? this.especie.imagenReferencia : 'assets/images/LogoFaunaScan.png';
    }
}
import { Component, computed, signal } from '@angular/core';
import { Especie } from '../../models/especie';

@Component({
    selector: 'app-seleccionar-especie',
    standalone: true,
    templateUrl: './seleccionar-especie.component.html',
    styleUrl: './seleccionar-especie.component.css'
})
export class SeleccionarEspecieComponent {
    readonly busqueda = signal('');
    readonly seleccionada = signal<Especie | null>(null);

    readonly especies: Especie[] = [
        {
            id: 1,
            nombre: 'Cóndor andino',
            nombreCientifico: 'Vultur gryphus',
            estado: 'vulnerable',
            estadoLabel: 'Vulnerable',
            familia: 'ave',
            imagen: 'assets/images/Condor.png',
            emoji: '🦅'
        },
        {
            id: 2,
            nombre: 'Oso de anteojos',
            nombreCientifico: 'Tremarctos ornatus',
            estado: 'vulnerable',
            estadoLabel: 'Vulnerable',
            familia: 'mamifero',
            imagen: 'assets/images/OsoDeAnteojos.png',
            emoji: '🐻'
        },
        {
            id: 3,
            nombre: 'Jaguar',
            nombreCientifico: 'Panthera onca',
            estado: 'critico',
            estadoLabel: 'En peligro crítico',
            familia: 'mamifero',
            imagen: 'assets/images/Jaguar.png',
            emoji: '🐆'
        },
        {
            id: 4,
            nombre: 'Guacamayo rojo',
            nombreCientifico: 'Ara macao',
            estado: 'vulnerable',
            estadoLabel: 'Vulnerable',
            familia: 'ave',
            imagen: 'assets/images/Guacamayo.png',
            emoji: '🦜'
        }
    ];

    readonly especiesFiltradas = computed(() => {
        const texto = this.normalizar(this.busqueda());

        if (!texto) {
            return this.especies;
        }

        return this.especies.filter((especie) =>
            this.normalizar(especie.nombre).includes(texto) ||
            this.normalizar(especie.nombreCientifico).includes(texto)
        );
    });

    seleccionar(especie: Especie): void {
        this.seleccionada.set(especie);
    }

    private normalizar(texto: string): string {
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }
}
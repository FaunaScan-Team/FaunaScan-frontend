import { Component, computed, signal } from '@angular/core';

interface AvistamientoMapa {
    id: string;
    especie: string;
    fecha: string;
    latitud: number;
    longitud: number;
    estadoValidacion: 'Pendiente' | 'Validado' | 'Rechazado';
}

@Component({
    selector: 'app-mapa',
    standalone: true,
    templateUrl: './mapa.component.html',
    styleUrl: './mapa.component.css'
})
export class MapaComponent {
    readonly filtroEstado = signal('');

    readonly avistamientos = signal<AvistamientoMapa[]>([
        {
            id: 'AV-001',
            especie: 'Cóndor andino',
            fecha: '2026-11-08',
            latitud: -13.1631,
            longitud: -72.545,
            estadoValidacion: 'Validado'
        },
        {
            id: 'AV-002',
            especie: 'Oso de anteojos',
            fecha: '2026-11-07',
            latitud: -6.232,
            longitud: -77.871,
            estadoValidacion: 'Pendiente'
        },
        {
            id: 'AV-003',
            especie: 'Delfín rosado',
            fecha: '2026-11-06',
            latitud: -3.743,
            longitud: -73.251,
            estadoValidacion: 'Validado'
        }
    ]);

    readonly visibles = computed(() => {
        const estado = this.filtroEstado();

        return this.avistamientos().filter((avistamiento) =>
            !estado || avistamiento.estadoValidacion === estado
        );
    });

    posicionHorizontal(longitud: number): string {
        const posicion = ((longitud + 82) / 14) * 100;
        return `${Math.max(8, Math.min(92, posicion))}%`;
    }

    posicionVertical(latitud: number): string {
        const posicion = ((0 - latitud) / 19) * 100;
        return `${Math.max(8, Math.min(92, posicion))}%`;
    }
}
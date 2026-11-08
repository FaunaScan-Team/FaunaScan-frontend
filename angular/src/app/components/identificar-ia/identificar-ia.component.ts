import { Component, signal } from '@angular/core';
import { Especie } from '../../models/especie';

interface SugerenciaIa {
    especie: Especie;
    confianza: number;
}

@Component({
    selector: 'app-identificar-ia',
    standalone: true,
    templateUrl: './identificar-ia.component.html',
    styleUrl: './identificar-ia.component.css'
})
export class IdentificarIaComponent {
    readonly imagen = signal<string | null>(null);
    readonly sugerencias = signal<SugerenciaIa[]>([]);
    readonly mensaje = signal('');

    readonly especies: Especie[] = [
        {
            id: 1,
            nombre: 'Cóndor andino',
            nombreCientifico: 'Vultur gryphus',
            estado: 'vulnerable',
            estadoLabel: 'Vulnerable',
            familia: 'ave',
            imagen: '',
            emoji: '🦅'
        },
        {
            id: 2,
            nombre: 'Oso de anteojos',
            nombreCientifico: 'Tremarctos ornatus',
            estado: 'vulnerable',
            estadoLabel: 'Vulnerable',
            familia: 'mamifero',
            imagen: '',
            emoji: '🐻'
        },
        {
            id: 3,
            nombre: 'Jaguar',
            nombreCientifico: 'Panthera onca',
            estado: 'critico',
            estadoLabel: 'En peligro crítico',
            familia: 'mamifero',
            imagen: '',
            emoji: '🐆'
        }
    ];

    seleccionarImagen(evento: Event): void {
        const input = evento.target as HTMLInputElement;
        const archivo = input.files?.[0];

        if (!archivo) {
            return;
        }

        const lector = new FileReader();

        lector.onload = () => {
            this.imagen.set(String(lector.result));
            this.sugerencias.set([]);
            this.mensaje.set('');
        };

        lector.readAsDataURL(archivo);
    }

    analizar(): void {
        if (!this.imagen()) {
            this.mensaje.set('Selecciona una imagen primero.');
            return;
        }

        this.sugerencias.set([
            { especie: this.especies[0], confianza: 86 },
            { especie: this.especies[1], confianza: 72 },
            { especie: this.especies[2], confianza: 61 }
        ]);

        this.mensaje.set(
            'Resultado simulado: esta pantalla todavía no usa una IA real.'
        );
    }
}
import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatSelect, MatOption} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import * as L from 'leaflet';
import {MapaAvistamiento} from '../../models/mapa-avistamiento';
import {Coordenada} from '../../models/coordenada';
import {MapaService} from '../../servicios/mapa.service';
import {IdiomaService} from '../../servicios/idioma.service';

// Tamaño de cada celda de la capa de calor, en grados (0.1 grados son unos 11 km)
const TAMANO_CELDA = 0.1;

@Component({
    selector: 'app-mapa',
    imports: [ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatSlideToggle],
    templateUrl: './mapa.component.html',
    styleUrl: './mapa.component.css'
})
export class MapaComponent {
    lista: MapaAvistamiento[] = [];
    estados: string[] = [];
    error: string = '';
    mapa!: L.Map;
    marcadores: L.LayerGroup = L.layerGroup();
    capaCalor: L.LayerGroup = L.layerGroup();
    capaUbicacion: L.LayerGroup = L.layerGroup();
    calorActivo: boolean = false;
    buscandoUbicacion: boolean = false;
    filtroForm: FormGroup;
    fb: FormBuilder = inject(FormBuilder);
    mapaService: MapaService = inject(MapaService);
    idioma: IdiomaService = inject(IdiomaService);

    constructor() {
        this.filtroForm = this.fb.group({
            estado: [''],
        });
    }

    ngAfterViewInit() {
        // Mapa de OpenStreetMap centrado en Perú. Leaflet ya trae los botones de acercar y alejar (HU-16)
        this.mapa = L.map('mapa').setView([-9.19, -75.01], 5);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(this.mapa);
        this.marcadores.addTo(this.mapa);
        this.capaUbicacion.addTo(this.mapa);
        this.mapa.on('locationfound', (e: L.LocationEvent) => this.mostrarUbicacion(e));
        this.mapa.on('locationerror', () => {
            this.buscandoUbicacion = false;
            this.error = this.idioma.t('mapa.sinUbicacion');
        });
        this.cargarMapa('');
        this.filtroForm.get('estado')?.valueChanges.subscribe(estado => this.cargarMapa(estado));
    }

    ngOnDestroy() {
        this.mapa?.remove();
    }

    // HU-16: centra el mapa en la ubicación actual del usuario
    irAMiUbicacion() {
        this.error = '';
        this.buscandoUbicacion = true;
        this.mapa.locate({setView: true, maxZoom: 15});
    }

    // HU-15: muestra u oculta la capa de calor
    cambiarCalor(activo: boolean) {
        this.calorActivo = activo;
        if (!activo) {
            this.capaCalor.remove();
            return;
        }
        this.mapaService.densidad().subscribe({
            next: data => {
                this.dibujarCalor(data);
                this.capaCalor.addTo(this.mapa);
            },
            error: () => {
                this.calorActivo = false;
                this.error = this.idioma.t('mapa.sinDensidad');
            }
        });
    }

    private cargarMapa(estado: string) {
        this.mapaService.list(estado).subscribe({
            next: data => {
                this.lista = data;
                if (estado === '') {
                    this.estados = [...new Set(data.map(a => a.estadoConservacion))];
                }
                this.dibujar();
            },
            error: () => {
                this.error = 'No se pudo cargar el mapa. Intenta más tarde.';
            }
        });
    }

    private dibujar() {
        this.marcadores.clearLayers();
        this.lista.forEach(a => {
            L.circleMarker([a.latitud, a.longitud], {radius: 8})
                .bindPopup('<strong>' + a.nombreComun + '</strong><br>' + a.estadoConservacion)
                .addTo(this.marcadores);
        });
    }

    // Agrupa los puntos en celdas y pinta cada celda según cuántos avistamientos tiene
    private dibujarCalor(coordenadas: Coordenada[]) {
        this.capaCalor.clearLayers();
        const celdas = new Map<string, {latitud: number, longitud: number, total: number}>();
        coordenadas.forEach(c => {
            const latitud = Number(c.latitud);
            const longitud = Number(c.longitud);
            const clave = Math.round(latitud / TAMANO_CELDA) + ':' + Math.round(longitud / TAMANO_CELDA);
            const celda = celdas.get(clave);
            if (celda) {
                celda.latitud += latitud;
                celda.longitud += longitud;
                celda.total++;
            } else {
                celdas.set(clave, {latitud: latitud, longitud: longitud, total: 1});
            }
        });
        const maximo = Math.max(1, ...[...celdas.values()].map(c => c.total));
        celdas.forEach(c => {
            const intensidad = c.total / maximo;
            L.circle([c.latitud / c.total, c.longitud / c.total], {
                radius: 4000 + 8000 * intensidad,
                stroke: false,
                fillColor: this.colorCalor(intensidad),
                fillOpacity: 0.35 + 0.35 * intensidad,
                interactive: false
            }).addTo(this.capaCalor);
        });
    }

    // De amarillo (pocos avistamientos) a rojo (muchos)
    private colorCalor(intensidad: number): string {
        if (intensidad > 0.66) return '#d7301f';
        if (intensidad > 0.33) return '#fc8d59';
        return '#fdcc8a';
    }

    private mostrarUbicacion(e: L.LocationEvent) {
        this.buscandoUbicacion = false;
        this.capaUbicacion.clearLayers();
        L.circle(e.latlng, {radius: e.accuracy, color: '#05366A', weight: 1, fillOpacity: 0.1})
            .addTo(this.capaUbicacion);
        L.circleMarker(e.latlng, {radius: 7, color: '#ffffff', weight: 2, fillColor: '#05366A', fillOpacity: 1})
            .bindPopup(this.idioma.t('mapa.tuUbicacion'))
            .addTo(this.capaUbicacion)
            .openPopup();
    }
}

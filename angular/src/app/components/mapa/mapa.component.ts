import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatSelect, MatOption} from '@angular/material/select';
import * as L from 'leaflet';
import {MapaAvistamiento} from '../../models/mapa-avistamiento';
import {MapaService} from '../../servicios/mapa.service';

@Component({
    selector: 'app-mapa',
    imports: [ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption],
    templateUrl: './mapa.component.html',
    styleUrl: './mapa.component.css'
})
export class MapaComponent {
    lista: MapaAvistamiento[] = [];
    estados: string[] = [];
    error: string = '';
    mapa!: L.Map;
    marcadores: L.LayerGroup = L.layerGroup();
    filtroForm: FormGroup;
    fb: FormBuilder = inject(FormBuilder);
    mapaService: MapaService = inject(MapaService);

    constructor() {
        this.filtroForm = this.fb.group({
            estado: [''],
        });
    }

    ngAfterViewInit() {
        // Mapa de OpenStreetMap centrado en Perú
        this.mapa = L.map('mapa').setView([-9.19, -75.01], 5);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(this.mapa);
        this.marcadores.addTo(this.mapa);
        this.cargarMapa('');
        this.filtroForm.get('estado')?.valueChanges.subscribe(estado => this.cargarMapa(estado));
    }

    ngOnDestroy() {
        this.mapa.remove();
    }

    private cargarMapa(estado: string) {
        this.mapaService.list(estado).subscribe({
            next: data => {
                console.log('Avistamientos del mapa:', data);
                this.lista = data;
                if (estado === '') {
                    this.estados = [...new Set(data.map(a => a.estadoConservacion))];
                }
                this.dibujar();
            },
            error: err => {
                console.log('Error al cargar el mapa:', err.status);
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
}
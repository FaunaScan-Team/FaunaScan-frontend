import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatSelect, MatOption} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {Especie} from '../../models/especie';
import {EspecieService} from '../../servicios/especie.service';
import {IdiomaService} from '../../servicios/idioma.service';

@Component({
    selector: 'app-catalogo',
    imports: [ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatButton],
    templateUrl: './catalogo.html',
    styleUrl: './catalogo.css',
})
export class Catalogo {
    especies: Especie[] = [];
    especiesFiltradas: Especie[] = [];
    categorias: string[] = [];
    cargando: boolean = true;
    error: string = '';
    filtrosForm: FormGroup;
    fb: FormBuilder = inject(FormBuilder);
    especieService: EspecieService = inject(EspecieService);
    idioma: IdiomaService = inject(IdiomaService);

    constructor() {
        this.filtrosForm = this.fb.group({
            texto: [''],
            categoria: [''],
        });
    }

    ngOnInit() {
        this.cargarLista();
        this.filtrosForm.valueChanges.subscribe(() => this.filtrar());
    }

    private cargarLista() {
        this.especieService.list().subscribe({
            next: data => {
                console.log('Especies traídas por API:', data);
                this.especies = data;
                this.categorias = [...new Set(data.map(e => e.nombreCategoria))];
                this.cargando = false;
                this.filtrar();
            },
            error: err => {
                console.log('Error al cargar especies:', err.status);
                this.cargando = false;
                this.error = 'No se pudo cargar el catálogo. Intenta más tarde.';
            }
        });
    }

    filtrar() {
        const texto = this.normalizar(this.filtrosForm.value.texto);
        const categoria = this.filtrosForm.value.categoria;
        this.especiesFiltradas = this.especies.filter(e =>
            this.normalizar(e.nombreComun + ' ' + e.nombreCientifico).includes(texto) &&
            (categoria === '' || e.nombreCategoria === categoria)
        );
    }

    limpiar() {
        this.filtrosForm.setValue({texto: '', categoria: ''});
    }


    claseEstado(categoria: string): string {
        const nombre = this.normalizar(categoria);
        if (nombre.includes('critic')) return 'critico';
        if (nombre.includes('peligro')) return 'critico';
        if (nombre.includes('vulnerable')) return 'vulnerable';
        if (nombre.includes('casi')) return 'casi';
        return 'menor';
    }

    imagen(especie: Especie): string {
        return especie.imagenReferencia ? especie.imagenReferencia : 'assets/images/LogoFaunaScan.png';
    }

    private normalizar(texto: string): string {
        return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }
}
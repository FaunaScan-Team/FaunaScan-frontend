import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {debounceTime} from 'rxjs';
import {Especie} from '../../models/especie';
import {EspecieService} from '../../servicios/especie.service';
import {IdiomaService} from '../../servicios/idioma.service';

@Component({
    selector: 'app-seleccionar-especie',
    imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton],
    templateUrl: './seleccionar-especie.component.html',
    styleUrl: './seleccionar-especie.component.css',
})
export class SeleccionarEspecieComponent {
    especies: Especie[] = [];
    seleccionada: Especie | null = null;
    busquedaForm: FormGroup;
    fb: FormBuilder = inject(FormBuilder);
    especieService: EspecieService = inject(EspecieService);
    router: Router = inject(Router);
    idioma: IdiomaService = inject(IdiomaService);

    constructor() {
        this.busquedaForm = this.fb.group({
            texto: [''],
        });
    }

    ngOnInit() {
        this.cargarTodas();
        // HU-07: busca en el backend mientras el usuario escribe
        this.busquedaForm.get('texto')?.valueChanges.pipe(debounceTime(300)).subscribe(texto => {
            if (texto && texto.trim().length >= 2) {
                this.buscar(texto.trim());
            } else {
                this.cargarTodas();
            }
        });
    }

    private cargarTodas() {
        this.especieService.list().subscribe({
            next: data => this.especies = data,
            error: err => console.log('Error al cargar especies:', err.status)
        });
    }

    private buscar(texto: string) {
        this.especieService.buscar(texto).subscribe({
            next: data => {
                console.log('Resultados de búsqueda:', data);
                this.especies = data;
            },
            error: err => console.log('Error en la búsqueda:', err.status)
        });
    }

    seleccionar(especie: Especie) {
        this.seleccionada = especie;
    }

    // Lleva la especie al formulario de registro de avistamiento
    usarEspecie() {
        if (this.seleccionada) {
            this.router.navigate(['/registrar'], {queryParams: {idEspecie: this.seleccionada.idEspecie}});
        }
    }

    imagen(especie: Especie): string {
        return especie.imagenReferencia ? especie.imagenReferencia : 'assets/images/LogoFaunaScan.png';
    }
}
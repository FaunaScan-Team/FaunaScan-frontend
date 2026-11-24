export class SugerenciaEspecie {
    idEspecie: number = 0;
    nombreComun: string = '';
    nombreCientifico: string = '';
    confianza: number = 0;
}

export class ResultadoIdentificacion {
    estado: string = '';
    confianzaMaxima: number = 0;
    umbralConfianza: number = 0;
    especieSugerida: SugerenciaEspecie | null = null;
    sugerencias: SugerenciaEspecie[] = [];
    mensaje: string = '';
    modelo: string = '';
    tiempoProcesamientoMs: number = 0;
}
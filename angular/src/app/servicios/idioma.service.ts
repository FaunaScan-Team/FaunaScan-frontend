import {Service} from '@angular/core';

@Service()
export class IdiomaService {
    idioma: string = 'es';
    textos: any = {
        es: {
            'catalogo.eyebrow': 'BIODIVERSIDAD DEL PERÚ',
            'catalogo.titulo': 'Catálogo de especies',
            'catalogo.subtitulo': 'Conoce nuestra fauna y selecciona una especie para ver su información.',
            'catalogo.buscar': 'Buscar especie',
            'catalogo.placeholder': 'Nombre común o científico',
            'catalogo.estado': 'Estado de conservación',
            'catalogo.todos': 'Todos los estados',
            'catalogo.limpiar': 'Limpiar filtros',
            'catalogo.cargando': 'Cargando especies…',
            'catalogo.de': 'de',
            'catalogo.especies': 'especies',
            'catalogo.verDetalle': 'Ver detalle →',
            'catalogo.verDetalleDe': 'Ver detalle de',
            'catalogo.vacioTitulo': 'No se encontraron especies',
            'catalogo.vacioTexto': 'Prueba otro nombre o cambia el estado de conservación.',

            'detalle.volver': '← Volver al catálogo',
            'detalle.eyebrow': 'FICHA DE ESPECIE',
            'detalle.info': 'Información de la especie',
            'detalle.nombreComun': 'Nombre común',
            'detalle.nombreCientifico': 'Nombre científico',
            'detalle.familia': 'Familia',
            'detalle.estado': 'Estado de conservación',
            'detalle.guia': 'Guía de identificación',
            'detalle.sinPistas': 'Esta especie todavía no tiene pistas registradas.',
            'detalle.registrar': 'Registrar un avistamiento de esta especie',
            'detalle.noEncontrada': 'Especie no encontrada',
            'detalle.noEncontradaTexto': 'El identificador de la URL no corresponde a ninguna especie del catálogo.',
            'detalle.explorar': 'Explorar catálogo',

            'seleccionar.eyebrow': 'REGISTRO DE AVISTAMIENTO',
            'seleccionar.titulo': 'Seleccionar especie',
            'seleccionar.subtitulo': 'Busca y selecciona la especie observada.',
            'seleccionar.buscar': 'Buscar especie',
            'seleccionar.placeholder': 'Nombre común o científico (mínimo 2 letras)',
            'seleccionar.encontradas': 'especies encontradas',
            'seleccionar.vacio': 'No se encontraron especies con esa búsqueda.',
            'seleccionar.seleccionada': 'Especie seleccionada',
            'seleccionar.usar': 'Usar esta especie',

            'mapa.eyebrow': 'AVISTAMIENTOS',
            'mapa.titulo': 'Mapa de avistamientos',
            'mapa.estado': 'Estado de conservación',
            'mapa.todos': 'Todos los estados',
            'mapa.vacio': 'No hay avistamientos con ese estado.',

            'ia.eyebrow': 'IDENTIFICACIÓN CON IA',
            'ia.titulo': 'Identificar especie con IA',
            'ia.subtitulo': 'Sube una imagen para recibir sugerencias de especies.',
            'ia.seleccionarImagen': 'Seleccionar imagen',
            'ia.vistaPrevia': 'Vista previa de la imagen seleccionada',
            'ia.analizar': 'Analizar imagen',
            'ia.analizando': 'Analizando...',
            'ia.sugeridas': 'Especies sugeridas',
            'ia.modelo': 'Modelo',
            'ia.confianza': 'Confianza',
            'ia.usar': 'Usar esta especie',
            'ia.sinCoincidencias': 'La IA no encontró coincidencias.',

            'pie.privacidad': 'Política de privacidad',
            'pie.terminos': 'Términos y condiciones',
        },
        en: {
            'catalogo.eyebrow': "PERU'S BIODIVERSITY",
            'catalogo.titulo': 'Species catalog',
            'catalogo.subtitulo': 'Discover our wildlife and select a species to see its information.',
            'catalogo.buscar': 'Search species',
            'catalogo.placeholder': 'Common or scientific name',
            'catalogo.estado': 'Conservation status',
            'catalogo.todos': 'All statuses',
            'catalogo.limpiar': 'Clear filters',
            'catalogo.cargando': 'Loading species…',
            'catalogo.de': 'of',
            'catalogo.especies': 'species',
            'catalogo.verDetalle': 'View details →',
            'catalogo.verDetalleDe': 'View details of',
            'catalogo.vacioTitulo': 'No species found',
            'catalogo.vacioTexto': 'Try another name or change the conservation status.',

            'detalle.volver': '← Back to catalog',
            'detalle.eyebrow': 'SPECIES SHEET',
            'detalle.info': 'Species information',
            'detalle.nombreComun': 'Common name',
            'detalle.nombreCientifico': 'Scientific name',
            'detalle.familia': 'Family',
            'detalle.estado': 'Conservation status',
            'detalle.guia': 'Identification guide',
            'detalle.sinPistas': 'This species has no identification clues yet.',
            'detalle.registrar': 'Register a sighting of this species',
            'detalle.noEncontrada': 'Species not found',
            'detalle.noEncontradaTexto': 'The URL identifier does not match any species in the catalog.',
            'detalle.explorar': 'Explore catalog',

            'seleccionar.eyebrow': 'SIGHTING REGISTRATION',
            'seleccionar.titulo': 'Select species',
            'seleccionar.subtitulo': 'Search and select the observed species.',
            'seleccionar.buscar': 'Search species',
            'seleccionar.placeholder': 'Common or scientific name (minimum 2 letters)',
            'seleccionar.encontradas': 'species found',
            'seleccionar.vacio': 'No species found for that search.',
            'seleccionar.seleccionada': 'Selected species',
            'seleccionar.usar': 'Use this species',

            'mapa.eyebrow': 'SIGHTINGS',
            'mapa.titulo': 'Sightings map',
            'mapa.estado': 'Conservation status',
            'mapa.todos': 'All statuses',
            'mapa.vacio': 'There are no sightings with that status.',

            'ia.eyebrow': 'AI IDENTIFICATION',
            'ia.titulo': 'Identify species with AI',
            'ia.subtitulo': 'Upload an image to receive species suggestions.',
            'ia.seleccionarImagen': 'Select image',
            'ia.vistaPrevia': 'Preview of the selected image',
            'ia.analizar': 'Analyze image',
            'ia.analizando': 'Analyzing...',
            'ia.sugeridas': 'Suggested species',
            'ia.modelo': 'Model',
            'ia.confianza': 'Confidence',
            'ia.usar': 'Use this species',
            'ia.sinCoincidencias': 'The AI found no matches.',

            'pie.privacidad': 'Privacy policy',
            'pie.terminos': 'Terms and conditions',
        }
    };

    constructor() {
        const guardado = localStorage.getItem('idioma');
        if (guardado) {
            this.idioma = guardado;
        }
        document.documentElement.lang = this.idioma;
    }

    cambiar(idioma: string) {
        this.idioma = idioma;
        localStorage.setItem('idioma', idioma);
        document.documentElement.lang = idioma;
    }

    t(clave: string): string {
        return this.textos[this.idioma][clave] ?? clave;
    }
}
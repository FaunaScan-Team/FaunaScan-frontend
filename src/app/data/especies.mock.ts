import { Especie } from '../models/especie';

// Datos de demostración trasladados del catálogo original; estados sin validación científica.
export const ESPECIES: readonly Especie[] = [
  {
    "id": 1,
    "nombre": "Cóndor andino",
    "nombreCientifico": "Vultur gryphus",
    "estado": "vulnerable",
    "estadoLabel": "Vulnerable",
    "familia": "ave",
    "imagen": "assets/images/Condor.png",
    "emoji": "🦅"
  },
  {
    "id": 2,
    "nombre": "Oso de anteojos",
    "nombreCientifico": "Tremarctos ornatus",
    "estado": "vulnerable",
    "estadoLabel": "Vulnerable",
    "familia": "mamifero",
    "imagen": "assets/images/OsoDeAnteojos.png",
    "emoji": "🐻"
  },
  {
    "id": 3,
    "nombre": "Jaguar",
    "nombreCientifico": "Panthera onca",
    "estado": "critico",
    "estadoLabel": "En peligro crítico",
    "familia": "mamifero",
    "imagen": "assets/images/Jaguar.png",
    "emoji": "🐆"
  },
  {
    "id": 4,
    "nombre": "Guacamayo rojo",
    "nombreCientifico": "Ara macao",
    "estado": "vulnerable",
    "estadoLabel": "Vulnerable",
    "familia": "ave",
    "imagen": "assets/images/Guacamayo.png",
    "emoji": "🦜"
  },
  {
    "id": 5,
    "nombre": "Tapir amazónico",
    "nombreCientifico": "Tapirus terrestris",
    "estado": "vulnerable",
    "estadoLabel": "Vulnerable",
    "familia": "mamifero",
    "imagen": "assets/images/Tapir.png",
    "emoji": "🦌"
  },
  {
    "id": 6,
    "nombre": "Delfín rosado",
    "nombreCientifico": "Inia geoffrensis",
    "estado": "critico",
    "estadoLabel": "En peligro crítico",
    "familia": "mamifero",
    "imagen": "assets/images/Delfin.png",
    "emoji": "🐬"
  },
  {
    "id": 7,
    "nombre": "Anaconda verde",
    "nombreCientifico": "Eunectes murinus",
    "estado": "menor",
    "estadoLabel": "Preocupación menor",
    "familia": "reptil",
    "imagen": "assets/images/Anaconda.png",
    "emoji": "🐍"
  },
  {
    "id": 8,
    "nombre": "Llama andina",
    "nombreCientifico": "Lama glama",
    "estado": "menor",
    "estadoLabel": "Preocupación menor",
    "familia": "mamifero",
    "imagen": "assets/images/Llama.png",
    "emoji": "🦙"
  },
  {
    "id": 9,
    "nombre": "Lobo marino",
    "nombreCientifico": "Otaria flavescens",
    "estado": "casi",
    "estadoLabel": "Casi amenazada",
    "familia": "mamifero",
    "imagen": "assets/images/LoboMarino.png",
    "emoji": "🦭"
  },
  {
    "id": 10,
    "nombre": "Mono choro",
    "nombreCientifico": "Lagothrix lagotricha",
    "estado": "critico",
    "estadoLabel": "En peligro crítico",
    "familia": "mamifero",
    "imagen": "assets/images/MonoChoro.png",
    "emoji": "🐒"
  },
  {
    "id": 11,
    "nombre": "Puma",
    "nombreCientifico": "Puma concolor",
    "estado": "menor",
    "estadoLabel": "Preocupación menor",
    "familia": "mamifero",
    "imagen": "assets/images/Puma.png",
    "emoji": "🐈"
  },
  {
    "id": 12,
    "nombre": "Manatí amazónico",
    "nombreCientifico": "Trichechus inunguis",
    "estado": "critico",
    "estadoLabel": "En peligro crítico",
    "familia": "mamifero",
    "imagen": "assets/images/Manati.png",
    "emoji": "🐄"
  }
];

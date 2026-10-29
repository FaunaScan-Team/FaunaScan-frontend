# FaunaScan Angular — avance de Catherine

Base común, navegación e inicio migrado desde la landing existente. Las demás rutas muestran un aviso temporal hasta integrar el trabajo de cada responsable.

## 1. Abrir la carpeta correcta

Abre `angular/` en IntelliJ IDEA o VS Code. Esta carpeta contiene `package.json` y `angular.json`.
La carpeta `public/` de la raíz del repositorio conserva la versión estática. `angular/public/` contiene las cinco imágenes reutilizadas por este avance.

## 2. Instalar y ejecutar

Requisito: Node compatible con `engines` en `package.json` (por ejemplo, Node 24.18.1 usado para verificar este avance).

Desde una terminal dentro de `angular/`:

```sh
npm ci
npm start
```

Abre http://localhost:4200. Si ese puerto ya está ocupado, usa `npm start -- --port 4201` y abre ese puerto.
Para detener el servidor: Ctrl+C. No hace falta instalar Angular CLI globalmente.

## 3. Comprobar cómo arranca

Lee en este orden:

1. `src/index.html`: contiene `<app-root>`, el punto donde Angular coloca la aplicación.
2. `src/main.ts`: `bootstrapApplication(App, appConfig)` inicia el componente raíz y su configuración.
3. `src/app/app.config.ts`: `provideRouter(routes)` registra las rutas. El desplazamiento restaura la posición y permite enlaces a secciones.
4. `src/app/app.ts`: importa los componentes que usa su HTML: menú, pie de página y `RouterOutlet`.
5. `src/app/app.html`: mantiene el menú y el pie de página; la pantalla activa aparece en `<router-outlet />`.

Comprobación: al cambiar entre Inicio y Catálogo, el menú permanece y cambia el contenido central.

## 4. Comprobar el menú

Archivos: `src/app/components/menu/menu.ts`, `menu.html` y `menu.css`.

- `enlaces` es una propiedad TypeScript con las rutas y los textos.
- `@for` repite un enlace por cada elemento; `track enlace.ruta` identifica cada enlace.
- `[routerLink]` entrega la ruta a Angular. No abre otro archivo HTML.
- `routerLinkActive` marca la opción activa. Inicio usa coincidencia exacta para que no se marque en todas las rutas.
- `abierto = signal(false)` guarda el estado del menú móvil.
- `abierto()` lee el estado; `.set(false)` lo cierra; `.update(...)` alterna su valor.
- `(click)` llama a un método del componente; `[class.open]` agrega o quita una clase CSS.
- `[attr.aria-expanded]` comunica el estado a las tecnologías de asistencia.
- `HostListener` cierra el menú al presionar Escape. Es un pequeño complemento de accesibilidad, adicional al ejemplo de clase.

Comprobación: reduce la ventana a tamaño de celular. Abre el menú, elige Catálogo y vuelve a abrirlo. Presiona Escape y verifica que se cierre.

## 5. Comprobar las rutas

Archivo: `src/app/app.routes.ts`. `path` se escribe sin la barra inicial; el enlace sí puede comenzar con `/`.

| URL | Responsable del componente definitivo | Estado de este avance |
| --- | --- | --- |
| `/` | Catherine | Inicio migrado |
| `/catalogo` | Estefany | Aviso temporal |
| `/catalogo/1` | Estefany | Aviso temporal con ID |
| `/registrar` | Sebastián Añamauro | Aviso temporal |
| `/observaciones` | Sebastián Añamauro | Aviso temporal |
| `/historial` | Sebastián Suarez | Aviso temporal |
| `/avistamientos/1` | Sebastián Suarez | Aviso temporal con ID |
| `/acceso-restringido` | Nohelia | Aviso temporal |

`:id` es un parámetro dinámico. Prueba `/catalogo/23`: debe mostrar el identificador 23. La ruta `**`, al final, devuelve al inicio cuando la URL no coincide.

`PaginaPendiente` es un único componente de apoyo de Catherine. Lee el título y responsable desde `data` y el ID mediante `ActivatedRoute`. No implementa catálogo, registro, historial ni un control real de permisos. Tener una ruta llamada acceso restringido no protege una aplicación.

## 6. Comprobar el inicio y los estilos

Archivos: `components/inicio/inicio.html`, `.ts` y `.css`.

La landing se separó del documento original: no necesita repetir `<html>`, `<head>` ni `<body>`. Menú y pie de página son componentes independientes.
Las llamadas a `register.html` y `login.html` se cambiaron por acciones hacia las rutas del avance: explorar especies y registrar avistamiento. La autenticación queda para otra etapa.

`src/styles.css` conserva la hoja de estilos de la landing como base global, con su paleta, tipografías y reglas responsive. Los CSS de componentes contienen ajustes locales. Las fuentes aún se cargan desde Google Fonts, como en el original; coordinar la integración del trabajo de tipografías del equipo antes de cambiarlo.

Las funciones futuras, como sincronización offline e identificación con IA, se describen como previstas: este avance no las ejecuta.

Comprobación: deben aparecer el logo, los guacamayos y las imágenes de las secciones. Desde el pie, Funcionalidades debe llevar a la sección correspondiente del inicio.

## 7. Integrar a los compañeros

Comparte primero esta base mediante un Pull Request a `develop`. Cuando se integre, cada compañero actualiza su copia de `develop` y crea su rama de trabajo desde allí.
Así todos pueden ejecutar el mismo proyecto Angular y trabajar en sus carpetas sin esperar la implementación de las demás pantallas.

Cada integrante genera sus componentes desde `angular/`, por ejemplo:

```sh
npx ng g c components/catalogo --skip-tests
```

Después coordina con Catherine el cambio de su ruta: se reemplaza `component: PaginaPendiente` por el componente definitivo y se añade su importación. No hay que crear un segundo proyecto Angular ni reemplazar toda la base.

Añamauro y Suarez deben acordar juntos el modelo y servicio de avistamientos antes de conectarlos. Esta entrega no define esos contratos por ellos.

## 8. Revisión antes de subir

```sh
npm run build
```

Debe terminar sin errores. Después, prueba navegación, recarga de una ruta, enlaces del pie, menú móvil y consola del navegador.
Los avisos temporales son esperados hasta integrar las demás partes. No hay backend, JWT ni persistencia conectados en este avance.

La rama de Catherine es `feature/angular-base-inicio`. Revisa los cambios antes de hacer tus commits. Una separación posible es: base y arranque; menú y rutas; inicio y estilos; guía de comprobación. Cada commit debe corresponder a lo que revisaste y puedes explicar.

El flujo actual de GitHub Pages sigue publicando la carpeta estática de la raíz. Ver Angular localmente no significa que ya esté desplegado. Adaptar el despliegue requiere configurar el build y la ruta base de Pages en una siguiente tarea.

## Relación con Angular1 de clase

Se reutiliza el enfoque standalone de Angular 22.2.3, `bootstrapApplication`, configuración y rutas separadas, componentes con HTML/CSS/TypeScript, `RouterLink`, `RouterOutlet`, `signal` y `@for`. No se copia el servicio de calculadora porque la base y el inicio no lo necesitan.
Se mantiene TypeScript estricto y se añade título por ruta, enlace para saltar al contenido y cierre de menú con Escape como complementos técnicos.

## Diseño conservado

Se conservaron la estructura de secciones, imágenes, Poppins/Inter, verde principal `#002D1C`, fondo `#F8F9FA`, radios y breakpoints de la landing. El menú se adapta a las pantallas de este avance y conserva navegación móvil. Los recursos gráficos provienen de `public/assets/images/` del mismo repositorio.

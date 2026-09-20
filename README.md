# FaunaScan Perú

Plataforma web para el registro, identificación y monitoreo de avistamientos de fauna silvestre en el Perú.

**Sitio publicado:** https://faunateam.github.io/FaunaScan-frontend/

## Índice

* [Descripción](#descripción)
* [Segmentos de usuario](#segmentos-de-usuario)
* [Estado del proyecto](#estado-del-proyecto)
* [Funcionalidades implementadas](#funcionalidades-implementadas)
* [Tecnologías](#tecnologías)
* [Estructura del repositorio](#estructura-del-repositorio)
* [Ejecución local](#ejecución-local)
* [Despliegue](#despliegue)
* [Flujo de trabajo con ramas](#flujo-de-trabajo-con-ramas)
* [Equipo](#equipo)

## Descripción

FaunaScan Perú responde a las dificultades que enfrentan investigadores de fauna y voluntarios ambientales al registrar y monitorear especies silvestres durante su trabajo de campo. La falta de herramientas accesibles y centralizadas dificulta la recopilación de información confiable para la conservación de la biodiversidad.

La plataforma permite registrar avistamientos con fotografía, especie y ubicación, consultarlos en un mapa, generar reportes de monitoreo y someter los registros a validación de la comunidad científica.

## Segmentos de usuario

| Segmento | Perfil | Particularidades |
|---|---|---|
| **Investigador** | Científico con credencial académica o institucional verificada | Accede a validación de avistamientos, reportes institucionales y análisis de tendencias |
| **Voluntario** | Ciudadano sin formación técnica | Flujo de registro simplificado, panel con logros y resumen de su contribución |

Cada rol tiene su propio panel y el acceso a las pantallas restringidas se controla por rol.

## Estado del proyecto

> **En desarrollo.** Esta es una aplicación **100 % frontend estático**: todavía no existe backend ni base de datos.

Es importante ser preciso sobre qué funciona hoy y qué no:

* **Persistencia:** los datos se guardan en el `localStorage` del navegador. Viven únicamente en el equipo de cada usuario y se pierden al limpiar los datos del navegador. No hay servidor ni sincronización entre dispositivos.
* **Autenticación:** es de demostración. Las contraseñas se almacenan como hash SHA-256 en `localStorage`; esto **no** sustituye a un servidor de autenticación real y no debe considerarse seguro para producción.
* **Identificación por IA:** la pantalla de identificación es una **simulación de interfaz**. No hay modelo de visión por computadora ni servicio de inferencia conectado. La pantalla existe para validar el flujo de usuario, incluido el caso de baja confianza; la integración con un servicio real está pendiente.
* **Sin modo offline:** no hay service worker ni manifest, por lo que la aplicación requiere conexión para cargarse.
* **Backend previsto** para una etapa posterior del curso: Spring Boot + PostgreSQL, sobre el modelo de datos ya diseñado.

## Funcionalidades implementadas

* Registro de cuenta e inicio de sesión, con selección de rol.
* Control de acceso por sesión y por rol en las pantallas protegidas.
* Verificación de credencial de investigador, con validación de formato y tamaño del archivo.
* Registro de avistamientos: fotografía, selección de especie, observaciones y ubicación.
* Historial propio de avistamientos, con detalle, edición y eliminación.
* Mapa con marcadores individuales por avistamiento, mapa de calor y filtros.
* Validación comunitaria de avistamientos por parte de investigadores verificados.
* Reportes de monitoreo, resumen mensual, tendencias y resumen de contribución personal.
* Catálogo de especies con detalle y filtro por especialidad taxonómica.
* Notificaciones y configuración de preferencias.
* Paneles diferenciados para investigador y voluntario, con onboarding inicial.

Interfaz responsive (móvil, tablet y escritorio) construida mobile-first con Grid y Flexbox.

## Tecnologías

* **Frontend:** HTML5, CSS3 y JavaScript (ES6+) sin framework ni paso de build.
* **Mapas:** Leaflet 1.9.4 y leaflet.heat 0.2.0 vía CDN, con tiles de OpenStreetMap.
* **Despliegue:** GitHub Actions hacia GitHub Pages.
* **Diseño:** Figma (wireframes, mockups y prototipos).
* **Tipografía del style guide:** Poppins para títulos, Inter para cuerpo e interfaz.
* **Paleta:** `#002D1C` verde principal, `#ECFDF5` verde claro, `#F8F9FA` fondo, `#05366A` azul (contextos de investigador), `#F59E0B` ámbar (contextos de voluntario).

## Estructura del repositorio

```
public/                     Sitio estático publicado (29 páginas HTML)
  assets/
    scripts/                Lógica por página + módulos compartidos
      auth-guard.js         Guard de sesión y control de rol
      crypto-utils.js       Hash SHA-256 de contraseñas
      avistamientos-store.js  Acceso a los avistamientos en localStorage
      reportes-store.js     Acceso a los reportes en localStorage
    styles/                 Una hoja de estilos por página
    images/  icons/         Recursos gráficos
.github/workflows/deploy.yml  Publicación automática en GitHub Pages
```

## Ejecución local

El proyecto no necesita instalación ni dependencias. Basta servir la carpeta `public/`:

```bash
python -m http.server 8000 --directory public
```

Luego abre `http://localhost:8000`.

Conviene servirlo por HTTP en lugar de abrir los archivos con doble clic: con `file://` algunas rutas y el comportamiento de `localStorage` no funcionan igual.

## Despliegue

Cada push a `main` dispara el workflow `.github/workflows/deploy.yml`, que publica el contenido de `public/` en GitHub Pages.

## Flujo de trabajo con ramas

El repositorio sigue GitFlow:

* `main` — código publicado y estable.
* `develop` — rama de integración.
* `feature/*` — una rama por funcionalidad, que se integra a `develop` mediante Pull Request.

Las publicaciones se hacen mediante Pull Request de `develop` hacia `main`.

## Equipo

* Estefany Milagros Amaya Suni
* Sebastian Alonso Curay Rodriguez
* Carlos Antonio Geldres Cortez
* Elí Yahveh Maldonado Zamudio
* Yael Sarai Ojeda Rojas
* Anderson Misael Yovera Chinchay

Proyecto desarrollado para el curso **1ASI0705 – Arquitectura de Aplicaciones Web**, Universidad Peruana de Ciencias Aplicadas (UPC).

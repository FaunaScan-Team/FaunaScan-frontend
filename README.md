# FaunaScan Perú

Plataforma web para el registro, identificación y monitoreo de avistamientos de fauna silvestre en el Perú.

**Landing publicado:** https://faunascan-team.github.io/FaunaScan-frontend/

## Índice

* [Descripción](#descripción)
* [Segmentos de usuario](#segmentos-de-usuario)
* [Arquitectura](#arquitectura)
* [Estado del proyecto](#estado-del-proyecto)
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

## Arquitectura

* **Landing page** (`public/`): HTML5, CSS3 y JavaScript, publicado en GitHub Pages.
* **Aplicación web** (`angular/`): Angular 22 con Angular Material. Consume la API REST del repositorio [FaunaScan---Backend](https://github.com/FaunaScan-Team/FaunaScan---Backend).
* **API REST**: Spring Boot 4, Spring Security con JWT y PostgreSQL, desplegada con Docker en AWS EC2.

## Estado del proyecto

> **En desarrollo.** La aplicación Angular se está conectando a la API módulo por módulo.

* **Autenticación:** el login y el registro usan `POST /api/auth/login` y `POST /api/auth/registrar`. El token JWT se guarda al iniciar sesión y un interceptor lo envía en el header `Authorization` de cada petición a la API.
* **Control de acceso:** las rutas privadas usan guards de sesión y de rol. Si la API responde 401 se vuelve al login; si responde 403 se muestra la pantalla de acceso restringido.
* **Resto de módulos:** catálogo, registro, historial, mapa, validación, notificaciones y reportes están en Angular y pasan de datos locales a la API en las siguientes entregas.

## Tecnologías

* **Aplicación:** Angular 22, TypeScript, Angular Material, RxJS y formularios reactivos.
* **Landing:** HTML5, CSS3 y JavaScript.
* **API:** Spring Boot 4, Spring Security, JWT, Spring Data JPA y PostgreSQL.
* **Despliegue:** GitHub Pages (landing) y Docker en AWS EC2 (API y aplicación).
* **Diseño:** Figma (wireframes, mockups y prototipos).
* **Tipografía del style guide:** Poppins para títulos, Inter para cuerpo e interfaz.
* **Paleta:** `#002D1C` verde principal, `#ECFDF5` verde claro, `#F8F9FA` fondo, `#05366A` azul (contextos de investigador), `#F59E0B` ámbar (contextos de voluntario).

## Estructura del repositorio

```
angular/                      Aplicación web en Angular
  src/app/components/         Un componente por pantalla
  src/app/servicios/          Servicios HTTP (AuthService, interceptor, ...)
  src/app/guards/             Guards de sesión y de rol
  src/app/models/             Modelos con los mismos campos que los DTO del backend
  src/environments/           URL de la API (apiUrl)
public/                       Landing page estática
.github/workflows/deploy.yml  Publicación automática en GitHub Pages
```

## Ejecución local

1. Levantar la API (ver el README del backend) con `FRONTEND_URL=http://localhost:4200`.
2. Instalar y levantar la aplicación:

```bash
cd angular
npm install
npm start
```

3. Abrir `http://localhost:4200`. La URL de la API se configura en `angular/src/environments/environment.ts` (`http://localhost:8080/api`).

## Despliegue

* **Landing:** cada push a `main` ejecuta `.github/workflows/deploy.yml`, que publica `public/` en GitHub Pages.
* **Aplicación Angular:** se construye una imagen Docker con nginx y se ejecuta en la misma instancia EC2 que la API, en el puerto 4200.

## Flujo de trabajo con ramas

El repositorio sigue GitFlow:

* `main` — código publicado y estable.
* `develop` — rama de integración.
* `feature/*` — una rama por funcionalidad, que se integra a `develop` mediante Pull Request.

Las publicaciones se hacen mediante Pull Request de `develop` hacia `main`.

## Equipo

* Aguilar Untiveros, Nohelia Socorro
* Amaya Suni, Estefany Milagros
* Añamuro Hilasaca, Sebastian Isaac
* Suarez Simeon, Sebastián Moises
* Villar Aguilar, Rosmery Catherine

Proyecto desarrollado para el curso **1ASI0705 – Arquitectura de Aplicaciones Web**, Universidad Peruana de Ciencias Aplicadas (UPC).

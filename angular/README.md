# FaunaScan · Aplicación Angular

Aplicación web de FaunaScan Perú. Consume la API REST de FaunaScan---Backend.

## Requisitos

* Node.js 22 o superior
* La API levantada en `http://localhost:8080` (o la URL configurada en `src/environments/environment.ts`)

## Instalar y ejecutar

```bash
npm install
npm start
```

La aplicación queda en `http://localhost:4200`.

Para compilar:

```bash
npx ng build --configuration development
```

## Estructura

```
src/app/
  components/      Un componente por pantalla (archivos .ts, .html y .css)
  servicios/       Servicios con HttpClient y el interceptor del token
  guards/          authGuard (sesión iniciada) e investigadorGuard (rol)
  models/          Clases con los mismos campos que los DTO del backend
  app.routes.ts    Rutas principales
src/environments/  apiUrl de la API
src/material-theme.scss  Tema de Angular Material
```

## Convenciones

* Cada servicio usa `inject(HttpClient)` y `environment.apiUrl`, y devuelve `Observable`.
* Los componentes se suscriben con `subscribe({ next, error })`.
* Los formularios son reactivos (`FormBuilder` y `Validators`) con componentes de Angular Material.
* El token no se agrega a mano: lo pone `authInterceptor` en cada petición a la API.
* Las rutas privadas usan `canActivate: [authGuard]`; las de investigador, `[investigadorGuard]`.
* Una rama `feature/...` por funcionalidad, desde `develop`, y un Pull Request hacia `develop`.

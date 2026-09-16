/**
 * auth-guard.js
 * FaunaScan Perú — Guard de sesión compartido.
 *
 * Se carga SIN "defer" y ANTES que cualquier otro script, para bloquear
 * el renderizado de una página protegida si no hay sesión activa, en vez
 * de dejarla visible unos milisegundos antes de redirigir.
 *
 * Cubre el hallazgo de la auditoría: ninguna pantalla (dashboard, perfil,
 * historial, verificar, etc.) validaba sesión antes de esta corrección —
 * eran accesibles directamente por URL sin haber iniciado sesión.
 *
 * Nota de alcance (cliente-only, sin backend real todavía): esto NO
 * reemplaza una verificación de sesión en servidor. Es la mejor
 * protección posible dentro de la arquitectura actual (localStorage +
 * páginas estáticas) mientras no exista el backend con JWT (ver US02
 * extendida). Cuando exista el API real, este guard debe reemplazarse
 * por una verificación del token contra el backend en cada navegación.
 */
(function () {
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('faunaUser') || 'null');
    } catch (e) {
      return null;
    }
  }

  var user = getUser();

  if (!user) {
    window.location.replace('login.html');
    // Detiene la ejecución del resto de scripts de la página en la
    // mayoría de navegadores modernos al reemplazar la ubicación,
    // pero además lanzamos para no continuar evaluando el resto del
    // documento mientras la redirección ocurre.
    throw new Error('FaunaScan: sesión no encontrada, redirigiendo a login.');
  }

  // Expone el usuario actual para que otros scripts de la página no
  // tengan que volver a leer/parsear localStorage.
  window.FaunaAuth = {
    user: user,
    /**
     * Restringe la página al rol indicado. Si el usuario no cumple,
     * redirige a la pantalla de acceso restringido (US52).
     * @param {string} rol - 'INVESTIGADOR' o 'VOLUNTARIO'
     * @param {boolean} requiereCredencialVerificada
     */
    requireRole: function (rol, requiereCredencialVerificada) {
      var cumpleRol = user.rol === rol;
      var cumpleCredencial = !requiereCredencialVerificada || user.credencialVerificada === true;
      if (!cumpleRol || !cumpleCredencial) {
        window.location.replace('acceso-restringido.html');
        throw new Error('FaunaScan: acceso restringido por rol.');
      }
    }
  };
})();

/**
 * crypto-utils.js
 * FaunaScan Perú — utilidad de hash de contraseña.
 *
 * IMPORTANTE (léelo antes de reutilizar esto en otra parte):
 * Esto usa SHA-256 vía la Web Crypto API nativa del navegador, ÚNICAMENTE
 * para no seguir guardando la contraseña en texto plano en localStorage
 * mientras no exista el backend real.
 *
 * Esto NO equivale a la seguridad real exigida por la US02/US39
 * (backend con BCrypt + salt, servidor validando credenciales). Es un
 * parche honesto para la arquitectura estática actual, no una
 * implementación de seguridad de producción. Cuando exista el backend
 * Spring Boot, este archivo debe eliminarse y la validación de
 * contraseña debe moverse 100% al servidor.
 */
window.FaunaCrypto = {
  /**
   * Genera un hash SHA-256 en hexadecimal a partir de un texto plano.
   * @param {string} texto
   * @returns {Promise<string>}
   */
  hashPassword: async function (texto) {
    var encoder = new TextEncoder();
    var data = encoder.encode(texto);
    var hashBuffer = await crypto.subtle.digest('SHA-256', data);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
};

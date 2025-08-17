// src/auth/localAuthService.js

// ¡ADVERTENCIA DE SEGURIDAD!
// Almacenar credenciales directamente en el código frontend NO ES SEGURO para producción.
// Estas credenciales son visibles si alguien ve el código fuente de tu aplicación.

// Define una lista de administradores
const ADMIN_USERS = [
  {
    email: "mario@gmail.com",      // Email del primer administrador
    password: "mario123",    // Contraseña del primer administrador
    uid: "local_admin_uid_12345",       // UID ficticio para el primer administrador
  },
  {
    email: "admin2@biblioteca.com",     // Email del segundo administrador
    password: "securepassword2",        // Contraseña del segundo administrador
    uid: "local_admin_uid_67890",       // UID ficticio para el segundo administrador
  },
  // Puedes añadir más administradores aquí siguiendo el mismo formato
  /*
  {
    email: "otro.admin@biblioteca.com",
    password: "otra_contraseña_segura",
    uid: "local_admin_uid_ABCDE",
  },
  */
];

const localAuthService = {
  /**
   * Intenta iniciar sesión con un email y contraseña locales.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: { email: string, uid: string, isAdmin: boolean } } | null>}
   */
  login: async (email, password) => {
    // Simula una llamada asíncrona (como si fuera una API)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Busca en la lista de administradores
        const foundAdmin = ADMIN_USERS.find(
          (admin) => admin.email === email && admin.password === password
        );

        if (foundAdmin) {
          resolve({
            user: {
              email: foundAdmin.email,
              uid: foundAdmin.uid,
              isAdmin: true, // Siempre es admin si se loguea con estas credenciales
            },
          });
        } else {
          reject(new Error("Email o contraseña incorrectos."));
        }
      }, 500); // Pequeño retraso para simular red
    });
  },

  /**
   * Simula un cierre de sesión.
   */
  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
  },

  /**
   * Devuelve el email del admin local si está definido.
   * Usado para simular un "usuario actual" logueado.
   * En una aplicación real, esto vendría de una sesión o token.
   * @returns {{ email: string, uid: string, isAdmin: boolean } | null}
   */
  getCurrentUser: () => {
    // Para esta implementación simple, el usuario actual se gestionará en App.jsx
    // y se basará en la lógica de recarga de página tras el login.
    return null; 
  },
};

export default localAuthService; // ¡ESTA LÍNEA ES FUNDAMENTAL!
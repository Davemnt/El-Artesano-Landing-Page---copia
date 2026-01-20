/**
 * Inicialización de Firebase SDK - El Artesano
 * 
 * CONFIGURACIÓN:
 * 1. Ir a Firebase Console > Project Settings > General
 * 2. En "Your apps", seleccionar la app web
 * 3. Copiar el objeto firebaseConfig
 * 4. Reemplazar los valores de abajo
 * 
 * IMPORTANTE:
 * - Estas credenciales son públicas y es seguro exponerlas
 * - La seguridad se maneja con Firestore Rules y App Check
 * - NO incluir aquí claves privadas o Access Tokens
 */

// Configuración de Firebase - El Artesano
const firebaseConfig = {
  apiKey: "AIzaSyDtJfa6zXOsXzOeB1JE4H9-_2zF0fNgASQ",
  authDomain: "el-artesano-44216.firebaseapp.com",
  projectId: "el-artesano-44216",
  storageBucket: "el-artesano-44216.firebasestorage.app",
  messagingSenderId: "548016832509",
  appId: "1:548016832509:web:a2949040b695bae1b72394"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar servicios
// Auth es opcional (solo en admin pages)
const auth = firebase.auth ? firebase.auth() : null;
const db = firebase.firestore();
let functions;

try {
  functions = firebase.functions();
} catch (e) {
  console.warn('Firebase Functions no disponible:', e.message);
}

// DESARROLLO LOCAL: Conectar al emulador (comentar para producción)
// Descomentar las siguientes líneas cuando ejecutes: firebase emulators:start
// NOTA: Requiere Java 21 o superior
/*
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('🔧 Modo desarrollo: usando emuladores locales');
  if (auth) {
    auth.useEmulator('http://localhost:9099');
  }
  db.useEmulator('localhost', 8080);
  if (functions) {
    functions.useEmulator('localhost', 5500);
  }
}
*/

// Por ahora: modo producción (Firebase real en la nube)
console.log('☁️ Conectando a Firebase en producción...');

// Configurar idioma de Firebase Auth (español) - solo si está disponible
if (auth) {
  auth.languageCode = 'es';
}

// Habilitar persistencia de Firestore
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia no disponible: múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistencia no soportada en este navegador');
    }
  });

// Observador de estado de autenticación
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('Usuario autenticado:', user.email);
    
    // Obtener custom claims para verificar rol
    const idTokenResult = await user.getIdTokenResult();
    const isAdmin = !!idTokenResult.claims.admin;
    
    // Actualizar UI según rol
    updateUIForAuthState(user, isAdmin);
  } else {
    console.log('Usuario no autenticado');
    updateUIForAuthState(null, false);
  }
});

/**
 * Actualizar la interfaz según el estado de autenticación
 * Esta función debe ser implementada según tu diseño
 */
function updateUIForAuthState(user, isAdmin) {
  // Elementos comunes en la mayoría de páginas
  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const userNameDisplay = document.getElementById('userName');
  const adminPanel = document.getElementById('adminPanel');
  
  if (user) {
    // Usuario autenticado
    if (loginButton) loginButton.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'block';
    if (userNameDisplay) userNameDisplay.textContent = user.displayName || user.email;
    
    // Mostrar panel admin si es admin
    if (adminPanel) {
      adminPanel.style.display = isAdmin ? 'block' : 'none';
    }
  } else {
    // Usuario no autenticado
    if (loginButton) loginButton.style.display = 'block';
    if (logoutButton) logoutButton.style.display = 'none';
    if (userNameDisplay) userNameDisplay.textContent = '';
    if (adminPanel) adminPanel.style.display = 'none';
  }
  
  // Disparar evento personalizado para que otros scripts reaccionen
  window.dispatchEvent(new CustomEvent('authStateChanged', { 
    detail: { user, isAdmin } 
  }));
}

/**
 * Obtener el usuario actual
 */
function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Verificar si el usuario actual es admin
 */
async function isCurrentUserAdmin() {
  const user = getCurrentUser();
  if (!user) return false;
  
  const idTokenResult = await user.getIdTokenResult();
  return !!idTokenResult.claims.admin;
}

/**
 * Cerrar sesión
 */
async function logout() {
  try {
    await auth.signOut();
    console.log('Sesión cerrada exitosamente');
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión. Por favor, intente nuevamente.');
  }
}

// Exponer funciones globalmente para uso en otros scripts
window.firebaseApp = {
  auth,
  db,
  functions,
  getCurrentUser,
  isCurrentUserAdmin,
  logout
};

console.log('Firebase inicializado correctamente');

/**
 * Utilidades de cifrado para proteger videoIds de YouTube
 * 
 * Utiliza AES-256-GCM para cifrar/descifrar los IDs de video de forma segura.
 * La clave debe estar almacenada en Secret Manager o variables de entorno.
 * 
 * IMPORTANTE: Este cifrado protege los videoIds en la base de datos, pero una vez
 * que el videoId es enviado al cliente para reproducción, puede ser interceptado.
 * YouTube no provee DRM nativo. Para protección robusta, considerar servicios con DRM.
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits para GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Obtiene la clave de cifrado desde variables de entorno
 * La clave debe ser de 32 bytes (256 bits) codificada en base64
 * 
 * Generar con: openssl rand -base64 32
 */
function getEncryptionKey() {
  const key = process.env.VIDEO_SECRET_KEY;
  if (!key) {
    throw new Error('VIDEO_SECRET_KEY no está configurada en el entorno');
  }
  return Buffer.from(key, 'base64');
}

/**
 * Cifra un videoId de YouTube
 * 
 * @param {string} videoId - ID del video de YouTube (ej: 'dQw4w9WgXcQ')
 * @returns {Object} - { encryptedData: string, iv: string, authTag: string }
 */
function encryptVideoId(videoId) {
  try {
    const key = getEncryptionKey();
    
    // Generar IV aleatorio (importante: usar uno diferente para cada cifrado)
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Crear cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Cifrar
    let encrypted = cipher.update(videoId, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Obtener authentication tag (GCM provee autenticación integrada)
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      algorithm: ALGORITHM,
      version: 1 // Para futuras migraciones de algoritmo
    };
  } catch (error) {
    console.error('Error al cifrar videoId:', error);
    throw new Error('Error al cifrar videoId');
  }
}

/**
 * Descifra un videoId de YouTube
 * 
 * @param {Object} encryptedData - { encryptedData: string, iv: string, authTag: string }
 * @returns {string} - videoId original
 */
function decryptVideoId(encryptedData) {
  try {
    const key = getEncryptionKey();
    
    // Validar datos de entrada
    if (!encryptedData.encryptedData || !encryptedData.iv || !encryptedData.authTag) {
      throw new Error('Datos de cifrado incompletos');
    }
    
    // Convertir desde base64
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');
    
    // Crear decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Descifrar
    let decrypted = decipher.update(encryptedData.encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error al descifrar videoId:', error);
    throw new Error('Error al descifrar videoId o datos corrompidos');
  }
}

/**
 * Valida que un videoId de YouTube tenga formato correcto
 * Los IDs de YouTube son típicamente de 11 caracteres alfanuméricos con - y _
 * 
 * @param {string} videoId 
 * @returns {boolean}
 */
function isValidYouTubeId(videoId) {
  const regex = /^[a-zA-Z0-9_-]{11}$/;
  return regex.test(videoId);
}

module.exports = {
  encryptVideoId,
  decryptVideoId,
  isValidYouTubeId
};

/**
 * Firebase Cloud Functions - El Artesano
 * Sistema de cursos online con MercadoPago y protección de videos
 * 
 * Funciones implementadas:
 * 1. createMercadoPagoPreference - Crear preferencia de pago (cursos y productos)
 * 2. mercadoPagoWebhook - Recibir notificaciones de pago
 * 3. getSecureVideo - Obtener videoId cifrado (solo para usuarios con acceso)
 * 4. adminCreateCourse - Crear/editar cursos (solo admins)
 * 5. setAdminRole - Asignar rol de administrador (solo admins)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mercadopago = require('mercadopago');
const cors = require('cors')({ origin: true });
const { encryptVideoId, decryptVideoId, isValidYouTubeId } = require('./src/utils/crypto-utils');

// Inicializar Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Configurar MercadoPago con Access Token desde variables de entorno
// En producción, usar Secret Manager: functions.config().mp.access_token
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || functions.config().mp?.access_token;
if (MP_ACCESS_TOKEN) {
  mercadopago.configure({
    access_token: MP_ACCESS_TOKEN
  });
}

/**
 * ============================================================================
 * 1. CREATE MERCADOPAGO PREFERENCE
 * ============================================================================
 * 
 * Función callable para crear preferencias de pago en MercadoPago.
 * 
 * SEGURIDAD:
 * - El Access Token de MercadoPago NUNCA se expone al cliente
 * - Para cursos: requiere autenticación
 * - Para productos: puede ser anónimo
 * - Valida que el item exista en Firestore y esté publicado
 * 
 * FLUJO:
 * 1. Validar autenticación (si es curso)
 * 2. Obtener datos del item (curso/producto) desde Firestore
 * 3. Crear registro de compra pendiente
 * 4. Crear preferencia en MercadoPago con external_reference
 * 5. Retornar init_point para redirigir al usuario
 * 
 * @param {Object} data - { type: 'course'|'product', itemId: string, payerEmail?: string }
 * @returns {Object} - { init_point: string, preference_id: string, purchaseId: string }
 */
exports.createMercadoPagoPreference = functions.https.onCall(async (data, context) => {
  try {
    console.log('createMercadoPagoPreference iniciada:', { type: data.type, itemId: data.itemId });

    // Validar inputs
    if (!data.type || !['course', 'product'].includes(data.type)) {
      throw new functions.https.HttpsError('invalid-argument', 'Tipo de item inválido');
    }
    if (!data.itemId) {
      throw new functions.https.HttpsError('invalid-argument', 'itemId es requerido');
    }

    // Autenticación requerida para cursos
    if (data.type === 'course') {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Debe iniciar sesión para comprar cursos'
        );
      }
    }

    // Obtener datos del item desde Firestore
    const collectionName = data.type === 'course' ? 'courses' : 'products';
    const itemDoc = await db.collection(collectionName).doc(data.itemId).get();

    if (!itemDoc.exists) {
      throw new functions.https.HttpsError('not-found', `${data.type} no encontrado`);
    }

    const item = itemDoc.data();

    // Validar que esté publicado
    if (!item.published) {
      throw new functions.https.HttpsError('failed-precondition', 'Este item no está disponible');
    }

    // Validar precio
    if (!item.price || item.price <= 0) {
      throw new functions.https.HttpsError('failed-precondition', 'Precio inválido');
    }

    // Crear registro de compra pendiente
    const purchaseData = {
      type: data.type,
      itemId: data.itemId,
      itemTitle: item.title,
      userId: context.auth ? context.auth.uid : null,
      payerEmail: data.payerEmail || (context.auth ? context.auth.token.email : null),
      amount: item.price,
      currency: 'ARS', // Adaptar según tu región
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const purchaseRef = await db.collection('purchases').add(purchaseData);
    const purchaseId = purchaseRef.id;

    console.log('Compra pendiente creada:', purchaseId);

    // Preparar external_reference para tracking
    const externalReference = JSON.stringify({
      purchaseId: purchaseId,
      type: data.type,
      itemId: data.itemId,
      userId: context.auth ? context.auth.uid : null
    });

    // URLs de retorno (desde env o config)
    const frontendUrl = process.env.FRONTEND_URL || functions.config().app?.frontend_url || 'https://tu-dominio.com';
    const successUrl = `${frontendUrl}/pago-exitoso.html?purchase=${purchaseId}`;
    const failureUrl = `${frontendUrl}/pago-fallido.html?purchase=${purchaseId}`;
    const pendingUrl = `${frontendUrl}/pago-pendiente.html?purchase=${purchaseId}`;

    // Crear preferencia en MercadoPago
    const preference = {
      items: [
        {
          title: item.title,
          description: item.description ? item.description.substring(0, 256) : item.title,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: parseFloat(item.price)
        }
      ],
      external_reference: externalReference,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      },
      auto_return: 'approved',
      // notification_url se configura en el dashboard de MercadoPago apuntando a mercadoPagoWebhook
      payer: {
        email: purchaseData.payerEmail || 'comprador@example.com'
      },
      metadata: {
        purchase_id: purchaseId,
        item_type: data.type
      }
    };

    const mpResponse = await mercadopago.preferences.create(preference);

    if (!mpResponse.body || !mpResponse.body.id) {
      throw new functions.https.HttpsError('internal', 'Error al crear preferencia en MercadoPago');
    }

    // Guardar datos de MercadoPago en la compra
    await purchaseRef.update({
      mp_preference_id: mpResponse.body.id,
      mp_init_point: mpResponse.body.init_point,
      mp_sandbox_init_point: mpResponse.body.sandbox_init_point,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Preferencia MercadoPago creada:', mpResponse.body.id);

    return {
      init_point: mpResponse.body.init_point,
      preference_id: mpResponse.body.id,
      purchaseId: purchaseId
    };

  } catch (error) {
    console.error('Error en createMercadoPagoPreference:', error);
    
    // Si es un HttpsError de Firebase, relanzarlo
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Otros errores
    throw new functions.https.HttpsError('internal', 'Error al crear preferencia de pago');
  }
});

/**
 * ============================================================================
 * 2. MERCADOPAGO WEBHOOK
 * ============================================================================
 * 
 * Endpoint HTTP para recibir notificaciones de MercadoPago cuando cambia el estado de un pago.
 * 
 * SEGURIDAD:
 * - Valida el pago consultando directamente la API de MercadoPago (no confía en el payload)
 * - Implementa idempotencia para evitar procesamiento duplicado
 * - Registra todos los eventos en la colección 'payments' para auditoría
 * 
 * FLUJO:
 * 1. Recibir notificación de MercadoPago
 * 2. Extraer payment_id y consultar el pago en la API de MP
 * 3. Parsear external_reference para obtener purchaseId
 * 4. Actualizar estado de la compra
 * 5. Si aprobado y es curso: crear acceso en user_courses
 * 6. Si aprobado y es producto: registrar venta
 * 
 * CONFIGURAR EN MERCADOPAGO:
 * - URL: https://REGION-PROJECT_ID.cloudfunctions.net/mercadoPagoWebhook
 * - Eventos: payment.created, payment.updated
 */
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('Webhook MercadoPago recibido:', req.body);

      // MercadoPago envía topic e id
      const { topic, id, type } = req.body;
      let paymentId = id || (req.body.data && req.body.data.id);

      if (!paymentId) {
        console.warn('Webhook sin payment ID');
        return res.status(400).send('No payment ID');
      }

      // Verificar si ya procesamos este pago (idempotencia)
      const paymentDoc = await db.collection('payments').doc(paymentId.toString()).get();
      if (paymentDoc.exists && paymentDoc.data().processed === true) {
        console.log('Pago ya procesado:', paymentId);
        return res.status(200).send('Already processed');
      }

      // Consultar el pago en la API de MercadoPago para validar (CRÍTICO para seguridad)
      let paymentData;
      try {
        const mpPayment = await mercadopago.payment.get(paymentId);
        paymentData = mpPayment.body;
      } catch (mpError) {
        console.error('Error al consultar pago en MercadoPago:', mpError);
        return res.status(500).send('Error fetching payment');
      }

      const status = paymentData.status; // 'approved', 'pending', 'rejected', etc.
      const externalReference = paymentData.external_reference;

      console.log('Estado del pago:', status, 'External reference:', externalReference);

      // Guardar registro del pago para auditoría
      await db.collection('payments').doc(paymentId.toString()).set({
        paymentId: paymentId,
        status: status,
        statusDetail: paymentData.status_detail,
        externalReference: externalReference,
        rawData: paymentData,
        processed: false,
        receivedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Parsear external_reference
      let refData;
      try {
        refData = JSON.parse(externalReference);
      } catch (err) {
        console.error('Error al parsear external_reference:', err);
        return res.status(400).send('Invalid external_reference');
      }

      const { purchaseId, type: purchaseType, itemId, userId } = refData;

      if (!purchaseId) {
        console.error('purchaseId no encontrado en external_reference');
        return res.status(400).send('Invalid external_reference');
      }

      // Obtener documento de compra
      const purchaseRef = db.collection('purchases').doc(purchaseId);
      const purchaseSnap = await purchaseRef.get();

      if (!purchaseSnap.exists) {
        console.error('Compra no encontrada:', purchaseId);
        return res.status(404).send('Purchase not found');
      }

      // Actualizar estado de la compra
      await purchaseRef.update({
        status: status,
        mp_payment_id: paymentId,
        mp_status_detail: paymentData.status_detail,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Procesar según estado
      if (status === 'approved') {
        console.log('Pago aprobado, procesando acceso...');

        if (purchaseType === 'course' && userId) {
          // Habilitar acceso al curso
          const userCourseId = `${userId}_${itemId}`;
          await db.collection('user_courses').doc(userCourseId).set({
            userId: userId,
            courseId: itemId,
            purchaseId: purchaseId,
            paymentId: paymentId,
            enabledAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active'
          });
          console.log('Acceso al curso habilitado:', userCourseId);
        } else if (purchaseType === 'product') {
          // Registrar venta de producto
          await db.collection('sales').add({
            purchaseId: purchaseId,
            productId: itemId,
            paymentId: paymentId,
            amount: paymentData.transaction_amount,
            currency: paymentData.currency_id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log('Venta de producto registrada');
        }

        // Marcar pago como procesado
        await db.collection('payments').doc(paymentId.toString()).update({
          processed: true,
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return res.status(200).send('OK');

    } catch (error) {
      console.error('Error en mercadoPagoWebhook:', error);
      return res.status(500).send('Internal error');
    }
  });
});

/**
 * ============================================================================
 * 3. GET SECURE VIDEO
 * ============================================================================
 * 
 * Función callable para obtener el videoId de YouTube de forma segura.
 * 
 * SEGURIDAD:
 * - Requiere autenticación obligatoria
 * - Valida que el usuario haya comprado el curso
 * - Descifra el videoId almacenado encriptado en videos_private
 * - Registra accesos para auditoría
 * 
 * LIMITACIONES:
 * - Una vez que el videoId llega al cliente, puede ser usado fuera de tu app
 * - YouTube NO provee DRM nativo
 * - Para protección robusta, considerar Vimeo Enterprise, Wistia, o soluciones con Widevine
 * 
 * @param {Object} data - { courseId: string }
 * @returns {Object} - { videoId: string, courseTitle: string }
 */
exports.getSecureVideo = functions.https.onCall(async (data, context) => {
  try {
    console.log('getSecureVideo iniciada:', { courseId: data.courseId, uid: context.auth?.uid });

    // Validar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debe iniciar sesión para acceder a los videos'
      );
    }

    const userId = context.auth.uid;
    const courseId = data.courseId;

    if (!courseId) {
      throw new functions.https.HttpsError('invalid-argument', 'courseId es requerido');
    }

    // Verificar que el curso exista
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Curso no encontrado');
    }

    // Verificar acceso del usuario al curso
    const userCourseId = `${userId}_${courseId}`;
    const accessDoc = await db.collection('user_courses').doc(userCourseId).get();

    if (!accessDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tiene acceso a este curso. Por favor, realice la compra primero.'
      );
    }

    const accessData = accessDoc.data();
    if (accessData.status !== 'active') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Su acceso a este curso no está activo'
      );
    }

    // Obtener videoId cifrado desde videos_private
    const videoDoc = await db.collection('videos_private').doc(courseId).get();
    
    if (!videoDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Video no encontrado');
    }

    const encryptedData = videoDoc.data();

    // Descifrar videoId
    let videoId;
    try {
      videoId = decryptVideoId(encryptedData);
    } catch (decryptError) {
      console.error('Error al descifrar videoId:', decryptError);
      throw new functions.https.HttpsError('internal', 'Error al obtener el video');
    }

    // Registrar acceso para auditoría
    await db.collection('video_access_logs').add({
      userId: userId,
      courseId: courseId,
      videoId: videoId.substring(0, 3) + '***', // Log parcial por seguridad
      accessedAt: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: context.rawRequest.headers['user-agent'] || 'unknown'
    });

    console.log('VideoId entregado exitosamente para curso:', courseId);

    return {
      videoId: videoId,
      courseTitle: courseDoc.data().title,
      accessGranted: true
    };

  } catch (error) {
    console.error('Error en getSecureVideo:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Error al obtener el video');
  }
});

/**
 * ============================================================================
 * 4. ADMIN CREATE COURSE
 * ============================================================================
 * 
 * Función callable para crear o actualizar cursos (solo administradores).
 * 
 * SEGURIDAD:
 * - Requiere autenticación
 * - Valida custom claim 'admin' del usuario
 * - Cifra el videoId antes de almacenarlo
 * - Separa metadatos públicos (courses) de datos privados (videos_private)
 * 
 * @param {Object} data - { courseId?, title, description, price, published, youtubeId, thumbnailUrl? }
 * @returns {Object} - { courseId: string, success: true }
 */
exports.adminCreateCourse = functions.https.onCall(async (data, context) => {
  try {
    console.log('adminCreateCourse iniciada:', { courseId: data.courseId, uid: context.auth?.uid });

    // Validar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Debe iniciar sesión');
    }

    // Verificar rol de administrador
    const userRecord = await admin.auth().getUser(context.auth.uid);
    const customClaims = userRecord.customClaims || {};
    
    if (!customClaims.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo los administradores pueden crear cursos'
      );
    }

    // Validar inputs
    if (!data.title || !data.youtubeId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'title y youtubeId son requeridos'
      );
    }

    // Validar formato de youtubeId
    if (!isValidYouTubeId(data.youtubeId)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'youtubeId tiene formato inválido (debe ser 11 caracteres)'
      );
    }

    // Generar o usar courseId existente
    const courseId = data.courseId || db.collection('courses').doc().id;
    const courseRef = db.collection('courses').doc(courseId);

    // Preparar metadata del curso (sin videoId)
    const courseData = {
      title: data.title,
      description: data.description || '',
      price: parseFloat(data.price) || 0,
      published: !!data.published,
      thumbnailUrl: data.thumbnailUrl || '',
      tags: data.tags || [],
      createdBy: context.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Si es nuevo curso, agregar createdAt
    const existingCourse = await courseRef.get();
    if (!existingCourse.exists) {
      courseData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // Guardar metadata del curso
    await courseRef.set(courseData, { merge: true });

    // Cifrar y guardar videoId en colección privada
    const encryptedVideo = encryptVideoId(data.youtubeId);
    
    await db.collection('videos_private').doc(courseId).set({
      ...encryptedVideo,
      courseId: courseId,
      createdBy: context.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('Curso creado/actualizado exitosamente:', courseId);

    return {
      courseId: courseId,
      success: true,
      message: existingCourse.exists ? 'Curso actualizado' : 'Curso creado'
    };

  } catch (error) {
    console.error('Error en adminCreateCourse:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Error al crear curso');
  }
});

/**
 * ============================================================================
 * 5. SET ADMIN ROLE
 * ============================================================================
 * 
 * Función callable para asignar rol de administrador a un usuario.
 * 
 * SEGURIDAD:
 * - Requiere autenticación
 * - Solo un admin existente puede crear otros admins
 * - Usa Custom Claims de Firebase Auth
 * 
 * USO INICIAL:
 * Para el primer admin, usar Firebase CLI:
 * firebase auth:export users.json
 * // Editar manualmente o usar Admin SDK desde script local
 * 
 * @param {Object} data - { email: string, isAdmin: boolean }
 * @returns {Object} - { success: true, message: string }
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Debe iniciar sesión');
    }

    // Verificar que el caller sea admin
    const callerRecord = await admin.auth().getUser(context.auth.uid);
    const callerClaims = callerRecord.customClaims || {};
    
    if (!callerClaims.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Solo los administradores pueden asignar roles'
      );
    }

    // Validar input
    if (!data.email) {
      throw new functions.https.HttpsError('invalid-argument', 'email es requerido');
    }

    // Obtener usuario por email
    const targetUser = await admin.auth().getUserByEmail(data.email);

    // Asignar custom claim
    await admin.auth().setCustomUserClaims(targetUser.uid, {
      admin: !!data.isAdmin
    });

    // Actualizar documento de usuario en Firestore
    await db.collection('users').doc(targetUser.uid).set({
      roles: {
        admin: !!data.isAdmin
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`Rol admin ${data.isAdmin ? 'asignado' : 'removido'} para:`, data.email);

    return {
      success: true,
      message: `Rol admin ${data.isAdmin ? 'asignado' : 'removido'} correctamente`
    };

  } catch (error) {
    console.error('Error en setAdminRole:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Error al asignar rol');
  }
});

/**
 * ============================================================================
 * 6. ADMIN CREATE USER
 * ============================================================================
 * 
 * Crear usuario desde panel de administración sin cerrar sesión del admin.
 * Solo accesible por administradores.
 */
exports.adminCreateUser = functions.https.onCall(async (data, context) => {
  // Verificar autenticación y rol de admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    // Verificar que el usuario actual sea admin
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!callerDoc.exists || !callerDoc.data().roles?.admin) {
      throw new functions.https.HttpsError('permission-denied', 'No tienes permisos de administrador');
    }

    const { email, displayName, password, role, courseId } = data;

    // Validar campos requeridos
    if (!email || !displayName || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'Faltan campos requeridos');
    }

    if (password.length < 6) {
      throw new functions.https.HttpsError('invalid-argument', 'La contraseña debe tener al menos 6 caracteres');
    }

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false
    });

    console.log('Usuario creado en Auth:', userRecord.uid);

    // Crear documento en Firestore
    const userData = {
      email: email,
      displayName: displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
      roles: {
        admin: role === 'admin'
      }
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Asignar curso si se proporcionó
    let courseName = null;
    if (courseId) {
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (courseDoc.exists) {
        courseName = courseDoc.data().name;
        
        await db.collection('user_courses').add({
          userId: userRecord.uid,
          courseId: courseId,
          courseName: courseName,
          grantedAt: admin.firestore.FieldValue.serverTimestamp(),
          grantedBy: context.auth.uid,
          active: true
        });
      }
    }

    return {
      success: true,
      userId: userRecord.uid,
      email: email,
      courseName: courseName
    };

  } catch (error) {
    console.error('Error en adminCreateUser:', error);
    
    // Manejar errores específicos de Auth
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Este email ya está registrado');
    }
    if (error.code === 'auth/invalid-email') {
      throw new functions.https.HttpsError('invalid-argument', 'Email inválido');
    }
    if (error.code === 'auth/weak-password') {
      throw new functions.https.HttpsError('invalid-argument', 'La contraseña es muy débil');
    }
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Error al crear usuario: ' + error.message);
  }
});

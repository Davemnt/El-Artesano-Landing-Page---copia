/**
 * Gestión de Pagos - El Artesano
 * Integración con MercadoPago mediante Cloud Functions
 */

/**
 * Crear preferencia de pago e iniciar checkout
 * 
 * @param {string} type - 'course' o 'product'
 * @param {string} itemId - ID del curso o producto
 * @param {string} payerEmail - Email del comprador (opcional)
 */
async function createPaymentPreference(type, itemId, payerEmail = null) {
  try {
    // Validar inputs
    if (!type || !['course', 'product'].includes(type)) {
      throw new Error('Tipo de item inválido');
    }
    
    if (!itemId) {
      throw new Error('ID de item requerido');
    }
    
    // Para cursos, verificar autenticación
    if (type === 'course') {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('Debe iniciar sesión para comprar cursos');
      }
    }
    
    // Mostrar loading
    showPaymentLoading(true);
    
    // Llamar a Cloud Function
    const createMercadoPagoPreference = firebase.functions().httpsCallable('createMercadoPagoPreference');
    
    const result = await createMercadoPagoPreference({
      type: type,
      itemId: itemId,
      payerEmail: payerEmail
    });
    
    if (!result.data || !result.data.init_point) {
      throw new Error('No se pudo crear la preferencia de pago');
    }
    
    // Guardar purchaseId en sessionStorage para tracking
    if (result.data.purchaseId) {
      sessionStorage.setItem('currentPurchaseId', result.data.purchaseId);
    }
    
    console.log('Preferencia creada:', result.data.preference_id);
    
    // Redirigir a MercadoPago
    window.location.href = result.data.init_point;
    
    return result.data;
    
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error);
    showPaymentLoading(false);
    
    // Mostrar error al usuario
    let errorMessage = 'Error al iniciar el pago';
    
    if (error.code === 'unauthenticated') {
      errorMessage = 'Debe iniciar sesión para comprar cursos';
      // Redirigir a login
      setTimeout(() => {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
      }, 2000);
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
    throw error;
  }
}

/**
 * Verificar estado de una compra
 * 
 * @param {string} purchaseId 
 */
async function checkPurchaseStatus(purchaseId) {
  try {
    if (!purchaseId) {
      throw new Error('Purchase ID requerido');
    }
    
    const purchaseDoc = await firebase.firestore().collection('purchases').doc(purchaseId).get();
    
    if (!purchaseDoc.exists) {
      throw new Error('Compra no encontrada');
    }
    
    const purchase = purchaseDoc.data();
    
    return {
      status: purchase.status,
      type: purchase.type,
      itemId: purchase.itemId,
      amount: purchase.amount,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt
    };
    
  } catch (error) {
    console.error('Error al verificar compra:', error);
    throw error;
  }
}

/**
 * Obtener cursos comprados por el usuario actual
 */
async function getUserCourses() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      return [];
    }
    
    const snapshot = await firebase.firestore()
      .collection('user_courses')
      .where('userId', '==', user.uid)
      .where('status', '==', 'active')
      .get();
    
    const courses = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Obtener información del curso
      const courseDoc = await firebase.firestore().collection('courses').doc(data.courseId).get();
      
      if (courseDoc.exists) {
        courses.push({
          ...data,
          courseData: courseDoc.data(),
          id: doc.id
        });
      }
    }
    
    return courses;
    
  } catch (error) {
    console.error('Error al obtener cursos del usuario:', error);
    return [];
  }
}

/**
 * Verificar si el usuario tiene acceso a un curso específico
 * 
 * @param {string} courseId 
 */
async function hasAccessToCourse(courseId) {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      return false;
    }
    
    const userCourseId = `${user.uid}_${courseId}`;
    const doc = await firebase.firestore().collection('user_courses').doc(userCourseId).get();
    
    if (!doc.exists) {
      return false;
    }
    
    const data = doc.data();
    return data.status === 'active';
    
  } catch (error) {
    console.error('Error al verificar acceso:', error);
    return false;
  }
}

/**
 * Mostrar/ocultar loading de pago
 */
function showPaymentLoading(show) {
  let loadingEl = document.getElementById('paymentLoading');
  
  if (!loadingEl && show) {
    // Crear elemento de loading
    loadingEl = document.createElement('div');
    loadingEl.id = 'paymentLoading';
    loadingEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    loadingEl.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
        <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
        <p style="margin: 0; font-size: 16px;">Procesando pago...</p>
      </div>
    `;
    
    document.body.appendChild(loadingEl);
  } else if (loadingEl && !show) {
    loadingEl.remove();
  }
}

// Exponer funciones globalmente
window.paymentFunctions = {
  createPaymentPreference,
  checkPurchaseStatus,
  getUserCourses,
  hasAccessToCourse
};

/**
 * Manejador para página de éxito de pago
 */
if (window.location.pathname.includes('pago-exitoso')) {
  window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseId = urlParams.get('purchase');
    
    if (purchaseId) {
      try {
        const purchase = await checkPurchaseStatus(purchaseId);
        
        // Actualizar UI con información de la compra
        const messageEl = document.getElementById('successMessage');
        if (messageEl) {
          messageEl.textContent = `¡Pago exitoso! Su compra ha sido procesada.`;
        }
        
        // Si es un curso, mostrar enlace para acceder
        if (purchase.type === 'course') {
          const linkEl = document.getElementById('courseLink');
          if (linkEl) {
            linkEl.href = `/curso-player.html?id=${purchase.itemId}`;
            linkEl.style.display = 'block';
          }
        }
        
      } catch (error) {
        console.error('Error al verificar compra:', error);
      }
    }
  });
}

/**
 * Manejador para página de fallo de pago
 */
if (window.location.pathname.includes('pago-fallido')) {
  window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseId = urlParams.get('purchase');
    
    if (purchaseId) {
      try {
        await checkPurchaseStatus(purchaseId);
        
        const messageEl = document.getElementById('failMessage');
        if (messageEl) {
          messageEl.textContent = 'El pago no pudo ser procesado. Por favor, intente nuevamente.';
        }
        
      } catch (error) {
        console.error('Error al verificar compra:', error);
      }
    }
  });
}

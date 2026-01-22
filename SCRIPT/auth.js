// SCRIPT/auth.js

import { auth, db } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/**
 * Observa el estado de autenticación
 * ÚNICA fuente de verdad para saber si hay sesión
 */
export function observarEstadoAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Protege páginas privadas (perfil, voluntarios, etc.)
 */
export function protegerRutaPrivada(onAutenticado) {
  observarEstadoAuth(user => {
    if (user) {
      onAutenticado(user);
    } else {
      window.location.href = 'login.html';
    }
  });
}

/**
 * Login con email y contraseña
 * ❌ SIN redirecciones aquí
 */
export async function iniciarSesion(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Registro de usuario
 */
export async function registrarse(email, password, esVoluntario = false) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      email,
      esVoluntario,
      fechaRegistro: new Date()
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Obtener usuario actual (sincrónico)
 */
export function usuarioActual() {
  return auth.currentUser;
}

/**
 * Cerrar sesión
 */
export async function cerrarSesion() {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    console.error(error);
  }
}

/**
 * Login con Google
 */
export async function iniciarSesionConGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const usuarioRef = doc(db, "usuarios", user.uid);
    const snap = await getDoc(usuarioRef);

    if (!snap.exists()) {
      await setDoc(usuarioRef, {
        primerNombre: user.displayName?.split(' ')[0] || '',
        primerApellido: user.displayName?.split(' ').slice(-1)[0] || '',
        email: user.email,
        esVoluntario: false,
        fechaRegistro: new Date()
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

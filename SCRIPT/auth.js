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
 * ÚNICA fuente confiable de sesión
 */
export function observarEstadoAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Protege páginas privadas
 */
export function protegerRutaPrivada(onAutenticado) {
  observarEstadoAuth(user => {
    if (user) {
      onAutenticado(user);
    } else {
      window.location.href = 'login.html'; // ✅ CORREGIDO
    }
  });
}

/**
 * Login con email y contraseña
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
 * Registro
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
 * ❌ NO usar auth.currentUser directamente en Pages
 * ✅ Usar onAuthStateChanged
 */
export function obtenerUsuario(callback) {
  observarEstadoAuth(user => callback(user));
}

/**
 * Cerrar sesión
 */
export async function cerrarSesion() {
  try {
    await signOut(auth);
    window.location.href = 'index.html'; // ✅ CORREGIDO
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

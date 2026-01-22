// SCRIPT/sos.js

import { usuarioActual } from './auth.js';
import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export function inicializarSOS() {
  const sosButton = document.querySelector('.sos-button');
  const locationParagraph = document.querySelector('.location-text p');

  if (!sosButton) {
    console.error("Botón SOS no encontrado");
    return;
  }

  console.log("Botón SOS inicializado");

  sosButton.addEventListener('click', () => {
    const user = usuarioActual();

    if (!user) {
      alert("Debes iniciar sesión para activar una emergencia");
      window.location.href = '../docs/login.html';
      return;
    }

    // Feedback visual
    sosButton.disabled = true;
    sosButton.style.opacity = "0.6";
    sosButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Obteniendo ubicación...';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        if (locationParagraph) {
          locationParagraph.textContent = `Ubicación enviada: Lat ${lat.toFixed(6)}, Lng ${lon.toFixed(6)}`;
        }

        try {
          // Crear alerta en Firestore y obtener su ID
          const docRef = await addDoc(collection(db, "alertas"), {
            usuarioId: user.uid,
            email: user.email || "Anónimo",
            latitud: lat,
            longitud: lon,
            timestamp: serverTimestamp(),
            estado: "activa"
          });

          const alertaId = docRef.id;

          // Guardar datos locales incluyendo el ID de la alerta
          const emergenciaData = {
            lat: lat,
            lon: lon,
            timestamp: Date.now(),
            alertaId: alertaId  // ← CLAVE PARA EL CHAT
          };

          localStorage.setItem('emergenciaActiva', JSON.stringify(emergenciaData));

          alert(`🚨 ALERTA SOS ENVIADA CON ÉXITO 🚨\n\nLos voluntarios cercanos han sido notificados.\nMantén la calma, ayuda en camino.`);

          // Redirigir a la pantalla de emergencia
          window.location.href = '../docs/emergencia.html';

        } catch (error) {
          console.error("Error al guardar alerta:", error);
          alert("Error al enviar la alerta. Por favor, inténtalo de nuevo.");
          resetButton();
        }
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        alert("No se pudo obtener tu ubicación. Activa el GPS y permite el acceso.");
        resetButton();
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
      }
    );

    function resetButton() {
      sosButton.disabled = false;
      sosButton.style.opacity = "1";
      sosButton.innerHTML = `
        <div class="sos-content">
          <img src="../RECURSOS/emergencia.png" alt="Emergencia">
          <span class="sos-text">SOS</span>
        </div>
      `;
    }
  });
}
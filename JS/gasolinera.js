
// ==============================
// GASOLINERA
// ==============================

const gasolineras = {
  "g1": {
    name: "Gasolinera UNO",
    coords: [14.411674864408884, -90.6824536605504],
    horario: {
      apertura: 5,   // 5 AM
      cierre: 23     // 11 PM
    },
    tipo: "gasolinera"
  }
};

const gasolineraMarkers = {};


// ==============================
// CREAR MARCADORES DE LA GASOLINERA
// ==============================

Object.keys(gasolineras).forEach(id => {
  const lugar = gasolineras[id];

  const icon = L.divIcon({
    className: "gasolinera-marker",
    html: `
      <div class="gasolinera-pin" id="gasolinera-pin-${id}">
        <span class="gasolinera-icon">⛽</span>
      </div>
    `,
    iconSize: [35, 35],
    iconAnchor: [17, 35]
  });

  const marker = L.marker(lugar.coords, { icon }).addTo(map);

  marker.on("click", () => {
    mostrarInfoGasolinera(id);
  });

  gasolineraMarkers[id] = marker;
});

function estaAbierto(horario) {
  const ahora = new Date();
  const horaActual = ahora.getHours();

  if (horario.apertura < horario.cierre) {
    // Horario normal (5 AM - 11 PM)
    return horaActual >= horario.apertura && horaActual < horario.cierre;
  } else {
    // Por si en el futuro tienes horarios que cruzan medianoche
    return horaActual >= horario.apertura || horaActual < horario.cierre;
  }
}
function mostrarInfoGasolinera(id) {
  const lugar = gasolineras[id];
  const abierta = estaAbierto(lugar.horario);

  const estadoClase = abierta ? "abierto" : "cerrado";
  const estadoTexto = abierta ? "Abierto ahora" : "Cerrado ahora";

  const contenido = `
    <div class="gas-card">
      
      <div class="gas-header">
        <div class="gas-icon">⛽</div>
        <div class="gas-title">${lugar.name}</div>
      </div>

      <div class="gas-status ${estadoClase}">
        ${estadoTexto}
      </div>

      <div class="gas-schedule">
        <i class="fas fa-clock"></i>
        <span>5:00 AM - 11:00 PM</span>
      </div>

      <button class="gas-route-btn" onclick="trazarRutaAGasolinera('${id}')">
        <i class="fas fa-route"></i>
        Trazar ruta
      </button>

    </div>
  `;

  L.popup({
    closeButton: true,
    className: "custom-gas-popup"
  })
    .setLatLng(lugar.coords)
    .setContent(contenido)
    .openOn(map);
}

function trazarRutaAGasolinera(id) {
  destinoAlcanzado = false;

  const lugar = gasolineras[id];

  if (!userLocation) {
    alert("Esperando ubicación actual...");
    return;
  }

  if (routingControl) {
    map.removeControl(routingControl);
  }

  destinationLatLng = L.latLng(lugar.coords[0], lugar.coords[1]);
  lastRouteUpdateLocation = null;

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation.lat, userLocation.lng),
      destinationLatLng
    ],
    routeWhileDragging: false,
    router: L.Routing.osrmv1({
      serviceUrl: "https://router.project-osrm.org/route/v1"
    })
  }).addTo(map);

  map.setView(lugar.coords, 18);

  document.getElementById("cancelRouteBtn").style.display = "flex";
}

function actualizarEstiloPinesPorZoom() {
  const zoom = map.getZoom();

  Object.keys(gasolineraMarkers).forEach(id => {
    const pin = document.getElementById(`gasolinera-pin-${id}`);
    if (!pin) return;

    pin.classList.remove("zoom-far", "zoom-mid", "zoom-near");

    if (zoom <= 15) {
      pin.classList.add("zoom-far");
    } else if (zoom <= 17) {
      pin.classList.add("zoom-mid");
    } else {
      pin.classList.add("zoom-near");
    }
  });
}

map.on("zoomend", actualizarEstiloPinesPorZoom);
actualizarEstiloPinesPorZoom();


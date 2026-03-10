// =============================
// Areas infantiles
// =============================

let activeAreaInfantilPolygon = null;


const Areasinfatiles = {
  areas_infatiles: [
    {
      id: "area_infantil_1",
      nombre: "Area Infantil 1",

      // 🔵 Centro real (para rutas)
      coords: [14.41284949305446, -90.68221842572376],

      // 🟠 Posición visual del emoji
      iconCoords: [14.412760518634112, -90.6822781048707],

      area: [
        [14.412819618433893, -90.68241154475093],
        [14.412805330571247, -90.68213795944806],
        [14.412693625431748, -90.68215204104453],
        [14.412709212198752, -90.68242227358635],
        [14.412819618433893, -90.68241154475093],
      ]
    },
    {
        id: "area_infantil_2",
        nombre:"Area Infantil 2",

        // 🔵 Centro real (para rutas)
      coords: [14.414140354409948, -90.68285557235843],

      // 🟠 Posición visual del emoji
      iconCoords: [14.414038391610536, -90.6827087214238],

      area: [
        [14.414105284405345, -90.68272347356108],
        [14.414075409954696, -90.68264568950438],
        [14.413970199900959, -90.68269329871151],
        [14.414002022700233, -90.68276974166378],
        [14.414105284405345, -90.68272347356108],
      ]
    },
    {
        id: "area_infantil_3",
        nombre:"Area Infantil 3",

        // 🔵 Centro real (para rutas)
      coords: [14.412087805277187, -90.68873387019374],

      // 🟠 Posición visual del emoji
      iconCoords: [14.411996232750152, -90.68871107141851],

      area: [
        [14.41205533275419, -90.68887401560625],
        [14.412099495384316, -90.68854879778296],
        [14.411955317353584, -90.68853203397764],
        [14.411913752498592, -90.68885389903984],
        [14.41205533275419, -90.68887401560625],
      ]
    }
  ]

};

function activarAreaInfantil(area) {

  // 🔥 Quitar polígono anterior
  if (activeSectorPolygon) {
    map.removeLayer(activeSectorPolygon);
    activeSectorPolygon = null;
  }

  if (activepiscinaPolygon) {
    map.removeLayer(activepiscinaPolygon);
    activepiscinaPolygon = null;
  }

  if (activeCentroDeportivoPolygon) {
    map.removeLayer(activeCentroDeportivoPolygon);
    activeCentroDeportivoPolygon = null;
  }
  
  if (activeAreaInfantilPolygon) {
    map.removeLayer(activeAreaInfantilPolygon);
    activeAreaInfantilPolygon = null;
  }
  
  if (activecolegioPolygon) {
    map.removeLayer(activecolegioPolygon);
    activecolegioPolygon = null;
  }

  if (activeGYMPolygon) {
    map.removeLayer(activeGYMPolygon);
    activeGYMPolygon = null;
  }

  // 🔥 Crear nuevo polígono
  activeAreaInfantilPolygon = L.polygon(area.area, {
    color: "#FFD700",
    weight: 2,
    fillColor: "#FFD700",
    fillOpacity: 0.35,
    interactive: false
  }).addTo(map);

  map.fitBounds(activeAreaInfantilPolygon.getBounds());
}


function CrearIconodeArea(id, emoji) {
  return L.divIcon({
    className: "area-infantil-market",
    html: `
      <div class="area-infantil-pin" id="area-infantil-pin-${id}">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [17, 17]
  });
}

// =============================
// CREAR MARCADORES areas infantiles
// =============================

const AreasinfatilesMarkers = [];

Object.keys(Areasinfatiles).forEach(tipoArea => {

  let emoji = "🛝";

  Areasinfatiles[tipoArea].forEach(area => {

    const marker = L.marker(area.iconCoords || area.coords, {
      icon: CrearIconodeArea(area.id, emoji)
    }).addTo(map);

    marker.on("click", () => {
      activarAreaInfantil(area);
      mostrarPopupAreaInfantil(area);
    });

    AreasinfatilesMarkers.push(marker);

  });

});

function mostrarPopupAreaInfantil(area) {

  const contenido = `
    <div class="area-popup">
      
      <div class="area-popup-header">
        <div class="centro-icon">🛝</div>
        <div>
          <h3>${area.nombre}</h3>
          <span>Zona de juegos</span>
        </div>
      </div>

      <button class="centro-btn"
        onclick="trazarRutaAreaInfantil('${area.id}')">
        <i class="fas fa-route"></i>
        Trazar ruta
      </button>

    </div>
  `;

  L.popup({
    closeButton: false,
    className: "custom-leaflet-popup",
    offset: [0, -10]
  })
    .setLatLng(area.coords)
    .setContent(contenido)
    .openOn(map);
}

function trazarRutaAreaInfantil(idarea) {

  if (!userLocation) {
    alert("Esperando ubicación actual...");
    return;
  }

  let areaSeleccionada = null;

Object.keys(Areasinfatiles).forEach(tipo => {
  Areasinfatiles[tipo].forEach(c => {
    if (c.id === idarea) {
      areaSeleccionada = c;
    }
  });
});

  if (!areaSeleccionada) return;

  if (routingControl) {
    map.removeControl(routingControl);
  }

  destinationLatLng = L.latLng(
    areaSeleccionada.coords[0],
    areaSeleccionada.coords[1]
  );

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
  
  ocultarPinesExcepto(idarea);
  document.getElementById("cancelRouteBtn").style.display = "flex";

  map.setView(areaSeleccionada.coords, 18);
}

function actualizarEstiloPinesPorZoom() {
  const zoom = map.getZoom();

 Object.keys(Areasinfatiles).forEach(tipo => {
  Areasinfatiles[tipo].forEach(area => {
    const pin = document.getElementById(`area-infantil-pin-${area.id}`);
    if (!pin) return;

    pin.classList.remove("zoom-far", "zoom-mid", "zoom-near");

    if (zoom <= 15) {
      pin.classList.add("zoom-far");
    } else if (zoom <= 17) {
      pin.classList.add("zoom-mid");
    } else {
      pin.classList.add("zoom-near");
    }
    })
  });
}



map.on("zoomend", actualizarEstiloPinesPorZoom);
actualizarEstiloPinesPorZoom();
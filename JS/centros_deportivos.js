// =============================
// CENTROS DEPORTIVOS
// =============================

let activeCentroDeportivoPolygon = null;


const centrosDeportivos = {
  baloncesto: [
    {
      id: "cancha_basket_1",
      nombre: "Canchas de Baloncesto",

      // 🔵 Centro real (para rutas)
      coords: [14.412439859074162, -90.6825479007556],

      // 🟠 Posición visual del emoji
      iconCoords: [14.412057982502816, -90.68223005899867],

      area: [
        [14.411848859341422, -90.68216367432954],
        [14.411954070396245, -90.6823896504253],
        [14.412091753923866, -90.68231857189073],
        [14.412139163801687, -90.6824204958265],
        [14.412276197765147, -90.68233868845653],
        [14.412154750607456, -90.68211271236076],
        [14.412024211072405, -90.68218244979289],
        [14.411968358312974, -90.68209058413471],
        [14.411848859341422, -90.68216367432954]
      ]
    }
  ],
futbol: [
  {
    id: "cancha_futbol_1",
    nombre: "Canchas de Fútbol",

    coords: [14.412214812648141, -90.68155954583099],

    iconCoords: [14.41198165995748, -90.6818539182658],

    area: [
      [14.412147269830433, -90.68208257656758],
      [14.411786824654708, -90.68203966122555],
      [14.41182384337514, -90.68163867100219],
      [14.412182340141541, -90.68167689247956],
      [14.412147269830433, -90.68208257656758]
    ]
  },
  {
    id: "cancha_futbol_sintetica",
    nombre: "cancha de futbol (sintetica)",

    coords: [14.412816028682927, -90.68361793641297],

    iconCoords: [14.412966841746675, -90.68371840118338],

    area: [
      [14.413012562949003, -90.68388315723318],
      [14.413122319586508, -90.68374569402953],
      [14.412918393009837, -90.6835626332754],
      [14.412804090133688, -90.68370344924011],
      [14.413012562949003, -90.68388315723318]
    ]
  }
]

};

function activarCentroDeportivo(cancha) {

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
  activeCentroDeportivoPolygon = L.polygon(cancha.area, {
    color: "#088729",
    weight: 2,
    fillColor: "#088729",
    fillOpacity: 0.35,
    interactive: false
  }).addTo(map);

  map.fitBounds(activeCentroDeportivoPolygon.getBounds());
}


function crearIconoCentroDeportivo(id, emoji) {
  return L.divIcon({
    className: "centro-deportivo-marker",
    html: `
      <div class="centro-deportivo-pin" id="centro-deportivo-pin-${id}">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [17, 17]
  });
}

// =============================
// CREAR MARCADORES CENTROS DEPORTIVOS
// =============================

const centrosDeportivosMarkers = [];

Object.keys(centrosDeportivos).forEach(tipoDeporte => {

  let emoji = "🏀";

  if (tipoDeporte === "futbol") {
    emoji = "⚽";
  }

  centrosDeportivos[tipoDeporte].forEach(cancha => {

    const marker = L.marker(cancha.iconCoords || cancha.coords, {
      icon: crearIconoCentroDeportivo(cancha.id, emoji)
    }).addTo(map);

    marker.on("click", () => {
      activarCentroDeportivo(cancha);
      mostrarPopupCentroDeportivo(cancha);
    });

    centrosDeportivosMarkers.push(marker);

  });

});

function mostrarPopupCentroDeportivo(cancha) {

  const contenido = `
    <div class="centro-popup">
      
      <div class="centro-popup-header">
        <div class="centro-icon">🏟️</div>
        <div>
          <h3>${cancha.nombre}</h3>
          <span>Zona Deportiva</span>
        </div>
      </div>

      <button class="centro-btn"
        onclick="trazarRutaACentroDeportivo('${cancha.id}')">
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
    .setLatLng(cancha.coords)
    .setContent(contenido)
    .openOn(map);
}

function trazarRutaACentroDeportivo(idCancha) {

  if (!userLocation) {
    alert("Esperando ubicación actual...");
    return;
  }

  let canchaSeleccionada = null;

Object.keys(centrosDeportivos).forEach(tipo => {
  centrosDeportivos[tipo].forEach(c => {
    if (c.id === idCancha) {
      canchaSeleccionada = c;
    }
  });
});

  if (!canchaSeleccionada) return;

  if (routingControl) {
    map.removeControl(routingControl);
  }

  destinationLatLng = L.latLng(
    canchaSeleccionada.coords[0],
    canchaSeleccionada.coords[1]
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
  
  ocultarPinesExcepto(idCancha);

  document.getElementById("cancelRouteBtn").style.display = "flex";

  map.setView(canchaSeleccionada.coords, 18);
}

function actualizarEstiloPinesPorZoom() {
  const zoom = map.getZoom();

 Object.keys(centrosDeportivos).forEach(tipo => {
  centrosDeportivos[tipo].forEach(cancha => {
    const pin = document.getElementById(`centro-deportivo-pin-${cancha.id}`);
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
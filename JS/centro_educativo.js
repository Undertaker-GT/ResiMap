// =============================
// COLEGIO
// =============================

let activecolegioPolygon = null;


const colegio = {
  colegio: [
    {
      id: "colegio_principal",
      nombre: "colegio ISK",

      // 🔵 Centro real (para rutas)
      coords: [14.413002376957364, -90.68435189234165],

      // 🟠 Posición visual del emoji
      iconCoords: [14.41291340259545, -90.68404746162592],

      area: [
        [14.41289217313855, -90.68445452996644],
        [14.413253182790392, -90.6841219765463],
        [14.413171444807213, -90.68405667149399],
        [14.413181175521062, -90.68402854008686],
        [14.41314030652001, -90.68399839929349],
        [14.413023537903603, -90.683881854868],
        [14.413125710445675, -90.68374823068406],
        [14.4128639540299, -90.68353222166493],
        [14.412586628116463, -90.6841541267093],
        [14.41289217313855, -90.68445452996644]
      ]
    }
  ]

};


function activarcolegio(area) {

  // 🔥 Quitar polígono anterior
  if (activeSectorPolygon) {
    map.removeLayer(activeSectorPolygon);
    activeSectorPolygon = null;
  }

  if (activecolegioPolygon) {
    map.removeLayer(activecolegioPolygon);
    activecolegioPolygon = null;
  }

  if (activeCentroDeportivoPolygon) {
    map.removeLayer(activeCentroDeportivoPolygon);
    activeCentroDeportivoPolygon = null;
  }
  
  if (activeAreaInfantilPolygon) {
    map.removeLayer(activeAreaInfantilPolygon);
    activeAreaInfantilPolygon = null;
  }

  if (activepiscinaPolygon) {
    map.removeLayer(activepiscinaPolygon);
    activepiscinaPolygon = null;
  }

   if (activeGYMPolygon) {
    map.removeLayer(activeGYMPolygon);
    activeGYMPolygon = null;
  }

  // 🔥 Crear nuevo polígono
  activecolegioPolygon = L.polygon(area.area, {
    color: "#3B5998", 
    weight: 2,
    fillColor: "#3B5998",
    fillOpacity: 0.35,
    interactive: false
  }).addTo(map);

  map.fitBounds(activecolegioPolygon.getBounds());
}

function crearIconocolegio(id, emoji) {
  return L.divIcon({
    className: "colegio-market",
    html: `
      <div class="colegio-pin" id="colegio-pin-${id}">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [17, 17]
  });
}

// =============================
// CREAR MARCADORES colegio
// =============================

const colegioMarkers = [];

Object.keys(colegio).forEach(tipoArea => {

  let emoji = "🏫";

  colegio[tipoArea].forEach(area => {

    const marker = L.marker(area.iconCoords || area.coords, {
      icon: crearIconocolegio(area.id, emoji)
    }).addTo(map);

    marker.on("click", () => {
      activarcolegio(area);
      mostrarPopupcolegio(area);
    });

    colegioMarkers.push(marker);

  });

});

function mostrarPopupcolegio(area) {

  const contenido = `
    <div class="colegio-popup">
      
      <div class="colegio-popup-header">
        <div class="centro-icon">🏫</div>
        <div>
          <h3>${area.nombre}</h3>
          <span>Institución educativa</span>
        </div>
      </div>

      <button class="centro-btn"
        onclick="trazarRutacolegio('${area.id}')">
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


function trazarRutacolegio(idarea) {

  if (!userLocation) {
    alert("Esperando ubicación actual...");
    return;
  }

  let areaSeleccionada = null;

Object.keys(colegio).forEach(tipo => {
  colegio[tipo].forEach(c => {
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

 Object.keys(colegio).forEach(tipo => {
  colegio[tipo].forEach(area => {
    const pin = document.getElementById(`colegio-pin-${area.id}`);
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
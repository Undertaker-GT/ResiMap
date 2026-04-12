// =============================
// Piscina
// =============================

let activepiscinaPolygon = null;


const piscina = {
  piscina: [
    {
      id: "piscina_principal",
      nombre: "Piscina Central",

      // 🔵 Centro real (para rutas)
      coords: [14.412273470873028, -90.68161289776955],

      // 🟠 Posición visual del emoji
      iconCoords: [14.412416995475734, -90.68209196000078],

      area: [
        [14.412354521374871, -90.68243772547416],
        [14.41253287340943, -90.68234831291055],
        [14.41261534829046, -90.6823408618636],
        [14.412644214491612, -90.68230254219347],
        [14.412655554783909, -90.68220461414762],
        [14.412588543957465, -90.68201940240877],
        [14.412518440302101, -90.68194276306853],
        [14.412338026379333, -90.681778840037],
        [14.412246272958148, -90.68180012874261],
        [14.412217406705473, -90.68184270615386],
        [14.412160705126833, -90.68210562166823],
        [14.412354521374871, -90.68243772547416]
      ]
    }
  ]

};


function activarpiscina(area) {

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

  if (activeSALONPolygon) {
    map.removeLayer(activeSALONPolygon);
    activeSALONPolygon = null;
  }

  if(activeCentroPolygon){
    map.removeLayer(activeCentroPolygon);
    activeCentroPolygon = null;
  }
  



  // 🔥 Crear nuevo polígono
  activepiscinaPolygon = L.polygon(area.area, {
    color: "#1E90FF", 
    weight: 2,
    fillColor: "#1E90FF",
    fillOpacity: 0.35,
    interactive: false
  }).addTo(map);

  map.fitBounds(activepiscinaPolygon.getBounds());
}


function crearIconoPiscina(id, emoji) {
  return L.divIcon({
    className: "piscina-market",
    html: `
      <div class="piscina-pin" id="piscina-pin-${id}">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [17, 17]
  });
}

// =============================
// CREAR MARCADORES Piscina
// =============================

const piscinaMarkers = [];

Object.keys(piscina).forEach(tipoArea => {

  let emoji = "🏊";

  piscina[tipoArea].forEach(area => {

    const marker = L.marker(area.iconCoords || area.coords, {
      icon: crearIconoPiscina(area.id, emoji)
    }).addTo(map);

    marker.on("click", () => {
      activarpiscina(area);
      mostrarPopuppiscina(area);
    });

    piscinaMarkers.push(marker);

  });

});

function mostrarPopuppiscina(area) {

  const contenido = `
    <div class="piscina-popup">
      
      <div class="piscina-popup-header">
        <div class="centro-icon">🤿</div>
        <div>
          <h3>${area.nombre}</h3>
          <span>Zona Acuatica</span>
        </div>
      </div>

      <button class="centro-btn"
        onclick="trazarRutapiscina('${area.id}')">
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


function trazarRutapiscina(idarea) {

  if (!userLocation) {
    alert("Esperando ubicación actual...");
    return;
  }

  let areaSeleccionada = null;

Object.keys(piscina).forEach(tipo => {
  piscina[tipo].forEach(c => {
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

 Object.keys(piscina).forEach(tipo => {
  piscina[tipo].forEach(area => {
    const pin = document.getElementById(`piscina-pin-${area.id}`);
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
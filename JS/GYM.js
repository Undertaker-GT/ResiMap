// =============================
// GYM
// =============================

let activeGYMPolygon = null;


const GYM = {
  GYM: [
    {
      id: "GYM_principal",
      nombre: "GYM",

    fotos:[
      "image/areas-recreativas/GYM/GYM.jpeg"
    ],    

      // 🔵 Centro real (para rutas)
      coords: [14.413295274293192, -90.68408720899853],

      // 🟠 Posición visual del emoji
      iconCoords: [14.41329722043491, -90.6839616223595],

      area: [
        [14.413285737763239, -90.68404695620671],
        [14.413362372487027, -90.68401879301378],
        [14.413307818957543, -90.68387931815349],
        [14.413231184215013, -90.6839108341075],
        [14.413285737763239, -90.68404695620671]
      ]
    }
  ]

};


function activarGYM(area) {

  // 🔥 Quitar polígono anterior
  if (activeSectorPolygon) {
    map.removeLayer(activeSectorPolygon);
    activeSectorPolygon = null;
  }

  if (activeGYMPolygon) {
    map.removeLayer(activeGYMPolygon);
    activeGYMPolygon = null;
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

  if (activecolegioPolygon) {
    map.removeLayer(activecolegioPolygon);
    activecolegioPolygon = null;
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
  activeGYMPolygon = L.polygon(area.area, {
    color: "#FF4500", 
    weight: 2,
    fillColor: "#FF4500",
    fillOpacity: 0.35,
    interactive: false
  }).addTo(map);

  map.fitBounds(activeGYMPolygon.getBounds());
}

function crearIconoGYM(id, emoji) {
  return L.divIcon({
    className: "GYM-market",
    html: `
      <div class="GYM-pin" id="GYM-pin-${id}">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [17, 17]
  });
}

// =============================
// CREAR MARCADORES GYM
// =============================

const GYMMarkers = [];

Object.keys(GYM).forEach(tipoArea => {

  let emoji = "💪";

  GYM[tipoArea].forEach(area => {

    const marker = L.marker(area.iconCoords || area.coords, {
      icon: crearIconoGYM(area.id, emoji)
    }).addTo(map);

    marker.on("click", () => {
      activarGYM(area);
      mostrarPopupGYM(area);
    });

    GYMMarkers.push(marker);

  });

});

function mostrarPopupGYM(area) {

  const fotos = (area.fotos && area.fotos.length > 0)
    ? area.fotos
    : ["/image/default.jpg"];

  const slides = fotos.map((foto, index) => `
    <img src="${foto}" class="gym-slide ${index === 0 ? 'active' : ''}">
  `).join("");

  const contenido = `
    <div class="GYM-popup">

      <div class="gym-carousel">
        <div class="gym-slides">
          ${slides}
        </div>

        ${fotos.length > 1 ? `
          <button class="gym-prev" onclick="moverSlideGYM(-1)">❮</button>
          <button class="gym-next" onclick="moverSlideGYM(1)">❯</button>
        ` : ""}
      </div>
      
      <div class="GYM-popup-header">
        <div class="centro-icon">🏋️‍♂️</div>
        <div>
          <h3>${area.nombre}</h3>
          <span>Zona de Ejercicio</span>
        </div>
      </div>

      <button class="centro-btn"
        onclick="trazarRutaGYM('${area.id}')">
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

  currentGymSlide = 0;
}

let currentGymSlide = 0;

function moverSlideGYM(direccion) {
  const slides = document.querySelectorAll(".gym-slide");

  if (slides.length === 0) return;

  slides[currentGymSlide].classList.remove("active");

  currentGymSlide += direccion;

  if (currentGymSlide < 0) {
    currentGymSlide = slides.length - 1;
  }

  if (currentGymSlide >= slides.length) {
    currentGymSlide = 0;
  }

  slides[currentGymSlide].classList.add("active");
}


function trazarRutaGYM(idarea) {

  if (!userLocation) {
    alert("Esperando ubicación actual...");
    return;
  }

  let areaSeleccionada = null;

Object.keys(GYM).forEach(tipo => {
  GYM[tipo].forEach(c => {
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

 Object.keys(GYM).forEach(tipo => {
  GYM[tipo].forEach(area => {
    const pin = document.getElementById(`GYM-pin-${area.id}`);
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
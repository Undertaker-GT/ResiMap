// =============================
// salon
// =============================

let activeSALONPolygon = null;




const salon = {
  salon: [
    {
      id: "salon_principal",
      nombre: "salon",
      fotos:[
        "image/areas-recreativas/Salon/salon1.jpeg",
        "image/areas-recreativas/Salon/salon2.jpeg"
      ],

      // 🔵 Centro real (para rutas)
      coords: [14.413256962182045, -90.68276267501264],

      // 🟠 Posición visual del emoji
      iconCoords: [14.413290733423848, -90.68290751429399],

      area: [
        [14.413384173619766, -90.68316704622568],
        [14.413344557371417, -90.68277745538094],
        [14.413201029593033, -90.68280494802234],
        [14.413254284254617, -90.68318984500145],
        [14.413384173619766, -90.68316704622568]
      ]
    }
  ]

};


function activarSalon(area) {

  // 🔥 Quitar polígono anterior
  if (activeSectorPolygon) {
    map.removeLayer(activeSectorPolygon);
    activeSectorPolygon = null;
  }

  if (activeGYMPolygon) {
    map.removeLayer(activeGYMPolygon);
    activeGYMPolygon = null;
  }

  if (activeSALONPolygon) {
    map.removeLayer(activeSALONPolygon);
    activeSALONPolygon = null;
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

  if(activeCentroPolygon){
    map.removeLayer(activeCentroPolygon);
    activeCentroPolygon = null;
  }
  


  // 🔥 Crear nuevo polígono
  activeSALONPolygon = L.polygon(area.area, {
    color: "#FF4500", 
    weight: 2,
    fillColor: "#FF4500",
    fillOpacity: 0.35,
    interactive: false
  }).addTo(map);

  map.fitBounds(activeSALONPolygon.getBounds());
}

function crearIconoSalon(id, emoji) {
  return L.divIcon({
    className: "salon-market",
    html: `
      <div class="salon-pin" id="salon-pin-${id}">
        ${emoji}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [17, 17]
  });
}

// =============================
// CREAR MARCADORES salon
// =============================

const salonMarkets = [];

Object.keys(salon).forEach(tipoArea => {

  let emoji = "🏡";

  salon[tipoArea].forEach(area => {

    const marker = L.marker(area.iconCoords || area.coords, {
      icon: crearIconoSalon(area.id, emoji)
    }).addTo(map);

    marker.on("click", () => {
      activarSalon(area);
      mostrarPopupSalon(area);
    });

    salonMarkets.push(marker);

  });

});

function mostrarPopupSalon(area) {

  const fotos = area.fotos || [];

  const slides = fotos.map((foto, index) => `
    <img src="${foto}" class="salon-slide ${index === 0 ? 'active' : ''}">
  `).join("");

  const contenido = `
    <div class="salon-popup">

      <div class="salon-carousel">
        <div class="salon-slides">
          ${slides}
        </div>

        ${fotos.length > 1 ? `
          <button class="salon-prev" onclick="moverSlide(-1)">❮</button>
          <button class="salon-next" onclick="moverSlide(1)">❯</button>
        ` : ""}
      </div>
      
      <div class="salon-popup-header">
        <div class="centro-icon">🏡</div>
        <div>
          <h3>${area.nombre}</h3>
          <span>Zona de Eventos</span>
        </div>
      </div>

      <button class="centro-btn"
        onclick="trazarRutaSalon('${area.id}')">
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

  currentSlideIndex = 0; // reset
}

let currentSlideIndex = 0;

function moverSlide(direccion) {
  const slides = document.querySelectorAll(".salon-slide");

  if (slides.length === 0) return;

  slides[currentSlideIndex].classList.remove("active");

  currentSlideIndex += direccion;

  if (currentSlideIndex < 0) {
    currentSlideIndex = slides.length - 1;
  }

  if (currentSlideIndex >= slides.length) {
    currentSlideIndex = 0;
  }

  slides[currentSlideIndex].classList.add("active");
}


function trazarRutaSalon(idarea) {

  if (!userLocation) {
    alert("Esperando ubicación actual...");
    return;
  }

  let areaSeleccionada = null;

Object.keys(salon).forEach(tipo => {
  salon[tipo].forEach(c => {
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

 Object.keys(salon).forEach(tipo => {
  salon[tipo].forEach(area => {
    const pin = document.getElementById(`salon-pin-${area.id}`);
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
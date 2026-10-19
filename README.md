# NaviMar: puesta en marcha real

## 1. Servidor (buques reales + seguimiento del barco)
1. Crea una clave gratuita en https://aisstream.io (API key).
2. Sube la carpeta `server/` a un servicio Node (por ejemplo Render, Railway o Fly.io).
3. Variables de entorno:
   - `AISSTREAM_KEY`: tu clave de aisstream.
   - `WRITE_CODE`: código largo para capitán y primer oficial.
   - `VIEW_CODE`: código distinto para el invitado (armador).
4. Copia la URL pública del servidor.

## 2. App (GitHub Pages)
1. En `index.html` busca `SERVER:""` y pon la URL del servidor (`SERVER:"https://tu-servidor.onrender.com"`).
2. Sube `index.html`, `sw.js`, `manifest.json` e `icon.svg` a la raíz del repositorio y activa Pages.
3. Abre la app con internet una vez (guarda mapa y app para uso sin conexión).

## 3. Día de la demo (República Dominicana)
- Capitán: perfil Capitán, crea PIN, escribe el código `WRITE_CODE`, completa los datos del buque, pulsa "Validar a bordo (GPS)", inicia el viaje y traza la ruta tocando el mapa (clic derecho o pulsación larga borra el último punto).
- Armador: perfil Invitado con el código `VIEW_CODE`; ve posición, estado (fondeado, parado, navegando), rumbo, velocidad, recorrido y derrota.
- Móvil del capitán: ubicación activada con alta precisión y pantalla encendida durante la demo.

## Límites a tener en cuenta
- La cobertura AIS depende de receptores en tierra: en mar abierto puede haber huecos (para eso hace falta AIS por satélite de pago).
- Alertas de tierra y bajos desactivadas en modo real hasta tener batimetría fiable o sonda.
- Mapas: CARTO/OpenStreetMap, Esri, OpenSeaMap y EMODnet para demo. Para uso comercial contrata un proveedor de teselas.
- No sustituye a cartas oficiales ni a equipos homologados.

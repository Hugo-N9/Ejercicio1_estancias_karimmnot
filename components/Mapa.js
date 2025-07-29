import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
width: "100%",
height: "300px",
};

const Mapa = ({ direccion }) => {
const [ubicacion, setUbicacion] = useState(null);

const { isLoaded } = useJsApiLoader({
googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
});

useEffect(() => {
const obtenerCoordenadas = async () => {
if (!direccion) return;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    direccion
  )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    setUbicacion(location);
  } else {
    setUbicacion(null);
  }
};

obtenerCoordenadas();

}, [direccion]);

if (!isLoaded) return <p>Cargando mapa...</p>;

return (
<div style={{ marginTop: 20 }}>
{ubicacion ? (
<GoogleMap mapContainerStyle={containerStyle} center={ubicacion} zoom={15} >
<Marker position={ubicacion} />
</GoogleMap>
) : (
<p></p>
)}
</div>
);
};

export default Mapa;
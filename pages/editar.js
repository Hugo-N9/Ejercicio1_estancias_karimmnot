import { useState } from "react";

export default function EditarUsuario() {
  const [curp, setCurp] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mensaje, setMensaje] = useState("");


  const handleUserUpdate = async (method) => {
    const url = `/api/usuarios/${curp}`;
    const requestOptions = {
      method: method, 
      headers: { "Content-Type": "application/json" },
      body: method === "PUT" ? JSON.stringify(usuario) : null, 
    };

    try {
      const res = await fetch(url, requestOptions);
      const data = await res.json();

      if (res.ok) {
        if (method === "GET") {
          setUsuario(data); 
        } else {
          setMensaje("Usuario actualizado correctamente");
        }
      } else {
        setMensaje(data.error || "Error al actualizar usuario");
        setUsuario(null);
      }
    } catch (error) {
      setMensaje(`Error al ${method === "GET" ? "buscar" : "actualizar"} el usuario`);
      setUsuario(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Editar Usuario</h1>

      
      <input
        placeholder="CURP del usuario"
        value={curp}
        onChange={(e) => setCurp(e.target.value)}
        maxLength={18}
      />
      <button onClick={() => handleUserUpdate("GET")}>Buscar</button>

      {usuario && (
        <div style={{ marginTop: 20 }}>
          <h3>Editar datos del Usuario</h3>
          <p>
            <strong>Nombre:</strong>
            <input
              value={usuario.nombre}
              onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
            />
          </p>
          <p>
            <strong>Apellidos:</strong>
            <input
              value={usuario.apellidos}
              onChange={(e) => setUsuario({ ...usuario, apellidos: e.target.value })}
            />
          </p>
          <p>
            <strong>Email:</strong>
            <input
              value={usuario.email}
              onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
            />
          </p>
          <p>
            <strong>Dirección:</strong>
            <input
              value={usuario.direccion || ""}
              onChange={(e) => setUsuario({ ...usuario, direccion: e.target.value })}
            />
          </p>
          <p>
            <strong>Escolaridad:</strong>
            <input
              value={usuario.escolaridad}
              onChange={(e) => setUsuario({ ...usuario, escolaridad: e.target.value })}
            />
          </p>

          
          <button onClick={() => handleUserUpdate("PUT")}>Actualizar Usuario</button>
        </div>
      )}

      
      <p style={{ marginTop: 20 }}>{mensaje}</p>
    </div>
  );
}
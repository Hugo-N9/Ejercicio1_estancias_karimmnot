import { useState } from "react";

export default function EditarUsuario() {
  const [curp, setCurp] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(false);

  const handleBuscarUsuario = async () => {
    try {
      const res = await fetch(`/api/usuarios/${curp}`);
      const data = await res.json();
      if (res.ok) {
        setUsuario(data);
        setMensaje("");
        setEditando(true);
      } else {
        setUsuario(null);
        setEditando(false);
        setMensaje(data.error || "Usuario no encontrado");
      }
    } catch (error) {
      setMensaje("Error al buscar el usuario");
    }
  };

  const handleActualizarUsuario = async () => {
    try {
      const res = await fetch(`/api/usuarios/${curp}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("Usuario actualizado correctamente");
        setUsuario(data);
      } else {
        setMensaje(data.error || "No se pudo actualizar el usuario");
      }
    } catch (error) {
      setMensaje(" Error al actualizar usuario");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Editar Usuario</h1>

      <input
        placeholder="Escribe CURP"
        value={curp}
        onChange={(e) => setCurp(e.target.value)}
        maxLength={18}
      />
      <button onClick={handleBuscarUsuario}>Buscar</button>

      {usuario && editando && (
        <div style={{ marginTop: 20 }}>
          <h3>Formulario de Edición</h3>

          <label>Nombre:</label>
          <input
            value={usuario.nombre}
            onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
          />

          <label>Apellidos:</label>
          <input
            value={usuario.apellidos}
            onChange={(e) => setUsuario({ ...usuario, apellidos: e.target.value })}
          />

          <label>Email:</label>
          <input
            value={usuario.email}
            onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
          />

          <label>Dirección:</label>
          <input
            value={usuario.direccion || ""}
            onChange={(e) => setUsuario({ ...usuario, direccion: e.target.value })}
          />

          <label>Escolaridad:</label>
          <input
            value={usuario.escolaridad || ""}
            onChange={(e) => setUsuario({ ...usuario, escolaridad: e.target.value })}
          />

          <div style={{ marginTop: 10 }}>
            <button onClick={handleActualizarUsuario}>Guardar Cambios</button>
          </div>
        </div>
      )}

      {mensaje && <p style={{ marginTop: 20 }}>{mensaje}</p>}
    </div>
  );
}

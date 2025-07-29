import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Mapa from "../components/Mapa";
const schema = z.object({
  curp: z.string().length(18, "La CURP debe tener 18 Caracteres"),
  nombre: z.string().min(3, "El nombre no es válido"),
  apellidos: z.string().min(3, "El apellido es inválido"),
  email: z.string().email("Correo inválido"),
  fechaNacimiento: z.string().refine((val) => {
    const fecha = new Date(val);
    const edad = new Date().getFullYear() - fecha.getFullYear();
    return edad >= 18;
  }, {
    message: "Debes ser mayor de 18 años",
  }),
  direccion: z.string().min(5, "La dirección es inválida"),
  escolaridad: z.string().min(1, "Seleccione nivel de estudios"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function Registro() {
  const [foto, setFoto] = useState(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [buscarCurp, setBuscarCurp] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [editando, setEditando] = useState(false);
  const [ordenAscendente, setOrdenAscendente] = useState(true);
 const [direccionMapa, setDireccionMapa] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setFoto(file);
    } else {
      alert("Solo se permiten imágenes PNG o JPEG");
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setTodosUsuarios(data);
    } catch (err) {
      alert("No se pudieron obtener los usuarios");
    }
  };

  const onSubmit = async (data) => {
    try {
      let fotoSubidaUrl = "";

      if (foto) {
        const formData = new FormData();
        formData.append("file", foto);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (uploadRes.ok) {
          fotoSubidaUrl = uploadData.url;
          setFotoUrl(uploadData.url);
          data.foto = fotoSubidaUrl;
        } else {
          alert("Error al subir imagen");
          return;
        }
      }

      const payload = {
        ...data,
        foto: fotoSubidaUrl,
      };

      const res = await fetch(
        editando ? `/api/usuarios/${usuarioEncontrado.curp}` : "/api/usuarios",
        {
          method: editando ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (res.ok) {
        alert(editando ? "Usuario actualizado con éxito" : "Usuario registrado con éxito");
        setEditando(false);
        setUsuarioEncontrado(null);
        reset();
        setFoto(null);
        setFotoUrl("");
        cargarUsuarios();
      } else {
        alert("Error: " + result.error);
      }
    } catch {
      alert("Ocurrió un error al enviar los datos");
    }
  };

  const buscarUsuario = async () => {
    if (!buscarCurp || buscarCurp.length !== 18) {
      alert("CURP inválido");
      return;
    }

    try {
      const res = await fetch(`/api/usuarios/${buscarCurp}`);
      const data = await res.json();

      if (res.ok) {
        setUsuarioEncontrado(data);
      } else {
        alert(data.error);
        setUsuarioEncontrado(null);
      }
    } catch {
      alert("Error al buscar usuario");
    }
  };

  const eliminarUsuario = async (curp) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const res = await fetch(`/api/usuarios/${curp}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Usuario eliminado correctamente");
        setTodosUsuarios((prev) => prev.filter((u) => u.curp !== curp));
      } else {
        const data = await res.json();
        alert("Error al eliminar: " + data.error);
      }
    } catch {
      alert("No se pudo eliminar el usuario");
    }
  };

  const editarUsuario = (usuario) => {
    setUsuarioEncontrado(usuario);
    setEditando(true);
    reset({
      curp: usuario.curp,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      fechaNacimiento: usuario.fechaNacimiento.split("T")[0],
      direccion: usuario.direccion,
      escolaridad: usuario.escolaridad,
      password: "",
    });
    setFotoUrl(usuario.foto || "");
  };

  const ordenarPorNombre = () => {
    const ordenado = [...todosUsuarios].sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      return ordenAscendente
        ? nombreA.localeCompare(nombreB)
        : nombreB.localeCompare(nombreA);
    });
    setTodosUsuarios(ordenado);
    setOrdenAscendente(!ordenAscendente);
  };

  return (
    <div className="container">
      <h1>Registro de usuarios</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="CURP" {...register("curp")} disabled={editando} />
        <p className="mensaje-error">{errors.curp?.message}</p>
        <input placeholder="NOMBRE" {...register("nombre")} />
        <p className="mensaje-error">{errors.nombre?.message}</p>
        <input placeholder="APELLIDOS" {...register("apellidos")} />
        <p className="mensaje-error">{errors.apellidos?.message}</p>
        <input placeholder="CORREO" {...register("email")} />
        <p className="mensaje-error">{errors.email?.message}</p>
        <label>Fecha de nacimiento</label>
        <input type="date" {...register("fechaNacimiento")} />
        <p className="mensaje-error">{errors.fechaNacimiento?.message}</p>
        <input placeholder="Dirección" {...register("direccion")} />
        <p className="mensaje-error">{errors.direccion?.message}</p>
        <Mapa direccion={direccionMapa} />
        <select {...register("escolaridad")}>
          <option value="">Selecciona un nivel</option>
          <option value="primaria">Primaria</option>
          <option value="secundaria">Secundaria</option>
          <option value="preparatoria">Preparatoria</option>
          <option value="universidad">Universidad</option>
        </select>
        <p className="mensaje-error">{errors.escolaridad?.message}</p>
        <input type="password" placeholder="Contraseña" {...register("password")} />
        <p className="mensaje-error">{errors.password?.message}</p>
        <label>Foto de perfil (PNG o JPEG)</label>
        <input type="file" accept="image/png, image/jpeg" onChange={handleFoto} />
        {fotoUrl && <img src={fotoUrl} alt="Vista previa" width={120} />}
        <button type="submit">{editando ? "Actualizar Usuario" : "Guardar Datos"}</button>
      </form>

      <hr style={{ margin: "30px 0" }} />
      <h2>Buscar usuario por CURP</h2>
      <input
        placeholder="Escribe CURP"
        value={buscarCurp}
        onChange={(e) => setBuscarCurp(e.target.value)}
        maxLength={18}
      />
      <button type="button" onClick={buscarUsuario}>Buscar</button>

      {usuarioEncontrado && !editando && (
        <div style={{ marginTop: 20, border: "1px solid #ccc", padding: 15 }}>
          <h3>Datos del Usuario</h3>
          <p><strong>Nombre:</strong> {usuarioEncontrado.nombre}</p>
          <p><strong>Apellidos:</strong> {usuarioEncontrado.apellidos}</p>
          <p><strong>Email:</strong> {usuarioEncontrado.email}</p>
          <p><strong>Fecha Nacimiento:</strong> {new Date(usuarioEncontrado.fechaNacimiento).toLocaleDateString()}</p>
          <p><strong>Escolaridad:</strong> {usuarioEncontrado.escolaridad}</p>
          <p><strong>Dirección:</strong> {usuarioEncontrado.direccion}</p>
          {usuarioEncontrado.foto && (
            <div>
              <strong>Foto:</strong><br />
              <img src={usuarioEncontrado.foto} alt="Usuario" width={120} />
            </div>
          )}
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />
      <h2>Todos los usuarios registrados</h2>
      <button onClick={cargarUsuarios}>Ver todos</button>
      <button onClick={ordenarPorNombre} style={{ marginLeft: 10 }}>
        Ordenar por nombre {ordenAscendente ? "▲" : "▼"}
      </button>

      {todosUsuarios.length > 0 && (
        <div style={{ marginTop: 20, overflowX: "auto" }}>
          <table className="tabla-usuarios">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>CURP</th>
                <th>Email</th>
                <th>Fecha Nac</th>
                <th>Escolaridad</th>
                <th>Dirección</th>
                <th>Foto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {todosUsuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td>{u.curp}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.fechaNacimiento).toLocaleDateString()}</td>
                  <td>{u.escolaridad}</td>
                  <td>{u.direccion}</td>
                  <td>{u.foto && <img src={u.foto} alt="Foto" width={60} />}</td>
                  <td>
                    <button onClick={() => eliminarUsuario(u.curp)}>Eliminar</button>
                    <button onClick={() => editarUsuario(u)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

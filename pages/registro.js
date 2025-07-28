import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

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
      console.error("Error al obtener todos los usuarios:", err);
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

      if (editando && usuarioEncontrado) {
        // Actualizar usuario
        const res = await fetch(`/api/usuarios/${usuarioEncontrado.curp}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok) {
          alert("Usuario actualizado con éxito");
          setEditando(false);
          setUsuarioEncontrado(null);
          reset();
          setFoto(null);
          setFotoUrl("");
          cargarUsuarios();
        } else {
          alert("Error al actualizar: " + result.error);
        }
      } else {
        // Crear usuario nuevo
        const res = await fetch("/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok) {
          alert("Usuario registrado con éxito");
          reset();
          setFoto(null);
          setFotoUrl("");
          cargarUsuarios();
        } else {
          alert("Error al registrar: " + result.error);
        }
      }
    } catch (err) {
      console.error("Error en el envío:", err);
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
    } catch (error) {
      alert("Error al buscar usuario");
      console.error(error);
    }
  };

  const eliminarUsuario = async (curp) => {
    const confirmar = confirm("¿Estás seguro de eliminar este usuario?");
    if (!confirmar) return;

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
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
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
      password: "", // vaciar contraseña para no mostrar
    });

    setFotoUrl(usuario.foto || "");
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h1>Registro de usuarios</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="CURP" {...register("curp")} disabled={editando} />
        <p>{errors.curp?.message}</p>

        <input placeholder="NOMBRE" {...register("nombre")} />
        <p>{errors.nombre?.message}</p>

        <input placeholder="APELLIDOS" {...register("apellidos")} />
        <p>{errors.apellidos?.message}</p>

        <input placeholder="CORREO" {...register("email")} />
        <p>{errors.email?.message}</p>

        <input placeholder="FECHA_NACIMIENTO (YYYY-MM-DD)" {...register("fechaNacimiento")} />
        <p>{errors.fechaNacimiento?.message}</p>

        <input placeholder="Dirección" {...register("direccion")} />
        <p>{errors.direccion?.message}</p>

        <select {...register("escolaridad")}>
          <option value="">Selecciona un nivel</option>
          <option value="primaria">Primaria</option>
          <option value="secundaria">Secundaria</option>
          <option value="preparatoria">Preparatoria</option>
          <option value="universidad">Universidad</option>
        </select>
        <p>{errors.escolaridad?.message}</p>

        <input type="password" placeholder="Contraseña" {...register("password")} />
        <p>{errors.password?.message}</p>

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

      {todosUsuarios.length > 0 && (
        <div style={{ marginTop: 20 }}>
          {todosUsuarios.map((u) => (
            <div key={u.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
              <p><strong>CURP:</strong> {u.curp}</p>
              <p><strong>Nombre:</strong> {u.nombre} {u.apellidos}</p>
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Fecha Nac:</strong> {new Date(u.fechaNacimiento).toLocaleDateString()}</p>
              <p><strong>Escolaridad:</strong> {u.escolaridad}</p>
              <p><strong>Dirección:</strong> {u.direccion}</p>
              {u.foto && <img src={u.foto} alt="Foto" width={100} />}
              <br />
              <button onClick={() => eliminarUsuario(u.curp)} style={{ marginRight: 10 }}>Eliminar</button>
              <button onClick={() => editarUsuario(u)}>Editar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

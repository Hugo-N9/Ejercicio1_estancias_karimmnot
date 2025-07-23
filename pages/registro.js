import { useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
const schema = z.object({
    curp : z.string().length(18, "La CURP debe tener 18 Caracteres"),
    nombre: z.string().min(3,"El nombre no es valido"),
    apellidos: z.string().min(3,"El apellido es invalido"),
    email : z.string().email("correo invalido"),
    fechaNacimiento : z.string().refine((val) => {
        const fecha = new Date(val);
        const edad = new Date().getFullYear() - fecha.getFullYear();
        return edad >= 18;
    } ,{
        message :"debes ser mayor de 18 años",
    }),
    direccion: z.string().min(5, "La direccion es invalida"),
    escolaridad: z.string().min(1,"Seleccione Nivel de Estudios"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function Registro(){
     const {
        register,
        handleSubmit,
        formState: { errors },
     } = useForm({
        resolver: zodResolver(schema),
     });
     const onSubmit =  async (data) =>{
        console.log("datos recibidos", data);
        try {
            if (foto) {
        const formData = new FormData();
        formData.append("file", foto);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          data.foto = uploadData.url;
          setFotoUrl(uploadData.url);
        } else {
          alert("Error al subir imagen");
          return;
        }
      }

           const response = await fetch("/api/usuarios",{
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify(data),
           }) ;
           const result = await response.json();
           if(response.ok){
            console.log("usuario creado",result);
            alert("usuario registrado con exito");
           }else{
            console.error("Error API", result.error);
            alert("Error: "+result.error);
           }
        }catch(err){
            console.log("error en el fetch", err);
            alert("ocurrio un error al enviar los datos");
        }
     };
     const [buscarCurp, setBuscarCurp] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
     const [foto, setFoto] = useState(null);
    const [fotoUrl, setFotoUrl] = useState("");

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
    const handleFoto = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setFoto(file);
    } else {
      alert("Solo se permiten imágenes PNG o JPEG");
    }
  };
     return (
        <div style={{maxWidth: 500,margin: "auto", padding: 20}}>
            <h1>Registro de usuarios</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input placeholder="CURP" {...register("curp")}></input>
                <p>{errors.curp?.message}</p>

                <input placeholder="NOMBRE" {...register("nombre")}></input>
                <p>{errors.nombre?.message}</p>

                <input placeholder="APELLIDOS" {...register("apellidos")}></input>
                <p>{errors.apellidos?.message}</p>

                <input placeholder="CORREO" {...register("email")}></input>
                <p>{errors.email?.message}</p>

                <input placeholder="FECHA_NACIMIENTO (YYYY-MM-DD)" {...register("fechaNacimiento")}></input>
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
                <input type="password" placeholder="Contraseña" {...register("password")}/>
                <p>{errors.password?.message}</p>

                 <label>Foto de perfil (PNG o JPEG)</label>
                 <input type="file" accept="image/png, image/jpeg" onChange={handleFoto} />
                {fotoUrl && <img src={fotoUrl} alt="Vista previa" width={120} />}


                <button type="submit">Guardar Datos</button>
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

      {usuarioEncontrado && (
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
        </div>
     );
}
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { curp } = req.query;

  if (req.method === "GET") {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { curp },
      });

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  } 
   if (req.method === "PUT") {
    try {
      const { nombre, apellidos, email, direccion, escolaridad } = req.body;

      const usuarioActualizado = await prisma.usuario.update({
        where: { curp },
        data: {
          nombre,
          apellidos,
          email,
          direccion,
          escolaridad,
        },
      });

      return res.status(200).json(usuarioActualizado);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res.status(500).json({ error: "No se pudo actualizar el usuario" });
    }
  }
  else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
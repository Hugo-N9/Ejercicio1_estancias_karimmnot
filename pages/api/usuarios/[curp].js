import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { curp } = req.query;

  if (req.method === "GET") {
    try {
      const usuario = await prisma.usuario.findUnique({ where: { curp } });

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
      const { nombre, apellidos, email, direccion, escolaridad, password, fechaNacimiento, foto } = req.body;

      const dataToUpdate = {
        nombre,
        apellidos,
        email,
        direccion,
        escolaridad,
        foto,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
      };

      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }

      const usuarioActualizado = await prisma.usuario.update({
        where: { curp },
        data: dataToUpdate,
      });

      return res.status(200).json(usuarioActualizado);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res.status(500).json({ error: "No se pudo actualizar el usuario" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.usuario.delete({ where: { curp } });
      return res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return res.status(500).json({ error: "No se pudo eliminar el usuario" });
    }
  }

  // Método no permitido
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Método ${req.method} no permitido`);
}
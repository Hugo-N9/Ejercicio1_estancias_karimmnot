import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { curp, nombre, apellidos, email, fechaNacimiento, direccion, escolaridad } = req.body;

    if (!curp || curp.length !== 18) {
      return res.status(409).json({ error: "La CURP es inválida" });
    }

    // Validar dirección con la API de Google
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const encodedAddress = encodeURIComponent(direccion);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    try {
      const geoResponse = await axios.get(url);
      const geoData = geoResponse.data;

      if (
        !geoData ||
        geoData.status !== "OK" ||
        !geoData.results ||
        geoData.results.length === 0
      ) {
        return res.status(400).json({ error: "La dirección ingresada no es válida" });
      }

      const direccionNormalizada = geoData.results[0].formatted_address;

      const existe = await prisma.usuario.findUnique({ where: { curp } });
      if (existe) {
        return res.status(409).json({ error: "La CURP ingresada ya fue registrada" });
      }

      const usuario = await prisma.usuario.create({
        data: {
          curp,
          nombre,
          apellidos,
          email,
          fechaNacimiento: new Date(fechaNacimiento),
          direccion: direccionNormalizada,
          escolaridad,
        },
      });

      return res.status(201).json(usuario);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      return res.status(500).json({ error: "Error del servidor" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}

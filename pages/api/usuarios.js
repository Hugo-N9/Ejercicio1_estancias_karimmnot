import { PrismaClient } from "@prisma/client";
import axios from "axios";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req, res) {

    if (req.method === "GET") {
    try {
      const usuarios = await prisma.usuario.findMany();
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return res.status(500).json({ error: "No se pudieron obtener los usuarios" });
    }
  }


  if (req.method === "POST") {
    const { curp, nombre, apellidos, email, fechaNacimiento, direccion, escolaridad, password, foto} = req.body;

    if (!curp || curp.length !== 18) {
      return res.status(409).json({ error: "La CURP es inválida" });
    }

   

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
     // const encodedDireccion = encodeURIComponent(direccion);
     // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedDireccion}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
     // const geoResponse = await axios.get(url);
     // const geoData = geoResponse.data;

     // if (
      //  !geoData ||
      //  geoData.status !== "OK" ||
       // !geoData.results ||
        //geoData.results.length === 0
     // ) {
      //  return res.status(400).json({ error: "La dirección ingresada no es válida" });
     // }

     // const direccionNormalizada = geoData.results[0].formatted_address;

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
          direccion,
          escolaridad,
          foto,
          password: hashedPassword, 
        },
      });

      return res.status(201).json(usuario);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      return res.status(500).json({ error: "Error del servidor" });
    }
  } else {
    res.setHeader("Allow", ["POST","GET"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(" Error al parsear:", err);
      return res.status(500).json({ error: "Error al procesar archivo" });
    }

    console.log(" Archivos recibidos:", files);
    console.log(" Campos recibidos:", fields);

    const fileInput = files.file;
    const file = Array.isArray(fileInput) ? fileInput[0] : fileInput;

    if (!file || !file.filepath) {
      return res.status(400).json({ error: "Archivo no recibido o inválido" });
    }

    try {
      const fileContent = fs.readFileSync(file.filepath);
      const extension = path.extname(file.originalFilename || "archivo").slice(1);
      const filename = `usuarios/${Date.now()}.${extension}`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: fileContent,
        ContentType: file.mimetype,
         //AQUI BORRE ACL
      };
      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
      return res.status(200).json({ url });
    } catch (uploadError) {
      console.error(" Error al subir a S3:", uploadError);
      return res.status(500).json({ error: "Error al subir a S3" });
    }
  });
}
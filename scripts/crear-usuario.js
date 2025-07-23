const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const nuevoUsuario = await prisma.usuario.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      nombre: 'Admin',
      apellidos: 'Inicial',
      curp: 'XAXX010101HNEXXXA4',
      fechaNacimiento: new Date('2000-01-01'),
      escolaridad: 'Bachillerato',
    },
  });

  console.log('✅ Usuario creado:', nuevoUsuario);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
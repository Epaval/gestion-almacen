 // prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createUbicaciones() {
  const ubicaciones = [];

  // Letras por lado
  const izquierdo = ['A', 'B', 'C', 'D', 'E'];
  const derecho = ['F', 'G', 'H', 'I', 'J'];

  for (let pasillo = 1; pasillo <= 15; pasillo++) {
    const pasilloStr = pasillo.toString().padStart(2, '0');  

    // Lado izquierdo
    for (const letra of izquierdo) {
      for (let nivel = 1; nivel <= 5; nivel++) {
        ubicaciones.push({
          pasillo,
          lado: 'izquierdo',
          letra,
          nivel,
          nombre: `P${pasilloStr}-${letra}-${nivel}`,
          coordenadaX: (pasillo - 1) * 100, // espaciado horizontal
          coordenadaY: izquierdo.indexOf(letra) * 50 + nivel * 10, // vertical
        });
      }
    }

    // Lado derecho
    for (const letra of derecho) {
      for (let nivel = 1; nivel <= 5; nivel++) {
        ubicaciones.push({
          pasillo,
          lado: 'derecho',
          letra,
          nivel,
          nombre: `P${pasilloStr}-${letra}-${nivel}`,
          coordenadaX: (pasillo - 1) * 100 + 300, // desplazado a la derecha
          coordenadaY: derecho.indexOf(letra) * 50 + nivel * 10,
        });
      }
    }
  }

  // Insertar en lote
  for (const u of ubicaciones) {
    await prisma.ubicacion.upsert({
      where: { nombre: u.nombre },
      update: {},
      create: u,
    });
  }

  console.log(`✅ Creadas ${ubicaciones.length} ubicaciones`);
}

async function main() {
  // Crear usuario admin
  const pass = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@almacen.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@almacen.com',
      password: pass,
      rol: 'ADMIN',
    },
  });

  // Crear ubicaciones
  await createUbicaciones();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
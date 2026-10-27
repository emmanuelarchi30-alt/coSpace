import { PrismaClient, Role, SpaceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting CoSpace database seeding...');

  // 1. Clean existing records in reverse relation order
  await prisma.reservation.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);
  const userPasswordHash = await bcrypt.hash('UserPassword123!', salt);

  // 3. Create Administrator
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador CoSpace',
      email: 'admin@cospace.com',
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 4. Create Standard Demo User
  const user = await prisma.user.create({
    data: {
      name: 'Usuario Demo',
      email: 'demo@cospace.com',
      password: userPasswordHash,
      role: Role.USER,
    },
  });
  console.log(`✅ Demo user created: ${user.email}`);

  // 5. Create Sample Spaces
  const spacesData = [
    {
      name: 'Escritorio Flexible Zona Zen',
      description: 'Puesto individual en área de concentración con silla ergonómica Herman Miller, monitor 4K y conexión de alta velocidad.',
      type: SpaceType.DESK,
      capacity: 1,
      pricePerHour: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      location: 'Piso 2 - Área Silenciosa',
      amenities: ['WiFi 6', 'Monitor 4K', 'Silla ergonómica', 'Café ilimitado', 'Enchufes universales'],
      isActive: true,
    },
    {
      name: 'Escritorio Dedicado Focus Pod',
      description: 'Espacio fijo privado para trabajar durante todo el día con máxima tranquilidad y luz natural.',
      type: SpaceType.DESK,
      capacity: 1,
      pricePerHour: 18.50,
      imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
      location: 'Piso 2 - Módulo 14',
      amenities: ['WiFi 6', 'Lockers de seguridad', 'Luz regulable', 'Café y Té', 'Puertos USB-C'],
      isActive: true,
    },
    {
      name: 'Sala de Juntas Innovación',
      description: 'Sala ejecutiva para presentaciones corporativas, equipada con pantalla táctil de 75 pulgadas y videoconferencia 4K.',
      type: SpaceType.MEETING_ROOM,
      capacity: 10,
      pricePerHour: 55.00,
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
      location: 'Piso 3 - Sala Ejecutiva A',
      amenities: ['Videoconferencia 4K', 'Pantalla táctil 75"', 'Pizarra digital', 'Servicio de catering', 'WiFi ultra rápido'],
      isActive: true,
    },
    {
      name: 'Sala Creativa Brainstorming',
      description: 'Espacio dinámico con sillones modulares, pizarras en todas las paredes y proyector láser para sesiones de diseño ágil.',
      type: SpaceType.MEETING_ROOM,
      capacity: 6,
      pricePerHour: 40.00,
      imageUrl: 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=80',
      location: 'Piso 3 - Sala Creativa B',
      amenities: ['Paredes pizarra', 'Post-its y marcadores', 'Proyector láser', 'Café de especialidad', 'Sonido envolvente'],
      isActive: true,
    },
    {
      name: 'Cabina Acústica Silence One',
      description: 'Cabina insonorizada individual ideal para videollamadas privadas, entrevistas o grabaciones de podcasts.',
      type: SpaceType.CABIN,
      capacity: 1,
      pricePerHour: 22.00,
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      location: 'Piso 1 - Cabina 01',
      amenities: ['Aislamiento acústico 38dB', 'Luz LED graduable', 'Micrófono condensador', 'Ventilación activa silenciosa'],
      isActive: true,
    },
    {
      name: 'Cabina Dual Podcast & Pitch',
      description: 'Cabina insonorizada para 2 personas diseñada especialmente para negociaciones privadas y grabaciones de audio/video.',
      type: SpaceType.CABIN,
      capacity: 2,
      pricePerHour: 32.00,
      imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      location: 'Piso 1 - Cabina 02',
      amenities: ['Aislamiento acústico', '2 micrófonos Shure', 'Ring light', 'Mesa de madera natural', 'Enchufes y USB-C'],
      isActive: true,
    },
  ];

  for (const space of spacesData) {
    const created = await prisma.space.create({ data: space });
    console.log(`✅ Space created: ${created.name} (${created.type}) - \$${created.pricePerHour}/h`);
  }

  console.log('✨ Seeding finished successfully!');
}

main()
  .catch((e: unknown) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

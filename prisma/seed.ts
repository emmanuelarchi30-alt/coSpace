import { PrismaClient, Role, SpaceType, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando carga de datos iniciales (seed) en Supabase...');

  // 1. Limpieza de registros previos en orden relacional seguro
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.spaceAmenity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();

  // 2. Generación segura de contraseñas hasheadas con bcrypt
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);
  const userPasswordHash = await bcrypt.hash('UserPassword123!', salt);

  // 3. Creación del usuario Administrador (Regla: no se crea desde registro público)
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador CoSpace',
      email: 'admin@cospace.com',
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Administrador creado: ${admin.email}`);

  // 4. Creación del usuario estándar de demostración
  const user = await prisma.user.create({
    data: {
      name: 'Usuario Demo',
      email: 'demo@cospace.com',
      password: userPasswordHash,
      role: Role.USER,
    },
  });
  console.log(`✅ Usuario de prueba creado: ${user.email}`);

  // 5. Creación del catálogo maestro de comodidades (tabla relacional amenities)
  const amenitiesList = [
    { name: 'WiFi 6 Simétrico', icon: 'Wifi', description: 'Fibra óptica dedicada de 1Gbps de bajada y subida' },
    { name: 'Monitor 4K', icon: 'Monitor', description: 'Pantalla Dell UltraSharp 4K con hub USB-C' },
    { name: 'Silla ergonómica', icon: 'Armchair', description: 'Silla ergonómica de oficina Herman Miller Aeron' },
    { name: 'Café de Especialidad', icon: 'Coffee', description: 'Café de grano tostado artesanal y té ilimitado' },
    { name: 'Aislamiento 38dB', icon: 'Shield', description: 'Aislamiento acústico multicapa certificado' },
    { name: 'Videoconferencia 4K', icon: 'Camera', description: 'Cámara 4K gran angular con auto-enfoque' },
    { name: 'Pantalla táctil 75"', icon: 'Tv', description: 'Pantalla interactiva 4K con pizarra táctil' },
    { name: 'Micrófonos Shure', icon: 'Mic', description: 'Micrófonos de estudio para podcasts y reuniones' },
  ];

  const createdAmenities: Record<string, string> = {};
  for (const item of amenitiesList) {
    const am = await prisma.amenity.create({ data: item });
    createdAmenities[am.name] = am.id;
  }
  console.log(`✅ Catálogo de comodidades creado (${amenitiesList.length} registros)`);

  // 6. Creación de Espacios de Coworking (Escritorios, Salas de Reunión y Cabinas)
  const spacesData = [
    {
      name: 'Escritorio Flexible Zona Zen',
      description: 'Puesto individual en área de concentración con silla ergonómica Herman Miller, monitor 4K y conexión de alta velocidad.',
      type: SpaceType.DESK,
      capacity: 1,
      pricePerHour: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      location: 'Piso 2 - Área Silenciosa',
      amenities: ['WiFi 6 Simétrico', 'Monitor 4K', 'Silla ergonómica', 'Café de Especialidad'],
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
      amenities: ['WiFi 6 Simétrico', 'Monitor 4K', 'Café de Especialidad'],
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
      amenities: ['Videoconferencia 4K', 'Pantalla táctil 75"', 'Café de Especialidad', 'WiFi 6 Simétrico'],
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
      amenities: ['Videoconferencia 4K', 'Café de Especialidad', 'WiFi 6 Simétrico'],
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
      amenities: ['Aislamiento 38dB', 'WiFi 6 Simétrico', 'Café de Especialidad'],
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
      amenities: ['Aislamiento 38dB', 'Micrófonos Shure', 'WiFi 6 Simétrico'],
      isActive: true,
    },
  ];

  const createdSpaces: Array<{ id: string; name: string; price: number }> = [];
  for (const space of spacesData) {
    const created = await prisma.space.create({ data: space });
    createdSpaces.push({ id: created.id, name: created.name, price: Number(created.pricePerHour) });

    // Vincular comodidades en tabla pivote space_amenities
    for (const amName of space.amenities) {
      const amenityId = createdAmenities[amName];
      if (amenityId) {
        await prisma.spaceAmenity.create({
          data: {
            spaceId: created.id,
            amenityId: amenityId,
          },
        });
      }
    }
    console.log(`✅ Espacio creado y vinculado: ${created.name} (${created.type})`);
  }

  // 7. Registro de Auditoría de Creación Inicial
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INITIALIZATION',
      entity: 'System',
      entityId: 'seed_init',
      details: 'Catálogo base de espacios y usuarios configurados exitosamente en Supabase',
    },
  });

  // 8. Crear una reserva de demostración para el usuario con pago y auditoría
  const sampleSpace = createdSpaces[0];
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 2); // 2 días en el futuro
  startTime.setHours(10, 0, 0, 0); // 10:00 AM
  const endTime = new Date(startTime);
  endTime.setHours(12, 0, 0, 0); // 12:00 PM (2 horas)
  const totalAmount = sampleSpace.price * 2;

  const sampleReservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      spaceId: sampleSpace.id,
      startTime,
      endTime,
      hours: 2,
      totalPrice: totalAmount,
      status: 'CONFIRMED',
      idempotencyKey: 'seed_sample_reservation_1',
    },
  });

  // Registrar pago correspondiente
  await prisma.payment.create({
    data: {
      reservationId: sampleReservation.id,
      amount: totalAmount,
      currency: 'USD',
      status: PaymentStatus.PAID,
      paymentMethod: 'CREDIT_CARD',
    },
  });

  // Registrar auditoría de la reserva
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      reservationId: sampleReservation.id,
      action: 'RESERVATION_CREATED',
      entity: 'Reservation',
      entityId: sampleReservation.id,
      details: `Reserva inicial creada para ${sampleSpace.name} (2 horas)`,
    },
  });
  console.log(`✅ Reserva de prueba creada con pago y registro de auditoría`);

  console.log('✨ Base de datos poblada exitosamente en Supabase!');
}

main()
  .catch((e: unknown) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

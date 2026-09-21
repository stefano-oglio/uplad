import { hash } from "bcryptjs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaClient, ClientPeriodStatus, ReminderStep } from "@prisma/client";

const prisma = new PrismaClient();

async function writePlaceholderDoc(
  orgId: string,
  clientId: string,
  periodId: string,
  fileName: string
) {
  const storageRoot = process.env.LOCAL_STORAGE_PATH ?? "./.data/uploads";
  const key = `${orgId}/${clientId}/${periodId}/${fileName}`;
  const full = path.resolve(storageRoot, key);
  await mkdir(path.dirname(full), { recursive: true });
  // Minimal valid JPEG (1x1 pixel)
  const jpeg = Buffer.from(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAG/AP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z",
    "base64"
  );
  await writeFile(full, jpeg);
  return { key, size: jpeg.length };
}

const CLIENT_NAMES = [
  { name: "Bar La Esquina", nif: "B12345678", phone: "+34600111001", email: "barlaesquina@demo.local", notes: "Hostelería — ticket Z diario" },
  { name: "Taxi García SL", nif: "B23456789", phone: "+34600111002", email: "taxi.garcia@demo.local", notes: "Autónomo taxi" },
  { name: "Reformas Norte", nif: "B34567890", phone: "+34600111003", email: "reformas.norte@demo.local", notes: "Obras y reformas" },
  { name: "Farmacia Sol", nif: "B45678901", phone: "+34600111004", email: "farmacia.sol@demo.local", notes: null },
  { name: "Panadería Molino", nif: "B56789012", phone: "+34600111005", email: "panaderia.molino@demo.local", notes: "Comercio minorista" },
  { name: "Clínica Dental Río", nif: "B67890123", phone: "+34600111006", email: "dental.rio@demo.local", notes: null },
  { name: "Autoescuela Rápida", nif: "B78901234", phone: "+34600111007", email: "autoescuela@demo.local", notes: null },
  { name: "Peluquería Aroma", nif: "B89012345", phone: "+34600111008", email: "aroma.pelo@demo.local", notes: null },
  { name: "Fontanería Méndez", nif: "B90123456", phone: "+34600111009", email: "fontaneria.mendez@demo.local", notes: "Reformas" },
  { name: "Café Central", nif: "B01234567", phone: "+34600111010", email: "cafe.central@demo.local", notes: "Hostelería" },
  { name: "Tienda Moda Vera", nif: "B11223344", phone: "+34600111011", email: "moda.vera@demo.local", notes: "Comercio" },
  { name: "Electricidad Luzya", nif: "B22334455", phone: "+34600111012", email: "luzya@demo.local", notes: null },
  { name: "Gimnasio Pulse", nif: "B33445566", phone: "+34600111013", email: "pulse.gym@demo.local", notes: null },
  { name: "Veterinaria Amigos", nif: "B44556677", phone: "+34600111014", email: "vet.amigos@demo.local", notes: null },
  { name: "Lavandería Blanca", nif: "B55667788", phone: "+34600111015", email: "lavanderia.blanca@demo.local", notes: null },
  { name: "Carpintería Roble", nif: "B66778899", phone: "+34600111016", email: "roble.carp@demo.local", notes: "Reformas" },
  { name: "Floristería Tulipán", nif: "B77889900", phone: "+34600111017", email: "tulipan@demo.local", notes: "Comercio" },
  { name: "Informática Bits", nif: "B88990011", phone: "+34600111018", email: "bits.info@demo.local", notes: null },
  { name: "Asador El Prado", nif: "B99001122", phone: "+34600111019", email: "asador.prado@demo.local", notes: "Hostelería" },
  { name: "Mudanzas Ágiles", nif: "B00112233", phone: "+34600111020", email: "mudanzas.agiles@demo.local", notes: null },
];

function currentQuarterInfo(now = new Date()) {
  const month = now.getMonth(); // 0-11
  const quarter = Math.floor(month / 3) + 1;
  const year = now.getFullYear();
  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);
  // Deadline ~25 days from now so AT_RISK window (J-21) is active
  const deadlineDate = new Date(now);
  deadlineDate.setDate(deadlineDate.getDate() + 25);
  deadlineDate.setHours(18, 0, 0, 0);
  return {
    year,
    quarter,
    label: `${quarter}T ${year}`,
    startDate,
    endDate,
    deadlineDate,
  };
}

async function main() {
  console.log("🌱 Seeding DocInbox…");

  await prisma.reminderEvent.deleteMany();
  await prisma.reminderJob.deleteMany();
  await prisma.document.deleteMany();
  await prisma.magicLink.deleteMany();
  await prisma.clientPeriod.deleteMany();
  await prisma.period.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: { name: "Gestoría Demo SL" },
  });

  const passwordHash = await hash("demo1234", 10);

  await prisma.user.createMany({
    data: [
      {
        organizationId: org.id,
        email: "asesor@demo.local",
        name: "Ana Asesora",
        role: "ADMIN",
        passwordHash,
      },
      {
        organizationId: org.id,
        email: "asesor2@demo.local",
        name: "Luis Asesor",
        role: "ADVISOR",
        passwordHash,
      },
    ],
  });

  const q = currentQuarterInfo();
  const period = await prisma.period.create({
    data: {
      organizationId: org.id,
      label: q.label,
      year: q.year,
      quarter: q.quarter,
      startDate: q.startDate,
      endDate: q.endDate,
      deadlineDate: q.deadlineDate,
      isActive: true,
    },
  });

  // Previous period (inactive) for UI context
  const prevQuarter = q.quarter === 1 ? 4 : q.quarter - 1;
  const prevYear = q.quarter === 1 ? q.year - 1 : q.year;
  await prisma.period.create({
    data: {
      organizationId: org.id,
      label: `${prevQuarter}T ${prevYear}`,
      year: prevYear,
      quarter: prevQuarter,
      startDate: new Date(prevYear, (prevQuarter - 1) * 3, 1),
      endDate: new Date(prevYear, prevQuarter * 3, 0, 23, 59, 59),
      deadlineDate: new Date(prevYear, prevQuarter * 3, 20),
      isActive: false,
    },
  });

  for (let i = 0; i < CLIENT_NAMES.length; i++) {
    const c = CLIENT_NAMES[i];
    const client = await prisma.client.create({
      data: {
        organizationId: org.id,
        name: c.name,
        nif: c.nif,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        remindersPaused: i === 19, // last one paused
      },
    });

    // Mix of statuses for demo: first 4 COMPLETE, next 6 IN_PROGRESS (via status), rest AT_RISK
    let status: ClientPeriodStatus = ClientPeriodStatus.AT_RISK;
    let completedAt: Date | null = null;
    let completedBy: "CLIENT" | "ADVISOR" | null = null;
    if (i < 4) {
      status = ClientPeriodStatus.COMPLETE;
      completedAt = new Date();
      completedBy = i % 2 === 0 ? "CLIENT" : "ADVISOR";
    } else if (i < 10) {
      status = ClientPeriodStatus.IN_PROGRESS;
    }

    const cp = await prisma.clientPeriod.create({
      data: {
        clientId: client.id,
        periodId: period.id,
        status,
        completedAt,
        completedBy,
        lastActivityAt: status !== "AT_RISK" ? new Date() : null,
      },
    });

    // Docs reales mínimos para IN_PROGRESS / COMPLETE (semáforos correctos)
    if (status === ClientPeriodStatus.IN_PROGRESS || status === ClientPeriodStatus.COMPLETE) {
      const placeholder = await writePlaceholderDoc(
        org.id,
        client.id,
        period.id,
        `factura-ejemplo-${i + 1}.jpg`
      );
      await prisma.document.create({
        data: {
          clientPeriodId: cp.id,
          storageKey: placeholder.key,
          originalFileName: `factura-ejemplo-${i + 1}.jpg`,
          mimeType: "image/jpeg",
          sizeBytes: placeholder.size,
        },
      });
    }

    if (!completedAt && !client.remindersPaused) {
      const steps = [ReminderStep.R1, ReminderStep.R2, ReminderStep.R3, ReminderStep.R4] as const;
      const offsets = [21, 14, 7, 3];
      for (let s = 0; s < steps.length; s++) {
        const scheduledFor = new Date(period.deadlineDate);
        scheduledFor.setDate(scheduledFor.getDate() - offsets[s]);
        scheduledFor.setHours(10, 0, 0, 0);
        await prisma.reminderJob.create({
          data: {
            clientPeriodId: cp.id,
            step: steps[s],
            scheduledFor,
            status: "PENDING",
            channel: "EMAIL",
          },
        });
      }
    }
  }

  console.log("✅ Seed completo");
  console.log("   Org: Gestoría Demo SL");
  console.log("   Asesor: asesor@demo.local / demo1234");
  console.log(`   Periodo activo: ${period.label} (deadline ${period.deadlineDate.toISOString().slice(0, 10)})`);
  console.log("   Clientes: 20");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

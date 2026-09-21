/**
 * Smoke tests: upload + status transition (API/service level).
 * Run: pnpm db:seed && pnpm test:smoke
 */
import { config } from "dotenv";
config();

import { PrismaClient, ClientPeriodStatus } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createHash, randomBytes } from "crypto";

const prisma = new PrismaClient();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

async function main() {
  console.log("Running smoke tests…");

  const org = await prisma.organization.findFirst();
  assert(org, "org exists");

  const period = await prisma.period.findFirst({
    where: { organizationId: org!.id, isActive: true },
  });
  assert(period, "active period");

  // Pick an AT_RISK client without docs
  const atRisk = await prisma.clientPeriod.findFirst({
    where: {
      periodId: period!.id,
      status: ClientPeriodStatus.AT_RISK,
      documents: { none: {} },
    },
    include: { client: true, reminderJobs: true },
  });
  assert(atRisk, "AT_RISK clientPeriod without docs");

  // Simulate upload
  const storageRoot = process.env.LOCAL_STORAGE_PATH ?? "./.data/uploads";
  const key = `${org!.id}/${atRisk!.clientId}/${period!.id}/smoke-${Date.now()}.jpg`;
  const full = path.resolve(storageRoot, key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from("smoke-test"));

  await prisma.document.create({
    data: {
      clientPeriodId: atRisk!.id,
      storageKey: key,
      originalFileName: "smoke.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 10,
    },
  });

  await prisma.clientPeriod.update({
    where: { id: atRisk!.id },
    data: {
      status: ClientPeriodStatus.IN_PROGRESS,
      lastActivityAt: new Date(),
    },
  });

  const afterUpload = await prisma.clientPeriod.findUnique({
    where: { id: atRisk!.id },
    include: { _count: { select: { documents: true } } },
  });
  assert(afterUpload?.status === "IN_PROGRESS", "status → IN_PROGRESS after upload");
  assert((afterUpload?._count.documents ?? 0) >= 1, "has ≥1 document");

  // Complete + cancel reminders
  await prisma.clientPeriod.update({
    where: { id: atRisk!.id },
    data: {
      status: ClientPeriodStatus.COMPLETE,
      completedAt: new Date(),
      completedBy: "CLIENT",
    },
  });
  await prisma.reminderJob.updateMany({
    where: { clientPeriodId: atRisk!.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });

  const afterComplete = await prisma.clientPeriod.findUnique({
    where: { id: atRisk!.id },
    include: {
      reminderJobs: { where: { status: "PENDING" } },
    },
  });
  assert(afterComplete?.status === "COMPLETE", "status → COMPLETE");
  assert(
    (afterComplete?.reminderJobs.length ?? 0) === 0,
    "no PENDING reminder jobs"
  );

  // Magic link hash roundtrip
  const raw = randomBytes(16).toString("base64url");
  const hash = createHash("sha256").update(raw).digest("hex");
  await prisma.magicLink.create({
    data: {
      clientId: atRisk!.clientId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });
  const found = await prisma.magicLink.findUnique({ where: { tokenHash: hash } });
  assert(found, "magic link stored hashed");

  console.log("✅ Smoke tests passed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

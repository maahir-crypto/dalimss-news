/**
 * Recompute Article.readTimeInMinutes from visible words.
 *
 * Dry-run by default. Pass --apply to write. The write is a SQL UPDATE of
 * readTimeInMinutes only, so Prisma's @updatedAt is not touched and no other
 * column changes. Running it again is a no-op once values match the helper.
 *
 * Do not point DATABASE_URL at production unless you intend to apply.
 * This script refuses to apply when it is executing inside Vercel.
 *
 *   npx tsx scripts/backfill-read-time.ts
 *   npx tsx scripts/backfill-read-time.ts --apply
 */
import { Prisma, PrismaClient } from "@prisma/client";
import {
  planReadTimeBackfill,
  type ReadTimeBackfillChange,
  type ReadTimeBackfillRow,
} from "../lib/readTime";

const SAMPLE_LIMIT = 12;
const READ_BATCH = 200;
const WRITE_BATCH = 100;

function databaseHost(): string {
  const raw = process.env.DATABASE_URL || "";
  try {
    return new URL(raw).host || "(unset)";
  } catch {
    return raw ? "(unparsed)" : "(unset)";
  }
}

async function loadRows(prisma: PrismaClient): Promise<ReadTimeBackfillRow[]> {
  const rows: ReadTimeBackfillRow[] = [];
  let cursor: number | undefined;
  for (;;) {
    const batch = await prisma.article.findMany({
      take: READ_BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        slug: true,
        content: true,
        readTimeInMinutes: true,
      },
    });
    if (batch.length === 0) break;
    rows.push(...batch);
    cursor = batch[batch.length - 1].id;
  }
  return rows;
}

async function applyChanges(
  prisma: PrismaClient,
  changes: readonly ReadTimeBackfillChange[]
): Promise<number> {
  let written = 0;
  for (let index = 0; index < changes.length; index += WRITE_BATCH) {
    const chunk = changes.slice(index, index + WRITE_BATCH);
    const values = Prisma.join(
      chunk.map((row) => Prisma.sql`(${row.id}::int, ${row.to}::int)`)
    );
    written += await prisma.$executeRaw`
      UPDATE "Article" AS a
      SET "readTimeInMinutes" = v.minutes
      FROM (VALUES ${values}) AS v(id, minutes)
      WHERE a.id = v.id
        AND a."readTimeInMinutes" IS DISTINCT FROM v.minutes
    `;
  }
  return written;
}

function printSample(changes: readonly ReadTimeBackfillChange[]): void {
  const sample = changes.slice(0, SAMPLE_LIMIT);
  for (const change of sample) {
    console.log(`${change.from} -> ${change.to}\t${change.id}\t${change.slug}`);
  }
  if (changes.length > sample.length) {
    console.log(`… ${changes.length - sample.length} more`);
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("Usage: npx tsx scripts/backfill-read-time.ts [--apply]");
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Nothing was read or written.");
    process.exit(1);
  }
  if (apply && process.env.VERCEL === "1") {
    console.error(
      "Refusing to apply inside Vercel. Run this from a workstation against the database you mean to update."
    );
    process.exit(1);
  }

  console.log(
    apply
      ? `read-time backfill: APPLY against ${databaseHost()}`
      : `read-time backfill: dry run against ${databaseHost()}`
  );
  console.log("Only readTimeInMinutes is eligible to change. updatedAt is not written.");

  const prisma = new PrismaClient();
  try {
    const rows = await loadRows(prisma);
    const changes = planReadTimeBackfill(rows);
    console.log(`scanned: ${rows.length}`);
    console.log(`would update: ${changes.length}`);
    console.log(`unchanged: ${rows.length - changes.length}`);
    if (changes.length > 0) {
      console.log("sample (old -> new):");
      printSample(changes);
    }
    if (!apply) {
      console.log("No rows written. Re-run with --apply to update readTimeInMinutes only.");
      return;
    }
    if (changes.length === 0) {
      console.log("Nothing to update.");
      return;
    }
    const written = await applyChanges(prisma, changes);
    console.log(`updated: ${written}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  let message = error instanceof Error ? error.message : "Backfill failed";
  const secret = process.env.DATABASE_URL;
  if (secret) message = message.split(secret).join("[redacted]");
  console.error(message);
  process.exit(1);
});

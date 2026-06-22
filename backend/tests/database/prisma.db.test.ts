import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "../../src/lib/prisma.js";

/**
 * Relational integrity tests against PostgreSQL (Prisma).
 * Covers: CRUD, UNIQUE, FK, NOT NULL and transaction rollback.
 * All records created here use a unique prefix and are cleaned up afterwards.
 */
const TAG = `qa-db-${Date.now()}`;
const createdVenueIds: string[] = [];
const createdUserIds: string[] = [];

afterAll(async () => {
  await prisma.venue.deleteMany({ where: { id: { in: createdVenueIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.$disconnect();
});

describe("PostgreSQL / Prisma — relational integrity", () => {
  it("CRUD: creates, reads, updates and deletes a venue", async () => {
    const created = await prisma.venue.create({
      data: { name: `${TAG}-venue`, city: "QA City", address: "1 Test St", capacity: 100 },
    });
    expect(created.id).toBeTruthy();

    const read = await prisma.venue.findUnique({ where: { id: created.id } });
    expect(read?.name).toBe(`${TAG}-venue`);

    const updated = await prisma.venue.update({
      where: { id: created.id },
      data: { capacity: 250 },
    });
    expect(updated.capacity).toBe(250);

    await prisma.venue.delete({ where: { id: created.id } });
    const afterDelete = await prisma.venue.findUnique({ where: { id: created.id } });
    expect(afterDelete).toBeNull();
  });

  it("UNIQUE: rejects a duplicate user email (P2002)", async () => {
    const email = `${TAG}@stagefront.mx`;
    const u = await prisma.user.create({
      data: { name: "QA", email, password_hash: "x", role: "buyer" },
    });
    createdUserIds.push(u.id);

    await expect(
      prisma.user.create({
        data: { name: "QA dup", email, password_hash: "x", role: "buyer" },
      })
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("FK: rejects an event referencing a non-existent venue (P2003)", async () => {
    await expect(
      prisma.event.create({
        data: {
          title: `${TAG}-evt`,
          artist_name: "X",
          venue_id: "venue-does-not-exist-000",
          date: new Date(),
          total_capacity: 10,
          genre: "test",
          description: "fk test",
          image_url: "",
        },
      })
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });

  it("NOT NULL: rejects creating a venue with a missing required column", async () => {
    await expect(
      // @ts-expect-error intentionally omitting required `city` to test the constraint
      prisma.venue.create({ data: { name: `${TAG}-x`, address: "a", capacity: 1 } })
    ).rejects.toBeTruthy();
  });

  it("ROLLBACK: a failing transaction persists nothing", async () => {
    const marker = `${TAG}-rollback`;
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.venue.create({
          data: { name: marker, city: "QA", address: "a", capacity: 1 },
        });
        throw new Error("forced failure to trigger rollback");
      })
    ).rejects.toThrow(/forced failure/);

    const leaked = await prisma.venue.findFirst({ where: { name: marker } });
    expect(leaked).toBeNull();
  });
});

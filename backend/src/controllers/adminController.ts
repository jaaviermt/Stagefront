import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { isEventSoldOut } from "../services/eventService.js";

export async function getAdminStats(_req: Request, res: Response): Promise<void> {
  try {
    const [activeEvents, totalOrders, revenueAgg, activeResales, events, orderItems] =
      await Promise.all([
        prisma.event.count({ where: { status: "published" } }),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.resale.count({ where: { status: "active" } }),
        prisma.event.findMany({
          where: { status: "published" },
          include: { venue: true, zones: true },
        }),
        prisma.orderItem.findMany({ select: { price: true } }),
      ]);

    const soldOutEvents = events.filter((e) =>
      isEventSoldOut(e.zones.map((z) => ({ ...z, price: Number(z.price) })))
    ).length;

    const avgTicketPrice =
      orderItems.length > 0
        ? orderItems.reduce((sum, i) => sum + Number(i.price), 0) / orderItems.length
        : 0;

    res.json({
      data: {
        activeEvents,
        totalOrders,
        revenue: Number(revenueAgg._sum.total ?? 0),
        activeResales,
        soldOutEvents,
        avgTicketPrice,
        currency: "MXN",
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
}

export async function getAdminOrders(_req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(Number(_req.query.limit) || 10, 50);
    const orders = await prisma.order.findMany({
      take: limit,
      include: {
        user: { select: { email: true, name: true } },
        event: { select: { title: true } },
      },
      orderBy: { created_at: "desc" },
    });

    res.json({
      data: orders.map((o) => ({
        id: o.id,
        event: o.event.title,
        user: o.user.email,
        amount: Number(o.total),
        status: o.status,
        created_at: o.created_at,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch admin orders" });
  }
}

export async function getAdminEvents(_req: Request, res: Response): Promise<void> {
  try {
    const events = await prisma.event.findMany({
      where: { status: "published" },
      include: { venue: true, zones: true },
      orderBy: { date: "asc" },
    });

    res.json({
      data: events.map((e) => {
        const sold = e.zones.reduce(
          (acc, z) => acc + (z.total_seats - z.available_seats),
          0
        );
        const capacity = e.zones.reduce((acc, z) => acc + z.total_seats, 0);
        const revenue = e.zones.reduce(
          (acc, z) =>
            acc + (z.total_seats - z.available_seats) * Number(z.price),
          0
        );
        return {
          id: e.id,
          title: e.title,
          venue: `${e.venue.name}, ${e.venue.city}`,
          sold,
          capacity,
          revenue,
        };
      }),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch admin events" });
  }
}

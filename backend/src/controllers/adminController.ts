import { Request, Response } from "express";
import type { EventStatus, OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { isEventSoldOut } from "../services/eventService.js";
import { logger } from "../lib/logger.js";

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
    const limit = Math.min(Number(_req.query.limit) || 10, 200);
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

export async function getAdminVenues(_req: Request, res: Response): Promise<void> {
  try {
    const venues = await prisma.venue.findMany({ orderBy: { name: "asc" } });
    res.json({ data: venues });
  } catch {
    res.status(500).json({ error: "Failed to fetch venues" });
  }
}

export async function getAllAdminEvents(_req: Request, res: Response): Promise<void> {
  try {
    const events = await prisma.event.findMany({
      include: { venue: true, zones: true },
      orderBy: { date: "asc" },
    });
    res.json({
      data: events.map((e) => {
        const sold = e.zones.reduce((acc, z) => acc + (z.total_seats - z.available_seats), 0);
        const capacity = e.zones.reduce((acc, z) => acc + z.total_seats, 0);
        return {
          id: e.id,
          title: e.title,
          artist_name: e.artist_name,
          venue: `${e.venue.name}, ${e.venue.city}`,
          venue_id: e.venue_id,
          date: e.date,
          status: e.status,
          genre: e.genre,
          description: e.description,
          image_url: e.image_url,
          sold,
          capacity,
          total_capacity: e.total_capacity,
        };
      }),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch all events" });
  }
}

export async function createAdminEvent(req: Request, res: Response): Promise<void> {
  try {
    const { title, artist_name, venue_id, date, total_capacity, genre, description, image_url, status } =
      req.body as {
        title: string;
        artist_name: string;
        venue_id: string;
        date: string;
        total_capacity: number;
        genre: string;
        description: string;
        image_url?: string;
        status?: string;
      };
    const event = await prisma.event.create({
      data: {
        title,
        artist_name,
        venue_id,
        date: new Date(date),
        total_capacity: Number(total_capacity),
        genre,
        description,
        image_url: image_url ?? "",
        status: (status as EventStatus) ?? "draft",
      },
    });
    logger.info("admin.event.created", {
      eventId: event.id,
      title: event.title,
      status: event.status,
    });
    res.status(201).json({ data: event });
  } catch (err) {
    logger.error("admin.event.create_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to create event" });
  }
}

export async function updateAdminEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as Partial<{
      title: string;
      artist_name: string;
      status: string;
      date: string;
      total_capacity: number;
      genre: string;
      description: string;
      image_url: string;
    }>;
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.artist_name !== undefined) data.artist_name = body.artist_name;
    if (body.status !== undefined) data.status = body.status as EventStatus;
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.total_capacity !== undefined) data.total_capacity = Number(body.total_capacity);
    if (body.genre !== undefined) data.genre = body.genre;
    if (body.description !== undefined) data.description = body.description;
    if (body.image_url !== undefined) data.image_url = body.image_url;
    const event = await prisma.event.update({ where: { id }, data });
    logger.info("admin.event.updated", { eventId: id, fields: Object.keys(data) });
    res.json({ data: event });
  } catch (err) {
    logger.error("admin.event.update_failed", {
      eventId: req.params.id,
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to update event" });
  }
}

export async function deleteAdminEvent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.resale.deleteMany({ where: { seat: { zone: { event_id: id } } } });
    await prisma.orderItem.deleteMany({ where: { seat: { zone: { event_id: id } } } });
    await prisma.order.deleteMany({ where: { event_id: id } });
    await prisma.seat.deleteMany({ where: { zone: { event_id: id } } });
    await prisma.zone.deleteMany({ where: { event_id: id } });
    await prisma.event.delete({ where: { id } });
    logger.info("admin.event.deleted", { eventId: id });
    res.json({ data: { deleted: true } });
  } catch (err) {
    logger.error("admin.event.delete_failed", {
      eventId: req.params.id,
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to delete event" });
  }
}

export async function updateAdminOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };
    const order = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });
    logger.info("admin.order.status_changed", { orderId: id, status });
    res.json({ data: order });
  } catch (err) {
    logger.error("admin.order.update_failed", {
      orderId: req.params.id,
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to update order" });
  }
}

export async function deleteAdminOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.orderItem.deleteMany({ where: { order_id: id } });
    await prisma.order.delete({ where: { id } });
    logger.info("admin.order.deleted", { orderId: id });
    res.json({ data: { deleted: true } });
  } catch (err) {
    logger.error("admin.order.delete_failed", {
      orderId: req.params.id,
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to delete order" });
  }
}

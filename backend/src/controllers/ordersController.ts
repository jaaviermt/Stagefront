import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { calculateOrderTotal } from "../services/orderService.js";
import { canUserPurchase } from "../services/purchaseService.js";
import { applyPromoCode } from "../services/promoService.js";
import type { PromoCode } from "../types/index.js";

const PROMO_CODES: PromoCode[] = [
  { code: "STAGEFRONT10", discount: 10, type: "percentage" },
  { code: "FIRSTORDER", discount: 15, type: "fixed", min_purchase: 50 },
];

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as {
      user_id: string;
      event_id: string;
      seat_ids?: string[];
      zone_id?: string;
      quantity?: number;
      promo_code?: string;
    };

    const { user_id, event_id, promo_code } = body;
    let seat_ids = body.seat_ids ?? [];

    if (seat_ids.length === 0 && body.zone_id && body.quantity) {
      const available = await prisma.seat.findMany({
        where: { zone_id: body.zone_id, status: "available" },
        take: body.quantity,
        orderBy: [{ row: "asc" }, { number: "asc" }],
      });
      seat_ids = available.map((s) => s.id);
    }

    if (seat_ids.length === 0) {
      res.status(400).json({ error: "No seats selected or available" });
      return;
    }

    const [user, event, seats] = await Promise.all([
      prisma.user.findUnique({ where: { id: user_id } }),
      prisma.event.findUnique({
        where: { id: event_id },
        include: { zones: true },
      }),
      prisma.seat.findMany({
        where: { id: { in: seat_ids }, status: "available" },
        include: { zone: true },
      }),
    ]);

    if (!user || !event) {
      res.status(404).json({ error: "User or event not found" });
      return;
    }

    const validation = canUserPurchase(
      { ...user, created_at: user.created_at },
      { ...event, date: event.date, total_capacity: event.total_capacity },
      seat_ids.length
    );

    if (!validation.allowed) {
      res.status(400).json({ error: validation.reason });
      return;
    }

    if (seats.length !== seat_ids.length) {
      res.status(400).json({ error: "One or more seats are unavailable" });
      return;
    }

    const items = seats.map((s) => ({ seat_id: s.id, price: Number(s.zone.price) }));
    let total = calculateOrderTotal(items);
    if (promo_code) total = applyPromoCode(total, promo_code, PROMO_CODES);

    const zoneCounts = seats.reduce<Record<string, number>>((acc, s) => {
      acc[s.zone_id] = (acc[s.zone_id] ?? 0) + 1;
      return acc;
    }, {});

    const order = await prisma.$transaction(async (tx) => {
      await tx.seat.updateMany({
        where: { id: { in: seat_ids } },
        data: { status: "sold" },
      });

      for (const [zoneId, count] of Object.entries(zoneCounts)) {
        await tx.zone.update({
          where: { id: zoneId },
          data: { available_seats: { decrement: count } },
        });
      }

      return tx.order.create({
        data: {
          user_id,
          event_id,
          total,
          status: "confirmed",
          order_items: {
            create: items.map((i) => ({ seat_id: i.seat_id, price: i.price })),
          },
        },
        include: { order_items: true, event: { include: { venue: true } } },
      });
    });

    res.status(201).json({ data: order });
  } catch {
    res.status(500).json({ error: "Failed to create order" });
  }
}

export async function getUserOrders(req: Request, res: Response): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: req.params.userId },
      include: { event: { include: { venue: true } }, order_items: true },
      orderBy: { created_at: "desc" },
    });
    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

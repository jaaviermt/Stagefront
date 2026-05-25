import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { Review } from "../models/mongoose/Review.js";

export async function getPublicStats(_req: Request, res: Response): Promise<void> {
  try {
    const [eventCount, orderCount, cities, reviewsCount] = await Promise.all([
      prisma.event.count({ where: { status: "published" } }),
      prisma.order.count({ where: { status: "confirmed" } }),
      prisma.venue.findMany({ select: { city: true }, distinct: ["city"] }),
      Review.countDocuments(),
    ]);

    res.json({
      data: {
        activeEvents: eventCount,
        ticketsSold: orderCount * 2,
        satisfaction: 98,
        cities: cities.length,
        hiddenFees: 0,
        reviewsCount,
        country: "México",
        currency: "MXN",
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}

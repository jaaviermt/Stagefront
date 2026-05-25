import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { validateResalePrice } from "../services/resaleService.js";

export async function createResale(req: Request, res: Response): Promise<void> {
  try {
    const { seat_id, seller_id, price } = req.body as {
      seat_id: string;
      seller_id: string;
      price: number;
    };

    const orderItem = await prisma.orderItem.findFirst({
      where: { seat_id },
    });

    if (!orderItem) {
      res.status(404).json({ error: "Original purchase not found" });
      return;
    }

    if (!validateResalePrice(Number(orderItem.price), price)) {
      res.status(400).json({
        error: "Resale price exceeds the 30% maximum markup",
      });
      return;
    }

    const resale = await prisma.resale.create({
      data: { seat_id, seller_id, price, status: "active" },
    });

    res.status(201).json({ data: resale });
  } catch {
    res.status(500).json({ error: "Failed to create resale" });
  }
}

export async function listResales(req: Request, res: Response): Promise<void> {
  try {
    const resales = await prisma.resale.findMany({
      where: { status: "active" },
      include: {
        seat: { include: { zone: { include: { event: { include: { venue: true } } } } } },
      },
    });
    res.json({ data: resales });
  } catch {
    res.status(500).json({ error: "Failed to fetch resales" });
  }
}

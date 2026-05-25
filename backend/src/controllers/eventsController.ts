import { Request, Response } from "express";
import type { EventStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { isEventSoldOut, getEventsByCity } from "../services/eventService.js";

export async function listEvents(req: Request, res: Response): Promise<void> {
  try {
    const { city, status } = req.query;

    const events = await prisma.event.findMany({
      where: {
        ...(status
          ? { status: status as EventStatus }
          : { status: "published" as const }),
      },
      include: { venue: true, zones: true },
      orderBy: { date: "asc" },
    });

    const result = city
      ? getEventsByCity(
          events.map((e) => ({ ...e, date: e.date, total_capacity: e.total_capacity })),
          city as string
        )
      : events;

    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { venue: true, zones: { include: { seats: true } } },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const soldOut = isEventSoldOut(
      event.zones.map((z) => ({ ...z, price: Number(z.price) }))
    );

    res.json({ data: { ...event, soldOut } });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      artist_name,
      venue_id,
      date,
      total_capacity,
      genre,
      description,
      image_url,
    } = req.body as {
      title: string;
      artist_name: string;
      venue_id: string;
      date: string;
      total_capacity: number;
      genre: string;
      description: string;
      image_url: string;
    };

    const event = await prisma.event.create({
      data: {
        title,
        artist_name,
        venue_id,
        date: new Date(date),
        total_capacity,
        genre,
        description,
        image_url,
        status: "draft",
      },
    });

    res.status(201).json({ data: event });
  } catch {
    res.status(500).json({ error: "Failed to create event" });
  }
}

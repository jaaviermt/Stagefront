import { Request, Response } from "express";
import { Review } from "../models/mongoose/Review.js";
import { ActivityLog } from "../models/mongoose/ActivityLog.js";
import { logger } from "../lib/logger.js";

export async function getEventReviews(req: Request, res: Response): Promise<void> {
  try {
    const reviews = await Review.find({ event_id: req.params.eventId })
      .sort({ created_at: -1 })
      .lean();
    res.json({ data: reviews });
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

export async function createReview(req: Request, res: Response): Promise<void> {
  try {
    const { user_id, event_id, rating, comment } = req.body as {
      user_id: string;
      event_id: string;
      rating: number;
      comment: string;
    };

    const review = await Review.create({ user_id, event_id, rating, comment });

    await ActivityLog.create({
      user_id,
      action: "review_created",
      metadata: { event_id, review_id: review._id },
    });

    logger.info("review.created", {
      reviewId: String(review._id),
      userId: user_id,
      eventId: event_id,
      rating,
    });
    res.status(201).json({ data: review });
  } catch (err) {
    logger.error("review.create_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to create review" });
  }
}

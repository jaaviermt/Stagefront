import { Router } from "express";
import { listEvents, getEvent, createEvent } from "../controllers/eventsController.js";
import { createOrder, getUserOrders } from "../controllers/ordersController.js";
import { createResale, listResales } from "../controllers/resalesController.js";
import { getEventReviews, createReview } from "../controllers/reviewsController.js";
import { getPublicStats } from "../controllers/statsController.js";
import {
  getAdminStats,
  getAdminOrders,
  getAdminEvents,
  getAdminVenues,
  getAllAdminEvents,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  updateAdminOrder,
  deleteAdminOrder,
} from "../controllers/adminController.js";
import { getLogs, getLogStats } from "../controllers/logsController.js";

const router = Router();

// Public stats
router.get("/stats", getPublicStats);

// Events
router.get("/events", listEvents);
router.get("/events/:id", getEvent);
router.post("/events", createEvent);

// Orders
router.post("/orders", createOrder);
router.get("/users/:userId/orders", getUserOrders);

// Resales
router.get("/resales", listResales);
router.post("/resales", createResale);

// Reviews (MongoDB)
router.get("/events/:eventId/reviews", getEventReviews);
router.post("/reviews", createReview);

// Admin (no auth — proteger en producción)
router.get("/admin/stats", getAdminStats);
router.get("/admin/orders", getAdminOrders);
router.get("/admin/events", getAdminEvents);
router.get("/admin/events/all", getAllAdminEvents);
router.get("/admin/venues", getAdminVenues);
router.post("/admin/events", createAdminEvent);
router.patch("/admin/events/:id", updateAdminEvent);
router.delete("/admin/events/:id", deleteAdminEvent);
router.patch("/admin/orders/:id", updateAdminOrder);
router.delete("/admin/orders/:id", deleteAdminOrder);

// Logs dashboard (lectura de archivos de log estructurados)
router.get("/admin/logs", getLogs);
router.get("/admin/logs/stats", getLogStats);

export default router;

import type { Event, Review, Zone } from "../types/index.js";

const API_BASE = "/api/v1";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  const json = (await res.json()) as ApiResponse<T> & { error?: string };

  if (!res.ok) {
    throw new Error(json.error ?? `Error ${res.status}`);
  }

  return json.data;
}

export interface PublicStats {
  activeEvents: number;
  ticketsSold: number;
  satisfaction: number;
  cities: number;
  hiddenFees: number;
  reviewsCount: number;
  country: string;
  currency: string;
}

export interface ApiEventDetail extends Event {
  artist_name: string;
  genre: string;
  description: string;
  image_url: string;
  venue: {
    id: string;
    name: string;
    city: string;
    address: string;
    capacity: number;
  };
  zones: Zone[];
  soldOut?: boolean;
}

export interface ResaleItem {
  id: string;
  price: number | string;
  seat: {
    zone: {
      name: string;
      event: {
        id: string;
        title: string;
        image_url?: string | null;
        venue: { name: string; city: string };
      };
    };
  };
}

export interface AdminStats {
  activeEvents: number;
  totalOrders: number;
  revenue: number;
  activeResales: number;
  soldOutEvents: number;
  avgTicketPrice: number;
  currency: string;
}

export interface AdminOrder {
  id: string;
  event: string;
  user: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface AdminEventRow {
  id: string;
  title: string;
  venue: string;
  sold: number;
  capacity: number;
  revenue: number;
}

export interface AdminEventFull {
  id: string;
  title: string;
  artist_name: string;
  venue: string;
  venue_id: string;
  date: string;
  status: string;
  genre: string;
  description: string;
  image_url: string;
  sold: number;
  capacity: number;
  total_capacity: number;
}

export interface AdminVenue {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
}

export interface CreateEventPayload {
  title: string;
  artist_name: string;
  venue_id: string;
  date: string;
  total_capacity: number;
  genre: string;
  description: string;
  image_url?: string;
  status?: string;
}

export interface CreateOrderPayload {
  user_id: string;
  event_id: string;
  zone_id: string;
  quantity: number;
  promo_code?: string;
}

export interface CreatedOrder {
  id: string;
  total: number | string;
  status: string;
}

export interface UserOrderItem {
  id: string;
  seat_id: string;
  price: number | string;
}

export interface UserOrder {
  id: string;
  total: number | string;
  status: string;
  created_at: string;
  event: {
    id: string;
    title: string;
    date: string;
    image_url?: string | null;
    venue?: { name: string; city: string };
  };
  order_items: UserOrderItem[];
}

export interface CreateReviewPayload {
  user_id: string;
  event_id: string;
  rating: number;
  comment: string;
}

export interface CreateResalePayload {
  seat_id: string;
  seller_id: string;
  price: number;
}

export interface CreatedResale {
  id: string;
  seat_id: string;
  price: number | string;
  status: string;
}

export const DEMO_USER_ID = import.meta.env.VITE_DEMO_USER_ID ?? "seed-user-demo";

export function fetchPublicStats(): Promise<PublicStats> {
  return request<PublicStats>("/stats");
}

export function fetchEvents(city?: string): Promise<Event[]> {
  const q = city ? `?city=${encodeURIComponent(city)}` : "";
  return request<Event[]>(`/events${q}`);
}

export function fetchEvent(id: string): Promise<ApiEventDetail> {
  return request<ApiEventDetail>(`/events/${id}`);
}

export function fetchEventReviews(eventId: string): Promise<Review[]> {
  return request<Review[]>(`/events/${eventId}/reviews`);
}

export function fetchResales(): Promise<ResaleItem[]> {
  return request<ResaleItem[]>("/resales");
}

export function fetchUserOrders(userId: string): Promise<UserOrder[]> {
  return request<UserOrder[]>(`/users/${userId}/orders`);
}

export function createReview(payload: CreateReviewPayload): Promise<Review> {
  return request<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createResale(payload: CreateResalePayload): Promise<CreatedResale> {
  return request<CreatedResale>("/resales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminStats(): Promise<AdminStats> {
  return request<AdminStats>("/admin/stats");
}

export function fetchAdminOrders(): Promise<AdminOrder[]> {
  return request<AdminOrder[]>("/admin/orders?limit=8");
}

export function fetchAdminEvents(): Promise<AdminEventRow[]> {
  return request<AdminEventRow[]>("/admin/events");
}

export function createOrder(payload: CreateOrderPayload): Promise<CreatedOrder> {
  return request<CreatedOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminVenues(): Promise<AdminVenue[]> {
  return request<AdminVenue[]>("/admin/venues");
}

export function fetchAllAdminEvents(): Promise<AdminEventFull[]> {
  return request<AdminEventFull[]>("/admin/events/all");
}

export function fetchAllAdminOrders(): Promise<AdminOrder[]> {
  return request<AdminOrder[]>("/admin/orders?limit=200");
}

export function createAdminEvent(payload: CreateEventPayload): Promise<AdminEventFull> {
  return request<AdminEventFull>("/admin/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminEvent(
  id: string,
  payload: Partial<CreateEventPayload & { status: string }>
): Promise<AdminEventFull> {
  return request<AdminEventFull>(`/admin/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminEvent(id: string): Promise<void> {
  return request<void>(`/admin/events/${id}`, { method: "DELETE" });
}

export function updateAdminOrder(id: string, status: string): Promise<void> {
  return request<void>(`/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteAdminOrder(id: string): Promise<void> {
  return request<void>(`/admin/orders/${id}`, { method: "DELETE" });
}

// ---------- Logs dashboard ----------

export interface LogEntry {
  timestamp?: string;
  level?: "error" | "warn" | "info" | "http";
  message?: string;
  [key: string]: unknown;
}

export interface LogStats {
  counts: { error: number; warn: number; info: number; http: number };
  errorsByHour: { hour: string; count: number }[];
  topErrors: { message: string; count: number }[];
  recentErrors: LogEntry[];
}

export async function fetchAdminLogs(
  level: string = "all",
  limit: number = 100
): Promise<{ data: LogEntry[]; total: number }> {
  const res = await fetch(`${API_BASE}/admin/logs?level=${level}&limit=${limit}`);
  const json = (await res.json()) as { data: LogEntry[]; total: number; error?: string };
  if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
  return { data: json.data, total: json.total };
}

export function fetchAdminLogStats(): Promise<LogStats> {
  return request<LogStats>("/admin/logs/stats");
}

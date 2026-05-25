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

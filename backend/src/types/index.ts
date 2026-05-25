export type UserRole = "admin" | "buyer" | "seller";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type SeatStatus = "available" | "reserved" | "sold";
export type OrderStatus = "pending" | "confirmed" | "cancelled" | "refunded";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
}

export interface Event {
  id: string;
  title: string;
  artist_name: string;
  venue_id: string;
  date: Date;
  status: EventStatus;
  total_capacity: number;
  genre: string;
  description: string;
  image_url: string;
}

export interface Zone {
  id: string;
  event_id: string;
  name: string;
  price: number;
  total_seats: number;
  available_seats: number;
}

export interface Seat {
  id: string;
  zone_id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface OrderItem {
  seat_id: string;
  price: number;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  min_purchase?: number;
}

export interface PurchaseValidation {
  allowed: boolean;
  reason?: string;
}

export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type SeatStatus = "available" | "reserved" | "sold";
export type OrderStatus = "pending" | "confirmed" | "cancelled" | "refunded";

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
}

export interface Zone {
  id: string;
  event_id: string;
  name: string;
  price: number;
  total_seats: number;
  available_seats: number;
}

export interface Event {
  id: string;
  title: string;
  artist_name?: string;
  venue_id: string;
  date: string;
  status: EventStatus;
  total_capacity: number;
  genre?: string;
  description?: string;
  image_url?: string;
  venue?: Venue;
  zones?: Zone[];
  soldOut?: boolean;
  minPrice?: number;
}

export interface Seat {
  id: string;
  zone_id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface Order {
  id: string;
  user_id: string;
  event_id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  event?: Event;
}

export interface Review {
  _id: string;
  user_id: string;
  event_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

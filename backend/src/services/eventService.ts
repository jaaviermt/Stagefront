import type { Zone, Seat, Event } from "../types/index.js";

export function isEventSoldOut(zones: Zone[]): boolean {
  if (!zones || zones.length === 0) return true;
  return zones.every((zone) => zone.available_seats === 0);
}

export function getAvailableSeats(zone: Zone & { seats?: Seat[] }): Seat[] {
  if (!zone.seats || zone.seats.length === 0) return [];
  return zone.seats.filter((seat) => seat.status === "available");
}

export function getEventsByCity(events: Event[], city: string): Event[] {
  if (!events || events.length === 0) return [];
  if (!city || city.trim() === "") return [];
  const normalized = city.trim().toLowerCase();
  return events.filter((e) => {
    const eventCity = (e as Event & { venue?: { city: string } }).venue?.city;
    return eventCity?.toLowerCase() === normalized;
  });
}

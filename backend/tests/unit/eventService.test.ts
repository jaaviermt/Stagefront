import { describe, it, expect } from "vitest";
import {
  isEventSoldOut,
  getAvailableSeats,
  getEventsByCity,
} from "../../src/services/eventService.js";
import type { Zone, Seat, Event } from "../../src/types/index.js";

function makeZone(available: number): Zone {
  return {
    id: `z-${available}`,
    event_id: "e1",
    name: "General",
    price: 1000,
    total_seats: 100,
    available_seats: available,
  };
}

describe("eventService.isEventSoldOut", () => {
  it("returns true when there are no zones", () => {
    expect(isEventSoldOut([])).toBe(true);
  });

  it("returns true when every zone has zero available seats", () => {
    expect(isEventSoldOut([makeZone(0), makeZone(0)])).toBe(true);
  });

  it("returns false when at least one zone has availability", () => {
    expect(isEventSoldOut([makeZone(0), makeZone(5)])).toBe(false);
  });
});

describe("eventService.getAvailableSeats", () => {
  const seats: Seat[] = [
    { id: "s1", zone_id: "z1", row: "A", number: 1, status: "available" },
    { id: "s2", zone_id: "z1", row: "A", number: 2, status: "sold" },
    { id: "s3", zone_id: "z1", row: "A", number: 3, status: "reserved" },
    { id: "s4", zone_id: "z1", row: "A", number: 4, status: "available" },
  ];

  it("returns only seats with status 'available'", () => {
    const result = getAvailableSeats({ ...makeZone(2), seats });
    expect(result.map((s) => s.id)).toEqual(["s1", "s4"]);
  });

  it("returns an empty array when the zone has no seats", () => {
    expect(getAvailableSeats(makeZone(0))).toEqual([]);
  });
});

describe("eventService.getEventsByCity", () => {
  const events = [
    { id: "e1", title: "A", venue: { city: "CDMX" } },
    { id: "e2", title: "B", venue: { city: "Guadalajara" } },
    { id: "e3", title: "C", venue: { city: "cdmx" } },
  ] as unknown as Event[];

  it("filters events by city case-insensitively", () => {
    const result = getEventsByCity(events, "cdmx");
    expect(result.map((e) => e.id)).toEqual(["e1", "e3"]);
  });

  it("returns an empty array when the city is blank", () => {
    expect(getEventsByCity(events, "   ")).toEqual([]);
  });

  it("returns an empty array when no event matches the city", () => {
    expect(getEventsByCity(events, "Monterrey")).toEqual([]);
  });

  it("returns an empty array for an empty events list", () => {
    expect(getEventsByCity([], "CDMX")).toEqual([]);
  });
});

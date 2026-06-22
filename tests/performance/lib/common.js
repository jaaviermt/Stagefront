import http from "k6/http";
import { check } from "k6";

// Base URL of the running backend. Override with: k6 run -e BASE_URL=...
export const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

// Shared thresholds applied across all profiles.
// Render free tier has cold-start latency — thresholds reflect realistic SLOs.
export const baseThresholds = {
  http_req_failed: ["rate<0.01"],       // <1% errors
  http_req_duration: ["p(95)<800", "p(99)<1500"],
};

// A representative read-heavy browsing mix against public endpoints.
export function browsePublicApi() {
  const events = http.get(`${BASE_URL}/api/v1/events`);
  check(events, {
    "events status 200": (r) => r.status === 200,
    "events returns array": (r) => Array.isArray(r.json("data")),
  });

  const stats = http.get(`${BASE_URL}/api/v1/stats`);
  check(stats, { "stats status 200": (r) => r.status === 200 });

  const body = events.json("data");
  if (Array.isArray(body) && body.length > 0) {
    const id = body[0].id;
    const detail = http.get(`${BASE_URL}/api/v1/events/${id}`);
    check(detail, { "event detail 200": (r) => r.status === 200 });
  }
}

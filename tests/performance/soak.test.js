import { sleep } from "k6";
import { browsePublicApi, baseThresholds } from "./lib/common.js";

// SOAK TEST — moderate load sustained for a long period to surface memory
// leaks, connection-pool exhaustion and slow resource degradation.
// Shorten via -e DURATION for local runs; default models a long soak.
export const options = {
  stages: [
    { duration: "2m", target: 30 },
    { duration: __ENV.DURATION || "1h", target: 30 },
    { duration: "2m", target: 0 },
  ],
  thresholds: baseThresholds,
};

export default function () {
  browsePublicApi();
  sleep(1);
}

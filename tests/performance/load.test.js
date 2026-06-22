import { sleep } from "k6";
import { browsePublicApi, baseThresholds } from "./lib/common.js";

// LOAD TEST — expected sustained traffic. Verifies the system meets SLOs under
// a normal, steady concurrency level.
export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp-up
    { duration: "2m", target: 20 }, // steady state
    { duration: "30s", target: 0 }, // ramp-down
  ],
  thresholds: baseThresholds,
};

export default function () {
  browsePublicApi();
  sleep(1);
}

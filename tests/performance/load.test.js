import { sleep } from "k6";
import { browsePublicApi, baseThresholds } from "./lib/common.js";

// LOAD TEST — usuarios esperados en producción · 10 min sostenido · ramp-up 5 min.
export const options = {
  stages: [
    { duration: "5m", target: 20 },  // ramp-up gradual hasta carga normal
    { duration: "10m", target: 20 }, // steady state
    { duration: "1m", target: 0 },   // ramp-down
  ],
  thresholds: baseThresholds,
};

export default function () {
  browsePublicApi();
  sleep(1);
}

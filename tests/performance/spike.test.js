import { sleep } from "k6";
import { browsePublicApi } from "./lib/common.js";

// SPIKE TEST — simulate a sudden surge (e.g. tickets going on sale) and verify
// the system recovers once the spike subsides.
export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "20s", target: 300 }, // sudden spike
    { duration: "1m", target: 300 },
    { duration: "20s", target: 10 }, // recovery
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  browsePublicApi();
  sleep(0.3);
}

import { sleep } from "k6";
import { browsePublicApi } from "./lib/common.js";

// STRESS TEST — push load well beyond normal to find the breaking point and
// confirm graceful degradation (no crashes, errors stay bounded).
export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "2m", target: 200 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"], // allow up to 5% under stress
    http_req_duration: ["p(95)<1500"],
  },
};

export default function () {
  browsePublicApi();
  sleep(0.5);
}

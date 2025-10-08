import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

// const currentHost = typeof window !== "undefined" ? `${window.location.protocol}://${window.location.host}` : "http://localhost:3000";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BASE_URL: z.url(),
  },
  runtimeEnv: import.meta.env,
});

import { createAuthClient } from "better-auth/react";
import { env } from "~/env/client";

console.log({viteBaseUrl: env.VITE_BASE_URL})

const authClient = createAuthClient({
  baseURL: env.VITE_BASE_URL,
});

export default authClient;

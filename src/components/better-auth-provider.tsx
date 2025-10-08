import authClient from "@/lib/auth/auth-client";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function BetterAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        authClient={authClient}
        account={{ basePath: "/dashboard/account" }}
        navigate={(href) => router.navigate({ href })}
        replace={(href) => router.navigate({ href, replace: true })}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
      >
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
}

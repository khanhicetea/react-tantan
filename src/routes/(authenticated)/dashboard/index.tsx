import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

export const Route = createFileRoute("/(authenticated)/dashboard/")({
  component: DashboardIndex,
});

export const $getTime = createServerFn({ method: "GET" }).handler(async () => {
  return new Date().toISOString();
});

function DashboardIndex() {
  const { user } = Route.useRouteContext();
  const [time, setTime] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-1">
      Dashboard index page
      <pre className="bg-card text-card-foreground rounded-md border p-1 text-xs">
        routes/(authenticated)dashboard/index.tsx
      </pre>
      <div className="mt-2 text-center text-xs sm:text-sm">
        User data from route context:
        <pre className="max-w-screen overflow-x-auto px-2 text-start">
          {JSON.stringify(user, null, 2)}
        </pre>
        <Button onClick={() => $getTime().then((time) => setTime(time))}>Get time</Button>
        {time && <p>Time: {time}</p>}
      </div>
      <SignOutButton />
    </div>
  );
}

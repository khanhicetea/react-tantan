import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/haha")({
  component: RouteComponent,
});

export const $ping = createServerFn().handler(async () => {
  return "pong";
});

function RouteComponent() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    $ping().then(setMsg);
  }, []);

  return <div>Hello {msg}!</div>;
}

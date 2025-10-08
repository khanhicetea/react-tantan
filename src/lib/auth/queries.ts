import { $getUser } from "@/functions/session";
import { queryOptions } from "@tanstack/react-query";

export const authQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: ({ signal }) => $getUser({ signal }),
  });

export type AuthSession = Awaited<ReturnType<typeof $getUser>>;

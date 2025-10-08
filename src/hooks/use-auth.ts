import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import authClient from "~/lib/auth/auth-client";
import { authQueryOptions } from "~/lib/auth/queries";

export function useAuth() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data: user } = useSuspenseQuery(authQueryOptions());

    const signOut = () => {
        authClient.signOut({
            fetchOptions: {
                onResponse: async () => {
                    queryClient.setQueryData(authQueryOptions().queryKey, null);
                    await router.invalidate();
                },
            },
        });
    };

    return {
        user,
        signOut,
    };
}
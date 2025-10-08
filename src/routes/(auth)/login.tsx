import { SignInSocialButton } from "@/components/sign-in-social-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import authClient from "@/lib/auth/auth-client";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GalleryVerticalEnd, LoaderCircle, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/(auth)/login")({
  component: LoginForm,
});

function LoginForm() {
  const { redirectUrl } = Route.useRouteContext();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: emailLoginMutate, isPending } = useMutation({
    mutationFn: async (data: { email: string; password: string }) =>
      await authClient.signIn.email(
        {
          ...data,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "An error occurred while signing in.");
          },
        },
      ),
  });

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form onSubmit={handleSubmit((data) => emailLoginMutate(data))}>
          <div className="flex flex-col gap-6 p-4 lg:p-8">
            <div className="flex flex-col items-center gap-2">
              <a href="#" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">Acme Inc.</span>
              </a>
              <h1 className="text-xl font-bold">Welcome back to Acme Inc.</h1>
            </div>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Mail className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="hello@example.com"
                    readOnly={isPending}
                    required
                  />
                </InputGroup>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Lock className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    {...register("password")}
                    type="password"
                    placeholder="Enter password here"
                    readOnly={isPending}
                    required
                  />
                </InputGroup>
              </div>
              <Button
                type="submit"
                className="mt-2 w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending && <LoaderCircle className="animate-spin" />}
                {isPending ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                Or
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SignInSocialButton
                provider="github"
                callbackURL={redirectUrl}
                disabled={isPending}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      fill="currentColor"
                    />
                  </svg>
                }
              />
              <SignInSocialButton
                provider="google"
                callbackURL={redirectUrl}
                disabled={isPending}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                }
              />
            </div>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
        </form>
        <div className="bg-muted relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2840&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  );
}

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useAuth } from "../../state/auth";
import { useToast } from "../../components/ui/Toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            LB
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to continue to your dashboard.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={handleSubmit(async (values) => {
                try {
                  await login(values);
                  push("Logged in successfully", "success");
                  navigate("/shops", { replace: true });
                } catch (e) {
                  push((e as Error).message, "danger");
                }
              })}
            >
              <Input
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <Button className="w-full" isLoading={isSubmitting} type="submit">
                Sign in
              </Button>
              <div className="text-center text-sm text-slate-600">
                New here?{" "}
                <Link className="font-medium text-indigo-700 hover:underline" to="/register">
                  Create an account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


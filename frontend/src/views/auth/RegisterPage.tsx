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
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["customer", "shopOwner", "admin"]),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: doRegister } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "customer" },
  });

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            LB
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-600">
            Customer, shop owner, or admin access.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={handleSubmit(async (values) => {
                try {
                  await doRegister({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role: values.role,
                  });
                  push("Account created", "success");
                  navigate("/shops", { replace: true });
                } catch (e) {
                  push((e as Error).message, "danger");
                }
              })}
            >
              <Input label="Name" error={errors.name?.message} {...register("name")} />
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
                autoComplete="new-password"
                hint="Minimum 6 characters"
                error={errors.password?.message}
                {...register("password")}
              />
              <label className="block">
                <div className="mb-1 text-sm font-medium text-slate-800">Role</div>
                <select
                  className="h-11 w-full rounded-xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register("role")}
                >
                  <option value="customer">Customer</option>
                  <option value="shopOwner">Shop owner</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <Button className="w-full" isLoading={isSubmitting} type="submit">
                Create account
              </Button>
              <div className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link className="font-medium text-indigo-700 hover:underline" to="/login">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../api/endpoints";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/auth-store";
import { AuthShell } from "./LoginPage";

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const [error, setError] = useState("");
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError("");
    try {
      const { data } = await authApi.register({ name: values.name, email: values.email, password: values.password });
      setSession(data.token, data.user);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Start managing projects with your team.</p>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Full name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </Field>
          <Field label="Password" error={form.formState.errors.password?.message}>
            <Input type="password" {...form.register("password")} />
          </Field>
          <Field label="Confirm password" error={form.formState.errors.confirmPassword?.message}>
            <Input type="password" {...form.register("confirmPassword")} />
          </Field>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            Create workspace
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already registered? <Link className="font-semibold text-slate-950" to="/login">Sign in</Link>
        </p>
      </Card>
    </AuthShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

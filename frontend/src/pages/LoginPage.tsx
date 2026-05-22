import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../api/endpoints";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/auth-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const [error, setError] = useState("");
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@teamtask.dev", password: "password123" }
  });

  async function onSubmit(values: FormValues) {
    setError("");
    try {
      const { data } = await authApi.login(values);
      setSession(data.token, data.user);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Open your team operations workspace.</p>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </Field>
          <Field label="Password" error={form.formState.errors.password?.message}>
            <Input type="password" {...form.register("password")} />
          </Field>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          New here? <Link className="font-semibold text-slate-950" to="/register">Create an account</Link>
        </p>
      </Card>
    </AuthShell>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="grid h-10 w-10 place-items-center rounded-md bg-white text-sm font-bold text-slate-950">TT</div>
          <h2 className="mt-12 max-w-xl text-4xl font-bold">Team Task Manager</h2>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            A practical ERP-style command center for projects, assignments, progress, and accountability.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-slate-200">
          {["Role-based controls", "Live project analytics", "Responsive Kanban workflows"].map((item) => (
            <div className="flex items-center gap-2" key={item}>
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="grid place-items-center px-4 py-10">{children}</section>
    </main>
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

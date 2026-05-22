import { Bell, Moon, Shield } from "lucide-react";
import { Card } from "../components/ui/Card";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Workspace preferences prepared for production expansion.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Setting icon={Bell} title="Notifications" detail="Due-date alerts and activity notifications can be enabled with Socket.io or email jobs." />
        <Setting icon={Shield} title="Security" detail="JWT, hashed passwords, protected APIs, CORS, and rate limiting are enabled in the backend." />
        <Setting icon={Moon} title="Theme" detail="The design system is ready for a dark-mode toggle with the Tailwind class strategy." />
      </div>
    </div>
  );
}

function Setting({ icon: Icon, title, detail }: { icon: typeof Bell; title: string; detail: string }) {
  return (
    <Card className="p-5">
      <Icon className="h-5 w-5 text-slate-500" />
      <h2 className="mt-4 font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </Card>
  );
}

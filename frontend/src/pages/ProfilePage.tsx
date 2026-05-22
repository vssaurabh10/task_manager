import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useAuthStore } from "../store/auth-store";
import { formatDate } from "../utils/format";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your account identity and access level.</p>
      </div>
      <Card className="max-w-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-slate-900 text-xl font-bold text-white">{user?.name?.slice(0, 2).toUpperCase()}</div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">{user?.name}</h2>
            <p className="text-sm text-slate-500">Joined {formatDate(user?.createdAt)}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info icon={Mail} label="Email" value={user?.email ?? ""} />
          <Info icon={ShieldCheck} label="Role" value={user?.role ?? ""} />
        </div>
      </Card>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <Icon className="mb-2 h-4 w-4 text-slate-400" />
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

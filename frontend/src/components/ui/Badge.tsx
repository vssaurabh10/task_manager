import { cn } from "../../utils/cn";

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" | "red" | "blue" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-1 text-xs font-semibold",
        tone === "slate" && "bg-slate-100 text-slate-700",
        tone === "green" && "bg-emerald-100 text-emerald-700",
        tone === "amber" && "bg-amber-100 text-amber-800",
        tone === "red" && "bg-rose-100 text-rose-700",
        tone === "blue" && "bg-sky-100 text-sky-700"
      )}
    >
      {children}
    </span>
  );
}

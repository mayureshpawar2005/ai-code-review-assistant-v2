interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusStyles: Record<string, string> = {
  ok: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  running: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  connected: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  configured: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  unavailable: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  error: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  demo_mode: "bg-violet-500/15 text-violet-300 border-violet-500/35",
  sample_loaded: "bg-cyan-500/15 text-cyan-300 border-cyan-500/35",
  local_analysis_active: "bg-teal-500/15 text-teal-300 border-teal-500/35",
};

const statusLabels: Record<string, string> = {
  ok: "Healthy",
  running: "Running",
  connected: "Connected",
  configured: "Configured",
  unavailable: "Unavailable",
  demo_mode: "Demo Mode",
  sample_loaded: "Sample Loaded",
  local_analysis_active: "Local Analysis Active",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const style =
    statusStyles[status] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30";
  const text = label ?? statusLabels[status] ?? status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {text}
    </span>
  );
}

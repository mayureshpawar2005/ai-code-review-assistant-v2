interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ReportSection({
  title,
  children,
  className = "",
}: ReportSectionProps) {
  return (
    <section className={`border-b border-slate-700/40 pb-5 last:border-0 last:pb-0 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>
      {children}
    </section>
  );
}

interface LabeledValueProps {
  label: string;
  value: React.ReactNode;
}

export function LabeledValue({ label, value }: LabeledValueProps) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm leading-relaxed text-slate-200">{value}</div>
    </div>
  );
}

interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">None listed.</p>;
  }
  return (
    <ul className="space-y-1.5 text-sm text-slate-300">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-slate-500">-</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

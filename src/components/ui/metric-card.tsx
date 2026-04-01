type MetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
};

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <article className="app-panel p-5">
      <p className="text-sm font-medium text-app-text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">{value}</p>
      <p className="mt-2 text-sm text-app-text-subtle">{helper}</p>
    </article>
  );
}

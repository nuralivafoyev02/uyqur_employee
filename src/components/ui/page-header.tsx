type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-app-border bg-app-surface px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6">
      <div className="min-w-0 space-y-2">
        {eyebrow ? <p className="app-kicker">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h1 className="app-title">{title}</h1>
          <p className="app-subtitle max-w-2xl">{description}</p>
        </div>
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

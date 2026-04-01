type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="app-panel-soft flex flex-col items-start gap-4 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-app-text">{title}</h2>
        <p className="max-w-xl text-sm leading-6 text-app-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

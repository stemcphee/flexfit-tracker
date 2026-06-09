export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-1 max-w-xl text-sm text-slate">{description}</p>
      </div>
      {action}
    </div>
  );
}

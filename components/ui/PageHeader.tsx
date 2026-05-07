interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function PageHeader({ title, subtitle, actionLabel, onAction }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

import Link from "next/link";

interface ModuleCardProps {
  title: string;
  subtitle: string;
  href: string;
}

export default function ModuleCard({ title, subtitle, href }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="w-full rounded-xl border border-slate-200 bg-white p-6 transition duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-lg md:max-w-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </Link>
  );
}

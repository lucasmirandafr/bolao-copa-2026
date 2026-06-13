import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
};

export default function PageHeader({ icon, title, subtitle }: Props) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
          {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-green-600 to-brand-navy" />
    </div>
  );
}

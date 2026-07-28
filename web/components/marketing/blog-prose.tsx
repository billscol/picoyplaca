import type { ReactNode } from "react";

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 text-2xl font-bold tracking-tight first:mt-0">{children}</h2>;
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-6 text-lg font-bold tracking-tight">{children}</h3>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 leading-relaxed text-muted-foreground">{children}</p>;
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-2 leading-relaxed text-muted-foreground">{children}</ul>;
}

export function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 pl-1">
      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border-2 border-foreground/8 bg-secondary px-4 py-3.5 text-sm leading-relaxed">
      {children}
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="mt-4 overflow-x-auto rounded-xl border-2 border-foreground/8">{children}</div>;
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-4xl font-bold text-neutral-700">{children}</h1>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl font-bold text-neutral-700">{children}</h2>;
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-neutral-500">{children}</p>;
}

export function Section({ children }: { children: React.ReactNode }) {
  return <section className="grid gap-4">{children}</section>;
}

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-16 max-w-3xl mx-auto mt-12 px-4 content-start w-full">
      {children}
    </div>
  );
}

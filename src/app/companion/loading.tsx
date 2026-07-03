export default function CompanionLoading() {
  return (
    <div className="companion-shell min-h-screen px-4 py-8 lg:ml-28">
      <div className="mb-8 h-10 w-48 animate-pulse rounded-2xl bg-[var(--mega-card-bg)]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="mega-glass h-32 animate-pulse rounded-[28px] bg-[var(--mega-card-bg)]" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="mega-glass h-72 animate-pulse rounded-[28px] bg-[var(--mega-card-bg)]" />
        <div className="mega-glass h-72 animate-pulse rounded-[28px] bg-[var(--mega-card-bg)]" />
      </div>
    </div>
  );
}

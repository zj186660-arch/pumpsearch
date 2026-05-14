import clsx from "clsx";

export function ScoreBadge({ value, label }: { value: number; label: string }) {
  const tone =
    value >= 8 ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" : value >= 6
      ? "text-ocean-200 bg-ocean-500/15 border-ocean-500/30"
      : "text-amber-200 bg-amber-500/10 border-amber-500/25";
  return (
    <div
      className={clsx(
        "flex flex-col rounded-lg border px-2 py-1.5 text-center min-w-[4.5rem]",
        tone
      )}
    >
      <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
    </div>
  );
}

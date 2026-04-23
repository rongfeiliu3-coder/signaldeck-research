import Link from "next/link";
import { assets } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function SymbolPicker({
  selected,
  basePath = "/backtest",
  strategy
}: {
  selected: string;
  basePath?: string;
  strategy?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {assets.map((asset) => {
        const href =
          basePath === "/backtest"
            ? `${basePath}?symbol=${encodeURIComponent(asset.symbol)}${strategy ? `&strategy=${strategy}` : ""}`
            : `/symbols/${asset.symbol}`;

        return (
          <Link
            key={asset.symbol}
            href={href}
            className={cn(
              "focus-ring rounded-md border px-3 py-2 text-sm font-medium transition",
              selected === asset.symbol
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            )}
          >
            {asset.symbol}
          </Link>
        );
      })}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { PASTI, PASTO_LABEL, type Pasto } from "../lib/recipes";

export function Filters({
  pasto,
  setPasto,
  tagDisponibili,
  tagSelezionati,
  setTagSelezionati,
}: {
  pasto: Pasto | null;
  setPasto: (p: Pasto | null) => void;
  tagDisponibili: string[];
  tagSelezionati: string[];
  setTagSelezionati: (t: string[]) => void;
}) {
  const [tendinaAperta, setTendinaAperta] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuori(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setTendinaAperta(false);
      }
    }
    document.addEventListener("mousedown", onClickFuori);
    return () => document.removeEventListener("mousedown", onClickFuori);
  }, []);

  function toggleTag(tag: string) {
    if (tagSelezionati.includes(tag)) {
      setTagSelezionati(tagSelezionati.filter((t) => t !== tag));
    } else {
      setTagSelezionati([...tagSelezionati, tag]);
    }
  }

  return (
    <div className="flex w-full max-w-[19rem] flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        <span
          className="pixel-chip"
          data-active={pasto === null}
          onClick={() => setPasto(null)}
        >
          Tutti
        </span>
        {PASTI.map((p) => (
          <span
            key={p}
            className="pixel-chip"
            data-active={pasto === p}
            onClick={() => setPasto(pasto === p ? null : p)}
          >
            {PASTO_LABEL[p]}
          </span>
        ))}
      </div>

      <div className="relative" ref={ref}>
        <button
          type="button"
          className="pixel-input flex items-center justify-between text-left"
          onClick={() => setTendinaAperta((v) => !v)}
        >
          <span>
            {tagSelezionati.length === 0
              ? "Tag (tutti)"
              : `Tag: ${tagSelezionati.join(", ")}`}
          </span>
          <span>{tendinaAperta ? "▲" : "▼"}</span>
        </button>
        {tendinaAperta && (
          <div className="pixel-panel absolute z-20 mt-1 w-full p-2">
            {tagDisponibili.length === 0 && (
              <p className="px-1 text-sm opacity-70">Nessun tag disponibile</p>
            )}
            {tagDisponibili.map((tag) => (
              <label
                key={tag}
                className="flex cursor-pointer items-center gap-2 px-1 py-1 text-lg"
              >
                <input
                  type="checkbox"
                  checked={tagSelezionati.includes(tag)}
                  onChange={() => toggleTag(tag)}
                  className="h-4 w-4 accent-[var(--color-tomato)]"
                />
                {tag}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

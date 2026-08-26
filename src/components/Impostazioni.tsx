export function Impostazioni({
  usaStandard,
  onCambia,
  onChiudi,
}: {
  usaStandard: boolean;
  onCambia: (v: boolean) => void;
  onChiudi: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[var(--color-crust)]/70 sm:items-center">
      <div className="pixel-panel w-full max-w-md p-4 sm:m-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="pixel-font text-sm">Opzioni</h2>
          <button
            className="pixel-btn pixel-btn-wood px-3 py-2 text-xs"
            onClick={onChiudi}
            aria-label="Chiudi"
          >
            X
          </button>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 py-2 text-lg">
          <span>Usa anche le ricette standard</span>
          <input
            type="checkbox"
            checked={usaStandard}
            onChange={(e) => onCambia(e.target.checked)}
            className="h-5 w-5 accent-[var(--color-ottanio)]"
          />
        </label>
        <p className="text-sm opacity-70">
          Se disattivata, la ruota usera' solo le ricette che hai aggiunto tu
          su questo dispositivo.
        </p>
      </div>
    </div>
  );
}

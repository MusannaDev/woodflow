'use client';

import { WorkspaceBrief } from '../../lib/session';

/** Login/Signup'dan keyin biznes tanlash — premium kartalar. */
export function WorkspacePicker({
  workspaces,
  onPick,
}: {
  workspaces: WorkspaceBrief[];
  onPick: (ws: WorkspaceBrief) => void;
}) {
  return (
    <div className="animate-[fadeIn_.4s_ease]">
      <h1 className="text-2xl font-bold tracking-tight">
        Qaysi biznesga kirasiz?
      </h1>
      <p className="text-sm text-neutral-500 mt-1.5">
        Keyin istalgan payt bir bosishda almashtira olasiz.
      </p>

      <div className="grid gap-4 mt-8">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => onPick(ws)}
            data-ws={ws.type}
            className="group relative flex items-center gap-4 rounded-2xl border-2 border-neutral-200 bg-white px-5 py-4 text-left transition-all hover:border-brand hover:shadow-lg hover:shadow-brand/10 hover:-translate-y-0.5"
          >
            <span className="w-11 h-11 rounded-xl bg-brand-faint grid place-items-center text-xl">
              {ws.type === 'WOOD_TRADING' ? '🪵' : '🪚'}
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{ws.name}</span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                {ws.type === 'WOOD_TRADING'
                  ? 'Import · ombor · fura foydasi'
                  : 'Ishlab chiqarish · tayyor mahsulot'}
              </span>
            </span>
            <span className="text-neutral-300 group-hover:text-brand transition-colors text-lg">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

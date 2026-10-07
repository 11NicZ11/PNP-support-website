// src/components/character/modals/RenameLibraryDialog.tsx
'use client';

export type RenameChoice =
  | 'local'
  | 'global'
  | 'new'
  | 'reuse-existing'
  | 'cancel';

export type RenameUsageStatus = 'loading' | 'ready' | 'error';

interface RenameLibraryDialogProps {
  isOpen: boolean;
  oldName: string;
  newName: string;
  /** Der Zielname existiert bereits als Library-Eintrag (gleicher type). */
  targetNameExists: boolean;
  /**
   * Vom Parent berechnet (Seed-Schutz + Namenskollision) — bewusst KEIN
   * `isSeed`-Prop: Etappe 3.5 stellt auf `seedKind` um, nur der Parent
   * rechnet dann um, der Dialog bleibt unverändert.
   */
  canRenameGlobal: boolean;
  globalDisabledReason?: string;
  usageStatus: RenameUsageStatus;
  totalUsage: number;
  isLoading?: boolean;
  error?: string | null;
  onChoose: (choice: RenameChoice) => void;
}

const BUTTON_BASE =
  'w-full px-3 py-2 rounded-lg text-sm text-left transition disabled:opacity-50 disabled:cursor-not-allowed';

export function RenameLibraryDialog({
  isOpen,
  oldName,
  newName,
  targetNameExists,
  canRenameGlobal,
  globalDisabledReason,
  usageStatus,
  totalUsage,
  isLoading = false,
  error = null,
  onChoose,
}: RenameLibraryDialogProps) {
  // Early-Return nach allen (hier: keinen) Hooks — kein Portal, kein <form>.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-md mx-4 border border-purple-500/40 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold">⚖️ Umbenennen</h3>
          <button
            type="button"
            onClick={() => onChoose('cancel')}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition"
            title="Abbrechen"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-200">
            „{oldName}“ wurde umbenannt zu „{newName}“.
            <br />
            Was soll passieren?
          </p>

          {/* Nutzung (Issue W) — reine Anzeige, keine Entscheidungslogik */}
          {usageStatus === 'loading' && (
            <p className="text-xs text-gray-400 italic">Prüfe Nutzung…</p>
          )}
          {usageStatus === 'ready' && totalUsage > 0 && (
            <p className="text-xs text-yellow-300">
              ⚠️ {totalUsage}{' '}
              {totalUsage === 1 ? 'Charakter nutzt' : 'Charaktere nutzen'} diesen
              Eintrag.
            </p>
          )}
          {usageStatus === 'error' && (
            <p className="text-xs text-gray-500 italic">
              Nutzung konnte nicht ermittelt werden.
            </p>
          )}

          {targetNameExists && (
            <div className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/40 rounded p-2">
              Schon vorhanden — nutze den bestehenden Eintrag statt einer zweiten
              Kopie.
            </div>
          )}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded p-2">
              {error}
            </div>
          )}
        </div>

        <div className="px-4 pb-4 space-y-2">
          <button
            type="button"
            onClick={() => onChoose('local')}
            disabled={isLoading}
            className={`${BUTTON_BASE} bg-gray-700 hover:bg-gray-600`}
            title="Bibliothek unberührt lassen — nur dieser Charakter wird umbenannt."
          >
            🧍 Nur hier
            <span className="block text-xs text-gray-400">
              Bibliothek unverändert lassen
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChoose('global')}
            disabled={isLoading || !canRenameGlobal}
            className={`${BUTTON_BASE} bg-purple-600 hover:bg-purple-500`}
            title={
              canRenameGlobal
                ? 'Bibliotheks-Eintrag global umbenennen.'
                : globalDisabledReason
            }
          >
            🌍 Global
            <span className="block text-xs text-gray-200/70">
              {canRenameGlobal
                ? 'Bibliothek-Eintrag umbenennen'
                : globalDisabledReason || 'Nicht verfügbar'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChoose('new')}
            disabled={isLoading || targetNameExists}
            className={`${BUTTON_BASE} bg-blue-600 hover:bg-blue-500`}
            title={
              targetNameExists
                ? 'Der Name existiert bereits — nutze den bestehenden Eintrag.'
                : 'Als neue Kopie in der Bibliothek anlegen.'
            }
          >
            ✨ Neuer Eintrag
            <span className="block text-xs text-gray-200/70">
              {targetNameExists ? 'Name ist bereits vergeben' : 'Als neue Kopie anlegen'}
            </span>
          </button>

          {targetNameExists && (
            <button
              type="button"
              onClick={() => onChoose('reuse-existing')}
              disabled={isLoading}
              className={`${BUTTON_BASE} bg-green-600 hover:bg-green-500`}
              title="Bestehenden Bibliotheks-Eintrag übernehmen."
            >
              🔗 Bestehenden nutzen
              <span className="block text-xs text-gray-200/70">
                Auf „{newName}“ umhängen
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onChoose('cancel')}
            disabled={isLoading}
            className={`${BUTTON_BASE} bg-gray-700 hover:bg-gray-600`}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

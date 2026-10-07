// src/components/character/editors/SkillsEditor.tsx
'use client';

import { useEffect, useState } from 'react';
import { Skill } from '@/types/skills';
import { useLibrary } from '@/hooks/useLibrary';
import { useToast } from '@/contexts/ToastContext';
import {
  RenameLibraryDialog,
  RenameChoice,
  RenameUsageStatus,
} from '../modals/RenameLibraryDialog';

interface Attribute {
  id: string;
  name: string;
  value: number;
  isDefault: boolean;
}

interface SkillsEditorProps {
  skills: Skill[];
  attributes: Attribute[];
  proficiencyBonus: number;
  onUpdate: (skills: Skill[]) => void;
  onAddCustomSkill?: (name: string, attributeName: string) => void;
  readOnly?: boolean;
}

/** Offene Rückfrage beim Umbenennen eines Skills mit gesetztem FK. */
interface PendingRename {
  skillId: string;
  oldName: string;
  newName: string;
  attributeName: string;
  libraryEntryId: string;
}

export function SkillsEditor({
  skills,
  attributes,
  proficiencyBonus,
  onUpdate,
  readOnly = false,
}: SkillsEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAttr, setNewAttr] = useState(attributes[0]?.name || 'Stärke');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAttr, setEditAttr] = useState('');

  // ===== Rückfrage-Dialog (Reference-Pattern) =====
  const [pendingRename, setPendingRename] = useState<PendingRename | null>(null);
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [usageStatus, setUsageStatus] = useState<RenameUsageStatus>('loading');
  const [totalUsage, setTotalUsage] = useState(0);

  const { addToast } = useToast();

  const { entries: libraryEntries, loading, create, createWithModeResult } =
    useLibrary({
      type: 'skill',
    });

  const getModifier = (value: number) => Math.floor((value - 10) / 2);
  const getAttributeValue = (attributeName: string) =>
    attributes.find((a) => a.name === attributeName)?.value ?? 10;

  const cycleProficiency = (skillId: string) => {
    if (readOnly) return;
    onUpdate(
      skills.map((s) => {
        if (s.id !== skillId) return s;
        if (!s.isProficient) return { ...s, isProficient: true, expertise: false };
        if (!s.expertise) return { ...s, isProficient: true, expertise: true };
        return { ...s, isProficient: false, expertise: false };
      })
    );
  };

  const startEdit = (skill: Skill) => {
    if (readOnly) return;
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditAttr(skill.attributeName || attributes[0]?.name || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAttr('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (!trimmed) return;

    const skill = skills.find((s) => s.id === editingId);

    // Kein FK ODER Name unverändert → bestehender Direkt-Pfad (kein Dialog).
    if (!skill || !skill.libraryEntryId || trimmed === skill.name) {
      onUpdate(
        skills.map((s) =>
          s.id === editingId
            ? { ...s, name: trimmed, attributeName: editAttr }
            : s
        )
      );
      cancelEdit();
      return;
    }

    // Mit gesetztem FK umbenannt → Rückfrage-Dialog.
    cancelEdit(); // Edit-Input verschwindet → kein zweiter Enter-Pfad
    setRenameError(null);
    setTotalUsage(0);
    setUsageStatus('loading');
    setPendingRename({
      skillId: skill.id,
      oldName: skill.name,
      newName: trimmed,
      attributeName: editAttr,
      libraryEntryId: skill.libraryEntryId,
    });
  };

  const deleteSkill = (skillId: string) => {
    const skill = skills.find((s) => s.id === skillId);
    if (!skill) return;
    if (!confirm(`"${skill.name}" wirklich entfernen?`)) return;
    onUpdate(skills.filter((s) => s.id !== skillId));
  };

  const addSkillLocal = (
    name: string,
    attributeName: string,
    libraryEntryId: string | null = null
  ) => {
    if (skills.some((s) => s.name === name)) return;
    onUpdate([
      ...skills,
      {
        id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        attributeName,
        isProficient: false,
        expertise: false,
        isCustom: false,
        proficiencySource: '',
        sourceDetail: '',
        libraryEntryId,
      },
    ]);
  };

  const addFromLibrary = (entry: { id: string; name: string; data: any }) => {
    const attrName = entry.data?.attributeName || 'Stärke';
    addSkillLocal(entry.name, attrName, entry.id);
  };

  const addCustomAndPersist = async () => {
    const name = newName.trim();
    if (!name) return;

    const created = await create({
      type: 'skill',
      name,
      description: '',
      icon: '🎯',
      data: { attributeName: newAttr },
    });

    addSkillLocal(name, newAttr, created?.id ?? null);

    setNewName('');
    setNewAttr(attributes[0]?.name || 'Stärke');
    setShowAddForm(false);
  };

  const skillsByAttr = attributes.reduce((acc, attr) => {
    acc[attr.name] = skills.filter((s) => s.attributeName === attr.name);
    return acc;
  }, {} as Record<string, Skill[]>);

  const librarySuggestions = libraryEntries
    .filter((e) => !skills.some((s) => s.name === e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ===== Nutzung des Library-Eintrags (Issue W, reine Anzeige) =====
  useEffect(() => {
    if (!pendingRename) return;
    // `usageStatus` steht schon auf 'loading' (setzt saveEdit vor dem Öffnen).
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/library/${pendingRename.libraryEntryId}/usage`
        );
        if (!res.ok) throw new Error('Nutzung nicht verfügbar');
        const data = await res.json();
        if (cancelled) return;
        setTotalUsage(
          typeof data.totalUsage === 'number' ? data.totalUsage : 0
        );
        setUsageStatus('ready');
      } catch {
        // Fehler → usageStatus 'error' (eigene Zeile im Dialog, kein Silent-Fail).
        if (!cancelled) setUsageStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingRename]);

    const renameTarget = pendingRename
    ? libraryEntries.find((e) => e.id === pendingRename.libraryEntryId)
    : undefined;

  // 'system' → unantastbar. Übergangs-Guard: isSeed ohne seedKind
  // (vor Backfill) wird wie 'system' behandelt.
  const isSystemTarget =
    renameTarget?.seedKind === 'system' ||
    (!!renameTarget?.isSeed && !renameTarget?.seedKind);

  // Zielname existiert bereits als anderer Library-Eintrag? (Issue X)
  const targetNameExists = pendingRename
    ? libraryEntries.some(
        (e) =>
          e.name === pendingRename.newName &&
          e.id !== pendingRename.libraryEntryId
      )
    : false;

  const globalDisabledReason = isSystemTarget
    ? 'System-Einträge können nicht global geändert werden.'
    : targetNameExists
    ? `Der Name „${pendingRename?.newName ?? ''}“ ist bereits vergeben.`
    : undefined;

  // Global: gesperrt bei System-Einträgen ODER belegtem Zielnamen.
  const canRenameGlobal = !isSystemTarget && !targetNameExists;

  const applyLocalRename = (newLibraryEntryId?: string | null) => {
    if (!pendingRename) return;
    onUpdate(
      skills.map((s) =>
        s.id === pendingRename.skillId
          ? {
              ...s,
              name: pendingRename.newName,
              attributeName: pendingRename.attributeName,
              ...(newLibraryEntryId !== undefined
                ? { libraryEntryId: newLibraryEntryId }
                : {}),
            }
          : s
      )
    );
    setPendingRename(null);
  };

  const handleRenameChoice = async (choice: RenameChoice) => {
    if (!pendingRename || renameLoading) return;

    if (choice === 'cancel') {
      setPendingRename(null);
      return;
    }

    if (choice === 'local') {
      applyLocalRename();
      addToast(`„${pendingRename.newName}“ nur hier umbenannt`);
      return;
    }

    if (choice === 'reuse-existing') {
      const existing = libraryEntries.find(
        (e) =>
          e.name === pendingRename.newName &&
          e.id !== pendingRename.libraryEntryId
      );
      if (!existing) {
        setRenameError('Der bestehende Eintrag wurde nicht gefunden.');
        return;
      }
      applyLocalRename(existing.id);
      addToast(`Hängt jetzt an „${existing.name}“`);
      return;
    }

    setRenameLoading(true);
    setRenameError(null);

    const res = await createWithModeResult(
      choice === 'global'
        ? {
            type: 'skill',
            name: pendingRename.newName,
            mode: 'update',
            targetEntryId: pendingRename.libraryEntryId,
          }
        : {
            type: 'skill',
            name: pendingRename.newName,
            mode: 'force-new',
            data: { attributeName: pendingRename.attributeName },
          }
    );

    setRenameLoading(false);

    if (!res.ok) {
      // Dialog bleibt offen → Fehler inline, kein Datenverlust.
      setRenameError(res.error);
      return;
    }

    if (choice === 'global') {
      applyLocalRename();
      addToast(`Bibliothek und Skill umbenannt zu „${pendingRename.newName}“`);
    } else {
      applyLocalRename(res.entry.id);
      addToast(`Neuer Eintrag „${res.entry.name}“ angelegt`);
    }
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h2 className="text-lg font-semibold">🎯 Fertigkeiten</h2>
        {!readOnly && (
          <div className="flex gap-2">
            <a
              href="/library?type=skill"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              title="Bibliothek in neuem Tab öffnen"
            >
              📚 Bibliothek
            </a>
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="px-2 py-1 bg-purple-600 rounded text-sm"
            >
              {showAddForm ? 'Abbrechen' : '+ Neue Fertigkeit'}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Klick auf den Kreis = Übung → Expertise → keine. Doppelklick auf den Namen = bearbeiten.
      </p>

      {showAddForm && !readOnly && (
        <div className="bg-gray-900 rounded-lg p-3 mb-4 border border-purple-500/40 space-y-3">
          <div>
            <div className="text-xs font-semibold text-gray-400 mb-2">
              Aus Bibliothek wählen
            </div>
            {loading && (
              <div className="text-center text-gray-500 text-xs py-2">Lade…</div>
            )}
            {!loading && librarySuggestions.length === 0 && (
              <div className="text-center text-gray-500 text-xs py-2 italic">
                Keine weiteren Vorschläge
              </div>
            )}
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {librarySuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addFromLibrary(s)}
                  className="px-2 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600 transition"
                >
                  {s.name}
                  {s.data?.attributeName && (
                    <span className="text-xs text-gray-400 ml-1">
                      ({s.data.attributeName})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-3">
            <div className="text-xs font-semibold text-gray-400 mb-2">
              Neue Fertigkeit anlegen (landet in Bibliothek)
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomAndPersist()}
                className="flex-1 min-w-[140px] px-2 py-1 bg-gray-700 rounded text-sm"
              />
              <select
                value={newAttr}
                onChange={(e) => setNewAttr(e.target.value)}
                className="px-2 py-1 bg-gray-700 rounded text-sm"
              >
                {attributes.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCustomAndPersist}
                disabled={!newName.trim()}
                className="px-3 py-1 bg-green-600 rounded text-sm disabled:opacity-50"
              >
                Anlegen & hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {attributes.map((attr) => {
          const attrSkills = skillsByAttr[attr.name] || [];
          if (attrSkills.length === 0) return null;
          return (
            <div key={attr.id}>
              <div className="text-sm font-semibold text-purple-300 mb-1">
                {attr.name}
              </div>
              <div className="flex flex-wrap gap-2">
                {attrSkills.map((skill) => {
                  const attrValue = getAttributeValue(
                    skill.attributeName || attr.name
                  );
                  const bonus =
                    getModifier(attrValue) +
                    (skill.isProficient ? proficiencyBonus : 0);
                  const isEditing = editingId === skill.id;

                  if (isEditing) {
                    return (
                      <div
                        key={skill.id}
                        className="flex items-center gap-1 bg-gray-900 rounded-lg px-2 py-1 border border-purple-500"
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="px-2 py-0.5 bg-gray-700 rounded text-sm w-32"
                          autoFocus
                        />
                        <select
                          value={editAttr}
                          onChange={(e) => setEditAttr(e.target.value)}
                          className="px-1 py-0.5 bg-gray-700 rounded text-xs"
                        >
                          {attributes.map((a) => (
                            <option key={a.id} value={a.name}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="text-green-400 hover:text-green-300 px-1"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-gray-400 hover:text-gray-300 px-1"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  }

                  let circleClass =
                    'w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs';
                  let circleContent = '';
                  let label = '';
                  if (skill.isProficient && skill.expertise) {
                    circleClass += ' bg-purple-600 border-purple-600 text-white';
                    circleContent = '★';
                    label = 'Expertise';
                  } else if (skill.isProficient) {
                    circleClass += ' bg-purple-400 border-purple-400 text-white';
                    circleContent = '◐';
                    label = 'Übung';
                  } else {
                    circleClass += ' bg-transparent border-gray-400';
                    circleContent = '○';
                  }

                  return (
                    <div
                      key={skill.id}
                      className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-2 py-1 group"
                    >
                      <button
                        type="button"
                        onClick={() => cycleProficiency(skill.id)}
                        disabled={readOnly}
                        className={circleClass}
                      >
                        {circleContent}
                      </button>
                      <span
                        className={`text-sm ${
                          !readOnly ? 'cursor-pointer hover:text-purple-300' : ''
                        }`}
                        onDoubleClick={() => startEdit(skill)}
                      >
                        {skill.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({bonus >= 0 ? `+${bonus}` : `${bonus}`})
                      </span>
                      {label && (
                        <span className="text-xs text-purple-400 ml-1">
                          {label}
                        </span>
                      )}
                      {!readOnly && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(skill)}
                            className="text-blue-400 opacity-0 group-hover:opacity-100 transition ml-1"
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSkill(skill.id)}
                            className="text-red-400 opacity-0 group-hover:opacity-100 transition"
                            title="Löschen"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {skills.length === 0 && (
        <div className="text-center text-gray-500 italic py-4">
          Noch keine Fertigkeiten — klicke auf „+ Neue Fertigkeit".
        </div>
      )}

      <RenameLibraryDialog
        isOpen={pendingRename !== null}
        oldName={pendingRename?.oldName ?? ''}
        newName={pendingRename?.newName ?? ''}
        targetNameExists={targetNameExists}
        canRenameGlobal={canRenameGlobal}
        globalDisabledReason={globalDisabledReason}
        usageStatus={usageStatus}
        totalUsage={totalUsage}
        isLoading={renameLoading}
        error={renameError}
        onChoose={handleRenameChoice}
      />
    </div>
  );
}
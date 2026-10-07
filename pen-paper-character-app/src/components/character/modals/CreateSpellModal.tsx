// src\components\character\modals\CreateSpellModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Spell,
  SpellSchool,
  SpellComponent,
  AoeShape,
  UpcastType,
  RangeCategory,
  CastingTimeValue,
  SPELL_SCHOOLS,
  AOE_SHAPES,
  UPCAST_TYPES,
  CASTING_TIME_OPTIONS,
  RANGE_CATEGORIES,
} from '@/types/spells';
import { DAMAGE_TYPES } from '@/lib/enums/damageTypes';
import { UnitSystem } from '@/types/character';
import {
  getDistanceUnitLabel,
  parseDistanceInput,
  displayDistanceValue,
} from '@/lib/units';
import { useLibrary, type LibraryEntry } from '@/hooks/useLibrary';

interface CreateSpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  onCreated: (spell: Spell) => void;
  unitSystem: UnitSystem;
}

const DICE_TYPES = [
  { value: 'd4', label: 'W4' },
  { value: 'd6', label: 'W6' },
  { value: 'd8', label: 'W8' },
  { value: 'd10', label: 'W10' },
  { value: 'd12', label: 'W12' },
  { value: 'd20', label: 'W20' },
];

export function CreateSpellModal({
  isOpen,
  onClose,
  characterId,
  onCreated,
  unitSystem,
}: CreateSpellModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [damageEntries, setDamageEntries] = useState<
    { id: string; count: number; dice: string; type: string }[]
  >([{ id: '1', count: 1, dice: 'd6', type: 'Feuer' }]);

  const [formData, setFormData] = useState<any>({
    name: '',
    level: 0,
    school: '',
    castingTime: 'Aktion' as CastingTimeValue,
    rangeCategory: 'Selbst' as RangeCategory,
    rangeDistance: '',
    components: [] as SpellComponent[],
    materialComponent: '',
    duration: '',
    description: '',
    higherLevels: '',
    concentration: false,
    ritual: false,
    prepared: false,
    alwaysPrepared: false,
    attackType: '',
    savingThrow: '',
    aoeShape: 'Single' as AoeShape,
    aoeSize: '',
    upcastEnabled: false,
    upcastType: 'dice' as UpcastType,
    upcastValue: '',
    libraryEntryId: null as string | null,
  });

  // Library-Anbindung: Vorschläge für aktuellen Grad, sowie create für
  // „auto-persist", wenn der Nutzer einen neuen Zauber anlegt.
  const {
    entries: librarySpells,
    create: createLibrarySpell,
    loading: librarySpellsLoading,
  } = useLibrary({
    type: 'spell',
    autoLoad: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setDamageEntries([{ id: '1', count: 1, dice: 'd6', type: 'Feuer' }]);
      setFormData({
        name: '',
        level: 0,
        school: '',
        castingTime: 'Aktion',
        rangeCategory: 'Selbst',
        rangeDistance: '',
        components: [],
        materialComponent: '',
        duration: '',
        description: '',
        higherLevels: '',
        concentration: false,
        ritual: false,
        prepared: false,
        alwaysPrepared: false,
        attackType: '',
        savingThrow: '',
        aoeShape: 'Single',
        aoeSize: '',
        upcastEnabled: false,
        upcastType: 'dice',
        upcastValue: '',
        libraryEntryId: null,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleComponent = (comp: SpellComponent) => {
    const current = formData.components as SpellComponent[];
    if (current.includes(comp)) {
      updateField('components', current.filter((c) => c !== comp));
    } else {
      updateField('components', [...current, comp]);
    }
  };

  // ==================== LIBRARY-SUGGESTIONS ====================
  const spellSuggestions = librarySpells
    .filter((e) => parseInt(e.category) === formData.level)
    .sort((a, b) => a.name.localeCompare(b.name));

  const applySpellSuggestion = (entry: LibraryEntry) => {
    const d: any = entry.data || {};
    setFormData((prev: any) => ({
      ...prev,
      name: entry.name,
      description: entry.description || '',
      school: d.school || prev.school,
      castingTime: d.castingTime || prev.castingTime,
      rangeCategory: d.range || prev.rangeCategory,
      rangeDistance:
        d.rangeValue != null
          ? displayDistanceValue(d.rangeValue, unitSystem)
          : prev.rangeDistance,
      components: Array.isArray(d.components) ? d.components : prev.components,
      materialComponent: d.materialComponent || '',
      duration: d.duration || '',
      higherLevels: d.higherLevels || '',
      concentration: d.concentration === true,
      ritual: d.ritual === true,
      attackType: d.attackType || '',
      savingThrow: d.savingThrow || '',
      aoeShape: d.aoeShape || 'Single',
      aoeSize: d.aoeSize != null ? displayDistanceValue(d.aoeSize, unitSystem) : '',
      upcastEnabled: d.upcastEnabled === true,
      upcastType: d.upcastType || 'dice',
      upcastValue: d.upcastValue || '',
      libraryEntryId: entry.id,
    }));
  };

  // ==================== DAMAGE ENTRIES ====================
  const addDamageEntry = () => {
    setDamageEntries([
      ...damageEntries,
      {
        id: `dmg-${Date.now()}`,
        count: 1,
        dice: 'd6',
        type: 'Feuer',
      },
    ]);
  };

  const removeDamageEntry = (id: string) => {
    setDamageEntries(damageEntries.filter((e) => e.id !== id));
  };

  const updateDamageEntry = (
    id: string,
    field: 'count' | 'dice' | 'type',
    value: string | number
  ) => {
    setDamageEntries(
      damageEntries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const generateDamageDice = (): string | null => {
    if (damageEntries.length === 0) return null;
    return damageEntries
      .map((e) => `${e.count}${e.dice} ${e.type}`)
      .join(', ');
  };

  const getPrimaryDamageType = (): string | null => {
    if (damageEntries.length === 0) return null;
    return damageEntries[0].type || null;
  };

  // ==================== LIBRARY-DATA-BUILDER ====================
  // Baut den `data`-Block für den Library-Eintrag (identisch zum
  // Char-Zauber-`data`, ohne Char-spezifische Felder).
  const buildLibraryData = () => {
    const rangeValue =
      formData.rangeCategory === 'Distanz' && formData.rangeDistance
        ? parseDistanceInput(formData.rangeDistance, unitSystem)
        : null;

    const aoeSize = formData.aoeSize
      ? parseDistanceInput(formData.aoeSize, unitSystem)
      : null;

    return {
      school: formData.school || null,
      castingTime: formData.castingTime || null,
      range: formData.rangeCategory || null,
      rangeValue,
      components: Array.isArray(formData.components) ? formData.components : [],
      materialComponent: formData.materialComponent || null,
      duration: formData.duration || null,
      higherLevels: formData.upcastEnabled ? formData.higherLevels || null : null,
      concentration: formData.concentration || false,
      ritual: formData.ritual || false,
      attackType: formData.attackType || null,
      savingThrow: formData.savingThrow || null,
      damageDice: generateDamageDice(),
      damageType: getPrimaryDamageType(),
      aoeShape: formData.aoeShape || null,
      aoeSize,
      upcastEnabled: formData.upcastEnabled || false,
      upcastType: formData.upcastEnabled ? formData.upcastType : null,
      upcastValue: formData.upcastEnabled ? formData.upcastValue : null,
    };
  };

  const buildPayload = (libraryEntryId: string | null) => {
    const rangeValue =
      formData.rangeCategory === 'Distanz' && formData.rangeDistance
        ? parseDistanceInput(formData.rangeDistance, unitSystem)
        : null;

    const aoeSize = formData.aoeSize
      ? parseDistanceInput(formData.aoeSize, unitSystem)
      : null;

    const damageDice = generateDamageDice();

    return {
      name: formData.name,
      level: parseInt(formData.level) || 0,
      school: formData.school || null,
      castingTime: formData.castingTime || null,
      range: formData.rangeCategory,
      rangeValue,
      components: formData.components,
      materialComponent: formData.materialComponent || null,
      duration: formData.duration || null,
      description: formData.description || '',
      higherLevels: formData.upcastEnabled ? formData.higherLevels || null : null,
      concentration: formData.concentration,
      ritual: formData.ritual,
      prepared: formData.prepared,
      alwaysPrepared: formData.alwaysPrepared,
      attackType: formData.attackType || null,
      savingThrow: formData.savingThrow || null,
      damageDice,
      damageType: getPrimaryDamageType(),
      aoeShape: formData.aoeShape || null,
      aoeSize,
      upcastEnabled: formData.upcastEnabled,
      upcastType: formData.upcastEnabled ? formData.upcastType : null,
      upcastValue: formData.upcastEnabled ? formData.upcastValue : null,
      libraryEntryId,
    };
  };

  // ==================== LIBRARY-PERSIST ====================
  // Liefert die libraryEntryId zurück, die für den Char-Zauber verwendet
  // werden soll. Bei bereits verknüpftem FK: unverändert. Sonst: Namen in
  // der Library suchen (`reuse`) oder neu anlegen. Damit sitzt der FK am
  // Char-Spell korrekt.
  const ensureLibraryEntry = async (): Promise<string | null> => {
    if (formData.libraryEntryId) return formData.libraryEntryId;
    const name = (formData.name || '').trim();
    if (!name) return null;

    const category = String(parseInt(formData.level) || 0);

    // Reuse: Eintrag mit gleichem Namen + gleichem Grad existiert schon.
    const existing = librarySpells.find(
      (e) => e.name === name && e.category === category
    );
    if (existing) return existing.id;

    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'spell',
          category,
          name,
          description: formData.description || '',
          icon: '✨',
          data: buildLibraryData(),
          mode: 'reuse',
        }),
      });
      if (!res.ok) return null;
      const created = await res.json();
      return typeof created?.id === 'string' ? created.id : null;
    } catch {
      return null;
    }
  };

  // Fire-and-forget-Variante für „neuer Charakter": Zauber wird beim
  // Speichern des Charakters persistiert, der FK bleibt lokal zunächst
  // null (konsistent mit CreateItemModal/Action).
  const persistSpellInLibraryFireAndForget = () => {
    if (formData.libraryEntryId) return;
    const name = (formData.name || '').trim();
    if (!name) return;
    const category = String(parseInt(formData.level) || 0);
    if (librarySpells.some((e) => e.name === name && e.category === category)) {
      return;
    }
    void createLibrarySpell({
      type: 'spell',
      category,
      name,
      description: formData.description || '',
      icon: '✨',
      data: buildLibraryData(),
    });
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (characterId === 'new') {
        const payload = buildPayload(formData.libraryEntryId);
        const localSpell: Spell = {
          id: `temp-spell-${Date.now()}`,
          ...payload,
          components: formData.components,
          characterId: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Spell;
        onCreated(localSpell);
        persistSpellInLibraryFireAndForget();
        onClose();
        setIsSubmitting(false);
        return;
      }

      // Bestehender Charakter: FK sicherstellen (Reuse oder Neuanlage).
      const libraryEntryId = await ensureLibraryEntry();
      const payload = buildPayload(libraryEntryId);

      const res = await fetch(`/api/characters/${characterId}/spells`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Erstellen');
      }

      const created = await res.json();
      onCreated(created);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const distanceUnitLabel = getDistanceUnitLabel(unitSystem);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">✨ Neuen Zauber erstellen</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mx-4 mt-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* ==================== AUS BIBLIOTHEK ==================== */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs font-semibold text-gray-400 mb-2">
              Aus Bibliothek (Grad {formData.level})
            </div>
            {librarySpellsLoading && (
              <div className="text-center text-gray-500 text-xs py-2">Lade…</div>
            )}
            {!librarySpellsLoading && spellSuggestions.length === 0 && (
              <div className="text-center text-gray-500 text-xs py-2 italic">
                Keine Vorschläge für diesen Grad
              </div>
            )}
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {spellSuggestions.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  title={entry.description}
                  onClick={() => applySpellSuggestion(entry)}
                  className="px-2 py-1 rounded text-sm transition bg-gray-700 hover:bg-gray-600"
                >
                  {entry.icon} {entry.name}
                </button>
              ))}
            </div>
          </div>

          {/* ==================== BASIS ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                placeholder="z. B. Feuerball"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grad</label>
              <select
                value={formData.level}
                onChange={(e) => updateField('level', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              >
                <option value={0}>Zaubertrick (0)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                  <option key={l} value={l}>
                    Grad {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Schule</label>
              <select
                value={formData.school}
                onChange={(e) => updateField('school', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              >
                <option value="">–</option>
                {SPELL_SCHOOLS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dauer</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => updateField('duration', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                placeholder="Sofort"
              />
            </div>
          </div>

          {/* ==================== ZAUBERZEIT ==================== */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <label className="block text-sm font-medium mb-2">Zauberzeit</label>
            <div className="flex gap-2">
              {CASTING_TIME_OPTIONS.map((opt) => {
                const isActive = formData.castingTime === opt.value;
                return (
                  <div key={opt.value} className="relative group">
                    <button
                      type="button"
                      onClick={() => updateField('castingTime', opt.value)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                        isActive
                          ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {opt.short}
                    </button>
                    <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 border border-purple-500 rounded-lg p-2 text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition pointer-events-none">
                      <div className="font-semibold text-purple-300">{opt.label}</div>
                      <div className="text-gray-300">{opt.tooltip}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================== REICHWEITE ==================== */}
          <div className="p-3 bg-gray-800/50 rounded-lg space-y-2">
            <label className="block text-sm font-medium">Reichweite</label>
            <div className="flex gap-2 flex-wrap">
              {RANGE_CATEGORIES.map((cat) => {
                const isActive = formData.rangeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => updateField('rangeCategory', cat.value)}
                    className={`px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {formData.rangeCategory === 'Distanz' && (
              <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium mb-1">
                  Distanz in {unitSystem === 'imperial' ? 'feet' : 'M'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rangeDistance}
                  onChange={(e) => updateField('rangeDistance', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                  placeholder={unitSystem === 'imperial' ? 'z. B. 30' : 'z. B. 9'}
                />
              </div>
            )}
          </div>

          {/* ==================== KOMPONENTEN ==================== */}
          <div>
            <label className="block text-sm font-medium mb-1">Komponenten</label>
            <div className="flex gap-4">
              {(['V', 'S', 'M'] as SpellComponent[]).map((comp) => (
                <label key={comp} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.components.includes(comp)}
                    onChange={() => toggleComponent(comp)}
                  />
                  {comp === 'V' ? 'Verbal' : comp === 'S' ? 'Geste' : 'Material'}
                </label>
              ))}
            </div>
            {formData.components.includes('M') && (
              <input
                type="text"
                value={formData.materialComponent}
                onChange={(e) => updateField('materialComponent', e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-gray-800 rounded-lg"
                placeholder="Material-Komponente (z. B. eine kleine Kugel)"
              />
            )}
          </div>

          {/* ==================== WIRKUNGSBEREICH ==================== */}
          <div className="p-3 bg-gray-800/50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-purple-300">Wirkungsbereich</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Form</label>
                <select
                  value={formData.aoeShape}
                  onChange={(e) => updateField('aoeShape', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                >
                  {AOE_SHAPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </select>
              </div>
              {formData.aoeShape !== 'Single' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Größe ({distanceUnitLabel})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.aoeSize}
                    onChange={(e) => updateField('aoeSize', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                    placeholder={unitSystem === 'imperial' ? 'z. B. 20' : 'z. B. 6'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ==================== WIRKUNG ==================== */}
          <div className="p-3 bg-gray-800/50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-purple-300">Wirkung</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Angriffstyp</label>
                <select
                  value={formData.attackType}
                  onChange={(e) => updateField('attackType', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                >
                  <option value="">–</option>
                  <option value="melee">Nahkampf-Zauberangriff</option>
                  <option value="ranged">Fernkampf-Zauberangriff</option>
                  <option value="saving_throw">Rettungswurf</option>
                  <option value="none">Keine</option>
                </select>
              </div>
              {formData.attackType === 'saving_throw' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Rettungswurf</label>
                  <select
                    value={formData.savingThrow}
                    onChange={(e) => updateField('savingThrow', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    <option value="">–</option>
                    <option value="Stärke">Stärke</option>
                    <option value="Geschick">Geschick</option>
                    <option value="Konstitution">Konstitution</option>
                    <option value="Intelligenz">Intelligenz</option>
                    <option value="Weisheit">Weisheit</option>
                    <option value="Charisma">Charisma</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Schadensarten</label>
                <button
                  type="button"
                  onClick={addDamageEntry}
                  className="px-2 py-1 text-xs bg-purple-600 rounded hover:bg-purple-700 transition"
                >
                  + Schadensart
                </button>
              </div>

              {damageEntries.length === 0 ? (
                <div className="text-xs text-gray-500 italic py-2">
                  Kein Schaden – z. B. für Buff- oder Heilzauber.
                </div>
              ) : (
                <div className="space-y-2">
                  {damageEntries.map((entry, index) => (
                    <div key={entry.id} className="flex gap-2 items-center">
                      <span className="text-xs text-gray-400 w-6">#{index + 1}</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={entry.count}
                        onChange={(e) =>
                          updateDamageEntry(entry.id, 'count', parseInt(e.target.value) || 1)
                        }
                        className="w-12 px-1 py-1 bg-gray-800 rounded border border-gray-700 text-sm text-center"
                      />
                      <select
                        value={entry.dice}
                        onChange={(e) => updateDamageEntry(entry.id, 'dice', e.target.value)}
                        className="flex-1 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-sm"
                      >
                        {DICE_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={entry.type}
                        onChange={(e) => updateDamageEntry(entry.id, 'type', e.target.value)}
                        className="flex-1 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-sm"
                      >
                        {DAMAGE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeDamageEntry(entry.id)}
                        className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-400 mt-2">
                💡 Beispiel: 2W6 Feuer + 1W8 Hieb
              </div>
            </div>
          </div>

          {/* ==================== UPCAST ==================== */}
          <div className="p-3 bg-gray-800/50 rounded-lg space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.upcastEnabled}
                onChange={(e) => updateField('upcastEnabled', e.target.checked)}
              />
              <span className="text-sm font-semibold text-purple-300">
                Zauber wird stärker bei höherem Grad (Upcast)
              </span>
            </label>

            {formData.upcastEnabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Typ</label>
                    <select
                      value={formData.upcastType}
                      onChange={(e) => updateField('upcastType', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                    >
                      {UPCAST_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Wert pro Grad</label>
                    <input
                      type="text"
                      value={formData.upcastValue}
                      onChange={(e) => updateField('upcastValue', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                      placeholder={
                        formData.upcastType === 'dice'
                          ? '1d6'
                          : formData.upcastType === 'targets'
                          ? '1'
                          : 'Text'
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Höherer Grad – Beschreibung
                  </label>
                  <textarea
                    value={formData.higherLevels}
                    onChange={(e) => updateField('higherLevels', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
                    placeholder="z. B. +1W6 Schaden pro Grad über 3"
                  />
                </div>
              </>
            )}
          </div>

          {/* ==================== FLAGS ==================== */}
          <div className="flex flex-wrap gap-4 p-3 bg-gray-800/50 rounded-lg">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.concentration}
                onChange={(e) => updateField('concentration', e.target.checked)}
              />
              Konzentration
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.ritual}
                onChange={(e) => updateField('ritual', e.target.checked)}
              />
              Ritual
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.alwaysPrepared}
                onChange={(e) => updateField('alwaysPrepared', e.target.checked)}
              />
              Immer vorbereitet
            </label>
          </div>

          {/* ==================== BESCHREIBUNG ==================== */}
          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
              placeholder="Zauberbeschreibung..."
            />
          </div>

          {/* ==================== AKTIONEN ==================== */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Erstelle...' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
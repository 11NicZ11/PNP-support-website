// src\components\character\modals\CreateItemModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { EquipmentType } from '@/types/equipment';
import { EQUIPMENT_TYPES, ARMOR_TYPES } from '@/lib/enums/equipmentTypes';
import { SPELL_SCHOOLS, SPELL_COMPONENTS, ACTION_TYPES } from '@/lib/enums/equipmentTypes';
import { DAMAGE_TYPES } from '@/lib/enums/damageTypes';
import { InventoryItem } from '@/types/inventory';
import { UnitSystem } from '@/types/character';
import {
  displayWeightValue,
  getWeightUnitLabel,
  getDistanceUnitLabel,
  parseWeightInput,
} from '@/lib/units';
import { useLibrary, type LibraryEntry } from '@/hooks/useLibrary';
import type { Action } from '@/types/actions';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  onCreated: () => void;
  itemType: 'equipment' | 'spell' | 'action' | 'inventory';
  containerId?: string;
  onItemCreated?: (item: any) => void;
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

const MAGIC_BONUS_OPTIONS = [
  { value: 0, label: 'Nicht magisch' },
  { value: 1, label: '+1' },
  { value: 2, label: '+2' },
  { value: 3, label: '+3' },
];

const RECHARGE_TYPES = [
  { value: 'short', label: 'Kurze Rast' },
  { value: 'long', label: 'Lange Rast' },
  { value: 'never', label: 'Nie / Permanent' },
  { value: 'manual', label: 'Manuell' },
];

export function CreateItemModal({
  isOpen,
  onClose,
  characterId,
  onCreated,
  itemType,
  containerId,
  onItemCreated,
  unitSystem,
}: CreateItemModalProps) {
  const [selectedType, setSelectedType] = useState<EquipmentType | string>('weapon');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [damageEntries, setDamageEntries] = useState<
    { id: string; count: number; dice: string; type: string }[]
  >([{ id: '1', count: 1, dice: 'd8', type: 'Hieb' }]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSelectedType('weapon');
      setDamageEntries([{ id: '1', count: 1, dice: 'd8', type: 'Hieb' }]);
      setFormData({
        name: '',
        description: '',
        weight: '',
        costAmount: '',
        quantity: 1,
        magicBonus: 0,
        attackBonus: 0,
        range: '',
        weaponProperties: [],
        armorClassBonus: 0,
        armorType: '',
        maxDexBonus: 0,
        stealthDisadvantage: false,
        strengthRequirement: 0,
        shieldBonus: 0,
        attunement: false,
        attuned: false,
        notes: '',
        sourceReference: '',
        level: 0,
        school: '',
        castingTime: '',
        components: [],
        materialComponent: '',
        duration: '',
        higherLevels: '',
        concentration: false,
        ritual: false,
        prepared: false,
        alwaysPrepared: false,
        SpellType: '',
        AttackType: '',
        savingThrow: '',
        savingThrowDC: '',
        actionType: 'action',
        sourceType: 'custom',
        sourceId: '',
        usesPerDay: 0,
        usesRemaining: 0,
        rechargeType: 'long',
        rechargeOnShortRest: false,
        rechargeOnLongRest: false,
        areaOfEffect: '',
        libraryEntryId: null,
      });
    }
  }, [isOpen]);

  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    weight: '',
    costAmount: '',
    quantity: 1,
    magicBonus: 0,
    attackBonus: 0,
    range: '',
    weaponProperties: [],
    armorClassBonus: 0,
    armorType: '',
    maxDexBonus: 0,
    stealthDisadvantage: false,
    strengthRequirement: 0,
    shieldBonus: 0,
    attunement: false,
    attuned: false,
    notes: '',
    sourceReference: '',
    level: 0,
    school: '',
    castingTime: '',
    components: [],
    materialComponent: '',
    duration: '',
    higherLevels: '',
    concentration: false,
    ritual: false,
    prepared: false,
    alwaysPrepared: false,
    SpellType: '',
    AttackType: '',
    savingThrow: '',
    savingThrowDC: '',
    actionType: 'action',
    sourceType: 'custom',
    sourceId: '',
    usesPerDay: 0,
    usesRemaining: 0,
    rechargeType: 'long',
    rechargeOnShortRest: false,
    rechargeOnLongRest: false,
    areaOfEffect: '',
    libraryEntryId: null,
  });

  const {
    entries: libraryActions,
    create: createLibraryEntry,
    loading: libraryActionsLoading,
  } = useLibrary({
    type: 'action',
    // Nur laden, wenn das Modal für Aktionen geöffnet ist (kein Hook in Bedingung)
    autoLoad: itemType === 'action',
  });

  const { entries: libraryWeaponProperties } = useLibrary({
    type: 'weapon_property',
    // Nur laden, wenn das Modal für Ausrüstung/Inventar geöffnet ist (kein Hook in Bedingung)
    autoLoad: itemType === 'equipment' || itemType === 'inventory',
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // ===== Vorschläge aus der Bibliothek (Aktionen) =====
  // Chips passend zum aktuell im Formular gewählten Aktionstyp
  const actionSuggestions = libraryActions.filter(
    (entry) => entry.category === formData.actionType
  );

  // Klick auf einen Chip füllt Name, Beschreibung und Aktionstyp.
  // Schadenswürfel/Nutzungen bleiben leer (im Seed als null hinterlegt).
  const applyActionSuggestion = (entry: LibraryEntry) => {
    setFormData({
      ...formData,
      name: entry.name,
      description: entry.description,
      actionType: entry.category,
      libraryEntryId: entry.id,
    });
  };

    const persistActionInLibrary = () => {
    if (itemType !== 'action') return;
    // Bereits mit Bibliothek verknüpft → nichts tun.
    if (formData.libraryEntryId) return;
    const name = (formData.name || '').trim();
    if (!name) return;
    if (libraryActions.some((entry) => entry.name === name)) return;
    void createLibraryEntry({
      type: 'action',
      category: formData.actionType,
      name,
      description: formData.description || '',
      icon: '⚡',
    });
  };

    // ==================== EQUIPMENT-LIBRARY ====================
  // Baut `data` für den Library-Eintrag `type='equipment'`.
  // Spiegelt die Char-Equipment-Felder, ohne char-spezifische Werte
  // (equipped, attuned, quantity bleiben Nutzer-Sache).
  const buildEquipmentLibraryData = () => {
    const damageDice = generateDamageDice();
    return {
      type: selectedType,
      subtype: formData.subtype || null,
      magicBonus: parseInt(formData.magicBonus) || 0,
      attackBonus: parseInt(formData.attackBonus) || 0,
      damageDice: damageDice || null,
      range: formData.range || null,
      weaponProperties: Array.isArray(formData.weaponProperties)
        ? formData.weaponProperties
        : [],
      armorClassBonus: parseInt(formData.armorClassBonus) || 0,
      armorType: formData.armorType || null,
      maxDexBonus: parseInt(formData.maxDexBonus) || 0,
      stealthDisadvantage: formData.stealthDisadvantage || false,
      strengthRequirement: parseInt(formData.strengthRequirement) || 0,
      shieldBonus: parseInt(formData.shieldBonus) || 0,
      attunement: formData.attunement || false,
      notes: formData.notes || '',
      sourceReference: formData.sourceReference || '',
      weight: formData.weight ? parseFloat(formData.weight) : null,
      costAmount: formData.costAmount ? parseInt(formData.costAmount) : null,
      costUnit: 'gp',
    };
  };

  // Stellt sicher, dass ein Library-Eintrag existiert und liefert dessen ID.
  // Nutzt `reuse` → existiert schon ein Eintrag mit gleichem Namen+Kategorie,
  // kommt dieser zurück, sonst wird neu angelegt.
  const ensureEquipmentLibraryEntry = async (): Promise<string | null> => {
    if (formData.libraryEntryId) return formData.libraryEntryId;
    const name = (formData.name || '').trim();
    if (!name) return null;

    try {
      const created = await createLibraryEntry({
        type: 'equipment',
        category: (selectedType as string) || 'other',
        name,
        description: formData.description || '',
        icon: '⚔️',
        data: buildEquipmentLibraryData(),
        mode: 'reuse',
      });
      return created?.id ?? null;
    } catch {
      return null;
    }
  };

  const addDamageEntry = () => {
    const newId = (damageEntries.length + 1).toString();
    setDamageEntries([
      ...damageEntries,
      { id: newId, count: 1, dice: 'd8', type: 'Hieb' },
    ]);
  };

  const removeDamageEntry = (id: string) => {
    if (damageEntries.length <= 1) return;
    setDamageEntries(damageEntries.filter((entry) => entry.id !== id));
  };

  const updateDamageEntry = (
    id: string,
    field: 'count' | 'dice' | 'type',
    value: string | number
  ) => {
    setDamageEntries(
      damageEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const generateDamageDice = (): string => {
    if (damageEntries.length === 0) return '';
    return damageEntries
      .map((entry) => `${entry.count}${entry.dice} ${entry.type}`)
      .join(', ');
  };

  const createLocalItem = (): InventoryItem => {
    const damageDice = generateDamageDice();
    return {
      id: `temp-item-${Date.now()}`,
      name: formData.name,
      description: formData.description || '',
      quantity: parseInt(formData.quantity) || 1,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      value: formData.costAmount ? parseInt(formData.costAmount) : null,
      equipped: false,
      notes: formData.notes || '',
      sourceReference: formData.sourceReference || undefined,
      containerId: containerId || '',
      characterId: characterId,
      equipmentId: undefined,
      type: selectedType as any,
      subtype: formData.subtype || undefined,
      magicBonus: parseInt(formData.magicBonus) || 0,
      attackBonus: parseInt(formData.attackBonus) || 0,
      damageDice: damageDice || undefined,
      damageType: undefined,
      range: formData.range || undefined,
      weaponProperties: Array.isArray(formData.weaponProperties)
        ? formData.weaponProperties
        : [],
      armorClassBonus: parseInt(formData.armorClassBonus) || 0,
      armorType: formData.armorType || undefined,
      maxDexBonus: parseInt(formData.maxDexBonus) || 0,
      stealthDisadvantage: formData.stealthDisadvantage || false,
      strengthRequirement: parseInt(formData.strengthRequirement) || 0,
      shieldBonus: parseInt(formData.shieldBonus) || 0,
      attunement: formData.attunement || false,
      attuned: formData.attuned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Lokale Aktion für neue Charaktere (Muster wie createLocalItem)
  const createLocalAction = (): Action => {
    const now = new Date().toISOString();
    return {
      id: `temp-action-${Date.now()}`,
      name: formData.name,
      description: formData.description || '',
      type: formData.actionType,
      sourceType: formData.sourceType,
      sourceId: formData.sourceId || undefined,
      isCustom: formData.sourceType === 'custom',
      attackBonus: formData.attackBonus
        ? parseInt(formData.attackBonus)
        : undefined,
      damageDice: formData.damageDice || undefined,
      damageType: formData.damageType || undefined,
      range: formData.range || undefined,
      areaOfEffect: formData.areaOfEffect || undefined,
      usesPerDay: formData.usesPerDay ? parseInt(formData.usesPerDay) : undefined,
      usesRemaining: formData.usesPerDay
        ? parseInt(formData.usesPerDay)
        : undefined,
      rechargeType: formData.rechargeType,
      rechargeOnShortRest: formData.rechargeType === 'short',
      rechargeOnLongRest: formData.rechargeType === 'long',
      concentration: formData.concentration || false,
      savingThrow: formData.savingThrow || undefined,
      savingThrowDC: formData.savingThrowDC
        ? parseInt(formData.savingThrowDC)
        : undefined,
      linkedFeatureId: null,
      linkedClassLevelId: null,
            libraryEntryId: formData.libraryEntryId ?? null,
      characterId: 'new',
      createdAt: now,
      updatedAt: now,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (characterId === 'new' && itemType === 'inventory' && containerId) {
        const newItem = createLocalItem();
        if (onItemCreated) onItemCreated(newItem);
        onCreated();
        onClose();
        setIsSubmitting(false);
        return;
      }

      // Neuer Charakter: Aktion nur lokal anlegen — persistiert wird sie in
      // useCharacterSubmit nach POST /api/characters (Pitfall #6)
      if (characterId === 'new' && itemType === 'action') {
        const newAction = createLocalAction();
        if (onItemCreated) onItemCreated(newAction);
        persistActionInLibrary();
        onCreated();
        onClose();
        setIsSubmitting(false);
        return;
      }

      let endpoint = '';
      let payload: any = {};

      if (itemType === 'equipment' || itemType === 'inventory') {
        const isEquipment = itemType === 'equipment';
        endpoint = isEquipment
          ? `/api/characters/${characterId}/equipment`
          : `/api/characters/${characterId}/inventory/${containerId}/items`;

        // Für Equipment: FK sicherstellen (Reuse oder Neuanlage in Library).
        // Für InventoryItem: in Etappe 5c analog ergänzen.
        let libraryEntryId: string | null = null;
        if (isEquipment) {
          libraryEntryId = await ensureEquipmentLibraryEntry();
        }

        const damageDice = generateDamageDice();

        payload = {
          name: formData.name,
          description: formData.description || '',
          type: selectedType,
          subtype: formData.subtype || null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          costAmount: formData.costAmount ? parseInt(formData.costAmount) : null,
          quantity: parseInt(formData.quantity) || 1,
          magicBonus: parseInt(formData.magicBonus) || 0,
          attackBonus: parseInt(formData.attackBonus) || 0,
          damageDice: damageDice || null,
          damageType: null,
          range: formData.range || null,
          weaponProperties: Array.isArray(formData.weaponProperties)
            ? formData.weaponProperties
            : [],
          armorClassBonus: parseInt(formData.armorClassBonus) || 0,
          armorType: formData.armorType || null,
          maxDexBonus: parseInt(formData.maxDexBonus) || 0,
          stealthDisadvantage: formData.stealthDisadvantage || false,
          strengthRequirement: parseInt(formData.strengthRequirement) || 0,
          shieldBonus: parseInt(formData.shieldBonus) || 0,
          attunement: formData.attunement || false,
          attuned: formData.attuned || false,
          notes: formData.notes || '',
          sourceReference: formData.sourceReference || '',
          equipped: false,
          costUnit: 'gp',
          libraryEntryId,
        };
      } else if (itemType === 'spell') {
        endpoint = `/api/characters/${characterId}/spells`;
        payload = {
          ...formData,
          level: parseInt(formData.level) || 0,
          components: Array.isArray(formData.components) ? formData.components : [],
        };
      } else if (itemType === 'action') {
        endpoint = `/api/characters/${characterId}/actions`;
        payload = {
          name: formData.name,
          description: formData.description,
          type: formData.actionType,
          sourceType: formData.sourceType,
          sourceId: formData.sourceId || null,
          isCustom: formData.sourceType === 'custom',
          attackBonus: formData.attackBonus
            ? parseInt(formData.attackBonus)
            : null,
          damageDice: formData.damageDice || null,
          damageType: formData.damageType || null,
          range: formData.range || null,
          areaOfEffect: formData.areaOfEffect || null,
          usesPerDay: formData.usesPerDay ? parseInt(formData.usesPerDay) : null,
          usesRemaining: formData.usesPerDay ? parseInt(formData.usesPerDay) : null,
          rechargeType: formData.rechargeType,
          rechargeOnShortRest: formData.rechargeType === 'short',
          rechargeOnLongRest: formData.rechargeType === 'long',
          concentration: formData.concentration || false,
          savingThrow: formData.savingThrow || null,
          savingThrowDC: formData.savingThrowDC
            ? parseInt(formData.savingThrowDC)
            : null,
                      libraryEntryId: formData.libraryEntryId ?? null,
        };
      }

      if (!endpoint) {
        setError('Kein Endpunkt für diesen Item-Typ gefunden');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        persistActionInLibrary();
        onCreated();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Erstellen');
      }
    } catch (error) {
      console.error('Fehler:', error);
      setError('Fehler beim Erstellen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const equipmentTypes = Object.entries(EQUIPMENT_TYPES);

  const renderMagicBonusField = () => (
    <div>
      <label className="block text-sm font-medium mb-1">Magischer Bonus</label>
      <select
        value={formData.magicBonus}
        onChange={(e) => handleInputChange('magicBonus', parseInt(e.target.value))}
        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
      >
        {MAGIC_BONUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderWeaponFields = () => (
    <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
      {renderMagicBonusField()}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Angriffsbonus</label>
          <input
            type="number"
            value={formData.attackBonus}
            onChange={(e) =>
              handleInputChange('attackBonus', parseInt(e.target.value) || 0)
            }
            placeholder="0"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Reichweite ({getDistanceUnitLabel(unitSystem)})
          </label>
          <input
            type="text"
            value={formData.range}
            onChange={(e) => handleInputChange('range', e.target.value)}
            placeholder={unitSystem === 'imperial' ? 'z. B. 5 ft' : 'z. B. 1.5 m'}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
      </div>

      <div>
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
        <div className="space-y-2">
          {damageEntries.map((entry, index) => (
            <div key={entry.id} className="flex gap-2 items-center">
              <span className="text-xs text-gray-400 w-6">#{index + 1}</span>
              <input
                type="number"
                min="1"
                max="10"
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
                disabled={damageEntries.length <= 1}
                className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Waffen-Eigenschaften</label>
        <div className="flex flex-wrap gap-2">
          {libraryWeaponProperties.length === 0 && (
            <div className="text-xs text-gray-500 italic">
              Lade Waffen-Eigenschaften…
            </div>
          )}
          {libraryWeaponProperties.map((prop) => (
            <label key={prop.name} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                title={prop.description}
                checked={formData.weaponProperties?.includes(prop.name)}
                onChange={(e) => {
                  const current = formData.weaponProperties || [];
                  if (e.target.checked) {
                    handleInputChange('weaponProperties', [
                      ...current,
                      prop.name,
                    ]);
                  } else {
                    handleInputChange(
                      'weaponProperties',
                      current.filter((p: string) => p !== prop.name)
                    );
                  }
                }}
                className="rounded"
              />
              {prop.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArmorFields = () => (
    <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
      {renderMagicBonusField()}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Rüstungsklasse (AC)</label>
          <input
            type="number"
            value={formData.armorClassBonus}
            onChange={(e) =>
              handleInputChange('armorClassBonus', parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rüstungstyp</label>
          <select
            value={formData.armorType}
            onChange={(e) => handleInputChange('armorType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          >
            <option value="">Keine</option>
            {ARMOR_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max. Geschick-Bonus</label>
          <input
            type="number"
            value={formData.maxDexBonus}
            onChange={(e) =>
              handleInputChange('maxDexBonus', parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stärke-Anforderung</label>
          <input
            type="number"
            value={formData.strengthRequirement}
            onChange={(e) =>
              handleInputChange(
                'strengthRequirement',
                parseInt(e.target.value) || 0
              )
            }
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div className="col-span-2 flex items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.stealthDisadvantage}
              onChange={(e) =>
                handleInputChange('stealthDisadvantage', e.target.checked)
              }
              className="rounded"
            />
            Nachteil auf Heimlichkeit
          </label>
        </div>
      </div>
    </div>
  );

  const renderShieldFields = () => (
    <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
      {renderMagicBonusField()}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">AC-Bonus</label>
          <input
            type="number"
            value={formData.shieldBonus}
            onChange={(e) =>
              handleInputChange('shieldBonus', parseInt(e.target.value) || 2)
            }
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
      </div>
    </div>
  );

  const renderClothingFields = () => (
    <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
      {renderMagicBonusField()}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Rüstungsklasse (AC)</label>
          <input
            type="number"
            value={formData.armorClassBonus}
            onChange={(e) =>
              handleInputChange('armorClassBonus', parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
      </div>
    </div>
  );

  const renderSpellFields = () => (
    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-800/50 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Level</label>
        <input
          type="number"
          value={formData.level}
          onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 0)}
          min="0"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Schule</label>
        <select
          value={formData.school}
          onChange={(e) => handleInputChange('school', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        >
          <option value="">Auswählen...</option>
          {SPELL_SCHOOLS.map((school) => (
            <option key={school} value={school}>
              {school.charAt(0).toUpperCase() + school.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Zauberzeit</label>
        <input
          type="text"
          value={formData.castingTime}
          onChange={(e) => handleInputChange('castingTime', e.target.value)}
          placeholder="z.B. 1 Aktion"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Reichweite</label>
        <input
          type="text"
          value={formData.range}
          onChange={(e) => handleInputChange('range', e.target.value)}
          placeholder="z.B. 30 ft"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Dauer</label>
        <input
          type="text"
          value={formData.duration}
          onChange={(e) => handleInputChange('duration', e.target.value)}
          placeholder="z.B. Konzentration, bis zu 1 Minute"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Komponenten</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {SPELL_COMPONENTS.map((comp) => (
            <label key={comp} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={formData.components?.includes(comp)}
                onChange={(e) => {
                  const current = formData.components || [];
                  if (e.target.checked) {
                    handleInputChange('components', [...current, comp]);
                  } else {
                    handleInputChange(
                      'components',
                      current.filter((c: string) => c !== comp)
                    );
                  }
                }}
                className="rounded"
              />
              {comp}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Material-Komponente</label>
        <input
          type="text"
          value={formData.materialComponent}
          onChange={(e) => handleInputChange('materialComponent', e.target.value)}
          placeholder="z.B. eine kleine Feder"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.concentration}
            onChange={(e) => handleInputChange('concentration', e.target.checked)}
            className="rounded"
          />
          Konzentration
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.ritual}
            onChange={(e) => handleInputChange('ritual', e.target.checked)}
            className="rounded"
          />
          Ritual
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Schadenswürfel</label>
        <input
          type="text"
          value={formData.damageDice}
          onChange={(e) => handleInputChange('damageDice', e.target.value)}
          placeholder="z.B. 2d6"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Schadenstyp</label>
        <input
          type="text"
          value={formData.damageType}
          onChange={(e) => handleInputChange('damageType', e.target.value)}
          placeholder="z.B. Feuer, Kälte"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Rettungswurf</label>
        <input
          type="text"
          value={formData.savingThrow}
          onChange={(e) => handleInputChange('savingThrow', e.target.value)}
          placeholder="z.B. Weisheit"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Wirkt auf</label>
        <select
          value={formData.SpellType}
          onChange={(e) => handleInputChange('SpellType', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        >
          <option value="">Auswählen...</option>
          <option value="melee">Nahkampf</option>
          <option value="ranged">Fernkampf</option>
          <option value="Self">Selbst</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Angriffstyp</label>
        <select
          value={formData.AttackType}
          onChange={(e) => handleInputChange('AttackType', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        >
          <option value="">Auswählen...</option>
          <option value="saving_throw">Rettungswurf</option>
          <option value="Attack">Angriff</option>
          <option value="Direct Hit">Direkter Treffer</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium mb-1">Höhere Level</label>
        <input
          type="text"
          value={formData.higherLevels}
          onChange={(e) => handleInputChange('higherLevels', e.target.value)}
          placeholder="z.B. +1d6 pro Level"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
      </div>
    </div>
  );

  const renderActionSuggestions = () => (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="text-xs font-semibold text-gray-400 mb-2">
        Aus Bibliothek
      </div>

      {libraryActionsLoading && (
        <div className="text-center text-gray-500 text-xs py-2">Lade…</div>
      )}

      {!libraryActionsLoading && actionSuggestions.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-2 italic">
          Keine Vorschläge für diesen Aktionstyp
        </div>
      )}

      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {actionSuggestions.map((entry) => (
          <button
            key={entry.id}
            type="button"
            title={entry.description}
            onClick={() => applyActionSuggestion(entry)}
            className="px-2 py-1 rounded text-sm transition bg-gray-700 hover:bg-gray-600"
          >
            {entry.icon} {entry.name}
          </button>
        ))}
      </div>
    </div>
  );

  const renderActionFields = () => (
    <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Aktionstyp</label>
          <select
            value={formData.actionType}
            onChange={(e) => handleInputChange('actionType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ').charAt(0).toUpperCase() +
                  type.replace('_', ' ').slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Quelle</label>
          <select
            value={formData.sourceType}
            onChange={(e) => handleInputChange('sourceType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          >
            <option value="custom">Benutzerdefiniert</option>
            <option value="equipment">Ausrüstung</option>
            <option value="spell">Zauber</option>
            <option value="feature">Feature</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Schadenswürfel</label>
          <input
            type="text"
            value={formData.damageDice}
            onChange={(e) => handleInputChange('damageDice', e.target.value)}
            placeholder="z.B. 1d8"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Schadenstyp</label>
          <input
            type="text"
            value={formData.damageType}
            onChange={(e) => handleInputChange('damageType', e.target.value)}
            placeholder="z.B. Stich"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Reichweite ({getDistanceUnitLabel(unitSystem)})
          </label>
          <input
            type="text"
            value={formData.range}
            onChange={(e) => handleInputChange('range', e.target.value)}
            placeholder={unitSystem === 'imperial' ? 'z. B. 5 ft' : 'z. B. 1.5 m'}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Wirkungsbereich</label>
          <input
            type="text"
            value={formData.areaOfEffect}
            onChange={(e) => handleInputChange('areaOfEffect', e.target.value)}
            placeholder="z.B. 15 ft Kegel"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Angriffsbonus</label>
          <input
            type="number"
            value={formData.attackBonus}
            onChange={(e) =>
              handleInputChange('attackBonus', parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nutzungen</label>
          <input
            type="number"
            value={formData.usesPerDay || ''}
            onChange={(e) =>
              handleInputChange('usesPerDay', parseInt(e.target.value) || 0)
            }
            placeholder="0 = unbegrenzt"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
      </div>

      {/* Rettungswurf */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Rettungswurf</label>
          <input
            type="text"
            value={formData.savingThrow}
            onChange={(e) => handleInputChange('savingThrow', e.target.value)}
            placeholder="z.B. Geschick"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SG</label>
          <input
            type="number"
            value={formData.savingThrowDC || ''}
            onChange={(e) =>
              handleInputChange('savingThrowDC', e.target.value || '')
            }
            placeholder="z.B. 15"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          />
        </div>
      </div>

      {/* Aufladung & Konzentration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Aufladung</label>
          <select
            value={formData.rechargeType}
            onChange={(e) => handleInputChange('rechargeType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          >
            {RECHARGE_TYPES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.concentration}
              onChange={(e) =>
                handleInputChange('concentration', e.target.checked)
              }
              className="rounded"
            />
            Konzentration
          </label>
        </div>
      </div>
    </div>
  );

  const renderSpecificFields = () => {
    if (itemType === 'equipment' || itemType === 'inventory') {
      if (selectedType === 'weapon') return renderWeaponFields();
      if (selectedType === 'armor') return renderArmorFields();
      if (selectedType === 'shield') return renderShieldFields();
      if (selectedType === 'clothing') return renderClothingFields();
      return null;
    } else if (itemType === 'spell') {
      return renderSpellFields();
    } else if (itemType === 'action') {
      return renderActionFields();
    }
    return null;
  };

  const getTitle = () => {
    if (itemType === 'equipment') return 'Neuen Gegenstand erstellen';
    if (itemType === 'spell') return 'Neuen Zauber erstellen';
    if (itemType === 'action') return 'Neue Aktion erstellen';
    if (itemType === 'inventory') return 'Neues Inventar-Item erstellen';
    return 'Item erstellen';
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{getTitle()}</h2>
          <button type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {itemType === 'action' && renderActionSuggestions()}

          {(itemType === 'equipment' || itemType === 'inventory') && (
            <div>
              <label className="block text-sm font-medium mb-1">Typ</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as EquipmentType)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
              >
                {equipmentTypes.map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.icon} {value.label} ({value.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
              placeholder="z.B. Langschwert"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 resize-none"
              placeholder="Beschreibung..."
            />
          </div>

          {(itemType === 'equipment' || itemType === 'inventory') && (
            <div>
              <label className="block text-sm font-medium mb-1">Notizen</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Zusätzliche Notizen"
                className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
              />
            </div>
          )}

          {(itemType === 'equipment' || itemType === 'inventory') && (
            <div>
              <label className="block text-sm font-medium mb-1">Quellenangabe</label>
              <input
                type="text"
                value={formData.sourceReference}
                onChange={(e) => handleInputChange('sourceReference', e.target.value)}
                placeholder="z. B. PHB S. 149"
                className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
              />
            </div>
          )}

          {(itemType === 'equipment' || itemType === 'inventory') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gewicht ({getWeightUnitLabel(unitSystem)})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder={unitSystem === 'imperial' ? 'z.B. 3' : 'z.B. 1.4'}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Wert (Gold)</label>
                <input
                  type="number"
                  value={formData.costAmount}
                  onChange={(e) => handleInputChange('costAmount', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Anzahl</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange('quantity', parseInt(e.target.value) || 1)
                  }
                  min="1"
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.attunement}
                    onChange={(e) =>
                      handleInputChange('attunement', e.target.checked)
                    }
                    className="rounded"
                  />
                  Erfordert Einstimmung
                </label>
              </div>
            </div>
          )}

          {renderSpecificFields()}

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
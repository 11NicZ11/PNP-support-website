// src/components/character/hooks/useCharacterHandlers.ts
'use client';

import { useCallback } from 'react';
import { CharacterState } from './useCharacterState';
import { CharacterMemos } from './useCharacterMemos';
import { DefenseItem, DefenseSource } from '../modals/DefensesModal';
import { Attribute } from '../editors/AttributesEditor';
import { AlternateForm } from '@/types/forms';
import { Companion } from '@/types/companions';
import { Spell } from '@/types/spells';

interface HandlerOptions {
  characterId: string;
  isNew: boolean;
}

export function useCharacterHandlers(
  state: CharacterState,
  memos: CharacterMemos,
  { characterId, isNew }: HandlerOptions
) {
  const {
    raceData,
    attributes,
    alternateForms,
    companions,
    resources,
    skills,
    statusEffects,
    itemModalState,
    setDefenses,
    setAlternateForms,
    setCompanions,
    setResources,
    setSkills,
    setSavingThrows,
    setCurrentHp,
    setTempHp,
    setTempMaxHp,
    setTempMaxHpMax,
    setExhaustionLevel,
    setHitDice,
    setSpellSlots,
    setLastLongRest,
    setStatusEffects,
    setContainers,
    setActions,
    setSpells,
    setItemModalState,
    setSpellModalOpen,
    setEditingSpell,
    setEquipmentRefresh,
  } = state;

  const { totalHp, activeForm } = memos;
const { tempMaxHpMax } = state;

  // ===== DEFENSES =====
  const handleRaceDefensesChange = useCallback(
    (raceDefs: DefenseItem[]) => {
      setDefenses((prev) => {
        const others = prev.filter((d) => d.source !== 'race');
        const normalized = raceDefs.map((d) => ({
          ...d,
          source: 'race' as DefenseSource,
          sourceName: raceData.name || 'Rasse',
        }));
        return [...others, ...normalized];
      });
    },
    [raceData.name, setDefenses]
  );

  const handleClassDefensesChange = useCallback(
    (className: string, classDefs: DefenseItem[]) => {
      setDefenses((prev) => {
        const others = prev.filter(
          (d) => !(d.source === 'class' && d.sourceName === className)
        );
        const normalized = classDefs.map((d) => ({
          ...d,
          source: 'class' as DefenseSource,
          sourceName: className,
        }));
        return [...others, ...normalized];
      });
    },
    [setDefenses]
  );

  const handleManualDefensesUpdate = useCallback(
    (
      immunities: DefenseItem[],
      resistances: DefenseItem[],
      conditions: DefenseItem[]
    ) => {
      setDefenses((prev) => {
        const others = prev.filter((d) => d.source !== 'manual');
        const normalized = [...immunities, ...resistances, ...conditions].map(
          (d) => ({
            ...d,
            source: 'manual' as DefenseSource,
            sourceName: 'Manuell',
          })
        );
        return [...others, ...normalized];
      });
    },
    [setDefenses]
  );

  // ===== SKILLS / ATTRIBUTES =====
  const addCustomSkill = useCallback(
  async (name: string, attributeName: string) => {
    if (skills.some((s) => s.name === name)) return;

    // In Bibliothek speichern (fire-and-forget)
    fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'skill',
        name,
        description: '',
        icon: '🎯',
        data: { attributeName },
      }),
    }).catch((err) => console.error('Library POST Fehler:', err));

    setSkills([
      ...skills,
      {
        id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        attributeName,
        isProficient: false,
        expertise: false,
        isCustom: false,
        proficiencySource: 'custom',
        sourceDetail: '',
      },
    ]);
  },
  [skills, setSkills]
);

  const handleAddAttributeForSavingThrow = useCallback(
    (name: string) => {
      const newAttr: Attribute = {
        id: `attr-${Date.now()}`,
        name,
        value: 10,
        baseValue: 10,
        isDefault: false,
        order: attributes.length,
      };
      state.setAttributes([...attributes, newAttr]);
      setSavingThrows((prev) => [
        ...prev,
        {
          id: `st-${newAttr.id}`,
          name: newAttr.name,
          attributeName: newAttr.name,
          isProficient: true,
          expertise: false,
        },
      ]);
    },
    [attributes, setSavingThrows, state]
  );

  const handleRenameAttribute = useCallback(
    (oldName: string, newName: string) => {
      setSkills((prev) =>
        prev.map((s) =>
          s.attributeName === oldName ? { ...s, attributeName: newName } : s
        )
      );
      setSavingThrows((prev) =>
        prev.map((st) =>
          st.attributeName === oldName
            ? { ...st, attributeName: newName, name: newName }
            : st
        )
      );
    },
    [setSkills, setSavingThrows]
  );

  const handleDeleteAttribute = useCallback(
    (attr: Attribute) => {
      setSkills((prev) => prev.filter((s) => s.attributeName !== attr.name));
      setSavingThrows((prev) =>
        prev.filter((st) => st.attributeName !== attr.name)
      );
    },
    [setSkills, setSavingThrows]
  );

  // ===== MODALS =====
  const openItemModal = useCallback(
    (itemType: 'equipment' | 'action' | 'inventory', containerId?: string) => {
      setItemModalState({ isOpen: true, itemType, containerId });
    },
    [setItemModalState]
  );

  const closeItemModal = useCallback(() => {
    setItemModalState({ isOpen: false, itemType: 'equipment' });
  }, [setItemModalState]);

  const handleItemCreated = useCallback(
    async (newItem?: any) => {
      if (newItem && itemModalState.containerId) {
        setContainers((prev) =>
          prev.map((c) =>
            c.id === itemModalState.containerId
              ? { ...c, items: [...(c.items || []), newItem] }
              : c
          )
        );
      }
      // Bei neuen Charakteren wird die Aktion nur lokal gehalten — persistiert
      // wird sie in useCharacterSubmit nach POST /api/characters (Pitfall #6)
      if (itemModalState.itemType === 'action' && isNew && newItem) {
        setActions((prev) => [...prev, newItem]);
      }
      if (itemModalState.itemType === 'action' && !isNew) {
        try {
          const res = await fetch(`/api/characters/${characterId}/actions`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setActions(data);
          }
        } catch (err) {
          console.error('Fehler beim Nachladen der Aktionen:', err);
        }
      }
      setEquipmentRefresh((prev) => prev + 1);
    },
    [
      itemModalState,
      isNew,
      characterId,
      setContainers,
      setActions,
      setEquipmentRefresh,
    ]
  );

  const handleSpellCreated = useCallback(
    (spell: Spell) => {
      setSpells((prev) => [...prev, spell]);
      setSpellModalOpen(false);
    },
    [setSpells, setSpellModalOpen]
  );

  const handleSpellUpdated = useCallback(
    (updated: Spell) => {
      setSpells((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSpell(null);
    },
    [setSpells, setEditingSpell]
  );

  const handleCastConcentrationSpell = useCallback(
    async (spell: Spell) => {
      const existingConcentration = statusEffects.find(
        (e: any) => e.source === 'concentration'
      );

      if (existingConcentration) {
        const confirmReplace = confirm(
          `Du konzentrierst dich bereits auf "${
            existingConcentration.sourceName || 'einen Zauber'
          }".\nMöchtest du die Konzentration aufgeben und stattdessen "${
            spell.name
          }" wirken?`
        );
        if (!confirmReplace) return;

        if (!isNew) {
          try {
            await fetch(
              `/api/characters/${characterId}/status-effects/${existingConcentration.id}`,
              { method: 'DELETE' }
            );
          } catch (err) {
            console.error(
              'Fehler beim Löschen des alten Konzentrations-Effekts:',
              err
            );
          }
        }
        setStatusEffects((prev: any[]) =>
          prev.filter((e) => e.id !== existingConcentration.id)
        );
      }

      const newEffect = {
        name: `Konzentriert: ${spell.name}`,
        description: `Konzentriert sich auf "${spell.name}"`,
        icon: '🧘',
        source: 'concentration',
        sourceName: spell.name,
        duration: null,
        durationUnit: null,
        isActive: true,
      };

      if (isNew) {
        const localEffect = { ...newEffect, id: `temp-conc-${Date.now()}` };
        setStatusEffects((prev: any[]) => [...prev, localEffect]);
      } else {
        try {
          const res = await fetch(
            `/api/characters/${characterId}/status-effects`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEffect),
            }
          );
          if (res.ok) {
            const created = await res.json();
            setStatusEffects((prev: any[]) => [...prev, created]);
          }
        } catch (err) {
          console.error(
            'Fehler beim Erstellen des Konzentrations-Effekts:',
            err
          );
        }
      }
    },
    [
      statusEffects,
      isNew,
      characterId,
      setStatusEffects,
    ]
  );

  const handleHealFromHitDie = useCallback(
    (amount: number) => {
      setCurrentHp((prev) =>
        Math.min(totalHp + tempMaxHpMax, prev + amount)
      );
    },
    [totalHp, tempMaxHpMax, setCurrentHp]
  );

  const handleRestUpdate = useCallback(
    (updated: any) => {
      if (updated.currentHp !== undefined) setCurrentHp(updated.currentHp);
      if (updated.tempHp !== undefined) setTempHp(updated.tempHp);
      if (updated.tempMaxHp !== undefined) setTempMaxHp(updated.tempMaxHp);
      if (updated.tempMaxHpMax !== undefined)
        setTempMaxHpMax(updated.tempMaxHpMax);
      if (updated.exhaustionLevel !== undefined)
        setExhaustionLevel(updated.exhaustionLevel);
      if (updated.resources) setResources(updated.resources);
      if (updated.hitDice) setHitDice(updated.hitDice);
      if (updated.spellSlots) setSpellSlots(updated.spellSlots);
      if (updated.lastLongRest !== undefined)
        setLastLongRest(updated.lastLongRest);
    },
    [
      setCurrentHp,
      setTempHp,
      setTempMaxHp,
      setTempMaxHpMax,
      setExhaustionLevel,
      setResources,
      setHitDice,
      setSpellSlots,
      setLastLongRest,
    ]
  );

  const handleExhaustionChange = useCallback(
    async (newLevel: number) => {
      setExhaustionLevel(newLevel);
      if (isNew) return;
      try {
        await fetch(`/api/characters/${characterId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exhaustionLevel: newLevel }),
        });
      } catch (err) {
        console.error('Fehler beim Speichern der Erschöpfung:', err);
      }
    },
    [isNew, characterId, setExhaustionLevel]
  );

  // ===== FORMS =====
  const handleActivateForm = useCallback(
    async (form: AlternateForm) => {
      if (form.linkedResourceId) {
        const linkedResource = resources.find(
          (r) => r.id === form.linkedResourceId
        );
        if (linkedResource) {
          if (linkedResource.current <= 0) {
            alert(
              `Keine Nutzungen mehr für "${linkedResource.name}" verfügbar. Bitte erst rasten.`
            );
            return;
          }
          const newResources = resources.map((r) =>
            r.id === form.linkedResourceId
              ? { ...r, current: r.current - 1 }
              : r
          );
          setResources(newResources);
        }
      }

      const newForms = alternateForms.map((f) => ({
        ...f,
        isActive: f.id === form.id,
        hpCurrent: f.id === form.id ? f.hpMax : f.hpCurrent,
      }));
      setAlternateForms(newForms);

      if (!isNew) {
        try {
          await fetch(`/api/characters/${characterId}/forms/${form.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'activate' }),
          });
          if (form.linkedResourceId) {
            const linkedResource = resources.find(
              (r) => r.id === form.linkedResourceId
            );
            if (linkedResource) {
              await fetch(`/api/characters/${characterId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  resources: resources.map((r) =>
                    r.id === form.linkedResourceId
                      ? { ...r, current: r.current - 1 }
                      : r
                  ),
                }),
              });
            }
          }
        } catch (err) {
          console.error('Fehler beim Aktivieren der Form:', err);
        }
      }
    },
    [
      resources,
      alternateForms,
      isNew,
      characterId,
      setResources,
      setAlternateForms,
    ]
  );

  const handleDeactivateForm = useCallback(
    async (form: AlternateForm) => {
      const newForms = alternateForms.map((f) =>
        f.id === form.id ? { ...f, isActive: false } : f
      );
      setAlternateForms(newForms);

      if (!isNew) {
        try {
          await fetch(`/api/characters/${characterId}/forms/${form.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deactivate' }),
          });
        } catch (err) {
          console.error('Fehler beim Deaktivieren der Form:', err);
        }
      }
    },
    [alternateForms, isNew, characterId, setAlternateForms]
  );

  const handleFormDamage = useCallback(
    async (amount: number) => {
      if (!activeForm) return;
      const newHp = Math.max(0, activeForm.hpCurrent - amount);
      const newForms = alternateForms.map((f) =>
        f.id === activeForm.id ? { ...f, hpCurrent: newHp } : f
      );

      if (newHp === 0 && activeForm.durationType === 'until_hp_zero') {
        const deactivated = newForms.map((f) =>
          f.id === activeForm.id ? { ...f, isActive: false } : f
        );
        setAlternateForms(deactivated);
      } else {
        setAlternateForms(newForms);
      }

      if (!isNew) {
        try {
          await fetch(
            `/api/characters/${characterId}/forms/${activeForm.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hpCurrent: newHp }),
            }
          );
        } catch (err) {
          console.error('Fehler beim Aktualisieren der Form-HP:', err);
        }
      }
    },
    [
      activeForm,
      alternateForms,
      isNew,
      characterId,
      setAlternateForms,
    ]
  );

  const handleFormHeal = useCallback(
    async (amount: number) => {
      if (!activeForm) return;
      const newHp = Math.min(activeForm.hpMax, activeForm.hpCurrent + amount);
      const newForms = alternateForms.map((f) =>
        f.id === activeForm.id ? { ...f, hpCurrent: newHp } : f
      );
      setAlternateForms(newForms);

      if (!isNew) {
        try {
          await fetch(
            `/api/characters/${characterId}/forms/${activeForm.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hpCurrent: newHp }),
            }
          );
        } catch (err) {
          console.error('Fehler beim Aktualisieren der Form-HP:', err);
        }
      }
    },
    [
      activeForm,
      alternateForms,
      isNew,
      characterId,
      setAlternateForms,
    ]
  );

  // ===== COMPANIONS =====
  const handleCompanionDamage = useCallback(
    async (id: string, amount: number) => {
      const companion = companions.find((c) => c.id === id);
      if (!companion) return;

      let remaining = amount;
      let newTempHp = companion.tempHp;
      if (newTempHp > 0) {
        const dmg = Math.min(newTempHp, remaining);
        newTempHp -= dmg;
        remaining -= dmg;
      }
      const newHp = Math.max(0, companion.hpCurrent - remaining);

      setCompanions((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, hpCurrent: newHp, tempHp: newTempHp } : c
        )
      );

      if (!isNew) {
        try {
          await fetch(`/api/characters/${characterId}/companions/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'damage', amount }),
          });
        } catch (err) {
          console.error('Fehler beim Schaden am Gefährten:', err);
        }
      }
    },
    [companions, isNew, characterId, setCompanions]
  );

  const handleCompanionHeal = useCallback(
    async (id: string, amount: number) => {
      const companion = companions.find((c) => c.id === id);
      if (!companion) return;
      const newHp = Math.min(companion.hpMax, companion.hpCurrent + amount);

      setCompanions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, hpCurrent: newHp } : c))
      );

      if (!isNew) {
        try {
          await fetch(`/api/characters/${characterId}/companions/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'heal', amount }),
          });
        } catch (err) {
          console.error('Fehler bei Heilung des Gefährten:', err);
        }
      }
    },
    [companions, isNew, characterId, setCompanions]
  );

  const handleCompanionDismiss = useCallback(
    async (id: string) => {
      setCompanions((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isDismissed: true, isActive: false } : c
        )
      );

      if (!isNew) {
        try {
          await fetch(`/api/characters/${characterId}/companions/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'dismiss' }),
          });
        } catch (err) {
          console.error('Fehler beim Wegschicken:', err);
        }
      }
    },
    [isNew, characterId, setCompanions]
  );

  const handleCompanionRecall = useCallback(
    async (id: string) => {
      setCompanions((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isDismissed: false, isActive: true } : c
        )
      );

      if (!isNew) {
        try {
          await fetch(`/api/characters/${characterId}/companions/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'recall' }),
          });
        } catch (err) {
          console.error('Fehler beim Zurückrufen:', err);
        }
      }
    },
    [isNew, characterId, setCompanions]
  );

  const handleCompanionActivateFromFeature = useCallback(
    async (companion: Companion) => {
      if (companion.isDismissed) {
        await handleCompanionRecall(companion.id);
      } else {
        await handleCompanionDismiss(companion.id);
      }
    },
    [handleCompanionRecall, handleCompanionDismiss]
  );

  return {
    handleRaceDefensesChange,
    handleClassDefensesChange,
    handleManualDefensesUpdate,
    addCustomSkill,
    handleAddAttributeForSavingThrow,
    handleRenameAttribute,
    handleDeleteAttribute,
    openItemModal,
    closeItemModal,
    handleItemCreated,
    handleSpellCreated,
    handleSpellUpdated,
    handleCastConcentrationSpell,
    handleHealFromHitDie,
    handleRestUpdate,
    handleExhaustionChange,
    handleActivateForm,
    handleDeactivateForm,
    handleFormDamage,
    handleFormHeal,
    handleCompanionDamage,
    handleCompanionHeal,
    handleCompanionDismiss,
    handleCompanionRecall,
    handleCompanionActivateFromFeature,
  };
}

export type CharacterHandlers = ReturnType<typeof useCharacterHandlers>;
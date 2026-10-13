# PROJECT_MAP.md

Einstiegspunkt für Agents vor jeder Analyse oder jedem Refactor.
Erklärt **Zweck und Struktur**, nicht **mechanische Details** — die
kommen aus `codescope` (`stats`, `context`, `search_symbols`).

Regeln und Tabus: siehe `AGENTS.md`. Task-spezifische Regel-Details:
siehe `agent-rules/`.

---

## Was die App ist

Web-App zur Verwaltung von Pen-&-Paper-Charakteren. Nutzer bauen
Charaktere aus wiederverwendbaren Bausteinen (Skills, Zauber, Ausrüstung,
Klassen, Rassen) frei zusammen. Keine Regelwerk-Bindung.

Bausteine leben zentral in der **Bibliothek von Babylon**
(`LibraryEntry`). Charakter-Einträge referenzieren einen Library-Eintrag
via FK und halten einen lokalen Snapshot.

Detail: `README.md`, `AGENTS.md`.

---

## Top-Level-Struktur

---
name: codebase-analysis
description: >
  Analyze this repository's architecture, find duplication, dead code,
  circular imports, and API issues. Use this skill whenever the user asks
  for a code audit, architecture review, duplication scan, dead-code check,
  sprint-readiness analysis, or "Analyze the repo" / "Finde Duplikate" /
  "Was können wir verbessern". Produces a structured Markdown report with
  file:line evidence and a priority-ranked fix list.
---

# Codebase Analysis Skill

## When this skill is invoked

Trigger phrases (German or English):
- "Analysiere das Repo"
- "Finde Duplikate"
- "Architektur-Review" / "Architecture audit"
- "Dead Code prüfen"
- "Was können wir verbessern?"
- "Ist der Sprint fertig?" / "Sprint-Report prüfen"
- "Was ist der nächste logische Schritt?"

## Output contract

Always produce a Markdown report with exactly these sections. Do not
add extra sections. Do not skip sections that apply.

### 1. Baseline

One table:

| Check | Result |
|---|---|
| tsc | clean / N errors |
| tests | N passed / N total |
| git status | clean / N uncommitted |
| HEAD | hash — message |

### 2. Current structure

Max 10 lines:
- Top-level layout
- File count, API route count, Prisma model count
- Which layers are clean, which aren't

### 3. Findings

One table per category. Omit empty categories.

**Duplication:**
| What | Where | Identical? | Risk (low/med/high) |

**Dead code:**
| Symbol | Location | Classification (truly dead / orphan export / test-only) |

**Type-system issues:**
| File:line | Issue | Severity |

**API issues:**
| Route | Method | Flag |

**Circular imports:**
| Pair | Type-only or runtime | Severity |

### 4. Top 3 risks

Max 1 sentence each. Priority-ranked.

### 5. Recommended next sprint

One paragraph, no code. State goal, scope, verification.

## Efficiency rules (critical for token savings)

- **Never print full files.** Reference by `file:line`. Quote max 3 lines
  when necessary.
- **Never re-analyze what's already done.** Check `git log` first — if a
  sprint commit with a matching topic exists, treat it as closed.
- **Use grep-style searches, not directory reads:**
  - Windows: `Select-String -Path src -Recurse -Pattern "..."`
  - Report hits as `file:line: content`. Not full files.
- **Batch findings.** If 5 files share a pattern, one row with the 5
  paths. Do not quote each.
- **No new package recommendations.** Note as finding if relevant.
- **Quote the diff, not the file.** When verifying a change, use
  `git diff` output, not `git show` full file.

## Project-specific context

This project:
- `AGENTS.md` at root — cross-agent rules, absolute taboos
- `.clinerules/` — detailed rules (local, gitignored, user-owned)
- Sprints 0, 0.5, 1A, 1B, 1C complete
- Branch `dev` (default), `main` (protected)
- 132 tests, `tsc` clean

Do NOT restate `.clinerules/` content. Assume it exists and is enforced.

## Reference files

- Full report template: `templates/audit-report.md`
- Example output: `examples/sample-audit.md`

Read these only when producing a full audit or when the user asks for a
specific format.

## Anti-patterns (do not do these)

- Do NOT produce a 2000-word narrative. Use tables.
- Do NOT quote entire functions to explain a finding.
- Do NOT suggest refactors without a specific file:line and a concrete
  replacement.
- Do NOT ask "would you like me to proceed?" — state what you would do
  next, wait for the user's decision.
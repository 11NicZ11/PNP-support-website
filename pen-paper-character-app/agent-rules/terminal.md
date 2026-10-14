# Terminal / Shell Rules

Read this when your task involves running commands. Dev environment is
**Windows PowerShell 5.1** (not bash, not pwsh 7). Most agent friction
happens here, not in the code.

## Working Directory — the #1 source of wasted time

**Every command runs from `pen-paper-character-app/`.** Do not `cd` to
the repo root unless the task explicitly requires it. Do not `cd` back
and forth. Pick the directory once and stay there.

Repo layout:

```
PNP-support-website/                ← git root. Avoid. No package.json.
  pen-paper-character-app/          ← WORK HERE. Everything is here.
    package.json                    ← npm/npx commands run here
    prisma/                         ← prisma commands run here
    src/                            ← source code
    agent-rules/                    ← these rules
    .clinerules/                    ← Cline rules
    vitest.config.ts
```

**Rules:**

1. `npm`, `npx`, `node`, `tsc`, `vitest`, `git`, `prisma` — all run from
   `pen-paper-character-app/`.
2. If your session started at the repo root: run
   `Set-Location pen-paper-character-app` **once**. Not per-command, not
   with `cd ..`, not in a chain.
3. **Never** write `cd X; cmd; cd ..; cmd; cd X; cmd`. That's three
   commands, three chances to lose track. One directory, all commands.
4. **Never** write files outside `pen-paper-character-app/`. That
   includes debug temp files (`_debug.mjs`, `_body.json`, etc.).

**Why this is critical:** every wrong-directory switch is a chance to
run the wrong `npm`, see "missing script", re-`cd`, lose track, and
waste 2–3 minutes. Over 20 commands per task, that's 40–60 minutes
lost. One working directory = zero lost time.

### If you're unsure where you are

```powershell
Get-Location
```

One command. If it doesn't end in `pen-paper-character-app`,
`Set-Location pen-paper-character-app`, then continue.

## The three PowerShell traps

### Trap 1 — `$` is interpolated inside double quotes

PowerShell treats `$name` inside `"..."` as a variable reference. This
breaks Node.js scripts and Prisma queries before they even run:

```powershell
# ❌ $queryRawUnsafe becomes empty string
node -e "const r = await p.$queryRawUnsafe('SELECT 1')"

# ✓ Single quotes protect the dollar sign
node -e 'const r = await p.$queryRawUnsafe("SELECT 1")'
```

**Rule:** any argument containing `$` MUST use single quotes at the
PowerShell layer. If the argument also contains single quotes (SQL),
that's Trap 2 — stop and use a temp file.

### Trap 2 — Quotes nest four layers deep

A command like this:
```
PowerShell string → curl argument → JSON body → SQL string
```
...has four different quoting rules. Each layer must escape the next.
The result is unreadable and error-prone.

```powershell
# ❌ Double-escaped nightmare, hard to debug
curl.exe -X PUT ".../$id" -H "Content-Type: application/json" -d "{\"name\":\"Test\"}"

# ✓ Boring, works
'{"name":"Test"}' | Out-File -Encoding utf8 _body.json
curl.exe -X PUT ".../$id" -H "Content-Type: application/json" --data-binary "@_body.json"
Remove-Item _body.json
```

### Trap 3 — `[` and `]` in paths are wildcards

Next.js dynamic routes contain brackets. PowerShell treats `[id]` as a
character class — like a regex, not a literal path.

```powershell
# ❌ [id] matches 'i' or 'd' — file not found
Get-Content src\app\api\characters\[id]\route.ts

# ❌ Single quotes don't help — brackets are still wildcards
Get-Content 'src\app\api\characters\[id]\route.ts'

# ❌ Doubling brackets doesn't help either
Get-Content 'src\app\api\characters\[[id]]\route.ts'

# ✓ ONLY this works
Get-Content -LiteralPath "src\app\api\characters\[id]\route.ts"
```

**Rule:** if a path contains `[` or `]`, ALWAYS use `-LiteralPath`. No
exceptions, no quote tricks, no doubling.

**Affected cmdlets:** `Get-Content`, `Set-Content`, `Select-String`,
`Test-Path`, `Get-Item`, `Copy-Item`, `Move-Item`, `Remove-Item`,
`Get-ChildItem`.

## Decision table — one-liner vs. temp file

| Situation | Use |
|---|---|
| `git status`, `git log`, `git diff` | One-liner |
| `npm run test`, `npm run typecheck` | One-liner |
| `curl` GET to localhost | One-liner |
| `curl` POST/PUT with JSON body | Temp file for the body |
| Prisma query via `node -e` | **Temp file** |
| Multi-line JavaScript | **Temp file** |
| Anything with `$queryRawUnsafe` / `$disconnect` / `$transaction` | **Temp file** |
| Anything with 3+ nested quote layers | **Temp file** |
| Anything you failed twice to write as a one-liner | **Temp file** |

**Rule of thumb:** if you've failed two attempts, stop. Write a temp
file. It costs 30 seconds and saves 10 minutes.

## Temp file conventions

- **Name pattern:** `_debug*.mjs` (leading underscore, `.mjs` extension)
- **Location:** project root (`pen-paper-character-app/`)
- **Extension:** `.mjs` — plain ESM, so `import { PrismaClient } from '@prisma/client'` works
- **Cleanup:** delete in the same command that ran it
- **Never commit.** `.gitignore` covers `_debug*.mjs` and `_debug*.js`.
- **Never write inside `src/` or `prisma/`** — those are repo-tracked.

## Common recipes

### Read a scalar from the DB

```js
// _debug.mjs
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
console.log('characters:', await p.character.count());
console.log('containers:', await p.inventoryContainer.count());
await p.$disconnect();
```

```powershell
node _debug.mjs
Remove-Item _debug.mjs
```

### Raw SQL read (Prisma)

```js
// _debug.mjs
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const rows = await p.$queryRawUnsafe(
  'SELECT COUNT(*) AS total FROM Equipment'
);
console.log(rows);
await p.$disconnect();
```

### Curl with JSON body

```powershell
'{"name":"Test"}' | Out-File -Encoding utf8 _body.json
curl.exe -X POST "http://localhost:3000/api/characters" `
  -H "Content-Type: application/json" `
  --data-binary "@_body.json"
Remove-Item _body.json
```

Backtick is line continuation. If it fails in your shell, put the whole
command on one line.

### Compare two JSON responses

```powershell
Compare-Object `
  (Get-Content _get.json | ConvertFrom-Json).PSObject.Properties.Name `
  (Get-Content _put.json | ConvertFrom-Json).PSObject.Properties.Name
```

### List table counts for sanity

```js
// _debug.mjs
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const tables = ['character', 'equipment', 'inventoryItem', 'spell', 'companion'];
for (const t of tables) {
  const n = await p[t].count();
  console.log(`${t}: ${n}`);
}
await p.$disconnect();
```

## Encoding gotcha (display only)

PowerShell console renders German umlauts as mojibake by default:

```powershell
Get-Content file.ts                    # shows: f├╝r, ├ñ
Get-Content file.ts -Encoding UTF8     # shows: für, ä
```

**The file is not broken.** Only the console display. Use `-Encoding UTF8`
when reading, or open in VS Code. Do NOT "fix" the file based on the
console output — verify in VS Code first.

Same for emojis: `🎯` shows as `ðŸŽ¯` in the console but is fine on disk.

## What NOT to do

- **No bash syntax.** `echo >>`, `&&`, `$(...)`, `$(cat ...)` do not work.
- **No `&&` chaining.** PowerShell 5.1 doesn't support it. Use `;` or two
  lines.
- **No `cd` chains.** `cd a; cmd; cd ..; cmd` = 3 commands, 2 chances
  to get lost. One directory, all commands.
- **No piping JSON through `Select-String`.** It mangles structure. Use
  `ConvertFrom-Json` + `Select-Object`.
- **No `--data` with JSON in PowerShell quoting.** Use `--data-binary @file`.
- **No one-liner mixing PowerShell + JS + SQL.** Write a temp file.
- **No leaving temp files behind.** `_debug.mjs`, `_body.json` — clean
  up in the same command.
- **No `[[id]]` or quote-only workarounds for bracket paths.** Use
  `-LiteralPath`, always.
- **No files outside `pen-paper-character-app/`.** Not even temp files.
- **No `Get-Process node | Stop-Process -Force` without checking first.**
  It kills every Node process on the machine, including other tools.

## If you're doing a lot of DB investigation

Write **one** `_debug.mjs`, extend it as you go, delete at the end. Do
not write a new one-liner per query — you'll spend more time fighting
escaping than answering questions.

```js
// _debug.mjs — extend as needed
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  // Add the query you need
}

main().catch(console.error).finally(() => p.$disconnect());
```
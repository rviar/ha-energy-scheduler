# HACS Energy Scheduler

## Frontend Card

- Source files are in `card-src/src/` (TypeScript + Lit)
- The compiled JS in `custom_components/hacs_energy_scheduler/www/energy-scheduler-card.js` is a build artifact — do NOT edit it directly
- To build: `cd card-src && npm run build`

## Release Process

When the user asks to "сделать релиз" / "release" / "bump version":

### Decide the bump

- **patch** (4.x.Y) — bug fixes only, no UX or API change
- **minor** (4.X.0) — new feature, behavior change, UI change, removed/renamed config option (we are pre-1.0, so breaking changes still go in minor)
- **major** — reserved for post-1.0

### Steps

1. **Bump version in three files** (must agree):
   - `custom_components/hacs_energy_scheduler/manifest.json` → `"version"`
   - `card-src/package.json` → `"version"`
   - `card-src/src/utils/version.ts` → `CARD_VERSION` constant — **most commonly forgotten**, it's what gets compiled into the bundled JS and shown in the browser console.

2. **Rebuild the card:** `cd card-src && npm run build`
   Verify: `grep "X\.Y\.Z" custom_components/hacs_energy_scheduler/www/energy-scheduler-card.js | head -1` should show the new string.

3. **Update `CHANGELOG.md`:**
   - Rename `[Unreleased]` to `[X.Y.Z] — YYYY-MM-DD` (use `currentDate` from context).
   - Add a fresh empty `[Unreleased]` section above.
   - Update compare links at bottom: `[Unreleased]` now compares from the new tag, add a `[X.Y.Z]` line comparing from previous.

4. **Commit everything in one shot:**

   ```bash
   git add CHANGELOG.md card-src/package.json card-src/src/utils/version.ts \
           custom_components/hacs_energy_scheduler/manifest.json \
           custom_components/hacs_energy_scheduler/www/energy-scheduler-card.js
   git commit -m "release: vX.Y.Z — short summary"
   ```

5. **Tag the commit:**

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z — short summary

   Optional longer description.
   Full notes: CHANGELOG.md"
   ```

6. **Do NOT push** unless the user explicitly asks. Tell them the commands to run:

   ```bash
   git push origin main
   git push origin vX.Y.Z
   ```

### Common mistakes to avoid

- **Forgetting `card-src/src/utils/version.ts`** — the most common miss. Bumping `package.json` alone doesn't change what users see in the browser, because the version constant is what gets bundled.
- **Forgetting to rebuild after the version change** — the bundled JS won't reflect the new constant otherwise.
- **Forgetting the compare link in CHANGELOG.md** — the `[Unreleased]` link must move to compare from the new tag, and a new `[X.Y.Z]` link must be added.
- **Tagging before the amend / rebuild** — if you have to amend the commit (e.g., you forgot the version.ts change), delete and recreate the tag with `git tag -d vX.Y.Z && git tag -a vX.Y.Z -m "..."`. Tags don't move automatically.
- **Pushing without the user's go-ahead** — release pushes are visible to all HACS users, never auto-push.

### When the user asks "сделать релиз" without specifying version

Look at `CHANGELOG.md` `[Unreleased]` section. If it has only **fixes** → patch. If it has **new behavior, UI, config, or removals** → minor. State your choice and reasoning before bumping.

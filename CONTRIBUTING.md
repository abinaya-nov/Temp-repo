# Contributing to JiraTron

## Scope and review gates

Work one approved milestone at a time. Inspect the repository and Git history, propose affected files, dependencies, tests and risks, and obtain approval before editing. Preserve working UI and avoid unrelated enhancements.

Use the existing isolated checkout; do not create a Git worktree unless explicitly requested. Preserve existing local changes. Fetch current `main` before creating an approved branch; do not reset local work to match a remote.

Branches: `feature/m03-ui-python-foundation` for this milestone; future branches use `feature/<milestone>-<description>`, `fix/<milestone>-<description>`, or `docs/<description>` as appropriate.

After implementation, present the diff, test outcomes and limitations before committing. Explicit user approval is required before committing or pushing. Use a pull request targeting `main`, describe behavior and verification, and obtain explicit merge approval. Do not push directly to `main`, automatically merge, or deploy as part of development work.

Use descriptive commits such as `Fix repeated JQL submission and preserve estimator navigation state`. PR descriptions must distinguish implemented features from future architecture. Include any test failures or unrun platform checks.

## Required checks

From the repository root:

```powershell
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
git diff --check
```

From `backend`, after creating its virtual environment and installing `.[dev]`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m pip check
```

Browser tests own servers on ports 5174 and 8001; leave those ports free. They start and stop their own Vite and FastAPI processes. The normal development backend can remain on port 8000. An existing local Chromium may be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; otherwise Playwright uses its installed Chromium. Tests stub external font requests; resource-loading failures are not treated as JavaScript exceptions. Deliberate backend-unavailable tests expect an HTTP failure and verify the demo remains usable.

Use Node.js 22.12+ (Node 24 is also supported) and Python 3.12. Python runtime/test top-level versions and the Playwright version are pinned; npm transitive versions are locked in `package-lock.json`. Python transitives follow package constraints and are not yet fully locked. Revisit dependency/security requirements before integrating into the shared repository.

## Boundaries and data handling

- React owns presentation. Data access belongs in providers/API adapters; Python owns future backend business logic through explicit contracts.
- Keep the browser baseline active until a Python replacement has tested equivalence and an approved switch. Do not claim health connectivity provides Python estimation.
- All authorized JiraTron users share future model-management access. Do not introduce administrator/user roles or represent hidden links as access enforcement.
- Use synthetic records in tests. Never commit organizational CSVs, secrets, credentials, worklogs or sensitive debug dumps. `local-data/` is ignored for future local artifacts but is not an implemented import feature or a security boundary.
- Update `ROADMAP.md`, `CHANGELOG.md`, README and relevant architecture docs when actual behavior changes. Mark pending review and future functionality accurately.

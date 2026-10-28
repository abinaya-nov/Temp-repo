# JiraTron

A Jira Issue Navigator-style effort estimator built with React and Vite. The existing green branding, sidebar, navigation and visual style are preserved. All 18 fictional tickets and recommendations run locally. No production Jira connection, write-back, AI service, or public deployment is configured.

JiraTron is intended for Jira administrators and support engineers handling configuration, workflows, custom fields, Automation for Jira, ScriptRunner, troubleshooting, upgrades, JSM/Assets and integrations. Ticket Effort Estimator is its first capability. Future import/training/model-management access is available to all authorized JiraTron users; no separate administrator/user roles are required. Authentication and management workflows are not implemented yet.

Milestone 03 is implemented on `feature/m03-ui-python-foundation` and approved for commit/push. It remains pending pull-request merge into `main`. Reviewers can fetch and check out the feature branch once published; after PR merge, the main-branch instructions below apply.

## Download and run on Windows

In your existing repository folder in PowerShell:

```powershell
git pull origin main
npm ci
npm test
npm run build
npm run dev
```

Open the local address Vite prints in your browser. Use Node.js 22.12+ or 24 and npm. For a new clone, run `git clone https://github.com/abinaya-nov/Temp-repo.git` and `cd Temp-repo` first. Alternatively use GitHub **Code → Download ZIP**, extract it, and run the npm commands in the extracted folder. `npm run preview` serves the production build locally after building. It is not a deployment command.

## Python backend: Windows setup and startup

Install Python 3.12 alongside Node.js. From the repository root, in PowerShell:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m uvicorn jiratron_api.main:app --reload --host 127.0.0.1 --port 8000
```

Leave that terminal running. In a second terminal at the repository root:

```powershell
npm ci
npm run dev
```

Use the browser address printed by Vite. In Help, **Backend connection** should report availability. Test health directly in another PowerShell terminal with `Invoke-RestMethod http://127.0.0.1:8000/api/health`. It returns status `ok`, service `jiratron-api` and version `0.1.0`. API documentation is available at the backend's `/docs` path. Stop each server with Ctrl+C.

Virtual-environment activation is unnecessary: these commands call its Python executable directly. On Linux/macOS, create it with `python3.12 -m venv .venv` and substitute `.venv/bin/python` for `.\.venv\Scripts\python.exe`.

Vite forwards same-origin `/api` requests to `http://127.0.0.1:8000`. Set `JIRATRON_BACKEND_URL` in the Vite process environment to change this development-only target. No browser CORS exception or credentials are needed. The backend is optional for demo searches and estimates: Help reports unavailability without blocking them. No Python recommendation endpoint exists yet. A production hosting arrangement must separately configure API routing and authentication; neither is supplied here.

## Use the navigator

- Overview displays matching-backlog summary cards and an action opening the Effort Estimator. The estimator contains JQL search, the navigator and review workflow. Both navigation directions preserve the current query, status, page, column choices, selections and review decisions. Summary cards reflect the last applied search and status filter, not a separate all-project query.
- Search with JQL and refine using the status dropdown. Every explicit search, including an unchanged query or Enter submission, executes and resets pagination, selections and review results. Try an Example both populates and executes the example JQL; the existing status dropdown still applies. Counts and overview statistics cover all matching issues, not just the current page. Missing existing points contribute zero to the total and per-ticket average.
- Choose 5, 10 or 20 issues per page. Individual selections persist across pages and page-size changes. Select-all applies only to the current page, with an indeterminate state for partial selection. Search submissions and changed status filters clear selections and review results.
- Use **Columns** to choose visible fields. At least one column remains visible. Click an issue key or summary for the detail drawer with description, criteria, comments, estimates and logged work. Escape closes the drawer or review dialog.
- Select tickets and click **Estimate Selected Tickets**. Full details are retrieved before estimation. Each result includes existing points, recommended points and hours, rationale, confidence, and information gaps.
- Approve or reject recommendations in the review panel. **Review results** reopens the current batch. Running estimation again creates a new batch. Decisions are in-memory only: they do not change existing issue values, persist after refresh, or update Jira.

## Supported demo JQL

The demo implements a strict subset, not the Jira JQL grammar:

- Equality (`=`) on `project`, `key` / `issuekey`, `status`, `priority`, `issuetype` / `type`, and `assignee`.
- Combine conditions with `AND`. Keywords, field names and values are case-insensitive. Quote values containing spaces with matching single or double quotes. Escaped quotes are not supported.
- Optional `ORDER BY created|key|summary|priority|status ASC|DESC`; default direction ASC. Without ordering, dataset order is retained. Priority sorts Low → Medium → High ascending; keys sort numerically.
- At least one equality condition is required. Unknown values return zero matches. Invalid syntax produces an explicit error instead of unrelated results.
- No `OR`, parentheses, `IN`, `!=`, text operators, functions, multiple sort fields or date comparisons. The status dropdown combines with JQL using AND.

```text
project = TRON ORDER BY created DESC
status = "To do" AND priority = High ORDER BY key ASC
assignee = "Alex Morgan" AND issuetype = Story
key = TRON-124
```

## Deterministic demo baseline

`src/estimation.js` analyzes summary, description, acceptance criteria and comments together. Existing numeric estimates and logged hours do not influence recommendations. These are transparent demo heuristics, not AI-generated predictions or calibrated team estimates.

Hours = issue-type base (Task 2h, Bug 4h, Story 6h, other 4h) + 2h per acceptance criterion + 4h per technical category + 4h once if any information gap exists.

Each technical category is counted once using case-insensitive whole words:

| Category | Signals |
| --- | --- |
| Integration | api, integration, webhook, external |
| Data changes | database, migration, migrate, storage |
| Security | security, authentication, permission, permissions, encryption |
| Performance / concurrency | performance, concurrent, streaming, background, latency |

Points use an independent complexity score: 1 + 2 per category + ceiling(criteria count / 2) + 2 once for information gaps. Score ≤2 → 1 point; ≤3 → 2; ≤5 → 3; ≤7 → 5; ≤10 → 8; otherwise 13. There is no fixed hours-to-points conversion. Task and Story tickets with identical content receive the same points but different hours.

Gaps: missing description, missing acceptance criteria, or text containing `unknown`, `unclear`, `TBD`, `waiting for`, or `depends on`. Any gap produces Low confidence; otherwise three or more technical categories produce Medium confidence; other tickets receive High confidence. Confidence is a rule label, not a statistical probability. Even High confidence requires validation. Keyword matching can miss nuances, negation and team-specific context. Missing estimates display as Not set; completed demo tickets have logged work.

## Future Jira Data Center adapter

`src/data/issues.js` holds fixtures; `src/data/issueProvider.js` owns searching, sorting, pagination and details. `Navigator` accepts a provider prop so the UI does not depend on fixtures or Jira custom field IDs.

The asynchronous read-only interface is:

```text
search({ jql, status, startAt, maxResults })
  → { issues, total, startAt, maxResults, summary: { points, ready } }
getIssue(key)
  → normalized full issue
```

Normalized issues have `key`, `project`, `summary`, `type`, `status`, `priority`, `assignee`, display `initials` / `color`, nullable `points`, `originalEstimateHours`, `loggedHours`, ISO `created`, `description`, `acceptanceCriteria` (string array), and `comments` (author/body array). Search summaries cover all filtered matches; a backend must aggregate those metrics or replace the overview. The demo filters in memory and returns the requested page. Details are fetched separately when opening a ticket or estimating selections.

Future flow: JQL → authenticated backend → Jira Data Center REST search → normalized paginated results → selected-key detail retrieval → estimation → human review. The backend should safely combine the status filter with JQL, retain Jira permissions, normalize time-tracking seconds to hours, map rich text, and retrieve relevant comments including their pagination. Credentials stay server-side. No REST endpoint is called today; no write method exists.

For the next phase, provide the Jira Data Center version, development instance connectivity/authentication approach, project and issue-type examples, story-point and acceptance-criteria field mappings (no IDs assumed), comment relevance rules, time-tracking conventions, and team estimation calibration examples. Supply credentials through secure settings, never chat or source code.

## Validation

From the root:

```powershell
npm test
npm run build
npx playwright install chromium
npm run test:e2e
git diff --check
```

From `backend` after installing `.[dev]`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m pip check
```

Browser tests start their own backend on 8001 and frontend on 5174; keep these ports free. They use synthetic data and stub external font requests. The tests cover repeated navigation/state retention, repeated JQL searches, example execution, Columns, pagination, filters, Escape/focus restoration, real proxied backend health, and backend-unavailable demo operation. An optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` selects an existing Chromium for environments where it is already installed.

`npm test` runs the existing nine selection/search/estimation checks plus two health-adapter checks using Node's built-in runner. FastAPI tests cover health, the exposed endpoint set, issue/estimate validation, target separation, serialization, and a synthetic service-contract implementation. They do not claim a Python estimator is implemented. Python tests and dependency installation were validated on Linux/Python 3.12; Windows commands are documented but have not been executed on a Windows machine in this environment.

## Development status and future architecture

See [ROADMAP.md](ROADMAP.md), [CHANGELOG.md](CHANGELOG.md), [CONTRIBUTING.md](CONTRIBUTING.md), and [historical estimation architecture](docs/historical-estimation.md).

The FastAPI package is a foundation only: health, typed contracts and an estimation-service interface. The working browser baseline has not been replaced. Historical CSV import, field mapping, dataset quality reports, separate training/evaluation partitions, historical baselines, versioned models, explicit activation/rollback, authorized model-management views, and read-only Jira synchronization are documented future work. No model is trained and no prediction accuracy is claimed.

The supplied Jira Software Data Center 9.12.15 / JSM Data Center 5.12.15 / AKS environment snapshot has not been connected to or compatibility-validated. No custom-field IDs are assumed.

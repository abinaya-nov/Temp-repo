# JiraTron

A Jira Issue Navigator-style effort estimator built with React and Vite. The existing green branding, sidebar, navigation and visual style are preserved. All 18 fictional tickets and recommendations run locally. No production Jira connection, write-back, AI service, or public deployment is configured.

## Download and run on Windows

In your existing repository folder in PowerShell:

```powershell
git pull origin main
npm ci
npm test
npm run build
npm run dev
```

Open the local address Vite prints in your browser. Requires Node.js 20.19+ or 22.12+ and npm. For a new clone, run `git clone https://github.com/abinaya-nov/Temp-repo.git` and `cd Temp-repo` first. Alternatively use GitHub **Code → Download ZIP**, extract it, and run the npm commands in the extracted folder. `npm run preview` serves the production build locally after building.

## Use the navigator

- Search with JQL and refine using the status dropdown. Counts and overview statistics cover all matching issues, not just the current page. Missing existing points contribute zero to the total and per-ticket average.
- Choose 5, 10 or 20 issues per page. Individual selections persist across pages and page-size changes. Select-all applies only to the current page, with an indeterminate state for partial selection. A changed query or status filter clears selections and review results.
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

`npm test` uses Node's built-in runner for selection, search syntax, filtering, pagination, detail retrieval, deterministic estimation, content sensitivity, uncertainty, and approval/rejection isolation. `npm run build` validates production bundling. No additional test dependencies are required.

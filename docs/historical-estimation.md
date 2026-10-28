# Historical estimation architecture

## Status and intended audience

This document is a design contract for future milestones. Milestone 03 implements the Python health endpoint, issue/estimate types and service interface only. CSV ingestion, historical calibration, model evaluation, synchronization, storage and authentication do not exist yet.

JiraTron is for Jira administrators and support engineers. Typical tickets concern configuration, workflows, custom fields, Automation for Jira, ScriptRunner, troubleshooting, upgrades, JSM/Assets and integrations. These domains will guide later data assessment; no domain-specific training rules have been added.

All authorized JiraTron users may access future historical-data and model-management functionality. There is no separate administrator/user role hierarchy. A future Estimation Model Management area may contain import, synchronization, dataset quality, calibration, evaluation and activation views. No nonfunctional management links are added in this milestone.

## Implemented boundary

React retains the mock `search`/`getIssue` provider and JavaScript demo estimation. `src/api/backend.js` checks the same-origin `/api/health` endpoint via the Vite development proxy. Help reports availability without enabling Python estimation. FastAPI exposes health and its generated API documentation, not upload, training or recommendation endpoints.

Python contracts in `backend/jiratron_api/models.py`:

| Contract | Purpose |
| --- | --- |
| `IssueInput` | Identity, project/team, type, summary, description, criteria, relevant comments and optional snapshot timestamp; input to the service |
| `ExistingEstimates` | Optional current story points and original estimate in hours, for display |
| `HistoricalTargets` | Optional actual logged hours and finalized points, kept outside predictive inputs |
| `JiraIssue` | Envelope combining content, status/resolution, dates, existing estimates and optional labels |
| `EstimateRecommendation` | Separate hours/points outputs and rationales, confidence, uncertainty, method and estimator version |

Unknown numeric values are null, not zero. Numeric estimates/targets must be finite and nonnegative. Models reject unknown fields. `EstimationService.estimate(IssueInput)` accepts no numeric outcome labels. This prevents accidental structured-label mixing; it cannot detect leakage embedded in text. Timestamp provenance and content review remain mandatory for historical use. Optional timestamps support incomplete synthetic inputs today; they do not certify records as safe for training.

Python names use snake_case; existing React fixture names use camelCase. A future backend provider must explicitly normalize these contracts. No frontend adapter to Python estimation is implemented. Before replacing the current baseline, test output parity on shared synthetic cases, including gaps, complexity signals and independent point/hour behavior, then obtain approval for the switch.

## Lifecycle: collection is not training

```text
CSV or read-only Jira collection
  → quarantined candidate dataset
  → mapping, normalization and validation report
  → authorized acceptance of an immutable dataset version
  → explicit training/calibration job
  → candidate estimator version
  → validation and held-out evaluation
  → explicit authorized activation confirmation
  → active estimator pointer (previous version retained for rollback)
```

New records never trigger calibration or activation automatically. Imported data must not silently alter the active estimator. A failed quality check or inadequate evaluation leaves the existing estimator active. The browser demo baseline remains the current method until a replacement is separately implemented and approved.

## Proposed import interface and data contracts (not implemented)

The future workflow lets an authorized JiraTron user upload an approved CSV, preview records, map fields, inspect validation findings, choose its purpose, and accept or reject a dataset version. Separate uploads or a reproducible split of one approved upload are both supported by the design. All upload and management operations require backend access checks.

Proposed logical contracts, independent of eventual route/storage choices:

| Object | Required design fields |
| --- | --- |
| Import manifest | import ID, source instance identity, original checksum, format/encoding, uploader, timestamp, mapping version, purpose |
| Column mapping | source header **and occurrence/index**, destination field, units, timezone, normalization rule |
| Validation finding | record identity, field, severity, rule ID, safe explanation; no sensitive content in application logs |
| Dataset version | immutable ID/checksum, source manifests, accepted record identities, rejection report, schema version, provenance |
| Partition manifest | dataset version, training/validation/evaluation/prediction identity lists, grouping rules, time boundaries or seed, label eligibility |
| Calibration job | job ID, training and validation manifests, method/configuration version, code version, initiating user, status |
| Evaluation run | evaluation ID, candidate and comparator estimator versions, immutable held-out manifest, separate target metrics, subgroup counts, timestamp |
| Activation event | candidate version, evaluation reference, confirmation, acting user, previous active version, timestamp, reason |

Validate identifiers against source-instance identity plus issue key; keys alone are not globally unique. Deduplicate repeated exports and detect linked/duplicate ticket families across uploads. Handle parent/subtask and aggregate effort carefully to avoid counting work twice.

### CSV normalization and quality

Core content: key, project/team, issue type, summary, description, status/resolution, created/resolved dates, and estimation-time provenance. Acceptance criteria and relevant pre-estimation comments are useful if safely available. Hours calibration requires reliable actual logged effort; points calibration requires a reliable team-scale final point label. A record can be eligible for one target but not the other.

Preserve repeated headers instead of overwriting them. Parse repeated comment/worklog columns into structured entries with IDs and timestamps where available. Worklog entry sums and exported total time are alternative representations to reconcile, never values to add together. If IDs are missing, report ambiguous deduplication instead of inventing certainty.

Declare encoding, delimiter, quoted multiline behavior, time units and locale/timezone. Jira seconds must be normalized to hours explicitly; do not infer that `1d` always means eight hours. Keep missing effort separate from recorded zero. Flag inconsistent statuses, dates, units, incomplete logs, duplicate entries, outliers, cancelled/duplicate resolutions, and unsupported field values. Do not assume custom-field IDs or English export labels.

No real CSV is required for milestone 03. Subsequent importer development must use synthetic fixtures covering duplicate headers, comments containing delimiters, missing values, invalid units and overlapping exports before any organizational-data trial.

## Separate predictions and leakage controls

Hours and points are independent targets; no universal conversion exists. Start with transparent medians by team/issue type, with documented fallback groups and sample counts, or reviewed similar-ticket comparisons. Team story-point scales must not be pooled blindly.

Only content available at original estimation time is eligible as a predictive input. Actual hours, worklogs, remaining-time updates, finalized story points and resolution comments are outcomes, not predictors. Final descriptions and acceptance criteria may also have been edited retrospectively. A current CSV without historical snapshots cannot prove estimation-time availability; flag or quarantine it and state evaluation limitations. Exclude text revealing actual outcomes even if it appears in an otherwise permitted comment field.

Training/calibration records establish patterns. Validation records tune candidates. Held-out evaluation records test generalization without influencing fitting, preprocessing choices, threshold selection or feature tuning. Prediction records are open tickets with unknown final outcomes and receive no accuracy metrics. Once outcomes become available, evaluate their previously recorded predictions under a new versioned outcome dataset; do not overwrite history.

Use chronological separation when suitable, with labels available by the training cutoff. Group duplicate/related records so a family cannot straddle training and evaluation. Detect and resolve groups that cross time boundaries rather than accepting leakage. Check overlap across separate uploads as well as within a split dataset. Record membership, seeds/time cutoffs, preprocessing and estimator versions so the split and results can be reproduced.

Measure hours MAE, median absolute error, systematic bias and errors by team/type/size; avoid relying on percentage errors for zero or tiny outcomes. Measure points separately using point error and exact/adjacent-scale agreement within each team's convention. Compare against the active estimator and simple medians on identical eligible held-out records; report counts, missing-label coverage and uncertainty. Never report open-ticket prediction accuracy or invent accuracy for an unevaluated method.

Rough experiment sizes: 50–100 clean comparable completed tickets can reveal quality issues and support a rough baseline; 200–500 may support a more useful baseline comparison; larger consistent datasets may justify more complex models. These are planning ranges, not accuracy guarantees. Prefer a transparent baseline until a candidate demonstrates an agreed improvement. Set minimum sample sizes, target-specific acceptance thresholds and subgroup safeguards before inspecting final holdout results. Repeated selection against the same holdout eventually requires a fresh evaluation period.

## Activation, auditability and access

Future authentication establishes authorized JiraTron access. Every backend endpoint serving datasets, collecting records, starting calibration, evaluating, activating or rolling back must enforce that access. All authorized users may perform these operations; there is no additional administrator role assumed. Frontend navigation is not authorization.

Activation requires explicit confirmation displaying the candidate version, evaluation evidence, limitations and previous active version. Record an audit event and change the active pointer atomically; retain prior versions and rollback evidence. Import acceptance, split changes, calibration, evaluation, activation and rollback all need user/time provenance. Model artifacts, datasets, configuration and results must be traceable and tamper-evident under the chosen storage design.

Before real data handling, define organizational approval, least-necessary data collection, TLS, encryption at rest, retention/deletion, backups and access logging. Redact credentials, tokens, personal and confidential information; do not commit datasets or expose raw records in logs. Prevent spreadsheet-formula execution in future exports. Do not send ticket text or embeddings to external services without explicit organizational authorization. Synthetic fixtures alone are committed today.

## Future Jira Data Center adapter

Supplied environment snapshot: Jira Software Data Center 9.12.15, Jira Service Management Data Center 5.12.15, hosted on Azure Kubernetes Service, with a large enterprise issue dataset. These are supplied details, not a verified connection or compatibility claim. Validate supported REST endpoints, permissions, pagination, authentication and relevant plugin/field behavior before implementation.

Keep integration server-side and initially read-only. Support configurable JQL, bounded pagination, custom-field mappings, permitted descriptions/comments/worklogs, comment/worklog pagination, rate limiting, retries, checkpoints and deduplication. Jira permissions must constrain collection; application access does not grant access to all Jira content. Manual CSV and scheduled/on-demand synchronization feed the same validation and dataset-versioning pipeline.

Collection may eventually run daily or weekly, with periodic quality checks, monthly accuracy reviews and monthly/quarterly consideration of recalibration. These are proposed operational defaults only. Collection does not schedule training; evaluation does not activate models. No scheduler or live Jira call is implemented in milestone 03.

## Shared-repository integration

Keep the backend an installable package with an application factory and small service contracts. Keep frontend transport behind the API adapter and configurable development proxy. Agree shared authentication, field mappings, environment settings, path prefixes, error formats, dependency policy and storage with the team before integration. Backend health is liveness only, not proof of Jira readiness, authentication, model availability or accuracy. A production reverse proxy must separately route `/api`; Vite's development proxy is not production infrastructure.

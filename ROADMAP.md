# JiraTron roadmap

JiraTron serves authorized Jira administrators and support engineers working on configuration, workflows, custom fields, Automation for Jira, ScriptRunner, troubleshooting, upgrades, JSM/Assets, and integrations. Ticket Effort Estimator is the first capability in a modular Jira administration and IT service management application. Domain-specific training logic is not implemented.

| Milestone | Scope | Status |
| --- | --- | --- |
| 01 | React shell, branding, navigation, sample search | Implemented in `c3d7e56` |
| 02 | Issue navigator, selection, details, deterministic recommendations and review | Implemented in `06b812a`; UI issues addressed in milestone 03 |
| 03 | Specified UI fixes, Python API foundation, contracts, regression tests, development and historical architecture documentation | Implementation reviewed and approved for commit/push; pending PR merge |
| 04 | Approved synthetic CSV import, field mapping, quality reports and dataset versioning | Planned; separate scope approval required |
| 05 | Reproducible historical baselines, separate hours/points evaluation, dataset partition controls | Planned; depends on validated data |
| 06 | Authorized model-management workflows, explicit activation, audit history and rollback | Planned; production authentication and data protection prerequisites |
| 07 | Read-only Jira Data Center adapter and controlled synchronization | Planned; compatibility and access validation required |
| Later | More advanced estimators and additional Jira administration/support capabilities | Conditional on demonstrated value and approved milestones |

Milestones 04 onward are a proposed sequence, not implemented features or a release commitment. Security requirements apply before real organizational data is accepted, regardless of milestone order. No automatic retraining, model activation, write-back, or public deployment is planned by milestone 03.

All authorized JiraTron users may eventually access import, training, evaluation and model management. No separate administrator/user role hierarchy is currently required. Authentication, application access checks, auditability and explicit activation confirmation remain necessary.

Each milestone follows plan approval → feature branch → implementation and checks → uncommitted diff review → explicit commit/push approval → pull request → explicit merge approval. Do not present planned functionality as completed.

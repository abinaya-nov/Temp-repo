# Changelog

## Unreleased — Milestone 03 (reviewed implementation, pending merge)

- Distinguish Overview summary content from the Effort Estimator while retaining search, page, selections and review state during navigation.
- Execute every submitted JQL search, including unchanged queries; reset pagination, selections and review results consistently.
- Populate and execute Try an Example immediately.
- Use a shared native dialog for Help, ticket details and estimation review, with Escape dismissal and focus restoration.
- Add an optional same-origin FastAPI health check in Help; keep browser demo estimation working without the backend.
- Add a Python FastAPI package with health endpoint, validated issue/estimate contracts, separate historical labels and an estimation-service interface. Python estimation is not implemented or activated.
- Add browser regressions, Python foundation tests, and frontend health-adapter tests.
- Document Windows development, milestone review conventions, and the future historical-data/model lifecycle for Jira administrators and support engineers.

No CSV importer, model training, production authentication, live Jira connectivity, synchronization, or write-back is implemented.

## Milestone 02 — `06b812a`

- Add an 18-ticket fictional dataset, supported mock JQL filtering, configurable columns, pagination and cross-page selection.
- Add ticket details, deterministic hours and point recommendations, confidence labels, and in-memory approval/rejection.
- Separate data access and estimation helpers and add automated tests.

## Milestone 01 — `c3d7e56`

- Create the React/Vite application, JiraTron visual design, navigation and initial demo estimator interface.

# JiraTron

A React application for exploring Jira ticket effort estimates using mock data.

## Development

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Run `npm run build` to create a production build and `npm run preview` to serve it.

The Ticket Effort Estimator accepts the displayed example query, individual issue queries such as `key = TRON-124`, and status queries such as `status = "To do"`. Unsupported queries display an explanation. Estimates are sample story points, not calculated predictions. No Jira credentials or backend are required.

The asynchronous `searchIssues` function in `src/main.jsx` is the replacement point for a future backend Jira integration. The issue schema and estimation rules are provisional, pending product requirements. Keep future Jira credentials on the server.

import { mockIssues } from './issues.js';

export const supportedJql = 'Equality (=) on project, key/issuekey, status, priority, issuetype/type, assignee; combine with AND. Optional ORDER BY created, key, summary, priority, or status ASC/DESC. Quote values containing spaces. No OR, parentheses, IN, functions, or text search.';
const fields = { project: 'project', key: 'key', issuekey: 'key', status: 'status', priority: 'priority', issuetype: 'type', type: 'type', assignee: 'assignee' };

export function filterJql(issues, jql) {
  if (!jql.trim()) throw new Error('Enter a JQL query.');
  let remaining = jql.trim();
  const predicates = [];
  while (remaining && !/^ORDER\s+BY\b/i.test(remaining)) {
    const match = remaining.match(/^(project|key|issuekey|status|priority|issuetype|type|assignee)\s*=\s*(?:"([^"\n]+)"|'([^'\n]+)'|([\w-]+))\s*/i);
    if (!match) throw new Error(`Unsupported demo JQL. ${supportedJql}`);
    predicates.push([fields[match[1].toLowerCase()], (match[2] ?? match[3] ?? match[4]).toLowerCase()]);
    remaining = remaining.slice(match[0].length);
    if (/^AND\s+/i.test(remaining)) {
      remaining = remaining.replace(/^AND\s+/i, '');
      if (!remaining || /^ORDER\s+BY\b/i.test(remaining)) throw new Error('Expected a condition after AND.');
    } else if (remaining && !/^ORDER\s+BY\b/i.test(remaining)) throw new Error(`Unsupported demo JQL. ${supportedJql}`);
  }
  if (!predicates.length) throw new Error('Add at least one equality condition before ORDER BY.');
  const order = remaining ? remaining.match(/^ORDER\s+BY\s+(created|key|summary|priority|status)(?:\s+(ASC|DESC))?\s*$/i) : null;
  if (remaining && !order) throw new Error('Unsupported ORDER BY. Use created, key, summary, priority, or status ASC/DESC.');
  const result = issues.filter(issue => predicates.every(([field, value]) => String(issue[field]).toLowerCase() === value));
  if (order) {
    const field = order[1].toLowerCase();
    const direction = order[2]?.toUpperCase() === 'DESC' ? -1 : 1;
    const priorityRank = { Low: 1, Medium: 2, High: 3 };
    result.sort((first, second) => direction * (field === 'priority' ? priorityRank[first.priority] - priorityRank[second.priority] : String(first[field]).localeCompare(String(second[field]), undefined, { numeric: true })));
  }
  return result;
}

/**
 * Read-only provider contract. A future implementation calls a server-side Jira adapter.
 * search({jql, status, startAt, maxResults}) -> {issues, total, startAt, maxResults, summary}
 * getIssue(key) -> full normalized issue including description, criteria and comments.
 * summary covers all matches: {points, ready}. Hours are normalized from Jira seconds by the backend.
 * Nullable estimates mean unknown. No custom field identifiers or credentials belong in the UI.
 */
export const demoIssueProvider = {
  async search({ jql, status = 'All statuses', startAt = 0, maxResults = 5 }) {
    if (!Number.isInteger(startAt) || startAt < 0 || !Number.isInteger(maxResults) || maxResults < 1) throw new Error('Invalid pagination.');
    const matches = filterJql(mockIssues, jql).filter(issue => status === 'All statuses' || issue.status === status);
    return { issues: matches.slice(startAt, startAt + maxResults), total: matches.length, startAt, maxResults, summary: { points: matches.reduce((total, issue) => total + (issue.points ?? 0), 0), ready: matches.filter(issue => issue.status === 'To do').length } };
  },
  async getIssue(key) {
    const issue = mockIssues.find(issue => issue.key === key);
    if (!issue) throw new Error(`Issue ${key} was not found.`);
    return structuredClone(issue);
  },
};

import test from 'node:test';
import assert from 'node:assert/strict';
import { mockIssues } from '../src/data/issues.js';
import { demoIssueProvider, filterJql } from '../src/data/issueProvider.js';
import { estimateIssue, reviewEstimate, toggleIssue, togglePage } from '../src/estimation.js';

test('individual selection toggles immutably', () => {
  const original = new Set(['TRON-124']);
  const added = toggleIssue(original, 'TRON-125');
  assert.deepEqual([...original], ['TRON-124']);
  assert.deepEqual([...added], ['TRON-124', 'TRON-125']);
  assert.deepEqual([...toggleIssue(added, 'TRON-124')], ['TRON-125']);
});
test('page selection fills partial pages and preserves other pages on deselection', () => {
  const selected = new Set(['TRON-124', 'TRON-140']);
  const page = ['TRON-124', 'TRON-125'];
  const all = togglePage(selected, page);
  assert.deepEqual([...all], ['TRON-124', 'TRON-140', 'TRON-125']);
  assert.deepEqual([...togglePage(all, page)], ['TRON-140']);
  assert.deepEqual([...togglePage(selected, [])], [...selected]);
});
test('demo search supports equality, AND, aliases, quoted values and case-insensitive values', () => {
  const matches = filterJql(mockIssues, 'PROJECT = tron AND status = "To do" AND priority = High ORDER BY key ASC');
  assert.ok(matches.length > 0);
  assert.ok(matches.every(issue => issue.project === 'TRON' && issue.status === 'To do' && issue.priority === 'High'));
  assert.equal(filterJql(mockIssues, "issuekey = 'tron-124'")[0].key, 'TRON-124');
  assert.ok(filterJql(mockIssues, 'assignee = "Alex Morgan" AND issuetype = Story').every(issue => issue.assignee === 'Alex Morgan' && issue.type === 'Story'));
  assert.equal(filterJql(mockIssues, 'project = OTHER').length, 0);
});
test('unsupported or malformed JQL fails instead of silently ignoring conditions', () => {
  for (const query of ['', 'project = TRON OR status = Done', 'project IN (TRON)', 'project = TRON AND', 'project = TRON AND ORDER BY key', 'project = TRON garbage', 'project = TRON ORDER BY assignee', 'ORDER BY key', 'project = TRON status = Done']) assert.throws(() => filterJql(mockIssues, query), undefined, query);
});
test('pagination returns matching total and stable non-overlapping pages; status is applied first', async () => {
  const first = await demoIssueProvider.search({jql: 'project = TRON ORDER BY created DESC', maxResults: 5});
  const second = await demoIssueProvider.search({jql: 'project = TRON ORDER BY created DESC', startAt: 5, maxResults: 5});
  assert.equal(first.total, 18);
  assert.equal(first.issues.length, 5);
  assert.ok(second.issues.every(issue => !first.issues.some(previous => previous.key === issue.key)));
  assert.equal(first.issues[0].key, 'TRON-141');
  const done = await demoIssueProvider.search({jql: 'project = TRON', status: 'Done'});
  assert.equal(done.total, mockIssues.filter(issue => issue.status === 'Done').length);
  assert.ok(done.issues.every(issue => issue.status === 'Done'));
  await assert.rejects(demoIssueProvider.search({jql: 'project = TRON', startAt: -1}));
});
test('details contain narrative, criteria, comments and completed work logs without leaking mutations', async () => {
  assert.ok(mockIssues.length >= 15);
  const issue = await demoIssueProvider.getIssue('TRON-128');
  assert.ok(issue.description && issue.acceptanceCriteria.length && issue.comments.length);
  assert.ok(issue.loggedHours > 0);
  issue.comments[0].body = 'changed';
  assert.notEqual((await demoIssueProvider.getIssue(issue.key)).comments[0].body, 'changed');
  await assert.rejects(demoIssueProvider.getIssue('TRON-999'));
});
test('estimator is deterministic, varies by complexity and ignores existing numeric estimates', () => {
  const simple = mockIssues.find(issue => issue.key === 'TRON-130');
  const complex = mockIssues.find(issue => issue.key === 'TRON-136');
  assert.deepEqual(estimateIssue(complex), estimateIssue(complex));
  assert.ok(estimateIssue(complex).recommendedHours > estimateIssue(simple).recommendedHours);
  assert.ok(estimateIssue(complex).recommendedPoints > estimateIssue(simple).recommendedPoints);
  assert.equal(estimateIssue({...complex, points: 100, originalEstimateHours: 500, loggedHours: 999}).recommendedHours, estimateIssue(complex).recommendedHours);
  const ratios = new Set(mockIssues.map(issue => { const result = estimateIssue(issue); return result.recommendedHours / result.recommendedPoints; }));
  assert.ok(ratios.size > 2);
});
test('all narrative fields influence technical signals and missing requirements lower confidence', () => {
  const base = {key:'TEST-1', type:'Task', summary:'Update label', description:'Change label', acceptanceCriteria:['Label matches'], comments:[], points:1};
  for (const field of ['summary','description','acceptanceCriteria','comments']) {
    const changed = {...base, [field]: field === 'comments' ? [{body:'Security review required'}] : field === 'acceptanceCriteria' ? ['Security review required'] : 'Security review required'};
    assert.ok(estimateIssue(changed).recommendedHours > estimateIssue(base).recommendedHours);
  }
  const incomplete = estimateIssue({...base, description:'', acceptanceCriteria:[], comments:[{body:'Requirements TBD'}]});
  assert.equal(incomplete.confidence, 'Low');
  assert.match(incomplete.uncertainty, /Description is missing/);
  assert.match(incomplete.uncertainty, /Acceptance criteria are missing/);
  assert.match(incomplete.uncertainty, /Unresolved/);
});
test('approval and rejection modify only review state', () => {
  const snapshot = structuredClone(mockIssues[0]);
  const results = [estimateIssue(mockIssues[0]), estimateIssue(mockIssues[1])];
  const approved = reviewEstimate(results, results[0].key, 'Approved');
  assert.equal(approved[0].decision, 'Approved');
  assert.equal(approved[1].decision, 'Pending');
  assert.equal(results[0].decision, 'Pending');
  assert.equal(reviewEstimate(approved, results[0].key, 'Rejected')[0].decision, 'Rejected');
  assert.deepEqual(mockIssues[0], snapshot);
  assert.throws(() => reviewEstimate(results, results[0].key, 'Write to Jira'));
});

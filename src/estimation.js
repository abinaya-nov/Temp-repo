export function estimateIssue(issue) {
  const criteria = issue.acceptanceCriteria ?? [];
  const content = [issue.summary, issue.description, ...criteria, ...(issue.comments ?? []).map(comment => comment.body)].join(' ').toLowerCase();
  const signals = [ ['integration', /\b(api|integration|webhook|external)\b/], ['data changes', /\b(database|migration|migrate|storage)\b/], ['security', /\b(security|authentication|permission|permissions|encryption)\b/], ['performance / concurrency', /\b(performance|concurrent|streaming|background|latency)\b/] ].filter(([, pattern]) => pattern.test(content)).map(([name]) => name);
  const missing = [];
  if (!issue.description?.trim()) missing.push('Description is missing');
  if (!criteria.length) missing.push('Acceptance criteria are missing');
  if (/\b(unknown|unclear|tbd|waiting for|depends on)\b/.test(content)) missing.push('Unresolved dependencies or requirements');
  const baseHours = { Bug: 4, Task: 2, Story: 6 }[issue.type] ?? 4;
  const hours = baseHours + criteria.length * 2 + signals.length * 4 + (missing.length ? 4 : 0);
  const complexity = 1 + signals.length * 2 + Math.ceil(criteria.length / 2) + (missing.length ? 2 : 0);
  const storyPoints = complexity <= 2 ? 1 : complexity <= 3 ? 2 : complexity <= 5 ? 3 : complexity <= 7 ? 5 : complexity <= 10 ? 8 : 13;
  return { key: issue.key, existingPoints: issue.points, recommendedHours: hours, recommendedPoints: storyPoints, confidence: missing.length ? 'Low' : signals.length >= 3 ? 'Medium' : 'High', uncertainty: missing.length ? missing.join('; ') : 'No explicit gaps detected; validate scope and team assumptions.', rationale: `Hours: ${baseHours}h ${issue.type.toLowerCase()} base + ${criteria.length * 2}h for ${criteria.length} acceptance criteria + ${signals.length * 4}h for ${signals.join(', ') || 'no additional technical signals'}${missing.length ? ' + 4h discovery allowance' : ''}. Points: independent complexity score ${complexity} maps to ${storyPoints} points; includes technical breadth, scope, and uncertainty.`, decision: 'Pending' };
}

export function toggleIssue(selected, key) {
  const next = new Set(selected);
  if (next.has(key)) next.delete(key); else next.add(key);
  return next;
}

export function togglePage(selected, keys) {
  const next = new Set(selected);
  const allSelected = keys.length > 0 && keys.every(key => next.has(key));
  keys.forEach(key => { if (allSelected) next.delete(key); else next.add(key); });
  return next;
}

export function reviewEstimate(results, key, decision) {
  if (!['Approved', 'Rejected'].includes(decision)) throw new Error('Invalid review decision');
  return results.map(result => result.key === key ? { ...result, decision } : result);
}

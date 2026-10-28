import React, { useEffect, useRef, useState } from 'react';
import Dialog from './components/Dialog.jsx';
import { demoIssueProvider } from './data/issueProvider.js';
import { estimateIssue, reviewEstimate, toggleIssue, togglePage } from './estimation.js';

const columns = { key: 'Issue key', summary: 'Summary', type: 'Issue type', status: 'Status', priority: 'Priority', assignee: 'Assignee', points: 'Existing story points', originalEstimateHours: 'Existing estimated hours' };
const format = value => value ?? 'Not set';

export default function Navigator({ jql, searchId = 0, provider = demoIssueProvider, onSummary }) {
  const [status, setStatus] = useState('All statuses');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [data, setData] = useState({ issues: [], total: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [visible, setVisible] = useState(Object.keys(columns));
  const [detail, setDetail] = useState(null);
  const [results, setResults] = useState([]);
  const [review, setReview] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const selectAll = useRef(null);
  const request = useRef(0);
  const detailRequest = useRef(0);
  const estimateRequest = useRef(0);
  const all = data.issues.length > 0 && data.issues.every(issue => selected.has(issue.key));
  const some = data.issues.some(issue => selected.has(issue.key));
  useEffect(() => { if (selectAll.current) selectAll.current.indeterminate = some && !all; }, [some, all]);
  useEffect(() => { estimateRequest.current++; setEstimating(false); setPage(0); setSelected(new Set()); setResults([]); setReview(false); }, [jql, status, searchId]);
  useEffect(() => {
    const id = ++request.current;
    setBusy(true);
    setError('');
    provider.search({ jql, status, startAt: page * size, maxResults: size }).then(response => {
      if (request.current !== id) return;
      setData(response);
      onSummary({ total: response.total, ...response.summary });
    }).catch(failure => { if (request.current === id) { setError(failure.message); setData({ issues: [], total: 0 }); onSummary({ total: 0, points: 0, ready: 0 }); } }).finally(() => { if (request.current === id) setBusy(false); });
    return () => { request.current++; };
  }, [jql, status, searchId, page, size, provider, onSummary]);
  async function openDetail(key) {
    const id = ++detailRequest.current;
    setDetail({ loading: true });
    try { const issue = await provider.getIssue(key); if (detailRequest.current === id) setDetail(issue); }
    catch (failure) { if (detailRequest.current === id) setDetail({ error: failure.message }); }
  }
  function closeDetail() { detailRequest.current++; setDetail(null); }
  async function estimate() {
    const id = ++estimateRequest.current;
    setEstimating(true);
    setError('');
    try {
      const tickets = await Promise.all([...selected].map(key => provider.getIssue(key)));
      if (estimateRequest.current !== id) return;
      setResults(tickets.map(estimateIssue));
      setReview(true);
    } catch (failure) { if (estimateRequest.current === id) setError(`Could not estimate tickets: ${failure.message}`); }
    finally { if (estimateRequest.current === id) setEstimating(false); }
  }
  function cell(issue, field) {
    if (field === 'key') return <button className="issue-link" onClick={() => openDetail(issue.key)}>{issue.key}</button>;
    if (field === 'summary') return <button className="summary-link" onClick={() => openDetail(issue.key)}>{issue.summary}</button>;
    if (field === 'status') return <span className={`status ${issue.status.toLowerCase().replace(' ', '-')}`}><i />{issue.status}</span>;
    if (field === 'assignee') return <span className="assignee"><span className={`avatar ${issue.color}`}>{issue.initials}</span>{issue.assignee}</span>;
    if (field === 'points') return <span className="point-pill">{format(issue.points)}</span>;
    if (field === 'originalEstimateHours') return issue[field] == null ? 'Not set' : `${issue[field]} h`;
    return issue[field];
  }
  return <>
    <section className="tickets-card" aria-label="Issue navigator"><div className="table-heading"><div><h2>Ticket breakdown <span>{data.total}</span></h2><p>{data.total} matching issues · {selected.size} selected across pages</p></div><div className="navigator-tools"><div className="select-wrap"><select aria-label="Filter tickets by status" value={status} disabled={estimating} onChange={event => { setStatus(event.target.value); setPage(0); }}>{['All statuses', 'To do', 'In progress', 'Done'].map(value => <option key={value}>{value}</option>)}</select></div><details className="column-picker"><summary>Columns</summary><fieldset><legend>Visible columns</legend>{Object.entries(columns).map(([field, label]) => <label key={field}><input type="checkbox" checked={visible.includes(field)} disabled={visible.length === 1 && visible.includes(field)} onChange={() => setVisible(current => current.includes(field) ? current.filter(value => value !== field) : Object.keys(columns).filter(value => current.includes(value) || value === field))} />{label}</label>)}</fieldset></details></div></div>
      <div className="selection-toolbar"><span>Demo baseline estimates · No Jira updates</span><div><button className="text-button" disabled={!selected.size || estimating} onClick={() => setSelected(new Set())}>Clear selection</button><button className="primary-button" onClick={estimate} disabled={!selected.size || busy || estimating}>{estimating ? 'Estimating…' : 'Estimate Selected Tickets'}</button>{results.length > 0 && <button className="text-button" onClick={() => setReview(true)}>Review results ({results.length})</button>}</div></div>
      {error && <p className="error navigator-message" role="alert">{error}</p>}
      <div className="table-scroll" aria-busy={busy}><table><thead><tr><th><input ref={selectAll} type="checkbox" aria-label="Select all issues on current page" checked={all} disabled={busy || estimating || !data.issues.length} onChange={() => setSelected(current => togglePage(current, data.issues.map(issue => issue.key)))} /></th>{visible.map(field => <th key={field}>{columns[field]}</th>)}</tr></thead><tbody>{!busy && data.issues.map(issue => <tr key={issue.key} className={selected.has(issue.key) ? 'selected-row' : ''}><td><input type="checkbox" aria-label={`Select ${issue.key}`} checked={selected.has(issue.key)} disabled={estimating} onChange={() => setSelected(current => toggleIssue(current, issue.key))} /></td>{visible.map(field => <td key={field}>{cell(issue, field)}</td>)}</tr>)}</tbody></table>{busy ? <p className="navigator-message" role="status">Loading tickets…</p> : !data.issues.length && <div className="empty"><h3>{error ? 'Search could not be completed' : 'No tickets found'}</h3><p>Adjust the JQL query or status filter.</p></div>}</div>
      <div className="table-footer pagination"><span>{data.total ? page * size + 1 : 0}–{Math.min((page + 1) * size, data.total)} of {data.total} matching issues</span><div><label>Per page <select aria-label="Issues per page" value={size} onChange={event => { setSize(Number(event.target.value)); setPage(0); }}>{[5,10,20].map(value => <option key={value}>{value}</option>)}</select></label><button disabled={page === 0 || busy} onClick={() => setPage(current => current - 1)}>Previous</button><span>Page {page + 1} of {Math.max(1, Math.ceil(data.total / size))}</span><button disabled={(page + 1) * size >= data.total || busy} onClick={() => setPage(current => current + 1)}>Next</button></div></div>
    </section>
    {detail && <Dialog title="Ticket details" close={closeDetail} drawer>{detail.loading ? <p role="status">Loading ticket details…</p> : detail.error ? <p role="alert">{detail.error}</p> : <><div className="eyebrow">{detail.key} · {detail.type}</div><h2>{detail.summary}</h2><p><span className={`status ${detail.status.toLowerCase().replace(' ', '-')}`}>{detail.status}</span> · {detail.priority} priority · {detail.assignee}</p><dl className="detail-metrics"><div><dt>Existing story points</dt><dd>{format(detail.points)}</dd></div><div><dt>Original estimate</dt><dd>{detail.originalEstimateHours == null ? 'Not set' : `${detail.originalEstimateHours} hours`}</dd></div><div><dt>Logged work</dt><dd>{detail.loggedHours == null ? 'Not available' : `${detail.loggedHours} hours`}</dd></div></dl><h3>Description</h3><p>{detail.description || 'No description provided.'}</p><h3>Acceptance criteria</h3>{detail.acceptanceCriteria.length ? <ul>{detail.acceptanceCriteria.map(criterion => <li key={criterion}>{criterion}</li>)}</ul> : <p>No acceptance criteria provided.</p>}<h3>Relevant comments</h3>{detail.comments.map((comment, index) => <article className="comment" key={index}><strong>{comment.author}</strong><p>{comment.body}</p></article>)}{!detail.comments.length && <p>No comments available.</p>}</>}</Dialog>}
    {review && <Dialog title="Estimation review" close={() => setReview(false)}><div className="eyebrow">DEMO BASELINE ESTIMATES</div><h2>Review effort recommendations</h2><p>Deterministic heuristics, not AI predictions. Approvals are kept in memory only; Jira and existing estimates remain unchanged. Refreshing clears decisions.</p><div className="review-results">{results.map(result => <article className="review-card" key={result.key}><div className="review-heading"><h3>{result.key}</h3><span className={`status ${result.decision === 'Approved' ? 'done' : 'to-do'}`}>{result.decision}</span></div><dl className="detail-metrics"><div><dt>Existing points</dt><dd>{format(result.existingPoints)}</dd></div><div><dt>Recommended points</dt><dd>{result.recommendedPoints}</dd></div><div><dt>Recommended hours</dt><dd>{result.recommendedHours} h</dd></div></dl><p>{result.rationale}</p><p><strong>{result.confidence} confidence:</strong> {result.uncertainty}</p><div className="review-actions"><button className="primary-button" disabled={result.decision === 'Approved'} onClick={() => setResults(current => reviewEstimate(current, result.key, 'Approved'))}>Approve {result.key}</button><button disabled={result.decision === 'Rejected'} onClick={() => setResults(current => reviewEstimate(current, result.key, 'Rejected'))}>Reject {result.key}</button></div></article>)}</div></Dialog>}
  </>;
}

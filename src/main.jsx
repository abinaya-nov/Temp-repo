import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, CircleHelp, Clock3, Command, FileText, Layers3, LayoutDashboard, Search, Settings2, Sparkles, Ticket, X } from 'lucide-react';
import './styles.css';

const mockIssues = [
  { key: 'TRON-124', summary: 'Implement user authentication flow', type: 'Story', status: 'In progress', priority: 'High', points: 8, assignee: 'Alex Morgan', initials: 'AM', color: 'lavender' },
  { key: 'TRON-125', summary: 'Design dashboard analytics widgets', type: 'Story', status: 'To do', priority: 'Medium', points: 5, assignee: 'Sarah Chen', initials: 'SC', color: 'peach' },
  { key: 'TRON-126', summary: 'Fix pagination on issue list', type: 'Bug', status: 'To do', priority: 'High', points: 3, assignee: 'James Wilson', initials: 'JW', color: 'blue' },
  { key: 'TRON-127', summary: 'Add export to CSV functionality', type: 'Task', status: 'In progress', priority: 'Medium', points: 5, assignee: 'Alex Morgan', initials: 'AM', color: 'lavender' },
  { key: 'TRON-128', summary: 'Update API documentation', type: 'Task', status: 'Done', priority: 'Low', points: 2, assignee: 'Priya Patel', initials: 'PP', color: 'pink' },
  { key: 'TRON-129', summary: 'Optimize database query performance', type: 'Story', status: 'To do', priority: 'High', points: 8, assignee: 'Sarah Chen', initials: 'SC', color: 'peach' },
];

async function searchIssues(jql) {
  await new Promise(resolve => setTimeout(resolve, 450));
  if (!jql.trim()) throw new Error('Enter a JQL query to search for tickets.');
  const normalized = jql.trim().replace(/\s+/g, ' ');
  if (normalized.toLowerCase() === 'project = tron order by created desc') return mockIssues;
  const keyMatch = normalized.match(/^(?:key|issuekey)\s*=\s*["']?(TRON-\d+)["']?$/i);
  if (keyMatch) return mockIssues.filter(issue => issue.key === keyMatch[1].toUpperCase());
  const statusMatch = normalized.match(/^status\s*=\s*["'](To do|In progress|Done)["']$/i);
  if (statusMatch) return mockIssues.filter(issue => issue.status.toLowerCase() === statusMatch[1].toLowerCase());
  throw new Error('This demo supports the example query, key = TRON-124, or status = "To do". Full JQL support will come with the Jira connection.');
}

function App() {
  const [page, setPage] = useState('Ticket Effort Estimator');
  const [query, setQuery] = useState('project = TRON ORDER BY created DESC');
  const [issues, setIssues] = useState(mockIssues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [help, setHelp] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All statuses');
  const visibleIssues = issues.filter(issue => filter === 'All statuses' || issue.status === filter);
  const points = issues.reduce((total, issue) => total + issue.points, 0);
  async function search(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try { setIssues(await searchIssues(query)); setSearched(true); setFilter('All statuses'); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }
  return <div className="app">
    <aside className="sidebar">
      <a className="brand" href="#estimator" onClick={() => setPage('Ticket Effort Estimator')}><div className="brand-icon"><Layers3 size={23} /></div>JiraTron<span className="brand-dot">.</span></a>
      <div className="workspace"><div className="workspace-icon">T</div><div><strong>Tron workspace</strong><small>Personal workspace</small></div><ChevronDown size={15} /></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        <button className={page === 'Overview' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('Overview')}><LayoutDashboard size={18} />Overview</button>
        <button className={page === 'Ticket Effort Estimator' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('Ticket Effort Estimator')}><Ticket size={18} />Effort estimator<span className="active-dot" /></button>
      </nav>
      <div className="sidebar-bottom"><div className="connection-card"><div className="connection-icon"><Sparkles size={18} /></div><strong>Your next sprint, clearer.</strong><p>Turn your backlog into a plan you can feel confident about.</p><span>Made for better planning <ArrowUpRight size={13} /></span></div>
      <button className="nav-item" onClick={() => setHelp(true)}><CircleHelp size={18} />Help & getting started<ArrowUpRight size={14} /></button>
      <div className="profile"><div className="avatar profile-avatar">JD</div><div><strong>Jamie Davis</strong><small>Demo workspace</small></div><span className="demo-small">DEMO</span></div></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div><div className="topbar-right"><span className="mock-indicator"><i />Mock data mode</span><button className="icon-button" aria-label="Open help" onClick={() => setHelp(true)}><CircleHelp size={18} /></button><div className="avatar top-avatar">JD</div></div></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow">PLAN WITH CLARITY</div><h1>{page}</h1><p>{page === 'Overview' ? 'A little perspective on your team’s next big things.' : 'Less guesswork. Better estimates. A clearer picture of your sprint.'}</p></div><span className="page-tag"><Sparkles size={14} />Built for your backlog</span></div>
        <div className="demo-banner"><div className="banner-symbol"><Layers3 size={19} /></div><div><strong>A little preview of what’s possible</strong><p>You’re exploring with sample tickets. Jira integration is coming soon.</p></div><span className="sample-badge">SAMPLE WORKSPACE</span></div>
        {page === 'Ticket Effort Estimator' && <section className="query-card" aria-labelledby="query-heading"><div className="section-title"><div><h2 id="query-heading"><Search size={18} />Find your tickets</h2><p>Start with a JQL query to bring your backlog into focus.</p></div><button className="text-button" onClick={() => setHelp(true)}>JQL quick guide <ArrowUpRight size={14} /></button></div><form onSubmit={search}><label htmlFor="jql">JQL query</label><div className="query-row"><div className="query-input"><Command size={17} /><input id="jql" value={query} onChange={event => setQuery(event.target.value)} spellCheck="false" placeholder="Enter a JQL query…" /></div><button className="primary-button" disabled={loading}><Search size={16} />{loading ? 'Searching…' : 'Search tickets'}<span>↵</span></button></div><div className="query-hint"><span><CircleHelp size={13} />Use JQL to filter by project, status, assignee, and more in Jira.</span><button type="button" onClick={() => { setQuery('project = TRON ORDER BY created DESC'); setError(''); }}>Try an example <ArrowRight size={13} /></button></div>{error && <p className="error" role="alert">{error}</p>}</form></section>}
        <div className="results-heading"><h2>{page === 'Overview' ? 'Backlog at a glance' : 'Your estimation overview'}</h2><span><i />{searched ? 'Search results' : 'Sample results'}<span className="dot-separator">·</span>{issues.length} tickets</span></div>
        <section className="stats" aria-label="Estimation summary"><Stat icon={<Ticket size={19} />} label="Total tickets" value={issues.length} note="In your current selection" /><Stat icon={<Layers3 size={19} />} label="Estimated effort" value={points} unit="pts" note="Total story points" green /><Stat icon={<BarChart3 size={19} />} label="Average effort" value={issues.length ? (points / issues.length).toFixed(1) : '0'} unit="pts / ticket" note="Across your selected tickets" /><Stat icon={<Clock3 size={19} />} label="Ready to plan" value={issues.filter(issue => issue.status === 'To do').length} note="Tickets waiting to get started" /></section>
        <section className="tickets-card"><div className="table-heading"><div><h2>Ticket breakdown <span>{issues.length}</span></h2><p>A closer look at the work ahead.</p></div><div className="select-wrap"><Settings2 size={14} /><select aria-label="Filter tickets by status" value={filter} onChange={event => setFilter(event.target.value)}>{['All statuses', 'To do', 'In progress', 'Done'].map(status => <option key={status}>{status}</option>)}</select></div></div><div className="table-scroll"><table><thead><tr><th>ISSUE <ArrowDown size={11} /></th><th>SUMMARY</th><th>STATUS</th><th>PRIORITY</th><th>ASSIGNEE</th><th className="points-cell">EFFORT</th></tr></thead><tbody>{visibleIssues.map(issue => <tr key={issue.key}><td><button className="issue-link" onClick={() => setSelected(issue)}><span className={`type-icon ${issue.type.toLowerCase()}`}>{issue.type === 'Bug' ? '●' : issue.type === 'Story' ? '▮' : <Check size={10} />}</span>{issue.key}</button></td><td><button className="summary-link" onClick={() => setSelected(issue)}>{issue.summary}</button></td><td><span className={`status ${issue.status.toLowerCase().replace(' ', '-')}`}><i />{issue.status}</span></td><td><span className={`priority ${issue.priority.toLowerCase()}`}>{issue.priority === 'High' ? '↑' : issue.priority === 'Low' ? '↓' : '='}</span>{issue.priority}</td><td><span className="assignee"><span className={`avatar ${issue.color}`}>{issue.initials}</span>{issue.assignee}</span></td><td className="points-cell"><span className="point-pill">{issue.points}</span><span className="pts">pts</span></td></tr>)}</tbody></table>{!visibleIssues.length && <div className="empty"><Search size={24} /><h3>No tickets found</h3><p>Try another query or choose a different status.</p></div>}</div><div className="table-footer"><span>Showing {visibleIssues.length} of {issues.length} tickets</span><span><span className="legend-dot" />Estimates are sample story points</span></div></section>
        <footer className="page-footer"><span><Sparkles size={14} />A little clarity goes a long way.</span><span>JiraTron <span>·</span> Thoughtful sprint planning</span></footer>
      </main>
    </div>
    {(help || selected) && <div className="modal-backdrop" onClick={() => { setHelp(false); setSelected(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={event => event.stopPropagation()}><button className="modal-close icon-button" aria-label="Close dialog" autoFocus onClick={() => { setHelp(false); setSelected(null); }} onKeyDown={event => { if (event.key === 'Escape') { setHelp(false); setSelected(null); } }}><X size={20} /></button>{selected ? <><div className="eyebrow">{selected.key} · {selected.type}</div><h2 id="modal-title">{selected.summary}</h2><p>{selected.status} · {selected.priority} priority</p><div className="detail-estimate">{selected.points}<span>sample story points</span></div><p>Assigned to {selected.assignee}. These estimates are mock values for exploring the interface; an estimation model has not been configured.</p></> : <><div className="eyebrow">GETTING STARTED</div><h2 id="modal-title">Your backlog, in focus.</h2><p>JQL is Jira’s query language. This mock workspace supports these example searches:</p><ul><li><code>project = TRON ORDER BY created DESC</code><p>Show all six sample tickets.</p></li><li><code>key = TRON-124</code><p>Look up an individual sample ticket.</p></li><li><code>status = "To do"</code><p>Filter by To do, In progress, or Done.</p></li></ul><p>Full JQL and live issue data will be available when Jira is connected. No credentials are needed for this demo.</p></>}</section></div>}
  </div>;
}

function Stat({ icon, label, value, unit, note, green }) {
  return <article className={`stat-card ${green ? 'stat-green' : ''}`}><div className="stat-label">{label}<span>{icon}</span></div><div className="stat-value">{value}<span>{unit}</span></div><p>{note}</p></article>;
}

createRoot(document.getElementById('root')).render(<App />);

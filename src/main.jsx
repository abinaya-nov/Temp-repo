import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowUpRight, BarChart3, ChevronDown, CircleHelp, Clock3, Command, Layers3, LayoutDashboard, Search, Sparkles, Ticket } from 'lucide-react';
import './styles.css';
import './navigator.css';
import './overview.css';
import Navigator from './Navigator.jsx';
import HelpDialog from './components/HelpDialog.jsx';

function App() {
  const [page, setPage] = useState('Ticket Effort Estimator');
  const [query, setQuery] = useState('project = TRON ORDER BY created DESC');
  const [appliedQuery, setAppliedQuery] = useState('project = TRON ORDER BY created DESC');
  const [searchId, setSearchId] = useState(0);
  const [summary, setSummary] = useState({ total: 0, points: 0, ready: 0 });
  const [searched, setSearched] = useState(false);
  const [help, setHelp] = useState(false);
  const points = summary.points;
  function search(event) {
    event.preventDefault();
    setAppliedQuery(query.trim());
    setSearchId(current => current + 1);
    setSearched(true);
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
        {page === 'Ticket Effort Estimator' && <section className="query-card" aria-labelledby="query-heading"><div className="section-title"><div><h2 id="query-heading"><Search size={18} />Find your tickets</h2><p>Start with a JQL query to bring your backlog into focus.</p></div><button className="text-button" onClick={() => setHelp(true)}>JQL quick guide <ArrowUpRight size={14} /></button></div><form onSubmit={search}><label htmlFor="jql">JQL query</label><div className="query-row"><div className="query-input"><Command size={17} /><input id="jql" value={query} onChange={event => setQuery(event.target.value)} spellCheck="false" placeholder="Enter a JQL query…" /></div><button className="primary-button"><Search size={16} />Search tickets<span>↵</span></button></div><div className="query-hint"><span><CircleHelp size={13} />Use JQL to filter by project, status, assignee, and more in Jira.</span><button type="button" onClick={() => { setQuery('project = TRON ORDER BY created DESC'); setAppliedQuery('project = TRON ORDER BY created DESC'); setSearchId(current => current + 1); setSearched(true); }}>Try an example <ArrowRight size={13} /></button></div></form></section>}
        <div className="results-heading"><h2>{page === 'Overview' ? 'Backlog at a glance' : 'Your estimation overview'}</h2><span><i />{searched ? 'Search results' : 'Sample results'}<span className="dot-separator">·</span>{summary.total} tickets</span></div>
        <section className="stats" aria-label="Estimation summary"><Stat icon={<Ticket size={19} />} label="Total tickets" value={summary.total} note="In your current selection" /><Stat icon={<Layers3 size={19} />} label="Estimated effort" value={points} unit="pts" note="Total story points" green /><Stat icon={<BarChart3 size={19} />} label="Average effort" value={summary.total ? (points / summary.total).toFixed(1) : '0'} unit="pts / ticket" note="Across your selected tickets" /><Stat icon={<Clock3 size={19} />} label="Ready to plan" value={summary.ready} note="Tickets waiting to get started" /></section>
        <div hidden={page !== 'Ticket Effort Estimator'}><Navigator jql={appliedQuery} searchId={searchId} onSummary={setSummary} /></div>
        {page === 'Overview' && <section className="query-card overview-card" aria-label="Workspace overview"><div><h2>Ticket Effort Estimator</h2><p>Explore your matching demo backlog, select tickets, and review independent hours and story-point recommendations.</p><p>Your current search, filters, selections, and review decisions are preserved when you return.</p></div><button className="primary-button" onClick={() => setPage('Ticket Effort Estimator')}>Open Effort Estimator <ArrowRight size={16} /></button></section>}
        <footer className="page-footer"><span><Sparkles size={14} />A little clarity goes a long way.</span><span>JiraTron <span>·</span> Thoughtful sprint planning</span></footer>
      </main>
    </div>
    {help && <HelpDialog close={() => setHelp(false)} />}
  </div>;
}

function Stat({ icon, label, value, unit, note, green }) {
  return <article className={`stat-card ${green ? 'stat-green' : ''}`}><div className="stat-label">{label}<span>{icon}</span></div><div className="stat-value">{value}<span>{unit}</span></div><p>{note}</p></article>;
}

createRoot(document.getElementById('root')).render(<App />);

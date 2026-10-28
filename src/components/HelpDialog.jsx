import React, { useEffect, useState } from 'react';
import Dialog from './Dialog.jsx';
import { supportedJql } from '../data/issueProvider.js';
import { checkBackendHealth } from '../api/backend.js';

export default function HelpDialog({ close }) {
  const [backend, setBackend] = useState('Checking Python backend…');
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 3000);
    checkBackendHealth({ signal: controller.signal }).then(() => {
      if (active) setBackend('Python backend available. Estimation still uses the browser demo baseline.');
    }).catch(() => {
      if (active) setBackend('Python backend unavailable. Demo search and estimation remain available.');
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);
  return <Dialog title="Help & getting started" close={close}><div className="eyebrow">GETTING STARTED</div><h2>Your backlog, in focus.</h2><p>{supportedJql}</p><ul><li><code>project = TRON ORDER BY created DESC</code></li><li><code>status = "To do" AND priority = High</code></li><li><code>assignee = "Alex Morgan"</code></li></ul><p>Selections persist across pages and navigation. Every search submission or changed status filter resets pagination, selections, and review results. Recommendations use demo heuristics and never update Jira.</p><h3>Backend connection</h3><p role="status">{backend}</p></Dialog>;
}

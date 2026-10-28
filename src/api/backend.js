export async function checkBackendHealth({ signal, fetcher = fetch } = {}) {
  const response = await fetcher('/api/health', { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Backend health check failed.');
  const health = await response.json();
  if (health.status !== 'ok' || health.service !== 'jiratron-api') throw new Error('Unexpected backend health response.');
  return health;
}

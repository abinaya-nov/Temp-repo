import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBackendHealth } from '../src/api/backend.js';

test('health adapter requests the same-origin API and validates its contract', async () => {
  const controller = new AbortController();
  const health = await checkBackendHealth({ signal: controller.signal, fetcher: async (url, options) => {
    assert.equal(url, '/api/health');
    assert.equal(options.signal, controller.signal);
    return { ok: true, json: async () => ({ status: 'ok', service: 'jiratron-api', version: '0.1.0' }) };
  } });
  assert.equal(health.service, 'jiratron-api');
});

test('unavailable or incompatible backends fail explicitly', async () => {
  await assert.rejects(checkBackendHealth({ fetcher: async () => { throw new Error('offline'); } }), /offline/);
  await assert.rejects(checkBackendHealth({ fetcher: async () => ({ ok: false }) }), /failed/);
  await assert.rejects(checkBackendHealth({ fetcher: async () => ({ ok: true, json: async () => ({ status: 'ok' }) }) }), /Unexpected/);
});

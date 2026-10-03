import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../src/lib/api/client.ts', import.meta.url), 'utf8');
function harness(fetchImpl, base = 'http://example.invalid/api/v1') {
  let token = null;
  const context = { exports: {}, window: {}, fetch: fetchImpl, require: name => {
    if (name === './config') return { API_BASE_URL: base, isMockMode: () => false };
    if (name === './mock-adapter') return { MockApiAdapter: {} };
    if (name === '@/lib/auth/session') return { getSessionToken: () => token };
    throw new Error(`Unexpected dependency ${name}`);
  }};
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return { api: context.exports.api, setToken: value => { token = value; } };
}
const response = data => ({ ok: true, json: async () => ({ success: true, data }) });

test('registration maps fields and signs in through the existing login contract', async () => {
  const calls = [];
  const { api } = harness(async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return response(url.endsWith('/register') ? { user_id: 'synthetic-id' } : {
      access_token: 'synthetic-token', user: { id: 'synthetic-id', login_identifier: 'synthetic@example.com', role: 'PATIENT' },
    });
  });
  const result = await api.register({ full_name: 'Synthetic Patient', email: 'synthetic@example.com', password: 'synthetic-password' });
  assert.equal(calls[0].body.display_name, 'Synthetic Patient');
  assert.equal(calls[0].body.login_identifier, 'synthetic@example.com');
  assert.equal(calls[1].body.login_identifier, 'synthetic@example.com');
  assert.equal(result.data.access_token, 'synthetic-token');
});

test('public registration cannot create a healthcare worker account', async () => {
  const { api } = harness(() => { throw new Error('Must not call backend'); });
  const result = await api.register({ role: 'HEALTHCARE_WORKER' });
  assert.equal(result.success, false);
});

test('symptom flow records then analyzes with the authenticated patient session', async () => {
  const calls = [];
  const h = harness(async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body), headers: options.headers });
    return response(url.endsWith('/analyze') ? { symptom_record_id: 'synthetic-record', risk_level: 'ROUTINE', red_flags: [], guidance: 'Synthetic guidance', escalation_required: false } : { symptom_record_id: 'synthetic-record', reported_at: '2026-10-03' });
  });
  h.setToken('synthetic-session');
  const result = await h.api.submitSymptoms({ symptoms_description: 'Synthetic symptom narrative', language: 'en' });
  assert.equal(calls[0].body.text, 'Synthetic symptom narrative');
  assert.equal(calls[1].body.symptom_record_id, 'synthetic-record');
  assert.equal(calls[1].headers.Authorization, 'Bearer synthetic-session');
  assert.equal(result.data.recommended_action, 'Synthetic guidance');
});

test('failed symptom recording never proceeds to analysis', async () => {
  let calls = 0;
  const { api } = harness(async () => { calls++; return { ok: false, json: async () => ({ detail: 'Unauthorized' }) }; });
  assert.equal((await api.submitSymptoms({ symptoms_description: 'Synthetic input' })).success, false);
  assert.equal(calls, 1);
});

test('live synthetic patient can register, load profile, analyze symptoms and use the emergency chat gate', { skip: process.env.LIVE_API_TEST !== '1' }, async () => {
  const h = harness(fetch, 'http://127.0.0.1:8000/api/v1');
  const email = `SYN-integration-${Date.now()}@example.com`;
  const account = await h.api.register({ full_name: 'SYN Integration Patient', email, password: 'SyntheticTestOnly123!' });
  assert.equal(account.success, true);
  assert.ok(account.data.access_token);
  h.setToken(account.data.access_token);
  assert.equal((await h.api.getPatientProfile()).data.full_name, 'SYN Integration Patient');
  const symptoms = await h.api.submitSymptoms({ symptoms_description: 'chest pain and severe difficulty breathing', language: 'en' });
  assert.equal(symptoms.data.risk_level, 'EMERGENCY');
  const chat = await h.api.postAIChat({ message: 'chest pain and severe difficulty breathing', language: 'en' });
  assert.equal(chat.data.response_type, 'EMERGENCY');
  assert.equal(chat.data.sources.length, 0);
});

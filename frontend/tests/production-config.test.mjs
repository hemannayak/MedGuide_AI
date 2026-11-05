import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/api/config.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
function load(env) {
  const exports = {};
  vm.runInNewContext(code, { exports, process: { env } });
  return exports;
}
test('production rejects synthetic API workflows', () => {
  assert.throws(() => load({ NODE_ENV: 'production', NEXT_PUBLIC_API_MODE: 'MOCK' }), /requires.*REAL/);
});
test('production defaults to the real API', () => {
  assert.equal(load({ NODE_ENV: 'production' }).isMockMode(), false);
  assert.equal(load({ NODE_ENV: 'production', NEXT_PUBLIC_API_MODE: 'REAL' }).isMockMode(), false);
});
test('explicit development fixtures remain available', () => {
  assert.equal(load({ NODE_ENV: 'development', NEXT_PUBLIC_API_MODE: 'MOCK' }).isMockMode(), true);
});

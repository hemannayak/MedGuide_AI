import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const ts = createRequire(import.meta.url)('typescript');

function component(path, name) {
  const context = { exports: {}, require: module => {
    if (module === 'react') return { useState: value => [value, () => {}] };
    if (module === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (module.endsWith('.css')) return { default: {} };
    return {};
  } };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context);
  return context.exports[name];
}
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
const review = component('../src/components/care/medication-review.tsx', 'MedicationReview');
test('incomplete pending OCR records provide review guidance without a confirmation control', () => {
  for (const dosage of ['', 'Unspecified']) {
    const tree = review({ medication: { medicine_name: 'SYN medicine', dosage, verification_status: 'PENDING' }, verify: () => assert.fail('must not verify'), onVerified: () => {} });
    assert.equal(nodes(tree).filter(node => node.type === 'button').length, 0);
    assert.equal(nodes(tree).filter(node => node.props?.role === 'status').length, 1);
  }
});
test('complete pending details still require an explicit unchecked review step', () => {
  const tree = review({ medication: { medicine_name: 'SYN medicine', dosage: 'SYN strength', verification_status: 'PENDING' }, verify: () => {}, onVerified: () => {} });
  assert.equal(nodes(tree).find(node => node.type === 'button').props.disabled, true);
  assert.equal(nodes(tree).find(node => node.type === 'input').props.checked, false);
});
test('missing evidence never claims verified healthcare grounding', () => {
  const evidence = component('../src/components/chat/med-evidence.tsx', 'MedEvidence');
  const tree = evidence({ sources: [] });
  assert.equal(nodes(tree).find(node => node.type === 'span').props.children, 'No retrieved references attached to this response');
});

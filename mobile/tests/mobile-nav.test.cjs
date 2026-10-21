const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const ts = require('typescript');
function navigation(current, disabled = false) {
 const calls = [];
 const context = {exports: {}, require: name => {
  if (name === 'expo-router') return {router: {replace: route => calls.push(route)}};
  if (name === 'react-native') return {Pressable: 'Pressable', Text: 'Text', View: 'View', StyleSheet: {create: value => value}};
  if (name === './brand-ui') return {palette: {}};
  if (name === 'react/jsx-runtime') return {jsx: (type, props) => ({type, props}), jsxs: (type, props) => ({type, props})};
  throw new Error(name);
 }};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/components/mobile-nav.tsx', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX}}).outputText, context);
 return {calls, tabs: context.exports.MobileNav({current, disabled}).props.children};
}
test('navigation opens existing mobile routes and identifies the current screen', () => {
 const h = navigation('/home');
 assert.equal(h.tabs[0].props.accessibilityState.selected, true);
 assert.equal(h.tabs[0].props.disabled, true);
 assert.deepEqual(Array.from(h.tabs, tab => tab.props.accessibilityLabel), ['Home', 'Talk', 'Records', 'Settings']);
 for (const tab of h.tabs.filter(tab => !tab.props.disabled)) tab.props.onPress();
 assert.deepEqual(h.calls, ['/chat', '/care', '/settings']);
});
test('ongoing audio can disable navigation to protect the recording', () => {
 const h = navigation('/chat', true);
 assert.ok(h.tabs.every(tab => tab.props.disabled));
 assert.ok(h.tabs.every(tab => tab.props.accessibilityState.disabled));
 assert.equal(h.calls.length, 0);
});

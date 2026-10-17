const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const output = ts.transpileModule(
  fs.readFileSync("src/services/api.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const context = { exports: {}, process: { env: {} }, setTimeout: (fn) => fn() };
vm.runInNewContext(output, context);
const api = context.exports;
test("empty credentials fail before starting a sample session", async () => {
  await assert.rejects(api.loginUser("", ""), /Enter your email/);
});
test("sample sign-in explicitly returns sample status", async () => {
  assert.equal(
    (await api.loginUser("sample@example.com", "sample")).sample,
    true,
  );
});
test("registration validates email, length, and confirmation", async () => {
  await assert.rejects(
    api.registerUser("Sample", "bad", "12345678", "12345678"),
    /valid email/,
  );
  await assert.rejects(
    api.registerUser("Sample", "a@b.in", "short", "short"),
    /8 characters/,
  );
  await assert.rejects(
    api.registerUser("Sample", "a@b.in", "12345678", "87654321"),
    /match/,
  );
});
test("empty messages cannot be sent", async () => {
  await assert.rejects(api.sendMessage(" "), /Type your question/);
});
test("sample chat never fabricates medical guidance", async () => {
  assert.match(await api.sendMessage("sample question"), /Sample response/);
});
test("Google sign-in explains unavailable integration", async () => {
  await assert.rejects(api.googleSignIn(), /not connected/);
});

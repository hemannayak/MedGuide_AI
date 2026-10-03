import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
test('new workspace destinations retain the session gate on initial render',()=>{
 for(const route of ['dashboard','profile','settings']){
  const file=`${root}.next/server/app/app/${route}.html`;
  assert.ok(existsSync(file));
  const html=readFileSync(file,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  assert.match(html,/Checking account access/);
  assert.doesNotMatch(html,/Penicillin|Sunitha Kumar|101°F/);
 }
});

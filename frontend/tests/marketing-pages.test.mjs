import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const base=fileURLToPath(new URL('../.next/server/app/',import.meta.url));
const raw=route=>readFileSync(`${base}${route}.html`,'utf8');
const page=route=>raw(route).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const routes=['index','product','how-it-works','technology','research','about','safety','languages','faq','contact','accessibility','privacy','terms','legal/privacy','legal/terms','legal/disclaimer'];
for(const route of routes){
 test(`${route}: shared design, semantic structure, factual boundaries, metadata and working link targets`,()=>{
  const html=page(route);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal((html.match(/<main\b/g)||[]).length,1);
  assert.equal((html.match(/<header\b/g)||[]).length,1);
  assert.equal((html.match(/aria-label="Main navigation"/g)||[]).length,1);
  assert.equal((html.match(/aria-label="MedGuide footer"/g)||[]).length,1);
  for(const label of ['Footer Products','Footer Technology','Footer Resources','Footer Company','Footer Legal &amp; Safety']) assert.ok(html.includes(`aria-label="${label}"`),label);
  assert.ok(html.includes('/legal/disclaimer'));
  assert.doesNotMatch(html,/Frontend demonstration · MedGuide AI does not replace a qualified healthcare professional\.|Research project · No clinical validation claimed\./);
  assert.doesNotMatch(html,/Laptop A|Laptop B|LAPTOP A|LAPTOP B|Two laptops|50K\+|5\+/);
  assert.match(html,/<link[^>]*rel="canonical"/);
  assert.match(html,/property="og:title"/);
  assert.match(html,/name="twitter:card"/);
  for(const [,href] of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)){
   if(href.startsWith('#')) assert.ok(html.includes(`id="${href.slice(1)}"`),href);
   else if(href.startsWith('/')){const [path,anchor]=href.split('#');const target=page(path==='/'?'index':path.slice(1));if(anchor)assert.ok(target.includes(`id="${anchor}"`),href);}
  }
 });
}
test('feature selectors and interactive flows have accessible relationships',()=>{
 for(const route of ['index','product']){
  const html=page(route);for(const mode of ['text','voice','document','language','sources','safety'])assert.ok(html.includes(`id="feature-tab-${mode}"`));
  assert.ok(html.includes('aria-labelledby="feature-tab-text"'));
 }
 for(const route of ['technology','research','about','safety','languages','accessibility']){
  const html=page(route);assert.ok(html.includes(route==='how-it-works' ? 'Select journey stage' : 'visual explainer'));assert.match(html,/role="tabpanel"/);assert.match(html,/aria-live="polite"/);
 }
});
test('the care journey exposes four accessible stages',()=>{const html=page('how-it-works');assert.match(html,/id="journey-preview"/);assert.match(html,/aria-live="polite"/);for(const label of ['ASK','UNDERSTAND','GUIDE','ACT'])assert.ok(html.includes(label));});
test('the hero photograph is not repeated in secondary page heroes',()=>{
 for(const route of ['product','how-it-works','technology','research','about'])assert.doesNotMatch(page(route),/heroDevices|heroLeaves/);
 assert.ok(page('about').includes('community-about.webp'));
 assert.ok(page('about').includes('Conceptual illustration'));
});
test('social controls contain actual SVG marks and no fabricated destinations',()=>{
 for(const route of routes){const html=page(route);for(const name of ['GitHub','LinkedIn','YouTube','X'])assert.match(html,new RegExp(`aria-label="${name} profile information"[^>]*><svg`));assert.doesNotMatch(html,/>GH<|>in<|>▶<|>𝕏</);}
});
test('FAQ structured data matches questions in visible expandable content',()=>{
 const html=raw('faq');const data=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([,json])=>JSON.parse(json));
 const faq=data.find(item=>item['@type']==='FAQPage');assert.ok(faq);assert.equal(faq.mainEntity.length,8);for(const question of faq.mainEntity)assert.ok(page('faq').includes(question.name));
});
test('privacy and terms retain canonical aliases and contact does not fake delivery',()=>{
 assert.match(page('legal/privacy'),/rel="canonical" href="[^"]*\/privacy"/);assert.match(page('legal/terms'),/rel="canonical" href="[^"]*\/terms"/);
 assert.ok(page('contact').includes('Demo form only'));assert.doesNotMatch(page('contact'),/Message Sent Successfully|TLS 1.3|AES-256/);
});
test('service inventory matches the registered router modules without claiming live integration',()=>{
 const router=readFileSync(fileURLToPath(new URL('../../backend/app/api/v1/router.py',import.meta.url)),'utf8');
 const registered=[...router.matchAll(/prefix="([^"]+)"/g)].map(([,prefix])=>prefix).sort();
 const html=page('technology');
 const published=[...html.replace(/<!--[\s\S]*?-->/g,'').matchAll(/<code>\/api\/v1([^<]+)<\/code>/g)].map(([,prefix])=>prefix).sort();
 assert.deepEqual(published,registered);
 assert.match(html,/not evidence that these services are deployed/);
 assert.match(html,/Speech and prescription routers are not registered/);
 assert.doesNotMatch(html,/6,760|never hallucinates|ABDM Compliance/);
});
test('worker navigation explains its unavailable portal instead of linking to a missing route',()=>{
 const html=page('product');
 assert.match(html,/id="healthcare-workers"/);
 assert.match(html,/dedicated healthcare-worker portal is not available/);
 assert.match(page('index'),/href="\/product#healthcare-workers"/);
 assert.doesNotMatch(page('index'),/href="\/hcw"|href="\/admin\/activity"/);
});

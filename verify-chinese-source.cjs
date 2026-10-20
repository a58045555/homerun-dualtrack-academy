const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/chinese-vocabulary.js','utf8'),ctx);const local=ctx.window.HOMERUN_CHINESE_VOCAB;
if(!local)throw Error('Vocabulary global missing');
vm.runInNewContext(fs.readFileSync('assets/chinese-content.js','utf8'),ctx);const lessons=ctx.window.HOMERUN_CHINESE.lessons;
const plain=s=>s.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
(async()=>{
 const entries=[];
 for(let n=1;n<=12;n++){
  const id='upper-'+String(n).padStart(2,'0'),expected=local.lessons[id],url=expected.source;
  const res=await fetch(url);assert(res.ok,url);const html=await res.text();
  const actual={characters:[],recognition:[],words:[]},types={'生字':'characters','認讀字':'recognition','語詞':'words'};
  for(const row of html.matchAll(/<tr\b[\s\S]*?<\/tr>/g)){
   const type=row[0].match(/<td\b[^>]*class="[^"]*\btype\b[^"]*"[^>]*>([\s\S]*?)<\/td>/)?.[1];
   const term=row[0].match(/<td\b[^>]*class="[^"]*\bword_class\b[^"]*"[^>]*>([\s\S]*?)<\/td>/)?.[1];
   if(type&&term){const key=types[plain(type)];assert(key,'Unknown source classification '+plain(type));actual[key].push(plain(term))}
  }
  for(const k of Object.keys(actual))assert.deepEqual(actual[k],Array.from(expected[k]),id+'/'+k);
  const title=plain(html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1]||'').replace(/^生字詞彙表：[^：]+：/,'');
  assert.equal(title.normalize('NFKC'),lessons.find(l=>l.id===id).title.normalize('NFKC'),id+' title');
  const digest=crypto.createHash('sha256').update(JSON.stringify(actual)).digest('hex');
  entries.push({id,url,title,counts:Object.fromEntries(Object.entries(actual).map(([k,v])=>[k,v.length])),sha256:digest});
 }
 const result={checkedAt:new Date().toISOString(),result:'Every character, recognition entry and word matches the live Ministry of Education source, in order and classification.',entries};
 fs.writeFileSync('artifacts/chinese-source-verification.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({lessons:entries.length,counts:entries.reduce((a,e)=>{for(const[k,v]of Object.entries(e.counts))a[k]=(a[k]||0)+v;return a},{}),titles:entries.map(e=>e.title)}));
})().catch(e=>{console.error(e);process.exitCode=1});

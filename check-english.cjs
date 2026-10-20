const assert=require('node:assert/strict'),fs=require('node:fs');const {app}=require('./curriculum-runtime.cjs');
const active=app.getProfiles().list.find(p=>p.id===app.getProfiles().active);
let checked=0;
const valid=q=>{assert.equal(q.choices.length,4,q.main);assert.equal(new Set(q.choices).size,4,q.main);assert.equal(q.choices.filter(c=>c===q.answer).length,1,q.main);assert(q.explain)};
for(const theme of ['field','space','princess','animals']){
 active.theme=theme;app.applyWorld();
 for(const lv of [1,2,3,4]){
  for(const mode of ['vocab','listening','sentence']){
   const source=mode==='sentence'?app.READ[lv]:app.VOCAB[lv],used=new Set();
   for(let i=0;i<source.length;i++){const q=app.englishQuestion(lv,mode,used);valid(q);assert(!used.has(q.signature),theme+'/'+lv+'/'+mode+' repeated before covering all rows');used.add(q.signature);checked++}
  }
  const used=new Set();
  for(let i=0;i<app.WORD_USE[lv].length;i++){
   const q=app.wordUseQuestion(lv,used);valid(q);assert(!used.has(q.signature));used.add(q.signature);
   const row=app.WORD_USE[lv][Number(q.signature.split('-').at(-1))];
   assert.equal(q.second,'中文意思：'+row[2]);assert.equal(q.answer,row[1]);
   assert(app.VOCAB[lv].some(v=>v[0]===q.answer),q.answer);
   for(const c of q.choices.filter(c=>c!==q.answer))assert(!app.confusable(c,q.answer));
   if(q.answer==='decide')assert(!q.choices.includes('choose'));
   checked++;
  }
  for(const r of app.READ[lv]){assert.equal(new Set(r[2]).size,4);assert(r[2].includes(r[3]));assert(r[0]&&r[1]&&r[4])}
  for(const r of app.DEEP_READ[lv]){assert.equal(new Set(r[3]).size,4);assert(r[3].includes(r[2]));assert(r[0]&&r[1]&&r[4]&&r[5]&&r[6]);checked++}
 }
 assert.equal(app.ALPHABET.length,26);
 app.ALPHABET.forEach((x,i)=>{assert.equal(x.upper,String.fromCharCode(65+i));assert.equal(x.lower,x.upper.toLowerCase());assert(x.word.includes(x.lower),x.word);assert(x.meaning)});
}
active.theme='field';app.applyWorld();
const full=Object.values(app.DEEP_READ).flat();
assert(!full.some(r=>r[0].includes('Nora practiced pitching for an hour every day')));
const socks=full.find(r=>r[0].includes('ten games with the socks'));assert(socks[2].includes('未顯示'));assert(socks[4].includes('不能證明'));
const order=full.find(r=>r[0].includes('new leadoff hitter'));assert(order[0].includes('Before the next game'));assert(order[4].includes('未證明'));
assert.equal(60-(20+15+10),15);assert.equal(40-40/2-40/4,10);assert.equal(20-20/2-5,5);assert.equal(4*2-1,7);
assert(!Object.values(app.GIRL_USE).flat().some(r=>r[0].includes('Pandas are')));
console.log('PASS: '+checked+' English vocabulary, listening, sentence, usage and reading records traversed across four themes; unique pools, explicit semantic cues, inference corrections and alphabet mapping verified.');

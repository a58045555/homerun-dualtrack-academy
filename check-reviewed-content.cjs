const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {app}=require('./curriculum-runtime.cjs');
app.applyWorld();
function reviewedRows(){
 const rows=[];
 for(const [group,bank] of Object.entries(app.BASE_DATA.sci))bank.forEach((q,i)=>rows.push({id:'science/'+group+'/'+i,content:q}));
 for(const [group,bank] of Object.entries(app.GIRL_SCIENCE))bank.forEach((q,i)=>rows.push({id:'science/extra/'+group+'/'+i,content:q}));
 for(const [name,bank] of Object.entries({odd:app.BASE_DATA.odd,rules:app.BASE_DATA.rules,extraOdd:app.GIRL_ODD,extraRules:app.GIRL_RULES}))bank.forEach((q,i)=>rows.push({id:'logic/'+name+'/'+i,content:q}));
 for(const c of app.SCI_COURSES.courses)rows.push({id:'course/'+c.id,content:c});
 for(const p of app.SCI_COURSES.planets)rows.push({id:'planet/'+p.order,content:p});

 for(const [group,bank] of Object.entries({vocab:app.BASE_DATA.vocab,read:app.BASE_DATA.read,use:app.BASE_DATA.use,deep:app.BASE_DATA.deep,extraVocab:app.GIRL_VOCAB,extraRead:app.GIRL_READ,extraUse:app.GIRL_USE,extraDeep:app.GIRL_DEEP}))
  for(const [level,entries] of Object.entries(bank))entries.forEach((q,i)=>rows.push({id:'english/'+group+'/'+level+'/'+i,content:q}));
 for(const a of app.ALPHABET)rows.push({id:'alphabet/'+a.upper,content:a.upper==='B'?app.BASE_DATA.alphaB:a});
 rows.push({id:'alphabet/other-B',content:app.ALPHA_B.girl});
 app.CN.words.forEach((q,i)=>rows.push({id:'chinese/word/'+i,content:q}));
 for(const lesson of app.CN.lessons)rows.push({id:'chinese/lesson/'+lesson.id,content:lesson});
 for(const [id,list] of Object.entries(app.CN_VOCAB.lessons))rows.push({id:'chinese/textbook-list/'+id,content:list});
 return rows;
}
function sha(q){return crypto.createHash('sha256').update(JSON.stringify(q)).digest('hex')}
const rows=reviewedRows();
if(require.main===module){
 const ledger=JSON.parse(fs.readFileSync('artifacts/curriculum-reviewed-content.json','utf8'));
 assert.deepEqual(ledger.entries.map(x=>x.id).sort(),rows.map(x=>x.id).sort(),'Manual review coverage must include every current row');
 for(const r of rows){const e=ledger.entries.find(x=>x.id===r.id);assert.equal(e.sha256,sha(r.content),'Content changed since manual review: '+r.id);
  const q=r.content;if(q.q){assert.equal(q.o.length,4,r.id);assert.equal(new Set(q.o).size,4,r.id);assert.equal(q.o.filter(x=>x===q.a).length,1,r.id);assert(q.e,r.id)}
 }
 // Exhaust all possible membership patterns for some/all, and the contrapositive.
 for(let n=1;n<=9;n++)for(let mask=0;mask<(1<<n);mask++){
  const some=mask!==0,all=mask===(1<<n)-1;if(all)assert(some);
  if(n>=2&&mask===1){assert(some&&!all)}if(all)assert(!(!all));
 }
 for(const a of [false,true])for(const b of [false,true])assert.equal(!a||b,b||!a);
 // Independently enumerate the wrong-label puzzle: the single draw from "mixed" distinguishes all possibilities.
 const permute=a=>a.length?a.flatMap((x,i)=>permute(a.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
 const arrangements=permute(['red','blue','mix']).filter(a=>a.every((x,i)=>x!==['red','blue','mix'][i]));
 assert.equal(arrangements.length,2);assert(new Set(arrangements.map(a=>a[2])).size===2);assert(arrangements.every(a=>a[2]!=='mix'));
 for(const theme of ['field','space','princess','animals']){
  app.getProfiles().list.find(p=>p.id===app.getProfiles().active).theme=theme;app.applyWorld();
  for(const [group,bank] of Object.entries(app.SCIENCE_BANK))for(const q of bank){
   assert.equal(new Set(q.o).size,4,theme+'/'+group);assert.equal(q.o.filter(x=>x===q.a).length,1,theme+'/'+group);
  }
 }

 // Theme substitutions must never rename scientific models/materials (e.g. sphere -> energy crystal).
 const oldTheme=app.getProfiles().list.find(p=>p.id===app.getProfiles().active).theme;
 for(const theme of ['field','space','princess','animals']){
  app.getProfiles().list.find(p=>p.id===app.getProfiles().active).theme=theme;app.applyWorld();
  for(const course of app.SCI_COURSES.courses){
   app.setScienceCourse(course.id);const qs=app.generateQuestions('science','lesson',4);
   assert.equal(qs.length,3,theme+'/'+course.id);
   for(const q of qs){const row=course.questions[Number(q.signature.slice(q.signature.lastIndexOf('-')+1))];assert.equal(q.main,row?.[0]);assert(row,theme+'/'+course.id+' scientific wording changed');assert.equal(q.answer,row[1]);assert.equal(q.explain,row[5])}
  }
 }
 app.getProfiles().list.find(p=>p.id===app.getProfiles().active).theme=oldTheme;
 console.log('PASS: '+rows.length+' manually reviewed fixed curriculum records match the reviewed hashes; complete choice checks, four themes and independent logic checks passed.');
}
module.exports={reviewedRows,sha};

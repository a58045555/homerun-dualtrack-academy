const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');const {app}=require('./curriculum-runtime.cjs');
const bank=app.cnBank(app.CN.lessons);assert.equal(bank.length,312);assert.equal(app.CN.lessons.length,24);assert.equal(app.CN.words.length,68);
for(const q of bank){assert.equal(new Set(q.choices).size,4,q.signature);assert.equal(q.choices.filter(c=>c===q.answer).length,1,q.signature);assert(q.explain&&q.cnLessonId)}
const proof=JSON.parse(fs.readFileSync('artifacts/chinese-source-verification.json','utf8'));assert.equal(proof.entries.length,12);
for(const entry of proof.entries){
 const expected=app.CN_VOCAB.lessons[entry.id],actual={characters:expected.characters,recognition:expected.recognition,words:expected.words};
 const hash=crypto.createHash('sha256').update(JSON.stringify(actual)).digest('hex');assert.equal(hash,entry.sha256,entry.id);
 assert.equal(entry.title.normalize('NFKC'),app.CN.lessons.find(l=>l.id===entry.id).title.normalize('NFKC'));
}
const chars=new Set();
for(const [id,list] of Object.entries(app.CN_VOCAB.lessons)){
 app.setChinese('upper',id);app.setDict('char',0);
 for(const q of app.dictItems()){
  const m=q.speech.match(/^(.+)。請寫這個詞的第(\d+)個字。$/);assert(m,q.speech);
  assert.equal([...m[1]][Number(m[2])-1],q.answer,q.speech);chars.add(q.answer);
  assert(!q.speech.includes('的'+q.answer+'。'),'Do not read an isolated polyphonic character');
 }
 assert(!app.dictItems().some(q=>list.recognition.includes(q.answer)));
}
assert.equal(chars.size,216);
assert.equal(app.CN.lower.verified,false);
const p=app.getProfiles().list.find(p=>p.id===app.getProfiles().active);p.grade='g2';
let generated=0;
for(const theme of ['field','princess','animals','space']){
 p.theme=theme;app.applyWorld();
 for(const l of app.CN.lessons){
  app.setChinese(l.semester,l.id);
  const qs=app.generateQuestions('chinese','reading',1);assert.equal(qs.length,3);
  for(const q of qs){assert.equal(q.main,l.story);const idx=Number(q.signature.split('-').at(-1));assert.equal(q.answer,l.read[idx][1]);assert.equal(q.second,l.read[idx][0]);generated++}
 }
 const used=new Set();
 for(let i=0;i<app.ZY_SYLLABLES.length;i++){
  const q=app.generateQuestions('zhuyin','spell',2);
  for(const x of q){assert.equal(x.skill,'zy-spell');const char=x.signature.slice(3);const source=app.ZY_SYLLABLES.find(r=>r[0]===char);assert(source);assert.equal(x.answer,source[1]);assert(x.explain.includes('「'+char+'」'),x.explain);used.add(char)}
 }
 assert(used.has('球'),'Sphere-character phonetic practice remains valid in all themes');
}
console.log('PASS: all 312 Chinese questions, 24 original lessons, 68 topic words, live-source proof for 12 textbook lists, all 216 dictation cues and '+generated+' cross-theme reading questions verified.');

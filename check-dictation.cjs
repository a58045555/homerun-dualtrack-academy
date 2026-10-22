const assert=require('node:assert/strict');
const {app,sandbox}=require('./curriculum-runtime.cjs');
app.navigate('dictation'); // Match the real UI entry; do not inherit a previous check.cjs quiz.
const all=Object.values(app.CN_VOCAB.lessons);
assert.equal(all.length,12);assert.equal(all.reduce((n,v)=>n+v.characters.length,0),216);assert.equal(all.reduce((n,v)=>n+v.recognition.length,0),23);assert.equal(all.reduce((n,v)=>n+v.words.length,0),138);
for(const [id,v] of Object.entries(app.CN_VOCAB.lessons)){
 assert.equal(v.characters.length,18);assert.equal(new Set(v.characters).size,18);assert(v.words.every(w=>w.length>1));assert(v.source.includes('11501'));
 app.setChinese('upper',id);app.setDict('char',0);assert.equal(app.dictItems().length,18);app.setDict('word',0);assert.equal(app.dictItems().length,v.words.length);app.setDict('mix',0);assert.equal(app.dictItems().length,18+v.words.length);
}
app.setChinese('lower','all');assert.equal(app.dictItems().length,0);assert(app.dictationPage().includes('二下教材清單待核對'));
app.setChinese('upper','all');app.setDict('word',10);
const previous=structuredClone(app.getData());let spoken=[];
sandbox.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};sandbox.speechSynthesis={cancel(){},getVoices:()=>[],speak:u=>spoken.push(u.text)};
assert(app.startDictation());let e=app.getDict();assert.equal(e.items.length,10);assert.equal(new Set(e.items.map(x=>x.answer)).size,10);
const markup=app.dictationPage();assert(!markup.includes('dict-answers'));for(const q of e.items)assert(!markup.includes('>'+q.answer+'<'));
app.playDictation();assert.equal(spoken.length,4);assert.equal(spoken[1],spoken[3]);assert(spoken[1].includes(e.items[0].answer));
app.showDictAnswers();assert(app.dictationPage().includes('聽寫答案卷'));for(const q of e.items)assert(app.dictationPage().includes('<strong>'+q.answer+'</strong>'));
assert.equal(JSON.stringify(app.getData()),JSON.stringify(previous),'paper exam must not invent scored digital results');
for(const kind of ['char','word','mix'])for(const count of [0,10,20]){app.setDict(kind,count);const pool=app.dictItems();assert(app.startDictation());assert.equal(app.getDict().items.length,count?Math.min(count,pool.length):pool.length)}
for(let lv=1;lv<=4;lv++){app.setTimes(2);const found=new Set();for(let i=0;i<80;i++)app.generateQuestions('math','times',lv).forEach(q=>found.add(q.signature));assert.equal(found.size,81,'all 1-9 facts regardless of level/row')}
assert(!app.timesPage().includes('times-row'));assert.equal((app.timesPage().match(/class="times-card"/g)||[]).length,81);
console.log('PASS: 216 characters, 23 recognition entries, 138 words; per-lesson pools; hidden-answer audio exams; answer sheets; all 81 facts at every math level.');

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html','utf8');
const code = fs.existsSync('assets/app.js') ? fs.readFileSync('assets/app.js','utf8') : [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const values=new Map();
const element={innerHTML:'',textContent:'',dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];}};
const document={body:element,documentElement:element,hidden:false,getElementById(id){return id==='app'||id==='toast'?element:null;},querySelector(){return null;},querySelectorAll(){return [];},addEventListener(){}};
const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
let timerId=0;
const timers=new Map();
const sandbox={document,console,localStorage:storage,sessionStorage:storage,navigator:{},location:{hash:'',href:'http://localhost/'},structuredClone,crypto:require('node:crypto').webcrypto,TextEncoder,URL,Blob,HTMLFormElement:class{},Audio:class{pause(){}load(){}play(){return Promise.resolve();}},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),setInterval:()=>0,clearInterval(){},addEventListener(){},scrollTo(){},getComputedStyle:()=>({getPropertyValue:()=>''})};
sandbox.window=sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("assets/chinese-content.js","utf8"),sandbox);
vm.runInContext(fs.readFileSync("assets/chinese-vocabulary.js","utf8"),sandbox);
const expose=`window.testApp={CN_VOCAB,dictItems,dictationPage,startDictation,playDictation,setDict:(k,n)=>{dictKind=k;dictCount=n;dictExam=null},getDict:()=>dictExam,setDictIndex:n=>dictExam.index=n,showDictAnswers:()=>dictExam.answers=true,timesBank,timesRound,timesPage,setTimes:r=>timesRow=r,CN,cnBank,chineseView,generateChineseRound,setChinese:(semester,lesson)=>{cnSemester=semester;cnLesson=lesson},SUBJECT_KEYS,MODES,ZHUYIN,LETTER_RECORDINGS,WORD_RECORDINGS,SENTENCE_RECORDINGS,normalizeSettings,generateQuestions,calcQuestion,reasonQuestion,patternQuestion,measureQuestion,lineupQuestion,safeLoad,save,start,answer,next,finish,visibleModes,selectView,quiz,render,stopEnglish,clearAdvance,autoReadSoon,safeReviewQuestion,playEnglish,playDeviceEnglish,getIssue:()=>storageIssue,setData:v=>data=v,getData:()=>data,setSubject:v=>subject=v,getSession:()=>session,getPage:()=>page,setParent:v=>parentUnlocked=v,getProfiles:()=>profiles};`;
vm.runInContext(code.replace(/render\(\);\s*populateSpeechVoices\(\);\s*\}\)\(\);\s*$/,expose+'})();'),sandbox);
const app=sandbox.testApp;
let count=0;
const failures=[];
for(const sub of app.SUBJECT_KEYS)for(const level of [1,2,3,4])for(const mode of app.MODES[sub]){
  if(mode.id==='review')continue;
  for(let repeat=0;repeat<5;repeat++){
    try{
      const questions=app.generateQuestions(sub,mode.id,level);
      assert(questions.length>0&&questions.length<=10,'round length');
      for(const q of questions){
        assert.equal(q.choices.length,4,'four choices');
        assert.equal(new Set(q.choices).size,4,'unique choices '+JSON.stringify(q));
        assert.equal(q.choices.filter(x=>x===q.answer).length,1,'one matching answer '+JSON.stringify(q));
        assert(q.explain&&q.main&&q.skill,'question metadata');
        count++;
      }
    }catch(e){failures.push(`${sub}/${mode.id}/L${level}: ${e.message}`);break;}
  }
}
console.log(`Generated and validated ${count} questions across all subjects, modes and levels.`);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
// Verify arithmetic independently, substituting answers into missing-number equations.
for(const level of [1,2,3,4])for(let i=0;i<250;i++){
  const q=app.calcQuestion(level);
  if(q.main.includes('＝')){
    const equation=q.main.replace('□',q.answer).replace('?',q.answer).replaceAll('＋','+').replaceAll('−','-').replaceAll('×','*').replaceAll('÷','/');
    assert(/^[\d\s()+*/.\-=＝]+$/.test(equation));
    const [left,right]=equation.split('＝');
    assert(Math.abs(vm.runInNewContext(left)-vm.runInNewContext(right))<1e-9,q.main+' / '+q.answer);
  }else{
    const [groups,each]=q.main.match(/\d+/g).map(Number);
    assert.equal(Number(q.answer),q.main.includes('餘數')?groups%each:groups*each,q.main);
  }
}
console.log('Independently checked 1,000 arithmetic answers.');
const fresh=()=>({settings:app.normalizeSettings({}),sessions:[],reflections:[],reviewQueue:[],recent:{}});
assert.equal(app.normalizeSettings({}).autoNext,false);
for(const size of [5,8,10]){
  const d=fresh();d.settings.roundSize=size;app.setData(d);app.setSubject('english');app.start('letters');
  assert.equal(app.getSession().items.length,size);
  for(let i=0;i<size;i++){
    const s=app.getSession(),q=s.items[s.idx];
    app.answer(q.choices.indexOf(q.answer));
    app.answer(q.choices.indexOf(q.answer)); // A double tap must not score twice.
    assert.equal(s.correct,i+1);
    assert(![...timers.values()].some(t=>t.ms>=6000),'manual mode must not schedule advance');
    app.next();
  }
  assert.equal(app.getPage(),'result');
  assert.equal(app.getData().sessions.length,1);
  assert.equal(app.safeLoad().sessions[0].correct,size);
  app.finish();assert.equal(app.getData().sessions.length,1,'finish is idempotent');
}
console.log('Completed 5-, 8- and 10-question rounds; verified scores, double taps and reload persistence.');
{
  const d=fresh();d.settings.autoNext=true;app.setData(d);app.setSubject('english');app.start('letters');
  const q=app.getSession().items[0];app.answer(q.choices.indexOf(q.answer));
  assert([...timers.values()].some(t=>t.ms>=6000&&t.ms<=20000));
  app.clearAdvance();assert(![...timers.values()].some(t=>t.ms>=6000));
  app.start('letters');const q2=app.getSession().items[0];app.answer((q2.choices.indexOf(q2.answer)+1)%4);
  assert(![...timers.values()].some(t=>t.ms>=6000),'wrong answer must wait');
  assert.equal(app.getData().reviewQueue.length,1);
}
{
  const d=fresh();d.settings.autoRead=true;app.setData(d);app.start('letters');
  app.autoReadSoon();app.autoReadSoon();assert.equal([...timers.values()].filter(t=>t.ms===350).length,1);
  app.stopEnglish();assert.equal([...timers.values()].filter(t=>t.ms===350).length,0);
}
{
  const before=JSON.stringify(fresh());values.set('baseball_dualtrack_v1',before);
  const changed=fresh();changed.settings.roundSize=5;assert(app.save(changed));
  assert.equal(values.get('baseball_dualtrack_v1__previous'),before);
  const broken='{broken history';values.set('baseball_dualtrack_v1',broken);app.safeLoad();
  assert.equal(app.save(fresh()),false);assert.equal(values.get('baseball_dualtrack_v1'),broken);
  assert(app.save(fresh(),{repair:true}));assert.equal(values.get('baseball_dualtrack_v1__previous'),broken);
  const persisted=values.get('baseball_dualtrack_v1'),oldSet=storage.setItem;
  storage.setItem=()=>{throw new Error('QuotaExceededError');};
  assert.equal(app.save(changed),false);assert.equal(values.get('baseball_dualtrack_v1'),persisted);assert(app.getIssue());
  storage.setItem=oldSet;assert(app.save(changed),'storage can recover after a transient write error');
}
console.log('Verified previous snapshots, unreadable-history protection, import repair and storage-full recovery.');
{
  const profiles=app.getProfiles();profiles.list.push({id:'p2',name:'Test 2',avatar:'⚾',grade:'g1',theme:'field'});
  const original=values.get('baseball_dualtrack_v1');profiles.active='p2';app.setData(fresh());assert(app.save());
  assert.equal(values.get('baseball_dualtrack_v1'),original);assert(values.has('baseball_dualtrack_v1__p2'));
  profiles.active='p1';
}
{
  const q={skill:'zy-symbol',prompt:'聽一聽',main:'?',answer:'ㄅ',choices:['ㄅ','ㄇ','ㄉ','ㄈ'],explain:'ㄅ',zySym:'ㄅ',noReadMain:true};
  const safe=app.safeReviewQuestion(q);assert.equal(safe.zySym,'ㄅ');assert.equal(safe.noReadMain,true);
  assert.equal(app.safeReviewQuestion({...q,choices:['ㄅ','ㄅ','ㄉ','ㄈ']}),null);
}
for(const url of Object.values({...app.LETTER_RECORDINGS,...app.WORD_RECORDINGS,...app.SENTENCE_RECORDINGS})){
  assert(url.startsWith('./audio/'),'same-site audio');
  const file=url.split('?')[0],bytes=fs.readFileSync(file);
  assert(bytes.length>500,'audio exists: '+file);
  assert(bytes.subarray(0,3).toString()==='ID3'||bytes[0]===0xff,'MP3 header: '+file);
}
console.log('Verified child-profile isolation, review metadata and all 131 local English MP3 files.');
{
  const originalAudio=sandbox.Audio;
  let audioAttempts=0,voiceAttempts=0;
  sandbox.Audio=class{constructor(){audioAttempts++;}pause(){}load(){}play(){this.onerror?.();return Promise.resolve();}};
  sandbox.SpeechSynthesisUtterance=class{};
  sandbox.speechSynthesis={getVoices:()=>[],cancel(){},resume(){},speak(u){voiceAttempts++;u.onerror?.({error:'synthesis-failed'});}};
  app.playDeviceEnglish('ball',null,1,'./audio/words/ball.mp3');
  assert.equal(voiceAttempts,1);assert.equal(audioAttempts,1,'failed audio and voice must not loop');
  app.playEnglish('A');assert.equal(audioAttempts,2);assert.equal(voiceAttempts,2,'letter recording can fall back once');
  sandbox.Audio=originalAudio;delete sandbox.speechSynthesis;delete sandbox.SpeechSynthesisUtterance;
}
console.log('Verified audio/voice failures stop safely without a retry loop.');
module.exports={app,values,timers,sandbox,assert};

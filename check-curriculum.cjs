const fs=require('node:fs'),assert=require('node:assert/strict'),Module=require('node:module'),path=require('node:path');
const m=new Module(path.resolve('curriculum-sandbox.cjs'));m.filename=path.resolve('curriculum-sandbox.cjs');m.paths=module.paths;
m._compile(fs.readFileSync('check.cjs','utf8').replace('window.testApp={','window.testApp={practiceQuestions,effectiveLevel,canPractice,gradeNote,gradeCalculation,handCalculation,handWordPool,dueReviews,freshReviewQuestion,orderQuestion,spellQuestion,VOCAB,READ,WORD_USE,DEEP_READ,ZY_WORDS,ODD_BANK,RULES_BANK,'),m.filename);
const {app}=m.exports;
const p=app.getProfiles().list.find(p=>p.id===app.getProfiles().active);
let questions=0,blocked=0,orders=0;
function valid(q){assert.equal(q.choices.length,4,q.main);assert.equal(new Set(q.choices).size,4,q.main);assert.equal(q.choices.filter(x=>x===q.answer).length,1,q.main);assert(q.explain&&q.skill&&q.signature,q.main)}
function verifyCalc(q,g){
 valid(q);const [a,b]=q.main.match(/\d+/g).map(Number);
 const expected=q.main.includes('×')?a*b:q.main.includes('＋')?a+b:a-b;
 assert.equal(Number(q.answer),expected,q.main);
 if(g==='k'||g==='g1'){assert(!/[×÷]/.test(q.main),q.main);assert(expected<=(g==='k'?10:20),q.main)}
 if(g==='g2')assert(!q.main.includes('÷'),q.main);
}
for(const theme of ['field','space','princess','animals'])for(const g of ['k','g1','g2','g3']){
 p.theme=theme;p.grade=g;
 app.setData({settings:app.normalizeSettings({roundSize:5,reviewEnabled:false,english:4,math:4,science:4,logic:4,zhuyin:4}),sessions:[],reflections:[],reviewQueue:[],recent:{}});
 for(const sub of app.SUBJECT_KEYS)for(const mode of app.MODES[sub]){
  if(mode.id==='review'||mode.id==='lesson')continue;
  for(const requested of [1,2,3,4]){
   const qs=app.practiceQuestions(sub,mode.id,requested);
   if(!app.canPractice(sub,mode.id)){assert.equal(qs.length,0);blocked++;continue}
   assert(qs.length>0,g+'/'+theme+'/'+sub+'/'+mode.id);
   for(const q of qs){valid(q);questions++;
    if(sub==='math'&&mode.id==='calc'&&g!=='g3')verifyCalc(q,g);
    if(sub==='math'&&mode.id==='measure'&&g==='g2')assert(!/平方公分|24小時制|小時等於/.test(q.main),q.main);
    if(sub==='english'&&mode.id==='order'){assert.equal(q.speech,q.answer);assert(q.isListening);assert(q.prompt.includes('錄音'));orders++}
   }
  }
 }
 if(g!=='g3')for(let i=0;i<100;i++)verifyCalc(app.handCalculation(),g);
 if(g==='k'||g==='g1'){assert(!app.visibleModes('math').some(x=>x.id==='challenge'));assert(!app.canPractice('chinese','mix'))}
 const facts=app.timesBank();assert.equal(facts.length,81);assert(facts.some(q=>q.answer==='81'));
 if(g!=='g3')assert.equal(app.handWordPool().length,app.VOCAB[1].length);
 if(g==='g1'){
  const entry={id:'old-advanced',subject:'math',mode:'challenge',level:4,dueAt:0,q:{},stage:0};
  const d=app.getData();d.settings.reviewEnabled=true;d.reviewQueue=[entry];
  assert.equal(app.dueReviews('math').length,0);assert.equal(d.reviewQueue.length,1);
  app.setSubject('math');const before=app.getSession();app.start('challenge');assert.equal(app.getSession(),before);
 }
}
let sentenceCount=0;p.grade='g3';
for(const theme of ['field','space','princess','animals']){
 p.theme=theme;app.render();
 for(const lv of [1,2,3,4]){
  const corpus=[...app.READ[lv].map(x=>x[0]),...app.WORD_USE[lv].map(x=>x[0].replace('___',x[1]))]
   .filter(s=>!/[?“"]/.test(s)&&s.split(' ').length>=4&&s.split(' ').length<=(lv===1?6:lv===2?8:10));
  const used=new Set();
  for(let i=0;i<new Set(corpus).size;i++){
   const q=app.orderQuestion(lv,used);assert(!used.has(q.signature));used.add(q.signature);
   valid(q);assert.equal(q.answer,q.speech);assert(q.isListening);sentenceCount++;
  }
  for(let i=0;i<20;i++){const q=app.spellQuestion(lv,new Set());valid(q);assert(q.speech)}
 }
}
const allScience=Object.values(app.BASE_DATA.sci).flat();
const heat=allScience.find(q=>q.q.includes('皮膚很燙'));assert(heat.e.includes('119')&&heat.e.includes('意識清楚')&&heat.e.includes('不可強灌水'));
const cloud=allScience.find(q=>q.q==='雲是怎麼形成的？');assert(cloud.a.includes('冰晶')&&cloud.o.includes(cloud.a));
const moon=allScience.find(q=>q.q.includes('從平地拋出棒球'));assert(moon.q.includes('相同速度')&&moon.q.includes('忽略空氣阻力'));
assert(!allScience.some(q=>q.e.includes('減少隔天痠痛')&&!q.e.includes('不能保證')));
console.log(JSON.stringify({questions,blocked,orders,sentenceCount}));
console.log('Grade routing, independent arithmetic, handwriting, review exclusion and corrected content checks passed.');

const {app,assert}=require('./check.cjs');
const all=app.cnBank(app.CN.lessons);
assert.equal(all.length,312);assert.equal(new Set(all.map(q=>q.signature)).size,312);
for(const q of all){assert.equal(new Set(q.choices).size,4);assert(q.choices.includes(q.answer));assert(app.safeReviewQuestion(q));}
for(const l of app.CN.lessons){app.setChinese(l.semester,l.id);for(const [mode,size]of [['mix',8],['word',8],['sentence',2],['reading',3]]){const q=app.generateChineseRound(mode);assert.equal(q.length,size);assert(q.every(x=>x.cnLessonId===l.id));}}
assert.equal(app.CN.upper.verified,true);assert.equal(app.CN.lower.verified,false);
assert.equal(app.CN.lessons.find(l=>l.id==='upper-05').title,'坐竹籃船');assert.equal(app.CN.lessons.find(l=>l.id==='upper-10').title,'新年快樂');assert.equal(app.CN.lessons.find(l=>l.id==='upper-12').title,'我愛冬天');
const fresh={settings:app.normalizeSettings({autoNext:false}),sessions:[],reflections:[],reviewQueue:[],recent:{}};
app.setData(fresh);app.setChinese('upper','upper-05');app.setSubject('chinese');app.start('mix');
for(let i=0;i<8;i++){const q=app.getSession().items[i],correct=q.choices.indexOf(q.answer);app.answer(i===0?(correct+1)%4:correct);app.next();}
assert.equal(app.getPage(),'result');assert.equal(app.getData().sessions[0].correct,7);
const loaded=app.safeLoad();assert.equal(loaded.sessions[0].subject,'chinese');assert.equal(loaded.reviewQueue.length,1);assert.equal(loaded.reviewQueue[0].q.cnLessonId,'upper-05');assert(loaded.reviewQueue[0].q.courseLabel.includes('坐竹籃船'));
app.setData(loaded);app.start('review');assert.equal(app.getSession().items[0].cnLessonId,'upper-05');
app.setChinese('lower','all');assert(app.chineseView().includes('115 二下課次待核對'));assert(!app.chineseView().includes('115 二下課次已核對'));
console.log('PASS: all 312 Chinese questions, 24 lesson filters, edition labels, a completed round, reload and review metadata.');

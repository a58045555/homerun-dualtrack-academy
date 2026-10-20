
const {app,assert}=require('./check.cjs');
assert.equal(app.SCI_COURSES.courses.length,12);assert.equal(app.SCI_COURSES.courses.filter(c=>c.area==='space').length,8);assert.equal(app.SCI_COURSES.planets.length,8);
assert.deepEqual(Array.from(app.SCI_COURSES.planets,p=>p.name),['水星','金星','地球','火星','木星','土星','天王星','海王星']);
const p=app.getProfiles().list.find(p=>p.id===app.getProfiles().active);
for(const theme of ['field','princess','animals','space','field']){
 p.theme=theme;app.render();assert.equal(app.SCIENCE_BANK.space.length,24);
 assert.equal(Object.values(app.SCIENCE_BANK).reduce((n,a)=>n+a.length,0),theme==='field'?214:157);
 for(const c of app.SCI_COURSES.courses){assert.equal(c.points.length,3);assert(c.activity);assert.equal(c.questions.length,3);app.setScienceCourse(c.id);assert(app.scienceLearnPage().includes(c.title));const qs=app.generateQuestions('science','lesson',1);assert.equal(qs.length,3);assert.equal(new Set(qs.map(q=>q.signature)).size,3);for(const q of qs){assert.equal(q.sciCourseId,c.id);assert.equal(app.safeReviewQuestion(q).sciCourseId,c.id);assert.equal(new Set(q.choices).size,4);assert(q.choices.includes(q.answer))}}
 for(const lv of [1,2,3,4])for(const m of ['space','mix']){const qs=app.generateQuestions('science',m,lv);assert.equal(qs.length,8);for(const q of qs){assert(q.choices.includes(q.answer));assert.equal(new Set(q.choices).size,4)}}
}
app.setScienceCourse('space-moon');app.setSubject('science');app.start('lesson');const before=app.getData().reviewQueue.length;
let q=app.getSession().items[0];app.answer(q.choices.findIndex(x=>x!==q.answer));app.next();while(app.getPage()==='quiz'){q=app.getSession().items[app.getSession().idx];app.answer(q.choices.indexOf(q.answer));app.next()}
assert.equal(app.getData().sessions.at(-1).correct,2);assert.equal(app.getData().sessions.at(-1).total,3);assert.equal(app.getData().reviewQueue.length,before+1);assert.equal(app.getData().reviewQueue.at(-1).q.sciCourseId,'space-moon');
console.log('PASS: 12 lessons, 36 questions, 8 planets, four styles, level filters and completed course review persistence.');

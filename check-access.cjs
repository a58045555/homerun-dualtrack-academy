
const {app,assert,values,sandbox}=require('./check.cjs');
(async()=>{
 app.setGuide(true);assert(app.guideMarkup().includes('role="dialog"'));app.closeGuide();assert.equal(app.guideMarkup(),'');assert.equal(values.get('explorer_guide_v1'),'seen');
 assert(app.loginPage().includes('data-action="nav-parent"'));
 const key='homerun_parent_pin_v1',salt='12'.repeat(16),hash=await app.hashPin('123456',salt);values.set(key,JSON.stringify({v:1,salt,hash}));
 values.set('test-learning-sentinel','preserve');const untouched=JSON.stringify([...values].filter(([k])=>k!==key));
 let q=app.newParentChallenge(),answer=String(q.a+q.b);
 await assert.rejects(app.resetParentPin('999','654321','654321',q.id),/數學答案/);assert.equal(app.parentPinRecord().hash,hash);
 await assert.rejects(app.resetParentPin(answer,'654321','654322',q.id));assert.equal(app.parentPinRecord().hash,hash);
 const old=q;q=app.newParentChallenge();await assert.rejects(app.resetParentPin(String(old.a+old.b),'654321','654321',old.id),/失效/);
 answer=String(q.a+q.b);await app.resetParentPin(answer,'654321','654321',q.id);const auth=app.parentPinRecord();assert.equal(auth.hash,await app.hashPin('654321',auth.salt));assert.equal(auth.v,3);assert.equal(app.getChallenge(),null);
 assert.equal(JSON.stringify([...values].filter(([k])=>k!==key)),untouched);await assert.rejects(app.resetParentPin(answer,'777777','777777',q.id));
 q=app.newParentChallenge();const outcomes=await Promise.allSettled([app.resetParentPin(String(q.a+q.b),'777777','777777',q.id),app.resetParentPin(String(q.a+q.b),'888888','888888',q.id)]);assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(app.recoveryPanel(),'');
 console.log('PASS: math reset, incorrect answers, mismatched PINs, stale/one-use challenges, double submits and preserved learning records.');
})().catch(e=>{console.error(e);process.exitCode=1});

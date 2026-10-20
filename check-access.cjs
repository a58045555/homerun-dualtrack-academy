
const {app,assert,values,sandbox}=require('./check.cjs');
(async()=>{
 app.setGuide(true);assert(app.guideMarkup().includes('role="dialog"'));app.closeGuide();assert.equal(app.guideMarkup(),'');assert.equal(values.get('explorer_guide_v1'),'seen');
 assert(app.loginPage().includes('data-action="nav-parent"'));assert(app.loginPage().includes('data-action="guide-open"'));
 const key='homerun_parent_pin_v1',salt='12'.repeat(16),hash=await app.hashPin('123456',salt);
 values.set(key,JSON.stringify({v:1,salt,hash}));assert(!app.hasRecovery());
 const before=values.get(key);await assert.rejects(app.resetParentPin('0000000000000000','654321','654321'));assert.equal(values.get(key),before);
 await app.installRecovery(app.parentPinRecord());const code=app.getRecoveryPlain();assert(/^[A-F0-9]{4}(?:-[A-F0-9]{4}){3}$/.test(code));assert(app.hasRecovery());assert(!values.get(key).includes(app.normalizeRecovery(code)));
 const untouched=JSON.stringify([...values].filter(([k])=>k!==key));
 await assert.rejects(app.resetParentPin('WRONG','654321','654321'));assert.equal(app.parentPinRecord().hash,hash);
 await assert.rejects(app.resetParentPin(code,'654321','654322'));assert.equal(app.parentPinRecord().hash,hash);
 await app.resetParentPin(code.toLowerCase(),'654321','654321');const auth=app.parentPinRecord();assert.equal(auth.hash,await app.hashPin('654321',auth.salt));assert.notEqual(auth.hash,await app.hashPin('123456',auth.salt));assert.notEqual(app.getRecoveryPlain(),code);assert.equal(JSON.stringify([...values].filter(([k])=>k!==key)),untouched);
 await assert.rejects(app.resetParentPin(code,'777777','777777'));assert.equal(app.parentPinRecord().hash,auth.hash);
 for(let i=0;i<4;i++)await assert.rejects(app.resetParentPin('WRONG','777777','777777'));
 await assert.rejects(app.resetParentPin(app.getRecoveryPlain(),'777777','777777'),/稍後/);
 app.setParent(false);assert.equal(app.recoveryPanel(),'');
 console.log('PASS: guide, login parent entry, legacy PIN, recovery verification, new PIN, code rotation, throttling and untouched learning data.');
})().catch(e=>{console.error(e);process.exitCode=1});

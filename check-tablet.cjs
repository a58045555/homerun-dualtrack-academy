const fs=require('node:fs'),assert=require('node:assert/strict'),Module=require('node:module'),path=require('node:path');
const code=fs.readFileSync('assets/app.js','utf8'),html=fs.readFileSync('index.html','utf8');assert(!code.includes('(?<!')&&!code.includes('(?<='),'Older Safari cannot parse lookbehind literals anywhere in the script.');assert(!code.includes('.replaceAll(')&&!code.includes('.at('));
const source=fs.readFileSync('check.cjs','utf8'),marker='const app=sandbox.testApp;';
const extra='worldText,hasBaseball,applyWorld,pendingPractice,resumePractice,';
let bootstrap=source.slice(0,source.indexOf(marker)).replace('window.testApp={','window.testApp={'+extra);
// Exercise startup in a real fresh VM with these newer APIs absent; use the shipped HTML clone fallback.
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
bootstrap=bootstrap.replace('const app=sandbox.testApp;', '');bootstrap=bootstrap.replace('vm.runInContext(code.replace(',"vm.runInContext('String.prototype.replaceAll=undefined;Array.prototype.at=undefined;window.structuredClone=undefined',sandbox);vm.runInContext("+JSON.stringify(inline)+",sandbox);vm.runInContext(code.replace(");
const m=new Module(path.resolve('tablet-sandbox.cjs'));m.filename=path.resolve('tablet-sandbox.cjs');m.paths=module.paths;m._compile(bootstrap+'\nmodule.exports={app:sandbox.testApp,sandbox,element};',m.filename);const {app:a,sandbox,element}=m.exports;
assert.equal(sandbox.structuredClone({ok:true}).ok,true);
const p=a.getProfiles().list.find(p=>p.id===a.getProfiles().active);p.grade='g2';a.setData({settings:a.normalizeSettings({autoNext:false,sound:false}),sessions:[],reflections:[],reviewQueue:[],recent:{}});
const prefixes=['','地','氣','月','星','眼','棒','球','小','地球','氣球','月球','星球','眼球','⚾'];let checks=0;
const oldHas=new RegExp('棒球|壘|打擊|打者|投手|捕手|球員|球隊|教練|球場|球棒|手套|安打|全壘打|三振|保送|打序|棒次|跑者|球迷|游擊|外野|內野|觀眾席|比分|局|打數|左打|雄鷹|⚾|🧤|🏟️|🏏|(?<![地氣月星眼])球');
for(const left of prefixes)for(const right of prefixes){const text=left+'球'+right;assert.equal(a.hasBaseball(text),oldHas.test(text),text);checks++;}
for(const theme of ['field','space','princess','animals']){p.theme=theme;a.applyWorld();a.render();assert(element.innerHTML.includes('小小探索學院'));assert(!element.innerHTML.includes('網站載入時遇到問題'));
 a.setSubject('math');a.start('calc');const s=a.getSession(),q=s.items[0];a.answer(q.choices.indexOf(q.answer));assert(a.pendingPractice());assert(a.resumePractice());assert.equal(a.getSession().correct,1);
 for(const text of ['地球氣球月球星球眼球','球球球','地球球球','小球和星球']){const out=a.worldText(text,theme==='field'?'space':theme);assert(out.includes('地球')||!text.includes('地球'));assert(out.includes('氣球')||!text.includes('氣球'));assert(out.includes('月球')||!text.includes('月球'));assert(out.includes('星球')||!text.includes('星球'));assert(out.includes('眼球')||!text.includes('眼球'));}
}
console.log('PASS: no lookbehind syntax; startup, all themes, answering and resume work without replaceAll, Array.at or native structuredClone; '+checks+' independent theme-boundary checks. This does not emulate an actual iPad or its network.');

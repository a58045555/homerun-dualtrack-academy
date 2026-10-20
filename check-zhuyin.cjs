const assert=require('node:assert/strict');const {app}=require('./curriculum-runtime.cjs');
const validZy=/^(?:˙[ㄅ-ㄩ]+|[ㄅ-ㄩ]+[ˊˇˋ]?)$/;
assert.equal(app.ZHUYIN.length,37);assert.equal(new Set(app.ZHUYIN.map(z=>z.sym)).size,37);
for(const z of app.ZHUYIN){assert(z.zy.split(' ')[0].includes(z.sym),z.word);for(const s of z.zy.split(' '))assert(validZy.test(s),z.zy)}
for(const [w,zy] of [...app.ZY_SYLLABLES,...app.ZY_WORDS]){assert.equal([...w].length,zy.split(' ').length,w);for(const s of zy.split(' '))assert(validZy.test(s),w+' '+zy)}
for(const lv of [1,2,3])for(const mode of ['listen','picture','spell','tone','word']){
 const used=new Set(),expected=mode==='word'?app.ZY_WORDS.length:mode==='spell'||mode==='tone'?app.ZY_SYLLABLES.length:37;
 for(let i=0;i<expected;i++){
  const q=mode==='word'?app.zhuyinWordQuestion(lv,used):app.zhuyinQuestion(lv,mode,used);
  assert(!used.has(q.signature),mode+' skips a source row');used.add(q.signature);
  assert.equal(q.skill,{listen:'zy-symbol',picture:'zy-picture',spell:'zy-spell',tone:'zy-tone',word:'zy-word'}[mode]);
  assert.equal(new Set(q.choices).size,4);assert.equal(q.choices.filter(c=>c===q.answer).length,1);
  if(mode==='word'||mode==='spell')for(const c of q.choices)for(const s of c.split(' '))assert(validZy.test(s),c);
  if(mode==='listen')assert(!q.hint.includes('第一個音'));
 }
 assert.equal(used.size,expected);
 if(mode==='word')assert(used.has('zw-冰淇淋'),'A word containing ㄣ and ㄥ must remain teachable');
}
for(const s of ['˙ㄇㄚ','˙ㄗ','˙ㄉㄨㄛ'])for(let i=0;i<100;i++)assert(validZy.test(app.mutateSyllable(s)));
console.log('PASS: every symbol, spelling syllable and word covered at all three levels, neutral-tone position and mode identity verified.');

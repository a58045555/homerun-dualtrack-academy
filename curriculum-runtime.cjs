// Loads the same production scripts and DOM/storage stubs as check.cjs without running its test suite.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path');
const marker='const app=sandbox.testApp;';
const extra='logicPatternQuestion,orderPuzzle,assignPuzzle,guessNumberPuzzle,STORY_T,SCORE_T,storyRange,gradeStoryQuestion,kidMathQuestion,ALPHABET,ALPHA_B,englishQuestion,wordUseQuestion,confusable,zhuyinQuestion,zhuyinWordQuestion,mutateSyllable,applyWorld,worldize,questionText,grade,practiceQuestions,effectiveLevel,canPractice,gradeNote,gradeCalculation,handCalculation,handWordPool,dueReviews,freshReviewQuestion,orderQuestion,spellQuestion,challengeQuestion,storyQuestion,truthQuestion,sudokuQuestion,ZY_SYLLABLES,ZY_WORDS,VOCAB,READ,WORD_USE,DEEP_READ,ODD_BANK,RULES_BANK,GIRL_VOCAB,GIRL_READ,GIRL_USE,GIRL_DEEP,GIRL_ODD,GIRL_RULES,GIRL_SCIENCE,';
const source=fs.readFileSync(path.join(__dirname,'check.cjs'),'utf8');
if(!source.includes(marker))throw Error('Sandbox bootstrap marker missing');
const m=new Module(path.join(__dirname,'curriculum-sandbox.cjs'));m.filename=path.join(__dirname,'curriculum-sandbox.cjs');m.paths=module.paths;
m._compile(source.slice(0,source.indexOf(marker)).replace('window.testApp={','window.testApp={'+extra)+'\nmodule.exports={app:sandbox.testApp,sandbox};',m.filename);
module.exports=m.exports;

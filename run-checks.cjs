const cp=require('node:child_process'),path=require('node:path');
const args=process.argv.slice(2);if(args.some(x=>!['--quick','--http'].includes(x))||args.length>1){console.error('Usage: node run-checks.cjs [--quick | --http]');process.exit(2)}
const full=['check-curriculum.cjs','check-reviewed-content.cjs','check-english.cjs','check-chinese-audit.cjs','check-zhuyin.cjs','check-generators.cjs','check-resume.cjs','check-tablet.cjs','check-science.cjs','check-chinese.cjs','check-times.cjs','check-dictation.cjs','check-access.cjs'];
const files=args[0]==='--http'?['check-http.cjs']:args[0]==='--quick'?['check-curriculum.cjs','check-resume.cjs','check-tablet.cjs']:full;
for(const file of files){console.log('\nRunning '+file);const r=cp.spawnSync(process.execPath,[file],{cwd:__dirname,stdio:'inherit'});if(r.error){console.error(r.error.message);process.exit(1)}if(r.status!==0)process.exit(r.status||1)}console.log('\nPASS: '+files.length+' check commands.');

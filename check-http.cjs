const fs=require('node:fs');
(async()=>{
  const files=['index.html',...fs.readdirSync('assets',{recursive:true}).filter(x=>/\.(js|css)$/.test(x)).map(x=>'assets/'+x),...fs.readdirSync('audio',{recursive:true}).filter(x=>/\.(mp3|txt)$/.test(x)).map(x=>'audio/'+x.replaceAll('\\','/'))];
  for(let i=0;i<files.length;i+=8)await Promise.all(files.slice(i,i+8).map(async file=>{
    const response=await fetch('http://127.0.0.1:8765/'+file);
    if(!response.ok)throw new Error(file+': '+response.status);
    const bytes=await response.arrayBuffer();
    if(bytes.byteLength!==fs.statSync(file).size)throw new Error('Length mismatch: '+file);
  }));
  console.log('HTTP 200 and byte lengths verified for '+files.length+' site resources.');
})().catch(error=>{console.error(error);process.exitCode=1;});

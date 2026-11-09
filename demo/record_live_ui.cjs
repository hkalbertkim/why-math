/** Genuine Playwright video capture: only actual Why Math web app states and user actions. */
const {chromium}=require('../.local-tools/gstack/node_modules/playwright');
const fs=require('fs'), fsp=fs.promises,path=require('path');
const {execFileSync}=require('child_process');
const KIT=path.join(__dirname,'presentation-kit'), RAW=path.join(KIT,'recordings');
const URL='http://127.0.0.1:5173/';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function probe(file){return Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file],{encoding:'utf8'}).trim())}
async function capture(browser,name,storage,fn,hold=1500){
 const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1,recordVideo:{dir:RAW,size:{width:1280,height:720}},...(storage?{storageState:storage}:{})});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(URL,{waitUntil:'networkidle',timeout:20000});await delay(400);
 let meta={};let failure=null;
 try{meta=(await fn(page))||{};await delay(hold)}catch(e){failure=e}
 const state=await context.storageState(),video=page.video();await context.close();
 const filepath=path.join(RAW,`${name}.webm`);await fsp.copyFile(await video.path(),filepath);
 console.log('REC',name,'duration',probe(filepath).toFixed(2),JSON.stringify(meta),'JS errors',errors.length,'ERROR',failure?.message||'none',flush=true);
 if(failure||errors.length)throw failure||Error(name+' JS errors: '+errors.join('; '));
 return {state,raw:filepath,meta};
}
async function main(){
 await fsp.mkdir(RAW,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
 const data={};
 try{
  let a=await capture(browser,'home_and_a_start',null,async p=>{
   await delay(1000);
   await p.getByLabel('AI student testing mode (simulation)').check();
   await p.getByRole('button',{name:/Learner A/}).click();
   await delay(450);
   await p.getByRole('button',{name:/Start learning/}).last().click();
   await p.locator('.message.teacher').first().waitFor({timeout:12000});
   return {student:'A',first:(await p.locator('.message.teacher').first().innerText()).slice(-160)};
  },2400);data.home=a;let aState=a.state;
  a=await capture(browser,'learner_a_live',aState,async p=>{
   await delay(1200);
   await p.getByRole('button',{name:/Let AI test student respond/}).click();
   await p.waitForFunction(()=>document.querySelectorAll('.message.teacher').length>=2 && !document.querySelector('.thinking'),null,{timeout:100000});
   return {learner:(await p.locator('.message.learner').last().innerText()).slice(-280),teacher:(await p.locator('.message.teacher').last().innerText()).slice(-490),model:(await p.locator('.mode').innerText())};
  },3700);data.studentA=a;aState=a.state;
  let b=await capture(browser,'learner_b_start',null,async p=>{
   await delay(600);await p.getByLabel('AI student testing mode (simulation)').check();await p.getByRole('button',{name:/Learner B/}).click();await delay(450);await p.getByRole('button',{name:/Start learning/}).last().click();await p.locator('.message.teacher').first().waitFor({timeout:12000});return {student:'B',first:(await p.locator('.message.teacher').first().innerText()).slice(-160)};
  },1100);data.studentBstart=b;let bState=b.state;
  b=await capture(browser,'learner_b_live',bState,async p=>{
   await delay(850);await p.getByRole('button',{name:/Let AI test student respond/}).click();await p.waitForFunction(()=>document.querySelectorAll('.message.teacher').length>=2 && !document.querySelector('.thinking'),null,{timeout:100000});return {learner:(await p.locator('.message.learner').last().innerText()).slice(-280),teacher:(await p.locator('.message.teacher').last().innerText()).slice(-490),model:(await p.locator('.mode').innerText())};
  },4000);data.studentB=b;bState=b.state;
  // Real Korean UI switch and genuine model answer in an existing student session.
  let ko=await capture(browser,'korean_live',aState,async p=>{
   await delay(500);await p.getByRole('button',{name:'한국어'}).click();await p.getByRole('textbox').last().fill('0은 아무것도 없는 상태인데, 왜 숫자로 사용할 수 있는 거예요?');
   await p.getByRole('button',{name:'보내기'}).click();await p.waitForFunction(()=>document.querySelectorAll('.message.teacher').length>=3 && !document.querySelector('.thinking'),null,{timeout:100000});
   return {teacher:(await p.locator('.message.teacher').last().innerText()).slice(-500),model:(await p.locator('.mode').innerText())};
  },3800);data.korean=ko;
  // Raster counting activity. 0, 1, 2, 1, 0 using actual buttons.
  let counting=await capture(browser,'counting_real',aState,async p=>{
   await delay(650);const art=p.locator('.counting-scene');await art.scrollIntoViewIfNeeded();await delay(500);
   for (const [act,count] of [['Add one',1],['Add one',2],['Remove one',1],['Remove one',0]]){
     await p.getByRole('button',{name:new RegExp(act)}).click();await delay(1150);
     const txt=(await p.locator('.counting-big-number').innerText()).trim();console.log('COUNT',count,txt);
     if(Number(txt.split(/\s/)[0])!==count)throw Error('Count failed '+act);
   }
   return {sequence:'0→1→2→1→0',final:(await p.locator('.counting-big-number').innerText())};
  },1500);data.counting=counting;
  // User-recorded chapter activities & textbook evidence in both sessions.
  let tA=await capture(browser,'textbook_a',aState,async p=>{await delay(600);await p.locator('.textbook-page').scrollIntoViewIfNeeded();await delay(700);await p.locator('.teaching-notes summary').click();return {student:'A',evidence:(await p.locator('.teaching-observation').last().innerText()).slice(-260)}},2100);data.textbookA=tA;
  let tB=await capture(browser,'textbook_b',bState,async p=>{await delay(600);await p.locator('.textbook-page').scrollIntoViewIfNeeded();await delay(700);await p.locator('.teaching-notes summary').click();return {student:'B',evidence:(await p.locator('.teaching-observation').last().innerText()).slice(-260)}},2100);data.textbookB=tB;
  // A real app end screen after an actual lesson; no mock UI.
  let end=await capture(browser,'app_close',aState,async p=>{await delay(700);await p.locator('.book-cover').scrollIntoViewIfNeeded();return {student:'A',title:await p.locator('.book-cover h3').innerText()}},3000);data.close=end;
  const summary={date:new Date().toISOString(),scenes:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,{path:v.raw,duration:probe(v.raw),meta:v.meta}]))};
  fs.writeFileSync(path.join(RAW,'capture-evidence.json'),JSON.stringify(summary,null,2));
  console.log('CAPTURE_COMPLETE',Object.keys(data).length,JSON.stringify(summary.scenes).slice(0,350));
 }finally{await browser.close();}
}
main().catch(e=>{console.error('CAPTURE_FATAL',e.stack);process.exit(1)});

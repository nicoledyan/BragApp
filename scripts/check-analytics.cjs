const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname, '../assets/analytics.js'),'utf8');
function boot(host='bragbag.app',choice=null,session=new Map(),referrer='https://www.google.com/search?q=private',search='?email=private@example.com&utm_source=instagram&utm_campaign=launch-1'){
 const store=new Map(choice?[['brag_website_analytics',choice]]:[]), scripts=[], captures=[], handlers={}, choices={};let options;
 const element=()=>({hidden:false,addEventListener(name,fn){this[name]=fn;},focus(){},setAttribute(){},appendChild(){},querySelector(selector){return choices[selector]??=(element());}});
 const panel=element();const sdk={register(){},opt_in_capturing(){},opt_out_capturing(){this.stopped=true;},capture(event,properties){const value=options.before_send({event,properties});if(value)captures.push(value);}};
 const doc={referrer,body:{appendChild(){}},head:{appendChild(s){scripts.push(s);}},createElement(tag){return tag==='section'?panel:element();},querySelector(){return element();},addEventListener(n,fn){handlers[n]=fn;}};
 const location={hostname:host,host,pathname:'/brag-book/',origin:'https://'+host,search,href:'https://'+host+'/brag-book/'};
 const window={BRAG_ANALYTICS:{token:'test',host:'https://us.i.posthog.com'},posthog:{init(token,opt){options=opt;opt.loaded(sdk);}}};
 vm.runInNewContext(source,{window,document:doc,location,URL,URLSearchParams,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},sessionStorage:{getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)}});
 return {session,window,scripts,captures,handlers,choices,panel,sdk,store,get options(){return options;}};
}
let a=boot();assert.equal(a.scripts.length,0);a.choices['[data-analytics-accept]'].click();assert.equal(a.scripts.length,1);a.scripts[0].onload();assert.equal(a.captures.length,1);assert.equal(a.captures[0].event,'$pageview');assert(!JSON.stringify(a.captures).includes('private'));assert.equal(a.options.disable_session_recording,true);assert.equal(a.options.autocapture,false);
a.window.bragTrack('template_copied',{resource:'brag-book-template',clipboard:'secret'});assert.equal(a.captures.at(-1).properties.clipboard,undefined);
a.handlers.click({target:{closest(){return {href:'https://apps.apple.com/us/app/brag/id6760629486',dataset:{},closest(){return null;}}}}});assert.equal(a.captures.at(-1).event,'app_store_clicked');
let count=a.captures.length;a.choices['[data-analytics-decline]'].click();a.window.bragTrack('app_store_clicked');assert.equal(a.captures.length,count);assert(a.sdk.stopped);
let b=boot('127.0.0.1');assert.equal(b.scripts.length,0);assert.equal(b.window.bragTrack,undefined);
let c=boot('bragbag.app','declined');assert.equal(c.scripts.length,0);assert(c.panel.hidden);
let d=boot();d.choices['[data-analytics-accept]'].click();d.choices['[data-analytics-decline]'].click();d.scripts[0].onload();assert.equal(d.captures.length,0);
let e=boot('bragbag.app','accepted');assert.equal(e.scripts.length,1);e.scripts[0].onload();assert.equal(e.captures.length,1);assert.equal(e.options.before_send({event:'$pageview',properties:{token:'project',distinct_id:'visitor',email:'secret'}}).properties.token,'project');
let next=boot('bragbag.app','accepted',e.session,'https://bragbag.app/','');next.scripts[0].onload();assert.equal(next.captures[0].properties.utm_source,'instagram');assert.equal(next.captures[0].properties.referrer_host,'www.google.com');
assert.equal(a.options.before_send({event:'$pageview',properties:{token:'project',distinct_id:'visitor',email:'secret'}}),null);
console.log('PASS: consent gating, returning consent, local-preview exclusion, opt-out, loading race, URL scrubbing, template privacy, and App Store click capture. No network events sent.');

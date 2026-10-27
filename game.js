(()=>{
"use strict";
const canvas=document.getElementById("world"),ctx=canvas.getContext("2d"),get=id=>document.getElementById(id);
const SIZE=32,TW=86,TH=43,STORE="civ-influence-v3";
const PALETTE={player:"#f2ca7e",rival:"#d7796c",ally:"#8cd2c8",contested:"#ede0ac"};
let width=0,height=0,dpr=1,scale=1,camera={x:0,y:0},selected=null,menu="",moving=null,pointer=null,toastUntil=0;
const paths={science:"🔬 Science",arts:"🎭 Arts",faith:"⛪ Faith",war:"⚔ War"};
const techs={
 agriculture:{name:"Agriculture",cost:6,desc:"Reveal fertile fields and cultivate renewable food."},
 geology:{name:"Geology",cost:10,desc:"Reveal stone reserves hidden among the hills."},
 writing:{name:"Writing",cost:15,need:"agriculture",desc:"Develop libraries for more research."},
 husbandry:{name:"Animal Husbandry",cost:21,need:"agriculture",desc:"Reveal wild herds and create renewable pastures."},
 metalworking:{name:"Metalworking",cost:28,need:"geology",desc:"Reveal ore deposits and develop metals."},
 engineering:{name:"Engineering",cost:37,need:"geology",desc:"Increase yields from all worked resource tiles. Unlock stronger workshops."},
 hunting:{name:"Hunting",cost:10,desc:"Unlock Hunting Lodge. Foragers collect extra food."},
 scouting:{name:"Scouting",cost:12,desc:"Unlock Scout units and Lookout towers to uncover more land."},
 toolmaking:{name:"Toolmaking",cost:15,need:"geology",desc:"Unlock Workshop (+wood, +stone and construction productivity)."},
 archery:{name:"Archery",cost:23,need:"hunting",desc:"Unlock Archery Range and Archer units."},
 drill:{name:"Military Training",cost:26,need:"toolmaking",desc:"Unlock Training Grounds and Spearmen."},
 masonry:{name:"Masonry",cost:27,need:"geology",desc:"Unlock stone Walls for city defence."}
};
const buildings={
 house:{name:"Housing",icon:"🏘",wood:12,stone:0,work:5,desc:"Increases population capacity by four."},
 granary:{name:"Granary",icon:"🌾",wood:14,stone:5,work:7,desc:"Gives +1 food on each worked food tile."},
 sawmill:{name:"Sawmill",icon:"🪵",wood:16,stone:5,work:7,desc:"Gives +1 wood on each worked forest tile."},
 stoneworks:{name:"Stoneworks",icon:"🪨",wood:14,stone:12,work:8,need:"geology",desc:"Gives +1 stone from a worked quarry."},
 library:{name:"Library",icon:"📚",wood:20,stone:12,work:9,need:"writing",desc:"Produces three research per year."},
 stable:{name:"Stables",icon:"🐎",wood:16,stone:8,work:8,need:"husbandry",desc:"Improves livestock and pasture output."},
 forge:{name:"Forge",icon:"🔥",wood:20,stone:20,work:10,need:"metalworking",desc:"Smelts ore into metal and boosts extraction."},
 academy:{name:"Academy",icon:"🔬",wood:30,stone:25,work:12,path:"science",desc:"Research faster and expand the science sphere."},
 theatre:{name:"Theatre",icon:"🎭",wood:26,stone:20,work:12,path:"arts",desc:"Creates cultural influence on neighbouring cities."},
 temple:{name:"Temple",icon:"⛪",wood:25,stone:22,work:12,path:"faith",desc:"Spreads your faith and can convert nearby cities."},
 barracks:{name:"Barracks",icon:"🛡",wood:24,stone:22,work:10,path:"war",desc:"Improves attacks and defence."},
 huntingLodge:{name:"Hunting Lodge",icon:"🏕️",wood:10,stone:0,work:6,need:"hunting",desc:"+2 food from worked wild-food tiles."},
 lookout:{name:"Lookout Tower",icon:"🔭",wood:14,stone:6,work:7,need:"scouting",desc:"+2 city vision range and +1 defence."},
 workshop:{name:"Workshop",icon:"🛠️",wood:18,stone:8,work:9,need:"toolmaking",desc:"+1 wood and stone output; +1 building work each year."},
 range:{name:"Archery Range",icon:"🏹",wood:19,stone:7,work:8,need:"archery",desc:"Unlocks Archer training and improves ranged troops."},
 training:{name:"Training Grounds",icon:"🛡️",wood:19,stone:12,work:9,need:"drill",desc:"Unlocks Spearmen and improves fighters."},
 walls:{name:"City Walls",icon:"🏰",wood:9,stone:27,work:11,need:"masonry",desc:"+4 city defence against sieges."},
 market:{name:"Market",icon:"🏪",wood:20,stone:12,work:9,need:"writing",desc:"+1 food yield from farms and extra city prosperity."}
};
const unitTypes={
 settler:{name:"Settler",icon:"🧭",wood:16,stone:5,food:0,work:9,strength:1,vision:2,desc:"Establish another city."},
 clubman:{name:"Clubman",icon:"🪓",wood:8,stone:0,food:3,work:4,strength:2,vision:2,desc:"Basic club-wielding fighter; available from the beginning."},
 scout:{name:"Scout",icon:"👣",wood:8,stone:0,food:4,work:5,strength:1,vision:4,need:"scouting",desc:"Explores further; can move two tiles in a year."},
 spearman:{name:"Spearman",icon:"🔱",wood:12,stone:5,food:4,work:7,strength:4,vision:2,need:"drill",requires:"training",desc:"Stronger defensive infantry."},
 archer:{name:"Archer",icon:"🏹",wood:15,stone:0,food:4,work:7,strength:3,vision:3,need:"archery",requires:"range",desc:"Ranged fighter with improved sight."},
 swordsman:{name:"Swordsman",icon:"⚔️",wood:13,stone:0,metal:3,food:5,work:9,strength:6,vision:2,need:"metalworking",requires:"forge",desc:"Advanced metal-armed infantry."},
 army:{name:"Warband",icon:"⚔️",wood:18,stone:16,metal:2,work:10,strength:4,vision:2,path:"war",desc:"Established warband used to conquer city centres."}
};
const unitDef=id=>unitTypes[id];
const fighter=u=>u&&["clubman","spearman","archer","swordsman","army"].includes(u.type);
const unitTitle=u=>unitTypes[u?.type]?.name||"Unit";
const bonusText=id=>{
 const map={agriculture:"Fertile fields",geology:"Stone quarries",writing:"Libraries and markets",husbandry:"Pastures and stables",metalworking:"Ore veins, forges and swordsmen",engineering:"More resources per tile",hunting:"Hunting Lodges",scouting:"Scouts and Lookout Towers",toolmaking:"Workshops",archery:"Archers and Archery Ranges",drill:"Spearmen and Training Grounds",masonry:"City Walls"};
 return map[id]||"New discoveries";
};
const rivals=[
 {id:"r1",x:5,y:5,name:"Ashen Hold",pop:7,owner:"rival",army:7,culture:0,faith:0,buildings:{}},
 {id:"r2",x:26,y:7,name:"Riverwatch",pop:7,owner:"rival",army:7,culture:0,faith:0,buildings:{}},
 {id:"r3",x:24,y:26,name:"Greenhaven",pop:7,owner:"rival",army:7,culture:0,faith:0,buildings:{}}
];
const dice=(x,y)=>{const v=Math.sin(x*127.1+y*311.7+42.9)*43758.5453;return v-Math.floor(v);};
const inMap=(x,y)=>x>=0&&x<SIZE&&y>=0&&y<SIZE;
const pos=(x,y)=>x+","+y;
const decode=str=>str.split(",").map(Number);
const distance=(x,y,a,b)=>Math.max(Math.abs(x-a),Math.abs(y-b));
function terrain(x,y){
 if(!inMap(x,y))return "water";
 const water=Math.sin(x*.37+y*.055)+Math.cos(y*.32-x*.09);
 if(water>1.72)return "water";
 const value=dice(Math.floor(x/2),Math.floor(y/2))*.56+dice(x,y)*.44;
 return value>.73?"forest":value<.18?"hill":"grass";
}
function deposit(x,y){
 const t=terrain(x,y),r=dice(x+17,y+31);
 if(t==="forest")return {type:"wood",max:35+Math.floor(r*45),tech:"forestry",icon:"🌲"};
 if(t==="hill")return r>.70?{type:"ore",max:14+Math.floor(r*30),tech:"metalworking",icon:"⚒"}:{type:"stone",max:25+Math.floor(r*45),tech:"geology",icon:"🪨"};
 if(t==="grass"&&r>.84)return {type:"animals",max:5+Math.floor(r*8),tech:"husbandry",icon:"🐂"};
 if(t==="grass"&&r>.43)return {type:"food",max:18+Math.floor(r*26),tech:"agriculture",icon:"🌾"};
 if(t==="grass")return {type:"forage",max:20+Math.floor(r*20),tech:"foraging",icon:"🍓"};
 return null;
}
function fresh(){
 return {version:3,year:1,tech:["foraging","forestry"],research:0,knowledge:0,culture:0,faith:0,military:0,
 resources:{food:24,wood:14,stone:6,ore:0,metal:0,animals:0},
 cities:rivals.map(r=>({...r,buildings:{}})),
 units:[{id:"u1",type:"settler",x:15,y:15,moved:false,owner:"player",strength:1}],
 works:{},builders:{},extracted:{},explored:{},path:null,project:null,researchProject:null,stage:"move",stageYear:1,events:["A lone settler enters the valley."],nextId:2,victory:null};
}
let inGame=false;
let state;
try{state=JSON.parse(localStorage.getItem(STORE))||fresh();if(state.version!==3||!Array.isArray(state.units)||!Array.isArray(state.cities))state=fresh();}catch(e){state=fresh();}
state.knowledge??=state.research;
state.builders??={};
state.explored??={};
state.researchProject??=null;
if(state.project&&!state.project.total)state.project.total=state.project.left;
if(state.researchProject&&!state.researchProject.total)state.researchProject.total=techs[state.researchProject.id]?.cost||state.researchProject.left||1;
let borders=new Map(),visible=new Set();
function currentlyVisible(x,y){return visible.has(pos(x,y));}
function explored(x,y){return !!state.explored?.[pos(x,y)];}
function updateFog(){
 visible=new Set();
 const reveal=(x,y,r)=>{
  for(let j=Math.max(0,y-r);j<=Math.min(SIZE-1,y+r);j++)
   for(let i=Math.max(0,x-r);i<=Math.min(SIZE-1,x+r);i++){
    if(distance(x,y,i,j)>r)continue;
    const key=pos(i,j);visible.add(key);state.explored[key]=1;
   }
 };
 for(const city of state.cities){
  if(city.owner==="player")reveal(city.x,city.y,Math.max(2,influenceRadius(city))+upgrade(city,"lookout")*2);
  else if(city.owner==="ally")reveal(city.x,city.y,2);
 }
 for(const unit of state.units)if(unit.owner==="player")
  reveal(unit.x,unit.y,(unitDef(unit.type)?.vision||2)+(known("scouting")&&unit.type==="settler"?1:0));
}

function myCities(){return state.cities.filter(c=>c.owner==="player");}
function firstCity(){return myCities()[0];}
function getCity(id){return state.cities.find(c=>c.id===id);}
function cityAt(x,y){return state.cities.find(c=>c.x===x&&c.y===y);}
function getUnit(id){return state.units.find(u=>u.id===id);}
function citizens(){return myCities().reduce((n,c)=>n+c.pop,0);}
function known(id){return state.tech.includes(id);}
const STAGES=["move","workers","construction","research","end"];
const stageNames={move:"Move units",workers:"Assign workers",construction:"Construct",research:"Choose tech",end:"End Year"};
function unassignedWorkers(){return myCities().reduce((n,c)=>n+freeWorkers(c),0);}
function assignedWorkers(){return myCities().reduce((n,c)=>n+cityWork(c)+builderCount(c),0);}
function builderCount(c){return Math.max(0,Math.floor(state.builders?.[c?.id]||0));}
function researchRate(){return Math.max(1,myCities().length+myCities().reduce((n,c)=>n+3*upgrade(c,"library")+6*upgrade(c,"academy"),0)+(state.path==="science"?2:0));}
function constructionRate(c,kind){
 if(!c)return 1;
 const labor=Math.min(6,builderCount(c)),materials=state.resources.wood>=12&&state.resources.stone>=7?1:0;
 const focus=state.path==="science"||state.path&&buildings[kind]?.path===state.path?1:0;
 return 1+labor+materials+focus+upgrade(c,"workshop");
}
function estimateWork(left,rate){return Math.max(1,Math.ceil(left/Math.max(1,rate)));}
function eligible(stage){
 if(stage==="move")return state.units.some(u=>u.owner==="player"&&!u.moved);
 if(stage==="workers")return myCities().some(c=>freeWorkers(c)>0&&availableWorkTiles(c).length>0);
 if(stage==="construction")return myCities().length>0&&!state.project;
 if(stage==="research")return myCities().length>0&&!state.researchProject&&Object.entries(techs).some(([id,t])=>!known(id)&&(!t.need||known(t.need)));
 return true;
}
function availableFrom(stage){
 let start=STAGES.indexOf(stage);if(start<0)start=STAGES.length-1;
 for(let i=start;i<STAGES.length;i++)if(eligible(STAGES[i]))return STAGES[i];
 return "end";
}
function syncStage(){
 // Stages guide the player but never lock actions before End Year.
 if(!STAGES.includes(state.stage)||state.stageYear!==state.year){
  state.stageYear=state.year;state.stage=availableFrom("move");
 }
}
function nextStage(){
 syncStage();
 if(state.stage==="end")return;
 state.stage=availableFrom(STAGES[STAGES.indexOf(state.stage)+1]||"end");
 menu="";save();renderUI();
}
function focusStage(stage){
 if(!STAGES.includes(stage))return;
 syncStage();state.stage=stage;
 moving=null;
 menu=stage==="move"?"units":stage==="workers"?"workers":stage==="construction"?"city":stage==="research"?"tech":"";
 save();renderUI();
}
function autoAdvance(stage){
 // Only skip when the currently highlighted stage has genuinely finished.
 if(state.stage===stage&&!eligible(stage))
  state.stage=availableFrom(STAGES[STAGES.indexOf(stage)+1]||"end");
}

function remaining(x,y){const d=deposit(x,y);return d?Math.max(0,d.max-(state.extracted[pos(x,y)]||0)):0;}
function upgrade(c,id){return (c&&c.buildings[id])||0;}
function populationCap(c){return 6+4*upgrade(c,"house");}
function influenceRadius(c){
 const n=c.pop;
 let radius=n>=34?5:n>=20?4:n>=10?3:2;
 if(c.owner==="player"&&state.path==="science"){if(state.knowledge>=35)radius++;if(state.knowledge>=130)radius++;}
 if(c.owner==="player"&&state.path==="arts"){if(state.culture>=55)radius++;if(state.culture>=150)radius++;}
 if(c.owner==="player"&&state.path==="faith"&&state.faith>=100)radius++;
 return radius;
}
function territoryScore(c,x,y){
 const d=distance(x,y,c.x,c.y),r=influenceRadius(c);
 if(d>r)return -Infinity;
 return (r-d)*10+c.pop/4+(c.owner==="player"&&state.path==="arts"?3:0);
}
function recalcBorders(){
 borders=new Map();
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  if(terrain(x,y)==="water")continue;
  const central=cityAt(x,y);
  if(central){borders.set(pos(x,y),central.id);continue;}
  let score=-Infinity,winner=null,tied=false;
  for(const c of state.cities){
   const test=territoryScore(c,x,y);
   if(test>score+.01){score=test;winner=c;tied=false;}
   else if(test!==-Infinity&&Math.abs(test-score)<.01)tied=true;
  }
  if(winner&&score!==-Infinity)borders.set(pos(x,y),tied?"contested":winner.id);
 }
 for(const key of Object.keys(state.works)){
  if(borders.get(key)!==state.works[key])delete state.works[key];
 }
 for(const city of myCities())balanceCityLabor(city);
 updateFog();
}
function controller(x,y){
 const id=borders.get(pos(x,y));
 return id==="contested"?"contested":getCity(id);
}
function cityWork(c){
 return Object.values(state.works).filter(id=>id===c.id).length;
}
function freeWorkers(c){return Math.max(0,c.pop-cityWork(c)-builderCount(c));}
function assignBuilder(cityId,delta){
 const c=getCity(cityId);if(!c||c.owner!=="player")return;
 if(delta>0&&freeWorkers(c)<1)return toast("No citizens remaining. Remove a resource worker to assign builders.");
 if(delta<0&&builderCount(c)===0)return toast("No builders are assigned.");
 state.builders[c.id]=Math.max(0,builderCount(c)+Math.sign(delta));
 record(c.name+": "+builderCount(c)+" builders assigned. Construction speed: "+constructionRate(c,state.project?.kind||"house")+" work/year.");
 autoAdvance("workers");save();renderUI();
}
function balanceCityLabor(c){
 if(c.owner!=="player")return;
 if(!Number.isFinite(state.builders[c.id]))state.builders[c.id]=0;
 state.builders[c.id]=Math.max(0,Math.floor(state.builders[c.id]));
 // If population shrinks, release builders first and then resource workers.
 while(cityWork(c)+builderCount(c)>c.pop){
  if(builderCount(c)>0)state.builders[c.id]--;
  else{const key=Object.keys(state.works).find(k=>state.works[k]===c.id);if(key)delete state.works[key];else break;}
 }
}
function availableWorkTiles(c){
 const radius=influenceRadius(c),tiles=[];
 for(let y=Math.max(0,c.y-radius);y<=Math.min(SIZE-1,c.y+radius);y++)
  for(let x=Math.max(0,c.x-radius);x<=Math.min(SIZE-1,c.x+radius);x++){
   const key=pos(x,y),d=deposit(x,y);
   if(borders.get(key)!==c.id||cityAt(x,y)||state.works[key]||!d||!known(d.tech))continue;
   if(remaining(x,y)===0&&d.type!=="food"&&d.type!=="animals")continue;
   tiles.push({x,y,kind:d.type,key});
  }
 return tiles;
}
function assignAllWorkers(){
 syncStage();

 let count=0;
 for(const c of myCities()){
  const options=availableWorkTiles(c);
  const foodTarget=Math.max(1,Math.ceil(c.pop/4));
  const totals={food:0,wood:0,stone:0,ore:0,animals:0};
  for(const [key,id] of Object.entries(state.works)){
   if(id!==c.id)continue;
   const kind=deposit(...decode(key))?.type;
   if(kind==="food"||kind==="forage")totals.food++;
   else if(kind&&totals[kind]!==undefined)totals[kind]++;
  }
  while(freeWorkers(c)>0&&options.length){
   // Choose again after each assignment to balance food with timber and stone.
   const score=t=>{
    if(t.kind==="food"||t.kind==="forage")return totals.food<foodTarget?0:9+totals.food;
    if(t.kind==="wood")return totals.wood===0?1:5+totals.wood;
    if(t.kind==="stone")return totals.stone===0?2:6+totals.stone;
    return 7+(totals[t.kind]||0);
   };
   options.sort((a,b)=>score(a)-score(b));
   const tile=options.shift();state.works[tile.key]=c.id;count++;
   const kind=tile.kind==="forage"?"food":tile.kind;totals[kind]=(totals[kind]||0)+1;
  }
 }
 if(count)record("Assigned "+count+" available worker"+(count===1?"":"s")+" to nearby resources.");
 else toast("There are no available workers or workable resource tiles.");
 autoAdvance("workers");
 if(state.stage!=="workers"&&menu==="workers")menu="";
 save();renderUI();
}
function save(){
 try{localStorage.setItem(STORE,JSON.stringify(state));return true;}
 catch(e){return false;}
}
function storedGame(){
 try{
  const data=JSON.parse(localStorage.getItem(STORE)||"null");
  if(data&&data.version===3&&Array.isArray(data.units)&&Array.isArray(data.cities))return data;
 }catch(e){}
 return null;
}
function manualSave(){
 if(save())toast("✓ Game saved on this device · Year "+state.year);
 else toast("Could not save. Check your browser storage settings.");
}
function showMainMenu(){
 menu="";moving=null;
 const stored=storedGame();
 const screen=get("startScreen");
 get("continueGame").disabled=!stored;
 get("backToGame").hidden=!inGame;
 get("menuStatus").textContent=stored
  ?"Saved game available · Year "+stored.year+(stored.cities.some(c=>c.owner==="player")?" · "+(stored.cities.find(c=>c.owner==="player")?.name||"Your civilisation"):" · One settler")
  :"No saved game yet — choose Play to begin.";
 screen.classList.remove("hidden");
 renderUI();
}
function closeMainMenu(){
 get("startScreen").classList.add("hidden");
 renderUI();
}
function playNewGame(){
 if(storedGame()&&!window.confirm("Start a new game? This replaces the saved civilisation on this device."))return;
 state=fresh();moving=null;selected=null;menu="";recalcBorders();center(15,15);
 const ok=save();
 inGame=true;
 closeMainMenu();
 if(!ok)toast("New game started, but browser storage is unavailable.");
}
function continueGame(){
 const saved=storedGame();
 if(!saved){
  get("menuStatus").textContent="No valid saved game was found. Choose Play to begin.";
  get("continueGame").disabled=true;
  return;
 }
 state=saved;
 state.knowledge??=state.research||0;
 state.researchProject??=null;
 if(state.project&&!state.project.total)state.project.total=state.project.left;
 if(state.researchProject&&!state.researchProject.total)state.researchProject.total=techs[state.researchProject.id]?.cost||state.researchProject.left||1;
 selected=null;moving=null;menu="";recalcBorders();
 const unit=state.units.find(u=>u.owner==="player"&&u.type==="settler")||state.units.find(u=>u.owner==="player");
 const city=state.cities.find(c=>c.owner==="player");
 center(unit?.x??city?.x??15,unit?.y??city?.y??15);
 inGame=true;
 closeMainMenu();
 toast("Continued saved game · Year "+state.year);
}
function toast(msg){get("toast").textContent=msg;get("toast").classList.add("show");toastUntil=Date.now()+2900;}
function record(msg){state.events.unshift("Year "+state.year+": "+msg);state.events=state.events.slice(0,25);toast(msg);}
function found(u){
 syncStage();
 if(!u||u.type!=="settler")return;if(u.moved)return toast("This settler has already acted this year.");
 if(terrain(u.x,u.y)==="water"||state.cities.some(c=>distance(c.x,c.y,u.x,u.y)<=3)){toast("Settle on land at least four tiles from another city.");return;}
 const c={id:"c"+state.nextId++,x:u.x,y:u.y,name:myCities().length?"New Settlement "+state.nextId:"New Haven",pop:3,owner:"player",army:1,culture:0,faith:0,buildings:{}};
 state.cities.push(c);state.units=state.units.filter(a=>a.id!==u.id);moving=null;
 selected={x:c.x,y:c.y};recalcBorders();record(c.name+" was founded. Its people now work the surrounding land.");autoAdvance("move");save();menu="";renderUI();
}
function workTile(x,y){
 syncStage();
 const c=controller(x,y),d=deposit(x,y),key=pos(x,y);
 if(!c||c==="contested"||c.owner!=="player"){toast("Outside your city's influence border.");return;}
 if(cityAt(x,y)){toast("City developments are built inside the city tile.");return;}
 if(!d){toast("There is no accessible resource on that tile.");return;}
 if(!known(d.tech)){toast("Research "+(techs[d.tech]?.name||d.tech)+" to identify and use this resource.");return;}
 if(state.works[key]){delete state.works[key];record("A worker leaves the "+d.type+" tile.");save();renderUI();return;}

 if(freeWorkers(c)<=0){toast("All citizens already have jobs.");return;}
 if(remaining(x,y)<=0&&d.type!=="animals"&&d.type!=="food"){toast("This deposit is exhausted.");return;}
 state.works[key]=c.id;record(c.name+" assigns one worker to "+d.type+".");autoAdvance("workers");if(state.stage!=="workers"&&(menu==="workers"||menu==="tile"))menu="";save();renderUI();
}
function harvestResources(){
 const gains={food:0,wood:0,stone:0,ore:0,animals:0};
 for(const [key,id] of Object.entries(state.works)){
  const c=getCity(id),[x,y]=decode(key),d=deposit(x,y);
  if(!c||c.owner!=="player"||borders.get(key)!==id||!d||!known(d.tech)){delete state.works[key];continue;}
  let output=d.type==="wood"?3+upgrade(c,"sawmill")+upgrade(c,"workshop"):d.type==="stone"?2+upgrade(c,"stoneworks")+upgrade(c,"workshop"):d.type==="ore"?2+upgrade(c,"forge"):d.type==="animals"?1+upgrade(c,"stable"):d.type==="food"?4+upgrade(c,"granary")+upgrade(c,"market"):4+upgrade(c,"granary")+2*upgrade(c,"huntingLodge");
  if(known("engineering"))output++;
  if(d.type==="food"&&known("agriculture")){gains.food+=output;continue;}
  if(d.type==="animals"&&known("husbandry")){
   if(remaining(x,y)<=0)continue;
   if(!state.extracted[key])state.extracted[key]=1; // domestication uses one wild animal
   gains.food+=1; if(state.year%3===0)gains.animals+=1+upgrade(c,"stable");
   continue;
  }
  const extracted=Math.min(output,remaining(x,y));
  state.extracted[key]=(state.extracted[key]||0)+extracted;
  gains[d.type==="forage"?"food":d.type]+=extracted;
  // Exhausted natural deposits release the worker for reassignment next year.
  if(remaining(x,y)===0)delete state.works[key];
 }
 for(const [r,n] of Object.entries(gains))state.resources[r]+=n;
 const forges=myCities().reduce((n,c)=>n+upgrade(c,"forge"),0);
 const smelt=Math.min(forges,Math.floor(state.resources.ore/3),state.resources.wood);
 if(smelt>0){state.resources.ore-=smelt*3;state.resources.wood-=smelt;state.resources.metal+=smelt;}
 return gains;
}
function progressBuilding(){
 const p=state.project;if(!p)return;
 const c=getCity(p.city);if(!c||c.owner!=="player"){state.project=null;return;}
 const progress=constructionRate(c,p.kind);
 p.left=Math.max(0,p.left-progress);p.rate=progress;
 if(p.left===0){
  if(unitDef(p.kind)){
   const d=unitDef(p.kind);
   state.units.push({id:"u"+state.nextId++,type:p.kind,x:c.x,y:c.y,moved:true,owner:"player",strength:d.strength+upgrade(c,"training")+(p.kind==="archer"?upgrade(c,"range"):0)});
   updateFog();
  }else{
   c.buildings[p.kind]=(c.buildings[p.kind]||0)+1;
   if(p.kind==="lookout")updateFog();
  }
  record((buildings[p.kind]?.name||unitDef(p.kind)?.name||p.kind)+" completed at "+c.name+".");state.project=null;
 }
}
function changePopulation(){
 for(const c of state.cities){
  if(c.owner!=="player"){if(state.year%8===0)c.pop=Math.min(30,c.pop+1);continue;}
  if(state.resources.food===0){if(state.year%3===0)c.pop=Math.max(1,c.pop-1);continue;}
  const interval=state.path==="arts"?2:3;
  if(state.year%interval===0&&c.pop<populationCap(c)&&state.resources.food>=c.pop+5){
   const before=influenceRadius(c);c.pop++;
   if(influenceRadius(c)>before)record(c.name+" grows; its borders expand to radius "+influenceRadius(c)+".");
  }
 }
}
function pathGrowth(){
 if(state.year<100||!state.path)return;
 for(const r of state.cities.filter(c=>c.owner==="rival")){
  const near=myCities().reduce((d,c)=>Math.min(d,distance(c.x,c.y,r.x,r.y)),Infinity);
  if(state.path==="arts"&&near<=9&&state.culture>=45){
   r.culture+=2+myCities().reduce((n,c)=>n+4*upgrade(c,"theatre"),0);
   if(r.culture>=85){r.owner="player";r.name+=" · United";r.buildings={};record(r.name+" peacefully joins through culture.");}
  }
  if(state.path==="faith"&&near<=10&&state.faith>=35){
   r.faith+=2+myCities().reduce((n,c)=>n+4*upgrade(c,"temple"),0);
   if(r.faith>=75){r.owner="ally";record(r.name+" converts and becomes your faithful ally.");}
  }
 }
 if(state.victory)return;
 if(state.path==="science"&&state.knowledge>=260&&myCities().some(c=>upgrade(c,"academy")))state.victory="Science victory — knowledge reshapes the world.";
 if(state.path==="arts"&&myCities().length>=4)state.victory="Culture victory — neighbouring civilisations join you.";
 if(state.path==="faith"&&state.cities.filter(c=>c.owner==="ally").length>=3)state.victory="Faith victory — all neighbours embrace your beliefs.";
 if(state.path==="war"&&state.cities.filter(c=>c.owner==="rival").length===0)state.victory="War victory — the rival cities have fallen.";
 if(state.victory)record(state.victory);
}
function endYear(){
 syncStage(); // End Year is the only irreversible yearly action.
 state.year++;state.units.forEach(u=>u.moved=false);
 if(myCities().length){
  harvestResources();
  state.resources.food=Math.max(0,state.resources.food-citizens());
  const scienceGained=researchRate();state.research+=scienceGained;state.knowledge+=scienceGained;
  if(state.researchProject){
   const rp=state.researchProject;rp.progress=Math.min(rp.total,rp.progress+scienceGained);rp.rate=scienceGained;
   if(rp.progress>=rp.total){
    if(!known(rp.id))state.tech.push(rp.id);
    record(techs[rp.id].name+" discovered! Unlocks: "+bonusText(rp.id)+".");
    state.researchProject=null;
    updateFog();
   }
  }
  state.culture+=myCities().reduce((n,c)=>n+5*upgrade(c,"theatre"),0)+(state.path==="arts"?1:0);
  state.faith+=myCities().reduce((n,c)=>n+5*upgrade(c,"temple"),0)+(state.path==="faith"?1:0);
  state.military+=myCities().reduce((n,c)=>n+2*upgrade(c,"barracks"),0);
  changePopulation();for(const city of myCities())balanceCityLabor(city);progressBuilding();pathGrowth();
  if(state.resources.food===0)record("Food shortages: work more forage or fertile tiles.");
 }
 recalcBorders();state.stageYear=state.year;state.stage=availableFrom("move");menu="";save();renderUI();toast("Year "+state.year+" · Units can move again.");
}
function startConstruction(kind,cityId){
 syncStage();
 const c=getCity(cityId);if(!c||c.owner!=="player")return;
 if(state.project){toast("Only one city construction project can run at a time.");return;}
 const def=buildings[kind]||unitDef(kind);
 if(!def)return;
 if(def.need&&!known(def.need)){toast("Discover "+techs[def.need].name+" first.");return;}
 if(def.path&&state.path!==def.path){toast("This development requires a different society path.");return;}
 if(def.requires&&!upgrade(c,def.requires))return toast("Build "+buildings[def.requires].name+" in this city first.");
 for(const r of ["wood","stone","food","metal"])if(state.resources[r]<(def[r]||0)){toast("Not enough "+r+".");return;}
 for(const r of ["wood","stone","food","metal"])state.resources[r]-=def[r]||0;
 state.project={city:cityId,kind,left:def.work,total:def.work,rate:constructionRate(c,kind)};
 record(c.name+" begins "+def.name+".");autoAdvance("construction");save();renderUI();
}
function discover(id){
 syncStage();
 const t=techs[id];if(!t||known(id)||state.researchProject||(t.need&&!known(t.need)))return;
 state.researchProject={id,total:t.cost,progress:0,rate:researchRate()};
 record("Research begun: "+t.name+".");
 autoAdvance("research");menu="";save();renderUI();
}
function choosePath(id){
 if(state.year<100)return toast("Society paths unlock in Year 100.");
 if(state.path)return toast("Your civilisation has already chosen its path.");
 state.path=id;record("The civilisation adopts "+paths[id]+".");recalcBorders();save();renderUI();
}
function activeUnit(){return getUnit(moving)||state.units.find(u=>u.owner==="player"&&!u.moved)||state.units.find(u=>u.owner==="player");}
function move(x,y){
 syncStage();
 const u=activeUnit();if(!u)return toast("Select a unit first.");
 if(u.moved)return toast("This unit already moved this year.");
 if(!inMap(x,y)||terrain(x,y)==="water")return toast("That tile is impassable.");
 const step=distance(u.x,u.y,x,y),range=u.type==="scout"?2:1;
 if(step<1||step>range)return toast("This unit can move "+range+" tile"+(range===1?"":"s")+" per year.");
 if(step===2){
  const midX=Math.round((u.x+x)/2),midY=Math.round((u.y+y)/2);
  if(terrain(midX,midY)==="water")return toast("The route crosses impassable water.");
  const midway=cityAt(midX,midY);if(midway&&midway.owner==="rival")return toast("You cannot pass through a rival city.");
 }
 const occupied=cityAt(x,y);
 if(occupied&&occupied.owner==="rival")return toast("Attack rival cities from a neighbouring tile.");
 u.x=x;u.y=y;u.moved=true;selected={x,y};moving=null;menu="";updateFog();
 record((u.type==="army"?"Army":"Settler")+" moves into new terrain.");
 autoAdvance("move");
 const nextReady=state.units.find(other=>other.owner==="player"&&!other.moved);
 if(state.stage==="move"&&nextReady){
   moving=nextReady.id;
   toast("Unit moved. "+state.units.filter(other=>other.owner==="player"&&!other.moved).length+" more ready. Select another unit from the Units panel or move the highlighted unit.");
 }
 save();renderUI();
}
function attack(rivalId){
 syncStage();
 const u=activeUnit(),c=getCity(rivalId);
 if(!fighter(u)||u.moved||state.path!=="war"||!c||c.owner!=="rival")return toast("Select a ready army and a hostile city.");
 if(distance(u.x,u.y,c.x,c.y)>1)return toast("Move an army next to the rival city.");
 const offense=u.strength+Math.floor(state.military/15)+myCities().reduce((n,t)=>n+2*upgrade(t,"barracks"),0);
 const defense=c.army+Math.floor(c.pop/6);u.moved=true;
 if(offense>=defense){c.owner="player";c.name+=" · Captured";c.buildings={};c.army=2;u.strength=Math.max(1,u.strength-1);record("You conquer "+c.name+".");}
 else{u.strength--;c.army=Math.max(1,c.army-1);record("Your army is repelled by "+c.name+".");if(u.strength<=0){state.units=state.units.filter(z=>z.id!==u.id);moving=null;}}
 recalcBorders();pathGrowth();autoAdvance("move");save();renderUI();
}
function htmlSafe(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function btn(label,action,disabled=false,style="secondary"){return '<button class="'+style+'" data-action="'+action+'" '+(disabled?"disabled":"")+">"+label+"</button>";}
function item(title,desc,buttons){return '<div class="option"><strong>'+title+'</strong><p>'+desc+'</p><div class="buttons">'+buttons+"</div></div>";}
function viewedCity(){
 if(selected){const c=cityAt(selected.x,selected.y)||controller(selected.x,selected.y);if(c&&c!=="contested"&&c.owner==="player")return c;}
 return firstCity();
}
function projectLabel(){const p=state.project;if(!p)return "Nothing being built.";return (buildings[p.kind]?.name||p.kind)+" · "+p.left+"/"+p.total+" work · ~"+estimateWork(p.left,constructionRate(getCity(p.city),p.kind))+" years left";}
function researchLabel(){const p=state.researchProject;if(!p)return "No technology being researched.";return techs[p.id].name+" · "+p.progress+"/"+p.total+" work · ~"+estimateWork(p.total-p.progress,researchRate())+" years remaining";}
function panelContents(){
 let output="";
 if(menu==="turn"){
  const ready=state.units.filter(u=>u.owner==="player"&&!u.moved).length;
  output="<p class='hint'>These are suggestions, not locks. You may return to any step, or take actions out of order, until you press <b>End Year</b>. Research, building and resource production only advance when you end the year.</p>";
  const summaries={
   move:ready+" unit"+(ready===1?"":"s")+" still able to move",
   workers:unassignedWorkers()+" citizens unassigned · "+assignedWorkers()+" working",
   construction:state.project?projectLabel():"No building under construction",
   research:state.researchProject?researchLabel():"No technology being researched"
  };
  for(const stage of STAGES){
   if(stage==="end"){
    output+=item("📅 End Year","This finishes the year and advances all ongoing projects. Skipped actions will no longer be available for this year.",btn("End Year →","endYear",false,"primary"));
   }else{
    const label=(state.stage===stage?"● ":"")+stageNames[stage];
    const status=summaries[stage]+(eligible(stage)?" · Available":" · Review or rearrange");
    output+=item(label,status,btn("Open "+stageNames[stage],"focus:"+stage));
   }
  }
 }
 if(menu==="actions"){
  output="<p class='hint'>Everything is managed through one city tile and the land it influences.</p>";
  output+=item("📋 This year's actions","Return to skipped stages before ending the year.",btn("Review turn","turnMenu"));
  if(firstCity()){
   output+=item("🏛 City","Construct developments inside a city tile; one project at a time.",btn("Open city","city"));
   output+=item("🌿 Workers","Population: "+citizens()+"("+assignedWorkers()+") assigned. Assign people inside your influence borders.",btn("Manage workers","workers"));
   output+=item("🔬 Technology",researchLabel(),btn("Research","tech"));
   output+=item("♜ Society","Choose science, arts, faith or war from Year 100.",btn("Society","path"));
  }
  output+=item("🚶 Units","One movement per unit per year.",btn("Manage units","units"));
  output+=item("🧾 Chronicle","Recent events and discoveries.",btn("Open chronicle","history"));
  output+=item("🏠 Main menu","Play a new game or continue from your save.",btn("Open main menu","openMainMenu"));
  output+=item("💾 Save game","Save the current turn on this device.",btn("Save now","save"));
 }
 if(menu==="workers"){
  output="<p class='hint'>Assign every available citizen this year — one resource tile per worker. Total population: "+citizens()+"("+assignedWorkers()+") · Free: "+unassignedWorkers()+". Tap land, assign individually, or use Assign all.</p>";
  output+=item("Assign all available workers","Automatically fills nearby resource jobs, prioritising food before wood, stone and other resources.",btn("Assign all workers","assignAll",!eligible("workers"),"primary"));
  let shown=0;
  for(const c of myCities()){
   for(let y=Math.max(0,c.y-influenceRadius(c));y<=Math.min(SIZE-1,c.y+influenceRadius(c));y++)
    for(let x=Math.max(0,c.x-influenceRadius(c));x<=Math.min(SIZE-1,c.x+influenceRadius(c));x++){
     if(borders.get(pos(x,y))!==c.id||cityAt(x,y))continue;
     const d=deposit(x,y),working=state.works[pos(x,y)];
     if(!d||!known(d.tech)||(!working&&remaining(x,y)===0)||shown>=14)continue;
     output+=item(d.icon+" "+d.type+" · "+x+","+y,d.type==="food"||d.type==="animals"?"Renewable when researched.":remaining(x,y)+" units remaining.",btn(working?"Remove worker":"Assign worker","work:"+x+":"+y,!working&&freeWorkers(c)===0));
     shown++;
    }
  }
  if(!shown)output+="<p class='hint'>No accessible resources are currently visible. Explore or research new technologies.</p>";
 }
 if(menu==="city"){
  const c=viewedCity();
  if(!c)return "<p class='hint'>Found a city first.</p>";
  output="<p class='hint'>"+htmlSafe(c.name)+" · Population "+c.pop+"("+cityWork(c)+") / "+populationCap(c)+" · Free citizens "+freeWorkers(c)+" · Influence radius "+influenceRadius(c)+".</p>";
  output+=item("🏗 Current project",projectLabel(),"");
  for(const [id,d] of Object.entries(buildings)){
   if((d.need&&!known(d.need))||(d.path&&state.path!==d.path))continue;
   let cost=d.wood+" wood · "+d.stone+" stone"+(d.metal?" · "+d.metal+" metal":"");
   output+=item(d.icon+" "+d.name+" ×"+upgrade(c,id),d.desc+" · "+cost+" · "+d.work+" work",btn("Construct","build:"+id+":"+c.id,!!state.project));
  }
  output+=item("🧭 Train settler","Establish a new city. 16 wood · 5 stone · 9 work.",btn("Train settler","build:settler:"+c.id,!!state.project));
  if(state.path==="war")output+=item("⚔ Recruit army","Conquer a neighbouring city. 18 wood · 16 stone · 2 metal.",btn("Recruit army","build:army:"+c.id,!!state.project));
 }
 if(menu==="tile"){
  if(!selected)return "";
  const {x,y}=selected,c=controller(x,y),d=deposit(x,y),job=state.works[pos(x,y)],capital=cityAt(x,y);
  const label=capital?"City tile":c==="contested"?"Contested border":c?c.owner==="player"?"Your influence":"Rival influence":"Wilderness";
  output="<p class='hint'>Tile "+x+", "+y+" · "+htmlSafe(label)+" · "+terrain(x,y)+"</p>";
  if(capital)output+=item("🏛 "+htmlSafe(capital.name),"Population "+capital.pop+" · Influence radius "+influenceRadius(capital),capital.owner==="player"?btn("Manage city","city"):"");
  else if(d&&known(d.tech)){
   let resource=d.type==="forage"?"wild food":d.type;
   let n=remaining(x,y);
   output+=item(d.icon+" "+resource,"Visible supply: "+n+" · "+(d.type==="food"?"Crops renew after agriculture.":d.type==="animals"?"Domestic pasture renews with animal husbandry.":"Finite resource.")+(job?" · One worker assigned.":""),c&&c!=="contested"&&c.owner==="player"?btn(job?"Remove worker":"Assign worker", "work"):"");
  }else output+=item("Unexplored potential",d?"Discover the appropriate technology to identify resources.":"No usable resource detected.","");
  if(capital&&capital.owner==="rival"&&state.path==="war")output+=item("⚔ Siege", "Move a ready army adjacent to this city to capture it.",btn("Attack city","attack:"+capital.id));
 }
 if(menu==="tech"){
  const researching=state.researchProject;
  output="<p class='hint'>"+(researching?"🔬 Research in progress: "+researchLabel():"Choose a technology. Research advances each year; only one technology can be researched at a time.")+"<br>Research production: "+researchRate()+" per year. Science knowledge: "+state.knowledge+".</p>";
  for(const [id,d] of Object.entries(techs)){
   const locked=known(id)||!!researching||(d.need&&!known(d.need));
   const active=researching?.id===id;
   output+=item((known(id)?"✓ ":active?"⏳ ":"🔬 ")+d.name,d.desc+(d.need?" · Requires "+techs[d.need].name:"")+" · "+d.cost+" research work",btn(known(id)?"Researched":active?"In progress":"Start research","tech:"+id,locked));
  }
 }
 if(menu==="path"){
  output="<p class='hint'>"+(state.year<100?"Available in Year 100 · "+(100-state.year)+" years remaining.":state.path?"Current direction: "+paths[state.path]:"Choose one direction to shape the civilisation.")+"</p>";
  const explains={science:"Knowledge increases your population's territorial reach. Win by reaching advanced research and building an Academy.",arts:"Culture expands borders and persuades nearby cities to join you.",faith:"Faith radiates outward, converting neighbouring cities into religious allies.",war:"Military conquest captures rival city tiles and their entire sphere of influence."};
  for(const [id,title] of Object.entries(paths))output+=item(title,explains[id],btn(state.path===id?"Chosen":"Choose "+title,"path:"+id,state.year<100||!!state.path));
  output+=item("Society progress","Knowledge "+state.knowledge+" · Culture "+state.culture+" · Faith "+state.faith+" · Military "+state.military,"");
 }
 if(menu==="units"){
  const ready=state.units.filter(u=>u.owner==="player"&&!u.moved).length,total=state.units.filter(u=>u.owner==="player").length;
  output="<p class='hint'>"+ready+" of "+total+" units ready. You can move <b>every unit</b> once before advancing the year. Tap a ready unit on the map (or select it below), then tap an adjacent tile. Repeat for every unit. The stage ends when all have acted or you press Next.</p>";
  for(const u of state.units.filter(u=>u.owner==="player")){
   output+=item((u.type==="army"?"⚔ Army":"🚶 Settler")+" at "+u.x+", "+u.y,u.moved?"Already moved this year":u.type==="army"?"Ready · Strength "+u.strength:"Ready to move",btn(u.moved?"Already moved":"Select to move","unit:"+u.id,u.moved)+(u.type==="settler"?btn("Found city","found:"+u.id,u.moved,"primary"):""));
  }
 }
 if(menu==="history")output=state.events.map(e=>"<div class='event'>"+htmlSafe(e)+"</div>").join("");
 if(menu==="main")output=item("Save","Your game automatically saves in this browser.",btn("Save now","save"))+item("Main menu","Play a new world or continue your save.",btn("Main menu","openMainMenu"));
 if(state.victory)output="<div class='option' id='chosen'><strong>🏆 "+htmlSafe(state.victory)+"</strong></div>"+output;
 return output;
}
function renderUI(){
 syncStage();
 const res=state.resources;
 const total=citizens(),assigned=assignedWorkers();
 get("stats").innerHTML=(firstCity()?'<span class="chip">🌾 <b>'+res.food+'</b></span><span class="chip">🪵 <b>'+res.wood+'</b></span><span class="chip">🪨 <b>'+res.stone+'</b></span><span class="chip">👥 <b>'+total+'('+assigned+')</b></span>':"")+'<span class="chip">Year <b>'+state.year+'</b></span>';
 const head=get("summary"),actions=get("actions"),rp=state.researchProject;
 if(!firstCity()){
  head.innerHTML='<div class="progress-heading">🔬 Research</div><div class="progress-caption">Found your first city to begin discovering technologies.</div>';
  head.onclick=null;head.onkeydown=null;head.style.cursor="default";
 }else{
  const title=rp?techs[rp.id]?.name||"Research":"Choose a technology";
  const percent=rp?Math.max(0,Math.min(100,Math.round(100*rp.progress/rp.total))):0;
  const description=rp?estimateWork(rp.total-rp.progress,researchRate())+' years remaining · '+rp.progress+'/'+rp.total:'Tap to select the next discovery';
  head.innerHTML='<div class="progress-heading">🔬 '+htmlSafe(title)+'</div><div class="meter"><div class="meter-fill research-fill" style="width:'+percent+'%"></div></div><div class="progress-caption">'+description+'</div>';
  head.style.cursor="pointer";head.onclick=()=>{menu="tech";renderUI();};
  head.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();menu="tech";renderUI();}};
 }
 const index=STAGES.indexOf(state.stage),stepLabel=(index+1)+' / 5 · '+stageNames[state.stage];
 const endButton=btn("End Year →","endYear",false,"primary");
 const nextButton=state.stage==="end"?"":btn("Next","nextStage");
 const stageAction=state.stage==="end"?"":btn(state.stage==="move"?"🚶 Units":state.stage==="workers"?"👥 Work":state.stage==="construction"?"🏗 Build":"🔬 Tech","stageAction");
 actions.innerHTML='<button class="stage-label" data-action="turnMenu" title="Revisit any turn step">☰ '+stepLabel+' ▾</button><div class="stage-buttons">'+stageAction+nextButton+endButton+'</div>';
 const panel=get("panel");panel.classList.toggle("open",!!menu);
 panel.innerHTML=menu?'<div class="panelhead"><strong>'+({actions:"Actions",city:"City",tile:"Map tile",tech:"Research",path:"Society",units:"Units",workers:"Workers",history:"Chronicle",main:"Game",turn:"This year"}[menu]||"Civ")+'</strong><button id="closePanel" aria-label="Close panel">×</button></div>'+panelContents():"";
 panel.querySelector("#closePanel")?.addEventListener("click",()=>{menu="";renderUI();});
 document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>doAction(b.dataset.action)));
}
function doAction(a){
 if(a==="endYear")return endYear();
 if(a==="turnMenu"){menu=menu==="turn"?"":"turn";renderUI();return;}
 if(a.startsWith("focus:"))return focusStage(a.slice(6));
 if(a==="actions"||a==="main"){menu=menu===a?"":a;renderUI();return;}
 if(["city","tile","tech","path","units","workers","history"].includes(a)){menu=a;renderUI();return;}
 if(a==="work"&&selected)return workTile(selected.x,selected.y);
 if(a==="assignAll")return assignAllWorkers();
 if(a.startsWith("work:")){const [x,y]=a.slice(5).split(":").map(Number);selected={x,y};return workTile(x,y);}
 if(a==="nextStage")return nextStage();
 if(a==="stageAction"){
  syncStage();
  if(state.stage==="end"){menu="turn";renderUI();return;}
  menu=state.stage==="move"?"units":state.stage==="workers"?"workers":state.stage==="construction"?"city":"tech";
  renderUI();return;
 }
 if(a==="save")return manualSave();
 if(a==="openMainMenu")return showMainMenu();
 if(a==="restart"){if(confirm("Start a new world and replace your save?")){state=fresh();moving=null;menu="";selected=null;recalcBorders();center(15,15);save();renderUI();}return;}
 if(a.startsWith("unit:")){moving=a.slice(5);menu="";toast("Tap one adjacent tile to move.");renderUI();return;}
 if(a.startsWith("found:"))return found(getUnit(a.slice(6)));
 if(a.startsWith("attack:"))return attack(a.slice(7));
 if(a.startsWith("tech:"))return discover(a.slice(5));
 if(a.startsWith("path:"))return choosePath(a.slice(5));
 if(a.startsWith("build:")){const [kind,id]=a.slice(6).split(":");return startConstruction(kind,id);}
}
function project(x,y){return {x:(x-y)*TW/2,y:(x+y)*TH/2};}
function center(x,y){const p=project(x,y);camera.x=p.x;camera.y=p.y;}
function screen(x,y){const p=project(x,y);return {x:(p.x-camera.x)*scale+width/2,y:(p.y-camera.y)*scale+height/2};}
function hit(screenX,screenY){
 const x=(screenX-width/2)/scale+camera.x,y=(screenY-height/2)/scale+camera.y;
 const a=Math.round(x/TW+y/TH),b=Math.round(y/TH-x/TW);
 return inMap(a,b)?{x:a,y:b}:null;
}
function polygon(points,color,outline=null){
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
 ctx.closePath();ctx.fillStyle=color;ctx.fill();
 if(outline){ctx.strokeStyle=outline;ctx.lineWidth=1;ctx.stroke();}
}
function tile(x,y,color){
 const p=screen(x,y),w=TW/2*scale,h=TH/2*scale;
 polygon([[p.x,p.y-h],[p.x+w,p.y],[p.x,p.y+h],[p.x-w,p.y]],color);
}
function tree(x,y){
 const z=scale;ctx.fillStyle="#654832";ctx.fillRect(x-3*z,y-17*z,6*z,19*z);
 for(let j=0;j<3;j++){ctx.fillStyle=["#23533a","#2d6b43","#408653"][j];ctx.beginPath();ctx.ellipse(x+(j-1)*5*z,y-(19+j*8)*z,13*z,14*z,0,0,Math.PI*2);ctx.fill();}
}
function structure(x,y,c){
 const z=scale,high=39*z,w=30*z,h=15*z;
 const roof=c.owner==="player"?"#a87c51":c.owner==="ally"?"#73a59e":"#975f54";
 polygon([[x-w,y],[x,y+h],[x,y+h-high],[x-w,y-high]],"#cbb187","#5e4d3a");
 polygon([[x,y+h],[x+w,y],[x+w,y-high],[x,y+h-high]],"#987e67","#5e4d3a");
 polygon([[x-w,y-high],[x,y-h-high],[x+w,y-high],[x,y+h-high]],roof,"#654b40");
 const count=Object.values(c.buildings).reduce((a,b)=>a+b,0);
 if(count){ctx.fillStyle="#e9ce96";ctx.fillRect(x-22*z,y-12*z,9*z,10*z);ctx.fillRect(x+13*z,y-14*z,8*z,10*z);}
 ctx.fillStyle=PALETTE[c.owner];ctx.fillRect(x-3*z,y-high-24*z,3*z,24*z);
 polygon([[x,y-high-23*z],[x+18*z,y-high-17*z],[x,y-high-12*z]],PALETTE[c.owner]);
 ctx.font="bold "+Math.max(11,14*z)+"px Georgia";ctx.textAlign="center";ctx.fillStyle="#fff4d6";
 ctx.shadowColor="#0a2416";ctx.shadowBlur=5;ctx.fillText(c.name,x,y-high-33*z);ctx.shadowBlur=0;ctx.textAlign="left";
}
function drawConstructionProgress(x,y,c){
 const p=state.project;if(!p||p.city!==c.id)return;
 const z=scale,w=Math.max(86,112*z),bh=Math.max(6,8*z),cy=y+Math.max(32,35*z);
 const pct=Math.max(0,Math.min(1,1-p.left/Math.max(1,p.total)));
 const remaining=estimateWork(p.left,constructionRate(c,p.kind));
 ctx.fillStyle="#17291fe8";ctx.fillRect(x-w/2-6,cy-24,w+12,34);
 ctx.strokeStyle="#c5a870a6";ctx.lineWidth=1;ctx.strokeRect(x-w/2-6,cy-24,w+12,34);
 ctx.textAlign="center";ctx.textBaseline="alphabetic";
 ctx.font="bold "+Math.max(10,11*z)+"px sans-serif";ctx.fillStyle="#f4dfb5";
 ctx.fillText("🏗 "+(buildings[p.kind]?.name||p.kind)+" · "+remaining+"y",x,cy-12);
 ctx.fillStyle="#495c4e";ctx.fillRect(x-w/2,cy-6,w,bh);
 ctx.fillStyle="#ebbe71";ctx.fillRect(x-w/2,cy-6,w*pct,bh);
 ctx.textAlign="left";
}
function border(x,y,id){
 if(!id)return;
 const p=screen(x,y),w=TW/2*scale,h=TH/2*scale;
 const corners=[[p.x,p.y-h],[p.x+w,p.y],[p.x,p.y+h],[p.x-w,p.y]];
 const neighbor=[[x,y-1],[x+1,y],[x,y+1],[x-1,y]];
 const ends=[[0,1],[1,2],[2,3],[3,0]];
 for(let i=0;i<4;i++){
  if(borders.get(pos(neighbor[i][0],neighbor[i][1]))===id)continue;
  ctx.beginPath();ctx.moveTo(...corners[ends[i][0]]);ctx.lineTo(...corners[ends[i][1]]);
  ctx.strokeStyle=id==="contested"?PALETTE.contested:PALETTE[getCity(id)?.owner]||PALETTE.player;
  ctx.lineWidth=Math.max(1.7,3*scale);ctx.stroke();
 }
}
function draw(){
 ctx.fillStyle="#315a68";ctx.fillRect(0,0,width,height);
 const render=[];
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const p=screen(x,y);if(p.x< -100||p.x>width+100||p.y< -120||p.y>height+130)continue;
  const t=terrain(x,y),n=Math.floor(dice(x,y)*4);
  const colors=t==="water"?["#31798a","#428797","#388091","#337887"]:t==="forest"?["#477c4f","#508858","#4a8154","#568f5a"]:t==="hill"?["#838d78","#939987","#929580","#9f9c84"]:["#81a76e","#77a267","#8baf77","#7eaa6b"];
  tile(x,y,colors[n]);const id=borders.get(pos(x,y));
  if(id){const own=id==="contested"?"contested":getCity(id)?.owner;tile(x,y,own==="player"?"#e6c87f2a":own==="rival"?"#c560472b":own==="ally"?"#80cfb622":"#e9dca731");}
  render.push({x,y,p,t});
 }
 for(const o of render)border(o.x,o.y,borders.get(pos(o.x,o.y)));
 for(const {x,y,p,t} of render){
  const z=scale;
  if(t==="forest"){tree(p.x-9*z,p.y+6*z);if(dice(x+3,y)>.45)tree(p.x+12*z,p.y+8*z);}
  if(t==="hill")polygon([[p.x-24*z,p.y+8*z],[p.x-3*z,p.y-24*z],[p.x+19*z,p.y+8*z]],"#8d9484","#697d6b");
  if(t==="water"){ctx.strokeStyle="#9ed1da60";ctx.beginPath();ctx.moveTo(p.x-13*z,p.y+1*z);ctx.lineTo(p.x+7*z,p.y+1*z);ctx.stroke();}
  const d=deposit(x,y);
  if(d&&known(d.tech)&&remaining(x,y)>0){ctx.fillStyle="#ecdfaf";ctx.font=Math.max(11,14*z)+"px sans-serif";ctx.fillText(d.icon,p.x-6*z,p.y+7*z);}
  if(state.works[pos(x,y)]){ctx.fillStyle="#ffda74";ctx.beginPath();ctx.arc(p.x+15*z,p.y+7*z,4*z,0,Math.PI*2);ctx.fill();}
  const c=cityAt(x,y);if(c){structure(p.x,p.y,c);drawConstructionProgress(p.x,p.y,c);}
 }
 for(const u of state.units){
  const p=screen(u.x,u.y),z=scale;
  ctx.fillStyle="#071a1366";ctx.beginPath();ctx.ellipse(p.x,p.y+6*z,10*z,4*z,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=u.type==="army"?"#a96054":"#e1b684";ctx.fillRect(p.x-6*z,p.y-18*z,12*z,18*z);
  ctx.fillStyle="#e8c7a3";ctx.beginPath();ctx.arc(p.x,p.y-23*z,6*z,0,Math.PI*2);ctx.fill();
  ctx.font="bold "+Math.max(10,12*z)+"px sans-serif";ctx.textAlign="center";ctx.fillStyle="#f9e4b6";ctx.fillText(u.type==="army"?"Army":"Settler",p.x,p.y-35*z);ctx.textAlign="left";
  if(state.stage==="move"&&!u.moved&&activeUnit()?.id===u.id){
   ctx.beginPath();ctx.ellipse(p.x,p.y+3*z,14*z,7*z,0,0,Math.PI*2);
   ctx.strokeStyle="#ffe28d";ctx.lineWidth=Math.max(2,2.8*z);ctx.stroke();
  }
 }
 if(selected){
  const p=screen(selected.x,selected.y);ctx.strokeStyle="#f8dc9a";ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(p.x,p.y,20*scale,10*scale,0,0,Math.PI*2);ctx.stroke();
 }
}
function resize(){
 dpr=Math.min(window.devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
}
canvas.addEventListener("pointerdown",e=>{canvas.setPointerCapture(e.pointerId);pointer={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y,moved:false};});
canvas.addEventListener("pointermove",e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(dx,dy)>8)pointer.moved=true;if(pointer.moved){camera.x=pointer.cx-dx/scale;camera.y=pointer.cy-dy/scale;}});
canvas.addEventListener("pointerup",e=>{
 if(!pointer)return;const p=pointer;pointer=null;if(p.moved)return;
 const spot=hit(e.clientX,e.clientY);if(!spot)return;
 selected=spot;
 {
  const standing=state.units.find(u=>u.owner==="player"&&u.x===spot.x&&u.y===spot.y);
  if(standing){
    if(standing.moved)toast("That unit has already moved this year. Choose another ready unit.");
    else{moving=standing.id;menu="";toast((standing.type==="army"?"Army":"Settler")+" selected. Tap an adjacent tile to move.");}
    renderUI();return;
  }
  if((state.stage==="move"||moving)&&state.units.some(u=>u.owner==="player"&&!u.moved)){move(spot.x,spot.y);return;}
 }
 menu=cityAt(spot.x,spot.y)&&cityAt(spot.x,spot.y).owner==="player"?"city":"tile";renderUI();
});
canvas.addEventListener("wheel",e=>{e.preventDefault();scale=Math.min(2.3,Math.max(.55,scale+(e.deltaY<0?.12:-.12)));},{passive:false});
let twoFinger=0;
canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(twoFinger)scale=Math.max(.55,Math.min(2.3,scale*d/twoFinger));twoFinger=d;pointer=null;}},{passive:true});
canvas.addEventListener("touchend",()=>twoFinger=0);
get("zoomIn").onclick=()=>scale=Math.min(2.3,scale+.18);
get("zoomOut").onclick=()=>scale=Math.max(.55,scale-.18);
get("menu").onclick=()=>{menu=menu==="actions"?"":"actions";renderUI();};
get("saveGame").onclick=manualSave;
get("playGame").onclick=playNewGame;
get("continueGame").onclick=continueGame;
get("backToGame").onclick=closeMainMenu;
window.addEventListener("resize",resize);
function loop(){
 if(toastUntil&&Date.now()>toastUntil){get("toast").classList.remove("show");toastUntil=0;}
 draw();requestAnimationFrame(loop);
}
resize();recalcBorders();
const unit=state.units.find(u=>u.type==="settler");
center(unit?.x||firstCity()?.x||15,unit?.y||firstCity()?.y||15);
renderUI();showMainMenu();requestAnimationFrame(loop);
})();
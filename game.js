(()=>{
"use strict";
const canvas=document.getElementById("world"),ctx=canvas.getContext("2d"),get=id=>document.getElementById(id);
const MAP_W=CIV_WORLD.W,MAP_H=CIV_WORLD.H,SIZE=MAP_W,TW=86,TH=43,STORE="civ-earth-v4",LEGACY_STORE="civ-influence-v3";
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
 house:{name:"Housing",icon:"🏘",wood:12,stone:0,work:18,desc:"Increases population capacity by four."},
 granary:{name:"Granary",icon:"🌾",wood:14,stone:5,work:22,desc:"Gives +1 food on each worked food tile."},
 sawmill:{name:"Sawmill",icon:"🪵",wood:16,stone:5,work:22,desc:"Gives +1 wood on each worked forest tile."},
 stoneworks:{name:"Stoneworks",icon:"🪨",wood:14,stone:12,work:24,need:"geology",desc:"Gives +1 stone from a worked quarry."},
 library:{name:"Library",icon:"📚",wood:20,stone:12,work:27,need:"writing",desc:"Produces three research per year."},
 stable:{name:"Stables",icon:"🐎",wood:16,stone:8,work:23,need:"husbandry",desc:"Improves livestock and pasture output."},
 forge:{name:"Forge",icon:"🔥",wood:20,stone:20,work:32,need:"metalworking",desc:"Smelts ore into metal and boosts extraction."},
 academy:{name:"Academy",icon:"🔬",wood:30,stone:25,work:44,path:"science",desc:"Research faster and expand the science sphere."},
 theatre:{name:"Theatre",icon:"🎭",wood:26,stone:20,work:40,path:"arts",desc:"Creates cultural influence on neighbouring cities."},
 temple:{name:"Temple",icon:"⛪",wood:25,stone:22,work:40,path:"faith",desc:"Spreads your faith and can convert nearby cities."},
 barracks:{name:"Barracks",icon:"🛡",wood:24,stone:22,work:34,path:"war",desc:"Improves attacks and defence."},
 huntingLodge:{name:"Hunting Lodge",icon:"🏕️",wood:10,stone:0,work:18,need:"hunting",desc:"+2 food from worked wild-food tiles."},
 lookout:{name:"Lookout Tower",icon:"🔭",wood:14,stone:6,work:22,need:"scouting",desc:"+2 city vision range and +1 defence."},
 workshop:{name:"Workshop",icon:"🛠️",wood:18,stone:8,work:28,need:"toolmaking",desc:"+1 wood and stone output; +1 building work each year."},
 range:{name:"Archery Range",icon:"🏹",wood:19,stone:7,work:28,need:"archery",desc:"Unlocks Archer training and improves ranged troops."},
 training:{name:"Training Grounds",icon:"🛡️",wood:19,stone:12,work:30,need:"drill",desc:"Unlocks Spearmen and improves fighters."},
 walls:{name:"City Walls",icon:"🏰",wood:9,stone:27,work:36,need:"masonry",desc:"+4 city defence against sieges."},
 market:{name:"Market",icon:"🏪",wood:20,stone:12,work:26,need:"writing",desc:"+1 food yield from farms and extra city prosperity."}
};
const unitTypes={
 settler:{name:"Settler",icon:"🧭",wood:16,stone:5,food:0,work:18,strength:1,vision:2,desc:"Establish another city."},
 clubman:{name:"Clubman",icon:"🪓",wood:8,stone:0,food:3,work:8,strength:2,vision:2,desc:"Basic club-wielding fighter; available from the beginning."},
 scout:{name:"Scout",icon:"👣",wood:8,stone:0,food:4,work:11,strength:1,vision:4,need:"scouting",desc:"Explores further; can move two tiles in a year."},
 spearman:{name:"Spearman",icon:"🔱",wood:12,stone:5,food:4,work:16,strength:4,vision:2,need:"drill",requires:"training",desc:"Stronger defensive infantry."},
 archer:{name:"Archer",icon:"🏹",wood:15,stone:0,food:4,work:16,strength:3,vision:3,need:"archery",requires:"range",desc:"Ranged fighter with improved sight."},
 swordsman:{name:"Swordsman",icon:"⚔️",wood:13,stone:0,metal:3,food:5,work:22,strength:6,vision:2,need:"metalworking",requires:"forge",desc:"Advanced metal-armed infantry."},
 army:{name:"Warband",icon:"⚔️",wood:18,stone:16,metal:2,work:27,strength:4,vision:2,path:"war",desc:"Established warband used to conquer city centres."}
};
const unitDef=id=>unitTypes[id];
const fighter=u=>u&&["clubman","spearman","archer","swordsman","army"].includes(u.type);
const unitTitle=u=>unitTypes[u?.type]?.name||"Unit";
const bonusText=id=>{
 const map={agriculture:"Fertile fields",geology:"Stone quarries",writing:"Libraries and markets",husbandry:"Pastures and stables",metalworking:"Ore veins, forges and swordsmen",engineering:"More resources per tile",hunting:"Hunting Lodges",scouting:"Scouts and Lookout Towers",toolmaking:"Workshops",archery:"Archers and Archery Ranges",drill:"Spearmen and Training Grounds",masonry:"City Walls"};
 return map[id]||"New discoveries";
};
const dice=(x,y)=>CIV_WORLD.noise(x,y,42);
const inMap=(x,y)=>CIV_WORLD.valid(x,y);
const pos=(x,y)=>x+","+y;
const decode=str=>str.split(",").map(Number);
const distance=(x,y,a,b)=>Math.max(Math.abs(x-a),Math.abs(y-b));
const terrain=(x,y)=>CIV_WORLD.climate(x,y);
const deposit=(x,y)=>CIV_WORLD.deposit(x,y);

const wildTypes={
 deer:{name:"Deer",icon:"🦌",hp:3,attack:1,defense:1,food:7,description:"A shy animal. Hunting yields food."},
 boar:{name:"Wild boar",icon:"🐗",hp:5,attack:3,defense:2,food:10,description:"Dangerous wild game; may injure a hunter."},
 wolf:{name:"Wolf",icon:"🐺",hp:5,attack:4,defense:2,food:4,description:"A dangerous predator that may attack nearby units."},
 raider:{name:"Rival warrior",icon:"⚔️",hp:6,attack:4,defense:3,food:4,wood:5,description:"An armed wanderer who can raid travellers and cities."},
 camel:{name:"Wild camel",icon:"🐪",hp:5,attack:2,defense:2,food:7,description:"A desert animal found in dry environments."},
 kangaroo:{name:"Kangaroo",icon:"🦘",hp:4,attack:2,defense:2,food:7,description:"Native to Australia."},
 llama:{name:"Llama",icon:"🦙",hp:4,attack:1,defense:2,food:7,description:"An Andean animal native to the South American highlands."},
 jaguar:{name:"Jaguar",icon:"🐆",hp:6,attack:4,defense:3,food:5,description:"Dangerous predator of tropical American forests."},
 bison:{name:"Bison",icon:"🦬",hp:7,attack:4,defense:3,food:14,description:"Large grazing animals of North American grasslands."},
 zebra:{name:"Zebra",icon:"🦓",hp:5,attack:2,defense:2,food:10,description:"Grazing animal from African savannas."},
 lion:{name:"Lion",icon:"🦁",hp:7,attack:5,defense:3,food:7,description:"Savanna predator capable of attacking travellers."},
 elephant:{name:"Elephant",icon:"🐘",hp:12,attack:6,defense:5,food:18,description:"Large elephant requiring several strikes to hunt."},
 tiger:{name:"Tiger",icon:"🐅",hp:8,attack:5,defense:4,food:7,description:"Dangerous predator of Asian forests."},
 bear:{name:"Bear",icon:"🐻",hp:9,attack:5,defense:4,food:10,description:"Powerful predator of cool forests."},
  village:{name:"Independent village",icon:"🏘️",hp:8,attack:3,defense:4,food:8,wood:8,stone:3,description:"An independent community. Trade, learn, befriend or raid it."}
};
function makeEncounter(type,x,y,id){
 const d=wildTypes[type];
 return {id,type,x,y,hp:d.hp,attack:d.attack,defense:d.defense,status:"neutral",learned:false,lastGift:0};
}
function initialEncounters(scenario){
 const sites=[scenario.player,...scenario.rivals],result=[],ids=new Set(sites.map(c=>pos(c.x,c.y)));
 const add=(type,x,y)=>{
  if(!inMap(x,y)||terrain(x,y)==="water"||ids.has(pos(x,y)))return false;
  if(sites.some(c=>distance(c.x,c.y,x,y)<4))return false;
  if(result.some(e=>distance(e.x,e.y,x,y)<(e.type==="village"||type==="village"?5:2)))return false;
  result.push(makeEncounter(type,x,y,"e"+(result.length+1)));
  ids.add(pos(x,y));return true;
 };
 const tryNear=(type,site,min,max,iteration)=>{
  for(let j=0;j<130;j++){
   const angle=2*Math.PI*CIV_WORLD.noise(site.x+j*7,site.y+iteration*71+j,scenario.seed%901);
   const radius=min+Math.floor(CIV_WORLD.noise(site.x+iteration*29+j*3,site.y+j*11,23)*Math.max(1,max-min+1));
   const x=site.x+Math.round(Math.cos(angle)*radius),y=site.y+Math.round(Math.sin(angle)*radius);
   if(add(type,x,y))return true;
  }return false;
 };
 for(let i=0;i<sites.length;i++){
  const site=sites[i];
  for(let n=0;n<(i===0?3:2);n++)tryNear("village",site,7,18,n+i*7);
  for(let n=0;n<6;n++){
   const ox=site.x+Math.floor((CIV_WORLD.noise(i,n*21,scenario.seed%617)-.5)*24);
   const oy=site.y+Math.floor((CIV_WORLD.noise(i*23,n*9,scenario.seed%613)-.5)*24);
   const fauna=CIV_WORLD.wildlife(ox,oy);
   tryNear(fauna||"deer",site,5,21,n+i*31);
  }
  if(i%2===0)tryNear("raider",site,12,22,i+100);
 }
 return result;
}
function unitHP(u){return Math.max(0,u.hp??unitMaxHP(u));}
function unitMaxHP(u){return 6+Math.max(0,(unitDef(u?.type)?.strength||1)-2);}
function restUnit(unitId){
 const u=state.units.find(u=>u.id===unitId&&u.owner==="player");
 if(!u)return;
 if(u.moved)return toast("This unit has already acted this year.");
 if(unitHP(u)>=unitMaxHP(u))return toast("This unit is already at full health.");
 const nearCity=myCities().some(c=>distance(c.x,c.y,u.x,u.y)<=1);
 const healed=Math.min(unitMaxHP(u)-unitHP(u),nearCity?3:2);
 u.hp=unitHP(u)+healed;u.moved=true;
 record(unitTitle(u)+" rests and recovers "+healed+" health.");
 autoAdvance("move");save();renderUI();
}
function unitAttack(u){return Math.max(1,(u.strength||unitDef(u.type)?.strength||1)+1+Math.floor((u.xp||0)/3));}
function unitDefense(u){return Math.max(1,Math.ceil((u.strength||1)/2)+1+(u.type==="spearman"?2:0));}
function cityDefense(c){return 3+Math.ceil(c.pop/2)+Math.floor((c.army||0)/3)+4*upgrade(c,"walls")+upgrade(c,"lookout")+(c.owner==="player"?state.units.filter(u=>u.owner==="player"&&fighter(u)&&distance(u.x,u.y,c.x,c.y)<=1).reduce((n,u)=>n+Math.ceil(unitDefense(u)/2),0):0);}
function cityAttack(c){return 1+Math.floor(c.pop/4)+upgrade(c,"barracks")+upgrade(c,"training");}
function encounterAt(x,y){return (state.encounters||[]).find(e=>e.x===x&&e.y===y&&e.hp>0);}
function eventRng(seed){return dice(seed*17+state.year*11,seed*31+state.year*19);}
function closestCity(x,y){return myCities().sort((a,b)=>distance(a.x,a.y,x,y)-distance(b.x,b.y,x,y))[0];}
function adjacentUnit(e,ready=false,fighting=false){
 return state.units.filter(u=>u.owner==="player"&&distance(u.x,u.y,e.x,e.y)<=1&&(!ready||!u.moved)&&(!fighting||fighter(u)))
  .sort((a,b)=>unitAttack(b)-unitAttack(a))[0];
}
function rewardSupplies(e,multiplier=1){
 const d=wildTypes[e.type],extra=known("hunting")&&e.type!=="raider"&&e.type!=="village"?2:0;
 for(const res of ["food","wood","stone"]){const n=Math.floor((d[res]||0)*multiplier)+(res==="food"?extra:0);if(n)state.resources[res]=(state.resources[res]||0)+n;}
}
function dropUnit(u,msg){
 state.units=state.units.filter(a=>a.id!==u.id);if(moving===u.id)moving=null;record(msg);
}
function grantVillageKnowledge(n){
 state.research+=n;state.knowledge+=n;
 if(state.researchProject){
  const p=state.researchProject;p.progress=Math.min(p.total,p.progress+n);
  if(p.progress>=p.total){if(!known(p.id))state.tech.push(p.id);record(techs[p.id].name+" discovered through village knowledge.");state.researchProject=null;}
 }
}
function encounterAction(id,action){
 const e=(state.encounters||[]).find(o=>o.id===id&&o.hp>0);if(!e||!currentlyVisible(e.x,e.y))return toast("This encounter is no longer in sight.");
 const ready=adjacentUnit(e,true,action==="fight"||action==="raid"),any=adjacentUnit(e,false,action==="fight"||action==="raid");
 if(!ready){return toast(any?"That unit has already acted. End Year to act again.":"Move a "+(action==="fight"||action==="raid"?"fighter":"unit")+" next to the encounter first.");}
 if(action==="learn"){
  if(e.type!=="village"||e.learned||e.status==="raided")return toast("No new knowledge is available here.");
  e.learned=true;ready.moved=true;grantVillageKnowledge(6);record("Your envoy learns local traditions: +6 research."); 
 }else if(action==="befriend"){
  if(e.type!=="village"||e.status!=="neutral")return toast("This village cannot form another pact.");
  e.status="friendly";ready.moved=true;rewardSupplies(e,.5);e.lastGift=state.year;
  state.culture+=4;record("You befriend a village: +4 culture and gifts of food and timber.");
 }else if(action==="trade"){
  if(e.type!=="village"||e.status!=="friendly"||state.year-e.lastGift<5)return toast("The village has no supplies ready to trade yet.");
  ready.moved=true;e.lastGift=state.year;rewardSupplies(e,.65);record("Friendly villagers exchange food and wood with your travellers.");
 }else if(action==="fight"||action==="raid"){
  if(action==="raid"&&e.type!=="village")return;
  if(action==="fight"&&e.type==="village")return toast("Choose raid if you wish to attack a village.");
  if(e.type==="village"&&e.status==="friendly"){state.culture=Math.max(0,state.culture-12);}
  ready.moved=true;
  const strike=unitAttack(ready)+Math.floor(eventRng(Number(id.replace(/\D/g,""))||1)*3);
  const inflicted=Math.max(1,strike-e.defense+2);
  e.hp-=inflicted;
  const retaliation=Math.max(0,e.attack+Math.floor(eventRng(ready.x*71+ready.y*13)*2)-unitDefense(ready));
  ready.hp=Math.max(0,unitHP(ready)-retaliation);
  if(e.hp<=0){
   if(e.type==="village"){
    e.status="raided";e.hp=0;
    rewardSupplies(e,1);
    const c=closestCity(e.x,e.y);
    if(c){
     c.captives=(c.captives||0)+2;
     c.unrest=(c.unrest||0)+6;
     state.culture=Math.max(0,state.culture-8);
     record("The village is seized. Two captives are taken for forced construction labour; unrest rises and culture falls.");
    }else record("The village is raided for supplies.");
   }else{rewardSupplies(e);record(unitTitle(ready)+" defeats "+wildTypes[e.type].name+". Supplies recovered.");}
   ready.xp=(ready.xp||0)+2;
   state.encounters=state.encounters.filter(item=>item.id!==id);
  }else record(unitTitle(ready)+" strikes "+wildTypes[e.type].name+" for "+inflicted+" damage. "+e.hp+" health remains.");
  if(ready.hp<=0)dropUnit(ready,unitTitle(ready)+" falls in combat.");
 }
 autoAdvance("move");updateFog();menu="";save();renderUI();
}
function spawnEncounters(){
 if(!state.encounters)state.encounters=[];
 const types=["deer","boar","wolf","raider"];
 let counts={};for(const e of state.encounters)counts[e.type]=(counts[e.type]||0)+1;
 for(let i=0;i<2;i++){
  if(state.year%3!==0&&i>0)continue;
  const chance=eventRng(i*83+41);
  const type=chance>.88?"raider":chance>.73?"wolf":chance>.45?"boar":"deer";
  if((counts[type]||0)>=(type==="raider"?7:12))continue;
  for(let t=0;t<36;t++){
   const seed=state.year*389+i*37+t*19;
   const x=1+Math.floor(eventRng(seed)*30),y=1+Math.floor(eventRng(seed+333)*30);
   if(terrain(x,y)==="water"||cityAt(x,y)||encounterAt(x,y)||state.units.some(u=>u.x===x&&u.y===y))continue;
   if(state.encounters.some(e=>e.type==="village"&&distance(e.x,e.y,x,y)<=2))continue;
   if(type==="raider"&&myCities().some(c=>distance(c.x,c.y,x,y)<4))continue;
   state.encounters.push(makeEncounter(type,x,y,"e"+state.nextEncounterId++));counts[type]=(counts[type]||0)+1;break;
  }
 }
}
function roamEnemies(){
 // Each year, hostile warriors and predators may approach the player's units.
 for(const e of state.encounters||[]){
  if(!["raider","wolf","boar","jaguar","lion","tiger","bear"].includes(e.type))continue;
  const victim=state.units.filter(u=>u.owner==="player"&&distance(u.x,u.y,e.x,e.y)<=1).sort((a,b)=>unitHP(a)-unitHP(b))[0];
  if(victim&&eventRng(e.x*7+e.y*11)>(e.type==="raider"?.32:.72)){
   const damage=Math.max(1,e.attack-unitDefense(victim)+Math.floor(eventRng(e.x*11)*2));
   victim.hp=Math.max(0,unitHP(victim)-damage);
   if(victim.hp<=0)dropUnit(victim,unitTitle(victim)+" was defeated by "+wildTypes[e.type].name+".");
   else record(wildTypes[e.type].name+" attacks "+unitTitle(victim)+" for "+damage+" damage.");
   continue;
  }
  if(e.type==="raider"&&state.year%3===0){
   const c=myCities().find(c=>distance(c.x,c.y,e.x,e.y)<=1);
   if(c){
    const roll=e.attack+Math.floor(eventRng(e.x*17+e.y*19)*5);
    if(roll>cityDefense(c)){const stolen=Math.min(state.resources.food,2+e.attack);state.resources.food-=stolen;record("Raiders breach "+c.name+"'s defences and steal "+stolen+" food.");}
    else record(c.name+" repels marauders (defence "+cityDefense(c)+").");
    continue;
   }
  }
  // Move some hostile encounters occasionally, but not onto a unit, village or city.
  if(state.year%3!==0||eventRng(e.x*53+e.y*29)<.45)continue;
  let x=e.x,y=e.y,city=closestCity(x,y);
  if(e.type==="raider"&&city&&distance(x,y,city.x,city.y)<7){
   x+=Math.sign(city.x-x);y+=Math.sign(city.y-y);
  }else{
   const a=Math.floor(eventRng(e.x*9+e.y*5)*8);
   x+=[1,1,0,-1,-1,-1,0,1][a];y+=[0,1,1,1,0,-1,-1,-1][a];
  }
  if(inMap(x,y)&&terrain(x,y)!=="water"&&!cityAt(x,y)&&!encounterAt(x,y)&&!state.units.some(u=>u.x===x&&u.y===y)){e.x=x;e.y=y;}
 }
}
function villageYearlyEffects(){
 for(const e of state.encounters||[]){
  if(e.type!=="village"||e.status!=="friendly")continue;
  if(state.year-e.lastGift>=6&&myCities().some(c=>distance(c.x,c.y,e.x,e.y)<=10)){
   rewardSupplies(e,.4);e.lastGift=state.year;
   record("A friendly village sends a small gift of supplies.");
  }
 }
 for(const c of myCities()){
  if((c.captives||0)>0){
   // Captives are not citizens: they speed construction, consume food and create unrest.
   state.resources.food=Math.max(0,state.resources.food-c.captives);
   c.unrest=(c.unrest||0)+1;
   if(c.unrest>=15&&state.year%5===0){
    c.captives--;c.unrest=Math.max(0,c.unrest-5);record("A captive escapes from "+c.name+" amid unrest.");
   }
  }else c.unrest=Math.max(0,(c.unrest||0)-1);
 }
}
function fresh(scenario=CIV_WORLD.scenario()){
 const leader=scenario.player;
 return {version:4,world:"earth",worldSeed:scenario.seed,leader:{...leader},year:1,
 tech:["foraging","forestry"],research:0,knowledge:0,culture:0,faith:0,military:0,
 resources:{food:32,wood:24,stone:14,ore:0,metal:0,animals:0},
 cities:scenario.rivals.map((c,i)=>({id:"r"+(i+1),x:c.x,y:c.y,name:c.capital,civId:c.id,civilisation:c.name,leader:c.leader,colour:c.color,pop:7,owner:"rival",army:6,culture:0,faith:0,buildings:{},growth:0,captives:0,unrest:0})),
 units:[{id:"u1",type:"settler",x:leader.x,y:leader.y,moved:false,owner:"player",strength:1,hp:6,xp:0}],
 works:{},builders:{},extracted:{},explored:{},encounters:initialEncounters(scenario),nextEncounterId:1000,
 path:null,project:null,researchProject:null,stage:"move",stageYear:1,
 events:[leader.leader+" leads "+leader.name+" from "+leader.capital+"."],nextId:2,victory:null};
}
let inGame=false;
let state;
try{state=JSON.parse(localStorage.getItem(STORE))||fresh();if(state.version!==3||!Array.isArray(state.units)||!Array.isArray(state.cities))state=fresh();}catch(e){state=fresh();}
state.knowledge??=state.research;
state.builders??={};
state.explored??={};
state.researchProject??=null;
state.encounters??=initialEncounters();
state.encounters=state.encounters.filter(e=>wildTypes[e.type]&&inMap(e.x,e.y)&&!state.cities.some(c=>c.x===e.x&&c.y===e.y)&&!state.units.some(u=>u.x===e.x&&u.y===e.y));
state.nextEncounterId??=1000;
for(const c of state.cities){c.growth??=0;c.captives??=0;c.unrest??=0;}
for(const u of state.units){u.hp??=6;u.xp??=0;}

rebalanceActiveConstruction();
if(state.researchProject&&!state.researchProject.total)state.researchProject.total=techs[state.researchProject.id]?.cost||state.researchProject.left||1;
let borders=new Map(),visible=new Set();
function currentlyVisible(x,y){return visible.has(pos(x,y));}
function explored(x,y){return !!state.explored?.[pos(x,y)];}
function updateFog(){
 visible=new Set();
 const reveal=(x,y,r)=>{
  for(let j=Math.max(0,y-r);j<=Math.min(MAP_H-1,y+r);j++)
   for(let i=Math.max(0,x-r);i<=Math.min(MAP_W-1,x+r);i++){
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
 // Builders speed up construction with diminishing returns.
 // Building materials are paid upfront, not an additional annual speed bonus.
 const builders=Math.min(6,builderCount(c));
 const labor=Math.ceil(builders/2);
 const captiveBonus=(c.captives||0)>0?1:0;
 const focus=(state.path==="science"||(state.path&&buildings[kind]?.path===state.path))?1:0;
 const workshopBonus=upgrade(c,"workshop")>0?1:0;
 return 1+labor+captiveBonus+focus+workshopBonus;
}
function rebalanceActiveConstruction(){
 const p=state.project;
 if(!p||p.balanceVersion===2)return;
 const newTotal=(buildings[p.kind]||unitDef(p.kind))?.work;
 const oldTotal=Math.max(1,Number(p.total)||Number(p.left)||1);
 if(newTotal&&newTotal>oldTotal&&p.left>0){
  // Preserve the completion percentage of projects from older saves.
  p.total=newTotal;
  p.left=Math.max(1,Math.ceil(newTotal*Math.max(0,Math.min(1,p.left/oldTotal))));
 }else p.total=oldTotal;
 p.balanceVersion=2;
}
function estimateWork(left,rate){return Math.max(1,Math.ceil(left/Math.max(1,rate)));}
function eligible(stage){
 if(stage==="move")return state.units.some(u=>u.owner==="player"&&!u.moved);
 if(stage==="workers")return myCities().some(c=>freeWorkers(c)>0);
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
 for(let y=Math.max(0,c.y-radius);y<=Math.min(MAP_H-1,c.y+radius);y++)
  for(let x=Math.max(0,c.x-radius);x<=Math.min(MAP_W-1,c.x+radius);x++){
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
 state.builders??={};
 state.explored??={};
 state.encounters??=initialEncounters();
 state.encounters=state.encounters.filter(e=>wildTypes[e.type]&&inMap(e.x,e.y)&&!state.cities.some(c=>c.x===e.x&&c.y===e.y)&&!state.units.some(u=>u.x===e.x&&u.y===e.y));
 state.nextEncounterId??=1000;
 for(const c of state.cities){c.growth??=0;c.captives??=0;c.unrest??=0;}
 for(const u of state.units){u.hp??=6;u.xp??=0;}
 rebalanceActiveConstruction();
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
   state.units.push({id:"u"+state.nextId++,type:p.kind,x:c.x,y:c.y,moved:true,owner:"player",hp:6+Math.max(0,d.strength-2),xp:0,strength:d.strength+upgrade(c,"training")+(p.kind==="archer"?upgrade(c,"range"):0)});
   updateFog();
  }else{
   c.buildings[p.kind]=(c.buildings[p.kind]||0)+1;
   if(p.kind==="lookout")updateFog();
  }
  record((buildings[p.kind]?.name||unitDef(p.kind)?.name||p.kind)+" completed at "+c.name+".");state.project=null;
 }
}
function growthGoal(c){return Math.ceil((12+c.pop*2)*(state.path==="arts"?.85:1));}
function changePopulation(foodGained=0,foodBefore=0){
 for(const c of state.cities){
  c.growth??=0;
  if(c.owner!=="player"){if(state.year%17===0)c.pop=Math.min(30,c.pop+1);continue;}
  if(state.resources.food===0){
   c.growth=Math.max(0,c.growth-2);
   if(state.year%6===0&&c.pop>1){c.pop--;record(c.name+" loses a citizen to food shortages.");}
   continue;
  }
  if(c.pop>=populationCap(c)){c.growth=Math.min(c.growth,growthGoal(c)-1);continue;}
  // Growth needs stable reserves and actual yearly food production.
  // No more automatic +1 citizens every 3 years just because the storehouse has food.
  const reserve=state.resources.food>=c.pop*3+10;
  const surplus=foodGained>=Math.ceil(c.pop*.8);
  if(!reserve||!surplus){c.growth=Math.max(0,c.growth-.35);continue;}
  c.growth+=1+(foodGained>=c.pop*2+3&&state.resources.food>=c.pop*5+16?.45:0)+upgrade(c,"granary")*.25;
  if(c.growth>=growthGoal(c)){
   c.growth=0;const before=influenceRadius(c);c.pop++;
   record(c.name+" grows to "+c.pop+" citizens after years of sustained food production.");
   if(influenceRadius(c)>before)record(c.name+"'s influence border expands to radius "+influenceRadius(c)+".");
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
 state.year++;
 if(myCities().length){
  const beforeFood=state.resources.food,production=harvestResources();
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
  changePopulation(production.food,beforeFood);for(const city of myCities())balanceCityLabor(city);progressBuilding();pathGrowth();
  if(state.resources.food===0)record("Food shortages: work more forage or fertile tiles.");
 }
 villageYearlyEffects();roamEnemies();spawnEncounters();
 state.units.forEach(u=>u.moved=false);
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
 state.project={city:cityId,kind,left:def.work,total:def.work,rate:constructionRate(c,kind),balanceVersion:2};
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
 const e=encounterAt(x,y);
 if(e&&currentlyVisible(x,y)){selected={x,y};menu="encounter";renderUI();return toast("Encounter: "+wildTypes[e.type].name+". Choose how to approach it.");}
 const occupied=cityAt(x,y);
 if(occupied&&occupied.owner==="rival")return toast("Attack rival cities from a neighbouring tile.");
 u.x=x;u.y=y;u.moved=true;selected={x,y};moving=null;menu="";updateFog();
 record(unitTitle(u)+" moves into new terrain.");
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
 if(!fighter(u)||u.moved||state.path!=="war"||!c||c.owner!=="rival"||!currentlyVisible(c.x,c.y))return toast("Select a ready army and a hostile city.");
 if(distance(u.x,u.y,c.x,c.y)>1)return toast("Move an army next to the rival city.");
 const offense=unitAttack(u)+Math.floor(state.military/18)+myCities().reduce((n,t)=>n+2*upgrade(t,"barracks"),0);
 const defense=cityDefense(c);u.moved=true;
 if(offense+Math.floor(eventRng(c.x+c.y*13)*3)>=defense){
  c.owner="player";c.name+=" · Captured";c.buildings={};c.army=2;u.xp=(u.xp||0)+3;
  record("You conquer "+c.name+" (attack "+offense+" vs defence "+defense+").");
 }else{
  const damage=Math.max(1,cityAttack(c)+Math.ceil(defense/5)-unitDefense(u));
  u.hp=Math.max(0,unitHP(u)-damage);
  c.army=Math.max(1,(c.army||1)-1);
  record("Your attack ("+offense+") fails against "+c.name+"'s defence ("+defense+"). "+unitTitle(u)+" takes "+damage+" damage.");
  if(u.hp<=0)dropUnit(u,unitTitle(u)+" falls in the siege.");
 }
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
   output+=item("🏛 City","Construct developments inside a city tile; one project at a time.",btn("🏗 Construct","city",false,"primary"));
   output+=item("🌿 Workers","Population: "+citizens()+"("+assignedWorkers()+") assigned. "+unassignedWorkers()+" still available for resources or construction.",btn("👥 Assign workers","workers",false,"primary"));
   output+=item("🔬 Technology",researchLabel(),btn("Research","tech"));
   output+=item("♜ Society","Choose science, arts, faith or war from Year 100.",btn("Society","path"));
  }
  output+=item("🗺 Explore & hunt","Clubmen can hunt animals, fight roaming warriors, or approach villages to learn, befriend or raid. Tap encounter icons on the visible map.",btn("Explore with units","units",false,"primary"));
  output+=item("🧾 Chronicle","Recent events and discoveries.",btn("Open chronicle","history"));
  output+=item("🏠 Main menu","Play a new game or continue from your save.",btn("Open main menu","openMainMenu"));
  output+=item("💾 Save game","Save the current turn on this device.",btn("Save now","save"));
 }
 if(menu==="workers"){
  const free=unassignedWorkers(),assigned=assignedWorkers();
  output='<div class="worker-counter"><span class="worker-number">'+free+'</span><span><strong>Workers remaining</strong><small>'+assigned+' assigned / '+citizens()+' citizens</small></span></div>';
  output+='<p class="hint">Assign people to resource tiles or construction. Construction is slower now: a few builders help, but additional builders have diminishing returns. 1 builder adds +1 work/year, 3 add +2, and 5 add +3. Builders cannot gather resources at the same time. Reassign before End Year.</p>';
  output+=item("🌾 Assign all resource workers","Automatically balances food, timber, stone and other visible resources. Keep citizens free if you want them building.",btn("Assign all resource workers","assignAll",!myCities().some(c=>freeWorkers(c)>0&&availableWorkTiles(c).length>0),"primary"));
  let shown=0;
  for(const c of myCities()){
   const builders=builderCount(c),speed=constructionRate(c,state.project?.kind||"house");
   output+=item("🏗 Builders — "+htmlSafe(c.name),"Builders: "+builders+" · "+cityWork(c)+" resource workers · "+freeWorkers(c)+" unassigned. Construction speed: "+speed+" work/year. "+
    (state.project&&state.project.city===c.id?estimateWork(state.project.left,speed)+" years left.":"Start a project in the City panel."),
    btn("− Remove builder","builder:"+c.id+":-1",builders===0)+btn("＋ Assign builder","builder:"+c.id+":1",freeWorkers(c)<1,"primary"));
   for(let y=Math.max(0,c.y-influenceRadius(c));y<=Math.min(MAP_H-1,c.y+influenceRadius(c));y++)
    for(let x=Math.max(0,c.x-influenceRadius(c));x<=Math.min(MAP_W-1,c.x+influenceRadius(c));x++){
     if(borders.get(pos(x,y))!==c.id||cityAt(x,y))continue;
     const d=deposit(x,y),working=state.works[pos(x,y)];
     if(!d||!known(d.tech)||(!working&&remaining(x,y)===0)||shown>=24)continue;
     const jobLabel=(working?"✓ ":"")+d.icon+" "+d.type+" · "+x+","+y;
     output+=item(jobLabel,d.type==="food"||d.type==="animals"?"Renewable after research.":remaining(x,y)+" units remaining.",
      btn(working?"− Remove worker":"＋ Assign worker","work:"+x+":"+y,!working&&freeWorkers(c)===0,working?"secondary":"primary"));
     shown++;
    }
  }
  if(!shown)output+="<p class='hint'>No accessible resources currently visible. Build units to explore or research new technologies.</p>";
 }
 if(menu==="city"){
  const c=viewedCity();
  if(!c)return "<p class='hint'>Found a city first.</p>";
  const speed=constructionRate(c,state.project?.kind||"house");
  output='<div class="worker-counter"><span class="worker-number">'+freeWorkers(c)+'</span><span><strong>Free citizens in '+htmlSafe(c.name)+'</strong><small>'+cityWork(c)+' on resources · '+builderCount(c)+' building · '+c.pop+' population</small></span></div>';
  output+='<div class="combat-stats"><span>⚔ City attack '+cityAttack(c)+'</span><span>🛡 Defence '+cityDefense(c)+'</span><span>📈 Growth '+Math.floor(c.growth||0)+'/'+growthGoal(c)+'</span></div>';
  if(c.captives)output+='<p class="hint">Captive labour: '+c.captives+' · +'+(c.captives>0?1:0)+' construction work/year · Unrest '+(c.unrest||0)+' (escape risk and food upkeep). Captives are not citizens.</p>';
  output+='<p class="hint">All developments are built inside this city tile. Buildings now take several years even with builders. Extra builders help less after the first few, so keep some citizens gathering food and materials. Only one project runs across your civilisation.</p>';
  output+=item("🏗 Current project",projectLabel()+" · Current speed "+speed+" work/year",btn("👷 Assign builders","workers",false,"primary"));
  output+='<h4 class="panel-section-title">Buildings</h4>';
  for(const [id,d] of Object.entries(buildings)){
   const techLocked=d.need&&!known(d.need),pathLocked=d.path&&state.path!==d.path;
   let cost=d.wood+" wood · "+d.stone+" stone"+(d.metal?" · "+d.metal+" metal":"");
   let lock=techLocked?"🔒 Research "+techs[d.need].name+" to unlock.":pathLocked?"🔒 Requires "+paths[d.path]+" path.":"";
   output+=item(d.icon+" "+d.name+" ×"+upgrade(c,id),d.desc+" · "+cost+" · "+d.work+" work. "+lock,
    btn(techLocked||pathLocked?"Locked":"🏗 Construct","build:"+id+":"+c.id,!!state.project||techLocked||pathLocked,techLocked||pathLocked?"secondary":"primary"));
  }
  output+='<h4 class="panel-section-title">Train units</h4>';
  for(const [id,d] of Object.entries(unitTypes)){
   const techLocked=d.need&&!known(d.need),pathLocked=d.path&&d.path!==state.path,facilityLocked=d.requires&&!upgrade(c,d.requires);
   let cost=["wood","stone","food","metal"].filter(k=>d[k]).map(k=>d[k]+" "+k).join(" · ");
   let lock=techLocked?"🔒 Needs "+techs[d.need].name+".":pathLocked?"🔒 Needs "+paths[d.path]+" path.":facilityLocked?"🔒 Build "+buildings[d.requires].name+" first.":"";
   output+=item(d.icon+" "+d.name,d.desc+" · Strength "+d.strength+" · "+cost+" · "+d.work+" work. "+lock,
    btn(techLocked||pathLocked||facilityLocked?"Locked":"Train","build:"+id+":"+c.id,!!state.project||!!techLocked||!!pathLocked||!!facilityLocked,techLocked||pathLocked||facilityLocked?"secondary":"primary"));
  }
 }

 if(menu==="encounter"){
  if(!selected)return "<p class='hint'>Select an encounter on the map.</p>";
  const e=encounterAt(selected.x,selected.y);
  if(!e||!currentlyVisible(e.x,e.y))return "<p class='hint'>The encounter is no longer visible.</p>";
  const d=wildTypes[e.type];
  const readyAny=adjacentUnit(e,true,false),readyFighter=adjacentUnit(e,true,true),close=adjacentUnit(e,false,false);
  const status=e.status==="friendly"?"Friendly":e.type==="village"?"Independent village":e.type==="raider"?"Hostile warrior":"Wildlife";
  output='<div class="encounter-heading"><span class="encounter-icon">'+d.icon+'</span><div><strong>'+d.name+'</strong><small>Location '+e.x+', '+e.y+' · '+status+'</small></div></div>';
  output+='<div class="combat-stats"><span>⚔ Attack '+e.attack+'</span><span>🛡 Defence '+e.defense+'</span><span>❤️ '+e.hp+' HP</span></div>';
  output+='<p class="hint">'+d.description+' '+(readyFighter?'Nearby fighter: '+unitTitle(readyFighter)+' · ⚔ '+unitAttack(readyFighter)+' · 🛡 '+unitDefense(readyFighter)+' · ❤️ '+unitHP(readyFighter)+' HP.':readyAny?'A friendly unit is adjacent. A fighter is needed to attack.':close?'An adjacent unit has already acted. End Year to act again.':'Move one of your units within one tile to interact.')+'</p>';
  if(e.type==="village"){
   output+=item("🤝 Befriend village","Receive food and wood now, +4 culture, and occasional supplies later.",btn("Befriend village","encounter:"+e.id+":befriend",!readyAny||e.status!=="neutral","primary"));
   output+=item("📜 Learn from villagers",e.learned?"Already learned their traditions.":"Gain 6 research points by learning their traditions.",btn(e.learned?"Knowledge learned":"Learn traditions","encounter:"+e.id+":learn",!readyAny||e.learned));
   if(e.status==="friendly")output+=item("🧺 Trade goods","Friendly villages can exchange supplies every five years.",btn("Trade supplies","encounter:"+e.id+":trade",!readyAny||state.year-e.lastGift<5));
   output+=item("⚔ Raid and enslave","Fight the defenders. Victory yields supplies and two captives for construction in your nearest city, but increases unrest and reduces culture. Captives aren't citizens.",btn("Attack village","encounter:"+e.id+":raid",!readyFighter));
  }else{
   output+=item(e.type==="raider"?"⚔ Rival warrior":"🏹 Wild animal",e.type==="raider"?"Stop a roaming threat and recover supplies.":"Hunting yields food. Hunting knowledge improves food rewards.",btn(e.type==="raider"?"Attack warrior":"Hunt animal","encounter:"+e.id+":fight",!readyFighter,"primary"));
  }
  if(!close)output+=item("🧭 Approach","Select a unit from the Units panel and move to a neighbouring tile. Each encounter action uses that unit's action for this year.",btn("Select units","units"));
 }
 if(menu==="tile"){
  if(!selected)return "";
  const {x,y}=selected;if(!currentlyVisible(x,y))return "<p class='hint'>This area is hidden by the fog of war. Send a unit nearby.</p>";
  const c=controller(x,y),d=deposit(x,y),job=state.works[pos(x,y)],capital=cityAt(x,y);
  const label=capital?"City tile":c==="contested"?"Contested border":c?c.owner==="player"?"Your influence":"Rival influence":"Wilderness";
  output="<p class='hint'>Tile "+x+", "+y+" · "+htmlSafe(label)+" · "+terrain(x,y)+"</p>";
  if(capital)output+=item("🏛 "+htmlSafe(capital.name),"Population "+capital.pop+" · Influence radius "+influenceRadius(capital)+" · ⚔ Attack "+cityAttack(capital)+" · 🛡 Defence "+cityDefense(capital),capital.owner==="player"?btn("Manage city","city"):"");
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
   output+=item((known(id)?"✓ ":active?"⏳ ":"🔬 ")+d.name,d.desc+" · Unlocks: "+bonusText(id)+(d.need?" · Requires "+techs[d.need].name:"")+" · "+d.cost+" research work",btn(known(id)?"Researched":active?"In progress":"Start research","tech:"+id,locked));
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
  output="<p class='hint'>"+ready+" of "+total+" units ready. You can act with every unit once per year. Explore fog, tap animals, rival warriors or village icons to interact, or rest injured units to heal. You may return to these actions before End Year.</p>";
  for(const u of state.units.filter(u=>u.owner==="player")){
   const d=unitDef(u.type);
   const nearby=(state.encounters||[]).find(e=>currentlyVisible(e.x,e.y)&&distance(u.x,u.y,e.x,e.y)<=1);
   output+=item((d?.icon||"🚶")+" "+unitTitle(u)+" at "+u.x+", "+u.y,(u.moved?"Already acted this year":"Ready")+" · ⚔ "+unitAttack(u)+" · 🛡 "+unitDefense(u)+" · ❤️ "+unitHP(u)+"/"+unitMaxHP(u)+" · XP "+(u.xp||0)+" · Vision "+(d?.vision||2),
     btn(u.moved?"Already acted":"Select to move","unit:"+u.id,u.moved)+(u.type==="settler"?btn("Found city","found:"+u.id,u.moved,"primary"):"")+(unitHP(u)<unitMaxHP(u)?btn("❤️ Rest & heal","rest:"+u.id,u.moved):"")+(nearby?btn("View "+wildTypes[nearby.type].name,"inspect:"+nearby.id):""));
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
 const stageAction=state.stage==="end"?"":btn(state.stage==="move"?"🚶 Move units":state.stage==="workers"?"👥 Assign workers":state.stage==="construction"?"🏗 Construct":"🔬 Choose tech","stageAction",false,"secondary stage-cta");
 actions.innerHTML='<button class="stage-label" data-action="turnMenu" title="Revisit any turn step">☰ '+stepLabel+' ▾</button><div class="stage-buttons">'+stageAction+nextButton+endButton+'</div>';
 const panel=get("panel");panel.classList.toggle("open",!!menu);
 panel.innerHTML=menu?'<div class="panelhead"><strong>'+({actions:"Actions",city:"City",tile:"Map tile",tech:"Research",path:"Society",units:"Units",workers:"Workers",history:"Chronicle",main:"Game",turn:"This year",encounter:"Encounter"}[menu]||"Civ")+'</strong><button id="closePanel" aria-label="Close panel">×</button></div>'+panelContents():"";
 panel.querySelector("#closePanel")?.addEventListener("click",()=>{menu="";renderUI();});
 document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>doAction(b.dataset.action)));
}
function doAction(a){
 if(a==="endYear")return endYear();
 if(a.startsWith("rest:"))return restUnit(a.slice(5));
 if(a.startsWith("inspect:")){
  const e=(state.encounters||[]).find(e=>e.id===a.slice(8));
  if(e&&currentlyVisible(e.x,e.y)){selected={x:e.x,y:e.y};menu="encounter";renderUI();}
  return;
 }
 if(a.startsWith("encounter:")){
  const rest=a.slice(10),last=rest.lastIndexOf(":");
  if(last<0)return;
  return encounterAction(rest.slice(0,last),rest.slice(last+1));
 }
 if(a==="turnMenu"){menu=menu==="turn"?"":"turn";renderUI();return;}
 if(a.startsWith("focus:"))return focusStage(a.slice(6));
 if(a==="actions"||a==="main"){menu=menu===a?"":a;renderUI();return;}
 if(["city","tile","tech","path","units","workers","history"].includes(a)){menu=a;renderUI();return;}
 if(a==="work"&&selected)return workTile(selected.x,selected.y);
 if(a==="assignAll")return assignAllWorkers();
 if(a.startsWith("builder:")){const [cityId,delta]=a.slice(8).split(":");return assignBuilder(cityId,Number(delta));}
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
  if(!explored(x,y)){
   const dark=["#15272c","#172b30","#1b3035","#12252b"][Math.floor(dice(x,y)*4)];
   tile(x,y,dark);
   continue;
  }
  const t=terrain(x,y),n=Math.floor(dice(x,y)*4),seen=currentlyVisible(x,y);
  const colors=t==="water"?["#31798a","#428797","#388091","#337887"]:t==="forest"?["#477c4f","#508858","#4a8154","#568f5a"]:t==="hill"?["#838d78","#939987","#929580","#9f9c84"]:["#81a76e","#77a267","#8baf77","#7eaa6b"];
  tile(x,y,colors[n]);
  if(seen){
   const id=borders.get(pos(x,y));
   if(id){const own=id==="contested"?"contested":getCity(id)?.owner;tile(x,y,own==="player"?"#e6c87f2a":own==="rival"?"#c560472b":own==="ally"?"#80cfb622":"#e9dca731");}
  }else tile(x,y,"#0e2027b8");
  render.push({x,y,p,t,seen});
 }
 for(const o of render)if(o.seen)border(o.x,o.y,borders.get(pos(o.x,o.y)));
 for(const {x,y,p,t,seen} of render){
  if(!seen)continue;
  const z=scale;
  if(t==="forest"){tree(p.x-9*z,p.y+6*z);if(dice(x+3,y)>.45)tree(p.x+12*z,p.y+8*z);}
  if(t==="hill")polygon([[p.x-24*z,p.y+8*z],[p.x-3*z,p.y-24*z],[p.x+19*z,p.y+8*z]],"#8d9484","#697d6b");
  if(t==="water"){ctx.strokeStyle="#9ed1da60";ctx.beginPath();ctx.moveTo(p.x-13*z,p.y+1*z);ctx.lineTo(p.x+7*z,p.y+1*z);ctx.stroke();}
  const d=deposit(x,y);
  if(d&&known(d.tech)&&remaining(x,y)>0){ctx.fillStyle="#ecdfaf";ctx.font=Math.max(11,14*z)+"px sans-serif";ctx.fillText(d.icon,p.x-6*z,p.y+7*z);}
  if(state.works[pos(x,y)]){ctx.fillStyle="#ffda74";ctx.beginPath();ctx.arc(p.x+15*z,p.y+7*z,4*z,0,Math.PI*2);ctx.fill();}
  const c=cityAt(x,y);if(c){structure(p.x,p.y,c);drawConstructionProgress(p.x,p.y,c);}
 }
 for(const e of state.encounters||[]){
  if(!currentlyVisible(e.x,e.y))continue;
  const p=screen(e.x,e.y),z=scale,d=wildTypes[e.type];
  if(p.x< -75||p.x>width+75||p.y< -90||p.y>height+80)continue;
  ctx.textAlign="center";
  ctx.font=Math.max(17,23*z)+"px sans-serif";
  ctx.shadowBlur=5;ctx.shadowColor="#10201c";
  ctx.fillText(d.icon,p.x,p.y-9*z);
  ctx.shadowBlur=0;
  ctx.font="bold "+Math.max(10,11*z)+"px system-ui";
  ctx.fillStyle=e.status==="friendly"?"#b9e9af":e.type==="village"?"#f1d8a7":"#ffe2ce";
  ctx.fillText(e.type==="village"?(e.status==="friendly"?"Friendly village":"Village"):d.name,p.x,p.y-27*z);
  ctx.fillStyle="#2b382e";ctx.fillRect(p.x-15*z,p.y-3*z,30*z,4*z);
  ctx.fillStyle=e.type==="village"?"#e3bf87":e.type==="raider"?"#cb786a":"#a2be8b";
  ctx.fillRect(p.x-15*z,p.y-3*z,30*z*Math.max(0,e.hp/d.hp),4*z);
  ctx.textAlign="left";
 }
 for(const u of state.units){
  const p=screen(u.x,u.y),z=scale;
  if(!currentlyVisible(u.x,u.y)&&u.owner!=="player")continue;
  const armed=fighter(u),club=u.type==="clubman",scout=u.type==="scout";
  ctx.fillStyle="#071a1366";ctx.beginPath();ctx.ellipse(p.x,p.y+6*z,11*z,5*z,0,0,Math.PI*2);ctx.fill();
  // Two legs, leather tunic, arms and head make unit silhouettes readable on mobile.
  ctx.strokeStyle="#654e37";ctx.lineWidth=Math.max(2,3*z);ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(p.x-3*z,p.y-4*z);ctx.lineTo(p.x-5*z,p.y+7*z);
  ctx.moveTo(p.x+3*z,p.y-4*z);ctx.lineTo(p.x+6*z,p.y+7*z);ctx.stroke();
  ctx.fillStyle=scout?"#527d59":club?"#8c6645":u.type==="settler"?"#c8a36d":"#a15e4d";
  ctx.fillRect(p.x-6*z,p.y-18*z,12*z,16*z);
  ctx.strokeStyle="#cb9874";ctx.lineWidth=Math.max(2,3*z);
  ctx.beginPath();ctx.moveTo(p.x-5*z,p.y-14*z);ctx.lineTo(p.x-11*z,p.y-4*z);
  ctx.moveTo(p.x+5*z,p.y-14*z);ctx.lineTo(p.x+12*z,p.y-9*z);ctx.stroke();
  ctx.fillStyle="#e8c7a3";ctx.beginPath();ctx.arc(p.x,p.y-23*z,6*z,0,Math.PI*2);ctx.fill();
  if(club||u.type==="army"){
   // Thick wooden club in the right hand.
   ctx.strokeStyle="#6b462e";ctx.lineWidth=Math.max(3,4*z);
   ctx.beginPath();ctx.moveTo(p.x+11*z,p.y-9*z);ctx.lineTo(p.x+20*z,p.y-32*z);ctx.stroke();
   ctx.fillStyle="#4d3928";ctx.beginPath();ctx.ellipse(p.x+21*z,p.y-34*z,5*z,9*z,-.3,0,Math.PI*2);ctx.fill();
  }else if(u.type==="spearman"){
   ctx.strokeStyle="#73583f";ctx.lineWidth=Math.max(2,2*z);
   ctx.beginPath();ctx.moveTo(p.x+12*z,p.y+3*z);ctx.lineTo(p.x+16*z,p.y-43*z);ctx.stroke();
   polygon([[p.x+11*z,p.y-38*z],[p.x+17*z,p.y-49*z],[p.x+21*z,p.y-38*z]],"#b5b8a7");
  }else if(u.type==="archer"){
   ctx.strokeStyle="#66472d";ctx.lineWidth=Math.max(2,2*z);
   ctx.beginPath();ctx.arc(p.x+14*z,p.y-15*z,13*z,-1.7,1.7);ctx.stroke();
   ctx.strokeStyle="#e8d3a8";ctx.lineWidth=1;ctx.beginPath();
   ctx.moveTo(p.x+12*z,p.y-28*z);ctx.lineTo(p.x+12*z,p.y-2*z);ctx.stroke();
  }else if(u.type==="swordsman"){
   ctx.strokeStyle="#b6c0bf";ctx.lineWidth=Math.max(2,3*z);
   ctx.beginPath();ctx.moveTo(p.x+12*z,p.y-9*z);ctx.lineTo(p.x+18*z,p.y-35*z);ctx.stroke();
  }else if(scout){
   ctx.fillStyle="#527d59";ctx.beginPath();ctx.moveTo(p.x-7*z,p.y-25*z);ctx.lineTo(p.x,p.y-35*z);ctx.lineTo(p.x+7*z,p.y-25*z);ctx.fill();
  }
  ctx.font="bold "+Math.max(10,12*z)+"px sans-serif";ctx.textAlign="center";ctx.fillStyle="#f9e4b6";
  ctx.shadowColor="#10261a";ctx.shadowBlur=4;ctx.fillText(unitTitle(u),p.x,p.y-44*z);ctx.shadowBlur=0;ctx.textAlign="left";
  if(!u.moved&&activeUnit()?.id===u.id){
   ctx.beginPath();ctx.ellipse(p.x,p.y+3*z,14*z,7*z,0,0,Math.PI*2);
   ctx.strokeStyle="#ffe28d";ctx.lineWidth=Math.max(2,2.8*z);ctx.stroke();
  }
 }

 if(selected&&explored(selected.x,selected.y)){
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
 if(currentlyVisible(spot.x,spot.y)&&encounterAt(spot.x,spot.y)){menu="encounter";renderUI();return;}
 {
  const standing=state.units.find(u=>u.owner==="player"&&u.x===spot.x&&u.y===spot.y);
  if(standing){
    if(standing.moved)toast("That unit has already moved this year. Choose another ready unit.");
    else{moving=standing.id;menu="";toast(unitTitle(standing)+" selected. Tap an adjacent tile to move.");}
    renderUI();return;
  }
  if((state.stage==="move"||moving)&&state.units.some(u=>u.owner==="player"&&!u.moved)){move(spot.x,spot.y);return;}
 }
 if(!explored(spot.x,spot.y)){toast("Unexplored land. Send a unit closer to reveal it.");return;}
 if(!currentlyVisible(spot.x,spot.y)){toast("This area is outside your current sight. Send a scout to investigate.");return;}
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
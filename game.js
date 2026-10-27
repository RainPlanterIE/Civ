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
 engineering:{name:"Engineering",cost:37,need:"geology",desc:"Increase yields from all worked resource tiles."},
 fishing:{name:"Fishing",cost:6,desc:"Work renewable fish shoals along the coast (+4 food per fishing worker). Coastal civilisations begin with this skill."},
 netmaking:{name:"Net Making",cost:14,need:"fishing",desc:"+2 fish per coastal worker and unlock the Smokehouse."},
 seafaring:{name:"Seafaring",cost:19,need:"fishing",desc:"Unlock Harbours and Fishing Boats for coastal travel and catches."},
 shipbuilding:{name:"Shipbuilding",cost:30,need:"seafaring",desc:"Unlock Shipyards and Longships to explore coastlines."},
 navigation:{name:"Navigation",cost:42,need:"shipbuilding",desc:"Unlock open-ocean travel, +1 ship movement, longer sight at sea and Lighthouses."},
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
 academy:{name:"Academy",icon:"🔬",wood:30,stone:25,work:44,path:"science",desc:"+6 research each year; science influence extends territory."},
 theatre:{name:"Theatre",icon:"🎭",wood:26,stone:20,work:40,path:"arts",desc:"+5 culture per year to expand borders and persuade nearby civilisations."},
 temple:{name:"Temple",icon:"⛪",wood:25,stone:22,work:40,path:"faith",desc:"+5 faith per year, increasing religious influence and conversion pressure."},
 barracks:{name:"Barracks",icon:"🛡",wood:24,stone:22,work:34,path:"war",desc:"+2 military power per year, +1 city attack and additional siege strength."},
 huntingLodge:{name:"Hunting Lodge",icon:"🏕️",wood:10,stone:0,work:18,need:"hunting",desc:"+2 food from worked wild-food tiles."},
 fishingHut:{name:"Fishing Hut",icon:"🎣",wood:9,stone:0,work:16,need:"fishing",coastal:true,desc:"+2 food per worked coastal fishing tile."},
 smokehouse:{name:"Smokehouse",icon:"🐟",wood:12,stone:5,work:20,need:"netmaking",coastal:true,desc:"+1 food per worked fishing tile."},
 harbor:{name:"Harbour",icon:"⚓",wood:16,stone:8,work:26,need:"seafaring",coastal:true,desc:"+1 food per fishing tile and enables Fishing Boat training."},
 shipyard:{name:"Shipyard",icon:"🛶",wood:24,stone:13,work:34,need:"shipbuilding",coastal:true,desc:"Build Longships capable of coastal exploration."},
 lighthouse:{name:"Lighthouse",icon:"🗼",wood:14,stone:14,work:27,need:"navigation",coastal:true,desc:"+2 city sight tiles and safer navigation."},
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
 army:{name:"Warband",icon:"⚔️",wood:18,stone:16,metal:2,work:27,strength:4,vision:2,path:"war",desc:"Established warband used to conquer city centres."},
 fishingBoat:{name:"Fishing Boat",icon:"⛵",wood:14,stone:0,food:2,work:18,strength:1,vision:3,need:"seafaring",requires:"harbor",naval:true,range:2,desc:"Work coastal waters: spend its action to land 6 food at your nearest city."},
 longship:{name:"Longship",icon:"🚢",wood:21,stone:8,food:4,work:30,strength:4,vision:4,need:"shipbuilding",requires:"shipyard",naval:true,range:3,desc:"Sail 3 tiles/year, carry one land unit, and fish for 3 food. Navigation adds +1 move and unlocks oceans."}
};
const unitDef=id=>unitTypes[id];
const fighter=u=>u&&["clubman","spearman","archer","swordsman","army"].includes(u.type);
const unitTitle=u=>unitTypes[u?.type]?.name||"Unit";
const bonusText=id=>{
 const map={
  agriculture:"🌾 Renewable farmland; +4 food per worked crop tile",
  geology:"🪨 Reveal quarries and stone resources",
  writing:"📚 Library (+3 research/year), Market (+1 crop food)",
  husbandry:"🐂 Pasture +1 food/year; Stables improve livestock",
  metalworking:"⚔️ Ore, Forge, Swordsmen after Forge",
  engineering:"🛠️ +1 yield from each worked resource tile",
  hunting:"🍓 Hunting Lodge (+2 wild forage food); more food from hunts",
  scouting:"👣 Scout (two-tile moves, vision 4), Lookout Tower",
  toolmaking:"🔨 Workshop (+1 timber/stone yield; +1 build work)",
  archery:"🏹 Archer after Archery Range",
  drill:"🛡️ Spearman after Training Grounds",
  masonry:"🏰 City Walls (+4 city defence)",
  fishing:"🎣 Coastal fish worker yields 4 renewable food/year; Fishing Hut",
  netmaking:"🕸️ +2 food per fishing worker, Smokehouse (+1)",
  seafaring:"⚓ Harbour (+1 fish food), Fishing Boat (6 food/action)",
  shipbuilding:"🚢 Shipyard and Longship (3-tile coastal sail)",
  navigation:"🧭 Open-sea routes, +1 sea move/year, +2 ship sight and Lighthouse"
 };
 return map[id]||"New discoveries";
};
const techBranches=[
 {name:"🌊 Coast & Sailing",desc:"Feed seaside cities, then launch boats and explore the sea.",ids:["fishing","netmaking","seafaring","shipbuilding","navigation"]},
 {name:"🌾 Food & Farming",desc:"Grow sustainable food on land and domesticate animals.",ids:["agriculture","husbandry","hunting"]},
 {name:"🛠️ Materials & Industry",desc:"Find minerals, improve resources and build stronger defences.",ids:["geology","toolmaking","metalworking","engineering","masonry"]},
 {name:"📜 Knowledge & Military",desc:"Explore the land, improve research and train specialised fighters.",ids:["scouting","writing","archery","drill"]}
];
const dice=(x,y)=>CIV_WORLD.noise(x,y,42);
const inMap=(x,y)=>CIV_WORLD.valid(x,y);
const pos=(x,y)=>x+","+y;
const decode=str=>str.split(",").map(Number);
const distance=(x,y,a,b)=>Math.max(Math.abs(x-a),Math.abs(y-b));
const terrain=(x,y)=>CIV_WORLD.climate(x,y);
const coastalWaterCache=new Map();
function isCoastalWater(x,y){
 if(!inMap(x,y)||CIV_WORLD.isLand(x,y))return false;
 const key=pos(x,y);
 if(coastalWaterCache.has(key))return coastalWaterCache.get(key);
 let nearby=false;
 for(let dy=-1;dy<=1&&!nearby;dy++)for(let dx=-1;dx<=1;dx++){
  if(!dx&&!dy)continue;
  if(CIV_WORLD.isLand(x+dx,y+dy)){nearby=true;break;}
 }
 if(coastalWaterCache.size>16000)coastalWaterCache.clear();
 coastalWaterCache.set(key,nearby);
 return nearby;
}
function coastTile(x,y,r=2){
 for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)
  if(Math.max(Math.abs(dx),Math.abs(dy))<=r&&isCoastalWater(x+dx,y+dy))return {x:x+dx,y:y+dy};
 return null;
}
function cityHasSea(c){return !!(c&&coastTile(c.x,c.y,influenceRadius(c)));}
function launchWater(c){
 if(!c)return null;
 const radius=influenceRadius(c),options=[];
 for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
  const x=c.x+dx,y=c.y+dy;
  if(!isCoastalWater(x,y)||state.units.some(u=>u.owner==="player"&&isNaval(u)&&u.x===x&&u.y===y))continue;
  options.push({x,y,distance:Math.max(Math.abs(dx),Math.abs(dy))});
 }
 options.sort((a,b)=>a.distance-b.distance);
 return options[0]||null;
}
function isNaval(u){return !!unitDef(u?.type)?.naval;}
function deposit(x,y){
 if(!inMap(x,y))return null;
 if(isCoastalWater(x,y)){
  const yieldBand=dice(x+161,y+37);
  return {type:"fish",max:Infinity,tech:"fishing",icon:yieldBand>.76?"🐟":"🎣",renewable:true};
 }
 return CIV_WORLD.deposit(x,y);
}

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
function passengerFor(ship){
 return state.units.find(u=>u.owner==="player"&&u.embarkedOn===ship.id);
}
function embarkUnit(unitId,shipId){
 const u=getUnit(unitId),ship=getUnit(shipId);
 if(!u||u.owner!=="player"||isNaval(u)||u.embarkedOn)return toast("Select a land unit to embark.");
 if(!ship||ship.owner!=="player"||ship.type!=="longship")return toast("Only Longships can carry a land unit.");
 if(u.moved)return toast("This unit has already acted this year.");
 if(passengerFor(ship))return toast("Longships currently carry one land unit at a time.");
 if(distance(u.x,u.y,ship.x,ship.y)>1)return toast("Move next to the Longship before embarking.");
 u.embarkedOn=ship.id;u.x=ship.x;u.y=ship.y;u.moved=true;moving=null;
 record(unitTitle(u)+" boards the Longship to cross the sea.");
 autoAdvance("move");updateFog();save();renderUI();
}
function disembarkUnit(shipId,x,y){
 const ship=getUnit(shipId),u=ship&&passengerFor(ship);
 if(!ship||ship.type!=="longship"||!u)return toast("No passenger is aboard.");
 if(ship.moved)return toast("The ship must finish its voyage before unloading. End Year first.");
 if(!inMap(x,y)||terrain(x,y)==="water"||distance(ship.x,ship.y,x,y)>1)return toast("Choose a neighbouring land tile.");
 if(cityAt(x,y)?.owner==="rival"||encounterAt(x,y))return toast("Enemy settlements and encounters block landing.");
 delete u.embarkedOn;u.x=x;u.y=y;u.moved=true;ship.moved=true;moving=null;
 record(unitTitle(u)+" disembarks from the Longship.");
 autoAdvance("move");updateFog();save();renderUI();
}
function fishAtSea(unitId){
 const u=state.units.find(z=>z.id===unitId&&z.owner==="player");
 if(!u||!isNaval(u))return toast("Choose a fishing boat or longship.");
 if(u.moved)return toast("This ship has already acted this year.");
 if(terrain(u.x,u.y)!=="water")return toast("The ship must be at sea to fish.");
 if(!isCoastalWater(u.x,u.y)&&!known("navigation"))return toast("Open-sea fishing requires Navigation.");
 const catchSize=(u.type==="fishingBoat"?6:3)+(known("netmaking")?2:0);
 state.resources.food+=catchSize;u.moved=true;
 const home=closestCity(u.x,u.y),where=home?.name||"your civilisation";
 record("🎣 "+unitTitle(u)+" brings "+catchSize+" food from the sea to "+where+".");
 autoAdvance("move");save();renderUI();
}
function restUnit(unitId){
 const u=state.units.find(u=>u.id===unitId&&u.owner==="player");
 if(!u)return;
 if(u.embarkedOn)return toast("Rest after disembarking.");
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
function cityDefense(c){return 3+Math.ceil(c.pop/2)+Math.floor((c.army||0)/3)+4*upgrade(c,"walls")+upgrade(c,"lookout")+(c.owner==="player"?state.units.filter(u=>u.owner==="player"&&!u.embarkedOn&&fighter(u)&&distance(u.x,u.y,c.x,c.y)<=1).reduce((n,u)=>n+Math.ceil(unitDefense(u)/2),0):0);}
function cityAttack(c){return 1+Math.floor(c.pop/4)+upgrade(c,"barracks")+upgrade(c,"training");}
function encounterAt(x,y){return (state.encounters||[]).find(e=>e.x===x&&e.y===y&&e.hp>0);}
function eventRng(seed){return dice(seed*17+state.year*11,seed*31+state.year*19);}
function closestCity(x,y){return myCities().sort((a,b)=>distance(a.x,a.y,x,y)-distance(b.x,b.y,x,y))[0];}
function adjacentUnit(e,ready=false,fighting=false){
 return state.units.filter(u=>u.owner==="player"&&!u.embarkedOn&&distance(u.x,u.y,e.x,e.y)<=1&&(!ready||!u.moved)&&(!fighting||fighter(u)))
  .sort((a,b)=>unitAttack(b)-unitAttack(a))[0];
}
function rewardSupplies(e,multiplier=1){
 const d=wildTypes[e.type],extra=known("hunting")&&e.type!=="raider"&&e.type!=="village"?2:0,earned={food:0,wood:0,stone:0};
 for(const res of ["food","wood","stone"]){
  const n=Math.floor((d[res]||0)*multiplier)+(res==="food"?extra:0);
  if(n){state.resources[res]=(state.resources[res]||0)+n;earned[res]=n;}
 }
 return earned;
}
function dropUnit(u,msg){
 const lost=[u.id,...state.units.filter(a=>a.embarkedOn===u.id).map(a=>a.id)];state.units=state.units.filter(a=>!lost.includes(a.id));if(lost.includes(moving))moving=null;record(msg+(lost.length>1?" Its passenger is lost too.":""));
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
   }else{
    const gained=rewardSupplies(e),home=closestCity(ready.x,ready.y),where=home?.name||"your civilisation";
    record("🏹 "+unitTitle(ready)+" hunts "+wildTypes[e.type].name+": +"+gained.food+" food"+(gained.wood?" and "+gained.wood+" wood":"")+" delivered to "+where+".");
   }
   ready.xp=(ready.xp||0)+2;
   state.encounters=state.encounters.filter(item=>item.id!==id);
  }else record(unitTitle(ready)+" strikes "+wildTypes[e.type].name+" for "+inflicted+" damage. "+e.hp+" health remains.");
  if(ready.hp<=0)dropUnit(ready,unitTitle(ready)+" falls in combat.");
 }
 autoAdvance("move");updateFog();menu="";save();renderUI();
}
function spawnEncounters(){
 if(!state.encounters)state.encounters=[];
 const countByType={};
 for(const e of state.encounters)countByType[e.type]=(countByType[e.type]||0)+1;
 if(state.encounters.length>=260||state.year%2!==0)return;
 const hubs=[...myCities(),...state.units.filter(u=>u.owner==="player")];
 if(state.year%6===0)hubs.push(...state.cities.filter(c=>c.owner==="rival"));
 if(!hubs.length)hubs.push(state.leader);
 for(let i=0;i<3;i++){
  const hub=hubs[Math.floor(eventRng(state.year*29+i*37)*hubs.length)];
  if(!hub)continue;
  for(let k=0;k<42;k++){
   const num=state.year*1241+i*91+k*7;
   const x=hub.x+Math.floor((eventRng(num+11)-.5)*42);
   const y=hub.y+Math.floor((eventRng(num+47)-.5)*42);
   if(!CIV_WORLD.isLand(x,y)||cityAt(x,y)||encounterAt(x,y)||state.units.some(u=>u.x===x&&u.y===y))continue;
   if(state.encounters.some(e=>e.type==="village"&&distance(e.x,e.y,x,y)<3))continue;
   const type=eventRng(num+88)>.86?"raider":CIV_WORLD.wildlife(x,y);
   if(!type||!wildTypes[type]||(countByType[type]||0)>=(type==="raider"?32:55))continue;
   state.encounters.push(makeEncounter(type,x,y,"e"+state.nextEncounterId++));
   countByType[type]=(countByType[type]||0)+1;break;
  }
 }
}
function roamEnemies(){
 // Each year, hostile warriors and predators may approach the player's units.
 for(const e of state.encounters||[]){
  if(!["raider","wolf","boar","jaguar","lion","tiger","bear"].includes(e.type))continue;
  const victim=state.units.filter(u=>u.owner==="player"&&!u.embarkedOn&&!isNaval(u)&&distance(u.x,u.y,e.x,e.y)<=1).sort((a,b)=>unitHP(a)-unitHP(b))[0];
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
 return {version:4,world:"earth",worldSeed:scenario.seed,leader:{...leader},initialRivalCount:12,year:1,
 tech:["foraging","forestry",...(coastTile(leader.x,leader.y,2)?["fishing"]:[])],research:0,knowledge:0,culture:0,faith:0,military:0,
 resources:{food:32,wood:24,stone:14,ore:0,metal:0,animals:0},
 cities:scenario.rivals.map((c,i)=>({id:"r"+(i+1),x:c.x,y:c.y,name:c.capital,civId:c.id,civilisation:c.name,leader:c.leader,colour:c.color,pop:7,owner:"rival",army:6,culture:0,faith:0,buildings:{},growth:0,captives:0,unrest:0})),
 units:[{id:"u1",type:"settler",x:leader.x,y:leader.y,moved:false,owner:"player",strength:1,hp:6,xp:0},{id:"u2",type:"clubman",x:leader.x,y:leader.y,moved:false,owner:"player",strength:2,hp:6,xp:0}],
 works:{},builders:{},extracted:{},explored:{},encounters:initialEncounters(scenario),nextEncounterId:1000,
 path:null,project:null,researchProject:null,stage:"move",stageYear:1,
 events:[leader.leader+" leads "+leader.name+" from "+leader.capital+" with a settler and a clubman."],nextId:3,startingEscortGranted:true,victory:null};
}
let inGame=false;
let state;
function migrateLegacy(old){
 const seed=((Math.imul(Number(old.year)||1,8191)+Math.imul(Number(old.nextId)||2,739)+123456789)>>>0);
 const earth=fresh(CIV_WORLD.scenario(seed));
 const site=earth.leader,original=old.cities?.filter(c=>c.owner==="player")||[],anchor=original[0]||{x:15,y:15};
 const migrated=[];
 for(let i=0;i<original.length;i++){
  const c=original[i];
  const px=site.x+(c.x-anchor.x),py=site.y+(c.y-anchor.y);
  const p=i===0?{x:site.x,y:site.y}:CIV_WORLD.safeSite(-180+(px+.5)/2,90-(py+.5)/2,[...earth.cities,...migrated]);
  migrated.push({...c,x:p.x,y:p.y,name:c.name==="New Haven"?site.capital:c.name,civId:site.id,civilisation:site.name,leader:site.leader,colour:site.color,owner:"player",buildings:{...(c.buildings||{})}});
 }
 earth.cities.push(...migrated);
 const anchorPoint={x:site.x,y:site.y};
 earth.units=(old.units||[]).filter(u=>u.owner==="player").map(u=>{
  const x=anchorPoint.x+u.x-anchor.x,y=anchorPoint.y+u.y-anchor.y;
  const dest=CIV_WORLD.safeSite(-180+(x+.5)/2,90-(y+.5)/2,earth.cities.filter(c=>c.owner==="rival"));
  return {...u,x:dest.x,y:dest.y,owner:"player"};
 });
 for(const key of ["year","tech","research","knowledge","culture","faith","military","resources","path","project","researchProject","stage","stageYear","nextId","victory","events"]){
  if(old[key]!==undefined)earth[key]=old[key];
 }
 earth.builders={...(old.builders||{})};
 earth.nextEncounterId=1000;
 earth.legacyMigrated=true;
 const convertedWorks={};
 for(const [key,id] of Object.entries(old.works||{})){
  const [x,y]=key.split(",").map(Number),owner=migrated.find(c=>c.id===id),previous=original.find(c=>c.id===id);
  if(!owner||!previous)continue;
  const wx=owner.x+x-previous.x,wy=owner.y+y-previous.y;
  if(!inMap(wx,wy)||terrain(wx,wy)==="water"||distance(wx,wy,owner.x,owner.y)>5)continue;
  if(deposit(wx,wy)?.tech&&!earth.tech.includes(deposit(wx,wy).tech))continue;
  convertedWorks[pos(wx,wy)]=id;
 }
 earth.works=convertedWorks;
 // Keep the old save intact under its previous key.
 return earth;
}
function readSave(){
 try{
  const current=JSON.parse(localStorage.getItem(STORE)||"null");
  if(current?.version===4&&Array.isArray(current.cities)&&Array.isArray(current.units))return current;
  const legacy=JSON.parse(localStorage.getItem(LEGACY_STORE)||"null");
  if(legacy?.version===3&&Array.isArray(legacy.cities)&&Array.isArray(legacy.units))return migrateLegacy(legacy);
 }catch(e){}
 return null;
}
state=readSave()||fresh();
function ensureStartingEscort(){
 if(state.startingEscortGranted)return;
 const u=state.units?.find(u=>u.owner==="player"&&u.type==="settler");
 if(state.year===1&&u&&state.units.filter(z=>z.owner==="player").length===1){
  const id="u"+Math.max(state.nextId||2,2);
  state.units.push({id,type:"clubman",x:u.x,y:u.y,moved:false,owner:"player",strength:2,hp:6,xp:0});
  state.nextId=Math.max(state.nextId||2,3);
 }
 state.startingEscortGranted=true;
}
ensureStartingEscort();
if((coastTile(state.leader?.x??-1,state.leader?.y??-1,2)||state.cities.some(c=>c.owner==="player"&&cityHasSea(c)))&&!state.tech.includes("fishing"))state.tech.push("fishing");
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
  if(city.owner==="player")reveal(city.x,city.y,Math.max(2,influenceRadius(city))+upgrade(city,"lookout")*2+upgrade(city,"lighthouse")*2);
  else if(city.owner==="ally")reveal(city.x,city.y,2);
 }
 for(const unit of state.units)if(unit.owner==="player"&&!unit.embarkedOn)
  reveal(unit.x,unit.y,(unitDef(unit.type)?.vision||2)+(known("scouting")&&unit.type==="settler"?1:0)+(isNaval(unit)&&known("navigation")?2:0));
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
 if(stage==="move")return state.units.some(u=>u.owner==="player"&&!u.moved&&!u.embarkedOn);
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
 // Only visit tiles near city centres; scanning a 720×360 world each year
 // is prohibitively slow on mobile.
 borders=new Map();
 const scores=new Map();
 for(const c of state.cities){
  const r=influenceRadius(c);
  for(let y=Math.max(0,c.y-r);y<=Math.min(MAP_H-1,c.y+r);y++)
   for(let x=Math.max(0,c.x-r);x<=Math.min(MAP_W-1,c.x+r);x++){
    if(!CIV_WORLD.isLand(x,y)&&!isCoastalWater(x,y))continue;
    const key=pos(x,y),score=territoryScore(c,x,y);
    if(score===-Infinity)continue;
    const existing=scores.get(key);
    if(!existing||score>existing.score+.01)scores.set(key,{score,id:c.id,tied:false});
    else if(Math.abs(score-existing.score)<.01&&existing.id!==c.id)existing.tied=true;
   }
 }
 for(const [key,o] of scores)borders.set(key,o.tied?"contested":o.id);
 for(const c of state.cities)if(CIV_WORLD.isLand(c.x,c.y))borders.set(pos(c.x,c.y),c.id);
 for(const key of Object.keys(state.works))if(borders.get(key)!==state.works[key])delete state.works[key];
 for(const c of myCities())balanceCityLabor(c);
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
   if(remaining(x,y)===0&&d.type!=="food"&&d.type!=="animals"&&d.type!=="fish")continue;
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
   if(kind==="food"||kind==="forage"||kind==="fish")totals.food++;
   else if(kind&&totals[kind]!==undefined)totals[kind]++;
  }
  while(freeWorkers(c)>0&&options.length){
   // Choose again after each assignment to balance food with timber and stone.
   const score=t=>{
    if(t.kind==="food"||t.kind==="forage"||t.kind==="fish")return totals.food<foodTarget?0:9+totals.food;
    if(t.kind==="wood")return totals.wood===0?1:5+totals.wood;
    if(t.kind==="stone")return totals.stone===0?2:6+totals.stone;
    return 7+(totals[t.kind]||0);
   };
   options.sort((a,b)=>score(a)-score(b));
   const tile=options.shift();state.works[tile.key]=c.id;count++;
   const kind=tile.kind==="forage"||tile.kind==="fish"?"food":tile.kind;totals[kind]=(totals[kind]||0)+1;
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
function storedGame(){return readSave();}
function manualSave(){
 if(save())toast("✓ Game saved on this device · Year "+state.year);
 else toast("Could not save. Check your browser storage settings.");
}
function showMainMenu(){
 hideWorldMap();menu="";moving=null;
 const stored=storedGame();
 const screen=get("startScreen");
 get("continueGame").disabled=!stored;
 get("backToGame").hidden=!inGame;
 get("menuStatus").textContent=stored
  ?(stored.legacyMigrated?"Earlier valley save detected — Continue moves its progress to Earth. The original is kept. ":"Earth save available · ")+
     "Year "+stored.year+" · "+(stored.leader?.leader||"Historical leader")+" · "+(stored.leader?.name||"Civilisation")
  :"No Earth save yet — Play assigns a random historical leader.";
 screen.classList.remove("hidden");
 renderUI();
}
function closeMainMenu(){
 get("startScreen").classList.add("hidden");
 renderUI();
}
function playNewGame(){
 if(storedGame()&&!window.confirm("Start a new game? This replaces the saved civilisation on this device."))return;
 state=fresh();moving=null;selected=null;menu="";recalcBorders();center(state.leader.x,state.leader.y);
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
 ensureStartingEscort();
 if((coastTile(state.leader?.x??-1,state.leader?.y??-1,2)||state.cities.some(c=>c.owner==="player"&&cityHasSea(c)))&&!state.tech.includes("fishing"))state.tech.push("fishing");
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
 center(unit?.x??city?.x??state.leader.x,unit?.y??city?.y??state.leader.y);
 save();inGame=true;
 closeMainMenu();
 toast("Continued saved game · Year "+state.year);
}
function toast(msg){get("toast").textContent=msg;get("toast").classList.add("show");toastUntil=Date.now()+2900;}
function record(msg){state.events.unshift("Year "+state.year+": "+msg);state.events=state.events.slice(0,25);toast(msg);}
function found(u){
 syncStage();
 if(!u||u.type!=="settler")return;if(u.embarkedOn)return toast("Disembark this settler before founding a city.");if(u.moved)return toast("This settler has already acted this year.");
 if(terrain(u.x,u.y)==="water"||state.cities.some(c=>distance(c.x,c.y,u.x,u.y)<=3)){toast("Settle on land at least four tiles from another city.");return;}
 const first=myCities().length===0,c={id:"c"+state.nextId++,x:u.x,y:u.y,
 name:first?(state.leader?.capital||"Capital"):"New Settlement "+state.nextId,
 civilisation:state.leader?.name||"Your civilisation",civId:state.leader?.id,leader:state.leader?.leader,
 colour:state.leader?.color,pop:3,owner:"player",army:1,culture:0,faith:0,buildings:{}};
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
 if(remaining(x,y)<=0&&d.type!=="animals"&&d.type!=="food"&&d.type!=="fish"){toast("This deposit is exhausted.");return;}
 state.works[key]=c.id;record(c.name+" assigns one worker to "+d.type+".");autoAdvance("workers");if(state.stage!=="workers"&&(menu==="workers"||menu==="tile"))menu="";save();renderUI();
}
function harvestResources(){
 const gains={food:0,wood:0,stone:0,ore:0,animals:0};
 for(const [key,id] of Object.entries(state.works)){
  const c=getCity(id),[x,y]=decode(key),d=deposit(x,y);
  if(!c||c.owner!=="player"||borders.get(key)!==id||!d||!known(d.tech)){delete state.works[key];continue;}
  let output=d.type==="fish"?4+2*upgrade(c,"fishingHut")+upgrade(c,"smokehouse")+upgrade(c,"harbor")+(known("netmaking")?2:0):
   d.type==="wood"?3+upgrade(c,"sawmill")+upgrade(c,"workshop"):d.type==="stone"?2+upgrade(c,"stoneworks")+upgrade(c,"workshop"):d.type==="ore"?2+upgrade(c,"forge"):d.type==="animals"?1+upgrade(c,"stable"):d.type==="food"?4+upgrade(c,"granary")+upgrade(c,"market"):4+upgrade(c,"granary")+2*upgrade(c,"huntingLodge");
  if(known("engineering"))output++;
  if((d.type==="food"&&known("agriculture"))||(d.type==="fish"&&known("fishing"))){gains.food+=output;continue;}
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
   const port=d.naval?launchWater(c):null;
   if(d.naval&&!port){
    p.left=1;record("A harbour berth must be freed before "+d.name+" can launch.");return;
   }
   state.units.push({id:"u"+state.nextId++,type:p.kind,x:port?.x??c.x,y:port?.y??c.y,moved:true,owner:"player",hp:6+Math.max(0,d.strength-2),xp:0,strength:d.strength+upgrade(c,"training")+(p.kind==="archer"?upgrade(c,"range"):0)});
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
 const needed=Math.max(4,Math.ceil((state.initialRivalCount||12)*2/3));
 if(state.path==="arts"&&myCities().length>=needed+1)state.victory="Culture victory — neighbouring civilisations join you.";
 if(state.path==="faith"&&state.cities.filter(c=>c.owner==="ally").length>=needed)state.victory="Faith victory — most great civilisations share your beliefs.";
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
function tradeTimber(cityId){
 const c=getCity(cityId);
 if(!c||c.owner!=="player")return toast("Select one of your cities to trade.");
 const years=5-(state.year-(c.lastTimberTrade||-100));
 if(years>0)return toast("The timber caravan returns in "+years+" years.");
 const foodCost=upgrade(c,"market")?9:13,woodGain=upgrade(c,"market")?8:6;
 if(state.resources.food<foodCost)return toast("Need "+(foodCost-state.resources.food)+" more food to import timber.");
 state.resources.food-=foodCost;state.resources.wood+=woodGain;
 c.lastTimberTrade=state.year;
 record(c.name+" imports "+woodGain+" timber in exchange for "+foodCost+" food.");
 save();renderUI();
}
function startConstruction(kind,cityId){
 syncStage();
 const c=getCity(cityId);if(!c||c.owner!=="player")return;
 const def=buildings[kind]||unitDef(kind);
 if(!def)return toast("Unrecognised development.");
 const r=projectRequirements(c,kind);
 if(!r.ready)return toast(r.missing[0]+". Check the project card for any other requirements.");
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
function activeUnit(){const chosen=getUnit(moving);return chosen&&!chosen.embarkedOn?chosen:state.units.find(u=>u.owner==="player"&&!u.moved&&!u.embarkedOn)||state.units.find(u=>u.owner==="player"&&!u.embarkedOn);}
function move(x,y){
 syncStage();
 const u=activeUnit();if(!u)return toast("Select a unit first.");
 if(u.embarkedOn)return toast("Disembark this unit before moving it.");
 if(u.moved)return toast("This unit already moved this year.");
 if(!inMap(x,y))return toast("That tile is outside the world.");
 const naval=isNaval(u),water=terrain(x,y)==="water";
 if(naval&&!water)return toast("Ships travel on water. They need a harbour to land.");
 if(!naval&&water)return toast("Land units cannot walk on water. Train a ship at a Harbour.");
 if(naval&&!known("navigation")&&!isCoastalWater(x,y))return toast("Open sea requires Navigation. Sail along the coast for now.");
 const step=distance(u.x,u.y,x,y),range=(unitDef(u.type)?.range||(u.type==="scout"?2:1))+(naval&&known("navigation")?1:0);
 if(step<1||step>range)return toast("This unit can travel up to "+range+" tile"+(range===1?"":"s")+" per year.");
 for(let k=1;k<=step;k++){
  const px=Math.round(u.x+(x-u.x)*k/step),py=Math.round(u.y+(y-u.y)*k/step);
  const sea=terrain(px,py)==="water";
  if(naval){
   if(!sea)return toast("Ships cannot sail through land.");
   if(!known("navigation")&&!isCoastalWater(px,py))return toast("Learn Navigation for ocean crossings.");
   if(state.units.some(other=>other.id!==u.id&&other.owner==="player"&&isNaval(other)&&other.x===px&&other.y===py)&&k===step)return toast("Another ship occupies that sea tile.");
  }else{
   if(sea)return toast("Your route crosses water.");
   const midway=cityAt(px,py);if(midway&&midway.owner==="rival")return toast("You cannot pass through a rival city.");
  }
 }
 const e=encounterAt(x,y);
 if(e&&currentlyVisible(x,y)){selected={x,y};menu="encounter";renderUI();return toast("Encounter: "+wildTypes[e.type].name+". Choose how to approach it.");}
 const occupied=cityAt(x,y);
 if(occupied&&occupied.owner==="rival")return toast("Attack rival cities from a neighbouring tile.");
 u.x=x;u.y=y;u.moved=true;
 if(isNaval(u)){const passenger=passengerFor(u);if(passenger){passenger.x=x;passenger.y=y;}}
 selected={x,y};moving=null;menu="";updateFog();
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
function projectLabel(){const p=state.project;if(!p)return "Nothing being built.";return (buildings[p.kind]?.name||unitDef(p.kind)?.name||p.kind)+" · "+p.left+"/"+p.total+" work · ~"+estimateWork(p.left,constructionRate(getCity(p.city),p.kind))+" years left";}
function projectRequirements(c,id,ignoreBusy=false){
 const def=buildings[id]||unitDef(id);
 if(!def)return {ready:false,missing:["Unknown development"]};
 const missing=[];
 if(state.project&&!ignoreBusy)missing.push("Finish "+(buildings[state.project.kind]?.name||unitDef(state.project.kind)?.name||state.project.kind)+" first ("+estimateWork(state.project.left,constructionRate(getCity(state.project.city),state.project.kind))+"y)");
 if(def.need&&!known(def.need))missing.push("Research "+(techs[def.need]?.name||def.need));
 if(def.path&&state.path!==def.path)missing.push("Choose "+(paths[def.path]||def.path)+" path");
 if(def.requires&&!upgrade(c,def.requires))missing.push("Build "+(buildings[def.requires]?.name||def.requires)+" first");
 if(def.coastal&&!cityHasSea(c))missing.push("Requires a coastal city with sea inside its influence");
 if(def.naval&&!launchWater(c))missing.push("Requires a free coastal water tile to launch the ship");
 for(const r of ["wood","stone","food","metal"]){
  const deficit=(def[r]||0)-(state.resources[r]||0);
  if(deficit>0)missing.push("Need "+deficit+" more "+r);
 }
 return {ready:missing.length===0,missing,reason:missing.join(" · ")};
}
function researchLabel(){const p=state.researchProject;if(!p)return "No technology being researched.";return techs[p.id].name+" · "+p.progress+"/"+p.total+" work · ~"+estimateWork(p.total-p.progress,researchRate())+" years remaining";}
function panelContents(){
 let output="";
 if(menu==="turn"){
  const ready=state.units.filter(u=>u.owner==="player"&&!u.moved&&!u.embarkedOn).length;
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
  output+=item("🌍 World overview","Navigate Earth and see explored territory from above.",btn("Open world map","worldMap",false,"primary"));
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
     output+=item(jobLabel,d.type==="fish"?"Renewable fishing grounds · "+(4+2*upgrade(c,"fishingHut")+upgrade(c,"smokehouse")+upgrade(c,"harbor")+(known("netmaking")?2:0)+(known("engineering")?1:0))+" food/year.":d.type==="food"||d.type==="animals"?"Renewable after research.":remaining(x,y)+" units remaining.",
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
  const timberFood=upgrade(c,"market")?9:13,timberWood=upgrade(c,"market")?8:6;
  const tradeWait=Math.max(0,5-(state.year-(c.lastTimberTrade||-100)));
  const shortage=state.resources.food<timberFood;
  const tradeDesc="Import timber from other regions: "+timberFood+" food → "+timberWood+" wood. "+(tradeWait?"Caravan next available in "+tradeWait+" years.":shortage?"Need "+(timberFood-state.resources.food)+" more food.":"Caravan available now.")+" More timber may be scarce in desert, mountain or grassland climates.";
  output+=item("🛶 Timber caravan",tradeDesc,btn(tradeWait?"Caravan returning ("+tradeWait+"y)":shortage?"Need more food":"Trade food for wood","tradeWood:"+c.id,false,!tradeWait&&!shortage?"primary":"secondary"));

  // Ready and affordable developments always come first, even while
  // another building occupies the construction slot.
  const availableSoon=([id])=>projectRequirements(c,id,true).ready;
  const sortChoices=list=>list.sort((a,b)=>{
    const score=([id,d])=>{
      const r=projectRequirements(c,id,true);
      if(r.ready)return 0;
      if((d.need&&!known(d.need))||(d.path&&state.path!==d.path)||d.requires&&!upgrade(c,d.requires)||d.coastal&&!cityHasSea(c))return 2;
      return 1;
    };
    return score(a)-score(b);
  });
  const buildingRows=sortChoices(Object.entries(buildings)),unitRows=sortChoices(Object.entries(unitTypes));
  const readyBuildings=buildingRows.filter(availableSoon).length,readyUnits=unitRows.filter(availableSoon).length;
  output+='<h4 class="panel-section-title">🏗 Buildings · '+readyBuildings+' affordable</h4>';
  output+='<p class="hint">'+(state.project?"Construction is busy, but choices you can afford are still sorted first for your next project.":"Available, affordable buildings appear first; material shortages next; research-locked choices last.")+'</p>';
  for(const [id,d] of buildingRows){
   const req=projectRequirements(c,id),canBuyLater=projectRequirements(c,id,true).ready,
     cost=["wood","stone","food","metal"].filter(k=>d[k]).map(k=>d[k]+" "+k).join(" · ");
   const message=req.ready?"✅ Can construct now.":canBuyLater&&state.project?"✅ Materials and knowledge ready; finish active project first.":"Requires: "+req.reason+".";
   const label=req.ready?"🏗 Construct":canBuyLater&&state.project?"⏳ Queue after current project":req.missing.find(m=>m.startsWith("Need "))||"🔒 View requirements";
   output+=item((req.ready?"✅ ":"")+d.icon+" "+d.name+" ×"+upgrade(c,id),d.desc+" · Cost: "+cost+" · "+d.work+" work. "+message,
     btn(label,"build:"+id+":"+c.id,false,req.ready?"primary":"secondary"));
  }
  output+='<h4 class="panel-section-title">⚔ Train units · '+readyUnits+' affordable</h4>';
  for(const [id,d] of unitRows){
   const req=projectRequirements(c,id),canBuyLater=projectRequirements(c,id,true).ready,
     cost=["wood","stone","food","metal"].filter(k=>d[k]).map(k=>d[k]+" "+k).join(" · ");
   const message=req.ready?"✅ Can train now.":canBuyLater&&state.project?"✅ Available after current project.":"Requires: "+req.reason+".";
   const label=req.ready?"Train "+d.name:canBuyLater&&state.project?"⏳ Queue after current project":req.missing.find(m=>m.startsWith("Need "))||"🔒 View requirements";
   output+=item((req.ready?"✅ ":"")+d.icon+" "+d.name,d.desc+" · Strength "+d.strength+" · "+cost+" · "+d.work+" work. "+message,
     btn(label,"build:"+id+":"+c.id,false,req.ready?"primary":"secondary"));
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
  if(capital)output+=item("🏛 "+htmlSafe(capital.name)+" · "+htmlSafe(capital.civilisation||"City"),"Leader: "+htmlSafe(capital.leader||"Unknown")+" · Population "+capital.pop+" · Influence radius "+influenceRadius(capital)+" · ⚔ Attack "+cityAttack(capital)+" · 🛡 Defence "+cityDefense(capital),capital.owner==="player"?btn("Manage city","city"):"");
  else if(d&&known(d.tech)){
   let resource=d.type==="forage"?"wild food":d.type==="fish"?"coastal fish":d.type;
   let n=d.type==="fish"?"Renewable":remaining(x,y);
   output+=item(d.icon+" "+resource,"Visible supply: "+n+" · "+(d.type==="fish"?"Fish regenerate each year. Assign a coastal worker to produce food.":d.type==="food"?"Crops renew after agriculture.":d.type==="animals"?"Domestic pasture renews with animal husbandry.":"Finite resource.")+(job?" · One worker assigned.":""),c&&c!=="contested"&&c.owner==="player"?btn(job?"Remove worker":"Assign worker", "work"):"");
  }else output+=item("Unexplored potential",d?"Discover the appropriate technology to identify resources.":"No usable resource detected.","");
  if(capital&&capital.owner==="rival"&&state.path==="war")output+=item("⚔ Siege", "Move a ready army adjacent to this city to capture it.",btn("Attack city","attack:"+capital.id));
 }
 if(menu==="tech"){
  const researching=state.researchProject,rate=researchRate(),learned=state.tech.length;
  const ready=Object.entries(techs).filter(([id,d])=>!known(id)&&(!d.need||known(d.need)));
  output='<div class="tech-intro"><strong>Technology tree</strong><p>Research power: +'+rate+'/year · Discovered '+learned+' · Ready to explore '+ready.length+'. Follow the connections to unlock buildings, units and bonuses.</p></div>';
  if(researching){
   const r=techs[researching.id],pct=Math.min(100,Math.round(100*researching.progress/researching.total));
   output+='<div class="tech-current"><strong>🔬 Currently researching '+r.name+'</strong><div class="meter"><div class="meter-fill research-fill" style="width:'+pct+'%"></div></div><small>'+researching.progress+'/'+researching.total+' work · about '+estimateWork(researching.total-researching.progress,rate)+' years left</small></div>';
  }else{
   output+='<div class="tech-next"><strong>Available discoveries</strong><div class="tech-quick-picks">'+ready.map(([id,d])=>btn(d.name+' · '+d.cost+' work','tech:'+id,false,'primary')).join('')+'</div></div>';
  }
  output+='<div class="tech-tree">';
  for(const branch of techBranches){
   output+='<section class="tech-branch"><div class="tech-branch-head"><strong>'+branch.name+'</strong><span>'+branch.desc+'</span></div>';
   for(const id of branch.ids){
    const d=techs[id],active=researching?.id===id,done=known(id),prereq=d.need?techs[d.need]:null,
       needs=!!prereq&&!known(d.need),canStart=!done&&!active&&!researching&&!needs,
       status=done?'Researched':active?'In progress':needs?'Needs '+prereq.name:researching?'Research slot busy':'Ready now',
       depth=d.need?1+(techs[d.need]?.need?1:0):0;
    output+='<div class="tech-node '+(done?'researched':active?'researching':needs?'locked':researching?'busy':'available')+'" style="margin-left:'+(11+Math.min(depth,2)*12)+'px">';
    output+='<div class="tech-node-top"><strong>'+(done?'✓ ':active?'⏳ ':needs?'🔒 ':'🔬 ')+d.name+'</strong><span class="tech-status">'+status+'</span></div>';
    output+='<div class="tech-prereq">'+(prereq?'↳ Requires '+prereq.name:'● Starting technology')+' · '+d.cost+' research work</div>';
    output+='<div class="tech-bonus">'+bonusText(id)+'</div>';
    if(active)output+='<div class="meter"><div class="meter-fill research-fill" style="width:'+Math.min(100,Math.round(100*researching.progress/researching.total))+'%"></div></div>';
    else if(!done)output+=btn(canStart?'Research '+d.name:needs?'Research '+prereq.name+' first':'Finish current research','tech:'+id,!canStart,canStart?'primary':'secondary');
    output+='</div>';
   }
   output+='</section>';
  }
  output+='</div>';
 }
 if(menu==="path"){
  output="<p class='hint'>"+(state.year<100?"Available in Year 100 · "+(100-state.year)+" years remaining.":state.path?"Current direction: "+paths[state.path]:"Choose one direction to shape the civilisation.")+"</p>";
  const explains={science:"Knowledge increases your population's territorial reach. Win by reaching advanced research and building an Academy.",arts:"Culture expands borders and persuades nearby cities to join you.",faith:"Faith radiates outward, converting neighbouring cities into religious allies.",war:"Military conquest captures rival city tiles and their entire sphere of influence."};
  for(const [id,title] of Object.entries(paths))output+=item(title,explains[id],btn(state.path===id?"Chosen":"Choose "+title,"path:"+id,state.year<100||!!state.path));
  output+=item("Society progress","Knowledge "+state.knowledge+" · Culture "+state.culture+" · Faith "+state.faith+" · Military "+state.military,"");
 }
 if(menu==="units"){
  const ready=state.units.filter(u=>u.owner==="player"&&!u.moved&&!u.embarkedOn).length,total=state.units.filter(u=>u.owner==="player").length;
  output="<p class='hint'>"+ready+" of "+total+" units ready. Each acts once per year. Clubmen can hunt for food. Fishing Boats bring food home. Longships may carry one Settler or land fighter across the sea and unload onto a neighbouring shore.</p>";
  for(const u of state.units.filter(u=>u.owner==="player")){
   const d=unitDef(u.type),ship=u.embarkedOn?getUnit(u.embarkedOn):null;
   const nearby=!u.embarkedOn&&(state.encounters||[]).find(e=>currentlyVisible(e.x,e.y)&&distance(u.x,u.y,e.x,e.y)<=1);
   const nearbyShip=!u.embarkedOn&&!isNaval(u)?state.units.find(s=>s.owner==="player"&&s.type==="longship"&&!passengerFor(s)&&distance(s.x,s.y,u.x,u.y)<=1):null;
   const onboard=isNaval(u)?passengerFor(u):null;
   let controls="";
   if(!u.embarkedOn){
    controls+=btn(u.moved?"Already acted":"Select to move","unit:"+u.id,u.moved);
    if(u.type==="settler")controls+=btn("Found city","found:"+u.id,u.moved,"primary");
    if(unitHP(u)<unitMaxHP(u))controls+=btn("❤️ Rest & heal","rest:"+u.id,u.moved);
    if(isNaval(u))controls+=btn("🎣 Fish for food","fishShip:"+u.id,u.moved||terrain(u.x,u.y)!=="water","primary");
    if(nearbyShip)controls+=btn("⛵ Embark Longship","embark:"+u.id+":"+nearbyShip.id,u.moved,"primary");
    if(nearby)controls+=btn("View "+wildTypes[nearby.type].name,"inspect:"+nearby.id);
   }
   if(u.type==="longship"&&onboard){
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     if(!dx&&!dy)continue;
     const x=u.x+dx,y=u.y+dy;
     if(!inMap(x,y)||terrain(x,y)==="water"||cityAt(x,y)?.owner==="rival"||encounterAt(x,y))continue;
     controls+=btn("Disembark "+unitTitle(onboard)+" to "+x+","+y,"disembark:"+u.id+":"+x+":"+y,u.moved,"primary");
    }
   }
   const status=u.embarkedOn?"Aboard "+unitTitle(ship)+" (unload from its ship)":
      (u.moved?"Already acted this year":"Ready")+" · ⚔ "+unitAttack(u)+" · 🛡 "+unitDefense(u)+" · ❤️ "+unitHP(u)+"/"+unitMaxHP(u)+" · XP "+(u.xp||0)+" · Vision "+(d?.vision||2);
   output+=item((d?.icon||"🚶")+" "+unitTitle(u)+" at "+u.x+", "+u.y+(onboard?" · carrying "+unitTitle(onboard):""),status,controls);
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
 get("stats").innerHTML=(firstCity()?'<span class="chip" title="Stored food">🍲 <b>'+res.food+'</b></span><span class="chip">🪵 <b>'+res.wood+'</b></span><span class="chip">🪨 <b>'+res.stone+'</b></span><span class="chip">👥 <b>'+total+'('+assigned+')</b></span>':"")+'<span class="chip">Year <b>'+state.year+'</b></span>';
 const head=get("summary"),actions=get("actions"),rp=state.researchProject;
 get("leaderName").textContent=(state.leader?.leader||"Leader")+" · "+(state.leader?.name||"Civilisation");
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
 if(a.startsWith("tradeWood:"))return tradeTimber(a.slice(10));
 if(a==="worldMap")return showWorldMap();
 if(a.startsWith("rest:"))return restUnit(a.slice(5));
 if(a.startsWith("fishShip:"))return fishAtSea(a.slice(9));
 if(a.startsWith("embark:")){const [unitId,shipId]=a.slice(7).split(":");return embarkUnit(unitId,shipId);}
 if(a.startsWith("disembark:")){const [shipId,x,y]=a.slice(10).split(":");return disembarkUnit(shipId,Number(x),Number(y));}
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
 if(a.startsWith("unit:")){
  const u=getUnit(a.slice(5));
  if(!u||u.owner!=="player")return;
  if(u.embarkedOn)return toast("This unit is aboard a Longship. Select the ship to unload it.");
  if(u.moved)return toast("That unit has already acted this year.");
  moving=u.id;menu="";toast("Tap a reachable tile to move "+unitTitle(u)+".");renderUI();return;
 }
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
 const nationColour=c.colour||PALETTE[c.owner]||"#975f54";
 const roof=c.owner==="player"?"#a87c51":c.owner==="ally"?"#73a59e":nationColour;
 polygon([[x-w,y],[x,y+h],[x,y+h-high],[x-w,y-high]],"#cbb187","#5e4d3a");
 polygon([[x,y+h],[x+w,y],[x+w,y-high],[x,y+h-high]],"#987e67","#5e4d3a");
 polygon([[x-w,y-high],[x,y-h-high],[x+w,y-high],[x,y+h-high]],roof,"#654b40");
 const count=Object.values(c.buildings).reduce((a,b)=>a+b,0);
 if(count){ctx.fillStyle="#e9ce96";ctx.fillRect(x-22*z,y-12*z,9*z,10*z);ctx.fillRect(x+13*z,y-14*z,8*z,10*z);}
 ctx.fillStyle=nationColour;ctx.fillRect(x-3*z,y-high-24*z,3*z,24*z);
 polygon([[x,y-high-23*z],[x+18*z,y-high-17*z],[x,y-high-12*z]],nationColour);
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
function viewportBounds(){
 const pts=[[0,0],[width,0],[0,height],[width,height]];
 let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
 for(const [px,py] of pts){
  const wx=(px-width/2)/scale+camera.x,wy=(py-height/2)/scale+camera.y;
  const xx=wx/TW+wy/TH,yy=wy/TH-wx/TW;
  x0=Math.min(x0,xx);x1=Math.max(x1,xx);
  y0=Math.min(y0,yy);y1=Math.max(y1,yy);
 }
 return {x0:Math.max(0,Math.floor(x0)-5),x1:Math.min(MAP_W-1,Math.ceil(x1)+5),
         y0:Math.max(0,Math.floor(y0)-5),y1:Math.min(MAP_H-1,Math.ceil(y1)+5)};
}
function draw(){
 ctx.fillStyle="#315a68";ctx.fillRect(0,0,width,height);
 const render=[],bounds=viewportBounds();
 for(let y=bounds.y0;y<=bounds.y1;y++)for(let x=bounds.x0;x<=bounds.x1;x++){
  const p=screen(x,y);if(p.x< -100||p.x>width+100||p.y< -120||p.y>height+130)continue;
  if(!explored(x,y)){
   const dark=["#15272c","#172b30","#1b3035","#12252b"][Math.floor(dice(x,y)*4)];
   tile(x,y,dark);
   continue;
  }
  const t=terrain(x,y),n=Math.floor(dice(x,y)*4),seen=currentlyVisible(x,y);
  const colors={
   water:["#31798a","#428797","#388091","#337887"],
   forest:["#477c4f","#508858","#4a8154","#568f5a"],
   jungle:["#23664c","#277653","#31845b","#347f55"],
   hill:["#939181","#a2a091","#85867b","#9a9887"],
   grass:["#81a76e","#77a267","#8baf77","#7eaa6b"],
   steppe:["#abae71","#a6a968","#b2b57a","#bbb479"],
   desert:["#c5b18b","#cbb48b","#cfbc9a","#bca681"],
   tundra:["#a4adb0","#a9b5ad","#bbc5c1","#98a9ad"]
  }[t]||["#81a76e","#77a267","#8baf77","#7eaa6b"];
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
  if((t==="forest"||t==="jungle")&&scale>.58){tree(p.x-9*z,p.y+6*z);if(dice(x+3,y)>.45)tree(p.x+12*z,p.y+8*z);}
  if(t==="hill")polygon([[p.x-24*z,p.y+8*z],[p.x-3*z,p.y-24*z],[p.x+19*z,p.y+8*z]],"#8d9484","#697d6b");
  if(t==="water"){ctx.strokeStyle="#9ed1da60";ctx.beginPath();ctx.moveTo(p.x-13*z,p.y+1*z);ctx.lineTo(p.x+7*z,p.y+1*z);ctx.stroke();}
  if(CIV_WORLD.river(x,y)&&t!=="water"){ctx.strokeStyle="#6eb2cdba";ctx.lineWidth=Math.max(1,2*z);ctx.beginPath();ctx.moveTo(p.x-9*z,p.y);ctx.lineTo(p.x+9*z,p.y+2*z);ctx.stroke();}
  const d=deposit(x,y);
  if(d&&known(d.tech)&&remaining(x,y)>0&&scale>.48){ctx.fillStyle="#ecdfaf";ctx.font=Math.max(11,14*z)+"px sans-serif";ctx.fillText(d.icon,p.x-6*z,p.y+7*z);}
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
  if(u.embarkedOn)continue;
  const p=screen(u.x,u.y),z=scale;
  if(!currentlyVisible(u.x,u.y)&&u.owner!=="player")continue;
  if(isNaval(u)){
   ctx.fillStyle="#142e34ad";ctx.beginPath();ctx.ellipse(p.x,p.y+8*z,23*z,8*z,0,0,Math.PI*2);ctx.fill();
   polygon([[p.x-23*z,p.y],[p.x,p.y+12*z],[p.x+23*z,p.y],[p.x+14*z,p.y+11*z],[p.x-12*z,p.y+11*z]],u.type==="longship"?"#8b4c35":"#976c48","#583d2c");
   ctx.strokeStyle="#745337";ctx.lineWidth=Math.max(2,3*z);ctx.beginPath();ctx.moveTo(p.x,p.y+2*z);ctx.lineTo(p.x,p.y-37*z);ctx.stroke();
   polygon([[p.x+2*z,p.y-35*z],[p.x+22*z,p.y-7*z],[p.x+2*z,p.y-7*z]],u.type==="longship"?"#e0ae86":"#f4e2b8");
   if(u.type==="longship"){ctx.strokeStyle="#d9bea4";ctx.lineWidth=2*z;ctx.beginPath();ctx.moveTo(p.x-9*z,p.y-4*z);ctx.lineTo(p.x-13*z,p.y-18*z);ctx.stroke();}
   ctx.font="bold "+Math.max(10,12*z)+"px sans-serif";ctx.textAlign="center";ctx.fillStyle="#ffe9b8";ctx.fillText(unitTitle(u),p.x,p.y-44*z);ctx.textAlign="left";
   if(!u.moved&&activeUnit()?.id===u.id){ctx.strokeStyle="#ffe28d";ctx.lineWidth=2*z;ctx.beginPath();ctx.ellipse(p.x,p.y+8*z,27*z,11*z,0,0,Math.PI*2);ctx.stroke();}
   continue;
  }
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
function showWorldMap(){
 const panel=get("worldOverview");
 panel.hidden=false;
 drawWorldOverview();
}
function hideWorldMap(){get("worldOverview").hidden=true;}
function drawWorldOverview(){
 const canvas=get("worldMini"),ctx2=canvas.getContext("2d");
 if(!ctx2||typeof ctx2.createImageData!=="function")return;
 const img=ctx2.createImageData(MAP_W,MAP_H),pixels=img.data,discovered=state.explored||{};
 for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
  const offset=(y*MAP_W+x)*4,land=CIV_WORLD.isLand(x,y),seen=currentlyVisible(x,y),past=!!discovered[pos(x,y)];
  if(!land){
   pixels[offset]=seen?46:26;pixels[offset+1]=seen?119:69;pixels[offset+2]=seen?141:87;
  }else if(seen){
   pixels[offset]=146;pixels[offset+1]=172;pixels[offset+2]=111;
  }else if(past){
   pixels[offset]=89;pixels[offset+1]=124;pixels[offset+2]=94;
  }else{
   // Show faint geography but no hidden resources, rivals or their borders.
   pixels[offset]=56;pixels[offset+1]=77;pixels[offset+2]=64;
  }
  pixels[offset+3]=255;
 }
 ctx2.putImageData(img,0,0);
 for(const c of state.cities){
  if(c.owner!=="player"&&!currentlyVisible(c.x,c.y))continue;
  ctx2.beginPath();ctx2.arc(c.x,c.y,c.owner==="player"?3.5:2.3,0,Math.PI*2);
  ctx2.fillStyle=c.owner==="player"?"#ffde91":c.owner==="ally"?"#80d5b0":(c.colour||"#e78473");ctx2.fill();
  ctx2.strokeStyle="#152622";ctx2.lineWidth=1;ctx2.stroke();
 }
 for(const u of state.units){
  if(u.owner!=="player")continue;
  ctx2.fillStyle="#ffe09d";ctx2.fillRect(u.x-1,u.y-1,3,3);
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
  const standing=state.units.find(u=>u.owner==="player"&&!u.embarkedOn&&u.x===spot.x&&u.y===spot.y);
  if(standing){
    if(standing.moved)toast("That unit has already moved this year. Choose another ready unit.");
    else{moving=standing.id;menu="";toast(unitTitle(standing)+" selected. Tap an adjacent tile to move.");}
    renderUI();return;
  }
  if((state.stage==="move"||moving)&&state.units.some(u=>u.owner==="player"&&!u.moved&&!u.embarkedOn)){move(spot.x,spot.y);return;}
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
get("mapBtn").onclick=showWorldMap;
get("closeWorld").onclick=hideWorldMap;
get("homeView").onclick=()=>{
 const u=state.units.find(u=>u.owner==="player"),c=firstCity(),p=c||u||state.leader;
 center(p.x,p.y);hideWorldMap();
 toast("Map centred on "+(c?.name||state.leader?.capital||"your people")+".");
};
get("worldMini").addEventListener("click",e=>{
 const rect=get("worldMini").getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 const x=Math.max(0,Math.min(MAP_W-1,Math.floor((e.clientX-rect.left)*MAP_W/rect.width)));
 const y=Math.max(0,Math.min(MAP_H-1,Math.floor((e.clientY-rect.top)*MAP_H/rect.height)));
 center(x,y);hideWorldMap();
 const place=CIV_WORLD.coords(x,y);
 toast("Viewing "+Math.abs(place.lat).toFixed(1)+"°"+(place.lat>=0?"N":"S")+" · "+Math.abs(place.lon).toFixed(1)+"°"+(place.lon>=0?"E":"W")+". Explore with units to reveal details.");
});

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
center(unit?.x??firstCity()?.x??state.leader.x,unit?.y??firstCity()?.y??state.leader.y);
renderUI();showMainMenu();requestAnimationFrame(loop);
})();
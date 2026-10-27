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
 commerce:{name:"Trade Routes",cost:27,need:"writing",desc:"Unlocks timber caravans from Year 30 onward and improves exchange."},
 husbandry:{name:"Animal Husbandry",cost:21,need:"agriculture",desc:"Reveal wild herds and create renewable pastures."},
 metalworking:{name:"Metalworking",cost:28,need:"geology",desc:"Reveal ore deposits and develop metals."},
 engineering:{name:"Engineering",cost:37,need:"geology",desc:"Increase yields from all worked resource tiles."},
 fishing:{name:"Fishing",cost:6,desc:"Unlock 1 renewable food per year for each fishing worker. Coastal starts know Fishing."},
 netmaking:{name:"Net Making",cost:14,need:"fishing",desc:"+1 fish food per worked fishing tile and unlock the Smokehouse."},
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
 huntingLodge:{name:"Hunting Lodge",icon:"🏕️",wood:10,stone:0,work:18,need:"hunting",desc:"+1 food from worked wild-food tiles."},
 fishingHut:{name:"Fishing Hut",icon:"🎣",wood:9,stone:0,work:16,need:"fishing",coastal:true,desc:"+1 food per worked coastal fishing tile."},
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
 fishingBoat:{name:"Fishing Boat",icon:"⛵",wood:14,stone:0,food:2,work:18,strength:1,vision:3,need:"seafaring",requires:"harbor",naval:true,range:2,desc:"Spend an action to land 2 food at your nearest city. Its crew needs 1 food each year."},
 longship:{name:"Longship",icon:"🚢",wood:21,stone:8,food:4,work:30,strength:4,vision:4,need:"shipbuilding",requires:"shipyard",naval:true,range:3,desc:"Sail 3 tiles/year and carry one land unit. Fish for 1 food/action; its crew and hull need supplies."}
};
const unitDef=id=>unitTypes[id];
const fighter=u=>u&&["clubman","spearman","archer","swordsman","army"].includes(u.type);
const unitTitle=u=>unitTypes[u?.type]?.name||"Unit";
const bonusText=id=>{
 const map={
  agriculture:"🌾 Renewable farmland; base 1 food per worked crop tile",
  geology:"🪨 Reveal quarries and stone resources",
  writing:"📚 Library (+3 research/year), Market (+1 crop food)",
 commerce:"🐫 Timber caravans available from Year 30; Market improves timber exchange",
  husbandry:"🐂 Pasture +1 food/year; Stables improve livestock",
  metalworking:"⚔️ Ore, Forge, Swordsmen after Forge",
  engineering:"🛠️ +1 yield from each worked resource tile",
  hunting:"🍓 Hunting Lodge (+1 forage food); more food from hunts",
  scouting:"👣 Scout (two-tile moves, vision 4), Lookout Tower",
  toolmaking:"🔨 Workshop (+1 timber/stone yield; +1 build work)",
  archery:"🏹 Archer after Archery Range",
  drill:"🛡️ Spearman after Training Grounds",
  masonry:"🏰 City Walls (+4 city defence)",
  fishing:"🎣 Coastal fish worker yields 1 food/year; Fishing Hut +1",
  netmaking:"🕸️ +1 food per fishing worker, Smokehouse (+1)",
  seafaring:"⚓ Harbour (+1 fish food), Fishing Boat (2 food/action)",
  shipbuilding:"🚢 Shipyard and Longship (3-tile coastal sail)",
  navigation:"🧭 Open-sea routes, +1 sea move/year, +2 ship sight and Lighthouse"
 };
 return map[id]||"New discoveries";
};
const techBranches=[
 {name:"🌊 Coast & Sailing",desc:"Feed seaside cities, then launch boats and explore the sea.",ids:["fishing","netmaking","seafaring","shipbuilding","navigation"]},
 {name:"🌾 Food & Farming",desc:"Grow sustainable food on land and domesticate animals.",ids:["agriculture","husbandry","hunting"]},
 {name:"🛠️ Materials & Industry",desc:"Find minerals, improve resources and build stronger defences.",ids:["geology","toolmaking","metalworking","engineering","masonry"]},
 {name:"📜 Knowledge & Military",desc:"Explore the land, improve research and train specialised fighters.",ids:["scouting","writing","commerce","archery","drill"]}
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
 const d=CIV_WORLD.deposit(x,y);
 // Sparse finite scrub wood and washed-up timber make coastal stone/forage
 // settlements playable without inventing full forests or early caravans.
 if(d?.type==="forage"&&dice(x+37,y+93)>.66){
  let shore=false;
  for(let dy=-1;dy<=1&&!shore;dy++)for(let dx=-1;dx<=1;dx++)if(isCoastalWater(x+dx,y+dy)){shore=true;break;}
  if(shore)return {type:"wood",max:7+Math.floor(dice(x+44,y+76)*9),tech:"forestry",icon:"🪵",source:"Coastal scrub and driftwood"};
 }
 return d;
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
 const catchSize=(u.type==="fishingBoat"?2:1)+(known("netmaking")?1:0);
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
  const amount=e.type==="village"?(d[res]||0):Math.ceil((d[res]||0)/3);
  const n=Math.floor(amount*multiplier)+(res==="food"?extra:0);
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
  e.status="friendly";ready.moved=true;rewardSupplies(e,.25);e.lastGift=state.year;
  state.culture+=4;record("You befriend a village: +4 culture and a small gift of supplies.");
 }else if(action==="trade"){
  if(e.type!=="village"||e.status!=="friendly"||state.year-e.lastGift<5)return toast("The village has no supplies ready to trade yet.");
  ready.moved=true;e.lastGift=state.year;rewardSupplies(e,.3);record("Friendly villagers exchange food and wood with your travellers.");
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
    rewardSupplies(e,.6);
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
   rewardSupplies(e,.2);e.lastGift=state.year;
   record("A friendly village sends a small gift of supplies.");
  }
 }
 for(const c of myCities()){
  if((c.captives||0)>0){
   // Captives are not citizens: they speed construction, consume food and create unrest.
   // Captive upkeep is already charged in payUpkeep().
   c.unrest=(c.unrest||0)+1;
   if(c.unrest>=15&&state.year%5===0){
    c.captives--;c.unrest=Math.max(0,c.unrest-5);record("A captive escapes from "+c.name+" amid unrest.");
   }
  }else c.unrest=Math.max(0,(c.unrest||0)-1);
 }
}
// The royal court: recurring dilemmas, rival power centres and preventable coups.
// Keeping court data inside the game save makes each decision persistent.
let focusedCourtFaction=null;
const COURT_GROUPS={
 workers:{name:"Workers & guilds",title:"Guild Speaker",icon:"⚒️",colour:"#e1b57c"},
 military:{name:"Warriors & generals",title:"War Captain",icon:"🛡️",colour:"#bd8582"},
 faith:{name:"Priests & faith",title:"High Priestess",icon:"☀️",colour:"#a8a2d7"}
};
const COURT_SCENES={
 founding:{
  advisor:"Royal Steward",icon:"📜",type:"Council",title:"The Weight of the Crown",
  text:"{leader}, the settlement of {capital} begins to take shape. Three groups seek your ear: those who work the land, those who bear arms, and those who guide the temples. Each can help you rule; each may seek to rule instead.",
  choices:[
   {id:"listen",label:"Hear all three factions",detail:"Seek cooperation without making promises.",effect:{legitimacy:5,factions:{workers:{loyalty:5},military:{loyalty:5},faith:{loyalty:5}}}},
   {id:"bread",label:"Celebrate with the people",detail:"Open the granaries to win popular goodwill.",effect:{food:-5,legitimacy:7,factions:{workers:{loyalty:13,power:3}}}},
   {id:"guards",label:"Secure the throne first",detail:"Rely on the guards and risk appearing suspicious.",effect:{food:-3,legitimacy:-3,factions:{military:{loyalty:15,power:7},workers:{loyalty:-5}}}}
  ]
 },
 food:{
  advisor:"Royal Steward",icon:"🍞",type:"Provisions",title:"A Hungry Winter",
  text:"In {capital}, stores have fallen low and citizens argue over the last sacks of grain. The Steward warns that hunger may turn frustration into a workers' rebellion.",
  choices:[
   {id:"hunt",label:"Commission hunters and fishermen",detail:"Trade scarce timber for food brought from the countryside.",effect:{wood:-3,food:5,legitimacy:3,factions:{workers:{loyalty:7,intrigue:-3}}}},
   {id:"levy",label:"Take grain from the villages",detail:"Stores recover, but the workers resent the compulsory levy.",effect:{food:4,legitimacy:-7,factions:{workers:{loyalty:-14,intrigue:8,power:3}}}},
   {id:"ration",label:"Ration the royal household",detail:"A small saving, with a cost among privileged groups.",effect:{food:2,legitimacy:5,factions:{military:{loyalty:-5},faith:{loyalty:-4},workers:{loyalty:4}}}}
  ]
 },
 timber:{
  advisor:"Master Builder",icon:"🪵",type:"Public Works",title:"The Empty Timber Yard",
  text:"Builders in {capital} cannot find enough seasoned timber. The court suggests competing solutions, each with political consequences.",
  choices:[
   {id:"woodlands",label:"Fund an expedition to gather timber",detail:"Exchange food for a hard-won supply of wood.",effect:{food:-4,wood:4,legitimacy:2,factions:{workers:{loyalty:7,power:4}}}},
   {id:"requisition",label:"Requisition villagers' supplies",detail:"Gain timber quickly at the expense of popular trust.",effect:{wood:3,legitimacy:-6,factions:{workers:{loyalty:-11,intrigue:7}}}},
   {id:"conserve",label:"Preserve what remains",detail:"No timber arrives; the public admires the restraint.",effect:{legitimacy:3,factions:{workers:{loyalty:3}}}}
  ]
 },
 guilds:{
  advisor:"Guild Speaker",icon:"⚒️",type:"Petition",title:"The Builders Demand a Voice",
  text:"The workshops and fields of {capital} have organised a council. Their speaker requests better provisions and a place in decisions about the city.",
  choices:[
   {id:"seats",label:"Give guilds seats on the council",detail:"Loyalty rises, but their political power grows.",effect:{legitimacy:4,factions:{workers:{power:13,loyalty:15,intrigue:-8},military:{loyalty:-4}}}},
   {id:"wages",label:"Provide food and rest",detail:"A smaller concession with less political influence.",effect:{food:-4,legitimacy:3,factions:{workers:{loyalty:14,intrigue:-7}}}},
   {id:"deny",label:"Dismiss their petition",detail:"Keep power concentrated but encourage secret meetings.",effect:{legitimacy:-4,factions:{workers:{loyalty:-14,intrigue:12,power:3}}}}
  ]
 },
 army:{
  advisor:"War Captain",icon:"⚔️",type:"Military",title:"A Captain's Growing Reputation",
  text:"Soldiers sing of their victories and speak of the War Captain more often than the ruler. He asks for a larger voice in the government.",
  choices:[
   {id:"honours",label:"Grant honours and provisions",detail:"Make him an ally, but give the army greater influence.",effect:{food:-4,legitimacy:1,factions:{military:{loyalty:16,power:12,intrigue:-8}}}},
   {id:"civil",label:"Place the army under civilian oversight",detail:"Lower military influence, but risk an insult to officers.",effect:{legitimacy:4,factions:{military:{power:-14,loyalty:-12,intrigue:6},workers:{loyalty:5}}}},
   {id:"divide",label:"Divide the officers' commands",detail:"Disperse concentrated power while raising suspicion.",effect:{legitimacy:-3,factions:{military:{power:-11,loyalty:-6,intrigue:5}}}}
  ]
 },
 temple:{
  advisor:"High Priestess",icon:"🕯️",type:"Faith",title:"The Temples Speak",
  text:"Pilgrims gather as priests in {capital} seek a larger role in law and ceremony. The High Priestess asks whether her counsel carries the authority of the throne.",
  choices:[
   {id:"sponsor",label:"Sponsor the temples",detail:"Gain the clergy's friendship while increasing their influence.",effect:{wood:-4,legitimacy:2,factions:{faith:{loyalty:17,power:13,intrigue:-5}}}},
   {id:"plural",label:"Protect every tradition",detail:"Strengthen popular support but disappoint powerful priests.",effect:{legitimacy:7,factions:{workers:{loyalty:8},faith:{loyalty:-12,power:-3}}}},
   {id:"separate",label:"Limit priestly offices",detail:"Preserve royal independence at the cost of religious opposition.",effect:{legitimacy:1,factions:{faith:{power:-13,loyalty:-13,intrigue:9}}}}
  ]
 },
 captives:{
  advisor:"Royal Steward",icon:"⛓️",type:"Unrest",title:"Anger in the Workshops",
  text:"Captives taken in a raid labour beside the workers of {capital}. Their condition raises unrest and guild leaders question the ruler's judgement.",
  choices:[
   {id:"free",label:"Free the captives",detail:"Relieve unrest and restore trust, losing captive construction labour.",effect:{legitimacy:12,freeCaptives:true,factions:{workers:{loyalty:13,intrigue:-10},faith:{loyalty:3}}}},
   {id:"reforms",label:"Improve food and conditions",detail:"Spend provisions to calm resistance while keeping captive labour.",effect:{food:-5,unrest:-8,legitimacy:4,factions:{workers:{loyalty:10,intrigue:-6}}}},
   {id:"enforce",label:"Post guards at the worksites",detail:"Control the workforce by force and strengthen the garrison.",effect:{legitimacy:-8,factions:{military:{power:8,loyalty:6},workers:{loyalty:-13,intrigue:14}}}}
  ]
 },
 rumours:{
  advisor:"Royal Spymaster",icon:"🕵️",type:"Intelligence",title:"Whispers Behind Closed Doors",
  text:"The Spymaster hears rumours of secret meetings and gifts passing between courtiers. No single faction has acted yet, but suspicion is spreading.",
  choices:[
   {id:"investigate",label:"Commission an inquiry",detail:"Reduce secret plotting at the cost of trust among courtiers.",effect:{food:-3,legitimacy:3,factions:{workers:{intrigue:-10,loyalty:-3},military:{intrigue:-10,loyalty:-3},faith:{intrigue:-10,loyalty:-3}}}},
   {id:"open",label:"Call a public council",detail:"Diffuse tensions with openness and a communal feast.",effect:{food:-4,legitimacy:9,factions:{workers:{loyalty:6,intrigue:-5},military:{loyalty:6,intrigue:-5},faith:{loyalty:6,intrigue:-5}}}},
   {id:"ignore",label:"Dismiss the rumours",detail:"Spend nothing but allow secret networks to strengthen.",effect:{legitimacy:-3,factions:{workers:{intrigue:4},military:{intrigue:4},faith:{intrigue:4}}}}
  ]
 },
 merchant:{
  advisor:"Foreign Envoy",icon:"🐫",type:"Trade",title:"Traders at the City Gates",
  text:"Merchants have reached {capital} with goods from distant regions. The court debates who should control new routes and the taxes on commerce.",
  choices:[
   {id:"guild",label:"Let the guilds manage trade",detail:"Receive timber and empower commercial workers.",effect:{food:-4,wood:4,legitimacy:3,factions:{workers:{power:9,loyalty:7}}}},
   {id:"royal",label:"Place trade under royal authority",detail:"Gain supplies without surrendering control, at a political cost.",effect:{food:-5,wood:4,legitimacy:-2,factions:{workers:{loyalty:-9,intrigue:5}}}},
   {id:"decline",label:"Decline their offer",detail:"Keep your resources and avoid competition for trade routes.",effect:{legitimacy:3,factions:{faith:{loyalty:2}}}}
  ]
 },
 conspiracy:{
  advisor:"Royal Spymaster",icon:"🗝️",type:"DANGER",title:"A Conspiracy Against the Throne",
  text:"The Spymaster presents intercepted messages: {faction} have become powerful and disloyal. A coup could come within three years. Reduce their Threat below 48 through concessions, investigations or limiting their influence.",
  choices:[
   {id:"negotiate",label:"Offer concessions and provisions",detail:"Quickly improve loyalty, but give the plotters more influence.",effect:{food:-6,legitimacy:4,factions:{target:{loyalty:23,power:5,intrigue:-20}}}},
   {id:"expose",label:"Expose their leaders in public",detail:"Break the network at the risk of alienating their followers.",effect:{legitimacy:2,factions:{target:{power:-16,loyalty:-12,intrigue:-23}}}},
   {id:"reconcile",label:"Appeal to the people for unity",detail:"Free but less decisive, increasing popular legitimacy.",effect:{legitimacy:9,factions:{target:{loyalty:7,intrigue:-9},workers:{loyalty:2}}}}
  ]
 }
};
// Advisors reveal their perspectives, not the numerical faction changes.
// Consequences include longer-term rumours and unforeseen political reactions.
const COURT_STORIES={
 founding:{
  context:"The first walls stand, yet there is no settled custom for who advises the throne. The Guild Speaker represents those who built the houses. A captain keeps the gate by force of habit, and a priestess has begun to bless each harvest. None claims to challenge you, but each expects a place in the story of the new capital.",
  counsel:["The Steward: A ruler who hears everyone can avoid grave mistakes, but nobody likes waiting for an answer.","The Captain: The realm is new. There is still time to decide who may stand beside the throne."],
  choices:{listen:"Invite the guilds, guards and priests to speak as equals. Some may mistake patience for uncertainty.",bread:"Open the royal stores for a celebration that the people will remember. They may remember who served the food, too.",guards:"Give the captain responsibility for protecting the palace. It offers reassurance, although no throne should depend entirely on one commander."}
 },
 food:{
  context:"Traders arrive with empty sacks, fishermen argue with inland farmers, and the market square has begun to close early. Rumour claims the palace holds hidden stores. A winter of hunger would undermine more than the economy: every faction is watching how the ruler shares hardship.",
  counsel:["The Steward: A public ration will buy us time, but an angry market cannot be ordered to fill its stalls.","The Guild Speaker: The people will judge who eats first when the cupboards are bare."],
  choices:{hunt:"Send skilled hunters and fishermen farther from home, carrying provisions and tools. Their success is uncertain.",levy:"Claim grain from private stores under royal authority. It will restore order quickly, though not everyone will accept your reasons.",ration:"Begin rationing at the palace table and require the court to share in the hardship. Some courtiers will call it noble; others may quietly resent it."}
 },
 timber:{
  context:"A half-finished roof in {capital} has been left exposed to the weather. The Master Builder says the nearest usable timber is harder to reach than it was when the first families settled. Guild apprentices have offered to cross unfamiliar country, while nearby villages say they have already contributed enough.",
  counsel:["Master Builder: I can save the project, but not without taking something from somebody.","The Steward: There is no shortage of timber in the world. There is a shortage of people willing to bring it to our gates."],
  choices:{woodlands:"Pay for a journey into remote woodlands. The expedition may discover new supplies, or return with grievances.",requisition:"Order nearby settlements to surrender their spare beams and carts. Your builders will thank you, at least.",conserve:"Suspend wasteful work and reuse what can be recovered. It may take longer to finish, but avoids making a new enemy."}
 },
 guilds:{
  context:"Carpenters, masons and farm workers now hold meetings after dusk. Their speaker has brought a careful petition, signed by people whose labour makes the city possible. They do not ask for the crown. They ask that no new burden be imposed without their consent. The soldiers watch with interest.",
  counsel:["The Guild Speaker: We ask to be heard before our hands are ordered to move.","The War Captain: A council granted today may demand command of the gates tomorrow."],
  choices:{seats:"Offer the guild leaders permanent chairs at council meetings. It may settle their grievances and establish a new rival authority.",wages:"Promise better meals and reasonable time away from public works. The cost is immediate, the gratitude harder to measure.",deny:"Tell the delegation that royal authority cannot be negotiated. They leave politely, without saying where they will meet next."}
 },
 army:{
  context:"Returning patrols have been greeted in the streets. The captain's veterans are admired for keeping the road safe, and several young warriors have sworn loyalty to him personally. A courtier reports that the barracks now settles disputes without consulting the palace.",
  counsel:["The War Captain: My soldiers followed orders when no one else would. Would you have them treated as ordinary labourers?","The Steward: A commander can be your strongest shield, until the shield decides it owns the hand."],
  choices:{honours:"Seat the captain beside you and recognise his victories in public. The soldiers may become more devoted to the throne—or to him.",civil:"Require that military decisions receive approval from civilian councillors. The city may welcome restraint, but the officers may feel humiliated.",divide:"Give command of the patrols to separate officers. No one commands the entire army, although rivalry could create new dangers."}
 },
 temple:{
  context:"The temple steps are crowded each morning. Priests are settling family disputes, blessing new homes and recording promises that used to be witnessed by the palace. The High Priestess offers to formalise the relationship, while merchants fear the temple may soon speak for everyone.",
  counsel:["The High Priestess: A faith that protects the people also protects the ruler, if the ruler respects its place.","The Guild Speaker: Today they bless the market. Tomorrow they may decide who is permitted to sell there."],
  choices:{sponsor:"Contribute royal supplies to the temples and invite the priestess to major ceremonies. Her blessing may come with expectations.",plural:"Declare that several traditions may worship without interference. Ordinary people may appreciate the freedom; established priests may not.",separate:"Keep temple officials away from the royal courts and taxes. It preserves a boundary, but one side may insist on crossing it."}
 },
 captives:{
  context:"The workshops are productive, yet some of those carrying stone and timber arrived in chains after a raid. Local workers complain that their neighbours are being dismissed. The captives' families have petitioned for mercy, and the garrison warns of disorder if the question remains unsettled.",
  counsel:["The Steward: Coerced labour makes an impressive wall until the people who built it refuse to defend it.","The Captain: If we change the arrangement, the families who benefited from it will have questions of their own."],
  choices:{free:"Release the captives and ask them to remain as free citizens if they choose. Their labour may be lost, but the grievance might end.",reforms:"Improve provisions and introduce oversight in the workshops. It could ease anger without resolving every injustice.",enforce:"Assign armed guards to enforce the existing arrangements. Resistance may diminish in the streets while growing elsewhere."}
 },
 rumours:{
  context:"The Spymaster reports that letters have been delivered at night to houses near the palace. One officer was seen speaking privately with a priest, while a wealthy guild leader has quietly settled several debts. There is no evidence of a single plot. That may be the most disturbing part.",
  counsel:["The Spymaster: I know who spoke, not what they promised. A harsh response could create the very conspiracy we fear.","The Steward: If people cannot speak openly to their ruler, they will speak privately to one another."],
  choices:{investigate:"Allow a discreet inquiry into the meetings. An innocent courtier may never forgive being watched.",open:"Invite prominent figures to a public council, where disagreements must be voiced in daylight. The cost of hospitality is real.",ignore:"Treat these reports as the ordinary noise of politics. Perhaps nothing is wrong, or perhaps silence is precisely what the plotters want."}
 },
 merchant:{
  context:"A foreign caravan has reached the city with unfamiliar tools, timber and stories of markets beyond the known roads. Its leaders request safe passage and a clear agreement about tolls. The guilds see opportunity; the royal treasury sees revenue; the priests worry about customs arriving with the traders.",
  counsel:["The Foreign Envoy: Your neighbours are already listening. Only you can decide whose name appears on the agreement.","The Guild Speaker: We know the roads and their risks. Do not tax a trade you do not understand."],
  choices:{guild:"Give local merchants responsibility for the new routes. Trade may grow quickly, while their representatives gain independence.",royal:"Create a royal office for the trade and its tolls. Supplies will arrive under your seal, but officials can become targets.",decline:"Thank the envoy and refuse an agreement for now. The roads remain quiet, though another city may seize the opportunity."}
 },
 conspiracy:{
  context:"A messenger from the Spymaster has entered the chamber without asking permission. Intercepted notes refer to money changing hands, a private oath and a chosen date. Supporters of {faction} say their complaints have been ignored for years. Some may want reforms; others may already have chosen a replacement ruler.",
  counsel:["The Spymaster: I can name the messengers, but not every hand that has touched their letters.","The Steward: A frightened court is capable of mistakes as dangerous as betrayal itself."],
  choices:{negotiate:"Send a trusted envoy with terms that might reopen dialogue. The leaders could accept—or treat the offer as evidence that you are afraid.",expose:"Read the accusations before the assembly and name the suspected organisers. Their influence might collapse, or their followers might rally.",reconcile:"Ask citizens from every faction to stand for a public renewal of the realm. It may rebuild trust without addressing the hidden network."}
 }
};

// Historically inspired, state-dependent dilemmas. These are scenarios and
// design inspirations, not claims that every culture experienced identical events.
Object.assign(COURT_SCENES,{
 granaryFire:{
  advisor:"Keeper of Stores",icon:"🔥",type:"Civic crisis",title:"Smoke from the Granary",
  text:"An alarm has sounded at {capital}. Grain merchants report smoke near the public stores. Some blame accidental sparks; others accuse a guild overseer who recently argued with the crown.",
  choices:[
   {id:"guild",label:"Let the guilds investigate",detail:"Entrust the inquiry to the people most familiar with the stores.",effect:{food:-2,legitimacy:2,factions:{workers:{power:7,loyalty:10,intrigue:-4}}}},
   {id:"guard",label:"Place the garrison in charge",detail:"A swift armed response may prevent disorder but antagonise the storekeepers.",effect:{damageBuilding:"granary",legitimacy:-3,factions:{workers:{loyalty:-12,intrigue:8},military:{power:8,loyalty:8}}}},
   {id:"rebuild",label:"Open the records and offer compensation",detail:"An independent inquiry costs supplies and might uncover negligence at court.",effect:{wood:-4,food:-3,legitimacy:7,factions:{workers:{loyalty:9},faith:{power:2}}}}
  ]
 },
 worksite:{
  advisor:"Master Builder",icon:"🪓",type:"Labour",title:"The Cracked Scaffolding",
  text:"A half-finished project in {capital} has suffered a fall of timber and stone. Workers complain about unsafe conditions while the Captain argues that new delays threaten the realm.",
  choices:[
   {id:"pause",label:"Halt work for an inspection",detail:"A safety review could prevent another accident but will set back the project.",effect:{stallBuilding:2,legitimacy:3,factions:{workers:{loyalty:12,intrigue:-5},military:{loyalty:-4}}}},
   {id:"order",label:"Order the builders to press on",detail:"Ignore the guild petition and keep the deadline. The price of speed may be paid later.",effect:{wood:2,legitimacy:-4,factions:{workers:{loyalty:-14,intrigue:12}}}},
   {id:"masters",label:"Bring in independent master masons",detail:"Seek technical advice and spend materials now to preserve public confidence.",effect:{wood:-3,stone:-2,legitimacy:6,factions:{workers:{loyalty:7,power:4}}}}
  ]
 },
 garrison:{
  advisor:"War Captain",icon:"⚔️",type:"Military",title:"A Mutiny at the Barracks",
  text:"An officer refuses to lead the next patrol, saying that the troops' provisions are inadequate. The soldiers remain armed. If the matter is mishandled, seasoned fighters may turn against each other.",
  choices:[
   {id:"rations",label:"Provide fresh provisions and listen",detail:"The soldiers may return to duty, but the Captain's standing will grow.",effect:{food:-5,legitimacy:2,factions:{military:{loyalty:12,power:8,intrigue:-7}}}},
   {id:"punish",label:"Punish the officers publicly",detail:"Demonstrate that orders cannot be refused, even if discipline turns to resentment.",effect:{harmWarriors:2,harmCount:2,legitimacy:-4,factions:{military:{power:-5,loyalty:-14,intrigue:12}}}},
   {id:"divide",label:"Rotate the units between commanders",detail:"Reduce the opportunity for a single mutiny, while adding confusion to the ranks.",effect:{stallTraining:2,legitimacy:1,factions:{military:{power:-8,loyalty:-6,intrigue:3}}}}
  ]
 },
 sacredGround:{
  advisor:"High Priestess",icon:"🕯️",type:"Faith",title:"The Temple on Contested Ground",
  text:"A new shrine has been built beside a busy road. The priests call it holy land; the guilds say it blocks carts carrying grain and timber. Neither side wishes to give way without a ruling.",
  choices:[
   {id:"temple",label:"Confirm the priesthood's claim",detail:"Protect sacred space and risk alienating the people whose work feeds the city.",effect:{legitimacy:1,factions:{faith:{power:12,loyalty:10},workers:{loyalty:-9,intrigue:6}}}},
   {id:"road",label:"Keep the road open",detail:"Place commerce before the shrine. Some worshippers may see this as sacrilege.",effect:{damageBuilding:"temple",wood:2,legitimacy:3,factions:{workers:{loyalty:8},faith:{loyalty:-14,intrigue:11}}}},
   {id:"compromise",label:"Pay to build a second road",detail:"A costly compromise might satisfy both parties, or invite another petition.",effect:{wood:-4,stone:-2,legitimacy:6,factions:{faith:{loyalty:5},workers:{loyalty:5}}}}
  ]
 },
 grainEdict:{
  advisor:"Keeper of the Grain",icon:"🌾",type:"Provision",title:"A Crowd at the Grain Market",
  text:"Grain prices are rising near {capital}. Families gather in front of the stores while merchants accuse officials of interfering with trade. In the Roman world, disputed grain distribution could shake an entire city; this court now faces its own version of that puzzle.",
  choices:[
   {id:"subsidy",label:"Offer grain at a controlled price",detail:"Help the poorest households while forcing the court to bear the shortfall.",effect:{food:-6,legitimacy:8,factions:{workers:{loyalty:13,power:5}}}},
   {id:"inspect",label:"Investigate warehouses for hoarding",detail:"The evidence may expose fraud, or just provoke merchants who kept legitimate reserves.",effect:{wood:-1,legitimacy:2,factions:{workers:{loyalty:4,intrigue:-7}}}},
   {id:"market",label:"Leave prices to the market",detail:"Save the granaries and accept that not every family can buy bread.",effect:{legitimacy:-5,factions:{workers:{loyalty:-12,intrigue:8},faith:{loyalty:-3}}}}
  ]
 },
 ironDebate:{
  advisor:"Imperial Treasurer",icon:"⚖️",type:"Policy",title:"Who Controls the Iron?",
  text:"The treasury proposes controlling iron production to pay for soldiers and walls. Artisans protest that the metal they smelt belongs to the people who worked for it. Like the famous Han debate over salt and iron monopolies, the question pits state power against private livelihoods.",
  choices:[
   {id:"monopoly",label:"Reserve the forges for the state",detail:"Public arms and tools would take priority, but merchants may find new ways around royal inspectors.",effect:{ore:3,metal:1,legitimacy:-4,factions:{military:{loyalty:9,power:8},workers:{loyalty:-10,intrigue:9}}}},
   {id:"guild",label:"Permit guilds to regulate production",detail:"Rely on craftsmen's expertise, at the price of expanding their authority.",effect:{metal:1,legitimacy:4,factions:{workers:{loyalty:11,power:12},military:{loyalty:-5}}}},
   {id:"mixed",label:"Create shared oversight",detail:"Demand independent records and inspections before any privilege is granted.",effect:{wood:-3,legitimacy:7,factions:{workers:{loyalty:4},military:{loyalty:4},faith:{power:3}}}}
  ]
 },
 scribes:{
  advisor:"Royal Archivist",icon:"📜",type:"Knowledge",title:"The Missing Royal Records",
  text:"A collection of treaties and tax records has disappeared from the archives of {capital}. The scribes suspect a court official, but some papers may have been damaged by damp and neglect.",
  choices:[
   {id:"seize",label:"Search the scribes' homes",detail:"Recover evidence swiftly while risking a backlash from the learned class.",effect:{legitimacy:-3,factions:{workers:{loyalty:-7,intrigue:8}},damageBuilding:"library"}},
   {id:"copy",label:"Commission duplicate records",detail:"Protect the future at the expense of scarce writing supplies and labour.",effect:{wood:-3,legitimacy:5,factions:{workers:{loyalty:7}}}},
   {id:"public",label:"Invite an independent public inquiry",detail:"Ask the guilds and temples to examine the records together.",effect:{legitimacy:7,factions:{workers:{power:5},faith:{power:5},military:{loyalty:-3}}}}
  ]
 },
 veteranLand:{
  advisor:"War Captain",icon:"🏕️",type:"Settlement",title:"Land Promised to Veterans",
  text:"Soldiers who defended the realm request fields close to {capital}. Local farming families have worked those plots for generations. The Captain insists that service must be rewarded, while the Steward warns of a new land dispute.",
  choices:[
   {id:"settle",label:"Grant fields to the veterans",detail:"Provide for loyal soldiers at the cost of angering established workers.",effect:{food:3,legitimacy:-4,factions:{military:{loyalty:16,power:10},workers:{loyalty:-14,intrigue:9}}}},
   {id:"pay",label:"Offer provisions instead of land",detail:"Keep existing ownership intact but create ongoing expectations of royal generosity.",effect:{food:-6,legitimacy:3,factions:{military:{loyalty:9},workers:{loyalty:4}}}},
   {id:"frontier",label:"Ask veterans to defend the frontier",detail:"Promise future settlements if they can secure new territory; patrols may become less reliable in the meantime.",effect:{stallTraining:2,legitimacy:5,factions:{military:{power:-5,loyalty:4}}}}
  ]
 },
 pilgrims:{
  advisor:"Temple Custodian",icon:"☀️",type:"Religion",title:"Two Competing Festivals",
  text:"Rival priests have each announced a festival on the same day, while farmers say both celebrations will draw workers away from harvests. Religious leaders demand that the crown recognise one ceremony as the more sacred.",
  choices:[
   {id:"first",label:"Recognise the older temple",detail:"Support an established institution, though the rejected priests may gather allies.",effect:{legitimacy:1,factions:{faith:{power:10,loyalty:8,intrigue:9}},damageBuilding:"granary"}},
   {id:"free",label:"Protect both celebrations",detail:"Accept some disorder to keep different congregations under a common law.",effect:{food:-3,legitimacy:8,factions:{faith:{power:-5,loyalty:-5},workers:{loyalty:6}}}},
   {id:"quiet",label:"Postpone celebrations until harvest ends",detail:"Prioritise food production but risk appearing indifferent to faith.",effect:{food:3,legitimacy:2,factions:{faith:{loyalty:-12,intrigue:10},workers:{loyalty:8}}}}
  ]
 },
 caravanLoss:{
  advisor:"Foreign Envoy",icon:"🐫",type:"Trade",title:"A Caravan Missing on the Road",
  text:"Several supply carts have failed to arrive at {capital}. Traders blame raiders, but the Captain says a customs official may have diverted the caravan. The loss threatens supplies needed for construction.",
  choices:[
   {id:"escort",label:"Send soldiers to guard the road",detail:"Restore confidence at the risk of drawing troops away from other duties.",effect:{food:-3,wood:2,harmWarriors:1,legitimacy:4,factions:{military:{loyalty:8,power:5}}}},
   {id:"audit",label:"Investigate the customs officials",detail:"Pursue missing goods through paperwork and witnesses. The merchants may resent the delay.",effect:{wood:-2,legitimacy:5,factions:{workers:{loyalty:4,intrigue:-5}}}},
   {id:"pass",label:"Leave the merchants to settle it",detail:"Conserve public resources, but some traders may stop using your city.",effect:{legitimacy:-4,factions:{workers:{loyalty:-9,intrigue:8}}}}
  ]
 },
 succession:{
  advisor:"Royal Spymaster",icon:"👑",type:"Dynasty",title:"Who Speaks When the Throne Is Empty?",
  text:"The palace has no agreed rule for what happens when a ruler is absent or dies. Generals favour a warrior of proven strength; priests invoke older rituals; guilds ask for a council. The disagreement echoes real dynastic struggles from steppe courts to imperial palaces.",
  choices:[
   {id:"council",label:"Establish a council of electors",detail:"Spread responsibility among several groups, though the council may eventually govern without its ruler.",effect:{legitimacy:7,factions:{workers:{power:10,loyalty:8},faith:{power:8},military:{power:8}}}},
   {id:"heir",label:"Name a single chosen heir",detail:"Offer clarity while risking hostility from families who expected a say.",effect:{legitimacy:4,factions:{military:{loyalty:7},faith:{loyalty:-7},workers:{intrigue:9}}}},
   {id:"delay",label:"Refuse to discuss succession",detail:"Preserve the current ruler's freedom while leaving a question every courtier will ask privately.",effect:{legitimacy:-8,factions:{workers:{intrigue:9},military:{intrigue:10},faith:{intrigue:9}}}}
  ]
 },
 kurultai:{
  advisor:"Steppe Herald",icon:"🐎",type:"Imperial council",title:"A Summons to the Great Assembly",
  text:"Commanders of the Mongol realm call for a gathering to confirm authority and settle rival claims. Some expect you to seek their public consent; others urge you to rule through the strongest camp. Failure to negotiate the assembly could divide the army.",
  choices:[
   {id:"gather",label:"Invite all commanders to a great council",detail:"Gain their consent through discussion, but acknowledge their right to judge a ruler.",effect:{food:-5,legitimacy:8,factions:{military:{loyalty:12,power:9},workers:{loyalty:3}}}},
   {id:"command",label:"Declare that the Khan commands alone",detail:"Assert a single will and challenge the camps that insist on consultation.",effect:{legitimacy:-5,harmWarriors:2,factions:{military:{loyalty:-15,intrigue:15,power:-6}}}},
   {id:"envoys",label:"Send gifts and envoys to rival camps",detail:"Avoid an immediate confrontation by asking powerful captains to pledge loyalty privately.",effect:{food:-4,wood:-3,legitimacy:4,factions:{military:{loyalty:8,intrigue:-8,power:7}}}}
  ]
 }
});
Object.assign(COURT_STORIES,{
 granaryFire:{context:"Witnesses disagree over the smoke: a trader claims he saw a lamp fall, a guard remembers unfamiliar men near the storehouse, and the guild refuses to name its foreman. The grain saved today may mean little if the stores themselves are lost.",counsel:["Keeper of Stores: The doors must be guarded, but we cannot accuse a man because a soldier dislikes him.","Guild Speaker: No worker will speak freely while armed men stand over the ruined grain."],choices:{guild:"Let the workers establish what happened. They know the granaries, but may protect one of their own.",guard:"Put soldiers at every door and treat the fire as an attack. Quick certainty can become its own danger.",rebuild:"Pay for a public inquiry and recovery of the stores, knowing that food and timber are already scarce."}},
 worksite:{context:"The fallen scaffolding lies beside unfinished masonry. Guild leaders demand a pause; the War Captain demands completion before further enemy incursions. Neither admits responsibility for the collapsed beams.",counsel:["Master Builder: If I cannot examine the foundations, the next collapse will be worse.","War Captain: A city whose walls stand half built is inviting attack."],choices:{pause:"Stop work while specialists investigate the accident.",order:"Demand the original construction deadline be met despite the warning.",masters:"Hire experienced builders to inspect the site and advise the palace."}},
 garrison:{context:"A patrol has returned without permission. Armed soldiers complain that food has gone to public works while their camp goes hungry. The Captain claims he can restore discipline if the palace gives him a freer hand.",counsel:["War Captain: They have endured hardships no clerk understands; they must see that service matters.","Guild Speaker: Our workers have eaten no better, yet nobody carries swords into the market to bargain."],choices:{rations:"Spend scarce grain now and hear the officers' complaints.",punish:"Make an example of the mutineers and risk a clash among armed comrades.",divide:"Move soldiers between commanders to break the emerging loyalty to one captain."}},
 sacredGround:{context:"At dawn, workmen preparing a new road find the route blocked by a growing shrine. Priests claim older sacred rights and ask the ruler to intervene. Merchants insist that goods are spoiling while carts wait.",counsel:["High Priestess: A temple ignored today becomes a grievance remembered for generations.","Guild Speaker: If grain cannot move through the city, the gods will not fill our bowls."],choices:{temple:"Defend the shrine as sacred ground and require merchants to find another route.",road:"Open the road and refuse special exemptions for the temple.",compromise:"Spend public supplies on another route and hope neither side asks for more."}},
 grainEdict:{context:"The market is crowded but few families can afford grain. Some blame wealthy traders who control the stores; others say public intervention will cause even fewer merchants to arrive next season. The rulers of Rome confronted similar tensions around public grain distribution.",counsel:["Keeper of Grain: The crowd believes grain exists somewhere. It is the price, not the harvest, they are shouting about.","Treasurer: Once the crown promises cheap grain, the people will expect it every year."],choices:{subsidy:"Release royal grain at a lower price for households in need.",inspect:"Open merchant storehouses to inspectors and demand evidence before imposing prices.",market:"Let traders set the price and keep the treasury out of the exchange."}},
 ironDebate:{context:"The treasurer estimates that state control of iron could supply the army with better equipment. Smiths warn that no workshop will prosper under officials who determine every sale. The Han court once argued over a remarkably similar question.",counsel:["Treasurer: If a border city falls for want of weapons, who will thank us for protecting the smiths' profits?","Master Smith: If the court claims every furnace, men will hide their skill rather than sell it."],choices:{monopoly:"Give the crown first rights to metal and its manufacture.",guild:"Let independent smiths manage production and pay agreed dues.",mixed:"Require shared records and oversight without granting either side a monopoly."}},
 scribes:{context:"The archivist finds blank spaces where royal oaths and tax tallies should have been kept. The priests insist on ritual truth; the guilds say that important ledgers have been used as weapons against ordinary families.",counsel:["Royal Archivist: An altered record can change who owns a field, a wall or the right to command an army.","Guild Speaker: The scribes answer to the people who pay their wages, or they should."],choices:{seize:"Search the homes of clerks and treat the missing papers as sabotage.",copy:"Fund a new system of duplicate books kept in different places.",public:"Appoint an inquiry involving the guilds and the temples."}},
 veteranLand:{context:"The soldiers who fought for the city are asking to settle on prosperous land. Some fields are already claimed by families with no military service. Granting land may build a loyal frontier army—or create angry workers inside the gates.",counsel:["War Captain: Men who defended the harvest deserve to share it.","Steward: A grant that pleases one soldier can dispossess three farmers."],choices:{settle:"Grant fields to those who fought, despite longstanding claims.",pay:"Offer food and pensions instead of farmland.",frontier:"Promise new holdings beyond the frontier in return for continued service."}},
 pilgrims:{context:"Competing temple processions threaten the harvest schedule. Farmers need hands in the fields, but every priest expects recognition by the throne. An apparently ceremonial choice may define which leader speaks for the gods.",counsel:["High Priestess: Divided holy days can unite a kingdom if rulers are patient.","Guild Speaker: Nobody can harvest grain by watching two processions pass."],choices:{first:"Support the older priestly tradition and instruct the others to yield.",free:"Allow the two festivals to take place, even if work slows down.",quiet:"Put the harvest first and delay public celebrations."}},
 caravanLoss:{context:"Three carts have disappeared, bringing rumours of raiders, corrupt customs officers and merchant insurance schemes. The Captain requests more escorts, while the treasurer asks who signed the original trade agreement.",counsel:["Foreign Envoy: A road is only a trade route while people believe it is safe.","War Captain: I can guard merchants, but not every mile of empty countryside."],choices:{escort:"Send troops to protect the route and recover the lost goods.",audit:"Search the manifests and tax records for signs of fraud.",pass:"Leave the caravan guild to absorb the loss and decide if the route is worth maintaining."}},
 succession:{context:"One day the ruler will not be present to settle disputes. The commander says strength must decide; the temple favours sacred precedent; the guilds call for an agreement written before any crisis.",counsel:["Royal Spymaster: The danger is not who sits on the throne, but who believes they had the right to choose.","High Priestess: A law written while the ruler is alive may spare us a war when the ruler is not."],choices:{council:"Give powerful factions a recognised voice in deciding succession.",heir:"Name an heir and require public oaths of recognition.",delay:"Avoid binding the throne to a rule that future circumstances may not allow."}},
 kurultai:{context:"Some steppe commanders have travelled far expecting consultation in a great assembly. Others argue that open meetings invite intrigue. In the Mongol Empire, succession and consultation were practical questions of imperial survival.",counsel:["Steppe Herald: The camps are watching for respect as much as orders.","War Captain: A divided army is a feast for an enemy who approaches quietly."],choices:{gather:"Call a public council of powerful clan and army leaders.",command:"Refuse to allow commanders any vote on the authority of the Khan.",envoys:"Negotiate promises of loyalty with each camp separately."}}
});
const COURT_AFTERSHOCKS={
 founding:{
  listen:[{text:"The open council is praised in the streets, though some members have begun to meet without royal officials. Their new habits may last longer than the ruler expected.",effect:{legitimacy:3,factions:{workers:{power:7,intrigue:3}}}},
   {text:"The three factions disagree in public but remain willing to settle their disputes in the palace. An early custom of consultation has taken root.",effect:{legitimacy:5,factions:{faith:{loyalty:5},military:{loyalty:3}}}}],
  bread:[{text:"Families still speak warmly of the feast, but suppliers insist that several wealthy courtiers quietly diverted sacks of grain.",effect:{food:-4,factions:{workers:{intrigue:5}}}},
   {text:"The festival is remembered as the first common celebration of the city, drawing guilds and soldiers together.",effect:{legitimacy:5,factions:{workers:{loyalty:4}}}}],
  guards:[{text:"The guard captain now controls entry to the palace and some officers have begun to ask his permission before yours.",effect:{factions:{military:{power:9,intrigue:9}}}},
   {text:"The strengthened watch prevents a theft of state supplies and citizens praise the new order.",effect:{wood:3,legitimacy:4}}]
 },
 food:{
  hunt:[{text:"Hunters return with less game than promised and report that a distant settlement now objects to their camps.",effect:{food:-3,factions:{workers:{loyalty:-5}}}},
   {text:"The hunting camps discover an old trail to richer pasture, and supplies arrive unexpectedly.",effect:{food:4,factions:{workers:{loyalty:4}}}}],
  levy:[{text:"The compulsory grain levy has not been forgotten. Local families now hide supplies from royal collectors.",effect:{factions:{workers:{loyalty:-9,intrigue:9}}}},
   {text:"The emergency stores saved several households, but influential landowners now demand repayment.",effect:{food:-3,factions:{workers:{power:5}}}}],
  ration:[{text:"The palace's shared hardship is admired, yet several officers have been entertaining guests in private rather than attending court.",effect:{factions:{military:{intrigue:8,loyalty:-4}}}},
   {text:"Communal kitchens established during the rationing survive and are helping families through another difficult season.",effect:{food:3,legitimacy:3}}]
 },
 timber:{
  woodlands:[{text:"The timber expedition returns with wood and word of a promising stand of trees, but some workers refuse another journey without better terms.",effect:{wood:4,factions:{workers:{power:6,loyalty:-4}}}},
   {text:"A storm damages several carts on the return journey, and the promised timber arrives in smaller quantities.",effect:{wood:1,food:-2}}],
  requisition:[{text:"Families who lost their beams now gather at the guild hall, saying the crown took more than it promised.",effect:{factions:{workers:{loyalty:-10,intrigue:8}}}},
   {text:"A village elder offers timber in future in exchange for predictable agreements instead of sudden orders.",effect:{wood:2,factions:{workers:{loyalty:3}}}}],
  conserve:[{text:"The builders develop better ways to reuse old beams. Their success adds to the guilds' standing.",effect:{wood:3,factions:{workers:{power:5}}}},
   {text:"A neglected roof finally gives way, costing repairs that could have been prevented by an earlier decision.",effect:{wood:-2}}]
 },
 guilds:{
  seats:[{text:"The guild councillors quietly agree to consult one another before bringing proposals to the palace. Their influence is growing beyond the council chamber.",effect:{factions:{workers:{power:10,intrigue:6}}}},
   {text:"A dispute over working hours is resolved without violence. The guilds credit the ruler's willingness to listen.",effect:{legitimacy:5,factions:{workers:{loyalty:6}}}}],
  wages:[{text:"The promised provisions have raised expectations; the workers now ask whether the same benefits will be offered next year.",effect:{food:-3,factions:{workers:{power:5}}}},
   {text:"The better-fed workforce volunteers to repair neglected roads and warehouses after hours.",effect:{wood:3,factions:{workers:{loyalty:4}}}}],
  deny:[{text:"The guild speaker's petition circulates anonymously among traders and builders, gathering signatures away from the palace.",effect:{factions:{workers:{intrigue:10,loyalty:-5}}}},
   {text:"The petition is set aside for now, but the city loses several skilled workers to neighbouring settlements.",effect:{wood:-3}}]
 },
 army:{
  honours:[{text:"The War Captain's victories are now celebrated in songs more often than those of the ruler.",effect:{factions:{military:{power:10,intrigue:8}}}},
   {text:"The captain's public pledge of loyalty encourages the soldiers to return to royal command.",effect:{factions:{military:{loyalty:7,intrigue:-4}}}}],
  civil:[{text:"An officer refuses a council summons and younger soldiers speak of interference from people who have never carried a weapon.",effect:{factions:{military:{loyalty:-9,intrigue:8}}}},
   {text:"Civilian review uncovers missing stores in a distant garrison. The treasury recovers supplies.",effect:{wood:3,legitimacy:4}}],
  divide:[{text:"Two officers compete over recruits and are building rival circles of supporters.",effect:{factions:{military:{intrigue:12}}}},
   {text:"The divided commands remain effective but no single captain can claim credit for every victory.",effect:{factions:{military:{power:-6}}}}]
 },
 temple:{
  sponsor:[{text:"The High Priestess begins to settle disputes between merchants. People now seek her judgement before they seek the ruler's.",effect:{factions:{faith:{power:11,intrigue:5}}}},
   {text:"Temple granaries distribute aid after a poor harvest, drawing praise for both priesthood and crown.",effect:{food:4,factions:{faith:{loyalty:5}}}}],
  plural:[{text:"A smaller religious group thanks the ruler for protection, but established temple officials condemn the policy in their sermons.",effect:{factions:{faith:{loyalty:-8,intrigue:6}}}},
   {text:"The festivals of different traditions bring visitors and traders to the city.",effect:{wood:2,legitimacy:4}}],
  separate:[{text:"The priestess asks her followers to withhold support from royal officials until the temples are heard again.",effect:{factions:{faith:{intrigue:11,loyalty:-7}}}},
   {text:"Some citizens praise the clear boundary between temple and court, reducing religious disputes.",effect:{legitimacy:5,factions:{faith:{power:-4}}}}]
 },
 captives:{
  free:[{text:"Former captives establish families near the city and remember that the ruler granted their freedom.",effect:{legitimacy:5,factions:{workers:{loyalty:5}}}},
   {text:"Former owners petition the court for compensation, stirring resentment among influential households.",effect:{factions:{workers:{intrigue:6,loyalty:-3}}}}],
  reforms:[{text:"Improved provisions ease daily hardship, but one workshop foreman is accused of keeping the changes from labourers.",effect:{factions:{workers:{intrigue:8}}}},
   {text:"Inspectors enforce the new rules and an outbreak of unrest subsides.",effect:{unrest:-4,factions:{workers:{loyalty:5}}}}],
  enforce:[{text:"Guards keep the worksites quiet, but several captives escape and their families blame the crown.",effect:{unrest:6,factions:{workers:{intrigue:8}}}},
   {text:"The additional garrison is effective for a time, giving its captain more independence.",effect:{factions:{military:{power:8}}}}]
 },
 rumours:{
  investigate:[{text:"The Spymaster's inquiry finds an innocent family was watched. Their allies question whether anyone is safe from suspicion.",effect:{legitimacy:-5,factions:{workers:{intrigue:5}}}},
   {text:"One courier confesses to carrying secret messages, and a quiet network of plotters dissolves.",effect:{factions:{military:{intrigue:-5},faith:{intrigue:-5},workers:{intrigue:-5}}}}],
  open:[{text:"The public council produces some genuine agreements, but a few factions now meet separately before every assembly.",effect:{factions:{workers:{power:5},military:{power:4}}}},
   {text:"An officer and a guild speaker unexpectedly cooperate on a common proposal, calming rumours.",effect:{legitimacy:4}}],
  ignore:[{text:"The intercepted letters are still circulating. Their writers take the crown's silence as permission to recruit others.",effect:{factions:{workers:{intrigue:5},military:{intrigue:5},faith:{intrigue:5}}}},
   {text:"The suspected meetings turn out to have been a private dispute over a marriage and no wider plot emerges.",effect:{legitimacy:2}}]
 },
 merchant:{
  guild:[{text:"The merchants establish a permanent exchange house. The guild council is now wealthy enough to lend money to officials.",effect:{wood:3,factions:{workers:{power:9}}}},
   {text:"A caravan is lost to bandits and guild leaders ask for more guards on the road.",effect:{wood:-3,factions:{military:{power:3}}}}],
  royal:[{text:"The royal toll office has become profitable, but its chief clerk is accused of selling exemptions to friends.",effect:{factions:{workers:{intrigue:7}},legitimacy:-3}},
   {text:"The crown's trade agreement opens a regular supply route, improving the treasury's stores.",effect:{wood:4,legitimacy:2}}],
  decline:[{text:"The refused merchants settle in a neighbouring city, and the local guilds complain of a missed opportunity.",effect:{factions:{workers:{loyalty:-7}}}},
   {text:"When a competing trade deal collapses, the ruler's caution looks surprisingly wise.",effect:{legitimacy:4}}]
 },
 conspiracy:{
  negotiate:[{text:"A faction leader accepts the settlement in public but later asks for a separate guarantee of authority.",effect:{factions:{target:{power:7,intrigue:6}}}},
   {text:"Private letters reveal that the compromise persuaded several conspirators to withdraw.",effect:{factions:{target:{loyalty:8,intrigue:-7}}}}],
  expose:[{text:"Some accused courtiers were innocent. Their relatives now question the ruler's judgement.",effect:{legitimacy:-5,factions:{target:{loyalty:-4}}}},
   {text:"An exposed officer names two accomplices and the remaining plotters scatter.",effect:{factions:{target:{intrigue:-10}}}}],
  reconcile:[{text:"The public appeal wins cheers, but the organisers continue their private meetings.",effect:{factions:{target:{intrigue:7}}}},
   {text:"Citizens independently form a loyalist watch that makes conspiratorial meetings harder to organise.",effect:{factions:{target:{intrigue:-8}},legitimacy:4}}]
 }
};
Object.assign(COURT_AFTERSHOCKS,{
 granaryFire:{
  guild:[{text:"The guild inquiry finds a neglected grain store. The workers repaired the doors, but evidence suggests someone within the workshops may have hidden the first signs of fire.",effect:{damageBuilding:"granary",factions:{workers:{intrigue:6}}}},
   {text:"The guilds uncover a careless merchant's scheme and restore public confidence in the stores.",effect:{food:2,legitimacy:4,factions:{workers:{loyalty:5}}}}],
  guard:[{text:"The garrison holds the stores, but clerks discover that repairs were postponed while troops argued over who controlled the keys.",effect:{damageBuilding:"granary",food:-2,factions:{military:{power:6}}}},
   {text:"An armed patrol catches thieves in the grain yard and returns sacks to the city.",effect:{food:3,factions:{military:{loyalty:4}}}}],
  rebuild:[{text:"The public rebuilding committee is praised for fairness, but the price of timber has risen because merchants control the repair contracts.",effect:{wood:-3,factions:{workers:{power:6}}}},
   {text:"Workers begin regular inspections of the granary and uncover minor damage before another incident can spread.",effect:{legitimacy:5,factions:{workers:{loyalty:6}}}}]
 },
 worksite:{
  pause:[{text:"The inspection finds that rotten beams were used in the foundations. The project needs further work before it can safely continue.",effect:{stallBuilding:2,wood:-2}},
   {text:"Engineers discover a simpler method for supporting the masonry and the crews return to work with confidence.",effect:{wood:2,factions:{workers:{loyalty:6}}}}],
  order:[{text:"The hurried scaffolding finally collapses. Workers abandon the site and several storehouses are damaged in the chaos.",effect:{stallBuilding:3,damageBuilding:"sawmill",factions:{workers:{intrigue:9}}}},
   {text:"The building is completed under strict supervision, but guilds now send representatives to observe every royal order.",effect:{factions:{workers:{power:8,intrigue:5}}}}],
  masters:[{text:"The master masons expose dishonest suppliers, recovering material paid for twice.",effect:{wood:3,stone:2,legitimacy:3}},
   {text:"The new foremen are respected in the city, and some workers now look to them rather than to royal officials.",effect:{factions:{workers:{power:7,intrigue:4}}}}]
 },
 garrison:{
  rations:[{text:"The Captain presents the soldiers' loyalty as a personal victory and begins selecting new officers without consultation.",effect:{factions:{military:{power:11,intrigue:7}}}},
   {text:"Satisfied patrols return stolen grain found on the roads, saying the crown kept its promises.",effect:{food:3,factions:{military:{loyalty:7}}}}],
  punish:[{text:"The harsh punishment divides the barracks. Rival groups of soldiers draw weapons; wounded men must recover before returning to service.",effect:{harmWarriors:2,harmCount:2,factions:{military:{intrigue:9,loyalty:-5}}}},
   {text:"The example silences immediate opposition, but a quiet resentment lingers among officers.",effect:{factions:{military:{loyalty:-8,intrigue:8}}}}],
  divide:[{text:"The rotating officers quarrel over who has authority to train new recruits.",effect:{stallTraining:2,factions:{military:{intrigue:6}}}},
   {text:"No single officer can mobilise the garrison without help from the others. Their rivalry protects the throne.",effect:{factions:{military:{power:-6,intrigue:-5}}}}]
 },
 sacredGround:{
  temple:[{text:"Priests widen their shrine grounds. Frustrated cart drivers now use a dangerous detour, damaging a storehouse on the way.",effect:{damageBuilding:"granary",factions:{workers:{loyalty:-6}}}},
   {text:"Pilgrims begin bringing gifts and food to the shrine, easing tensions with the market.",effect:{food:3,factions:{faith:{loyalty:5}}}}],
  road:[{text:"The priesthood refuses to repair the disused shrine, and the building falls into disrepair as factions argue over jurisdiction.",effect:{damageBuilding:"temple",factions:{faith:{intrigue:8}}}},
   {text:"A practical new road shortens travel to the market and the merchants share some of their gains.",effect:{wood:3,legitimacy:3}}],
  compromise:[{text:"The second road proves longer and more expensive than the builders anticipated.",effect:{wood:-3,stone:-1}},
   {text:"The two groups agree to use separate routes on religious festivals; market trade improves.",effect:{food:2,legitimacy:5}}]
 },
 grainEdict:{
  subsidy:[{text:"Families thank the crown for the grain price, but suppliers now demand compensation each season.",effect:{food:-3,factions:{workers:{power:6}}}},
   {text:"The cheaper grain stabilises the market and merchants return after a period of uncertainty.",effect:{food:3,legitimacy:4}}],
  inspect:[{text:"The warehouse inspection finds forged measures, but the storage doors are damaged during the search.",effect:{damageBuilding:"granary",factions:{workers:{loyalty:5}}}},
   {text:"The accused merchants are cleared. Several offer new supplies to prove their goodwill.",effect:{food:3,legitimacy:3}}],
  market:[{text:"Angry citizens force their way into the granary after prices rise yet again.",effect:{damageBuilding:"granary",food:-4,factions:{workers:{intrigue:10}}}},
   {text:"The harvest improves and market prices fall without royal intervention. Some courtiers praise the earlier restraint.",effect:{legitimacy:4,food:2}}]
 },
 ironDebate:{
  monopoly:[{text:"Officials demand so much iron for garrisons that smiths begin selling secret supplies on the side.",effect:{ore:-2,factions:{workers:{intrigue:10,loyalty:-7}}}},
   {text:"The controlled foundries deliver a shipment of reliable tools for the army.",effect:{metal:2,factions:{military:{loyalty:5}}}}],
  guild:[{text:"The smiths' guild negotiates exclusive access to ore and begins to dictate who can purchase armour.",effect:{factions:{workers:{power:10},military:{loyalty:-5}}}},
   {text:"Independent foundries improve the quality of metal tools and share a small surplus with the palace.",effect:{metal:1,legitimacy:5}}],
  mixed:[{text:"The oversight council is consumed by disputes about ownership, slowing supplies to the garrison.",effect:{stallTraining:2,factions:{military:{intrigue:6}}}},
   {text:"The shared records reveal stolen ore and reduce mistrust between the smiths and soldiers.",effect:{ore:2,legitimacy:4}}]
 },
 scribes:{
  seize:[{text:"A scribe destroys a chest of records rather than let soldiers search it. The archive suffers further damage.",effect:{damageBuilding:"library",factions:{workers:{intrigue:7}}}},
   {text:"An official is found hiding land deeds and the lost documents are returned to the city.",effect:{legitimacy:4,factions:{workers:{loyalty:3}}}}],
  copy:[{text:"The copied records survive a later flood; public respect for the palace's administration rises.",effect:{legitimacy:5}},
   {text:"Several clerks demand higher wages after learning that their work is vital to the ruler.",effect:{food:-2,factions:{workers:{power:4}}}}],
  public:[{text:"The public inquiry becomes a forum for arguing over ancient privileges, strengthening temple and guild voices.",effect:{factions:{workers:{power:6},faith:{power:6}}}},
   {text:"The inquiry clears the scribes and uncovers missing supplies in an unrelated warehouse.",effect:{wood:3,legitimacy:3}}]
 },
 veteranLand:{
  settle:[{text:"Farmers displaced by veteran land grants refuse to work for the new owners; some workshops are sabotaged.",effect:{damageBuilding:"granary",factions:{workers:{loyalty:-10,intrigue:9}}}},
   {text:"The veterans farm their new holdings and contribute food to the capital.",effect:{food:4,factions:{military:{loyalty:5}}}}],
  pay:[{text:"Veterans demand that the food allowance be renewed even though the original treasury grant has been spent.",effect:{food:-4,factions:{military:{power:5}}}},
   {text:"A grateful veterans' association pledges to defend the city in an emergency.",effect:{factions:{military:{loyalty:8,intrigue:-5}}}}],
  frontier:[{text:"A frontier patrol returns badly hurt after probing hostile country.",effect:{harmWarriors:2,harmCount:2}},
   {text:"The veteran patrol establishes secure roads and discovers new supplies.",effect:{wood:3,food:2}}]
 },
 pilgrims:{
  first:[{text:"The excluded worshippers gather outside the temple and damage its doors in protest.",effect:{damageBuilding:"temple",factions:{faith:{intrigue:9}}}},
   {text:"The older festival draws donations from distant visitors to the capital.",effect:{food:3,legitimacy:3}}],
  free:[{text:"Merchants report that the two festivals draw visitors who purchase local goods.",effect:{wood:3,legitimacy:3}},
   {text:"Competing crowds block the market on the same day, spilling food and damaging public stores.",effect:{damageBuilding:"granary",food:-2}}],
  quiet:[{text:"Priests stage a small procession without permission. Royal guards disperse it and several soldiers are wounded.",effect:{harmWarriors:1,factions:{faith:{intrigue:7}}}},
   {text:"The delayed ceremonies are peaceful and leave the harvest undisturbed.",effect:{food:2,legitimacy:3}}]
 },
 caravanLoss:{
  escort:[{text:"The escort recovers the lost carts, but an ambush wounds soldiers who led the pursuit.",effect:{wood:4,harmWarriors:2}},
   {text:"The roads become safer and traders return to the capital.",effect:{wood:3,factions:{military:{loyalty:5}}}}],
  audit:[{text:"Customs officers destroy their records to hide theft, and the archive is damaged in the resulting confusion.",effect:{damageBuilding:"library",wood:-1}},
   {text:"An investigation uncovers a hidden store of confiscated tools.",effect:{wood:4,legitimacy:4}}],
  pass:[{text:"Merchants abandon the route and supplies intended for new buildings do not arrive.",effect:{wood:-3,legitimacy:-2}},
   {text:"A private trade guild negotiates new agreements and returns goods without royal assistance.",effect:{wood:2,factions:{workers:{power:7}}}}]
 },
 succession:{
  council:[{text:"Members of the council begin holding private meetings to prepare the next ruler, expanding their power independently of the throne.",effect:{factions:{workers:{power:7,intrigue:5},faith:{power:5},military:{power:5}}}},
   {text:"The council publicly renews its loyalty and calms uncertainty over the future.",effect:{legitimacy:6,factions:{workers:{loyalty:4},military:{loyalty:4},faith:{loyalty:4}}}}],
  heir:[{text:"A disappointed claimant recruits officers to support a different candidate.",effect:{factions:{military:{intrigue:12,loyalty:-7}}}},
   {text:"The declared heir gains respect after settling a dispute among the guilds.",effect:{legitimacy:5,factions:{workers:{loyalty:5}}}}],
  delay:[{text:"A rumour of the ruler's failing health spreads. Several courtiers make private preparations for succession.",effect:{factions:{workers:{intrigue:7},military:{intrigue:7},faith:{intrigue:7}}}},
   {text:"The ruler's continued strength quiets rumours for a few more seasons.",effect:{legitimacy:3}}]
 },
 kurultai:{
  gather:[{text:"The great assembly confirms support for the Khan, but commanders demand a formal right to be consulted on future campaigns.",effect:{factions:{military:{power:9,loyalty:5}}}},
   {text:"Rival camps settle their dispute at the assembly rather than on the battlefield.",effect:{legitimacy:6,factions:{military:{intrigue:-9}}}}],
  command:[{text:"Dissenting captains lead an armed confrontation that leaves veterans wounded.",effect:{harmWarriors:3,harmCount:2,factions:{military:{intrigue:11}}}},
   {text:"The most influential commanders submit after a decisive display of strength, though their loyalty is difficult to read.",effect:{factions:{military:{power:-7,loyalty:3}}}}],
  envoys:[{text:"Gifts to rival commanders buy peace briefly, but several now expect royal favour in exchange for obedience.",effect:{food:-3,factions:{military:{power:9}}}},
   {text:"The envoys negotiate a common oath that brings the camps together.",effect:{legitimacy:5,factions:{military:{loyalty:7,intrigue:-6}}}}]
 }
});
function courtStory(sceneId,p){
 const scene=COURT_SCENES[sceneId],story=COURT_STORIES[sceneId];
 const resolve=text=>String(text||"").replaceAll("{leader}",state.leader?.leader||"Ruler")
  .replaceAll("{capital}",firstCity()?.name||state.leader?.capital||"the capital")
  .replaceAll("{faction}",COURT_GROUPS[p?.target]?.name||"the plotters");
 return {opening:resolve(scene?.text),background:resolve(story?.context||""),
   counsel:(story?.counsel||[]).map(resolve),choices:story?.choices||{}};
}
function aftershockRoll(sceneId,optionId){
 // Deterministic across saves, different for each world, year and decision.
 const hash=(sceneId+":"+optionId).split("").reduce((h,ch)=>Math.imul(h,31)+ch.charCodeAt(0)|0,317);
 const seed=Number(state.worldSeed)||421,year=state.year;
 const roll=dice((seed%99791)+year*13+Math.abs(hash%100003),year*97+Math.abs(hash%53123));
 const variant=dice((seed%65537)+Math.abs(hash%16381),year*47+791)>0.43?0:1;
 return {trigger:roll<.6,variant,delay:2+Math.floor(dice((seed%19991)+year*29,Math.abs(hash%8719)+37)*4)};
}
function scheduleCourtAftershock(sceneId,choiceId,target){
 const options=COURT_AFTERSHOCKS[sceneId]?.[choiceId];
 if(!options?.length)return;
 const roll=aftershockRoll(sceneId,choiceId);
 if(!roll.trigger)return;
 const c=ensureCourt();
 c.aftershocks??=[];
 c.aftershocks.push({scene:sceneId,choice:choiceId,variant:roll.variant%options.length,
   target:target||null,due:state.year+roll.delay});
}
function resolveCourtAftershock(){
 const c=ensureCourt();c.aftershocks??=[];
 if(c.pending||state.overthrown)return false;
 const index=c.aftershocks.findIndex(a=>a.due<=state.year);
 if(index<0)return false;
 const event=c.aftershocks.splice(index,1)[0];
 const result=COURT_AFTERSHOCKS[event.scene]?.[event.choice]?.[event.variant];
 if(!result)return false;
 const consequences=applyCourtEffect(result.effect,event.target);
 const past=COURT_SCENES[event.scene],label=past?.title||"An old decision";
 c.pending={id:"aftermath",year:state.year,story:result.text+(consequences.length?" "+consequences.join(" "):""),
  title:label,target:event.target||null};
 c.history.unshift({year:state.year,scene:event.scene,choice:"Aftermath: "+label,target:event.target||null});
 c.history=c.history.slice(0,30);
 record("A past court decision has unforeseen consequences.");
 return true;
}
function acknowledgeCourtAftershock(){
 const c=ensureCourt();
 if(c.pending?.id!=="aftermath")return;
 c.pending=null;save();renderUI();
}
function defaultCourt(){
 return {legitimacy:72,factions:{
  workers:{power:32,loyalty:68,intrigue:5},
  military:{power:22,loyalty:66,intrigue:4},
  faith:{power:18,loyalty:67,intrigue:4}
 },pending:null,plot:null,nextSceneYear:23,lastSceneYear:0,lastCouncilYear:0,history:[]};
}
function ensureCourt(){
 if(!state.court)state.court=defaultCourt();
 const c=state.court;
 c.legitimacy??=72;c.factions??={};c.history??=[];
 c.nextSceneYear??=Math.max(22,state.year+9);
 if(c.lastSceneYear===0&&c.nextSceneYear<20)c.nextSceneYear=Math.max(22,state.year+5);
 c.lastSceneYear??=0;c.lastCouncilYear??=0;
 c.aftershocks??=[];
 for(const [id,base] of Object.entries(defaultCourt().factions)){
  if(!c.factions[id])c.factions[id]={...base};
  for(const key of ["power","loyalty","intrigue"])c.factions[id][key]??=base[key];
 }
 return c;
}
function courtClamp(n){return Math.max(0,Math.min(100,Math.round(n)));}
function factionRisk(id){
 const c=ensureCourt(),f=c.factions[id];
 if(!f)return 0;
 return courtClamp(f.power*(100-f.loyalty)/100*.94+f.intrigue*.47+Math.max(0,55-c.legitimacy)*.6);
}
function courtLeaderInDanger(){
 const ids=Object.keys(COURT_GROUPS).sort((a,b)=>factionRisk(b)-factionRisk(a));
 return {id:ids[0],risk:factionRisk(ids[0])};
}
function courtLevel(){
 if(state.overthrown)return "Overthrown";
 if(ensureCourt().plot)return "Conspiracy";
 const risk=courtLeaderInDanger().risk;
 return risk>=50?"High risk":risk>=30?"Uneasy":"Stable";
}
function costAvailable(effect){
 if(!effect)return false;
 return ["wood","stone","food","metal","ore","animals"].every(k=>(state.resources[k]||0)+((effect.resources||{})[k]||0)+(k==="wood"?(effect.wood||0):k==="food"?(effect.food||0):0)>=0)
   &&(state.research||0)+((effect.resources||{}).research||0)>=0;
}
function applyCourtEffect(effect,target){
 const court=ensureCourt();
 if(!effect)return;
 for(const [key,d] of Object.entries(effect.resources||{})){
  if(key==="research")state.research=Math.max(0,state.research+d);
  else if(state.resources[key]!==undefined)state.resources[key]=Math.max(0,state.resources[key]+d);
 }
 if(effect.wood)state.resources.wood=Math.max(0,state.resources.wood+effect.wood);
 if(effect.food)state.resources.food=Math.max(0,state.resources.food+effect.food);
 court.legitimacy=courtClamp(court.legitimacy+(effect.legitimacy||0));
 for(const [key,changes] of Object.entries(effect.factions||{})){
  const id=key==="target"?target:key,f=court.factions[id];
  if(!f)continue;
  for(const field of ["power","loyalty","intrigue"])if(changes[field]!==undefined)
   f[field]=courtClamp(f[field]+changes[field]);
 }
 if(effect.unrest)for(const city of myCities())city.unrest=Math.max(0,(city.unrest||0)+effect.unrest);
 if(effect.freeCaptives){
  for(const city of myCities()){city.captives=0;city.unrest=Math.max(0,(city.unrest||0)-10);}
 }
 const consequences=[];
 if(effect.damageBuilding){
  const selected=damageCityBuilding(effect.damageBuilding);
  if(selected)consequences.push((buildings[selected.type]?.name||selected.type)+" at "+selected.city.name+" was damaged; repair it in Buildings.");
  else{state.resources.wood=Math.max(0,state.resources.wood-2);consequences.push("No buildings could be targeted. Saboteurs stole 2 wood instead.");}
 }
 if(effect.harmWarriors){
  const injured=woundCourtUnits(effect.harmWarriors,Math.max(1,effect.harmCount||1));
  if(injured)consequences.push(injured+" soldier"+(injured===1?" was":"s were")+" injured. Rest units to recover HP.");
  else{const c=firstCity();if(c)c.unrest=(c.unrest||0)+3;consequences.push("No troops could be harmed; disorder increased instead.");}
 }
 if(effect.stallBuilding&&state.project){
  state.project.stalledUntil=Math.max(state.project.stalledUntil||0,state.year+effect.stallBuilding);
  consequences.push("Building work suspended through Year "+state.project.stalledUntil+".");
 }
 if(effect.stallTraining&&state.unitProject){
  state.unitProject.stalledUntil=Math.max(state.unitProject.stalledUntil||0,state.year+effect.stallTraining);
  consequences.push("Unit training interrupted through Year "+state.unitProject.stalledUntil+".");
 }
 return consequences;
}
function courtEffectText(effect,target){
 const parts=[];
 for(const [key,n] of Object.entries(effect.resources||{}))if(n)parts.push((n>0?"+":"")+n+" "+key);
 if(effect.wood)parts.push((effect.wood>0?"+":"")+effect.wood+" wood");
 if(effect.food)parts.push((effect.food>0?"+":"")+effect.food+" food");
 if(effect.legitimacy)parts.push((effect.legitimacy>0?"+":"")+effect.legitimacy+" legitimacy");
 for(const [key,changes] of Object.entries(effect.factions||{})){
  const name=key==="target"?(COURT_GROUPS[target]?.name||"Plotters"):COURT_GROUPS[key]?.name;
  if(!name)continue;
  for(const [attribute,amount] of Object.entries(changes))if(amount)parts.push(name+": "+(amount>0?"+":"")+amount+" "+attribute);
 }
 if(effect.freeCaptives)parts.push("Release all captives; unrest falls");
 if(effect.unrest)parts.push("City unrest "+(effect.unrest>0?"+":"")+effect.unrest);
 return parts.join(" · ")||"No immediate change";
}
function presentCourtScene(id,target=null){
 const c=ensureCourt();
 if(c.pending||state.overthrown||!COURT_SCENES[id])return false;
 c.pending={id,target,year:state.year};
 c.lastSceneYear=state.year;
 c.nextSceneYear=state.year+11+Math.floor(dice((state.worldSeed||100)%9009,state.year+128)*7);
 return true;
}
function chooseCourtOption(choiceId){
 const c=ensureCourt(),p=c.pending;if(!p||state.overthrown)return;
 const scene=COURT_SCENES[p.id],choice=courtChoices(p.id).find(v=>v.id===choiceId);
 if(!choice)return;
 if(!costAvailable(choice.effect))return toast("You lack the resources for that decision.");
 const consequences=applyCourtEffect(choice.effect,p.target);
 scheduleCourtAftershock(p.id,choice.id,p.target);
 c.history.unshift({year:state.year,scene:p.id,choice:choice.label,target:p.target||null});
 c.history=c.history.slice(0,30);
 c.pending=null;
 record("Court decision: "+choice.label+".");
 for(const event of consequences)record("Court consequence: "+event);
 if(c.plot&&factionRisk(c.plot.faction)<48){
  record("The conspiracy loses support and its members disperse.");
  c.plot=null;
 }
 save();renderUI();
}
function courtCouncilAction(faction,action){
 if(!myCities().length||state.overthrown||ensureCourt().pending)return;
 const c=ensureCourt();if(c.lastCouncilYear===state.year)return toast("You have already issued a court order this year.");
 const f=c.factions[faction];if(!f)return;
 const actions={
  reward:{resources:{food:-4},factions:{target:{loyalty:14,power:4,intrigue:-8}},legitimacy:2,label:"Honoured the "+COURT_GROUPS[faction].name},
  investigate:{resources:{food:-2},factions:{target:{loyalty:-5,intrigue:-18}},legitimacy:1,label:"Investigated the "+COURT_GROUPS[faction].name},
  restrict:{factions:{target:{power:-14,loyalty:-12,intrigue:7}},legitimacy:-3,label:"Restricted the "+COURT_GROUPS[faction].name}
 };
 const selected=actions[action];if(!selected)return;
 if(!costAvailable(selected))return toast("Not enough supplies for this court order.");
 applyCourtEffect(selected,faction);
 c.lastCouncilYear=state.year;
 record(selected.label+".");
 if(c.plot&&factionRisk(c.plot.faction)<48){record("The plotters abandon their conspiracy.");c.plot=null;}
 save();renderUI();
}
function courtEventConditions(){
 const cities=myCities(),c=ensureCourt();
 const army=state.units.filter(u=>u.owner==="player"&&fighter(u));
 const built=k=>cities.some(city=>upgrade(city,k)>0);
 const project=!!state.project,train=!!state.unitProject;
 const food=state.resources.food,wood=state.resources.wood,pop=citizens();
 const status={
  food:food<Math.max(12,pop*3),timber:wood<8,
  captives:cities.some(city=>(city.captives||0)>0),
  army:army.length>=2||c.factions.military.power>45,
  guilds:assignedWorkers()>0,
  temple:built("temple")||c.factions.faith.power>=38,
  rumours:Object.keys(c.factions).some(id=>c.factions[id].intrigue>18),
  merchant:known("commerce")&&state.year>=35,
  granaryFire:built("granary"),
  worksite:project&&state.year>=20,
  garrison:army.length>=2,
  sacredGround:built("temple")&&state.year>=35,
  grainEdict:(built("granary")||state.leader?.id==="roman")&&food<Math.max(25,pop*6)&&state.year>=32,
  ironDebate:known("metalworking")&&state.year>=45,
  scribes:(built("library")||known("writing"))&&state.year>=34,
  veteranLand:army.length>=3&&state.year>=52,
  pilgrims:built("temple")&&state.year>=42,
  caravanLoss:known("commerce")&&state.year>=45,
  succession:state.year>=70,
  kurultai:state.leader?.id==="mongol"&&state.year>=45
 };
 return status;
}
const COURT_TECH_CHOICES={
 food:[
  {id:"harvest",label:"Issue an agricultural improvement decree",needTech:"agriculture",detail:"Redirect available labour to irrigation and shared seed reserves. The builders will have fewer hands for other work.",effect:{wood:-2,food:4,legitimacy:5,factions:{workers:{loyalty:7,power:5}}}}
 ],
 timber:[
  {id:"forestry",label:"Organise managed wood-cutting",needTech:"forestry",detail:"Set boundaries around woodlands and encourage replanting. Early supplies may remain scarce.",effect:{wood:3,legitimacy:3,factions:{workers:{loyalty:4,power:4}}}}
 ],
 garrison:[
  {id:"oath",label:"Establish a written military oath",needTech:"writing",detail:"Clarify what the army owes the crown and what the crown owes its fighters, though written contracts cannot force loyalty.",effect:{wood:-2,legitimacy:5,factions:{military:{loyalty:8,intrigue:-6,power:3}}}}
 ],
 guilds:[
  {id:"charter",label:"Grant a regulated guild charter",needTech:"commerce",detail:"Write enforceable terms for wages, taxes and public works. The guilds may use that charter to secure a stronger political voice.",effect:{legitimacy:6,factions:{workers:{loyalty:9,power:9,intrigue:-6}}}}
 ],
 ironDebate:[
  {id:"quality",label:"Set public quality standards",needTech:"engineering",detail:"Standardise metal tools and armour without claiming full ownership of the forges.",effect:{wood:-2,metal:1,legitimacy:6,factions:{workers:{loyalty:8},military:{loyalty:6}}}}
 ],
 rumours:[
  {id:"agents",label:"Send trained scouts to gather testimony",needTech:"scouting",detail:"Seek stronger evidence before anyone is accused. Covert investigation could alarm the court.",effect:{food:-2,legitimacy:3,factions:{workers:{intrigue:-7},military:{intrigue:-7},faith:{intrigue:-7}}}}
 ],
 worksite:[
  {id:"engineering",label:"Commission an engineering assessment",needTech:"engineering",detail:"Ask learned builders to study the failure rather than accept political accusations.",effect:{wood:-2,stone:-1,legitimacy:7,factions:{workers:{loyalty:10,intrigue:-7}}}}
 ],
 sacredGround:[
  {id:"register",label:"Record sacred boundaries in law",needTech:"writing",detail:"Have scribes agree formal limits with temple and market officials. Future arguments may still arise.",effect:{wood:-2,legitimacy:7,factions:{faith:{loyalty:7},workers:{loyalty:7}}}}
 ],
 succession:[
  {id:"writtenLaw",label:"Issue a written law of succession",needTech:"writing",detail:"Create a formal tradition backed by witnesses. Powerful families might reinterpret it later.",effect:{legitimacy:9,factions:{faith:{loyalty:5},workers:{loyalty:5},military:{loyalty:5}}}}
 ]
};
function courtChoices(id){
 const base=COURT_SCENES[id]?.choices||[];
 return [...base,...(COURT_TECH_CHOICES[id]||[]).filter(option=>known(option.needTech))];
}
function chooseRandomCourtScene(){
 const possible=courtEventConditions(),c=ensureCourt();
 const weighted=[];
 const push=(id,weight=1)=>{if(possible[id])for(let n=0;n<weight;n++)weighted.push(id);};
 push("food",state.resources.food===0?6:4);
 push("timber",3);push("captives",3);push("granaryFire",3);
 push("worksite",3);push("garrison",3);push("sacredGround",2);
 push("grainEdict",3);push("ironDebate",3);push("scribes",3);
 push("veteranLand",2);push("pilgrims",3);push("caravanLoss",3);
 push("succession",2);push("kurultai",5);
 push("army",2);push("temple",2);push("guilds",2);push("rumours",2);push("merchant",2);
 const recent=c.history.slice(0,4).map(e=>e.scene);
 const options=weighted.filter(id=>!recent.includes(id));
 const choices=options.length?options:weighted.length?weighted:["guilds","rumours"];
 const n=Math.floor(dice((state.worldSeed||123)%32749+state.year*13,state.year*19+543)*choices.length);
 return choices[n]||"guilds";
}

function advanceCourt(){
 if(!myCities().length||state.overthrown)return;
 const c=ensureCourt(),workers=c.factions.workers,military=c.factions.military,faith=c.factions.faith;
 const cities=myCities(),troops=state.units.filter(u=>u.owner==="player"&&!isNaval(u)&&fighter(u)),
     temples=cities.reduce((n,city)=>n+upgrade(city,"temple"),0),
     barracks=cities.reduce((n,city)=>n+upgrade(city,"barracks"),0),
     unrest=cities.reduce((n,city)=>n+(city.unrest||0),0);
 const targets={
  workers:Math.min(94,26+citizens()*3+assignedWorkers()*2+unrest*.4),
  military:Math.min(96,17+troops.reduce((n,u)=>n+u.strength*2.8,0)+barracks*12+state.military*.06),
  faith:Math.min(96,15+temples*16+state.faith*.12)
 };
 for(const [id,f] of Object.entries(c.factions)){
  // Factions grow through real game activities. They do not instantly become
  // dangerous; disloyalty and schemes matter as much as raw power.
  const diff=targets[id]-f.power;
  f.power=courtClamp(f.power+Math.max(-2,Math.min(3,diff*.19)));
  if(f.power>=60&&f.loyalty<64)f.intrigue=courtClamp(f.intrigue+2);
  else if(f.loyalty>=65)f.intrigue=courtClamp(f.intrigue-1);
  if(f.power>=78&&f.loyalty>35)f.loyalty=courtClamp(f.loyalty-1);
 }
 if(state.resources.food===0){
  c.legitimacy=courtClamp(c.legitimacy-3);
  workers.loyalty=courtClamp(workers.loyalty-4);
  workers.intrigue=courtClamp(workers.intrigue+3);
 }
 if(unrest>6){workers.loyalty=courtClamp(workers.loyalty-2);workers.intrigue=courtClamp(workers.intrigue+2);}
 if(c.legitimacy<35&&state.year%3===0)c.legitimacy=courtClamp(c.legitimacy-1);
 if(c.plot){
  const risk=factionRisk(c.plot.faction);
  if(risk<48){
   record("The conspiracy against the crown collapses.");
   c.plot=null;
  }else if(state.year>=c.plot.deadline){
   const group=COURT_GROUPS[c.plot.faction];
   state.overthrown={faction:c.plot.faction,year:state.year,risk,
     message:"The "+group.name+" seize power in "+(firstCity()?.name||"the capital")+" after your council fails to restrain their influence."};
   record("The throne is overthrown by "+group.name+".");
   c.pending=null;
   return;
  }
 }
 const threat=courtLeaderInDanger();
 if(!c.plot&&threat.risk>=66){
  c.plot={faction:threat.id,started:state.year,deadline:state.year+3};
  presentCourtScene("conspiracy",threat.id);
  record("A conspiracy has been discovered among the "+COURT_GROUPS[threat.id].name+".");
  return;
 }
 if(!c.pending&&resolveCourtAftershock())return;
 if(!c.pending){
  const urgent=state.year>=18&&state.year-c.lastSceneYear>=6&&state.resources.food===0;
  if(state.year>=c.nextSceneYear||urgent){
   const scene=urgent?"food":c.lastSceneYear===0?"founding":chooseRandomCourtScene();
   presentCourtScene(scene);
  }
 }
}
function courtMarkup(){
 const c=ensureCourt(),cooldown=c.lastCouncilYear===state.year;
 let output=courtPreview(courtInterior())+'<div class="court-head"><div><strong>👑 Crown legitimacy</strong><span class="court-score">'+c.legitimacy+'/100</span></div><div><strong>State of the realm</strong><span class="court-status">'+courtLevel()+'</span></div></div>';
 output+='<p class="hint">Factions can grow through population, armies, temples and your decisions. A powerful but disloyal faction may plot to overthrow the ruler. Intrigue and legitimacy affect that danger. Council actions are limited to one per year.</p>';
 if(c.plot)output+='<div class="court-warning"><strong>⚠ Conspiracy — '+COURT_GROUPS[c.plot.faction].name+'</strong><span>Possible coup in Year '+c.plot.deadline+' · '+Math.max(0,c.plot.deadline-state.year)+' years remaining. Reduce their Threat below 48 to break the plot.</span></div>';
 const sorted=Object.keys(COURT_GROUPS).sort((a,b)=>(a===focusedCourtFaction?-1:0)-(b===focusedCourtFaction?-1:0)||factionRisk(b)-factionRisk(a));
 for(const id of sorted){
  const meta=COURT_GROUPS[id],f=c.factions[id],risk=factionRisk(id);
  output+='<section class="court-faction '+(id===focusedCourtFaction?'court-faction-selected':'')+'"><header><strong>'+meta.icon+' '+meta.name+'</strong><span class="court-faction-risk">'+risk+' threat</span></header>';
  for(const [label,key] of [["Influence","power"],["Loyalty","loyalty"],["Scheming","intrigue"]]){
   output+='<div class="court-line"><span>'+label+'</span><span>'+f[key]+'/100</span></div><div class="court-meter"><div class="court-fill '+key+'" style="width:'+f[key]+'%"></div></div>';
  }
  output+='<div class="court-orders">'+
   btn("🍞 Reward (4 food)","council:"+id+":reward",cooldown||state.resources.food<4,"primary")+
   btn("🕵️ Investigate (2 food)","council:"+id+":investigate",cooldown||state.resources.food<2)+
   btn("⚖ Limit influence","council:"+id+":restrict",cooldown)+
   '</div></section>';
 }
 output+='<p class="hint">One court order per year. Rewarding factions can secure loyalty but encourage ambition; investigations may expose plots or damage trust; limiting influence can weaken a rival and deepen resentment. Consequences are not entirely predictable.</p>';
 if(cooldown)output+='<p class="hint"><strong>✓ Council order issued this year.</strong> Next order available after End Year.</p>';
 if(c.history.length){
  output+='<h4 class="panel-section-title">Court decisions</h4>';
  for(const e of c.history.slice(0,5))output+='<div class="court-history">Year '+e.year+': '+htmlSafe(e.choice)+'</div>';
 }
 return output;
}
const COURT_INTERIORS={
 roman:{title:"The Roman Senate",image:"./assets/courts/roman.webp",accent:"#b56c51"},
 egypt:{title:"The Pharaoh's Audience Hall",image:"./assets/courts/egypt.webp",accent:"#c49a65"},
 greek:{title:"The Athenian Assembly",image:"./assets/courts/greek.webp",accent:"#bfa16b"},
 persian:{title:"The Persian Apadana",image:"./assets/courts/persian.webp",accent:"#76a5a5"},
 babylonian:{title:"The Babylonian Throne Room",image:"./assets/courts/babylonian.webp",accent:"#5d92a9"},
 mongol:{title:"The Great Khan's Yurt",image:"./assets/courts/mongol.webp",accent:"#c39a66"},
 han:{title:"The Han Imperial Palace",image:"./assets/courts/han.webp",accent:"#bc7267"},
 maurya:{title:"The Mauryan Audience Hall",image:"./assets/courts/maurya.webp",accent:"#b9925b"},
 aztec:{title:"The Aztec Palace",image:"./assets/courts/aztec.webp",accent:"#91b9a0"},
 inca:{title:"The Inca Royal Court",image:"./assets/courts/inca.webp",accent:"#b8a36b"},
 maya:{title:"The Maya Palace",image:"./assets/courts/maya.webp",accent:"#8dbf9b"},
 norse:{title:"The Norse Great Hall",image:"./assets/courts/norse.webp",accent:"#b49c75"},
 mali:{title:"The Court of the Mansa",image:"./assets/courts/mali.webp",accent:"#c99b60"},
 khmer:{title:"The Khmer Audience Hall",image:"./assets/courts/khmer.webp",accent:"#8d9e74"},
 japan:{title:"The Japanese Audience Chamber",image:"./assets/courts/japan.webp",accent:"#c2aaa1"},
 aksum:{title:"The Aksumite Royal Hall",image:"./assets/courts/aksum.webp",accent:"#c79e73"},
 iceni:{title:"The Iceni Council Hall",image:"./assets/courts/iceni.webp",accent:"#a1aa79"},
 ottoman:{title:"The Imperial Divan",image:"./assets/courts/ottoman.webp",accent:"#9aabc6"},
 carthage:{title:"The Council of Carthage",image:"./assets/courts/carthage.webp",accent:"#a8a1c6"},
 zulu:{title:"The Zulu Royal Gathering",image:"./assets/courts/zulu.webp",accent:"#c39c70"},
 chola:{title:"The Chola Royal Court",image:"./assets/courts/chola.webp",accent:"#bf9361"}
};

function courtInterior(){
 const civ=state?.leader?.id||myCities()[0]?.civId||"greek";
 return COURT_INTERIORS[civ]||COURT_INTERIORS.greek;
}
function courtHero(theme,icon,name){
 const background="background-image:linear-gradient(180deg,rgba(14,24,19,.05) 4%,rgba(14,24,19,.04) 48%,rgba(14,24,19,.76) 100%),url("+theme.image+");border-bottom-color:"+theme.accent;
 return '<div class="council-room-hero" style="'+background+'">'+
  '<div class="council-room-label">'+htmlSafe(theme.title)+'</div>'+
  '<div class="advisor-stage"><div class="advisor-portrait">'+icon+'</div><span class="advisor-name">'+htmlSafe(name)+'</span></div></div>';
}
function courtPreview(theme){
 const civ=state?.leader?.name||myCities()[0]?.civilisation||"Your civilisation";
 const background="background-image:linear-gradient(180deg,rgba(14,24,19,.15),rgba(14,24,19,.79)),url("+theme.image+")";
 return '<div class="court-preview" style="'+background+'"><div class="court-preview-label"><strong>'+
  htmlSafe(theme.title)+'</strong><span>'+htmlSafe(civ)+' · Your royal court</span></div></div>';
}
function renderCourtScene(){
 const overlay=get("courtScene");if(!overlay)return;
 const c=ensureCourt(),p=c.pending,ended=state.overthrown;
 if(!inGame||!get("startScreen").classList.contains("hidden")||(!p&&!ended)){overlay.hidden=true;overlay.innerHTML="";overlay.style.backgroundImage="";return;}
 const theme=courtInterior();
 overlay.hidden=false;
 overlay.style.backgroundImage="linear-gradient(180deg,rgba(11,22,17,.82),rgba(8,15,13,.92)),url("+theme.image+")";
 overlay.style.backgroundSize="cover";
 overlay.style.backgroundPosition="center";
 if(ended){
  const name=COURT_GROUPS[ended.faction]?.name||"The court";
  overlay.innerHTML='<div class="council-cinematic court-ended" role="dialog" aria-modal="true" aria-label="End of reign">'+
   '<div class="cinematic-eyebrow">YEAR '+ended.year+' · THE FALL OF A DYNASTY</div>'+
   courtHero(theme,"👑",state.leader?.leader||"The Ruler")+
   '<h2>Your Reign Has Ended</h2><p class="council-quote">'+htmlSafe(ended.message)+'</p>'+
   '<p class="council-consequence">You were overthrown by '+htmlSafe(name)+'. Your civilisation still exists, but your ruler has lost control of it.</p>'+
   '<button id="courtRestart" class="council-choice royal-button">Begin a new reign</button></div>';
  get("courtRestart")?.addEventListener("click",()=>showMainMenu());
  return;
 }
 if(p.id==="aftermath"){
  overlay.innerHTML='<div class="council-cinematic council-aftermath" role="dialog" aria-modal="true" aria-label="Consequences of an earlier court decision">'+
   '<div class="cinematic-eyebrow">YEAR '+p.year+' · ECHOES OF THE COURT</div>'+
   courtHero(theme,"🕯️","Royal Messenger")+
   '<h2>An Old Decision Returns</h2>'+
   '<p class="council-quote">The consequences of "'+htmlSafe(p.title||"your earlier audience")+'" have reached the throne.</p>'+
   '<div class="council-background">'+htmlSafe(p.story||"The court awaits your attention.")+'</div>'+
   '<div class="council-afterword">What once seemed settled may shape the loyalties and resources of the kingdom for years to come. Your council and stores now reflect the consequences.</div>'+
   '<div class="council-choices"><button id="ackCourtAftershock" class="council-choice royal-button">Continue the reign</button></div></div>';
  get("ackCourtAftershock")?.addEventListener("click",acknowledgeCourtAftershock);
  return;
 }
 const scene=COURT_SCENES[p.id];if(!scene){c.pending=null;overlay.hidden=true;return;}
 const narrative=courtStory(p.id,p);
 overlay.innerHTML='<div class="council-cinematic" role="dialog" aria-modal="true" aria-label="An advisor brings news">'+
  '<div class="cinematic-eyebrow">YEAR '+p.year+' · A ROYAL AUDIENCE · '+htmlSafe(scene.type)+'</div>'+
  courtHero(theme,scene.icon,scene.advisor)+
  '<h2>'+htmlSafe(scene.title)+'</h2><p class="council-quote">'+htmlSafe(narrative.opening)+'</p>'+
  '<div class="council-background">'+htmlSafe(narrative.background)+'</div>'+
  '<div class="council-testimonies">'+narrative.counsel.map(line=>'<div class="council-testimony">'+htmlSafe(line)+'</div>').join("")+'</div>'+
  '<div class="council-decision-heading">What will you do?</div>'+
  '<div class="council-choices">'+courtChoices(p.id).map(choice=>{
   const can=costAvailable(choice.effect);
   return '<button class="council-choice" data-court-choice="'+choice.id+'" '+(can?"":"disabled")+'>'
    +'<span class="choice-heading">'+htmlSafe(choice.label)+'</span>'
    +'<span class="choice-story">'+htmlSafe(narrative.choices[choice.id]||choice.detail)+'</span>'
    +(can?"":'<span class="choice-unavailable">Your stores cannot support this decision</span>')+'</button>';
  }).join("")+'</div><div class="cinematic-footer">Advisors cannot predict every reaction. Some consequences may emerge years later.</div></div>';
 overlay.querySelectorAll("[data-court-choice]").forEach(btn=>btn.addEventListener("click",()=>chooseCourtOption(btn.dataset.courtChoice)));
}
function fresh(scenario=CIV_WORLD.scenario()){
 const leader=scenario.player;
 return {version:4,world:"earth",worldSeed:scenario.seed,leader:{...leader},initialRivalCount:12,year:1,
 tech:["foraging","forestry",...(coastTile(leader.x,leader.y,2)?["fishing"]:[])],research:0,knowledge:0,culture:0,faith:0,military:0,
 resources:{food:18,wood:16,stone:8,ore:0,metal:0,animals:0},court:defaultCourt(),overthrown:null,
 cities:scenario.rivals.map((c,i)=>({id:"r"+(i+1),x:c.x,y:c.y,name:c.capital,civId:c.id,civilisation:c.name,leader:c.leader,colour:c.color,pop:7,owner:"rival",army:6,culture:0,faith:0,buildings:{},growth:0,captives:0,unrest:0})),
 units:[{id:"u1",type:"settler",x:leader.x,y:leader.y,moved:false,owner:"player",strength:1,hp:6,xp:0},{id:"u2",type:"clubman",x:leader.x,y:leader.y,moved:false,owner:"player",strength:2,hp:6,xp:0}],
 works:{},builders:{},extracted:{},explored:{},encounters:initialEncounters(scenario),nextEncounterId:1000,
 path:null,project:null,unitProject:null,researchProject:null,stage:"move",stageYear:1,
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
ensureCourt();
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
 const projects=[state.project,state.unitProject];
 for(const p of projects){
 if(!p||p.balanceVersion===2)continue;
 const newTotal=(buildings[p.kind]||unitDef(p.kind))?.work;
 const oldTotal=Math.max(1,Number(p.total)||Number(p.left)||1);
 if(newTotal&&newTotal>oldTotal&&p.left>0){
  // Preserve the completion percentage of projects from older saves.
  p.total=newTotal;
  p.left=Math.max(1,Math.ceil(newTotal*Math.max(0,Math.min(1,p.left/oldTotal))));
 }else p.total=oldTotal;
 p.balanceVersion=2;
 }
}
function estimateWork(left,rate){return Math.max(1,Math.ceil(left/Math.max(1,rate)));}
function eligible(stage){
 if(stage==="move")return state.units.some(u=>u.owner==="player"&&!u.moved&&!u.embarkedOn);
 if(stage==="workers")return myCities().some(c=>freeWorkers(c)>0);
 if(stage==="construction")return myCities().length>0&&(!state.project||!state.unitProject);
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
function upgrade(c,id){
 return Math.max(0,((c&&c.buildings[id])||0)-((c&&c.damagedBuildings?.[id])||0));
}
function damagedBuildingCount(c){return Object.values(c?.damagedBuildings||{}).reduce((sum,n)=>sum+(n||0),0);}
function damageCityBuilding(preferred){
 const cities=myCities().filter(c=>Object.keys(c.buildings||{}).some(k=>upgrade(c,k)>0));
 if(!cities.length)return null;
 const priorities=preferred?[preferred,"granary","sawmill","fishingHut","barracks","temple","house"]:[];
 const targets=cities.map(c=>{
  const type=priorities.find(k=>upgrade(c,k)>0)||Object.keys(c.buildings).find(k=>upgrade(c,k)>0);
  return {city:c,type};
 }).filter(x=>x.type);
 if(!targets.length)return null;
 const chosen=targets.sort((a,b)=>(a.type===preferred?-1:0)-(b.type===preferred?-1:0))[0];
 chosen.city.damagedBuildings??={};
 chosen.city.damagedBuildings[chosen.type]=(chosen.city.damagedBuildings[chosen.type]||0)+1;
 record("⚠ "+(buildings[chosen.type]?.name||chosen.type)+" at "+chosen.city.name+" has been damaged! Its benefits are suspended until repaired.");
 return chosen;
}
function woundCourtUnits(amount=2,number=1){
 const soldiers=state.units.filter(u=>u.owner==="player"&&fighter(u)&&unitHP(u)>1)
  .sort((a,b)=>unitHP(b)-unitHP(a));
 let hit=0;for(const u of soldiers.slice(0,number)){
  u.hp=Math.max(1,unitHP(u)-amount);
  hit++;
  record("⚠ "+unitTitle(u)+" was wounded by internal unrest (−"+amount+" HP). Rest to heal.");
 }
 return hit;
}
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
  const foodTarget=Math.min(c.pop,Math.max(2,Math.ceil(c.pop*.65)));
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
 get("backToGame").hidden=!inGame||!!state.overthrown;
 get("menuStatus").textContent=stored
  ?(stored.overthrown?"Your reign ended in Year "+stored.overthrown.year+". Start a new game or view the outcome. · ":stored.legacyMigrated?"Earlier valley save detected — Continue moves its progress to Earth. The original is kept. ":"Earth save available · ")+
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
 ensureCourt();
 ensureStartingEscort();
 if((coastTile(state.leader?.x??-1,state.leader?.y??-1,2)||state.cities.some(c=>c.owner==="player"&&cityHasSea(c)))&&!state.tech.includes("fishing"))state.tech.push("fishing");
 state.knowledge??=state.research||0;
 state.researchProject??=null;
 state.unitProject??=null;
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
function workedYield(c,d){
 if(!d)return 0;
 let n=1; // Unimproved workers yield exactly one per year.
 if(d.type==="fish")n+=upgrade(c,"fishingHut")+upgrade(c,"smokehouse")+upgrade(c,"harbor")+(known("netmaking")?1:0);
 else if(d.type==="wood")n+=upgrade(c,"sawmill")+upgrade(c,"workshop");
 else if(d.type==="stone")n+=upgrade(c,"stoneworks")+upgrade(c,"workshop");
 else if(d.type==="ore")n+=upgrade(c,"forge");
 else if(d.type==="animals")n+=upgrade(c,"stable");
 else if(d.type==="food")n+=upgrade(c,"granary")+upgrade(c,"market");
 else if(d.type==="forage")n+=upgrade(c,"huntingLodge");
 if(known("engineering"))n++;
 return Math.max(1,n);
}
function yearlyProduction(){
 const gains={food:0,wood:0,stone:0,ore:0,animals:0};
 for(const [key,id] of Object.entries(state.works)){
  const c=getCity(id),[x,y]=decode(key),d=deposit(x,y);
  if(!c||c.owner!=="player"||borders.get(key)!==id||!d||!known(d.tech))continue;
  const amt=workedYield(c,d);
  if(d.type==="food"||d.type==="fish")gains.food+=amt;
  else if(d.type==="forage")gains.food+=Math.min(amt,remaining(x,y));
  else if(d.type==="animals")gains.food+=amt;
  else gains[d.type]+=Math.min(amt,remaining(x,y));
 }
 return gains;
}
function resourceUpkeep(year=state.year){
 const assigned=assignedWorkers(),fighters=state.units.filter(u=>u.owner==="player"&&fighter(u)).length;
 const ships=state.units.filter(u=>u.owner==="player"&&isNaval(u)).length;
 const civilians=state.units.filter(u=>u.owner==="player"&&!fighter(u)&&!isNaval(u)).length;
 const captives=myCities().reduce((n,c)=>n+(c.captives||0),0);
 const project=state.project,training=state.unitProject,buildingDef=project&&projectDef(project.kind);
 const built=myCities().reduce((n,c)=>n+Object.values(c.buildings||{}).reduce((k,v)=>k+v,0),0);
 const mining=Object.keys(state.works).some(key=>["stone","ore"].includes(deposit(...decode(key))?.type));
 const gear=year%4===0?Math.ceil(fighters/3):0;
 const shipRepair=year%3===0?Math.ceil(ships/2):0;
 const civicWood=year%5===0?Math.floor(built/3):0;
 const projectWood=(project&&year%2===0?1:0)+(training&&year%3===0?1:0);
 const projectStone=project&&buildingDef?.stone>0&&year%4===0?1:0;
 const civicStone=year%6===0?myCities().reduce((n,c)=>n+Math.floor((upgrade(c,"walls")+upgrade(c,"stoneworks")+upgrade(c,"forge")+upgrade(c,"harbor"))/3),0):0;
 const miningWood=year%5===0&&mining?1:0;
 return {year,upkeep:{
   food:Math.ceil(assigned/3)+fighters+ships+Math.ceil(civilians/3)+captives,
   wood:projectWood+gear+shipRepair+civicWood+miningWood,
   stone:projectStone+civicStone
  },details:{assigned,fighters,ships,civilians,captives,projectWood,projectStone,gear,shipRepair,civicWood,civicStone,miningWood}};
}
function economyForecast(year=state.year+1){
 const production=yearlyProduction(),cost=resourceUpkeep(year);
 return {year,production,upkeep:cost.upkeep,details:cost.details,
  net:{food:production.food-cost.upkeep.food,wood:production.wood-cost.upkeep.wood,
    stone:production.stone-cost.upkeep.stone,ore:production.ore,animals:production.animals}};
}
function harvestResources(){
 const gains={food:0,wood:0,stone:0,ore:0,animals:0};
 for(const [key,id] of Object.entries(state.works)){
  const c=getCity(id),[x,y]=decode(key),d=deposit(x,y);
  if(!c||c.owner!=="player"||borders.get(key)!==id||!d||!known(d.tech)){delete state.works[key];continue;}
  if(d.type==="animals"){
   if(remaining(x,y)<=0)continue;
   if(!state.extracted[key])state.extracted[key]=1;
   gains.food+=workedYield(c,d);
   if(state.year%4===0)gains.animals+=1+upgrade(c,"stable");
   continue;
  }
  const output=workedYield(c,d);
  if(d.type==="food"||d.type==="fish"){gains.food+=output;continue;}
  const amount=Math.min(output,remaining(x,y));
  state.extracted[key]=(state.extracted[key]||0)+amount;
  gains[d.type==="forage"?"food":d.type]+=amount;
  if(remaining(x,y)===0)delete state.works[key];
 }
 for(const [res,n] of Object.entries(gains))state.resources[res]=(state.resources[res]||0)+n;
 const forges=myCities().reduce((n,c)=>n+upgrade(c,"forge"),0);
 const smelt=Math.min(forges,Math.floor(state.resources.ore/3),state.resources.wood);
 if(smelt>0){state.resources.ore-=smelt*3;state.resources.wood-=smelt;state.resources.metal+=smelt;}
 return gains;
}
function economyPanel(){
 const f=economyForecast(state.year+1),d=f.details,latest=state.economyLast;
 let out='<div class="economic-head"><strong>📊 Next year\'s resource balance</strong><span>Year '+f.year+' estimate</span></div>';
 out+='<p class="hint">Every unimproved resource worker brings in +1 a year. Improved buildings and research add yields. Workers, soldiers and construction consume supplies at End Year. Figures are forecasts: raids, exhausted deposits and new projects can change them.</p>';
 for(const [res,icon] of [["food","🍲"],["wood","🪵"],["stone","🪨"]]){
  const produced=f.production[res]||0,used=f.upkeep[res]||0,balance=f.net[res]||0;
  out+='<div class="economic-line"><strong>'+icon+' '+res[0].toUpperCase()+res.slice(1)+'</strong><span>+'+produced+' gathered · −'+used+' upkeep</span><b class="'+(balance<0?"economic-loss":balance>0?"economic-gain":"economic-even")+'">'+(balance>0?"+":"")+balance+'/year</b></div>';
 }
 out+='<div class="economic-explainer"><strong>Who uses the food?</strong><p>'+d.assigned+' assigned citizens: '+Math.ceil(d.assigned/3)+' food · '+d.fighters+' warriors: '+d.fighters+' food · '+d.ships+' ship crews: '+d.ships+' food · '+d.civilians+' explorers/settlers: '+Math.ceil(d.civilians/3)+' food · '+d.captives+' captives: '+d.captives+' food.</p></div>';
 out+='<div class="economic-explainer"><strong>Timber and stone wear and tear</strong><p>Ongoing construction needs 1 wood every two years and 1 stone every four years for stone-built projects. Military equipment uses wood every four years; ships every three. Large numbers of buildings need periodic repairs and mining uses tools.</p></div>';
 if(state.project)out+='<div class="economic-explainer"><strong>🏗 Building</strong><p>'+htmlSafe(projectLabel())+(state.project.stalledYear===state.year?" · Work stalled this year for lack of supplies.":"")+'</p></div>';
 if(state.unitProject)out+='<div class="economic-explainer"><strong>⚔ Training</strong><p>'+htmlSafe(projectLabel("unitProject"))+(state.unitProject.stalledYear===state.year?" · Training stalled for lack of supplies.":"")+'</p></div>';
 if(latest){
  out+='<div class="economic-explainer"><strong>Last Year '+latest.year+' actual costs</strong>';
  out+='<p>Food: −'+(latest.paid?.food||0)+' · Wood: −'+(latest.paid?.wood||0)+' · Stone: −'+(latest.paid?.stone||0)+'.</p>';
  for(const [res,missing] of Object.entries(latest.shortages||{}))if(missing)out+='<p class="economic-loss">⚠ '+missing+' '+res+' could not be supplied.</p>';
  out+='</div>';
 }
 out+=item("👥 Assign workers","Move workers between food, wood and stone to improve your forecast.",btn("Manage jobs","workers",false,"primary"));
 return out;
}
function payUpkeep(){
 const plan=resourceUpkeep(state.year),paid={},shortages={};
 for(const res of ["food","wood","stone"]){
  const need=plan.upkeep[res],have=state.resources[res]||0;
  paid[res]=Math.min(have,need);shortages[res]=Math.max(0,need-have);
  state.resources[res]=Math.max(0,have-need);
 }
 if(shortages.food){
  const court=ensureCourt();
  court.legitimacy=courtClamp(court.legitimacy-2);
  court.factions.workers.loyalty=courtClamp(court.factions.workers.loyalty-3);
  record("Food rations run short by "+shortages.food+"; the people and army grow uneasy.");
 }
 if(shortages.wood&&state.year%3===0){
  const court=ensureCourt();court.factions.military.loyalty=courtClamp(court.factions.military.loyalty-2);
  record("Timber shortages hinder repairs and equipment.");
 }
 if(shortages.stone&&state.project)record("Stone shortage: construction cannot advance this year.");
 state.economyLast={year:state.year,production:state.economyHarvest||{},upkeep:plan.upkeep,paid,shortages,details:plan.details};
 // Materials paid to start construction cover the structure itself;
 // yearly wood/stone represent tools, scaffolding and incidental supplies.
 if(state.project&&((plan.details.projectWood>0&&shortages.wood>0)||(plan.details.projectStone>0&&shortages.stone>0)))state.project.stalledYear=state.year;
 if(state.unitProject&&state.year%3===0&&shortages.wood>0)state.unitProject.stalledYear=state.year;
 return state.economyLast;
}

function trainingRate(c,kind){
 if(!c)return 1;
 // Military instructors and specialised facilities can train soldiers while
 // civilian builders work independently on structures.
 return 1+Math.min(2,upgrade(c,"training"))+
  (kind==="archer"?Math.min(1,upgrade(c,"range")):0)+
  (isNaval({type:kind})?Math.min(1,upgrade(c,"shipyard")):0);
}
function projectRate(c,kind){
 return unitDef(kind)?trainingRate(c,kind):constructionRate(c,kind);
}
function progressProject(slot){
 const p=state[slot];if(!p)return;
 const c=getCity(p.city);if(!c||c.owner!=="player"){state[slot]=null;return;}
 if(p.stalledYear===state.year||p.stalledUntil>=state.year){p.rate=0;return;}
 const progress=projectRate(c,p.kind);
 p.left=Math.max(0,p.left-progress);p.rate=progress;
 if(p.left!==0)return;
 if(unitDef(p.kind)){
  const d=unitDef(p.kind),port=d.naval?launchWater(c):null;
  if(d.naval&&!port){p.left=1;record("A free harbour berth is needed before "+d.name+" can launch.");return;}
  state.units.push({id:"u"+state.nextId++,type:p.kind,x:port?.x??c.x,y:port?.y??c.y,moved:true,owner:"player",hp:6+Math.max(0,d.strength-2),xp:0,strength:d.strength+upgrade(c,"training")+(p.kind==="archer"?upgrade(c,"range"):0)});
  updateFog();
 }else if(p.kind.startsWith("repair:")){
  const kind=p.kind.slice(7);
  c.damagedBuildings??={};
  c.damagedBuildings[kind]=Math.max(0,(c.damagedBuildings[kind]||0)-1);
  if(!c.damagedBuildings[kind])delete c.damagedBuildings[kind];
  record(c.name+"'s "+(buildings[kind]?.name||kind)+" has been repaired.");
 }else{
  c.buildings[p.kind]=(c.buildings[p.kind]||0)+1;
  if(p.kind==="lookout")updateFog();
 }
 record((buildings[p.kind]?.name||unitDef(p.kind)?.name||p.kind)+
   (p.kind.startsWith("repair:")?" repairs completed.":" completed at "+c.name+"."));
 state[slot]=null;
}
function progressBuilding(){
 // Both queues advance independently in the same year. Workers boost the
 // building project, while training depends on military facilities.
 progressProject("project");
 progressProject("unitProject");
}

function growthGoal(c){return Math.ceil((12+c.pop*2)*(state.path==="arts"?.85:1));}
function changePopulation(foodGained=0,foodBefore=0,foodUpkeep=0){
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
  const reserve=state.resources.food>=c.pop*2+6;
  const surplus=foodGained>=Math.ceil(c.pop/2)&&foodGained>foodUpkeep;
  if(!reserve||!surplus){c.growth=Math.max(0,c.growth-.35);continue;}
  c.growth+=1+(foodGained>=foodUpkeep+3&&state.resources.food>=c.pop*4+10?.35:0)+upgrade(c,"granary")*.2;
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
 if(state.overthrown)return toast("Your reign has ended. Start a new game from the main menu.");
 if(ensureCourt().pending)return toast("Your advisor awaits a decision. Choose a response before End Year.");
 syncStage(); // End Year is the only irreversible yearly action.
 state.year++;
 if(myCities().length){
  const beforeFood=state.resources.food,production=harvestResources();
  state.economyHarvest=production;
  const costs=payUpkeep();
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
  changePopulation(production.food,beforeFood,costs.upkeep.food);for(const city of myCities())balanceCityLabor(city);progressBuilding();pathGrowth();
  if(state.resources.food===0)record("Food shortages: work more forage or fertile tiles.");
 }
 villageYearlyEffects();roamEnemies();spawnEncounters();
 state.units.forEach(u=>u.moved=false);
 recalcBorders();advanceCourt();state.stageYear=state.year;state.stage=availableFrom("move");menu="";save();renderUI();if(!state.overthrown&&!state.court.pending)toast("Year "+state.year+" · Units can move again.");
}
function caravanAccess(){
 if(state.year<30)return "Caravans become available in Year 30 ("+(30-state.year)+" years remaining).";
 if(!known("commerce"))return "Research Trade Routes after Writing to unlock caravans.";
 return "";
}
function tradeTimber(cityId){
 const c=getCity(cityId);
 if(!c||c.owner!=="player")return toast("Select one of your cities to trade.");
 const access=caravanAccess();
 if(access)return toast(access);
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
 const def=projectDef(kind),isUnit=!!unitDef(kind);
 if(!def)return toast("Unrecognised development.");
 const req=projectRequirements(c,kind);
 if(!req.ready)return toast(req.missing[0]+". Open this option to see all its requirements.");
 for(const resource of ["wood","stone","food","metal"])state.resources[resource]-=def[resource]||0;
 const rate=projectRate(c,kind),slot=isUnit?"unitProject":"project";
 state[slot]={city:cityId,kind,left:def.work,total:def.work,rate,balanceVersion:2};
 record(c.name+" begins "+(isUnit?"training ":"building ")+def.name+".");
 autoAdvance("construction");save();renderUI();
}
function startRepair(cityId,kind){
 return startConstruction("repair:"+kind,cityId);
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
function projectDef(id){
 if(id.startsWith("repair:")){
  const base=buildings[id.slice(7)];
  if(!base)return null;
  return {name:"Repair "+base.name,icon:"🧰",work:Math.max(5,Math.ceil(base.work*.5)),wood:Math.max(2,Math.ceil((base.wood||0)*.2)),stone:Math.ceil((base.stone||0)*.2),desc:"Restore the damaged "+base.name+". Repairs return its bonuses and any lost city defences."};
 }
 return buildings[id]||unitDef(id);
}
function projectLabel(slot="project"){
 const p=state[slot];if(!p)return slot==="unitProject"?"No units in training.":"No building underway.";
 const d=projectDef(p.kind);
 return (d?.name||p.kind)+" · "+p.left+"/"+p.total+" work · ~"+estimateWork(p.left,projectRate(getCity(p.city),p.kind))+" years";
}
function projectRequirements(c,id,ignoreBusy=false){
 const def=projectDef(id);
 if(!def)return {ready:false,missing:["Unknown development"]};
 const missing=[],isUnit=!!unitDef(id),slot=isUnit?"unitProject":"project";
 if(state[slot]&&!ignoreBusy)missing.push((isUnit?"Finish training ":"Finish building ")+
  projectLabel(slot)+" first");
 if(id.startsWith("repair:")){
  const name=id.slice(7);
  if(!(c.damagedBuildings?.[name]>0))missing.push("This building does not need repair");
 }else{
  if(def.need&&!known(def.need))missing.push("Research "+(techs[def.need]?.name||def.need));
  if(def.path&&state.path!==def.path)missing.push("Choose "+(paths[def.path]||def.path)+" path");
  if(def.requires&&!upgrade(c,def.requires))missing.push("Build "+(buildings[def.requires]?.name||def.requires)+" first");
  if(def.coastal&&!cityHasSea(c))missing.push("Requires a coastal city with sea inside its influence");
  if(def.naval&&!launchWater(c))missing.push("Requires a free coastal water tile");
 }
 for(const resource of ["wood","stone","food","metal"]){
  const lack=(def[resource]||0)-(state.resources[resource]||0);
  if(lack>0)missing.push("Need "+lack+" more "+resource);
 }
 return {ready:!missing.length,missing,reason:missing.join(" · ")};
}

let inspectedDevelopment=null;
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
  const links=[
   ["📋 This year","turnMenu"],
   ["🏗 Buildings","buildings"],
   ["⚔ Train units","training"],
   ["👥 Workers","workers"],
   ["🔬 Technology","tech"],
   ["📊 Resources","economy"],
   ["👑 Court","court"],
   ["🗺 World map","worldMap"],
   ["🚶 Units","units"],
   ["♜ Society","path"],
   ["📜 Chronicle","history"],
   ["🏠 Main menu","openMainMenu"],
   ["💾 Save","save"]
  ];
  output='<div class="compact-menu">'+links.filter(([label,action])=>firstCity()||["turnMenu","units","worldMap","openMainMenu","save"].includes(action)).map(([label,action])=>
   '<button class="compact-menu-link" data-action="'+action+'">'+label+' <span>›</span></button>').join("")+'</div>';
  if(firstCity())output+='<p class="hint">Building and training progress together. Revisit any action before End Year.</p>';
 }
 if(menu==="court")output=courtMarkup();
 if(menu==="economy")output=economyPanel();
 if(menu==="workers"){
  const free=unassignedWorkers(),assigned=assignedWorkers();
  output='<div class="worker-counter"><span class="worker-number">'+free+'</span><span><strong>Workers remaining</strong><small>'+assigned+' assigned / '+citizens()+' citizens</small></span></div>';
  output+='<p class="hint">Each unimproved worker gathers 1 resource/year. Every 3 assigned citizens consume 1 food/year, and every warrior or ship crew uses 1 more. Construction uses timber and sometimes stone for tools. Keep enough food workers to support your army.</p>';
  output+=item("🌾 Assign all resource workers","Automatically balances food, timber, stone and other visible resources. Keep citizens free if you want them building.",btn("Assign all resource workers","assignAll",!myCities().some(c=>freeWorkers(c)>0&&availableWorkTiles(c).length>0),"primary"));
  let shown=0;
  for(const c of myCities()){
   const builders=builderCount(c),speed=constructionRate(c,state.project?.kind||"house");
   output+=item("🏗 Builders — "+htmlSafe(c.name),"Builders: "+builders+" · "+cityWork(c)+" resource workers · "+freeWorkers(c)+" unassigned. Construction speed: "+speed+" work/year (plus supplies every few years). "+
    (state.project&&state.project.city===c.id?estimateWork(state.project.left,speed)+" years left.":"Start a project in the City panel."),
    btn("− Remove builder","builder:"+c.id+":-1",builders===0)+btn("＋ Assign builder","builder:"+c.id+":1",freeWorkers(c)<1,"primary"));
   for(let y=Math.max(0,c.y-influenceRadius(c));y<=Math.min(MAP_H-1,c.y+influenceRadius(c));y++)
    for(let x=Math.max(0,c.x-influenceRadius(c));x<=Math.min(MAP_W-1,c.x+influenceRadius(c));x++){
     if(borders.get(pos(x,y))!==c.id||cityAt(x,y))continue;
     const d=deposit(x,y),working=state.works[pos(x,y)];
     if(!d||!known(d.tech)||(!working&&remaining(x,y)===0)||shown>=24)continue;
     const jobLabel=(working?"✓ ":"")+d.icon+" "+d.type+" · "+x+","+y;
     output+=item(jobLabel,d.type==="fish"?"Renewable fishing grounds · "+workedYield(c,d)+" food/year.":d.type==="food"||d.type==="animals"?"Renewable · "+workedYield(c,d)+" food/year.":workedYield(c,d)+" per year · "+remaining(x,y)+" remaining.",
      btn(working?"− Remove worker":"＋ Assign worker","work:"+x+":"+y,!working&&freeWorkers(c)===0,working?"secondary":"primary"));
     shown++;
    }
  }
  if(!shown)output+="<p class='hint'>No accessible resources currently visible. Build units to explore or research new technologies.</p>";
 }
 if(menu==="city"){
  const c=viewedCity();
  if(!c)return "<p class='hint'>Found a city first.</p>";
  output='<div class="compact-city-head"><strong>🏛 '+htmlSafe(c.name)+'</strong><span>👥 '+c.pop+' people · '+freeWorkers(c)+' free</span></div>';
  output+='<div class="city-short-stats"><span>⚔ '+cityAttack(c)+' attack</span><span>🛡 '+cityDefense(c)+' defence</span><span>📈 '+Math.floor(c.growth||0)+'/'+growthGoal(c)+' growth</span></div>';
  output+='<div class="production-slots">'+
   '<div class="production-slot"><strong>🏗 Buildings</strong><span>'+htmlSafe(projectLabel())+'</span>'+btn("View buildings","buildings",false,"primary")+'</div>'+
   '<div class="production-slot"><strong>⚔ Units</strong><span>'+htmlSafe(projectLabel("unitProject"))+'</span>'+btn("Train units","training",false,"primary")+'</div></div>';
  if(Object.values(c.damagedBuildings||{}).some(n=>n>0))
   output+='<p class="repair-alert">⚠ A building is damaged. Open Buildings to arrange repairs; damaged improvements lose their benefits.</p>';
  output+='<div class="compact-city-links">'+btn("👥 Workers","workers")+btn("📊 Economy","economy")+btn("👑 Court","court")+'</div>';
  if(!caravanAccess()){
   const food=upgrade(c,"market")?9:13,wood=upgrade(c,"market")?8:6,wait=Math.max(0,5-(state.year-(c.lastTimberTrade||-100)));
   output+='<div class="compact-trade">🐫 Timber caravan: '+food+' food → '+wood+' wood. '+btn(wait?"Returning ("+wait+"y)":"Trade","tradeWood:"+c.id,wait>0||state.resources.food<food)+'</div>';
  }
 }
 if(menu==="buildings"||menu==="training"){
  const c=viewedCity(),train=menu==="training";
  if(!c)return "<p class='hint'>Found a city first.</p>";
  const slot=train?"unitProject":"project",active=state[slot];
  output='<div class="project-switch">'+btn("🏗 Buildings","buildings",!train,"primary")+btn("⚔ Train units","training",train,"primary")+'</div>';
  output+='<div class="queue-status"><strong>'+(train?"⚔ Unit training":"🏗 Building construction")+'</strong><span>'+
    (active?htmlSafe(projectLabel(slot)):"Slot is available")+'</span></div>';
  if(!train&&Object.values(c.damagedBuildings||{}).some(v=>v>0))
   output+='<p class="repair-alert">Damaged buildings stop providing bonuses. Tap a repair entry to see its requirements.</p>';
  let options=Object.entries(train?unitTypes:buildings);
  if(!train){
   for(const [kind,n] of Object.entries(c.damagedBuildings||{}))if(n>0&&buildings[kind])options.unshift(["repair:"+kind,projectDef("repair:"+kind)]);
  }
  options=options.map(([kind,def],order)=>{
   const r=projectRequirements(c,kind,true),slotFull=!!active;
   const locked=r.missing.some(x=>x.startsWith("Research ")||x.startsWith("Choose ")||x.startsWith("Build ")||x.startsWith("Requires "));
   const score=kind.startsWith("repair:")?0:r.ready?1:locked?3:2;
   return {kind,def,order,score,r,slotFull};
  }).sort((a,b)=>a.score-b.score||a.order-b.order);
  output+='<div class="compact-options">';
  for(const o of options){
   const status=o.kind.startsWith("repair:")?"Repair needed":o.r.ready?(o.slotFull?"Available after current project":"Ready"):(o.score===3?"Locked":"Need resources");
   output+='<button class="development-row '+(o.r.ready?"development-ready":"development-locked")+'" data-action="inspectDevelopment:'+(train?"unit":"building")+':'+o.kind+':'+c.id+'">'+
    '<span class="development-icon">'+(o.def.icon||"🏗")+'</span><span class="development-name">'+htmlSafe(o.def.name)+'</span>'+
    '<small>'+status+'</small><span class="development-chevron">›</span></button>';
  }
  output+='</div>';
 }
 if(menu==="development"){
  const focus=inspectedDevelopment,c=focus?getCity(focus.city):null,
    def=focus&&projectDef(focus.kind),train=focus?.type==="unit";
  if(!c||!def)return '<p class="hint">Select a building or unit to see its details.</p>';
  const r=projectRequirements(c,focus.kind);
  const costs=["wood","stone","food","metal"].filter(k=>def[k]).map(k=>(def[k]||0)+" "+k).join(" · ")||"No material cost";
  output='<div class="detail-back">'+btn("‹ Back to "+(train?"units":"buildings"),train?"training":"buildings")+'</div>';
  output+='<div class="development-detail"><div class="development-detail-title"><span>'+def.icon+'</span><strong>'+htmlSafe(def.name)+'</strong></div>'+
   '<p>'+htmlSafe(def.desc||"")+'</p>'+
   '<div class="detail-facts"><span>🧱 '+htmlSafe(costs)+'</span><span>⏳ '+def.work+' work</span>'+
   (train?'<span>⚔ '+def.strength+' strength</span><span>👁 '+def.vision+' sight</span>':
   '<span>🏛 '+upgrade(c,focus.kind.replace("repair:",""))+' built</span>')+'</div>';
  if(r.missing.length)output+='<div class="detail-requirements"><strong>To begin:</strong><ul>'+r.missing.map(m=>'<li>'+htmlSafe(m)+'</li>').join("")+'</ul></div>';
  else output+='<p class="detail-ready">✓ Resources and requirements are ready.</p>';
  output+=btn(focus.kind.startsWith("repair:")?"🧰 Start repair":train?"⚔ Train "+def.name:"🏗 Construct "+def.name,
     "build:"+focus.kind+":"+c.id,!r.ready,"primary");
  output+='</div>';
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
 const forecast=firstCity()?economyForecast(state.year+1):null;
 const chip=(icon,key)=>{
  const net=forecast.net[key],sign=net>0?"+":"";
  return '<button class="chip economy-chip" data-action="economy" title="Next year: '+sign+net+' '+key+' · Tap for resource economy">'+icon+' <b>'+res[key]+'</b><small class="'+(net<0?"economic-loss":net>0?"economic-gain":"economic-even")+'">'+sign+net+'</small></button>';
 };
 get("stats").innerHTML=(firstCity()?chip("🍲","food")+chip("🪵","wood")+chip("🪨","stone")+'<span class="chip">👥 <b>'+total+'('+assigned+')</b></span>':"")+'<span class="chip">Year <b>'+state.year+'</b></span>';
 const head=get("summary"),actions=get("actions"),rp=state.researchProject,court=ensureCourt();
 const courtBadge=get("courtBadge");
 courtBadge.hidden=!firstCity();
 courtBadge.innerHTML='👑 Court <b>'+court.legitimacy+'</b>'+(court.plot||courtLevel()==="High risk"?' ⚠':'');
 courtBadge.classList.toggle("court-danger",!!court.plot||courtLevel()==="High risk");
 const factionMini=get("courtFactions");
 factionMini.hidden=!firstCity();
 if(firstCity())factionMini.innerHTML=Object.entries(COURT_GROUPS).map(([id,info])=>{
  const f=court.factions[id],risk=factionRisk(id);
  const bars=[["power","Influence"],["loyalty","Loyalty"],["intrigue","Scheming"]].map(([key,label])=>
   '<span class="court-mini-meter '+key+'" title="'+info.name+' · '+label+': '+f[key]+'/100" aria-label="'+label+' '+f[key]+' out of 100"><i style="width:'+f[key]+'%"></i></span>').join("");
  return '<button class="court-mini-row '+(risk>=50?'court-mini-risk':'')+'" data-action="courtFocus:'+id+'" aria-label="'+info.name+': influence '+f.power+', loyalty '+f.loyalty+', scheming '+f.intrigue+'"><span class="court-mini-name">'+info.icon+' '+(id==="workers"?"Workers":id==="military"?"Warriors":"Priests")+'</span><span class="court-mini-bars">'+bars+'</span></button>';
 }).join("");
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
 const stageAction=state.stage==="end"?"":btn(state.stage==="move"?"🚶 Move units":state.stage==="workers"?"👥 Assign workers":state.stage==="construction"?"🏗 Build / Train":"🔬 Choose tech","stageAction",false,"secondary stage-cta");
 actions.innerHTML='<button class="stage-label" data-action="turnMenu" title="Revisit any turn step">☰ '+stepLabel+' ▾</button><div class="stage-buttons">'+stageAction+nextButton+endButton+'</div>';
 const panel=get("panel");panel.classList.toggle("open",!!menu);
 panel.innerHTML=menu?'<div class="panelhead"><strong>'+({actions:"Actions",city:"City",buildings:"Buildings",training:"Train units",development:"Development",tile:"Map tile",tech:"Research",path:"Society",units:"Units",workers:"Workers",history:"Chronicle",main:"Game",turn:"This year",encounter:"Encounter",court:"Royal court",economy:"Resource economy"}[menu]||"Civ")+'</strong><button id="closePanel" aria-label="Close panel">×</button></div>'+panelContents():"";
 panel.querySelector("#closePanel")?.addEventListener("click",()=>{menu="";renderUI();});
 document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>doAction(b.dataset.action)));
 renderCourtScene();
}
function doAction(a){
 if(state.overthrown)return toast("Your reign has ended. Start a new game.");
 if(ensureCourt().pending)return toast("Choose a response in the royal advisor audience first.");
 if(a==="endYear")return endYear();
 if(a==="court"){menu="court";renderUI();return;}
 if(a.startsWith("courtFocus:")){focusedCourtFaction=a.slice(11);menu="court";renderUI();return;}
 if(a==="economy"){menu="economy";renderUI();return;}
 if(a.startsWith("inspectDevelopment:")){const [,type,kind,city]=a.split(":");inspectedDevelopment={type,kind,city};menu="development";renderUI();return;}
 if(a.startsWith("council:")){
  const [group,action]=a.slice(8).split(":");
  return courtCouncilAction(group,action);
 }
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
 if(["city","tile","tech","path","units","workers","history","court","economy","buildings","training"].includes(a)){menu=a;renderUI();return;}
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
 if(a==="restart"){if(confirm("Start a new world and replace your save?")){state=fresh();moving=null;menu="";selected=null;recalcBorders();center(state.leader.x,state.leader.y);save();renderUI();}return;}
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
get("courtBadge").onclick=()=>doAction("court");
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
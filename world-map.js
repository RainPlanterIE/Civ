/* Geographic gameplay rules based on Natural Earth coastlines and major rivers.
   Biomes and mineral/food distribution are broad regional gameplay approximations, not a historical geology survey. */
const CIV_WORLD=(()=>{
 const W=WORLD_ATLAS.width,H=WORLD_ATLAS.height;
 const land=atob(WORLD_ATLAS.landBits),rivers=atob(WORLD_ATLAS.riverBits);
 const xy=(lon,lat)=>({x:Math.max(0,Math.min(W-1,Math.floor((lon+180)*2))),y:Math.max(0,Math.min(H-1,Math.floor((90-lat)*2)))});
 const coords=(x,y)=>({lon:-180+(x+.5)/2,lat:90-(y+.5)/2});
 const valid=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<W&&y>=0&&y<H;
 const bit=(bytes,x,y)=>valid(x,y)&&!!(bytes.charCodeAt(((y*W+x)>>3))&(1<<((y*W+x)&7)));
 const isLand=(x,y)=>bit(land,x,y);
 const river=(x,y)=>bit(rivers,x,y);
 const noise=(x,y,seed=1)=>{const z=Math.sin(x*127.1+y*311.7+seed*53.13)*43758.5453;return z-Math.floor(z);};
 const areas={
  desert:[
   [-4,23,29,18], [46,23,18,12], [60,31,11,9], [91,39,19,8], [112,43,14,7],
   [133,-24,18,11], [16,-23,6,9], [23,-25,9,5], [-69,-23,5,13],
   [-111,31,11,7], [-116,40,8,7], [-69,-44,9,6], [69,39,7,4]
  ],
  forest:[
   [-71,-4,20,14], [22,-1,11,10], [108,8,16,17], [131,0,11,14],
   [-85,46,28,14], [87,59,68,12], [17,53,23,15], [-83,34,14,8],
   [140,37,8,8], [45,4,9,5], [150,-7,9,10], [-73,-36,6,8]
  ],
  mountain:[
   [-74,2,5,11],[-72,-13,4,19],[-71,-37,4,13],[-113,43,9,17],
   [11,46,7,3], [9,33,10,4],[80,32,19,6],[48,33,11,5],
   [43,43,9,4],[65,57,6,16],[87,47,10,7],[39,12,5,7],
   [29,-29,6,6],[142,37,9,11],[146,-6,7,6],[-101,18,7,8]
  ],
  arable:[
   [31,28,3,13],[44,32,5,5],[74,30,10,8],[84,26,7,5],
   [114,32,20,12],[31,48,17,8],[8,49,19,10],
   [-90,36,16,14],[-61,-32,10,9],[-49,-22,12,8],
   [106,16,9,11],[12,13,11,6],[30,-3,9,7]
  ],
  ore:[
   [-71,-24,10,27],[-111,44,13,18],[16,63,13,13],[31,-26,14,11],
   [27,-8,16,15],[92,26,17,11],[117,39,22,19],[52,35,13,13],
   [77,19,16,13],[137,-24,17,15],[26,46,10,9],[-44,-20,15,12],
   [96,59,36,17],[141,38,10,10]
  ]
 };
 function ellipse(lon,lat,regions){let peak=0;for(const [cx,cy,rx,ry] of regions){const a=(lon-cx)/rx,b=(lat-cy)/ry,dist=a*a+b*b;if(dist<1)peak=Math.max(peak,1-dist);}return peak;}
 function nearbyRiver(x,y){
  if(river(x,y))return true;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(river(x+dx,y+dy))return true;
  return false;
 }
 function climate(x,y){
  if(!isLand(x,y))return "water";
  const {lon,lat}=coords(x,y),a=Math.abs(lat),n=noise(x,y,4),wet=nearbyRiver(x,y);
  const dry=ellipse(lon,lat,areas.desert),wooded=ellipse(lon,lat,areas.forest),alpine=ellipse(lon,lat,areas.mountain);
  if(a>74)return "tundra";
  if(alpine>.45&&n<.92)return "hill";
  if(a>65&&wooded<.18)return n<.35?"tundra":"forest";
  if(dry>.2&&!wet&&n<.7+dry*.18)return "desert";
  if(alpine>.09&&n<.33+alpine*.45)return "hill";
  if(wet&&dry>.22)return "grass";
  if(wooded>.14&&(n<.55+wooded*.37))return a<23?"jungle":"forest";
  if(a<20&&dry<.1&&wooded>.04&&n<.6)return "jungle";
  if(a>49&&n<.65)return "forest";
  if(a>=30&&a<50&&dry<.1&&wooded>.08&&n<.29)return "forest";
  if((a>=29&&a<46&&n<.35)||(dry>.08&&!wet))return "steppe";
  return n<.06?"hill":"grass";
 }
 function deposit(x,y){
  const biome=climate(x,y);
  if(biome==="water")return null;
  const {lon,lat}=coords(x,y),n=noise(x,y,7),wet=nearbyRiver(x,y),
        fertile=ellipse(lon,lat,areas.arable),mineral=ellipse(lon,lat,areas.ore);
  if(biome==="hill"){
   const oreLikelihood=.10+.56*mineral;
   return n<oreLikelihood?{type:"ore",max:16+Math.floor(noise(x,y,8)*34),tech:"metalworking",icon:"⚒"}:
      {type:"stone",max:25+Math.floor(noise(x,y,9)*53),tech:"geology",icon:"🪨"};
  }
  if(biome==="forest"||biome==="jungle")
   return {type:"wood",max:(biome==="jungle"?55:44)+Math.floor(noise(x,y,10)*65),tech:"forestry",icon:"🌲"};
  if(biome==="tundra")
   return n<.23?{type:"wood",max:14,tech:"forestry",icon:"🌲"}:n<.45?{type:"forage",max:14,tech:"foraging",icon:"🍓"}:null;
  if(biome==="desert"){
   if(wet||fertile>.55&&n<.22)return {type:"food",max:25,tech:"agriculture",icon:"🌾"};
   if(n<.12)return {type:"stone",max:28,tech:"geology",icon:"🪨"};
   if(n<.2)return {type:"forage",max:9,tech:"foraging",icon:"🌴"};
   return null;
  }
  if(biome==="steppe"){
   if(wet||fertile>.65)return {type:"food",max:28,tech:"agriculture",icon:"🌾"};
   if(n<.24)return {type:"animals",max:8+Math.floor(noise(x,y,11)*12),tech:"husbandry",icon:"🐂"};
   if(n>.89)return {type:"wood",max:18,tech:"forestry",icon:"🌳"};
   return {type:"forage",max:16+Math.floor(noise(x,y,12)*20),tech:"foraging",icon:"🍓"};
  }
  const cropChance=wet?.86:.18+fertile*.65;
  if(n<cropChance)return {type:"food",max:35+Math.floor(noise(x,y,13)*24),tech:"agriculture",icon:"🌾"};
  if(n<cropChance+.13)return {type:"animals",max:6+Math.floor(noise(x,y,14)*13),tech:"husbandry",icon:"🐂"};
  if(n>.91)return {type:"wood",max:18+Math.floor(noise(x,y,15)*22),tech:"forestry",icon:"🌳"};
  return {type:"forage",max:24+Math.floor(noise(x,y,16)*26),tech:"foraging",icon:"🍓"};
 }
 // Named leaders and civilisations represent deliberately mixed historical eras.
 const civilisations=[
  {id:"roman",name:"Roman Empire",leader:"Julius Caesar",capital:"Rome",lon:12.50,lat:41.90,region:"Europe",color:"#c76c56"},
  {id:"egypt",name:"Ancient Egypt",leader:"Cleopatra VII",capital:"Alexandria",lon:29.92,lat:31.20,region:"Africa",color:"#dcc178"},
  {id:"greek",name:"Classical Greece",leader:"Pericles",capital:"Athens",lon:23.72,lat:37.98,region:"Europe",color:"#83b8cc"},
  {id:"persian",name:"Achaemenid Persia",leader:"Cyrus the Great",capital:"Pasargadae",lon:53.18,lat:30.18,region:"WestAsia",color:"#b68bc3"},
  {id:"babylonian",name:"Babylonia",leader:"Hammurabi",capital:"Babylon",lon:44.42,lat:32.54,region:"WestAsia",color:"#db9e65"},
  {id:"mongol",name:"Mongol Empire",leader:"Genghis Khan",capital:"Karakorum",lon:102.84,lat:47.20,region:"EastAsia",color:"#9eb66b"},
  {id:"han",name:"Han China",leader:"Emperor Wu of Han",capital:"Chang'an",lon:108.94,lat:34.27,region:"EastAsia",color:"#c75f65"},
  {id:"maurya",name:"Maurya Empire",leader:"Ashoka",capital:"Pataliputra",lon:85.14,lat:25.62,region:"SouthAsia",color:"#d4a474"},
  {id:"aztec",name:"Aztec Empire",leader:"Moctezuma II",capital:"Tenochtitlan",lon:-99.13,lat:19.43,region:"Americas",color:"#c8866d"},
  {id:"inca",name:"Inca Empire",leader:"Pachacuti",capital:"Cusco",lon:-71.97,lat:-13.53,region:"Americas",color:"#bb9bcf"},
  {id:"maya",name:"Maya Kingdoms",leader:"Lady Six Sky",capital:"Naranjo",lon:-89.47,lat:17.20,region:"Americas",color:"#78aa78"},
  {id:"norse",name:"Norse Kingdoms",leader:"Harald Bluetooth",capital:"Jelling",lon:9.41,lat:55.76,region:"Europe",color:"#96acc8"},
  {id:"mali",name:"Mali Empire",leader:"Mansa Musa",capital:"Niani",lon:-8.76,lat:11.36,region:"Africa",color:"#c4ab6e"},
  {id:"khmer",name:"Khmer Empire",leader:"Jayavarman VII",capital:"Angkor",lon:103.87,lat:13.41,region:"EastAsia",color:"#d39580"},
  {id:"japan",name:"Tokugawa Japan",leader:"Tokugawa Ieyasu",capital:"Edo",lon:139.75,lat:35.68,region:"EastAsia",color:"#b77f9c"},
  {id:"aksum",name:"Kingdom of Aksum",leader:"King Ezana",capital:"Aksum",lon:38.72,lat:14.12,region:"Africa",color:"#be9279"},
  {id:"iceni",name:"Iceni Britons",leader:"Boudica",capital:"Venta Icenorum",lon:1.31,lat:52.57,region:"Europe",color:"#9ea88b"},
  {id:"ottoman",name:"Ottoman Empire",leader:"Suleiman the Magnificent",capital:"Constantinople",lon:28.98,lat:41.01,region:"WestAsia",color:"#a1b479"},
  {id:"carthage",name:"Carthage",leader:"Hannibal Barca",capital:"Carthage",lon:10.33,lat:36.85,region:"Africa",color:"#ca8e9b"},
  {id:"zulu",name:"Zulu Kingdom",leader:"Shaka Zulu",capital:"KwaBulawayo",lon:31.36,lat:-28.63,region:"Africa",color:"#a6a373"},
  {id:"chola",name:"Chola Empire",leader:"Rajaraja I",capital:"Thanjavur",lon:79.14,lat:10.79,region:"SouthAsia",color:"#caac87"}
 ];
 function safeSite(lon,lat,used=[]){
  const point=xy(lon,lat);
  for(let r=0;r<=14;r++){
   const possible=[];
   for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
    const x=point.x+dx,y=point.y+dy;if(!isLand(x,y))continue;
    if(used.some(s=>Math.max(Math.abs(x-s.x),Math.abs(y-s.y))<9))continue;
    const biome=climate(x,y);
    possible.push({x,y,penalty:Math.hypot(dx,dy)+(biome==="desert"?4:0)+(biome==="hill"?3:0)});
   }
   if(possible.length){possible.sort((a,b)=>a.penalty-b.penalty);return {x:possible[0].x,y:possible[0].y};}
  }
  return point;
 }
 function scenario(seed=Math.floor(Math.random()*1000000000)){
  const rand=(n)=>noise(Math.floor(seed%999983),n,Math.floor(seed/1000));
  const playerIndex=Math.floor(rand(300)*civilisations.length);
  const player=civilisations[playerIndex],playerSite=safeSite(player.lon,player.lat);
  const selected=[],remaining=civilisations.filter(c=>c.id!==player.id),sites=[playerSite];
  // Spread other empires across the globe, then choose among viable candidates.
  while(selected.length<12&&remaining.length){
   let best=-Infinity,choice=null,site=null;
   for(const civ of remaining){
    const p=safeSite(civ.lon,civ.lat,sites),distanceToClosest=Math.min(...sites.map(s=>Math.max(Math.abs(s.x-p.x),Math.abs(s.y-p.y))));
    const regionAlready=selected.filter(s=>s.region===civ.region).length;
    const score=distanceToClosest*.8-regionAlready*10+rand(selected.length*131+civilisations.indexOf(civ))*40;
    if(score>best){best=score;choice=civ;site=p;}
   }
   if(!choice)break;
   selected.push({...choice,...site});
   sites.push(site);remaining.splice(remaining.indexOf(choice),1);
  }
  return {seed,player:{...player,...playerSite},rivals:selected};
 }
 return {W,H,valid,xy,coords,isLand,river,nearbyRiver,noise,climate,deposit,civilisations,safeSite,scenario};
})();
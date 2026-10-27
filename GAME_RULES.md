# Civ — city influence and civilisation progression

## Core game loop
- **One turn = one year.** End Year is the only action that advances production, growth, research, borders and construction.
- **Units move at most once per turn**, one adjacent tile (diagonals included). Settlers found cities on suitable unoccupied land.
- **A city occupies exactly one map tile.** Its buildings are developments inside the city, not separate map tiles.
- **Only one construction or unit-production project is active across the player's civilisation.** A project has work remaining; each year advances its progress based on assigned construction labour, Workshops and later specialisation. Construction materials are paid when the project starts; storing extra materials does not automatically speed up construction.
- A city's citizens can work resource tiles within its influence boundary. Each worked tile uses **one citizen**. You can assign **every citizen** during a single worker stage, including the last one. Only citizens explicitly assigned as builders speed up construction, so there is a trade-off between resource gathering and building speed.
- Worked tiles produce resources only when a relevant physical deposit exists and its technology has been discovered. Timber, forage, stone and ore are finite. Agriculture allows renewing cultivated food; animal husbandry establishes renewable pasture output. Ore can be smelted at a forge.
- The game begins with Forestry and Foraging known. Agriculture, Geology, Writing, Husbandry, Metalworking and Engineering are researchable. **Hidden deposits do not appear until their research is completed.**

## City borders
Population determines the baseline **Chebyshev radius** (diagonal tiles count):
| Population | Radius |
|---|---|
| 1–9 | 2 |
| 10–19 | 3 |
| 20–33 | 4 |
| 34+ | 5 |

A city's influence is a coloured map overlay with a border. When influence overlaps, the stronger city's local claim wins; equally strong claims become contested. City-centre tiles always remain with their owner. Workers are unassigned if influence is lost.

New population requires adequate stored food and spare housing capacity. Housing developments increase capacity by four. Food is consumed every year. Population grows through a food-supported growth meter instead of every three years; arts slightly accelerates this progress.

## Society directions (Year 100 onward)
The player can choose **one defining path** from Year 100 onward.

- **Science:** expands borders by +1 tile at 35 lifetime knowledge and another at 130; construction is faster. A science victory requires 260 lifetime knowledge and an Academy.
- **Arts:** expands borders through culture (+1 radius at 55 culture, another at 150), accelerates population growth, and exerts cultural pressure on rival cities within nine tiles. Pressure reaching 85 absorbs a neighbouring city. Absorbing the three rival cities wins.
- **Faith:** faith increases border radius (+1 at 100 faith). A neighbouring rival city within ten tiles can convert after accumulating 75 religious pressure, becoming an allied city. Three allied cities give a faith victory.
- **War:** the player can train armies after choosing war. An army must move adjacent to an opposing city and overcome its defensive strength to capture its centre and influence. Capturing all rival centres wins.

## Neighbouring cities
Three AI-owned city centres begin on the map, slowly gaining population and borders (about once every 17 years). Their city centres remain distinct, contested border tiles are not workable, and all cities use the same local influence calculation.

## Controls
The map fills the entire screen. Tap a tile to inspect it; tap your own city tile to manage its developments. The bottom controls show the current phase and **Next**; End Year appears during the final phase. The top-right menu provides the full set of actions. Every panel has a visible close button. The game saves to the browser locally.

## Current prototype boundaries
This version implements deterministic turn rules and simplified rival city growth. Rival cities do not yet train their own armies or trade as full civilisations; independent roaming enemy warriors now patrol and raid. Paths have distinct victory conditions, but their balance and the illustrated map will need testing and refinement on mobile.

## Guided stages within each year
Each year is broken into five sequential stages:
1. **Move units** — move **every ready unit** (one movement/action per unit per year), selecting them from the unit list or directly on the map. The phase remains active while another unit can act and automatically advances only when every unit has acted (or you press Next).
2. **Assign workers** — you may assign **every unassigned citizen** in a single worker phase, one per available resource tile. Assign them individually or tap **Assign all workers**, which balances food with timber and stone. The phase only auto-skips when no free citizens remain; a free citizen may always be assigned to construction. Finite deposits release their assigned worker when exhausted.
3. **Construction** — start exactly one city development or unit-training project, civilisation-wide. When a project is underway, this stage is automatically skipped.
4. **Choose technology** — start exactly one research project. When a project is already being researched, this stage is automatically skipped.
5. **End Year** — the only action that advances resource gathering, research, construction, population and city borders.

Each year has a **revisitable turn checklist**, not a one-way lock. Use **Next** to skip a suggested step. Tap the current step label in the bottom bar to open **This year**, where you can revisit movement, workers, construction or technology in any order. The research card, city panel and map-unit selection remain usable even after those steps have been skipped. **End Year** is always visible, and only clicking End Year advances production, research, construction and year counters. The top-right menu also offers the turn checklist and Society choices.

A previously skipped action can still be taken **before End Year** as long as its normal constraints hold: each unit moves once per year, each worked tile requires a free citizen, one construction project can be active, and only one technology is researched at a time. Work assignments can be rearranged during the year. The checklist is a navigation aid, not a commitment.

The top bar shows population as **total(assigned)**, such as **6(4)**. The research progress card replaces the old static city-name panel at the bottom-left: it shows current technology, progress and estimated years until completion, and opens research controls when tapped. The city drawing shows an active construction project's progress bar and estimated years beneath the city. Work remaining falls every year based on assigned builders (not unassigned people), Workshops, captives and specialisation bonuses. A stocked-material speed bonus is no longer applied.

A research technology takes its published *research work* to finish, rather than unlocking immediately when chosen. Every city produces base research per year; libraries, academies and science specialisation accelerate research. Research and construction run at the same time, each with only one active project.

Existing version-3 browser saves are preserved and upgraded with empty research projects and an appropriate turn stage.

A completed action does not consume the entire phase: moving one unit leaves all other unmoved units ready, and assigning one worker leaves all other unassigned citizens ready. A unit cannot move twice in the same year. You may press **Next** to skip ahead, and reopen any skipped phase before ending the year.

## Main menu and saving
- Opening Civ displays a full-screen **main menu** before gameplay.
- **Play** starts a fresh world with both a Settler and a Clubman. If a valid saved world exists, the game asks for confirmation before replacing it.
- **Continue** opens the saved world, including its year, cities, workers, research, construction and units. Continue is disabled when no valid save exists.
- During gameplay, a persistent **💾 Save** button appears beside the map tools. It writes the current game to this browser's local storage and shows a confirmation. Automatic saves continue after gameplay actions.
- The top-right **☰** opens Actions; from there, choose **Main menu**. When reopening the title screen from an active game, **Back to game** closes it without resetting progress.
- Games are stored **on this device and in this browser only**. They are not yet synchronised between devices or backed up to an online account.

## Builders, clearer buttons and worker availability
The Workers page prominently shows **Workers remaining**, counting people not assigned to land or construction. Each resource tile uses one worker. A new **Builders** assignment lets you move free citizens onto construction projects with the +/− buttons. Construction has diminishing returns: **one or two builders add +1 construction work per year; three or four add +2; five or six add +3**. Builders cannot gather food or timber simultaneously. A Workshop can add a further +1 work per year, science or matching civilisation specialisation +1, and captive labour +1.

The worker and construction buttons are larger, with high-contrast actions on the mobile game page. Workers can be reassigned at any time before End Year. The population counter includes both resource workers and builders: **6(4)** means four total assigned citizens.

## New research, city improvements and military units
You start with a Settler **and a Clubman**; your city can also train further **Clubmen** (8 wood, 3 food, eight construction work). Clubmen are basic club-wielding fighters drawn on the map. Additional technologies and their functional unlocks:

| Technology | New unlock or bonus |
|---|---|
| Agriculture | Reveal fertile cropland and renew farm food |
| Geology | Reveal stone deposits |
| Hunting | Hunting Lodge: +1 wild-food output |
| Scouting | Scout (four-tile vision, moves two tiles per year), Lookout Tower (two extra city-sight tiles) |
| Writing | Library (+3 research/year) and Market (+1 cultivated-food yield) |
| Animal Husbandry | Stables and renewable domesticated animal production |
| Toolmaking, after Geology | Workshop (+1 wood, +1 stone per worked tile and +1 construction work) |
| Archery, after Hunting | Archer unit (requires an Archery Range in the training city) |
| Military Training, after Toolmaking | Spearman unit (requires Training Grounds in the training city) |
| Masonry, after Geology | City Walls (defence improvement for future siege mechanics) |
| Metalworking, after Geology | Ore deposits, Forge and metal Swordsman (requires a Forge) |
| Engineering, after Geology | +1 output on each worked resource tile |

Clubmen, Scouts, Spearmen, Archers and Swordsmen have distinguishable map sprites and strengths. The Warband remains tied to the War society path after Year 100. Tech-locked units and buildings are shown with their requirements in the City screen so you can plan ahead. Only one city development or unit may be constructed or trained at a time across the civilisation.

## Fog of war and exploration
At the beginning only the nearby **two-tile radius around your historically located Settler** is visible. Unexplored map tiles are dark and do not reveal enemy cities, resource deposits or influence borders. Units and city centres reveal their surroundings. Scouts extend vision further, and Lookout Towers increase sight from their city.

Previously explored land remains dimmed when no friendly unit or city can currently see it. Dynamic resource information, rival cities and territory borders are hidden outside current sight until explored again. New exploration and work assignments are stored in the existing browser save; older saves are migrated to include the fog and builder records.

Full rival empire AI is not yet implemented, but walls now provide four real defence points during sieges and roaming-warrior attacks.

## Slower population growth and food requirements
Population no longer rises simply because some food remains in storage. Each city accumulates growth points only when it has spare housing, a healthy reserve of food after yearly consumption and **real food production from worked tiles**. The growth threshold is 12 plus twice the population, slightly lower with the Arts specialisation. Food-rich cities accumulate growth points faster, but growth is normally many years apart instead of every three turns.

Starvation can decrease the population. Rival city growth is slowed too. The City panel shows its growth progress. Captives do **not** count as ordinary citizens or give natural population growth.

## Wildlife, wandering rivals and unit combat
Initial Earth map generation creates independent villages around civilisation centres, region-appropriate wildlife and wandering rival warriors in the wilderness. Further wild animals and hostile warriors spawn on later turns on suitable free land, subject to per-type caps. Dangerous encounters may move or attack nearby units. Raiders can threaten cities, and city walls and local garrisons improve defence.

| Encounter | Behaviour | Outcome |
|---|---|---|
| Deer | Low attack and defence | Food from hunting |
| Wild boar | More dangerous wildlife | More food, risk of wounds |
| Wolf | Predator | Dangerous bite, some meat |
| Rival warrior | Roams the map | Fights travellers, steals food from undefended cities, yields supplies when defeated |
| Independent village | Defended small village | Learn, befriend, trade or attack and seize captives |

**Attack and defence** are now separate game statistics for both units and cities. Units have hit points and earn experience; fights compare attack and defence and may take multiple annual actions. A defeated unit disappears. Injured units can **Rest and heal**, using an action to regain two health, or three next to a friendly city.

City defence reflects population, garrison, friendly fighters stationed nearby, Lookout Towers and City Walls (four extra defence). Cities also have attack points for retaliating against siege attacks. Conquest of full rival city centres still requires the War path after Year 100; hunting and village interactions work much earlier.

## Village encounters: choices and consequences
Move within one tile of a village and tap its little house on the revealed map:

- **Learn traditions**: One-time six research points from that village, which can also progress an active technology project.
- **Befriend**: Receive an initial gift of food and wood plus four culture, with further periodic supplies and trading opportunities.
- **Attack and enslave**: Fight village defenders; victory yields supplies and two captive construction labourers in your nearest city. Captives cannot be assigned to resource jobs and are not population growth. They consume additional food, increase unrest and can eventually escape. Raiding also reduces culture, especially if you attack a previously friendly village.

Villages remain small sites, not opponent cities or territorial borders. A unit needs a remaining action to interact. Full enemy-city diplomacy and tactical warfare are future expansions.

## Fog of war and saving encounters
All animals, raiders and villages are hidden until they enter current sight. Map icons show their positions and remaining health when visible. Previously explored land remains dim, but unseen encounter movements are hidden.

Wildlife health, rival units, village relationships, city unrest and captives, unit health and experience, and growth meters are stored in the browser save. Older saves are automatically migrated to initialise the new mechanics.

## Construction and training rebalancing (v12)
Construction was previously too fast: most projects cost only 4–12 work, while six assigned builders and several other bonuses could complete them instantly. The new work requirements and capped labour bonuses give the player time to explore, collect resources, research technologies and defend against roaming threats during construction.

The new rate is **1 base construction work per year**, plus:
- **+1 work** with one or two assigned builders; **+2 work** with three or four; **+3 work** with five or six.
- **+1 work** if at least one captive remains in that city.
- **+1 work** if there is a Workshop.
- **+1 work** if the science path is selected, or if the project matches the civilisation's specialisation.

Extra stockpiled materials provide no annual speed bonus; the materials are already consumed up front. Builder benefits cap at six assigned builders.

| Example project | New total work | With one builder, no other bonus | With three builders |
|---|---:|---:|---:|
| Clubman | 8 | 4 years | 3 years |
| Housing | 18 | 9 years | 6 years |
| Hunting Lodge | 18 | 9 years | 6 years |
| Granary or Sawmill | 22 | 11 years | 8 years |
| Workshop | 28 | 14 years | 10 years |
| Forge | 32 | 16 years | 11 years |
| Academy | 44 | 22 years | 15 years |

Longer projects encourage maintaining a dedicated builder group while other citizens continue food and timber collection. The active city's construction bar and estimated years remaining reflect the new totals and the currently assigned workers.

Older save games and **construction projects already in progress** are supported. On loading an old project for the first time, its remaining work is scaled to the new total while preserving its existing percentage of completion; projects that were already completed stay completed. This migration runs only once per active project.

## Earth map and historical leaders (v14)
The old fictional 32×32 valley has been replaced by a **global Earth grid of 720 columns and 360 rows**, covering −180° to +180° longitude and −90° to +90° latitude, or **0.5° per tile**. A longitude span of 50° in Europe therefore occupies about 100 tiles. This is a latitude/longitude (equirectangular) gameplay grid, not an equal-area physical-distance projection; the physical east–west distance of a tile changes with latitude.

### Sources and fidelity
- **Coastlines, islands and land masks** use public-domain Natural Earth 1:110m land data.
- **Major rivers** use Natural Earth 1:110m river centre-lines.
- **Regional biomes** are deliberately broad, hand-tuned geographic approximations: tundra, temperate forests, tropical forests, savannas and plains, arid deserts, steppe and mountain ranges.
- **Resources** follow the climate and landform: forestry favours wooded areas; fertile food lands favour plains and river floodplains; wild animal herds favour grazing country; stone favours hills; ores are biased toward broad, real-world mineral-bearing provinces. **These are regionally plausible gameplay distributions, not exact historical resource or geological maps.**
- **Wildlife** differs by region: e.g. deer in northern forests, bison on North American plains, lions and zebras in African savannas, jaguars in tropical America, elephants in parts of Africa and India, camels in arid regions, llamas in the Andes and kangaroos in Australia.
- Natural Earth data source: https://www.naturalearthdata.com/ and https://github.com/nvkelso/natural-earth-vector (public domain). The game includes a compact precomputed land/river raster, so the map works without downloading a map service when the page loads.

### Historical civilisations
Every new Play selects a **random historical leader and civilisation** out of 21 options (e.g. Julius Caesar of Rome, Cleopatra VII of Egypt, Mansa Musa of Mali, Pachacuti of the Inca, Ashoka of Maurya, Genghis Khan of the Mongols). The settler starts on land near that civilisation's historically associated capital. The other **12 opposing settlements** are selected from different civilisations in the same pool, distributed widely around the real world. Rival city labels and flags reflect their historical identity and are only revealed by exploring.

Civilisations come from **different historical eras** in a deliberate alternate-history game world. These pairings are not claims that the empires coexisted or shared territory at the same time. The historical map depicts approximate geography, not changing period-accurate political frontiers.

### World overview
Tap the 🌍 icon in the top-right corner to open a navigable global overview. It shows the broad coastline silhouette and only marks friendly or currently sighted rival cities; unknown enemies and deposits are not shown. Tap anywhere on the overview to move the camera there, then use **Return to your civilisation** to recenter on your city or settler. This only moves the view: moving it does not remove fog of war or move a unit.

The game now computes city influence in small circles around cities and draws **only tiles visible in the current viewport** rather than iterating over a quarter-million tiles every frame. This keeps the much larger map usable on mobile.

### Building button fixes
City buildings and units display their material cost, research prerequisites, any required training facility, society-path requirement and construction progress. **Previously some options were silently disabled** while a project was active or a technology was locked. They now remain tappable and explain the first blocking requirement (e.g. "Need 8 more wood", "Research Geology", or "Finish Housing first"). The game still allows **one active construction/training project across the civilisation**, and all building costs are taken up front.

### Preventing local resource deadlocks
Realistic regional scarcity means some starting civilisations (notably desert and river-valley cities) may have very little timber nearby. Cities may eventually develop a **Timber Caravan** trade exchange, unlocked only after Year 30 and Trade Routes research (after Writing): 13 food for 6 timber once per five years, improved by a Market to 9 food for 8 timber. This gives dry-region players a workable alternative without inventing European-style forests around Egypt or Babylon.

### Existing saves
**Earth saves use a new browser key**, separate from the old valley key. Continuing an older v3 game imports its year, population, cities, buildings, stored resources, technologies, units, research, builders and partially completed construction into a region near its newly assigned historical leader. The old v3 save is preserved as a backup; tile-based worker assignments are repositioned when possible and may need some manual reassignment because old terrain coordinates cannot represent the new Earth geography. Newly created Earth saves record their scenario and leader and restore them on Continue.


## Fishing, sailing and technology-tree overhaul (v15)

### Starting units and hunting
Every new game starts with two ready units beside the historical starting capital: a **Settler** and a **Clubman**. You can found the initial city and also explore or hunt with the Clubman in the same year. A legacy Earth save that is still on Year 1 with only an unspent Settler is granted one Clubman once; other saved games retain their existing roster.

Hunting wild animals with a Clubman or other fighter adds food immediately to the civilisation's **shared food stockpile**, described in the combat log as a delivery to the nearest friendly city. The log shows the exact food gained. No return-to-city movement is necessary: this is an abstraction representing supplies brought home. Hunting technology adds +2 food to kills.

### Fisheries and Norse/coastal viability
Civ now treats **coastal water inside a city's influence border as a renewable worked resource** when Fishing is known. Basic fishing provides **1 food per worker per year**, consumed/stockpiled alongside farmland and forage. Unlike depleted forest or forage deposits, fishing sites do not run out.

Coastal starting leaders whose capital is within two tiles of the shore—including **Harald Bluetooth of the Norse Kingdoms, starting near Jelling in Denmark**—begin knowing **Fishing**; older coastal saves gain that basic starting knowledge on Continue. Inland civilisations may research it.

Workers can be assigned manually to 🎣/🐟 coastal tiles in the Workers panel or by tapping a fishing tile. **Assign all resource workers** counts fishing as food and prioritises enough food workers to sustain the city.

The bonuses stack as follows:

| Feature | Unlock condition | Exact food effect |
|---|---|---|
| Basic Fishing | Coastal starting knowledge or research Fishing (6 work) | +1 food per worked coastal fishing tile/year |
| Fishing Hut | Fishing, build in a coastal city | +1 food per worked fish tile/year |
| Net Making | Research after Fishing (14 work) | +1 food per worked fish tile/year |
| Smokehouse | Net Making, coastal city | +1 food per worked fish tile/year |
| Harbour | Seafaring, coastal city | +1 food per worked fish tile/year; enables Fishing Boats |
| Engineering | After Geology | +1 from every worked tile, including fish |

Food bonuses apply to that city's own assigned fishing tiles, not every city globally.

### Ships, fishing trips and land transport
- **Seafaring** (19 research work, after Fishing) unlocks the **Harbour** and **Fishing Boat**. A Harbour is built inside a coastal city, and ships are launched onto adjacent free coastal water. Ships cannot start from inland cities.
- **Fishing Boat** requires a Harbour, costs 14 wood and 2 food and takes 18 construction work. It moves two water tiles per year and can spend its action fishing for **+2 food immediately**, with another +1 after Net Making.
- **Shipbuilding** (30 research work, after Seafaring) unlocks the **Shipyard** and **Longship**. The Longship requires a Shipyard, moves **three water tiles per year**, catches 1 food per fishing action (plus 1 after Net Making), and can carry **one Settler or land military unit**.
- **Navigation** (42 research work, after Shipbuilding) unlocks open-ocean voyages, +1 movement tile per year for ships, +2 ship vision and the **Lighthouse** (+2 city sight).

Before Navigation, ships are restricted to coastal water and cannot sail across open sea or through land. Land units cannot walk onto water.

**Longship transport:** Position a land unit next to a Longship and choose **Embark Longship** from the Units panel. Embarking uses that passenger's action. Move the Longship on its own turn; the passenger travels aboard without moving independently. Once the ship is ready on a later year, choose a **Disembark to x,y** option in the Units panel to place the passenger onto an adjacent land tile. Unloading uses both the passenger's and ship's actions. Occupied enemy cities and encounters cannot be disembark destinations.

Ships, passengers and known fishing technologies are part of the browser save. This is a first sailing system; open-sea warfare and trade routes are future development areas.

### More readable tech tree and construction list
Technology research now appears as **four themed branches**: Coast & Sailing, Food & Farming, Materials & Industry and Knowledge & Military. Each technology displays its prerequisite, research cost, current availability, and a concrete unlock or numerical production bonus. The page displays an **Available discoveries** group for research that can be started right now, and a progress bar for any active discovery. Existing one-at-a-time research rules remain.

The City construction screen now sorts **currently affordable and eligible buildings first**, then those needing materials, then those locked behind technologies, society paths or prerequisites. When a build is underway, future affordable choices remain near the top to help plan the next project. Training units uses the same sorting rule. Buttons still explain exactly what prevents a choice from starting; the game continues to allow only one construction/training project at a time.


## Royal advisors and court scheming (v16)
Civ now includes a persistent **Royal Court** and a cutscene-style **advisor audience** system, beginning during the first decade of a reign. Instead of simply advancing through endless empty years, the ruler encounters political dilemmas about grain shortages, timber, disgruntled workers, prestigious generals, religious leadership, captive labourers, merchants, and rumours of conspiracy.

### Early game economy and delayed trade
- New civilisations start with **16 wood**, down from 24: enough for one small structure, not a storehouse of unlimited materials. Existing saved resource stockpiles are preserved unchanged.
- **Timber Caravans are unavailable before Year 30**. After Year 30, you must also have researched **Trade Routes** (27 research work, after Writing, which itself requires Agriculture). Caravans remain limited to one transaction per city per five years, costing 13 food for 6 wood, or 9 food for 8 wood with a Market.
- The City screen hides the caravan action until all prerequisites are met, so it does not dominate the beginning of the game. The new Trade Routes node is visible in the Knowledge & Military branch of the technology tree.

### Advisor audiences and genuine choices
A cinematic advisor overlay opens at major moments (first expected in Year 8, and roughly every 7–10 years thereafter; some urgent shortages may bring it forward). Each scene introduces an advisor, the problem, and **three consequential choices** without precise previews of legitimacy, power or intrigue changes.

Typical audiences are the Steward warning about a hungry winter, the Guild Speaker demanding political representation, a War Captain becoming too popular, a High Priestess requesting authority, a Master Builder seeking timber, and a Royal Spymaster uncovering secret meetings. Choices can consume food or wood, grant supplies, reward or offend factions, and reduce or encourage scheming.

Each audience **must be resolved before you can End Year**; it cannot be silently dismissed. The decision is saved with the game, so reloading during an audience restores the pending choice rather than losing it.

### Legitimacy, influence, loyalty and intrigues
Open **👑 Court** from the leader heading badge or the Actions panel. The Royal Court shows legitimacy and three persistent rival power centres:

| Court faction | Gains influence from | Political danger |
|---|---|---|
| Workers & guilds | City population, employed citizens, labour disputes, some royal concessions | Demands representation; unrest and low loyalty lead to intrigue |
| Warriors & generals | Clubmen, more advanced military units, barracks, military prestige | A popular general may claim the throne |
| Priests & faith | Temples, expanding religious influence, sponsored privileges | A religious leader may oppose or replace the ruler |

Each faction has **Influence (power), Loyalty and Scheming (intrigue)** ratings from 0 to 100. Faction strength grows over years through buildings, population and troops. The **Threat** rating combines influence, disloyalty, intrigue and the monarch's legitimacy. High power alone is not enough to trigger a coup: an influential *loyal* group can support the ruler.

The Court offers **one royal order per year**. For each faction:
- **Reward (4 food):** +14 loyalty, +4 influence, −8 intrigue and +2 legitimacy.
- **Investigate (2 food):** −18 intrigue, −5 loyalty, +1 legitimacy; useful against existing plots.
- **Restrict influence (free):** −14 influence, −12 loyalty, +7 intrigue and −3 legitimacy, effective but potentially inflammatory.

Choices during the advisor cutscenes supply additional ways to keep factions balanced. Food scarcity, unrest among captives, or aggressive acts can erode loyalty and legitimacy.

### Conspiracies and the end of a reign
If a faction's Threat rating reaches **66**, a special Spymaster cutscene announces that a coup is being planned. A **three-year warning** and targeted faction are visible in the Court, providing time for negotiations, investigations, or limits on faction power. Reducing the faction's Threat below **48** breaks the conspiracy apart. If the plot reaches its deadline while still dangerous, the faction seizes the throne, ending the player's reign.

The coup can be carried out by the **workers' leadership, the army's general, or a religious leader**. Failure is a genuine game-over, not merely a flavour notification; the resulting end-of-reign scene explains who overthrew the player. You may start a fresh game from the main menu. Overthrow, pending advisor audiences, faction values, royal orders and court history persist in saves.

This is a first political-dynamics system, not a character-by-character court simulation: three power centres are tracked, rather than individually simulated named aristocrats with private genealogies or multiplayer diplomacy. It provides the foundation for later court characters, alliances, succession and espionage mechanics.


## Scarce resources and political uncertainty (v17)

### Smaller starting stores and production
New civilisations begin with **18 food, 16 wood and 8 stone**. Existing saves retain their stockpiles, but the new yearly production and maintenance rules apply.

Each resource worker on an unimproved tile produces **+1 unit per year**. This applies to forest wood, stone, ore, crops, forage and fish. Upgrades give modest per-worker improvements:

| Resource | Base worker yield | Extra production |
|---|---:|---|
| Wood | +1/year | +1 Sawmill, +1 Workshop, +1 Engineering |
| Stone | +1/year | +1 Stoneworks, +1 Workshop, +1 Engineering |
| Crops | +1/year | +1 Granary, +1 Market, +1 Engineering |
| Forage | +1/year | +1 Hunting Lodge, +1 Engineering |
| Coastal fish | +1/year | +1 Fishing Hut, +1 Net Making, +1 Smokehouse, +1 Harbour, +1 Engineering |
| Ore | +1/year | +1 Forge, +1 Engineering |

Crop fields and fishing grounds renew, but forest and mineral deposits may be depleted. Hunting animal food bounties and village gift supplies are reduced as well. Fishing Boat actions now land +2 food (with Net Making +1), and Longships land +1 food (with Net Making +1).

### Annual upkeep
After yearly production, the civilisation must pay:
- **1 food for every 3 assigned workers**, rounded up.
- **1 food for each warrior or ship crew** every year.
- **1 food for each captive**, plus modest provisions for civilian explorers/settlers.
- **1 wood in every second year of active construction**, plus **1 stone in every fourth year** of construction of a stone-using development.
- Periodic wood for maintaining soldiers' equipment, ships, large collections of buildings and mining tools. Some developed masonry needs stone for repairs.

The construction materials paid up front are separate from these operating costs. If due wood or stone for an active project cannot be provided, construction **stalls for that year**. Food shortages harm royal legitimacy and worker loyalty, and sustained shortages may reduce population.

Example: **three working citizens**, with two fishing and one gathering wood, produce +2 food and +1 wood a year. The three workers cost **1 food** and their Clubman costs **1 food**, leaving **zero net food**. A second Clubman turns the balance negative until the player creates new food income. Growth requires a genuine food surplus and sufficient reserves.

### Visible resource forecast
The food, wood and stone badges show the projected **net change next year**, including recurring costs. Tap them, or use **Resource economy** in the Actions panel, to see gross production, annual upkeep, periodic tools/equipment expenses, the workforce and troop food costs, the last actual year's expenses, and any shortage or construction stall. Forecasts reflect the current worker assignments, units and projects; events and enemy raids may change the outcome.

### Less obvious and more detailed court dilemmas
The ten royal advisor scenarios now give a fuller description of the political problem and **conflicting testimony from multiple advisers**, followed by three responses written as plausible policies rather than clear numerical optimisations. The exact legitimacy, loyalty, influence and scheming changes are **no longer previewed** in the advisor options. Unaffordable choices remain disabled, but there is always at least one valid response.

Manual court orders still state their upfront resource cost (Rewards now cost 4 food, Investigations cost 2 food) without listing exact political gains or losses. Faction standing remains visible in the Royal Court after the consequences occur.

### Unexpected consequences years later
Most decisions have a chance (approximately **60%**) to create a **delayed outcome** appearing **2–5 years later**. The political response may be beneficial or harmful, selected deterministically from the world seed, decision and year, and recorded in the save.

For example, a public celebration may strengthen lasting goodwill or expose misuse of supplies; giving guilds seats on the council may prevent unrest while allowing them to organise independently; honouring a general may strengthen loyalty or make that general more popular than the monarch; an investigation may uncover plotters or anger innocent families.

When an outcome becomes known, a **Royal Messenger** presents an *An Old Decision Returns* cutscene explaining what happened. The effects are already applied, and the player acknowledges the report before advancing to another year. Pending outcomes, already delivered reports and the ongoing political state persist through save and Continue.

The goal is uncertainty grounded in each political choice, not arbitrary punishment. The ruler must judge competing testimonies and manage the consequences as the realm develops.


### Small coastal timber sources
Coastal land that would otherwise only offer natural forage may occasionally provide **coastal scrub or driftwood** instead. Such sites are uncommon and **finite** (a small handful of wood units rather than an entire forest). The change makes historically wood-scarce Mediterranean starts such as **Athens** capable of gathering a little local timber without receiving a large forest or unlocking a caravan in the opening years. Their worker yields still begin at +1 wood per year, and deposits still run out.


## Civilisation-specific royal court interiors (v18)

Every one of the 21 playable historical civilisations has its **own named, distinct court backdrop asset** in the repository under assets/courts/{civilisation-id}.webp. The room is automatically chosen from the player's historical civilisation ID (with a fallback for older or incomplete saves). This selection is visual only: it does not alter faction risks, decisions, event probabilities or resource costs.

**Examples:** Rome receives the Roman Senate; Greece, the Athenian assembly; the Mongols, the Khan's great yurt; Han China, the imperial palace; Ancient Egypt, a throne hall; the Norse, a timber great hall; Mali, a Sahelian royal court; and the Inca Empire, an Andean imperial court.

Separate styled settings also exist for Persia, Babylonia, Maurya, the Aztec and Maya polities, Khmer, Tokugawa Japan, Aksum, the Iceni, the Ottomans, Carthage, the Zulu Kingdom, and the Chola Empire.

The first eight core illustrations were created as original painterly environment assets. The remaining thirteen are **stylised adaptations and variations of the existing artwork**, with their own palettes, culturally inspired ornamental details, and architectural motifs. They are atmospheric game illustrations, not precise archaeological reconstructions.

The illustration appears prominently behind **each Royal Advisor cutscene**, with a smaller label showing the court setting and with the advisor's name kept readable. The Royal Court management panel also displays the matching court illustration as a preview immediately after founding a city. The same interior is used in **delayed-consequence** and **overthrow/end-of-reign scenes**, giving political events a continuous sense of place.

Images are optimised WebP files (960 × 540 pixels, typically tens of KB each). The game loads the selected room on demand rather than all 21 backgrounds together. The mobile image stage is compact enough to leave adequate space for decisions and dialogue. Existing v4 Earth saves automatically use their leader's room without any save migration.


## Court dilemmas, independent training, compact menus and improved map (v19)

### Two production queues
Each civilisation now has **two simultaneous production queues**:
- **Building construction** (stored in state.project), which uses assigned builders and building improvements.
- **Unit training** (stored in state.unitProject), which advances with a base training rate and improvements from training structures, archery ranges or shipyards.

**A building and a unit can be produced in the same year**. They pay their resource construction/training costs independently, and both advance on End Year. The annual upkeep forecast accounts for each queue: buildings use upkeep wood periodically and stone for stone-consuming projects; military training uses some wood for tools and equipment every third year. If resources are insufficient for a due cost, only the affected queue can stall.

The previous game used a single state.project for both buildings and troops. On Continue, an old save containing unit training in the old project slot is **migrated to state.unitProject** without resetting the unit's completed work. Save format version stays 4.

### Compact construction interface
City management is now a short overview with separate **Buildings** and **Train units** buttons and an at-a-glance summary of both queues. Selecting Buildings shows a compact row for each option with its name, icon and basic availability state—**no long explanation in the list**. Tapping a row opens a dedicated detail panel containing description, bonuses, cost, work, prerequisites and a **Construct** action. Unit training uses the same pattern with a **Train** action. Eligible and affordable choices appear before choices requiring materials, research or buildings. Switching between the two queues does not lose an active project. The global Actions menu is now a concise two-column menu of shortcuts rather than long explanatory cards.

### Political conflict now damages real infrastructure and units
Factions no longer act only through numerical loyalty scores. Depending on court decisions and future aftermaths, they can:
- Damage an existing **Granary, Temple, Library, Sawmill** or another developed structure in one of your cities.
- Injure actual warriors, reducing their **HP** until they spend actions resting and healing.
- Stall building construction for additional years, or interrupt troop training.
- Erode stored food/wood, loyalty, legitimacy and public order.

A city records damaged building counts in **damagedBuildings**. An injured building's bonuses and defensive contributions are **suspended** until repaired. In Buildings, a **Repair [building]** option appears. It has a separate, smaller material cost and takes multiple years in the building queue. Once repaired, the damaged building is restored and its bonuses resume. If no eligible building or soldier exists, an incident instead causes an alternative in-world penalty rather than inventing a target.

### More involved, historically inspired court cases
The starting court audience is deferred to approximately **Year 23** for new games; ordinary subsequent audiences occur roughly **11–17 years apart**. Serious shortages and conspiracies may still create earlier urgent audiences. Older saved games with unplayed Year 8 audiences have their first event deferred; already pending or completed events remain valid.

The political catalogue now includes **22+ distinct scenarios**. In addition to the previous general arguments over supplies, guilds, faith and military power, new developments include:
- **Smoke from the Granary:** contested evidence of fire or sabotage, with potential actual damage to the granary.
- **The Cracked Scaffolding:** a live construction project, competing safety and military priorities, and consequences for work progress.
- **A Mutiny at the Barracks:** requires a substantial military presence; mishandling can injure warriors.
- **The Temple on Contested Ground:** only appears when a temple exists; disputes over land, roads and religious jurisdiction.
- **A Crowd at the Grain Market:** scarcity and granaries create a dilemma inspired by Roman grain distributions and public unrest.
- **Who Controls the Iron?:** appears after Metalworking research; inspired by the Han government's salt-and-iron monopoly debates in 81 BCE.
- **The Missing Royal Records:** requires writing or a library; archival corruption, evidence and rival institutions.
- **Land Promised to Veterans:** a later-stage dilemma requiring multiple troops.
- **Two Competing Festivals:** worship and harvest competing once temples exist.
- **A Caravan Missing on the Road:** appears after Trade Routes.
- **Who Speaks When the Throne Is Empty?:** Year 70+ disputes over political succession.
- **A Summons to the Great Assembly:** late-game Mongol-specific consultative assembly and succession dispute inspired by historical quriltai politics.

The event picker checks **real game resources, ongoing construction, army size, existing buildings, technologies and civilisation identity** rather than simply producing an arbitrary event every few years. It avoids recent repetitions where alternatives exist. Some technologies grant an **additional fourth political response** in appropriate scenarios, such as Agriculture providing a response to famine, Writing enabling charters and oaths, Scouting improving espionage, and Engineering providing expert technical assessments.

Court decisions do not reveal numerical changes before selection. Every scenario has at least one choice available even with no supplies. Later consequences have different effects depending on which option was chosen; these can damage buildings or units well after the original debate. Event history, damage, projects and delayed consequences remain saved.

Historical inspiration references:
- Peter Garnsey, *Famine and Food Supply in the Graeco-Roman World*, Cambridge University Press, Chapter 13, Food and politics: https://www.cambridge.org/core/books/abs/famine-and-food-supply-in-the-graecoroman-world/food-and-politics/7798F9B82148377A7CE351AC32B04FD7
- Columbia University, Asia for Educators, *A Record of the Debate on Salt and Iron*: https://afe.easia.columbia.edu/main_pop/ps/ps_china-debate-salt-iron.htm
- Michael Hope, *Power, Politics, and Tradition in the Mongol Empire and the Ilkhanate of Iran*, chapter on succession (1227–59), Oxford University Press: https://academic.oup.com/book/9091/chapter-abstract/308450266

These are **game scenarios inspired by historical political problems**, not literal reproductions of specific episodes for every civilisation.

### Court quick status and map clarity
The top-left **👑 Court** badge is larger. Under it are three clickable faction rows (Workers, Warriors, Priests), each with three unlabeled, color-coded mini-bars: influence in gold, loyalty in green, intrigue in red. Hover titles and accessible descriptions show exact labels/values; tapping a row opens the full Court with that faction highlighted. The main Court page still shows detailed numerical ratings.

Isometric map tiles are now approximately 14% larger and have subtle visible diamond outlines. Forest/jungle decorations are smaller and sparser (a single icon on some tiles instead of two large trees on most). **Terrain and actual resource availability are unchanged**: the improvement is a visual de-cluttering pass, especially for laptop screens. City overlays show two progress bars if building construction and unit training happen simultaneously.


## Improved hunting, varied court runs and tabletop unit visuals (v20)

### Clubman hunting balance
- Starter Clubmen gain an **initiative bonus (+2 effective attack)** against wildlife; other fighters get a modest +1 hunting edge. Researching Hunting adds another +1.
- Deer, boars, wolves, llamas, kangaroos, camels and zebras are now **ordinary game** for a healthy Clubman. Their hit points, attack and defence have been reduced where needed.
- **Wildlife killed by a blow cannot retaliate.** Previously retaliation happened even after the prey was dead; this was a significant source of unwanted hunter losses.
- Apex animals (lion, tiger, bear, elephant) still require multiple attacks for a starter Clubman and can injure them, but a wildlife retaliation against a fighter is capped at 2 HP (3 against an unarmed traveller).
- Unprovoked wild predators attack much less frequently during yearly roaming. They **do not attack units within one tile of a friendly city**, and they retreat for a period after being hunted. Unprovoked wildlife may cause injuries but cannot kill a unit between turns when the player had no opportunity to react. Intentional hunting can still be fatal if a fighter is already badly wounded.
- Raiders and rival warriors **remain dangerous** and are not included in the wildlife difficulty reduction.
- Encounters now identify ordinary game versus a challenging or dangerous hunt in their detail text.

### Different decisions in different games
There is now a dedicated **world-seeded court-selection system**, using the world seed, historical civilisation identity, current year, court history and the actual state of the realm. The important differences from v19 are:

1. The **first court audience is no longer always the Founding scene**. Depending on the world, it can be a founding dispute, guild request, political rumour or a military matter, with other problems available when conditions justify them.
2. In new games, the first ordinary audience appears **between Years 22 and 29**, based on the campaign seed. Older saves keep valid existing decisions and scheduled future events.
3. Subsequent scenes are selected from game-relevant choices with **recent repeats excluded when alternatives exist**; previously unseen stories are weighted more heavily. The event pool expands as infrastructure, military and technologies develop.
4. The full political catalogue has **three alternative narrative details for each of 22 existing scenarios**, chosen deterministically for the pending event. These include contested eyewitness accounts, rival petitions, disagreements among officials and region-specific institutional tensions.
5. Each scene can incorporate **actual current game facts**, such as stored food, projected food production, available timber, the active building project, city population or number of troops. It also includes a brief cultural detail appropriate to the current playable civilisation.
6. Court events save their **variant ID** with the pending decision, so reloading a game never rerolls or changes an unfinished choice.
7. Tech-specific extra political options, delayed repercussions, factions, coups, infrastructure damage and injuries continue to work as before.

The selection is not guaranteed to be unique every time—there is a finite set of authored historical problems—but replay variation is substantially greater without inventing incoherent situations. A deterministic seed means tests can reproduce an encounter or scene.

### Raised board-game miniatures and movement (first graphics pass)
Instead of trying to turn the large globe into a heavy real-time 3D environment, the isometric map now displays land units on **raised tabletop-style miniature bases**, with a lighter top rim and a shadowed foot. Wounded units have a coloured ring at the base, making injuries identifiable without opening the unit panel.

When a unit moves, the logical destination is stored immediately (preserving rules, saves and fog), while a temporary **350 ms eased sliding animation** renders the figurine travelling between tiles. Animations live only in a client-side visual map and are not part of the saved game; continuing a save shows the unit at the correct completed destination.

This is the first step in a deliberately restrained hybrid approach: a readable turn-based strategy board with responsive movement and clear pieces, rather than continuous animation on every tile. Future graphics upgrades could include bespoke era-specific miniature silhouettes, modelled city improvements, small battle hit effects and subdued environmental motion. All should be optimised for desktop and mobile.

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
- **Play** starts a fresh world with a single settler. If a valid saved world exists, the game asks for confirmation before replacing it.
- **Continue** opens the saved world, including its year, cities, workers, research, construction and units. Continue is disabled when no valid save exists.
- During gameplay, a persistent **💾 Save** button appears beside the map tools. It writes the current game to this browser's local storage and shows a confirmation. Automatic saves continue after gameplay actions.
- The top-right **☰** opens Actions; from there, choose **Main menu**. When reopening the title screen from an active game, **Back to game** closes it without resetting progress.
- Games are stored **on this device and in this browser only**. They are not yet synchronised between devices or backed up to an online account.

## Builders, clearer buttons and worker availability
The Workers page prominently shows **Workers remaining**, counting people not assigned to land or construction. Each resource tile uses one worker. A new **Builders** assignment lets you move free citizens onto construction projects with the +/− buttons. Construction has diminishing returns: **one or two builders add +1 construction work per year; three or four add +2; five or six add +3**. Builders cannot gather food or timber simultaneously. A Workshop can add a further +1 work per year, science or matching civilisation specialisation +1, and captive labour +1.

The worker and construction buttons are larger, with high-contrast actions on the mobile game page. Workers can be reassigned at any time before End Year. The population counter includes both resource workers and builders: **6(4)** means four total assigned citizens.

## New research, city improvements and military units
You start with a Settler; your city can immediately train a **Clubman** (8 wood, 3 food, four construction work). Clubmen are basic club-wielding fighters drawn on the map. Additional technologies and their functional unlocks:

| Technology | New unlock or bonus |
|---|---|
| Agriculture | Reveal fertile cropland and renew farm food |
| Geology | Reveal stone deposits |
| Hunting | Hunting Lodge: +2 wild-food output |
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
Realistic regional scarcity means some starting civilisations (notably desert and river-valley cities) may have very little timber nearby. Cities therefore have a limited **Timber Caravan** exchange to obtain imported wood: 13 food for 6 timber once per five years, improved by a Market to 9 food for 8 timber. This gives dry-region players a workable alternative without inventing European-style forests around Egypt or Babylon.

### Existing saves
**Earth saves use a new browser key**, separate from the old valley key. Continuing an older v3 game imports its year, population, cities, buildings, stored resources, technologies, units, research, builders and partially completed construction into a region near its newly assigned historical leader. The old v3 save is preserved as a backup; tile-based worker assignments are repositioned when possible and may need some manual reassignment because old terrain coordinates cannot represent the new Earth geography. Newly created Earth saves record their scenario and leader and restore them on Continue.

# Civ — city influence and civilisation progression

## Core game loop
- **One turn = one year.** End Year is the only action that advances production, growth, research, borders and construction.
- **Units move at most once per turn**, one adjacent tile (diagonals included). Settlers found cities on suitable unoccupied land.
- **A city occupies exactly one map tile.** Its buildings are developments inside the city, not separate map tiles.
- **Only one construction or unit-production project is active across the player's civilisation.** A project has work remaining; each year advances its progress by labour, stock availability and later specialisation. Construction materials are paid when started.
- A city's citizens can work resource tiles within its influence boundary. Each worked tile uses **one citizen**. You can assign **every citizen** during a single worker stage, including the last one. Unassigned citizens provide extra labour that can speed up construction, so full assignment comes with a trade-off.
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

New population requires adequate stored food and spare housing capacity. Housing developments increase capacity by four. Food is consumed every year. Population typically increases every three years; arts allows faster growth.

## Society directions (Year 100 onward)
The player can choose **one defining path** from Year 100 onward.

- **Science:** expands borders by +1 tile at 35 lifetime knowledge and another at 130; construction is faster. A science victory requires 260 lifetime knowledge and an Academy.
- **Arts:** expands borders through culture (+1 radius at 55 culture, another at 150), accelerates population growth, and exerts cultural pressure on rival cities within nine tiles. Pressure reaching 85 absorbs a neighbouring city. Absorbing the three rival cities wins.
- **Faith:** faith increases border radius (+1 at 100 faith). A neighbouring rival city within ten tiles can convert after accumulating 75 religious pressure, becoming an allied city. Three allied cities give a faith victory.
- **War:** the player can train armies after choosing war. An army must move adjacent to an opposing city and overcome its defensive strength to capture its centre and influence. Capturing all rival centres wins.

## Neighbouring cities
Three AI-owned city centres begin on the map, slowly gaining population and borders. Their city centres remain distinct, contested border tiles are not workable, and all cities use the same local influence calculation.

## Controls
The map fills the entire screen. Tap a tile to inspect it; tap your own city tile to manage its developments. The bottom controls show the current phase and **Next**; End Year appears during the final phase. The top-right menu provides the full set of actions. Every panel has a visible close button. The game saves to the browser locally.

## Current prototype boundaries
This version implements deterministic turn rules and simplified rival city growth. Rivals do not yet build autonomous structures, send their own field armies, or trade. Paths have distinct victory conditions, but their balance and the illustrated map will need testing and refinement on mobile.

## Guided stages within each year
Each year is broken into five sequential stages:
1. **Move units** — move **every ready unit** (one movement/action per unit per year), selecting them from the unit list or directly on the map. The phase remains active while another unit can act and automatically advances only when every unit has acted (or you press Next).
2. **Assign workers** — you may assign **every unassigned citizen** in a single worker phase, one per available resource tile. Assign them individually or tap **Assign all workers**, which balances food with timber and stone. The phase only auto-skips when no free citizens remain; a free citizen may always be assigned to construction. Finite deposits release their assigned worker when exhausted.
3. **Construction** — start exactly one city development or unit-training project, civilisation-wide. When a project is underway, this stage is automatically skipped.
4. **Choose technology** — start exactly one research project. When a project is already being researched, this stage is automatically skipped.
5. **End Year** — the only action that advances resource gathering, research, construction, population and city borders.

Each year has a **revisitable turn checklist**, not a one-way lock. Use **Next** to skip a suggested step. Tap the current step label in the bottom bar to open **This year**, where you can revisit movement, workers, construction or technology in any order. The research card, city panel and map-unit selection remain usable even after those steps have been skipped. **End Year** is always visible, and only clicking End Year advances production, research, construction and year counters. The top-right menu also offers the turn checklist and Society choices.

A previously skipped action can still be taken **before End Year** as long as its normal constraints hold: each unit moves once per year, each worked tile requires a free citizen, one construction project can be active, and only one technology is researched at a time. Work assignments can be rearranged during the year. The checklist is a navigation aid, not a commitment.

The top bar shows population as **total(assigned)**, such as **6(4)**. The research progress card replaces the old static city-name panel at the bottom-left: it shows current technology, progress and estimated years until completion, and opens research controls when tapped. The city drawing shows an active construction project's progress bar and estimated years beneath the city. Work remaining falls every year based on assigned construction builders (not unassigned people), stocked materials, Workshops and specialisation bonuses.

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
The Workers page prominently shows **Workers remaining**, counting people not assigned to land or construction. Each resource tile uses one worker. A new **Builders** assignment lets you move free citizens onto construction projects with the +/− buttons. Every builder assigned to the project city adds **+1 construction work per year** (up to six builders counted for this bonus). Builders cannot gather food or timber simultaneously. A Workshop adds a further +1 construction work per year.

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
At the beginning only the nearby **two-tile radius around the Settler** is visible. Unexplored map tiles are dark and do not reveal enemy cities, resource deposits or influence borders. Units and city centres reveal their surroundings. Scouts extend vision further, and Lookout Towers increase sight from their city.

Previously explored land remains dimmed when no friendly unit or city can currently see it. Dynamic resource information, rival cities and territory borders are hidden outside current sight until explored again. New exploration and work assignments are stored in the existing browser save; older saves are migrated to include the fog and builder records.

The full rival AI and defensive combat system are not implemented yet; City Walls establish the prerequisite building for defensive bonuses in later battles.

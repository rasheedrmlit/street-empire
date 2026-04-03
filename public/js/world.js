// ============================================================
// STREET EMPIRE — World System
// Cities, Locations, Territory, Safe Houses, Businesses
// ============================================================

(function () {

  // ==========================================================
  // CITY & LOCATION DATA
  // ==========================================================

  const CITIES = [
    {
      name: "Miami",
      description: "Vice City vibes. Product flows through the port like water. Latin connections run deep and the nightlife never stops.",
      baseHeat: 0.7,
      economy: "import-heavy",
      vibe: "tropical-hustle",
      safeHousePrice: 25000,
      locations: [
        {
          id: "miami-block-overtown",
          name: "Overtown Block",
          type: "block",
          description: "The real Miami, far from the tourist cameras. Crack era scars run deep but the corners still pump.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 4,
          priceModifier: 1.0,
          events: ["bust", "mugging", "turf_war", "fiend_rush"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "miami-trap-littlehavana",
          name: "Little Havana Trap",
          type: "trap",
          description: "A nondescript house behind a botanica on Calle Ocho. The old Cuban connects look the other way.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 2,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "miami-club-wynwood",
          name: "Wynwood Club",
          type: "club",
          description: "Neon-lit club in the arts district. Trust fund kids and models pay premium for anything that keeps the party going.",
          availablePeriods: ["night"],
          riskLevel: 2,
          priceModifier: 1.5,
          events: ["vip_client", "celebrity_sighting", "bouncer_trouble"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "miami-docks-portmiami",
          name: "Port of Miami Docks",
          type: "docks",
          description: "Container ships from Colombia and the Caribbean unload daily. The longshoremen know which crates to lose track of.",
          availablePeriods: ["morning"],
          riskLevel: 3,
          priceModifier: 0.7,
          events: ["customs_sweep", "big_shipment", "cartel_contact"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "miami-safehouse-coralgables",
          name: "Coral Gables Safe House",
          type: "safehouse",
          description: "Quiet residential street in the Gables. Manicured lawn, two-car garage, reinforced panic room in the basement.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "miami-strip-southbeach",
          name: "South Beach Strip",
          type: "strip",
          description: "Ocean Drive to Collins Ave. Tourists, hustlers, and undercovers all mixed in together on the neon-lit strip.",
          availablePeriods: ["afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.2,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "undercover"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "New York",
      description: "The biggest market in the country. Sky-high prices, sky-high risk. Every borough has its own rules.",
      baseHeat: 0.9,
      economy: "high-demand",
      vibe: "concrete-jungle",
      safeHousePrice: 50000,
      locations: [
        {
          id: "nyc-block-washheights",
          name: "Washington Heights Block",
          type: "block",
          description: "Dominican flags fly from every fire escape. The corners here have been running since the 80s crack boom.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 4,
          priceModifier: 1.0,
          events: ["bust", "mugging", "turf_war", "fiend_rush"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "nyc-trap-brownsville",
          name: "Brownsville Trap",
          type: "trap",
          description: "Deep in the east Brooklyn projects. The elevator smells like smoke and the hallway cameras stay broken.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "nyc-club-manhattan",
          name: "Manhattan Club Row",
          type: "club",
          description: "Meatpacking to Midtown, velvet ropes and bottle service. Wall Street brokers blow through product like water.",
          availablePeriods: ["night"],
          riskLevel: 2,
          priceModifier: 1.8,
          events: ["vip_client", "celebrity_sighting", "bouncer_trouble"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "nyc-docks-navyyard",
          name: "Brooklyn Navy Yard Docks",
          type: "docks",
          description: "Industrial waterfront under the Manhattan Bridge. Ghost containers sit for days before anyone comes looking.",
          availablePeriods: ["morning"],
          riskLevel: 4,
          priceModifier: 0.65,
          events: ["customs_sweep", "big_shipment", "mob_connection"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "nyc-safehouse-bronx",
          name: "Bronx Safe House",
          type: "safehouse",
          description: "Third-floor walkup in Mott Haven. Steel door, barred windows, and a landlord who only takes cash.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 2,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "nyc-strip-timessquare",
          name: "Times Square Strip",
          type: "strip",
          description: "Bright lights and dark alleys, all within a block. Every vice is for sale if you know where to look.",
          availablePeriods: ["afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.3,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "undercover"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "Los Angeles",
      description: "Hollywood money meets cartel supply lines. Sprawling city where every neighborhood is its own world.",
      baseHeat: 0.6,
      economy: "entertainment-driven",
      vibe: "sun-soaked-hustle",
      safeHousePrice: 35000,
      locations: [
        {
          id: "la-block-compton",
          name: "Compton Block",
          type: "block",
          description: "Rosecrans and Central. Gang territory lines drawn on every wall. Move wrong and you end up on the news.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 5,
          priceModifier: 0.9,
          events: ["bust", "mugging", "turf_war", "drive_by"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "la-trap-skidrow",
          name: "Skid Row Trap",
          type: "trap",
          description: "Downtown tent city. The cops gave up on this stretch. Demand is constant and nobody asks questions.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "la-club-hollywood",
          name: "Hollywood Hills Lounge",
          type: "club",
          description: "Private lounge above Sunset Blvd. Producers, rappers, and influencers burning through cash for the gram.",
          availablePeriods: ["night"],
          riskLevel: 1,
          priceModifier: 1.7,
          events: ["vip_client", "celebrity_sighting", "industry_connection"],
          discovered: false,
          requiresReputation: "known"
        },
        {
          id: "la-docks-sanpedro",
          name: "San Pedro Docks",
          type: "docks",
          description: "Port of Los Angeles. Biggest port on the West Coast. Sinaloa product comes through here by the ton.",
          availablePeriods: ["morning"],
          riskLevel: 3,
          priceModifier: 0.65,
          events: ["customs_sweep", "big_shipment", "cartel_contact"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "la-safehouse-silverlake",
          name: "Silver Lake Safe House",
          type: "safehouse",
          description: "Hipster neighborhood bungalow with a hidden basement. Nobody suspects the house with the succulent garden.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "la-strip-venice",
          name: "Venice Beach Boardwalk",
          type: "strip",
          description: "Muscle Beach to the canals. Street performers, smoke shops, and shady characters peddling everything under the sun.",
          availablePeriods: ["morning", "afternoon"],
          riskLevel: 2,
          priceModifier: 1.2,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "tourist_sale"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "Chicago",
      description: "The crossroads. Every crew in the Midwest moves through here. South Side and West Side run by different rules.",
      baseHeat: 0.8,
      economy: "distribution-hub",
      vibe: "cold-steel",
      safeHousePrice: 20000,
      locations: [
        {
          id: "chi-block-englewood",
          name: "Englewood Block",
          type: "block",
          description: "63rd and Halsted. One of the most dangerous intersections in America. But the money is real if you survive.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 5,
          priceModifier: 0.9,
          events: ["bust", "mugging", "turf_war", "drive_by", "shootout"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "chi-trap-westgarfield",
          name: "West Garfield Trap",
          type: "trap",
          description: "Boarded-up two-flat on a block of boarded-up two-flats. The only traffic here is foot traffic coming to score.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 4,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "chi-club-riverNorth",
          name: "River North Club",
          type: "club",
          description: "Upscale nightlife district. Young professionals and off-duty athletes looking to party. Coke moves fast here.",
          availablePeriods: ["night"],
          riskLevel: 2,
          priceModifier: 1.5,
          events: ["vip_client", "celebrity_sighting", "bouncer_trouble"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "chi-docks-calumet",
          name: "Calumet Harbor Docks",
          type: "docks",
          description: "South side industrial port. Product comes up from the Gulf through the river system. Old mob ties still hold.",
          availablePeriods: ["morning"],
          riskLevel: 3,
          priceModifier: 0.7,
          events: ["customs_sweep", "big_shipment", "mob_connection"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "chi-safehouse-pilsen",
          name: "Pilsen Safe House",
          type: "safehouse",
          description: "Mexican neighborhood on the Lower West Side. The community keeps to itself and nobody talks to cops.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "chi-strip-loop",
          name: "The Loop Strip",
          type: "strip",
          description: "Downtown Chicago. Michigan Ave to State Street. Shoppers, commuters, and dealers hiding in plain sight.",
          availablePeriods: ["morning", "afternoon"],
          riskLevel: 3,
          priceModifier: 1.2,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "undercover"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "Houston",
      description: "Border proximity keeps supply cheap and plentiful. Oil money mixes with cartel cash in the bayou heat.",
      baseHeat: 0.5,
      economy: "supply-rich",
      vibe: "sprawl-and-swang",
      safeHousePrice: 15000,
      locations: [
        {
          id: "hou-block-fifthward",
          name: "Fifth Ward Block",
          type: "block",
          description: "The Nickel. Shotgun houses and corner boys. Lean culture was born out here and the tradition holds strong.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 4,
          priceModifier: 0.9,
          events: ["bust", "mugging", "turf_war", "fiend_rush"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "hou-trap-greenspoint",
          name: "Greenspoint Trap",
          type: "trap",
          description: "Gunspoint, locals call it. Apartment complex trap in north Houston. Product moves 24/7 from the parking lot.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "hou-club-washington",
          name: "Washington Ave Club",
          type: "club",
          description: "Houston nightlife strip. Oil exec kids and Trill rappers. Lean and coke move at a premium when the DJ drops.",
          availablePeriods: ["night"],
          riskLevel: 2,
          priceModifier: 1.4,
          events: ["vip_client", "celebrity_sighting", "bouncer_trouble"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "hou-docks-shipchannel",
          name: "Ship Channel Docks",
          type: "docks",
          description: "Houston Ship Channel. Fifty miles of industrial waterway. Mexican cartels have had routes here for decades.",
          availablePeriods: ["morning"],
          riskLevel: 2,
          priceModifier: 0.6,
          events: ["customs_sweep", "big_shipment", "cartel_contact"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "hou-safehouse-sugarland",
          name: "Sugar Land Safe House",
          type: "safehouse",
          description: "McMansion in the suburbs. HOA would lose their minds if they knew about the false wall in the master closet.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "hou-strip-westheimer",
          name: "Westheimer Strip",
          type: "strip",
          description: "Miles of strip malls and dive bars. Montrose to Midtown, every flavor of hustle lives on this road.",
          availablePeriods: ["afternoon", "night"],
          riskLevel: 2,
          priceModifier: 1.1,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "carjacking"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "Detroit",
      description: "Hard streets, desperate customers, and razor-thin margins. Abandoned blocks mean no witnesses and no rules.",
      baseHeat: 0.85,
      economy: "survival-market",
      vibe: "rust-belt-grit",
      safeHousePrice: 8000,
      locations: [
        {
          id: "det-block-7mile",
          name: "7 Mile Block",
          type: "block",
          description: "East side, 7 Mile and Gratiot. The fiends line up like a drive-through at shift change time.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 5,
          priceModifier: 0.85,
          events: ["bust", "mugging", "turf_war", "drive_by", "shootout"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "det-trap-brightmoor",
          name: "Brightmoor Trap",
          type: "trap",
          description: "Abandoned house in the most vacant neighborhood in the city. Half the block is empty lots and overgrown ruins.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 4,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit", "squatter_trouble"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "det-club-greektown",
          name: "Greektown Casino Club",
          type: "club",
          description: "Casino floor to VIP room. Gamblers on a hot streak want to keep the high going by any means necessary.",
          availablePeriods: ["night"],
          riskLevel: 2,
          priceModifier: 1.4,
          events: ["vip_client", "high_roller", "security_trouble"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "det-docks-rouge",
          name: "River Rouge Docks",
          type: "docks",
          description: "Industrial riverfront. Canadian product crosses the Detroit River nightly. Windsor is a stone's throw away.",
          availablePeriods: ["morning"],
          riskLevel: 3,
          priceModifier: 0.7,
          events: ["customs_sweep", "big_shipment", "canadian_connect"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "det-safehouse-corktown",
          name: "Corktown Safe House",
          type: "safehouse",
          description: "Renovated brick row house in the old Irish neighborhood. Gentrification provides the perfect cover.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "det-strip-michigan",
          name: "Michigan Avenue Strip",
          type: "strip",
          description: "Coney Islands, pawn shops, and liquor stores. If you need it, someone on Michigan Ave is selling it.",
          availablePeriods: ["morning", "afternoon"],
          riskLevel: 3,
          priceModifier: 1.1,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "carjacking"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "Atlanta",
      description: "The hub of the South. Trap music was born here for a reason. I-85 corridor is the pipeline.",
      baseHeat: 0.65,
      economy: "distribution-south",
      vibe: "trap-capital",
      safeHousePrice: 22000,
      locations: [
        {
          id: "atl-block-zone6",
          name: "Zone 6 Block",
          type: "block",
          description: "East Atlanta. Where the trap sound came from and the real traps still run. Glenwood and Flat Shoals stay busy.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 4,
          priceModifier: 1.0,
          events: ["bust", "mugging", "turf_war", "fiend_rush"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "atl-trap-bankhead",
          name: "Bankhead Trap",
          type: "trap",
          description: "West side trap off Donald Lee Hollowell. The Bluff is right around the corner and the foot traffic never stops.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 4,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "atl-club-buckhead",
          name: "Buckhead Nightclub",
          type: "club",
          description: "Peachtree Road money. Athletes, rappers, and strippers. VIP tables go for five figures and the drugs flow free.",
          availablePeriods: ["night"],
          riskLevel: 2,
          priceModifier: 1.6,
          events: ["vip_client", "celebrity_sighting", "bouncer_trouble"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "atl-docks-savannah",
          name: "Savannah Highway Warehouse",
          type: "docks",
          description: "Off I-16 near the port connection. Savannah harbor product gets rerouted here. Bulk only, serious buyers.",
          availablePeriods: ["morning"],
          riskLevel: 3,
          priceModifier: 0.7,
          events: ["customs_sweep", "big_shipment", "southern_connect"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "atl-safehouse-decatur",
          name: "Decatur Safe House",
          type: "safehouse",
          description: "Quiet house off East Ponce in Decatur. College town vibe makes for good camouflage.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "atl-strip-peachtree",
          name: "Peachtree Street Strip",
          type: "strip",
          description: "Midtown to downtown along Peachtree. Convention crowds, college kids, and hustlers working the corridor.",
          availablePeriods: ["afternoon", "night"],
          riskLevel: 2,
          priceModifier: 1.2,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "undercover"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "Philadelphia",
      description: "East coast grit. The opioid crisis hit this city hard. Kensington is ground zero.",
      baseHeat: 0.75,
      economy: "opioid-heavy",
      vibe: "gritty-survivor",
      safeHousePrice: 18000,
      locations: [
        {
          id: "phl-block-kensington",
          name: "Kensington Block",
          type: "block",
          description: "Under the El tracks on Kensington Ave. Open-air drug market visible from the train. Fentanyl is king here.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 5,
          priceModifier: 0.85,
          events: ["bust", "mugging", "overdose_scene", "fiend_rush"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "phl-trap-northphilly",
          name: "North Philly Trap",
          type: "trap",
          description: "Row house on a block of row houses near Temple. Steel door, camera out front, and a runner on the corner.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "phl-club-oldcity",
          name: "Old City Lounge",
          type: "club",
          description: "Historic district nightlife. Penn and Drexel kids with trust funds. Party drugs at party prices.",
          availablePeriods: ["night"],
          riskLevel: 2,
          priceModifier: 1.5,
          events: ["vip_client", "college_crowd", "bouncer_trouble"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "phl-docks-delaware",
          name: "Delaware River Docks",
          type: "docks",
          description: "Port of Philadelphia. Container terminal along the Delaware. East coast distribution hub for incoming product.",
          availablePeriods: ["morning"],
          riskLevel: 3,
          priceModifier: 0.7,
          events: ["customs_sweep", "big_shipment", "mob_connection"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "phl-safehouse-manayunk",
          name: "Manayunk Safe House",
          type: "safehouse",
          description: "Narrow row house up the hill from Main Street. College bar neighborhood, cops are focused on drunk drivers not dealers.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "phl-strip-southstreet",
          name: "South Street Strip",
          type: "strip",
          description: "Head shops, tattoo parlors, and cheesesteak joints. The freaks come out at night but the deals happen all day.",
          availablePeriods: ["afternoon", "night"],
          riskLevel: 2,
          priceModifier: 1.2,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "tourist_sale"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "Las Vegas",
      description: "Party town. Recreational demand is through the roof. What happens in Vegas stays buried in the desert.",
      baseHeat: 0.4,
      economy: "recreational-boom",
      vibe: "neon-excess",
      safeHousePrice: 30000,
      locations: [
        {
          id: "lv-block-northlv",
          name: "North Las Vegas Block",
          type: "block",
          description: "Past the strip, past the suburbs, into the real Vegas. Meth and pills keep the graveyard shift casino workers going.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.0,
          events: ["bust", "mugging", "turf_war"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "lv-trap-nakedcity",
          name: "Naked City Trap",
          type: "trap",
          description: "Apartment complex behind the Stratosphere. The name comes from the old days, but the hustle is timeless.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "lv-club-strip",
          name: "The Strip VIP",
          type: "club",
          description: "Mega-club inside a casino resort. Bachelor parties and high rollers dropping thousands a night on bottles and blow.",
          availablePeriods: ["night"],
          riskLevel: 1,
          priceModifier: 2.0,
          events: ["vip_client", "high_roller", "celebrity_sighting", "whale_client"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "lv-docks-industrial",
          name: "Industrial Road Warehouse",
          type: "docks",
          description: "Off the I-15 behind the strip. Nondescript warehouse where California product gets redistributed to the desert.",
          availablePeriods: ["morning"],
          riskLevel: 2,
          priceModifier: 0.75,
          events: ["customs_sweep", "big_shipment", "desert_connect"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "lv-safehouse-henderson",
          name: "Henderson Safe House",
          type: "safehouse",
          description: "Gated community in the suburbs. Desert landscaping and tinted windows. The neighbors are all too busy gambling to notice.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "lv-strip-fremont",
          name: "Fremont Street Strip",
          type: "strip",
          description: "Old Vegas. Cheaper, seedier, more dangerous. The canopy light show hides a lot of shady transactions below.",
          availablePeriods: ["afternoon", "night"],
          riskLevel: 2,
          priceModifier: 1.3,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "tourist_sale"],
          discovered: true,
          requiresReputation: null
        }
      ]
    },
    {
      name: "Seattle",
      description: "Tech money and liberal attitudes make for a unique market. Rain keeps everyone indoors and online.",
      baseHeat: 0.35,
      economy: "tech-money",
      vibe: "grey-sky-hustle",
      safeHousePrice: 40000,
      locations: [
        {
          id: "sea-block-rainierbeach",
          name: "Rainier Beach Block",
          type: "block",
          description: "South Seattle. The most diverse zip code in the country and the most active drug corners in the PNW.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 3,
          priceModifier: 1.0,
          events: ["bust", "mugging", "turf_war"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "sea-trap-centraldistrict",
          name: "Central District Trap",
          type: "trap",
          description: "Gentrification pushed the old heads out but the trap stays. Bungalow between a yoga studio and a craft brewery.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 2,
          priceModifier: 1.0,
          events: ["raid", "stash_stolen", "crew_recruit"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "sea-club-capitolhill",
          name: "Capitol Hill Club",
          type: "club",
          description: "Seattle nightlife epicenter. Tech workers with six-figure salaries looking for something their money can not normally buy.",
          availablePeriods: ["night"],
          riskLevel: 1,
          priceModifier: 1.6,
          events: ["vip_client", "tech_bro_buyer", "bouncer_trouble"],
          discovered: true,
          requiresReputation: "known"
        },
        {
          id: "sea-docks-harbor",
          name: "Harbor Island Docks",
          type: "docks",
          description: "Port of Seattle. Pacific Rim connections bring product from Asia. Fishing boats provide perfect cover.",
          availablePeriods: ["morning"],
          riskLevel: 2,
          priceModifier: 0.7,
          events: ["customs_sweep", "big_shipment", "pacific_connect"],
          discovered: false,
          requiresReputation: "respected"
        },
        {
          id: "sea-safehouse-ballard",
          name: "Ballard Safe House",
          type: "safehouse",
          description: "Old fisherman cottage in the Scandinavian neighborhood. Basement converted to a proper stash house behind the sauna.",
          availablePeriods: ["morning", "afternoon", "night"],
          riskLevel: 1,
          priceModifier: 1.0,
          events: ["raid"],
          discovered: true,
          requiresReputation: null
        },
        {
          id: "sea-strip-pike",
          name: "Pike Place Strip",
          type: "strip",
          description: "Tourist market up top, hustle down below. Post Alley to the waterfront. Fish throwers cover the sound of handshakes.",
          availablePeriods: ["morning", "afternoon"],
          riskLevel: 2,
          priceModifier: 1.3,
          events: ["random_encounter", "gear_shop", "weapon_dealer", "tourist_sale"],
          discovered: true,
          requiresReputation: null
        }
      ]
    }
  ];

  // ==========================================================
  // BUSINESS PROPERTY DEFINITIONS
  // ==========================================================

  const BUSINESS_TYPES = {
    laundromat: {
      name: "Laundromat",
      cost: 20000,
      laundersPerDay: 2000,
      description: "Spin cycle, cash cycle. Quarters in, clean money out."
    },
    carwash: {
      name: "Car Wash",
      cost: 50000,
      laundersPerDay: 5000,
      description: "Dirty cars and dirty money both come out clean."
    },
    restaurant: {
      name: "Restaurant",
      cost: 100000,
      laundersPerDay: 15000,
      description: "The food is mediocre but the books are immaculate."
    }
  };

  // ==========================================================
  // REPUTATION TIERS
  // ==========================================================

  const REPUTATION_TIERS = [
    { name: "nobody",    minRep: 0 },
    { name: "known",     minRep: 500 },
    { name: "respected", minRep: 2000 },
    { name: "feared",    minRep: 5000 },
    { name: "legendary", minRep: 15000 }
  ];

  // ==========================================================
  // HELPER FUNCTIONS
  // ==========================================================

  function getReputationTier(reputation) {
    let tier = REPUTATION_TIERS[0];
    for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
      if (reputation >= REPUTATION_TIERS[i].minRep) {
        tier = REPUTATION_TIERS[i];
        break;
      }
    }
    return tier.name;
  }

  function getCityByName(name) {
    return CITIES.find(function (c) {
      return c.name.toLowerCase() === name.toLowerCase();
    }) || null;
  }

  function getLocationById(id) {
    for (var i = 0; i < CITIES.length; i++) {
      for (var j = 0; j < CITIES[i].locations.length; j++) {
        if (CITIES[i].locations[j].id === id) {
          return CITIES[i].locations[j];
        }
      }
    }
    return null;
  }

  function getCityLocations(cityName) {
    var city = getCityByName(cityName);
    return city ? city.locations : [];
  }

  function getCityForLocation(locationId) {
    for (var i = 0; i < CITIES.length; i++) {
      for (var j = 0; j < CITIES[i].locations.length; j++) {
        if (CITIES[i].locations[j].id === locationId) {
          return CITIES[i];
        }
      }
    }
    return null;
  }

  function getAvailableLocations(game) {
    var currentCity = getCityByName(game.currentCity || game.city.name);
    if (!currentCity) return [];

    var period = game.period || "afternoon";
    var playerTier = getReputationTier(game.reputation || 0);

    return currentCity.locations.filter(function (loc) {
      // Must be discovered
      if (!loc.discovered) return false;

      // Must be available during current time period
      if (loc.availablePeriods.indexOf(period) === -1) return false;

      // Must meet reputation requirement
      if (loc.requiresReputation) {
        var requiredIndex = REPUTATION_TIERS.findIndex(function (t) {
          return t.name === loc.requiresReputation;
        });
        var playerIndex = REPUTATION_TIERS.findIndex(function (t) {
          return t.name === playerTier;
        });
        if (playerIndex < requiredIndex) return false;
      }

      return true;
    });
  }

  // ==========================================================
  // TRAVEL SYSTEM
  // ==========================================================

  function travelToCity(game, cityName) {
    var targetCity = getCityByName(cityName);
    if (!targetCity) {
      return { success: false, msg: "Unknown city: " + cityName };
    }

    var currentCityName = game.currentCity || game.city.name;
    if (targetCity.name.toLowerCase() === currentCityName.toLowerCase()) {
      return { success: false, msg: "You're already in " + targetCity.name + "." };
    }

    // Travel costs 1 time period
    game.currentCity = targetCity.name;
    game.city = window.GameEngine
      ? window.GameEngine.CITIES.find(function (c) { return c.name === targetCity.name; }) || game.city
      : game.city;

    // Advance period if Core is available
    if (window.Core && typeof window.Core.advancePeriod === "function") {
      window.Core.advancePeriod(game);
    } else {
      // Simple period advancement fallback
      var periods = ["morning", "afternoon", "night"];
      var currentIndex = periods.indexOf(game.period || "afternoon");
      if (currentIndex === 2) {
        // Night -> next day morning
        game.day = (game.day || 1) + 1;
        game.period = "morning";
      } else {
        game.period = periods[currentIndex + 1];
      }
    }

    // Travel event chance (25%)
    var travelEvent = null;
    if (Math.random() < 0.25) {
      travelEvent = generateTravelEvent(game);
    }

    return {
      success: true,
      msg: "Traveled to " + targetCity.name + ". " + targetCity.description,
      city: targetCity,
      event: travelEvent
    };
  }

  function generateTravelEvent(game) {
    var events = [
      {
        title: "HIGHWAY CHECKPOINT",
        message: "State troopers set up a checkpoint on the interstate.",
        effect: function (g) {
          var totalInventory = 0;
          for (var drug in g.inventory) {
            totalInventory += g.inventory[drug] || 0;
          }
          if (totalInventory > 20 && Math.random() < 0.4) {
            var lostCash = Math.floor((g.cash || 0) * 0.15);
            g.cash -= lostCash;
            return "They searched your vehicle and found cash. Lost $" + lostCash.toLocaleString() + " to civil forfeiture.";
          }
          return "You bluffed your way through. Keep moving.";
        }
      },
      {
        title: "ROAD AMBUSH",
        message: "A rival crew tries to jack you on the highway.",
        effect: function (g) {
          g.health = (g.health || 100) - Math.floor(Math.random() * 15 + 5);
          return "Took some damage in the scuffle but made it through.";
        }
      },
      {
        title: "SMOOTH RIDE",
        message: "Met a connect at a rest stop.",
        effect: function (g) {
          g.reputation = (g.reputation || 0) + 50;
          return "New city, new contacts. Reputation +50.";
        }
      }
    ];

    var ev = events[Math.floor(Math.random() * events.length)];
    var result = ev.effect(game);
    return { title: ev.title, message: ev.message, result: result };
  }

  function visitLocation(game, locationId) {
    var location = getLocationById(locationId);
    if (!location) {
      return { success: false, msg: "Unknown location." };
    }

    var period = game.period || "afternoon";
    if (location.availablePeriods.indexOf(period) === -1) {
      return {
        success: false,
        msg: location.name + " is not available during the " + period + ". Open during: " + location.availablePeriods.join(", ") + "."
      };
    }

    if (!location.discovered) {
      return { success: false, msg: "You haven't discovered this location yet." };
    }

    // Check reputation requirement
    if (location.requiresReputation) {
      var playerTier = getReputationTier(game.reputation || 0);
      var requiredIndex = REPUTATION_TIERS.findIndex(function (t) {
        return t.name === location.requiresReputation;
      });
      var playerIndex = REPUTATION_TIERS.findIndex(function (t) {
        return t.name === playerTier;
      });
      if (playerIndex < requiredIndex) {
        return {
          success: false,
          msg: "You need to be at least '" + location.requiresReputation + "' reputation to access " + location.name + "."
        };
      }
    }

    // Visiting costs 1 time period
    if (window.Core && typeof window.Core.advancePeriod === "function") {
      window.Core.advancePeriod(game);
    } else {
      var periods = ["morning", "afternoon", "night"];
      var currentIndex = periods.indexOf(game.period || "afternoon");
      if (currentIndex === 2) {
        game.day = (game.day || 1) + 1;
        game.period = "morning";
      } else {
        game.period = periods[currentIndex + 1];
      }
    }

    return {
      success: true,
      msg: "Arrived at " + location.name + ". " + location.description,
      location: location,
      priceModifier: location.priceModifier,
      riskLevel: location.riskLevel
    };
  }

  function discoverLocation(game, locationId) {
    var location = getLocationById(locationId);
    if (!location) {
      return { success: false, msg: "Unknown location." };
    }
    if (location.discovered) {
      return { success: false, msg: "You already know about " + location.name + "." };
    }
    location.discovered = true;
    return {
      success: true,
      msg: "Discovered: " + location.name + " — " + location.description
    };
  }

  // ==========================================================
  // TERRITORY SYSTEM
  // ==========================================================

  function _ensureTerritoryState(game) {
    if (!game.territory) {
      game.territory = {};
    }
  }

  function claimTerritory(game, cityName, locationId) {
    _ensureTerritoryState(game);

    var city = getCityByName(cityName);
    if (!city) return { success: false, msg: "Unknown city." };

    var location = getLocationById(locationId);
    if (!location) return { success: false, msg: "Unknown location." };
    if (location.type !== "block") {
      return { success: false, msg: "You can only claim blocks as territory." };
    }

    if (!game.territory[cityName]) {
      game.territory[cityName] = [];
    }

    if (game.territory[cityName].indexOf(locationId) !== -1) {
      return { success: false, msg: "You already control " + location.name + "." };
    }

    // Claiming requires reputation
    var playerTier = getReputationTier(game.reputation || 0);
    if (playerTier === "nobody") {
      return { success: false, msg: "You need at least 'known' reputation to claim territory." };
    }

    // Claiming chance based on risk level (higher risk = harder to claim)
    var claimChance = 0.9 - (location.riskLevel * 0.1);
    if (Math.random() > claimChance) {
      game.health = (game.health || 100) - Math.floor(Math.random() * 20 + 10);
      return {
        success: false,
        msg: "The current crew holding " + location.name + " fought back hard. You took damage and retreated."
      };
    }

    game.territory[cityName].push(locationId);
    game.reputation = (game.reputation || 0) + 200;

    return {
      success: true,
      msg: "You claimed " + location.name + " in " + cityName + "! Reputation +200."
    };
  }

  function defendTerritory(game, cityName) {
    _ensureTerritoryState(game);

    if (!game.territory[cityName] || game.territory[cityName].length === 0) {
      return { success: false, msg: "You don't control any territory in " + cityName + "." };
    }

    // Random chance a territory is contested
    var contested = game.territory[cityName][Math.floor(Math.random() * game.territory[cityName].length)];
    var location = getLocationById(contested);
    var defendChance = 0.6 + (getReputationTier(game.reputation || 0) === "feared" ? 0.2 : 0) +
                       (getReputationTier(game.reputation || 0) === "legendary" ? 0.3 : 0);

    if (Math.random() < defendChance) {
      game.reputation = (game.reputation || 0) + 100;
      return {
        success: true,
        msg: "Rivals tried to take " + (location ? location.name : contested) + " but your crew held them off. Reputation +100."
      };
    } else {
      // Lost territory
      var idx = game.territory[cityName].indexOf(contested);
      if (idx > -1) game.territory[cityName].splice(idx, 1);
      game.reputation = (game.reputation || 0) - 50;
      return {
        success: false,
        msg: "You lost control of " + (location ? location.name : contested) + ". Reputation -50."
      };
    }
  }

  function getTerritoryIncome(game) {
    _ensureTerritoryState(game);

    var totalIncome = 0;
    var breakdown = [];

    for (var cityName in game.territory) {
      var city = getCityByName(cityName);
      if (!city) continue;

      var blocks = game.territory[cityName];
      for (var i = 0; i < blocks.length; i++) {
        var location = getLocationById(blocks[i]);
        // Base income per block: $500-$2000 modified by city heat (demand)
        var baseIncome = 500 + Math.floor(city.baseHeat * 1500);
        var variance = 0.7 + Math.random() * 0.6;
        var income = Math.floor(baseIncome * variance);
        totalIncome += income;
        breakdown.push({
          city: cityName,
          location: location ? location.name : blocks[i],
          income: income
        });
      }
    }

    return { total: totalIncome, breakdown: breakdown };
  }

  function getControlledTerritory(game) {
    _ensureTerritoryState(game);

    var result = [];
    for (var cityName in game.territory) {
      var blocks = game.territory[cityName];
      for (var i = 0; i < blocks.length; i++) {
        var location = getLocationById(blocks[i]);
        result.push({
          city: cityName,
          locationId: blocks[i],
          locationName: location ? location.name : blocks[i]
        });
      }
    }
    return result;
  }

  // ==========================================================
  // SAFE HOUSE SYSTEM
  // ==========================================================

  function _ensureSafeHouseState(game) {
    if (!game.safeHouses) {
      game.safeHouses = {};
    }
  }

  function buySafeHouse(game, cityName) {
    _ensureSafeHouseState(game);

    var city = getCityByName(cityName);
    if (!city) return { success: false, msg: "Unknown city." };

    if (game.safeHouses[cityName]) {
      return { success: false, msg: "You already own a safe house in " + cityName + "." };
    }

    var price = city.safeHousePrice;
    if ((game.cash || 0) < price) {
      return { success: false, msg: "Not enough cash. Safe house in " + cityName + " costs $" + price.toLocaleString() + "." };
    }

    game.cash -= price;
    game.safeHouses[cityName] = {
      cash: 0,
      drugs: {},
      purchased: true,
      raidProtection: city.baseHeat < 0.5 // Low heat cities have natural raid protection
    };

    return {
      success: true,
      msg: "Purchased safe house in " + cityName + " for $" + price.toLocaleString() + "."
    };
  }

  function stashCash(game, cityName, amount) {
    _ensureSafeHouseState(game);

    if (!game.safeHouses[cityName]) {
      return { success: false, msg: "You don't own a safe house in " + cityName + "." };
    }

    amount = Math.min(amount, game.cash || 0);
    if (amount <= 0) return { success: false, msg: "No cash to stash." };

    game.cash -= amount;
    game.safeHouses[cityName].cash += amount;

    return {
      success: true,
      msg: "Stashed $" + amount.toLocaleString() + " in " + cityName + " safe house. Total stashed: $" + game.safeHouses[cityName].cash.toLocaleString()
    };
  }

  function retrieveCash(game, cityName, amount) {
    _ensureSafeHouseState(game);

    if (!game.safeHouses[cityName]) {
      return { success: false, msg: "You don't own a safe house in " + cityName + "." };
    }

    amount = Math.min(amount, game.safeHouses[cityName].cash);
    if (amount <= 0) return { success: false, msg: "No cash stored here." };

    game.safeHouses[cityName].cash -= amount;
    game.cash = (game.cash || 0) + amount;

    return {
      success: true,
      msg: "Retrieved $" + amount.toLocaleString() + " from " + cityName + " safe house."
    };
  }

  function stashDrugs(game, cityName, drugName, qty) {
    _ensureSafeHouseState(game);

    if (!game.safeHouses[cityName]) {
      return { success: false, msg: "You don't own a safe house in " + cityName + "." };
    }

    if (!game.inventory || (game.inventory[drugName] || 0) < qty) {
      return { success: false, msg: "You don't have enough " + drugName + " to stash." };
    }

    if (qty <= 0) return { success: false, msg: "Invalid quantity." };

    game.inventory[drugName] -= qty;
    if (!game.safeHouses[cityName].drugs[drugName]) {
      game.safeHouses[cityName].drugs[drugName] = 0;
    }
    game.safeHouses[cityName].drugs[drugName] += qty;

    return {
      success: true,
      msg: "Stashed " + qty + " " + drugName + " in " + cityName + " safe house."
    };
  }

  function retrieveDrugs(game, cityName, drugName, qty) {
    _ensureSafeHouseState(game);

    if (!game.safeHouses[cityName]) {
      return { success: false, msg: "You don't own a safe house in " + cityName + "." };
    }

    var stored = (game.safeHouses[cityName].drugs[drugName] || 0);
    if (stored < qty) {
      return { success: false, msg: "Only " + stored + " " + drugName + " stored here." };
    }

    if (qty <= 0) return { success: false, msg: "Invalid quantity." };

    game.safeHouses[cityName].drugs[drugName] -= qty;
    if (!game.inventory) game.inventory = {};
    game.inventory[drugName] = (game.inventory[drugName] || 0) + qty;

    return {
      success: true,
      msg: "Retrieved " + qty + " " + drugName + " from " + cityName + " safe house."
    };
  }

  function checkSafeHouseRaid(game, cityName) {
    _ensureSafeHouseState(game);

    if (!game.safeHouses[cityName]) return null;

    var city = getCityByName(cityName);
    if (!city) return null;

    // Raid chance based on city heat: only if heat > 0.8
    var heatLevel = city.baseHeat + (game.cityHeatModifiers ? (game.cityHeatModifiers[cityName] || 0) : 0);
    if (heatLevel <= 0.8) return null;

    // 15% chance of raid when heat is high
    if (Math.random() > 0.15) return null;

    // Raid happens — lose percentage of stash
    var lostCash = Math.floor(game.safeHouses[cityName].cash * (0.3 + Math.random() * 0.4));
    game.safeHouses[cityName].cash -= lostCash;

    var lostDrugs = [];
    for (var drug in game.safeHouses[cityName].drugs) {
      if (game.safeHouses[cityName].drugs[drug] > 0 && Math.random() < 0.5) {
        var lost = Math.ceil(game.safeHouses[cityName].drugs[drug] * (0.3 + Math.random() * 0.4));
        game.safeHouses[cityName].drugs[drug] -= lost;
        lostDrugs.push(lost + " " + drug);
      }
    }

    return {
      raided: true,
      city: cityName,
      lostCash: lostCash,
      lostDrugs: lostDrugs,
      msg: "Your safe house in " + cityName + " got raided! Lost $" + lostCash.toLocaleString() +
           (lostDrugs.length > 0 ? " and " + lostDrugs.join(", ") : "") + "."
    };
  }

  // ==========================================================
  // BUSINESS / MONEY LAUNDERING SYSTEM
  // ==========================================================

  function _ensureBusinessState(game) {
    if (!game.businesses) {
      game.businesses = [];
    }
  }

  function buyBusiness(game, cityName, businessType) {
    _ensureBusinessState(game);

    var city = getCityByName(cityName);
    if (!city) return { success: false, msg: "Unknown city." };

    var bType = BUSINESS_TYPES[businessType];
    if (!bType) {
      return { success: false, msg: "Unknown business type. Choose: laundromat, carwash, or restaurant." };
    }

    // Check if already own this type in this city
    var existing = game.businesses.find(function (b) {
      return b.city === cityName && b.type === businessType;
    });
    if (existing) {
      return { success: false, msg: "You already own a " + bType.name + " in " + cityName + "." };
    }

    if ((game.cash || 0) < bType.cost) {
      return {
        success: false,
        msg: "Not enough cash. " + bType.name + " costs $" + bType.cost.toLocaleString() + "."
      };
    }

    game.cash -= bType.cost;
    game.businesses.push({
      id: cityName.toLowerCase().replace(/\s/g, "") + "-" + businessType + "-" + Date.now(),
      city: cityName,
      type: businessType,
      name: bType.name,
      laundersPerDay: bType.laundersPerDay,
      accumulatedClean: 0,
      daysOwned: 0,
      lastCollected: game.day || 1
    });

    return {
      success: true,
      msg: "Purchased " + bType.name + " in " + cityName + " for $" + bType.cost.toLocaleString() + ". Launders up to $" + bType.laundersPerDay.toLocaleString() + "/day."
    };
  }

  function collectLaunderedMoney(game) {
    _ensureBusinessState(game);

    if (game.businesses.length === 0) {
      return { success: false, msg: "You don't own any businesses." };
    }

    var totalCollected = 0;
    var breakdown = [];
    var currentDay = game.day || 1;

    for (var i = 0; i < game.businesses.length; i++) {
      var biz = game.businesses[i];
      var daysSinceLast = Math.max(0, currentDay - biz.lastCollected);
      if (daysSinceLast <= 0) continue;

      var earnings = daysSinceLast * biz.laundersPerDay;
      biz.accumulatedClean = 0;
      biz.lastCollected = currentDay;
      biz.daysOwned += daysSinceLast;

      totalCollected += earnings;
      breakdown.push({
        name: biz.name,
        city: biz.city,
        earned: earnings,
        days: daysSinceLast
      });
    }

    if (totalCollected <= 0) {
      return { success: false, msg: "Nothing to collect yet. Check back tomorrow." };
    }

    // Laundered money goes to bank (clean money)
    game.bank = (game.bank || 0) + totalCollected;

    return {
      success: true,
      msg: "Collected $" + totalCollected.toLocaleString() + " in laundered money (deposited to bank).",
      total: totalCollected,
      breakdown: breakdown
    };
  }

  function getBusinesses(game) {
    _ensureBusinessState(game);
    return game.businesses.map(function (biz) {
      var daysPending = Math.max(0, (game.day || 1) - biz.lastCollected);
      return {
        name: biz.name,
        city: biz.city,
        type: biz.type,
        laundersPerDay: biz.laundersPerDay,
        pendingEarnings: daysPending * biz.laundersPerDay,
        daysOwned: biz.daysOwned + daysPending
      };
    });
  }

  // ==========================================================
  // WORLD STATE INITIALIZATION
  // ==========================================================

  function initWorldState(game) {
    _ensureTerritoryState(game);
    _ensureSafeHouseState(game);
    _ensureBusinessState(game);

    if (!game.currentCity) {
      game.currentCity = game.city ? game.city.name : "Miami";
    }
    if (!game.period) {
      game.period = "afternoon";
    }
    if (!game.cityHeatModifiers) {
      game.cityHeatModifiers = {};
    }

    return game;
  }

  // ==========================================================
  // EXPORT
  // ==========================================================

  window.World = {
    // Data
    CITIES: CITIES,
    BUSINESS_TYPES: BUSINESS_TYPES,
    REPUTATION_TIERS: REPUTATION_TIERS,

    // Helpers
    getCityByName: getCityByName,
    getLocationById: getLocationById,
    getAvailableLocations: getAvailableLocations,
    getCityLocations: getCityLocations,
    getCityForLocation: getCityForLocation,
    getReputationTier: getReputationTier,

    // Travel
    travelToCity: travelToCity,
    visitLocation: visitLocation,
    discoverLocation: discoverLocation,

    // Territory
    claimTerritory: claimTerritory,
    defendTerritory: defendTerritory,
    getTerritoryIncome: getTerritoryIncome,
    getControlledTerritory: getControlledTerritory,

    // Safe Houses
    buySafeHouse: buySafeHouse,
    stashCash: stashCash,
    retrieveCash: retrieveCash,
    stashDrugs: stashDrugs,
    retrieveDrugs: retrieveDrugs,
    checkSafeHouseRaid: checkSafeHouseRaid,

    // Businesses
    buyBusiness: buyBusiness,
    collectLaunderedMoney: collectLaunderedMoney,
    getBusinesses: getBusinesses,

    // Init
    initWorldState: initWorldState
  };

})();

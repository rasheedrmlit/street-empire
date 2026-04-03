/**
 * Street Empire - Story & Quest System
 * ======================================
 * Main storyline, city quest lines, moral dilemmas, random events,
 * and multiple endings for the Street Empire drug dealing RPG.
 *
 * Dependencies: window.Core, window.Economy (optional), window.Combat (optional)
 * Exports: window.Story
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Story Beat Definitions  (Phase 1: Days 1-30)
  // ---------------------------------------------------------------------------

  const STORY_BEATS = [
    {
      id: 'opening_warning',
      day: 1,
      period: 0, // Morning
      phase: 1,
      flag: 'opening_played',
      title: "Viktor's Warning",
      messages: [
        "The room smells like cigarette smoke and old leather. Viktor leans forward, gold teeth catching the dim light.",
        "\"You owe me, and I don't forget. You've got thirty days. Thirty. After that, I stop being reasonable.\"",
        "He slides a crumpled photo across the table. Your family. Your address. The message is clear.",
        "\"The clock starts now. Don't make me come looking for you.\"",
      ],
      effect(game) {
        game.flags.opening_played = true;
        game.phone.messages.push({
          id: 'viktor_opening',
          from: 'Viktor',
          subject: '30 Days',
          body: "You know what happens if you don't pay. Don't test me.",
          read: false,
          day: game.world.day,
          period: 'Morning',
        });
      },
    },
    {
      id: 'jerome_tutorial',
      day: 1,
      period: 1, // Afternoon
      phase: 1,
      flag: 'jerome_intro',
      title: "Old Man Jerome",
      messages: [
        "An old man with deep lines etched into dark skin sits on an overturned crate near the corner store.",
        "\"You look lost, young blood. I've been watching you. You got that hungry look — same one I had forty years ago.\"",
        "Jerome looks you up and down with eyes that have seen everything.",
        "\"Rule number one: buy low, sell high. Rule number two: never get high on your own supply. Rule number three: trust nobody. Not even me.\"",
        "\"Now get out there and make some money before Viktor loses his patience.\"",
      ],
      effect(game) {
        game.flags.jerome_intro = true;
      },
    },
    {
      id: 'viktor_phone_threat',
      day: 5,
      period: 0,
      phase: 1,
      flag: 'viktor_day5_threat',
      title: "Threatening Message",
      messages: [
        "Your burner phone buzzes. Unknown number. You already know who it is.",
        "Viktor's voice is ice: \"Five days gone. I hope you're making progress. I'd hate for something to happen to that nice little apartment your mother lives in.\"",
        "The line goes dead.",
      ],
      effect(game) {
        game.flags.viktor_day5_threat = true;
        game.phone.messages.push({
          id: 'viktor_day5',
          from: 'Viktor',
          subject: 'Tick Tock',
          body: "Five days. I hope you have something for me soon. Your mother's address is still on my desk.",
          read: false,
          day: game.world.day,
          period: 'Morning',
        });
      },
    },
    {
      id: 'viktor_goons',
      day: 10,
      period: 2, // Night
      phase: 1,
      flag: 'viktor_goons_visit',
      title: "Unwelcome Visitors",
      conditions(game) {
        // Only triggers if debt is still above 60% of original
        const bg = _getBackstoryDebt(game);
        return game.resources.debt > bg * 0.6;
      },
      messages: [
        "You hear heavy boots in the stairwell. Before you can reach the door, it splinters inward.",
        "Two men built like refrigerators fill the doorframe. One cracks his knuckles. The other pulls out a baseball bat.",
        "\"Viktor sends his regards. Consider this a reminder.\"",
        "They rough you up and leave you on the floor. The message is received — loud and clear.",
      ],
      effect(game) {
        game.flags.viktor_goons_visit = true;
        const damage = Math.floor(15 + Math.random() * 15);
        game.character.health = Math.max(1, game.character.health - damage);
      },
    },
    {
      id: 'mysterious_alliance',
      day: 15,
      period: 1,
      phase: 1,
      flag: 'alliance_offered',
      title: "The Shadow Broker",
      messages: [
        "A black sedan with tinted windows pulls up beside you. The back window rolls down an inch.",
        "A woman's voice, calm and precise: \"I know who you owe. I know how much. And I know you can't pay.\"",
        "\"I represent people who could make your problem disappear. Viktor is small-time compared to my employers.\"",
        "\"We could use someone with your... hunger. Think about it. You'll know how to find me when you're ready.\"",
        "A business card lands at your feet. No name. Just a phone number in gold foil.",
      ],
      choices: [
        {
          text: "Pick up the card. You might need allies.",
          effect(game) {
            game.flags.alliance_accepted = true;
            game.flags.shadow_broker_contact = true;
            game.phone.contacts.push({
              id: 'shadow_broker',
              name: 'Unknown Number',
              faction: 'Shadow Broker',
              trust: 10,
            });
          },
        },
        {
          text: "Leave it on the ground. You handle your own business.",
          effect(game) {
            game.flags.alliance_refused = true;
          },
        },
      ],
      effect(game) {
        game.flags.alliance_offered = true;
      },
    },
    {
      id: 'viktor_negotiate',
      day: 20,
      period: 0,
      phase: 1,
      flag: 'viktor_day20',
      title: "The Squeeze Tightens",
      messages: [
        "Viktor is waiting outside your safe house, leaning against a black SUV. He doesn't look happy.",
        "\"Twenty days. You're running out of runway.\" He lights a cigarette, the flame illuminating the scar across his jaw.",
        "\"I've seen a lot of people in your shoes. Most of them are buried in the desert now.\"",
      ],
      choices: [
        {
          text: "Try to negotiate for more time. (Requires Charisma 8+)",
          condition(game) {
            return game.character.stats.charisma >= 8;
          },
          effect(game) {
            game.flags.viktor_extension = true;
            // Push deadline to day 40
            game.phone.messages.push({
              id: 'viktor_extension',
              from: 'Viktor',
              subject: 'Extension Granted',
              body: "You talk a good game. Ten more days. That's it. Don't waste them.",
              read: false,
              day: game.world.day,
              period: 'Morning',
            });
          },
        },
        {
          text: "Stay silent. Let him talk.",
          effect(game) {
            game.flags.viktor_no_negotiate = true;
          },
        },
      ],
      effect(game) {
        game.flags.viktor_day20 = true;
      },
    },
    {
      id: 'viktor_final_warning',
      day: 25,
      period: 2,
      phase: 1,
      flag: 'viktor_final_warning',
      title: "Last Chance",
      conditions(game) {
        const bg = _getBackstoryDebt(game);
        return game.resources.debt > bg * 0.5;
      },
      messages: [
        "They come at night. Three of them this time, and they're not here to talk.",
        "\"Viktor's done being patient,\" the leader says, pulling a gun. \"You've got five days. After that, we're not coming for your money anymore.\"",
        "They pistol-whip you and vanish into the darkness. Blood drips onto the concrete.",
        "Five days. That's all you have left.",
      ],
      effect(game) {
        game.flags.viktor_final_warning = true;
        const damage = Math.floor(20 + Math.random() * 15);
        game.character.health = Math.max(1, game.character.health - damage);
        if (window.Core && window.Core.adjustHeat) {
          window.Core.adjustHeat(game, game.world.currentCity, 5);
        }
      },
    },
    {
      id: 'deadline_day',
      day: 30,
      period: 0,
      phase: 1,
      flag: 'deadline_reached',
      title: "Judgement Day",
      messages: [
        "Day thirty. The air feels heavier. Every shadow looks like one of Viktor's men.",
        "Your phone rings. Viktor. \"Time's up. You know the address. Be there at midnight. Bring everything you've got.\"",
      ],
      effect(game) {
        game.flags.deadline_reached = true;
        // The actual deadline resolution happens in determineEnding or a special handler
      },
    },
    {
      id: 'phase2_opening',
      day: 31,
      period: 0,
      phase: 2,
      flag: 'phase2_started',
      conditions(game) {
        return !game.gameOver;
      },
      title: "New Horizons",
      messages: [
        "You survived Viktor. Whether you paid in full or found another way, the shark is off your back.",
        "But the game doesn't stop. The streets stretch out ahead of you, every city a kingdom waiting to be claimed.",
        "The question now isn't survival — it's legacy. How far will you go? How high will you climb?",
        "The feds have started to notice. The DEA has a file with your name on it. The real game starts now.",
      ],
      effect(game) {
        game.flags.phase2_started = true;
        game.phone.messages.push({
          id: 'phase2_intro',
          from: 'Unknown',
          subject: 'The Big Leagues',
          body: "Word on the street is you survived Viktor. Impressive. But the feds are building a case. Watch your back.",
          read: false,
          day: game.world.day,
          period: 'Morning',
        });
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // City Quest Definitions
  // ---------------------------------------------------------------------------

  const QUESTS = {

    // ---- MIAMI: "Blood in the Water" ----------------------------------------
    miami_connection: {
      id: 'miami_connection',
      cityName: 'Miami',
      chain: 'Blood in the Water',
      chainOrder: 1,
      title: 'The Connection',
      description: 'Meet Carlos Reyes at the Miami docks. He says he has a proposition — but first, he wants to see if you can handle a simple delivery.',
      steps: [
        { description: 'Travel to the Miami docks at night.', objective: 'Go to Miami docks after dark', completed: false },
        { description: 'Meet Carlos Reyes at Warehouse 7.', objective: 'Find Carlos at the warehouse', completed: false },
        { description: 'Complete the delivery to Little Havana.', objective: 'Deliver the package without getting caught', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 2000, xp: 250, karma: -5, items: [], flags: { met_carlos: true, miami_chain_1: true } },
      requirements: { level: 2, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    miami_supply_run: {
      id: 'miami_supply_run',
      cityName: 'Miami',
      chain: 'Blood in the Water',
      chainOrder: 2,
      title: 'Supply Run',
      description: 'Carlos needs you to smuggle a shipment from the port. Customs is tight, but there are ways around them if you know the right people.',
      steps: [
        { description: 'Meet Carlos at the port entrance before dawn.', objective: 'Rendezvous at the port', completed: false },
        { description: 'Sneak past or bribe the customs officers.', objective: 'Get through customs (Stealth or Cash)', completed: false },
        { description: 'Load the shipment and deliver to the safe house.', objective: 'Complete the smuggling run', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 5000, xp: 500, karma: -10, items: [{ id: 'cocaine', qty: 20 }], flags: { miami_chain_2: true } },
      requirements: { level: 3, reputation: 0, flags: { miami_chain_1: true } },
      completed: false,
      failed: false,
    },
    miami_cartel_wars: {
      id: 'miami_cartel_wars',
      cityName: 'Miami',
      chain: 'Blood in the Water',
      chainOrder: 3,
      title: 'Cartel Wars',
      description: 'A rival cartel from Sinaloa is pushing into Miami. Carlos wants you to help him fight back — but the DEA has another offer on the table.',
      steps: [
        { description: 'Gather intelligence on the rival cartel movements.', objective: 'Scout the rivals', completed: false },
        { description: 'Choose your side: Carlos or the DEA.', objective: 'Make your decision', completed: false },
        { description: 'Execute the plan.', objective: 'Complete the operation', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 10000, xp: 750, karma: 0, items: [], flags: { miami_chain_3: true } },
      requirements: { level: 5, reputation: 0, flags: { miami_chain_2: true } },
      completed: false,
      failed: false,
      choices: [
        {
          text: 'Help Carlos defend his territory. Loyalty pays in product.',
          effect(game) {
            game.flags.sided_with_carlos = true;
            game.inventory.drugs.cocaine = (game.inventory.drugs.cocaine || 0) + 50;
            if (window.Core) window.Core.adjustKarma(game, -15);
          },
        },
        {
          text: 'Feed intel to the DEA. They pay in cash and reduced heat.',
          effect(game) {
            game.flags.betrayed_carlos = true;
            game.resources.cash += 15000;
            if (window.Core) window.Core.adjustHeat(game, 'Miami', -30);
            if (window.Core) window.Core.adjustKarma(game, 5);
          },
        },
      ],
    },
    miami_vice: {
      id: 'miami_vice',
      cityName: 'Miami',
      chain: 'Blood in the Water',
      chainOrder: 4,
      title: 'Miami Vice',
      description: 'The final act. Everything you have built in Miami comes down to one massive deal — or one massive bust. The stakes have never been higher.',
      steps: [
        { description: 'Prepare for the biggest deal Miami has ever seen.', objective: 'Gather product and crew', completed: false },
        { description: 'Meet the buyers at the marina at midnight.', objective: 'Arrive at the marina', completed: false },
        { description: 'Close the deal — or survive the ambush.', objective: 'Complete the transaction', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 50000, xp: 1500, karma: -20, items: [], flags: { miami_chain_complete: true } },
      requirements: { level: 7, reputation: 0, flags: { miami_chain_3: true } },
      completed: false,
      failed: false,
    },

    // ---- NEW YORK: "Crown of the City" --------------------------------------
    ny_block_party: {
      id: 'ny_block_party',
      cityName: 'New York',
      chain: 'Crown of the City',
      chainOrder: 1,
      title: 'Block Party',
      description: 'Des from Washington Heights says he can get you set up — but you have to earn your corner. Nothing in this city comes free.',
      steps: [
        { description: 'Find Des in Washington Heights.', objective: 'Locate Des', completed: false },
        { description: 'Prove yourself by making $1,000 in sales on the block.', objective: 'Earn $1,000 selling', completed: false },
        { description: 'Defend your corner from a rival crew.', objective: 'Survive the confrontation', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 1500, xp: 300, karma: -5, items: [], flags: { met_des: true, ny_chain_1: true } },
      requirements: { level: 2, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    ny_the_wire: {
      id: 'ny_the_wire',
      cityName: 'New York',
      chain: 'Crown of the City',
      chainOrder: 2,
      title: 'The Wire',
      description: 'The feds have your phone tapped. Des says you need to go dark for a while — or find out who is feeding them intel.',
      steps: [
        { description: 'Destroy your current burner phone.', objective: 'Ditch the tapped phone', completed: false },
        { description: 'Identify the informant in your network.', objective: 'Find the snitch (Street Smarts check)', completed: false },
        { description: 'Deal with the situation.', objective: 'Resolve the leak', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 3000, xp: 500, karma: 0, items: [], flags: { ny_chain_2: true } },
      requirements: { level: 4, reputation: 0, flags: { ny_chain_1: true } },
      completed: false,
      failed: false,
    },
    ny_turf_war: {
      id: 'ny_turf_war',
      cityName: 'New York',
      chain: 'Crown of the City',
      chainOrder: 3,
      title: 'Turf War',
      description: 'A Brooklyn crew is pushing into Washington Heights. Des says it is time to draw a line — or find a way to co-exist.',
      steps: [
        { description: 'Scout the Brooklyn crew and assess their strength.', objective: 'Gather intel on rivals', completed: false },
        { description: 'Choose: go to war or negotiate a truce.', objective: 'Decide your approach', completed: false },
        { description: 'Execute your plan.', objective: 'Resolve the turf dispute', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 8000, xp: 700, karma: 0, items: [], flags: { ny_chain_3: true } },
      requirements: { level: 6, reputation: 0, flags: { ny_chain_2: true } },
      completed: false,
      failed: false,
      choices: [
        {
          text: 'Go to war. Take their territory by force.',
          effect(game) {
            game.flags.ny_war = true;
            if (window.Core) window.Core.adjustKarma(game, -20);
            if (window.Core) window.Core.adjustHeat(game, 'New York', 15);
          },
        },
        {
          text: 'Negotiate a truce. Split the profits.',
          effect(game) {
            game.flags.ny_peace = true;
            if (window.Core) window.Core.adjustKarma(game, 10);
          },
        },
      ],
    },
    ny_empire_state: {
      id: 'ny_empire_state',
      cityName: 'New York',
      chain: 'Crown of the City',
      chainOrder: 4,
      title: 'Empire State',
      description: 'The biggest drug market in America is within your reach. One last power play could make you the king of New York — or bring the whole empire crashing down.',
      steps: [
        { description: 'Unite the remaining crews under your banner.', objective: 'Build your coalition', completed: false },
        { description: 'Set up the distribution network.', objective: 'Establish supply lines', completed: false },
        { description: 'Take the crown.', objective: 'Claim control of New York', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 75000, xp: 2000, karma: -15, items: [], flags: { ny_chain_complete: true, king_of_ny: true } },
      requirements: { level: 8, reputation: 0, flags: { ny_chain_3: true } },
      completed: false,
      failed: false,
    },

    // ---- CHICAGO: "The Old Ways" --------------------------------------------
    chi_school: {
      id: 'chi_school',
      cityName: 'Chicago',
      chain: 'The Old Ways',
      chainOrder: 1,
      title: 'School of Hard Knocks',
      description: 'Old Man Jerome has connections in Chicago. He offers to teach you the advanced mechanics of the trade — if you are willing to listen.',
      steps: [
        { description: 'Find Jerome at the South Side diner.', objective: 'Meet Jerome', completed: false },
        { description: 'Complete Jerome\'s lesson: negotiate a bulk deal.', objective: 'Negotiate a deal (Charisma check)', completed: false },
        { description: 'Sell the product for profit without attracting heat.', objective: 'Make clean sales', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 1000, xp: 400, karma: 0, items: [], flags: { jerome_student: true, chi_chain_1: true } },
      requirements: { level: 2, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    chi_supply_demand: {
      id: 'chi_supply_demand',
      cityName: 'Chicago',
      chain: 'The Old Ways',
      chainOrder: 2,
      title: 'Supply and Demand',
      description: 'Chicago is the crossroads of America. Establish a supply line through the Midwest corridor and you will never run dry.',
      steps: [
        { description: 'Map the Midwest corridor supply routes.', objective: 'Scout the routes', completed: false },
        { description: 'Secure a reliable supplier in Gary, Indiana.', objective: 'Find and vet a supplier', completed: false },
        { description: 'Complete a test run through the corridor.', objective: 'Run the supply line', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 5000, xp: 600, karma: -5, items: [], flags: { chi_chain_2: true, midwest_supply: true } },
      requirements: { level: 4, reputation: 0, flags: { chi_chain_1: true } },
      completed: false,
      failed: false,
    },
    chi_gang_politics: {
      id: 'chi_gang_politics',
      cityName: 'Chicago',
      chain: 'The Old Ways',
      chainOrder: 3,
      title: 'Gang Politics',
      description: 'Chicago is a patchwork of gang territories, each block claimed and defended. You need to navigate these waters with diplomacy — or overwhelming force.',
      steps: [
        { description: 'Meet with the leaders of the three major sets.', objective: 'Attend the summit', completed: false },
        { description: 'Choose your approach: diplomacy or dominance.', objective: 'Make your play', completed: false },
        { description: 'Establish your presence in Chicago.', objective: 'Claim your territory', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 8000, xp: 800, karma: 0, items: [], flags: { chi_chain_3: true } },
      requirements: { level: 6, reputation: 0, flags: { chi_chain_2: true } },
      completed: false,
      failed: false,
      choices: [
        {
          text: 'Play diplomat. Broker peace and earn a seat at the table.',
          effect(game) {
            game.flags.chi_diplomat = true;
            if (window.Core) window.Core.adjustKarma(game, 10);
          },
        },
        {
          text: 'Show force. Take what you want and dare them to stop you.',
          effect(game) {
            game.flags.chi_warlord = true;
            if (window.Core) window.Core.adjustKarma(game, -15);
            if (window.Core) window.Core.adjustHeat(game, 'Chicago', 20);
          },
        },
      ],
    },
    chi_legacy: {
      id: 'chi_legacy',
      cityName: 'Chicago',
      chain: 'The Old Ways',
      chainOrder: 4,
      title: 'Legacy',
      description: 'Jerome\'s past catches up with him. Old enemies have come to collect. You can save him — or use the chaos to seize his connections for yourself.',
      steps: [
        { description: 'Jerome calls you in a panic. Get to his location.', objective: 'Reach Jerome', completed: false },
        { description: 'Face Jerome\'s enemies.', objective: 'Confront the threat', completed: false },
        { description: 'Decide Jerome\'s fate.', objective: 'Choose what happens next', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 12000, xp: 1200, karma: 0, items: [], flags: { chi_chain_complete: true } },
      requirements: { level: 8, reputation: 0, flags: { chi_chain_3: true } },
      completed: false,
      failed: false,
      choices: [
        {
          text: 'Save Jerome. He taught you everything. You owe him this.',
          effect(game) {
            game.flags.jerome_saved = true;
            if (window.Core) window.Core.adjustKarma(game, 20);
          },
        },
        {
          text: 'Let his enemies have him. Take his network while they are distracted.',
          effect(game) {
            game.flags.jerome_betrayed = true;
            game.resources.cash += 20000;
            if (window.Core) window.Core.adjustKarma(game, -25);
          },
        },
      ],
    },

    // ---- ATLANTA: "Trap Star" -----------------------------------------------
    atl_club_circuit: {
      id: 'atl_club_circuit',
      cityName: 'Atlanta',
      chain: 'Trap Star',
      chainOrder: 1,
      title: 'Club Circuit',
      description: 'DJ Blaze has the keys to Atlanta\'s VIP scene. High rollers, rappers, athletes — they all party, and they all want to score.',
      steps: [
        { description: 'Meet DJ Blaze at Club Velvet.', objective: 'Find Blaze', completed: false },
        { description: 'Make VIP sales at three different clubs.', objective: 'Sell to the VIP crowd', completed: false },
        { description: 'Build your reputation on the club circuit.', objective: 'Earn club rep', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 3000, xp: 350, karma: -5, items: [], flags: { met_blaze: true, atl_chain_1: true } },
      requirements: { level: 3, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    atl_studio_session: {
      id: 'atl_studio_session',
      cityName: 'Atlanta',
      chain: 'Trap Star',
      chainOrder: 2,
      title: 'Studio Session',
      description: 'A rising rapper wants to partner with you. He raps about the life you live. High profile means high risk — but the money is unreal.',
      steps: [
        { description: 'Meet Lil Gauge at the recording studio.', objective: 'Get to the studio', completed: false },
        { description: 'Supply the studio party. Big names, big orders.', objective: 'Complete the supply order', completed: false },
        { description: 'Navigate the aftermath — paparazzi saw everything.', objective: 'Deal with the exposure', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 8000, xp: 600, karma: -10, items: [], flags: { atl_chain_2: true, rapper_connect: true } },
      requirements: { level: 5, reputation: 0, flags: { atl_chain_1: true } },
      completed: false,
      failed: false,
    },
    atl_come_up: {
      id: 'atl_come_up',
      cityName: 'Atlanta',
      chain: 'Trap Star',
      chainOrder: 3,
      title: 'The Come Up',
      description: 'You have the connections, the product, and the reputation. Time to build the biggest trap operation the South has ever seen.',
      steps: [
        { description: 'Acquire multiple trap houses across Atlanta.', objective: 'Set up three locations', completed: false },
        { description: 'Hire and train a crew to run operations.', objective: 'Build your crew', completed: false },
        { description: 'Survive the first week of full operations.', objective: 'Keep the empire running', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 20000, xp: 1000, karma: -15, items: [], flags: { atl_chain_3: true } },
      requirements: { level: 7, reputation: 0, flags: { atl_chain_2: true } },
      completed: false,
      failed: false,
    },
    atl_going_platinum: {
      id: 'atl_going_platinum',
      cityName: 'Atlanta',
      chain: 'Trap Star',
      chainOrder: 4,
      title: 'Going Platinum',
      description: 'Your operation is famous — or infamous. Lil Gauge put your name in a platinum record. The whole world knows. Fame or infamy? The line just blurred.',
      steps: [
        { description: 'Deal with the attention: media, cops, rivals all want a piece.', objective: 'Manage the fallout', completed: false },
        { description: 'Decide: lean into the fame or disappear into the shadows.', objective: 'Choose your path', completed: false },
        { description: 'Secure your legacy in Atlanta.', objective: 'Complete the Atlanta arc', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 40000, xp: 1500, karma: 0, items: [], flags: { atl_chain_complete: true } },
      requirements: { level: 9, reputation: 0, flags: { atl_chain_3: true } },
      completed: false,
      failed: false,
    },

    // ---- DETROIT: "Rust Belt Hustle" ----------------------------------------
    det_community: {
      id: 'det_community',
      cityName: 'Detroit',
      chain: 'Rust Belt Hustle',
      chainOrder: 1,
      title: 'The Community',
      description: 'Keisha runs the community center on the East Side. She shows you what Detroit really is — the abandoned blocks, the struggling families, the kids with no future. Do you help, or exploit?',
      steps: [
        { description: 'Visit the East Side community center.', objective: 'Meet Keisha', completed: false },
        { description: 'See the neighborhood through Keisha\'s eyes.', objective: 'Tour the East Side', completed: false },
        { description: 'Make your first decision: donate to the center or set up shop nearby.', objective: 'Choose your path', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 500, xp: 300, karma: 0, items: [], flags: { met_keisha: true, det_chain_1: true } },
      requirements: { level: 1, reputation: 0, flags: {} },
      completed: false,
      failed: false,
      choices: [
        {
          text: 'Donate $500 to the community center. These people need help.',
          effect(game) {
            game.flags.det_helped_community = true;
            game.resources.cash -= 500;
            if (window.Core) window.Core.adjustKarma(game, 15);
          },
        },
        {
          text: 'Set up a trap house on the block. This is business.',
          effect(game) {
            game.flags.det_exploited_community = true;
            if (window.Core) window.Core.adjustKarma(game, -15);
          },
        },
      ],
    },
    det_abandoned: {
      id: 'det_abandoned',
      cityName: 'Detroit',
      chain: 'Rust Belt Hustle',
      chainOrder: 2,
      title: 'Abandoned Empire',
      description: 'Detroit has 70,000 abandoned buildings. That is a lot of real estate for someone who knows how to use it.',
      steps: [
        { description: 'Scout abandoned buildings for potential stash houses.', objective: 'Find locations', completed: false },
        { description: 'Set up operations in three abandoned properties.', objective: 'Establish stash houses', completed: false },
        { description: 'Run a test operation through the network.', objective: 'Complete a distribution run', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 6000, xp: 500, karma: -10, items: [], flags: { det_chain_2: true } },
      requirements: { level: 4, reputation: 0, flags: { det_chain_1: true } },
      completed: false,
      failed: false,
    },
    det_motor_city: {
      id: 'det_motor_city',
      cityName: 'Detroit',
      chain: 'Rust Belt Hustle',
      chainOrder: 3,
      title: 'Motor City Muscle',
      description: 'The local crews have noticed you. They want tribute — a cut of everything you make on their turf. You can fight, pay, or find another way.',
      steps: [
        { description: 'Receive the demand from the local crews.', objective: 'Hear them out', completed: false },
        { description: 'Choose: fight, pay tribute, or negotiate.', objective: 'Decide your response', completed: false },
        { description: 'Deal with the consequences.', objective: 'Resolve the situation', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 8000, xp: 700, karma: 0, items: [], flags: { det_chain_3: true } },
      requirements: { level: 6, reputation: 0, flags: { det_chain_2: true } },
      completed: false,
      failed: false,
      choices: [
        {
          text: 'Fight. Nobody takes what is yours.',
          effect(game) {
            game.flags.det_fought_crews = true;
            if (window.Core) window.Core.adjustKarma(game, -10);
            if (window.Core) window.Core.adjustHeat(game, 'Detroit', 15);
          },
        },
        {
          text: 'Pay the tribute. Sometimes it is cheaper than war.',
          effect(game) {
            game.flags.det_paid_tribute = true;
            game.resources.cash -= 3000;
          },
        },
        {
          text: 'Negotiate a partnership. Mutual benefit.',
          effect(game) {
            game.flags.det_partnership = true;
            if (window.Core) window.Core.adjustKarma(game, 5);
          },
        },
      ],
    },
    det_redemption: {
      id: 'det_redemption',
      cityName: 'Detroit',
      chain: 'Rust Belt Hustle',
      chainOrder: 4,
      title: 'Redemption Road',
      description: 'Keisha offers you a way out. A chance to go legit — to use the money you have made to actually build something real. But walking away from the game is never easy.',
      steps: [
        { description: 'Keisha presents her plan: a legitimate business proposal.', objective: 'Hear the plan', completed: false },
        { description: 'Decide: take the legitimate path or stay in the game.', objective: 'Choose your future', completed: false },
        { description: 'Live with your choice.', objective: 'Complete the Detroit arc', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 5000, xp: 1500, karma: 0, items: [], flags: { det_chain_complete: true } },
      requirements: { level: 8, reputation: 0, flags: { det_chain_3: true } },
      completed: false,
      failed: false,
      choices: [
        {
          text: 'Go legit. Invest in the community. Build something that lasts.',
          effect(game) {
            game.flags.det_went_legit = true;
            game.flags.redemption_path = true;
            if (window.Core) window.Core.adjustKarma(game, 30);
          },
        },
        {
          text: 'Stay in the game. The streets are all you know.',
          effect(game) {
            game.flags.det_stayed_game = true;
            if (window.Core) window.Core.adjustKarma(game, -10);
          },
        },
      ],
    },

    // ---- HOUSTON: Simple 2-Quest Chain --------------------------------------
    hou_border_run: {
      id: 'hou_border_run',
      cityName: 'Houston',
      chain: 'Border Business',
      chainOrder: 1,
      title: 'Border Run',
      description: 'Houston sits on the pipeline from Mexico. A coyote named Razor has a shipment that needs a local distributor.',
      steps: [
        { description: 'Meet Razor at the truck stop on I-10.', objective: 'Find Razor', completed: false },
        { description: 'Move the shipment across Houston without getting pulled over.', objective: 'Complete the run', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 4000, xp: 400, karma: -10, items: [{ id: 'meth', qty: 15 }], flags: { hou_chain_1: true } },
      requirements: { level: 3, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    hou_oil_money: {
      id: 'hou_oil_money',
      cityName: 'Houston',
      chain: 'Border Business',
      chainOrder: 2,
      title: 'Oil Money',
      description: 'Houston\'s oil executives have expensive habits. Crack into the corporate market and you will never need to sling on the corner again.',
      steps: [
        { description: 'Get introduced to the executive clientele through Razor.', objective: 'Meet the clients', completed: false },
        { description: 'Set up a discreet delivery service for high-end clients.', objective: 'Establish the VIP pipeline', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 15000, xp: 800, karma: -5, items: [], flags: { hou_chain_complete: true } },
      requirements: { level: 6, reputation: 0, flags: { hou_chain_1: true } },
      completed: false,
      failed: false,
    },

    // ---- LOS ANGELES: Simple 2-Quest Chain ----------------------------------
    la_hollywood: {
      id: 'la_hollywood',
      cityName: 'Los Angeles',
      chain: 'City of Angels',
      chainOrder: 1,
      title: 'Hollywood Hustle',
      description: 'In LA, everybody is somebody. A club promoter named Vince can get you into the party scene where celebrities burn through product like water.',
      steps: [
        { description: 'Meet Vince at the Sunset Strip lounge.', objective: 'Connect with Vince', completed: false },
        { description: 'Supply three A-list parties without getting caught on camera.', objective: 'Work the party circuit', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 5000, xp: 400, karma: -5, items: [], flags: { la_chain_1: true } },
      requirements: { level: 3, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    la_cartel_connect: {
      id: 'la_cartel_connect',
      cityName: 'Los Angeles',
      chain: 'City of Angels',
      chainOrder: 2,
      title: 'Pacific Pipeline',
      description: 'Vince has connections to a shipping operation at the Port of Long Beach. Heroin straight from Southeast Asia. The money is astronomical, and so is the risk.',
      steps: [
        { description: 'Inspect the pipeline operation at the port.', objective: 'Scout the port', completed: false },
        { description: 'Move the first shipment through LA.', objective: 'Complete the distribution', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 20000, xp: 1000, karma: -15, items: [], flags: { la_chain_complete: true } },
      requirements: { level: 7, reputation: 0, flags: { la_chain_1: true } },
      completed: false,
      failed: false,
    },

    // ---- SEATTLE: Simple 2-Quest Chain --------------------------------------
    sea_tech_money: {
      id: 'sea_tech_money',
      cityName: 'Seattle',
      chain: 'Silicon Hustle',
      chainOrder: 1,
      title: 'Tech Money',
      description: 'Seattle\'s tech workers have more money than sense and a taste for premium product. A barista named Quinn knows who is buying.',
      steps: [
        { description: 'Meet Quinn at the coffee shop in Capitol Hill.', objective: 'Connect with Quinn', completed: false },
        { description: 'Set up discreet deliveries to tech campuses.', objective: 'Establish the delivery network', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 4000, xp: 350, karma: -5, items: [], flags: { sea_chain_1: true } },
      requirements: { level: 2, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    sea_dark_web: {
      id: 'sea_dark_web',
      cityName: 'Seattle',
      chain: 'Silicon Hustle',
      chainOrder: 2,
      title: 'Dark Web',
      description: 'Quinn has a friend who runs an operation on the dark web. Crypto payments, dead drops, zero face-to-face. The future of the trade.',
      steps: [
        { description: 'Meet the operator, known only as Ghost.', objective: 'Find Ghost', completed: false },
        { description: 'Set up your dark web storefront and process first orders.', objective: 'Launch operations', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 12000, xp: 800, karma: -10, items: [], flags: { sea_chain_complete: true } },
      requirements: { level: 5, reputation: 0, flags: { sea_chain_1: true } },
      completed: false,
      failed: false,
    },

    // ---- DENVER: Simple 2-Quest Chain ---------------------------------------
    den_mile_high: {
      id: 'den_mile_high',
      cityName: 'Denver',
      chain: 'Mile High Profits',
      chainOrder: 1,
      title: 'Mile High Hustle',
      description: 'Denver legalized weed, but the black market still thrives. A grower named Sage has product that puts dispensaries to shame — at half the price.',
      steps: [
        { description: 'Meet Sage at the grow house in Aurora.', objective: 'Find Sage', completed: false },
        { description: 'Distribute Sage\'s premium product to undercut dispensaries.', objective: 'Move the product', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 3000, xp: 300, karma: -5, items: [{ id: 'weed', qty: 30 }], flags: { den_chain_1: true } },
      requirements: { level: 2, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    den_mountain_pipeline: {
      id: 'den_mountain_pipeline',
      cityName: 'Denver',
      chain: 'Mile High Profits',
      chainOrder: 2,
      title: 'Mountain Pipeline',
      description: 'Sage wants to expand into harder product. Meth from the mountain labs, distributed through Denver\'s ski resort connections.',
      steps: [
        { description: 'Visit the mountain lab operation.', objective: 'Scout the lab', completed: false },
        { description: 'Set up distribution from the mountains to the city.', objective: 'Establish the pipeline', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 10000, xp: 700, karma: -15, items: [], flags: { den_chain_complete: true } },
      requirements: { level: 5, reputation: 0, flags: { den_chain_1: true } },
      completed: false,
      failed: false,
    },

    // ---- PHOENIX: Simple 2-Quest Chain --------------------------------------
    phx_desert_deal: {
      id: 'phx_desert_deal',
      cityName: 'Phoenix',
      chain: 'Desert Heat',
      chainOrder: 1,
      title: 'Desert Deal',
      description: 'Phoenix bakes under the sun, but beneath the heat, the drug trade flows like an underground river. A trucker named Dusty has a proposition.',
      steps: [
        { description: 'Meet Dusty at the truck stop off I-17.', objective: 'Find Dusty', completed: false },
        { description: 'Ride shotgun on a supply run through the desert.', objective: 'Complete the run', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 3500, xp: 350, karma: -5, items: [], flags: { phx_chain_1: true } },
      requirements: { level: 3, reputation: 0, flags: {} },
      completed: false,
      failed: false,
    },
    phx_scorched_earth: {
      id: 'phx_scorched_earth',
      cityName: 'Phoenix',
      chain: 'Desert Heat',
      chainOrder: 2,
      title: 'Scorched Earth',
      description: 'A rival operation is threatening Dusty\'s routes. Time to eliminate the competition — in the desert, nobody hears a thing.',
      steps: [
        { description: 'Track the rivals to their desert compound.', objective: 'Locate the rival base', completed: false },
        { description: 'Take them out and claim the routes for yourself.', objective: 'Seize the supply routes', completed: false },
      ],
      currentStep: 0,
      rewards: { cash: 12000, xp: 800, karma: -20, items: [], flags: { phx_chain_complete: true } },
      requirements: { level: 6, reputation: 0, flags: { phx_chain_1: true } },
      completed: false,
      failed: false,
    },
  };

  // ---------------------------------------------------------------------------
  // Moral Dilemma Definitions
  // ---------------------------------------------------------------------------

  const MORAL_DILEMMAS = [
    {
      id: 'the_kid',
      title: 'The Kid',
      description: 'A scrawny teenager, no older than fourteen, approaches you on the corner. Eyes too old for that young face. "I can work for you," he says. "I\'m fast. I know the alleys. Nobody suspects a kid."',
      choices: [
        {
          text: 'Put the kid to work. He would end up doing it for someone else anyway.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, -20);
            game.flags.hired_kid = true;
            // Passive income boost
            game.resources.cash += 200;
          },
        },
        {
          text: 'Give him $50 and tell him to go home. This life is not for a child.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, 15);
            game.resources.cash -= 50;
            game.flags.spared_kid = true;
          },
        },
      ],
      probability: 0.06,
      conditions(game) {
        return game.world.day > 3 && !game.flags.hired_kid && !game.flags.spared_kid;
      },
    },
    {
      id: 'the_snitch',
      title: 'The Snitch',
      description: 'Word on the street is someone in your circle has been talking to the police. Your crew found the rat — dragged him into the basement with a bag over his head. He is blubbering, begging. What do you do?',
      choices: [
        {
          text: 'Silence them permanently. Snitches get what they deserve.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, -25);
            if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, -10);
            game.flags.killed_snitch = true;
          },
        },
        {
          text: 'Cut them loose with a warning. Everyone deserves one chance.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, 10);
            if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, 10);
            game.flags.spared_snitch = true;
          },
        },
        {
          text: 'Feed the cops false information through them. Use the snitch as a double agent.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, -5);
            if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, -5);
            game.flags.double_agent = true;
          },
        },
      ],
      probability: 0.05,
      conditions(game) {
        return game.world.day > 7 && game.heat.cities[game.world.currentCity] > 20;
      },
    },
    {
      id: 'the_overdose',
      title: 'The Overdose',
      description: 'You hear the thud from the alley. One of your regulars — a college kid, somebody\'s son — is on the ground, lips blue, needle still in his arm. He is dying. Right now. Right in front of you.',
      choices: [
        {
          text: 'Call 911. It might bring heat, but you cannot let someone die.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, 20);
            if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, 15);
            game.flags.called_911 = true;
          },
        },
        {
          text: 'Walk away. You did not put the needle in his arm. Not your problem.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, -20);
            game.flags.left_od_victim = true;
          },
        },
        {
          text: 'Try to save him yourself — you have seen this before. (Stamina check)',
          effect(game) {
            const stam = game.character.stats.stamina || 5;
            if (stam >= 7) {
              if (window.Core) window.Core.adjustKarma(game, 15);
              game.flags.saved_od_victim = true;
            } else {
              if (window.Core) window.Core.adjustKarma(game, 5);
              game.flags.failed_od_save = true;
            }
          },
        },
      ],
      probability: 0.05,
      conditions(game) {
        return game.world.day > 5;
      },
    },
    {
      id: 'the_family',
      title: 'The Family',
      description: 'A single mother stands in front of you, shaking but determined. Three kids peering out from behind her legs. "Please," she says. "Stop selling on this block. My babies have to walk past this every day to get to school."',
      choices: [
        {
          text: 'Move your operation to another block. She is right.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, 15);
            game.resources.cash -= 500; // lost revenue from relocation
            game.flags.moved_for_family = true;
          },
        },
        {
          text: 'Ignore her. Business is business. This is the best corner in the neighborhood.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, -15);
            game.flags.stayed_on_block = true;
          },
        },
      ],
      probability: 0.06,
      conditions(game) {
        return game.world.day > 4;
      },
    },
    {
      id: 'the_informant',
      title: 'The Informant',
      description: 'A detective corners you in a parking garage. Badge in one hand, envelope in the other. "I can make your heat disappear," he says. "All I need is a small cut — and the occasional favor."',
      choices: [
        {
          text: 'Accept the deal. A cop on your payroll is priceless.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, -10);
            if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, -20);
            game.resources.cash -= 2000;
            game.flags.dirty_cop = true;
            game.phone.contacts.push({
              id: 'dirty_cop',
              name: 'Detective Price',
              faction: 'Police',
              trust: 30,
            });
          },
        },
        {
          text: 'Refuse. Dirty cops are a liability. They always want more.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, 5);
            game.flags.refused_dirty_cop = true;
          },
        },
      ],
      probability: 0.04,
      conditions(game) {
        return game.world.day > 10 && game.heat.cities[game.world.currentCity] > 30;
      },
    },
    {
      id: 'the_heist',
      title: 'The Heist',
      description: 'Your most trusted crew member pulls you aside. "I got the blueprints to a pharmacy warehouse. Oxy, morphine, Adderall — millions in product just sitting there. One job. One night. We could be set for months."',
      choices: [
        {
          text: 'Do the heist. High risk, high reward.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, -20);
            const success = Math.random() < 0.6;
            if (success) {
              game.inventory.drugs.oxy = (game.inventory.drugs.oxy || 0) + 40;
              game.resources.cash += 5000;
              game.flags.heist_success = true;
            } else {
              if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, 30);
              game.character.health = Math.max(1, game.character.health - 25);
              game.flags.heist_failed = true;
            }
          },
        },
        {
          text: 'Pass. Pharmacies mean federal charges. Not worth it.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, 5);
            game.flags.refused_heist = true;
          },
        },
      ],
      probability: 0.03,
      conditions(game) {
        return game.world.day > 12 && game.crew.length > 0;
      },
    },
    {
      id: 'the_politician',
      title: 'The Politician',
      description: 'A city councilman slips you a note at a fundraiser. He wants to be a "VIP client." The money would be enormous — but if it ever got out, you would be on every front page in America.',
      choices: [
        {
          text: 'Take the deal. Politicians are the best customers — they can never talk.',
          effect(game) {
            game.resources.cash += 10000;
            if (window.Core) window.Core.adjustKarma(game, -10);
            game.flags.politician_client = true;
          },
        },
        {
          text: 'Decline. Too much exposure. One scandal and you are done.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, 5);
            game.flags.refused_politician = true;
          },
        },
      ],
      probability: 0.03,
      conditions(game) {
        return game.world.day > 15 && game.character.level >= 5;
      },
    },
    {
      id: 'the_mercy',
      title: 'The Mercy',
      description: 'Your crew caught a rival dealer on your turf. He is on his knees, blood running from a split lip. "I got kids, man. Please. I was just trying to feed my family." His eyes are full of terror.',
      choices: [
        {
          text: 'Let him go. You have been in his shoes. Show mercy.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, 15);
            game.flags.showed_mercy = true;
            // Risk: he might come back for revenge
          },
        },
        {
          text: 'Make an example out of him. Mercy is weakness on the streets.',
          effect(game) {
            if (window.Core) window.Core.adjustKarma(game, -20);
            game.flags.no_mercy = true;
            // Intimidation reputation boost
          },
        },
      ],
      probability: 0.05,
      conditions(game) {
        return game.world.day > 6;
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Multiple Endings
  // ---------------------------------------------------------------------------

  const ENDINGS = {
    kingpin: {
      id: 'kingpin',
      title: 'Kingpin',
      priority: 10,
      scoreMultiplier: 3.0,
      condition(game) {
        const netWorth = window.Core ? window.Core.calculateNetWorth(game) : 0;
        const citiesControlled = Object.keys(game.territory).length;
        return netWorth > 500000 && game.resources.debt <= 0 && citiesControlled >= 5;
      },
      narrative: [
        "They said it couldn't be done. They said you'd be dead in a ditch before your first year was up.",
        "But here you are — sitting in a penthouse that overlooks the skyline, a phone that never stops ringing, and an empire that spans the nation.",
        "You are the kingpin. The name that makes grown men whisper. The ghost that the DEA chases but never catches.",
        "The money flows like a river. The power is absolute. And the loneliness? That's the price of the crown.",
        "You built your empire from nothing. And nothing will ever take it away.",
      ],
    },
    gone_legit: {
      id: 'gone_legit',
      title: 'Gone Legit',
      priority: 9,
      scoreMultiplier: 2.5,
      condition(game) {
        return (
          game.flags.redemption_path === true &&
          game.character.karma > 50 &&
          game.properties.length > 0
        );
      },
      narrative: [
        "You did what nobody thought was possible — you got out.",
        "The money is clean now, laundered through legitimate businesses that actually employ people, actually build something.",
        "Keisha smiles at you from across the community center. The kids have a safe place to go after school.",
        "Sometimes at night you hear echoes of the old life — sirens, gunshots, the clink of vials on concrete.",
        "But you sleep in a warm bed, with a clean conscience, and the knowledge that you broke the cycle.",
        "You went legit. And somehow, against all odds, it worked.",
      ],
    },
    fbi_most_wanted: {
      id: 'fbi_most_wanted',
      title: "FBI's Most Wanted",
      priority: 7,
      scoreMultiplier: 1.5,
      condition(game) {
        return game.heat.federal > 90;
      },
      narrative: [
        "Your face is on every television screen, every post office wall, every FBI field office in the country.",
        "You are America's Most Wanted. The DEA, the FBI, Interpol — they all want a piece of you.",
        "You live in the shadows now. New city every week. New name every month. Never staying long enough to leave a trace.",
        "The money means nothing when you cannot spend it. The power means nothing when you cannot show your face.",
        "You are a ghost, haunting the fringes of a world that wants to forget you ever existed.",
        "But they will never catch you. You made sure of that.",
      ],
    },
    witness_protection: {
      id: 'witness_protection',
      title: 'Witness Protection',
      priority: 6,
      scoreMultiplier: 1.0,
      condition(game) {
        return game.flags.betrayed_carlos === true || game.flags.worked_with_feds === true;
      },
      narrative: [
        "You turned state's witness. Everything you knew — names, routes, stash houses — you gave it all to the feds.",
        "In return, they gave you a new name, a new face, and a one-bedroom apartment in a town you have never heard of.",
        "The marshals check in every Tuesday. You work at a hardware store. Nobody knows who you were.",
        "Sometimes you see drug busts on the evening news and wonder if your information led to that.",
        "You are safe. You are alive. But the person you used to be is dead and buried.",
        "Is this freedom? Or just a different kind of prison?",
      ],
    },
    behind_bars: {
      id: 'behind_bars',
      title: 'Behind Bars',
      priority: 5,
      scoreMultiplier: 0.5,
      condition(game) {
        return game.heat.federal > 75 && game.heat.cities[game.world.currentCity] > 80;
      },
      narrative: [
        "The door to your cell closes with a sound you will never forget — a mechanical thud that echoes through the concrete halls of the federal penitentiary.",
        "Twenty-five to life. That is what the judge said, and he did not blink when he said it.",
        "The empire you built crumbled in a single raid. Helicopters, SWAT teams, battering rams at dawn.",
        "In here, you are just a number. The respect from the yard is cold comfort when the sun sets behind razor wire.",
        "You had it all. Now you have a six-by-eight cell and all the time in the world to think about where it went wrong.",
      ],
    },
    six_feet_under: {
      id: 'six_feet_under',
      title: 'Six Feet Under',
      priority: 8,
      scoreMultiplier: 0.0,
      condition(game) {
        return game.character.health <= 0;
      },
      narrative: [
        "The streets took you. Just like they take everyone who plays the game long enough.",
        "Maybe it was a bullet. Maybe it was a blade. Maybe Viktor's men finally caught up.",
        "The corner where you fell will have flowers for a week, maybe two. Then the rain washes them away.",
        "Another name added to the long list of those who thought they were different. Who thought the streets would spare them.",
        "They never do.",
      ],
    },
    the_ghost: {
      id: 'the_ghost',
      title: 'The Ghost',
      priority: 8,
      scoreMultiplier: 2.0,
      condition(game) {
        const cityHeat = game.heat.cities[game.world.currentCity] || 0;
        return (
          game.character.stats.stealth >= 12 &&
          cityHeat < 15 &&
          game.heat.federal < 20 &&
          game.resources.debt <= 0
        );
      },
      narrative: [
        "One day you were there. The next day you were gone. No trail. No trace. No forwarding address.",
        "The feds spent months looking. Your rivals spent years. Nobody found a thing.",
        "You vanished like smoke in the wind, taking your fortune to a beach somewhere warm, somewhere nobody asks questions.",
        "The streets still tell stories about you. They say you are dead. They say you are in Dubai. They say you are a myth.",
        "Let them talk. You are sipping something cold, watching the sunset, and the only empire you care about now is the one between your hammock and the ocean.",
        "You were the ghost. And ghosts do not get caught.",
      ],
    },
    street_legend: {
      id: 'street_legend',
      title: 'Street Legend',
      priority: 7,
      scoreMultiplier: 2.5,
      condition(game) {
        const completedQuests = game.quests.completed ? game.quests.completed.length : 0;
        return (
          completedQuests >= 8 &&
          game.character.karma > -20 &&
          game.character.karma < 20
        );
      },
      narrative: [
        "You walked the tightrope that nobody else could. Not too ruthless, not too soft. Just right.",
        "Every city knows your name. Every corner has a story. You are the legend that the young ones whisper about.",
        "You played the game on your own terms — never fully villain, never fully saint. A survivor. An operator. A legend.",
        "The money came and went. The enemies came and went. But the reputation? That is forever.",
        "Decades from now, when some young hustler is standing on a corner for the first time, someone will lean over and say:",
        "\"Let me tell you about " + "the one who did it right.\"",
      ],
    },
  };

  // ---------------------------------------------------------------------------
  // Random Event Definitions
  // ---------------------------------------------------------------------------

  const RANDOM_EVENTS = [
    {
      id: 'price_spike_bust',
      type: 'market',
      title: 'Major Bust',
      messages: [
        "Breaking news: DEA raids a major distribution hub. Supply just got scarce — prices are through the roof.",
        "Feds hit a warehouse across town. Every dealer in the city is scrambling. Prices are spiking hard.",
        "A massive drug bust just went down. Supply is choked. Time to sell if you are holding.",
      ],
      probability: 0.06,
      conditions(game) { return game.world.day > 3; },
      effect(game) {
        game.flags._tempPriceMultiplier = 1.6;
        game.flags._tempPriceDuration = 3; // periods
      },
    },
    {
      id: 'price_crash',
      type: 'market',
      title: 'Market Flood',
      messages: [
        "A new supplier just flooded the market with cheap product. Prices are in freefall.",
        "Word is a cartel is dumping product to push out competition. Prices just cratered.",
        "Somebody cut a huge deal and oversaturated the market. Everything is cheap right now.",
      ],
      probability: 0.05,
      conditions(game) { return game.world.day > 5; },
      effect(game) {
        game.flags._tempPriceMultiplier = 0.5;
        game.flags._tempPriceDuration = 3;
      },
    },
    {
      id: 'found_stash',
      type: 'windfall',
      title: 'Lucky Find',
      messages: [
        "You stumble on a duffel bag in an alley. Inside: cash and a baggie of product. Somebody's bad day is your good day.",
        "A junkie tips you off to a dead dealer's stash behind a dumpster. Finders keepers.",
        "You find a loose brick in an abandoned building. Behind it: a roll of bills and some product wrapped in plastic.",
      ],
      probability: 0.05,
      conditions() { return true; },
      effect(game) {
        const cashFound = Math.floor(200 + Math.random() * 800);
        game.resources.cash += cashFound;
        const drugs = ['weed', 'cocaine', 'ecstasy', 'shrooms'];
        const drug = drugs[Math.floor(Math.random() * drugs.length)];
        const qty = Math.floor(3 + Math.random() * 8);
        game.inventory.drugs[drug] = (game.inventory.drugs[drug] || 0) + qty;
      },
    },
    {
      id: 'mugging',
      type: 'danger',
      title: 'Mugged',
      messages: [
        "A group of thugs corners you in a dead-end alley. They take your cash and leave you in the dirt.",
        "Wrong neighborhood, wrong time. You get jumped. They clean out your pockets.",
        "Two guys with knives step out of the shadows. Hand over the cash or bleed. Your choice.",
      ],
      probability: 0.04,
      conditions(game) { return game.world.period === 2; }, // Night only
      effect(game) {
        const loss = Math.floor(game.resources.cash * (0.1 + Math.random() * 0.15));
        game.resources.cash = Math.max(0, game.resources.cash - loss);
        const damage = Math.floor(5 + Math.random() * 15);
        game.character.health = Math.max(1, game.character.health - damage);
      },
    },
    {
      id: 'police_shakedown',
      type: 'police',
      title: 'Police Shakedown',
      messages: [
        "A patrol car pulls up. \"Routine search,\" the officer says, but there is nothing routine about the look in his eyes.",
        "Cops stop you on the corner. They want to see your pockets. The question is: can you talk your way out?",
        "Blue lights in the rearview. You were not speeding. This is something else.",
      ],
      probability: 0.06,
      conditions(game) {
        return (game.heat.cities[game.world.currentCity] || 0) > 15;
      },
      effect(game) {
        const stealthMod = game.character.stats.stealth || 5;
        if (Math.random() * 20 < stealthMod) {
          // Talked your way out
          game.flags._lastEventOutcome = 'escaped_police';
        } else {
          // Lost some product
          const drugs = Object.keys(game.inventory.drugs).filter(d => game.inventory.drugs[d] > 0);
          if (drugs.length > 0) {
            const drug = drugs[Math.floor(Math.random() * drugs.length)];
            const confiscated = Math.floor(game.inventory.drugs[drug] * 0.3);
            game.inventory.drugs[drug] -= confiscated;
          }
          if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, 10);
          game.flags._lastEventOutcome = 'caught_by_police';
        }
      },
    },
    {
      id: 'street_doctor',
      type: 'opportunity',
      title: 'Street Doctor',
      messages: [
        "A man in a stained lab coat beckons from a back alley clinic. \"I can patch you up. Fifty bucks, no questions asked.\"",
        "Somebody points you to a retired nurse who runs an off-the-books clinic. Cash only.",
        "A vet who used to be a combat medic offers to fix you up for a fee. He has seen worse than whatever you have got.",
      ],
      probability: 0.05,
      conditions(game) { return game.character.health < 70; },
      effect(game) {
        if (game.resources.cash >= 50) {
          game.resources.cash -= 50;
          const heal = Math.floor(20 + Math.random() * 20);
          game.character.health = Math.min(game.character.maxHealth, game.character.health + heal);
        }
      },
    },
    {
      id: 'hot_tip',
      type: 'information',
      title: 'Hot Tip',
      messages: [
        "A junkie whispers a tip: big shipment coming in tomorrow. Prices about to drop in the next city over.",
        "An old contact texts you coordinates and a time. Something big is going down.",
        "Somebody slips a note under your door: a location and a number. Could be a trap. Could be a goldmine.",
      ],
      probability: 0.05,
      conditions(game) { return game.world.day > 2; },
      effect(game) {
        // Flag for the UI to display a hint about nearby prices
        game.flags._hotTip = true;
        game.flags._hotTipCity = _getRandomCity(game);
      },
    },
    {
      id: 'hurricane',
      type: 'disaster',
      title: 'Hurricane Warning',
      messages: [
        "A hurricane is bearing down on Miami. All flights and routes in or out are shut down. You are stuck here.",
        "Category 4 hurricane approaching. Miami is locked down tight. Nobody is going anywhere for a while.",
      ],
      probability: 0.02,
      conditions(game) { return game.world.currentCity === 'Miami'; },
      effect(game) {
        game.flags._travelBlocked = true;
        game.flags._travelBlockedDuration = 3; // periods
      },
    },
    {
      id: 'celebrity_death',
      type: 'market',
      title: 'Celebrity Overdose',
      messages: [
        "A famous rapper just died from an overdose. The news is everywhere. Drug prices spike as paranoia and demand collide.",
        "Celebrity found dead in hotel room. Toxicology pending. The whole market just went haywire.",
      ],
      probability: 0.02,
      conditions(game) { return game.world.day > 10; },
      effect(game) {
        game.flags._tempPriceMultiplier = 1.4;
        game.flags._tempPriceDuration = 4;
        if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, 5);
      },
    },
    {
      id: 'gang_shootout',
      type: 'danger',
      title: 'Gang Shootout',
      messages: [
        "Gunshots erupt two blocks over. A gang war just spilled into the street. You are caught in the crossfire.",
        "Two crews open fire on each other right in front of you. Bullets tear through car windows and storefronts.",
        "The block explodes into violence. Muzzle flashes in every direction. You hit the ground and pray.",
      ],
      probability: 0.04,
      conditions(game) { return game.world.period === 2; },
      effect(game) {
        const dodgeChance = (game.character.stats.stealth || 5) / 20;
        if (Math.random() > dodgeChance) {
          const damage = Math.floor(10 + Math.random() * 25);
          game.character.health = Math.max(1, game.character.health - damage);
        }
        if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, 8);
      },
    },
    {
      id: 'informant_exposed',
      type: 'information',
      title: 'Informant Exposed',
      messages: [
        "Your inside man just got burned. His identity leaked and now the whole network is compromised.",
        "Bad news: the informant you were relying on got exposed. Their info is worthless now — and your heat just spiked.",
      ],
      probability: 0.03,
      conditions(game) { return game.flags.dirty_cop === true; },
      effect(game) {
        game.flags.dirty_cop_burned = true;
        if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, 15);
      },
    },
    {
      id: 'product_spoiled',
      type: 'loss',
      title: 'Product Gone Bad',
      messages: [
        "Your stash got wet. Mold is creeping through the bags. Half the product is ruined.",
        "Rats got into the stash house. They chewed through the packaging. You just lost a chunk of inventory.",
        "The product you bought was cut with garbage. Your customers are complaining — and some of it is unsellable.",
      ],
      probability: 0.04,
      conditions(game) {
        return Object.values(game.inventory.drugs).some(qty => qty > 10);
      },
      effect(game) {
        const drugs = Object.keys(game.inventory.drugs).filter(d => game.inventory.drugs[d] > 5);
        if (drugs.length > 0) {
          const drug = drugs[Math.floor(Math.random() * drugs.length)];
          const lost = Math.floor(game.inventory.drugs[drug] * 0.3);
          game.inventory.drugs[drug] -= lost;
        }
      },
    },
    {
      id: 'corrupt_cop_deal',
      type: 'opportunity',
      title: 'Dirty Badge',
      messages: [
        "A beat cop pulls you aside. \"I can lose some evidence for you. Make your heat disappear. Five hundred.\"",
        "Officer Johnson leans against the squad car. \"Look, we both know how this works. Cash makes problems go away.\"",
      ],
      probability: 0.04,
      conditions(game) {
        return (game.heat.cities[game.world.currentCity] || 0) > 25 && game.resources.cash >= 500;
      },
      effect(game) {
        game.resources.cash -= 500;
        if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, -15);
      },
    },
    {
      id: 'new_supplier',
      type: 'opportunity',
      title: 'New Supplier',
      messages: [
        "A new face shows up at the meet. He has product you have never seen at prices you will not believe.",
        "Word spreads: a new supplier is in town. Premium quality, reasonable prices. Could be legit. Could be a setup.",
      ],
      probability: 0.04,
      conditions(game) { return game.world.day > 7; },
      effect(game) {
        game.flags._newSupplier = true;
        game.flags._newSupplierCity = game.world.currentCity;
        // Temporarily reduce buy prices
        game.flags._tempBuyMultiplier = 0.7;
        game.flags._tempBuyDuration = 3;
      },
    },
    {
      id: 'festival',
      type: 'market',
      title: 'City Festival',
      messages: [
        "A massive music festival just rolled into town. Thousands of people, all looking to party. Demand is sky-high.",
        "The annual street fair is in full swing. The crowd is thick, the music is loud, and everybody is buying.",
      ],
      probability: 0.04,
      conditions() { return true; },
      effect(game) {
        game.flags._tempPriceMultiplier = 1.3;
        game.flags._tempPriceDuration = 4;
      },
    },
    {
      id: 'photo_in_paper',
      type: 'danger',
      title: 'Front Page News',
      messages: [
        "Your photo is in the newspaper. Somebody snapped a picture during a deal and sold it to a reporter. Your face is everywhere.",
        "Channel 7 ran a segment on local drug trade. You are in the background of the footage. Clear as day.",
      ],
      probability: 0.03,
      conditions(game) {
        return (game.heat.cities[game.world.currentCity] || 0) > 40;
      },
      effect(game) {
        if (window.Core) window.Core.adjustHeat(game, game.world.currentCity, 20);
        game.heat.federal = Math.min(100, game.heat.federal + 10);
      },
    },
    {
      id: 'anonymous_tip',
      type: 'windfall',
      title: 'Anonymous Tip',
      messages: [
        "An anonymous text leads you to an abandoned car. Inside: a duffel bag full of cash that somebody forgot about.",
        "A cryptic note on your windshield gives you GPS coordinates. You find a buried stash in the woods. Jackpot.",
      ],
      probability: 0.03,
      conditions(game) { return game.world.day > 8; },
      effect(game) {
        const cashFound = Math.floor(1000 + Math.random() * 4000);
        game.resources.cash += cashFound;
      },
    },
    {
      id: 'crew_crisis',
      type: 'social',
      title: 'Crew Crisis',
      messages: [
        "One of your crew members just got arrested. Their family is calling you. Do you bail them out, or cut them loose?",
        "Your right-hand man is in the hospital. Beaten half to death by rivals. The crew is watching to see what you do.",
      ],
      probability: 0.04,
      conditions(game) { return game.crew.length > 0; },
      effect(game) {
        if (game.crew.length > 0) {
          const member = game.crew[Math.floor(Math.random() * game.crew.length)];
          if (member) {
            member.loyalty = Math.max(0, (member.loyalty || 50) - 10);
          }
        }
      },
    },
    {
      id: 'market_crash',
      type: 'market',
      title: 'Market Crash',
      messages: [
        "The bottom just fell out. A massive federal operation across three states has dealers panicking. Prices are in the toilet.",
        "Every dealer in the city is trying to dump product at once. The market is in freefall. Prices have never been this low.",
      ],
      probability: 0.02,
      conditions(game) { return game.world.day > 15; },
      effect(game) {
        game.flags._tempPriceMultiplier = 0.4;
        game.flags._tempPriceDuration = 5;
      },
    },
    {
      id: 'drought',
      type: 'market',
      title: 'Drought',
      messages: [
        "Every supply line is dry. The border is locked down tight. Nobody has product and everybody wants it.",
        "A drought hits the market. Suppliers vanish overnight. If you are holding, you are about to make a fortune.",
      ],
      probability: 0.03,
      conditions(game) { return game.world.day > 10; },
      effect(game) {
        game.flags._tempPriceMultiplier = 2.0;
        game.flags._tempPriceDuration = 4;
      },
    },
    {
      id: 'lucky_break',
      type: 'windfall',
      title: 'Lucky Break',
      messages: [
        "You find a scratch-off ticket on the ground. $500 winner. The universe throws you a bone for once.",
        "An old debt you wrote off just got repaid. Somebody tracked you down and handed you an envelope of cash.",
        "A customer overpays by a lot and is long gone before you notice. Easy money.",
      ],
      probability: 0.05,
      conditions() { return true; },
      effect(game) {
        const cashFound = Math.floor(100 + Math.random() * 500);
        game.resources.cash += cashFound;
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------

  /**
   * Get the original backstory debt amount for the current game.
   * @param {object} game
   * @returns {number}
   */
  function _getBackstoryDebt(game) {
    if (game.character.backstory === 'cartelRecruit') return 8000;
    return 5000;
  }

  /**
   * Pick a random city different from the current one.
   * @param {object} game
   * @returns {string}
   */
  function _getRandomCity(game) {
    const cities = [
      'Miami', 'New York', 'Chicago', 'Atlanta', 'Detroit',
      'Houston', 'Los Angeles', 'Seattle', 'Denver', 'Phoenix',
    ];
    const others = cities.filter(c => c !== game.world.currentCity);
    return others[Math.floor(Math.random() * others.length)];
  }

  /**
   * Deep-clone a quest template to avoid mutating the original definitions.
   * @param {object} quest
   * @returns {object}
   */
  function _cloneQuest(quest) {
    return JSON.parse(JSON.stringify(quest));
  }

  // ---------------------------------------------------------------------------
  // Core Story Functions
  // ---------------------------------------------------------------------------

  /**
   * Check if any story beats should trigger on the current day/period.
   * Returns an array of story beat objects that are ready to fire.
   *
   * @param {object} game - The game state.
   * @returns {Array} - Story beats that should trigger now.
   */
  function checkStoryBeats(game) {
    const triggered = [];

    for (const beat of STORY_BEATS) {
      // Skip if already triggered (check the flag)
      if (beat.flag && game.flags[beat.flag]) continue;

      // Check phase
      if (beat.phase && game.world.phase !== beat.phase) continue;

      // Check day
      if (beat.day && game.world.day < beat.day) continue;

      // Only trigger on the exact day (not retroactively for past days)
      if (beat.day && game.world.day > beat.day + 2) continue;

      // Check period if specified
      if (beat.period !== undefined && game.world.period !== beat.period) continue;

      // Check additional conditions
      if (beat.conditions && !beat.conditions(game)) continue;

      triggered.push(beat);
    }

    return triggered;
  }

  /**
   * Get available quests in a specific city based on player progress.
   *
   * @param {object} game     - The game state.
   * @param {string} cityName - The city to check quests for.
   * @returns {Array} - Array of quest objects available to start.
   */
  function getAvailableQuests(game, cityName) {
    const available = [];
    const completedIds = (game.quests.completed || []).map(q => q.id || q);
    const activeIds = Object.values(game.quests.city || {})
      .flat()
      .filter(q => !q.completed && !q.failed)
      .map(q => q.id);

    for (const [questId, quest] of Object.entries(QUESTS)) {
      // Must be in the correct city
      if (quest.cityName !== cityName) continue;

      // Must not be already completed or active
      if (completedIds.includes(questId)) continue;
      if (activeIds.includes(questId)) continue;

      // Check level requirement
      if (quest.requirements.level && game.character.level < quest.requirements.level) continue;

      // Check flag requirements
      let flagsMet = true;
      for (const [flag, value] of Object.entries(quest.requirements.flags || {})) {
        if (game.flags[flag] !== value) {
          flagsMet = false;
          break;
        }
      }
      if (!flagsMet) continue;

      available.push(_cloneQuest(quest));
    }

    // Sort by chain order
    available.sort((a, b) => (a.chainOrder || 0) - (b.chainOrder || 0));

    return available;
  }

  /**
   * Start a quest by ID. Clones the quest template and adds it to the game state.
   *
   * @param {object} game    - The game state.
   * @param {string} questId - The quest ID to start.
   * @returns {object|null}  - The started quest object, or null if unavailable.
   */
  function startQuest(game, questId) {
    const template = QUESTS[questId];
    if (!template) {
      console.warn(`Quest not found: ${questId}`);
      return null;
    }

    const quest = _cloneQuest(template);
    quest.startedDay = game.world.day;
    quest.startedPeriod = game.world.period;

    // Ensure city quest array exists
    if (!game.quests.city) game.quests.city = {};
    if (!game.quests.city[quest.cityName]) game.quests.city[quest.cityName] = [];

    game.quests.city[quest.cityName].push(quest);

    return quest;
  }

  /**
   * Complete a quest by ID with a given outcome.
   * Applies rewards and sets flags.
   *
   * @param {object} game    - The game state.
   * @param {string} questId - The quest to complete.
   * @param {string} outcome - 'success' or 'failure'.
   * @returns {object|null}  - The rewards applied, or null.
   */
  function completeQuest(game, questId, outcome) {
    if (!game.quests.city) return null;

    let quest = null;
    let cityKey = null;
    let questIndex = -1;

    // Find the active quest
    for (const [city, quests] of Object.entries(game.quests.city)) {
      const idx = quests.findIndex(q => q.id === questId);
      if (idx !== -1) {
        quest = quests[idx];
        cityKey = city;
        questIndex = idx;
        break;
      }
    }

    if (!quest) {
      console.warn(`Active quest not found: ${questId}`);
      return null;
    }

    if (outcome === 'success') {
      quest.completed = true;

      // Apply rewards
      const rewards = quest.rewards || {};

      if (rewards.cash) game.resources.cash += rewards.cash;
      if (rewards.xp && window.Core) window.Core.addXP(game, rewards.xp);
      if (rewards.karma && window.Core) window.Core.adjustKarma(game, rewards.karma);

      // Grant item rewards
      if (rewards.items && rewards.items.length > 0) {
        for (const item of rewards.items) {
          if (item.id && item.qty) {
            game.inventory.drugs[item.id] = (game.inventory.drugs[item.id] || 0) + item.qty;
          }
        }
      }

      // Set flags
      if (rewards.flags) {
        Object.assign(game.flags, rewards.flags);
      }

      // Move to completed list
      if (!game.quests.completed) game.quests.completed = [];
      game.quests.completed.push({ id: quest.id, title: quest.title, day: game.world.day });

    } else {
      quest.failed = true;
    }

    // Remove from active
    game.quests.city[cityKey].splice(questIndex, 1);

    return quest.rewards || null;
  }

  /**
   * Trigger a random moral dilemma if conditions are met.
   *
   * @param {object} game - The game state.
   * @returns {object|null} - A dilemma object with choices, or null.
   */
  function triggerMoralDilemma(game) {
    // Filter to eligible dilemmas
    const eligible = MORAL_DILEMMAS.filter(d => {
      if (d.conditions && !d.conditions(game)) return false;
      return true;
    });

    if (eligible.length === 0) return null;

    // Roll for each eligible dilemma
    for (const dilemma of eligible) {
      if (Math.random() < (dilemma.probability || 0.05)) {
        return {
          id: dilemma.id,
          title: dilemma.title,
          description: dilemma.description,
          choices: dilemma.choices.map((c, i) => ({
            index: i,
            text: c.text,
          })),
        };
      }
    }

    return null;
  }

  /**
   * Resolve a moral dilemma by applying the chosen effect.
   *
   * @param {object} game       - The game state.
   * @param {string} dilemmaId  - The dilemma ID.
   * @param {number} choiceIndex - The index of the chosen option.
   * @returns {boolean} - True if resolved successfully.
   */
  function resolveDilemma(game, dilemmaId, choiceIndex) {
    const dilemma = MORAL_DILEMMAS.find(d => d.id === dilemmaId);
    if (!dilemma) {
      console.warn(`Dilemma not found: ${dilemmaId}`);
      return false;
    }

    const choice = dilemma.choices[choiceIndex];
    if (!choice) {
      console.warn(`Invalid choice index: ${choiceIndex} for dilemma ${dilemmaId}`);
      return false;
    }

    if (choice.effect) {
      choice.effect(game);
    }

    return true;
  }

  /**
   * Roll for a random event. Checks probabilities and conditions,
   * returns an event or null.
   *
   * @param {object} game - The game state.
   * @returns {object|null} - An event object with title, message, and effect applied, or null.
   */
  function rollRandomEvent(game) {
    // Shuffle to avoid always checking in the same order
    const shuffled = [...RANDOM_EVENTS].sort(() => Math.random() - 0.5);

    for (const event of shuffled) {
      // Check conditions
      if (event.conditions && !event.conditions(game)) continue;

      // Roll probability
      if (Math.random() < (event.probability || 0.05)) {
        // Pick a random message variant
        const message = event.messages[Math.floor(Math.random() * event.messages.length)];

        // Apply the effect
        if (event.effect) {
          event.effect(game);
        }

        return {
          id: event.id,
          type: event.type,
          title: event.title,
          message,
        };
      }
    }

    return null;
  }

  /**
   * Determine which ending the player earns based on current game state.
   * Evaluates all ending conditions and returns the highest-priority match.
   *
   * @param {object} game - The game state.
   * @returns {object} - The ending object with id, title, narrative, and scoreMultiplier.
   */
  function determineEnding(game) {
    const matches = [];

    for (const [endingId, ending] of Object.entries(ENDINGS)) {
      try {
        if (ending.condition(game)) {
          matches.push(ending);
        }
      } catch (e) {
        // Condition evaluation failed; skip silently
      }
    }

    if (matches.length === 0) {
      // Default ending: behind bars (caught by the system)
      return {
        id: 'behind_bars',
        title: 'Behind Bars',
        narrative: ENDINGS.behind_bars.narrative,
        scoreMultiplier: 0.5,
      };
    }

    // Sort by priority (highest first) and return the best match
    matches.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const best = matches[0];

    return {
      id: best.id,
      title: best.title,
      narrative: best.narrative,
      scoreMultiplier: best.scoreMultiplier,
    };
  }

  /**
   * Get the full narrative text for a given ending ID.
   *
   * @param {string} endingId - The ending identifier.
   * @returns {Array<string>} - Array of narrative paragraphs.
   */
  function getEndingNarrative(endingId) {
    const ending = ENDINGS[endingId];
    if (!ending) {
      return ["The story ends here. How it ends is up to interpretation."];
    }
    return [...ending.narrative];
  }

  /**
   * Calculate the player's final score based on game stats and ending.
   *
   * @param {object} game - The game state.
   * @returns {object} - { score, breakdown, ending }
   */
  function calculateFinalScore(game) {
    const ending = determineEnding(game);
    const netWorth = window.Core ? window.Core.calculateNetWorth(game) : 0;
    const completedQuests = game.quests.completed ? game.quests.completed.length : 0;

    const breakdown = {
      netWorth: Math.max(0, Math.floor(netWorth / 100)),
      daysAlive: game.stats.daysAlive * 10,
      questsCompleted: completedQuests * 500,
      citiesVisited: (game.stats.citiesVisited || []).length * 200,
      encountersWon: (game.stats.encountersWon || 0) * 50,
      karmaBonus: Math.abs(game.character.karma) * 5,
      levelBonus: game.character.level * 100,
    };

    const rawScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    const finalScore = Math.floor(rawScore * (ending.scoreMultiplier || 1));

    return {
      score: finalScore,
      breakdown,
      ending,
      multiplier: ending.scoreMultiplier,
    };
  }

  /**
   * Apply a story beat's effect to the game state.
   *
   * @param {object} game - The game state.
   * @param {object} beat - The story beat to apply.
   * @param {number} [choiceIndex] - Optional choice index if the beat has choices.
   */
  function applyStoryBeat(game, beat, choiceIndex) {
    // Apply the main effect
    if (beat.effect) {
      beat.effect(game);
    }

    // Apply a specific choice if provided
    if (beat.choices && choiceIndex !== undefined) {
      const choice = beat.choices[choiceIndex];
      if (choice) {
        // Check if choice has a condition
        if (choice.condition && !choice.condition(game)) {
          return; // Condition not met
        }
        if (choice.effect) {
          choice.effect(game);
        }
      }
    }
  }

  /**
   * Get all active quests across all cities.
   *
   * @param {object} game - The game state.
   * @returns {Array} - All currently active (non-completed, non-failed) quests.
   */
  function getActiveQuests(game) {
    const active = [];
    if (!game.quests.city) return active;

    for (const quests of Object.values(game.quests.city)) {
      for (const quest of quests) {
        if (!quest.completed && !quest.failed) {
          active.push(quest);
        }
      }
    }
    return active;
  }

  /**
   * Advance a quest step. Marks the current step as completed
   * and moves to the next one.
   *
   * @param {object} game    - The game state.
   * @param {string} questId - The quest to advance.
   * @returns {object|null}  - The updated quest, or null if not found.
   */
  function advanceQuestStep(game, questId) {
    const active = getActiveQuests(game);
    const quest = active.find(q => q.id === questId);
    if (!quest) return null;

    if (quest.currentStep < quest.steps.length) {
      quest.steps[quest.currentStep].completed = true;
      quest.currentStep += 1;
    }

    // Auto-complete if all steps done
    if (quest.currentStep >= quest.steps.length) {
      completeQuest(game, questId, 'success');
    }

    return quest;
  }

  /**
   * Check if the player's deadline has passed and determine consequences.
   *
   * @param {object} game - The game state.
   * @returns {object|null} - Deadline status or null if not applicable.
   */
  function checkDeadline(game) {
    if (game.world.phase !== 1) return null;

    const deadline = game.flags.viktor_extension ? 40 : 30;

    if (game.world.day > deadline) {
      if (game.resources.debt <= 0) {
        return {
          status: 'paid',
          message: 'You paid off Viktor in full. The shark swims away — for now.',
        };
      } else if (game.resources.debt < _getBackstoryDebt(game) * 0.25) {
        return {
          status: 'partial',
          message: 'Viktor takes what you have. It is not enough, but he lets you live. Barely. The debt remains, but the deadline is gone.',
        };
      } else {
        return {
          status: 'failed',
          message: 'Viktor is done waiting. His men come for you in the night. This is not going to end well.',
          damage: 50,
        };
      }
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.Story = {
    // Data
    STORY_BEATS,
    QUESTS,
    MORAL_DILEMMAS,
    ENDINGS,
    RANDOM_EVENTS,

    // Story progression
    checkStoryBeats,
    applyStoryBeat,
    checkDeadline,

    // Quest management
    getAvailableQuests,
    getActiveQuests,
    startQuest,
    completeQuest,
    advanceQuestStep,

    // Moral dilemmas
    triggerMoralDilemma,
    resolveDilemma,

    // Random events
    rollRandomEvent,

    // Endings and scoring
    determineEnding,
    getEndingNarrative,
    calculateFinalScore,
  };

})();

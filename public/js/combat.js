/**
 * Street Empire - Combat & Encounter System
 * ==========================================
 * Manages turn-based confrontations, weapons, gear, cop chases,
 * and all encounter types. Uses window globals (no ES modules).
 *
 * Depends on: window.Core (getStatModifier)
 * Exports:    window.Combat
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Clamp a value between min and max. */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /** Random integer between min and max inclusive. */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Pick a random element from an array. */
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** Percentage roll: returns true if Math.random() * 100 < chance. */
  function roll(chance) {
    return Math.random() * 100 < chance;
  }

  // ---------------------------------------------------------------------------
  // Weapons
  // ---------------------------------------------------------------------------

  var WEAPONS = [
    { id: 'fists',   name: 'Fists',          damage: 1,  accuracy: 0.9,  intimidation: 0, cost: 0 },
    { id: 'knife',   name: 'Knife',           damage: 2,  accuracy: 0.85, intimidation: 1, cost: 200 },
    { id: 'bat',     name: 'Baseball Bat',    damage: 3,  accuracy: 0.8,  intimidation: 2, cost: 150 },
    { id: 'pistol',  name: 'Pistol (9mm)',    damage: 5,  accuracy: 0.75, intimidation: 4, cost: 1500 },
    { id: 'shotgun', name: 'Shotgun',         damage: 8,  accuracy: 0.65, intimidation: 6, cost: 3000 },
    { id: 'ak47',    name: 'AK-47',           damage: 10, accuracy: 0.6,  intimidation: 8, cost: 8000 },
  ];

  // ---------------------------------------------------------------------------
  // Gear
  // ---------------------------------------------------------------------------

  var GEAR = [
    { id: 'body_armor',   name: 'Body Armor',      defenseBonus: 3, stealthPenalty: -1, stealthBonus: 0, runBonus: 0, cost: 2000 },
    { id: 'kevlar',       name: 'Kevlar Vest',      defenseBonus: 5, stealthPenalty: -2, stealthBonus: 0, runBonus: 0, cost: 5000 },
    { id: 'burner_phone', name: 'Burner Phone',     defenseBonus: 0, stealthPenalty: 0,  stealthBonus: 2, runBonus: 0, cost: 500 },
    { id: 'fake_id',      name: 'Fake ID',          defenseBonus: 0, stealthPenalty: 0,  stealthBonus: 3, runBonus: 0, bluffBonus: 3, cost: 2000 },
    { id: 'disguise_kit', name: 'Disguise Kit',     defenseBonus: 0, stealthPenalty: 0,  stealthBonus: 4, runBonus: 0, cost: 3000 },
    { id: 'getaway_car',  name: 'Getaway Car',      defenseBonus: 0, stealthPenalty: 0,  stealthBonus: 0, runBonus: 5, cost: 10000 },
    { id: 'armored_suv',  name: 'Armored SUV',      defenseBonus: 4, stealthPenalty: 0,  stealthBonus: 0, runBonus: 3, cost: 25000 },
    { id: 'scanner',      name: 'Police Scanner',   defenseBonus: 0, stealthPenalty: 0,  stealthBonus: 0, runBonus: 0, scannerBonus: true, cost: 1500 },
  ];

  // ---------------------------------------------------------------------------
  // Encounter Type Definitions
  // ---------------------------------------------------------------------------

  var ENCOUNTER_TYPES = {
    police_bust: {
      strength: 6, speed: 5, greed: 7, intelligence: 4,
      bribeCost: 2000,
      title: 'Police Bust',
    },
    dea_raid: {
      strength: 9, speed: 7, greed: 3, intelligence: 8,
      bribeCost: 10000,
      title: 'DEA Raid',
    },
    mugging: {
      strength: 4, speed: 4, greed: 8, intelligence: 2,
      bribeCost: 500,
      title: 'Mugging',
    },
    rival_dealer: {
      strength: 5, speed: 5, greed: 6, intelligence: 5,
      bribeCost: 1500,
      title: 'Rival Dealer',
    },
    shark_goons: {
      strength: 8, speed: 3, greed: 9, intelligence: 3,
      bribeCost: 0,
      title: 'Loan Shark Enforcers',
    },
    robbery: {
      strength: 0, speed: 0, greed: 0, intelligence: 0,
      bribeCost: 0,
      title: 'Robbery',
    },
    crew_betrayal: {
      strength: 5, speed: 5, greed: 7, intelligence: 4,
      bribeCost: 3000,
      title: 'Crew Betrayal',
    },
    random_encounter: {
      strength: 3, speed: 3, greed: 5, intelligence: 3,
      bribeCost: 0,
      title: 'Random Encounter',
    },
  };

  // ---------------------------------------------------------------------------
  // Narrative Variants  (3+ per type per outcome)
  // ---------------------------------------------------------------------------

  var NARRATIVES = {
    // -------------------------------------------------------------------------
    // POLICE BUST
    // -------------------------------------------------------------------------
    police_bust: {
      intro: [
        'Red and blue lights flood the alley as two cruisers screech to a halt. An officer steps out, hand on his holster, eyes locked on you.',
        'A plain-clothes detective flashes a badge and blocks your path. Behind him, uniformed officers pour out of an unmarked van.',
        'The crackle of a police radio cuts through the night air. Three officers materialize from the shadows, weapons drawn, shouting commands.',
      ],
      fight_success: [
        'You catch the lead officer with a vicious strike that sends him stumbling into his partner. In the chaos you vault a chain-link fence and vanish into the maze of back alleys before backup arrives.',
        'Adrenaline surges through your veins as you shove the closest cop into a dumpster. His radio clatters across the pavement. You sprint through a broken fence and disappear into the night.',
        'The officer swings his baton but you duck under it, driving your shoulder into his ribs. He crumples. You grab your stash and bolt through a fire escape before the second unit rounds the corner.',
      ],
      fight_fail: [
        'The officer sidesteps your swing and drives his baton into your stomach. You hit the concrete hard. Cuffs bite into your wrists as they confiscate everything you are carrying.',
        'You throw a wild punch but the cop is faster. A taser drops you to the ground, convulsing. They strip your pockets clean while you writhe on the wet asphalt.',
        'Two officers tackle you simultaneously. Your face meets the pavement with a sickening crack. They haul you up, bleeding, and empty every pocket you have.',
      ],
      run_success: [
        'You bolt through a narrow gap between buildings that the cruisers cannot follow. Zigzagging through laundry lines and fire escapes, you lose them in the urban labyrinth.',
        'You vault the hood of a parked sedan and cut through a basement stairwell. The officers shout behind you but their boots cannot keep up with fear-fueled legs.',
        'Ducking into a crowded bodega, you weave between shelves and slip out the back door. By the time they check inside, you are three blocks away and still running.',
      ],
      run_fail: [
        'You make it half a block before a cruiser cuts you off. An officer clotheslines you as you try to change direction. Stars explode behind your eyes.',
        'Your foot catches a pothole and you go down hard, sliding across broken glass. Before you can stand, a knee pins you to the ground and handcuffs click shut.',
        'You sprint into what you think is a through-alley, only to slam into a dead-end wall. The officers close in from behind, flashlights blinding you as they take everything.',
      ],
      bribe_success: [
        'You slide a thick envelope into the lead officer\'s jacket pocket. He glances at his partner, nods slowly, and the cruisers pull away without another word.',
        '"Look, officer, maybe we can work something out." You press bills into his palm. He counts them, tucks the cash inside his vest, and mutters into his radio: "False alarm, moving on."',
        'The detective eyes the money, then eyes you. After a long silence he pockets it with practiced ease. "I never saw you tonight," he says, and walks back to his car.',
      ],
      bribe_fail: [
        'You hold out a wad of cash but the officer slaps it away. "You think I am for sale?" he snarls, slamming you against the cruiser. The situation just got a lot worse.',
        'The detective stares at the money like it is an insect. "Add attempted bribery to the charges," he says flatly, and the cuffs go on tighter than necessary.',
        'You flash the bills but these cops are clean. One of them laughs bitterly and shoves you face-first into the hood of the car while his partner radios for transport.',
      ],
      bluff_success: [
        'You flash your fake credentials and spin a story about being an undercover informant. The officer hesitates, checks his radio, and waves you through with a suspicious glare.',
        '"I am working with Narcotics Division, badge number 4472," you say without blinking. The cop narrows his eyes but steps aside. "Get out of here before I change my mind."',
        'You adopt a bored expression and claim you are just a delivery driver. Your calm demeanor and clean-looking gear sell the story. The officers exchange shrugs and move on.',
      ],
      bluff_fail: [
        'You try to talk your way out but your story falls apart under the detective\'s sharp questions. He smirks as the cuffs come out. "Nice try."',
        '"I am just passing through," you say, but sweat betrays you. The officer checks your pockets and finds everything he needs. Your bluff cost you precious seconds.',
        'The sergeant is not buying a word of it. He has seen a thousand liars tonight and you are not even the best one. "Save it for the judge," he says, shoving you toward the cruiser.',
      ],
    },

    // -------------------------------------------------------------------------
    // DEA RAID
    // -------------------------------------------------------------------------
    dea_raid: {
      intro: [
        'Black SUVs screech in from three directions. Federal agents in tactical gear pour out, rifles raised, screaming commands. This is no routine bust.',
        'The door explodes inward and flashbang grenades turn the world white. When your vision clears, DEA agents in full body armor have every exit covered.',
        'A helicopter spotlight pins you in place as armored agents converge from all sides. A bullhorn demands your surrender. The feds have been watching.',
      ],
      fight_success: [
        'In a moment of desperate madness you hurl a crate at the lead agent and charge through the gap. Bullets crack the air around you as you dive through a window and tumble into the alley below. Somehow, you are alive and free.',
        'You smash through a side wall into the adjacent building, the rotten drywall giving way. Agents scramble to re-position but you have already found the basement tunnel you scouted weeks ago.',
        'You flip a table into the breach team and sprint up the fire escape. Rounds ping off the metal railing as you vault to the neighboring rooftop and vanish into the skyline.',
      ],
      fight_fail: [
        'You lunge at the nearest agent but three others tackle you before your fist connects. A rifle butt to the temple sends you to the floor. They take everything, including your dignity.',
        'The tactical team is too well-trained. Your swing meets a riot shield and the counter-strike drops you instantly. You wake in zip-ties with federal agents photographing your entire stash.',
        'Armor-piercing rounds shred the wall inches from your head. You drop to the floor, hands up. They strip you of every gram, every dollar, and every scrap of hope.',
      ],
      run_success: [
        'You trigger the fire alarm, flooding the building with panicked civilians. In the chaos you shed your jacket, blend into the crowd, and slip through the federal cordon.',
        'A smoke grenade you have been saving rolls across the floor. In the haze you drop through a floor grate into the sewer system. The feds sweep the building for an hour and find nothing.',
        'You crash through a boarded window and land on a dumpster below. Rolling off, you hot-wire a delivery van in the loading dock and tear out of the alley before the chopper can reacquire you.',
      ],
      run_fail: [
        'You make it to the stairwell but an agent is already waiting. A taser takes your legs out and you tumble down a full flight of stairs. They drag you back up and into a transport van.',
        'The helicopter tracks your every move with thermal imaging. No matter which alley you duck into, agents appear at the other end. They corner you in a parking garage and it is over.',
        'You vault through a window but land wrong, your ankle snapping with a sickening pop. Agents surround you before you can even crawl. The pain is nothing compared to what you just lost.',
      ],
      bribe_success: [
        'You name an eye-watering number and the lead agent pauses. After a tense radio exchange he orders his team to "secure the perimeter" while you walk out a side door with a fraction of your stash.',
        'One of the agents is not as clean as his badge suggests. You recognize the look. A whispered negotiation later, the evidence bag mysteriously comes up light.',
        'You offer an envelope stuffed with high-denomination bills and intel on a bigger fish. The agent considers the career implications and decides your fish is bigger than theirs today.',
      ],
      bribe_fail: [
        'The federal agent stares at your money with disgust. "Do you know what the penalty is for bribing a federal officer?" Everything just got exponentially worse.',
        'You try to negotiate but these agents answer to Washington, not the streets. Your offer is noted, recorded, and will be used against you at trial.',
        'The lead agent laughs in your face and adds a federal bribery charge to the growing list. Your lawyer is going to have a very bad day.',
      ],
      bluff_success: [
        'You claim to be a confidential informant and rattle off enough case numbers to give the lead agent pause. He makes a call, gets a confusing answer, and decides to let you walk pending "verification."',
        'You produce your fake federal credentials with steady hands and claim jurisdiction. The raid commander, already under pressure, does not want an inter-agency incident. He waves you out.',
        'You spin an elaborate story about a parallel investigation and threaten to call the Assistant Director. The agents exchange nervous looks and decide this is above their pay grade.',
      ],
      bluff_fail: [
        'The agent runs your name through the federal database in seconds. Your cover story evaporates like morning fog. "Cute," he says, motioning for the zip-ties.',
        'You start your bluff but the lead agent holds up a photograph of you making a deal three days ago. "We know exactly who you are," she says flatly.',
        'Your confident story crumbles when the agent asks you to repeat your badge number backward. Nobody taught you that trick at con school.',
      ],
    },

    // -------------------------------------------------------------------------
    // MUGGING
    // -------------------------------------------------------------------------
    mugging: {
      intro: [
        'A figure steps out from behind a dumpster, switchblade glinting under the streetlight. "Empty your pockets," he growls, eyes darting nervously.',
        'Two thugs block the sidewalk ahead, one cracking his knuckles while the other pulls a rusty pipe from his jacket. "Wrong neighborhood, friend."',
        'A hand grabs your collar from behind and yanks you into a doorway. A knife presses against your ribs. "Cash. Now. No noise."',
      ],
      fight_success: [
        'You grab the mugger\'s wrist and twist hard. The knife clatters to the ground. A swift knee to his gut doubles him over and you leave him gasping in the gutter.',
        'The thug swings his pipe but telegraphs it like a billboard. You sidestep, connect with a devastating hook, and he goes down like a sack of bricks. His buddy takes one look and bolts.',
        'You catch the blade arm, headbutt the mugger square in the nose, and stomp on his instep for good measure. He staggers away, blood streaming, wanting no more of this fight.',
      ],
      fight_fail: [
        'The mugger is faster than he looks. A sucker punch rocks your jaw and you stagger. Before you can recover, hands rifle through your pockets and they vanish into the dark.',
        'You swing but miss. The pipe catches you across the shoulder blade and white-hot pain drops you to one knee. They grab what they can and disappear.',
        'The knife nicks your forearm as you try to disarm him. Blood makes your grip slippery and a second attacker clubs you from behind. You come to with lighter pockets.',
      ],
      run_success: [
        'You feint left, break right, and sprint full-tilt down the block. The mugger chases for half a block before giving up, cursing at your back.',
        'You shove the nearest thug into his partner and bolt through an open apartment lobby. The doorman barely blinks as you disappear up the service stairs.',
        'Adrenaline launches you over a parked car and around the corner. You hear them shouting behind you but their footsteps fade quickly. Too slow to catch a scared dealer.',
      ],
      run_fail: [
        'You try to run but the second mugger was flanking you. He trips you and you skid across the pavement, losing skin and cash in equal measure.',
        'Your escape route dead-ends at a locked gate. You rattle it desperately but the muggers close in, grinning. This is going to hurt.',
        'You bolt but slip on a patch of wet garbage. The mugger is on you before you can stand, pinning you down while his partner empties your pockets.',
      ],
      bribe_success: [
        'You toss a wad of smaller bills on the ground. "Take it and walk." The mugger eyes the cash, scoops it up, and decides not to press his luck.',
        '"I got something better than a fight," you say, producing some bills. The thugs snatch the money and vanish, satisfied with the easy score.',
        'You peel off a few bills and hold them out. "This is all I have got. Take it or we both end up bleeding." The mugger takes the smart play.',
      ],
      bribe_fail: [
        'You offer cash but the mugger wants more. "That is it? I saw your roll." He presses the knife closer and takes everything he can find.',
        'The thugs snatch your offered money and then keep going, rifling through every pocket. Your "bribe" just showed them you have more to give.',
        'You throw money at their feet but they are not interested in a partial payment. They want the whole score, and they take it by force.',
      ],
      bluff_success: [
        'You lock eyes with the mugger and say, "I work for Kingpin Cortez. Touch me and you are dead by morning." The color drains from his face and he backs away.',
        '"You know who owns this block?" you say calmly, pulling aside your jacket to reveal your weapon. The mugger suddenly remembers an appointment elsewhere.',
        'You point to a random window above and say, "My crew is watching from up there right now." The mugger glances up just long enough for doubt to take hold. He slinks away.',
      ],
      bluff_fail: [
        'You try to name-drop a local boss but pronounce the name wrong. The mugger laughs and hits you harder for the insult.',
        '"I know people," you say, but your voice cracks. The mugger grins. "You do not know the right people." Then the beating starts.',
        'Your bluff is unconvincing. The thugs exchange amused looks and proceed to relieve you of your valuables with extra enthusiasm.',
      ],
    },

    // -------------------------------------------------------------------------
    // RIVAL DEALER
    // -------------------------------------------------------------------------
    rival_dealer: {
      intro: [
        'A crew from the east side rolls up three deep, their leader stepping forward with a gold-toothed sneer. "You are moving product on our turf."',
        'Your connect warned you about this. A rival dealer blocks the corner, flanked by two enforcers. "Time to renegotiate your territory."',
        'A black Escalade pulls up and a dealer you recognize steps out, cracking his neck. "Last chance to pack up and leave my block."',
      ],
      fight_success: [
        'You meet the rival head-on with a devastating combination. His enforcers scatter when their boss hits the pavement. You claim his stash and the corner.',
        'The rival lunges but you are ready. A brutal counter sends him reeling into a parked car. His crew drags him away, leaving behind a bag of product in their haste.',
        'You and the rival trade blows in the streetlight. Your final hit opens a gash above his eye and he staggers back, hands up. His crew retreats and you claim the territory.',
      ],
      fight_fail: [
        'The rival\'s enforcer blindsides you with a crowbar while you focus on the boss. You go down hard and they strip your pockets, taking product and pride.',
        'Three against one proves too much. You land a few good shots but they overwhelm you, leaving you bruised on the sidewalk minus your stash and your reputation.',
        'The rival dealer pulls a weapon you were not expecting. Outgunned and outmanned, you take a beating and lose your product and claim to the block.',
      ],
      run_success: [
        'You dodge the enforcer\'s grab and cut through a liquor store, out the back, and into a cab before they can follow. You lose the corner but keep your product.',
        'Rather than fight three-on-one, you vault a fence and disappear through the projects. Smart enough to know when retreat is the winning move.',
        'You throw a trash can lid like a frisbee at the closest goon and sprint in the opposite direction. They give chase for two blocks before the Escalade picks them up.',
      ],
      run_fail: [
        'The rival\'s crew has the block locked down. Every exit leads to another hostile face. They corner you in a doorway and take what they came for.',
        'You try to run but the Escalade cuts you off at the intersection. They drag you out of the street and relieve you of everything worth taking.',
        'An enforcer tackles you before you make it ten feet. The rival dealer stands over you, shaking his head, as they empty your pockets and claim the block.',
      ],
      bribe_success: [
        'You offer the rival a cut of your profits for the month. He considers it, nods, and extends a hand. "Welcome to the neighborhood. Do not make me regret this."',
        '"How about we split the block and double our volume?" you propose. The rival sees the logic and agrees to a truce, pocketing your good-faith payment.',
        'You hand over a generous tribute and promise to stay south of the boulevard. The rival pockets the cash and calls off his dogs. Business is business.',
      ],
      bribe_fail: [
        'You offer cash but the rival spits at your feet. "I do not want your money, I want you gone." His enforcers crack their knuckles in agreement.',
        'The rival dealer laughs at your offer. "You think I need your scraps? I am taking the whole block." He nods to his crew and they move in.',
        'Your bribe attempt is seen as weakness. The rival pockets the money AND takes your product. "Thanks for the donation," he says, grinning.',
      ],
      bluff_success: [
        'You calmly describe the firepower waiting in the car around the corner. The rival glances nervously at the tinted windows of a parked sedan and decides today is not the day.',
        '"My supplier is connected to the cartel," you say with absolute conviction. The rival has heard rumors and decides not to test them. He backs off for now.',
        'You pull out your phone and pretend to make a call. "Yeah, bring the crew to Seventh and Main. Now." The rival dealer suddenly finds a reason to be elsewhere.',
      ],
      bluff_fail: [
        'The rival has done his homework. "You are solo and broke. Quit playing." Your bluff crumbles and so does your negotiating position.',
        'You name-drop a gang that disbanded last year. The rival bursts out laughing. "You really are new around here." Things escalate quickly.',
        'Your poker face is not as strong as you thought. The rival reads through your bluff like a newspaper and decides to make an example of you.',
      ],
    },

    // -------------------------------------------------------------------------
    // LOAN SHARK GOONS
    // -------------------------------------------------------------------------
    shark_goons: {
      intro: [
        'Two mountains of muscle step out of a Lincoln Town Car. You recognize them: the loan shark\'s favorite collectors. They are not here for small talk.',
        'A fist hammers on your door at 3 AM. "Open up. Mr. Vincenzo wants his money. You have got ten seconds."',
        'The loan shark\'s enforcer catches you at the corner store, cracking his knuckles with a grin that promises pain. "Payment is overdue, friend."',
      ],
      fight_success: [
        'The first goon swings wide and you duck under it, driving an uppercut into his jaw. The second hesitates just long enough for you to grab a bottle and shatter it across his temple. They will not be collecting today.',
        'You catch the enforcer\'s wrist mid-punch and use his momentum to slam him into his partner. Both go down in a tangle of limbs. You step over them and walk away, debt conversation postponed.',
        'The goon charges like a bull but you sidestep at the last second. He crashes through a display rack and his partner trips over the wreckage. You leave them groaning and buy yourself more time.',
      ],
      fight_fail: [
        'The enforcer\'s fist connects with your jaw like a wrecking ball. You hit the ground and his partner delivers three more shots to your ribs. They take every dollar you have as a "down payment."',
        'You land a decent shot but these guys eat punches for breakfast. The counter-attack is savage and methodical. They leave you battered and significantly lighter in the wallet.',
        'Fighting a loan shark\'s muscle is like punching a brick wall. The beating is brutal and efficient. They take your cash, your product, and leave a message carved in bruises.',
      ],
      run_success: [
        'You sprint between two parked cars and vault a chain-link fence. The goons are strong but slow. By the time they waddle around to the gate, you are three blocks gone.',
        'You dart into a subway entrance and leap the turnstile. The goons barrel after you but the closing train doors catch them perfectly. You wave goodbye through the glass.',
        'You duck into a crowded nightclub and lose yourself in the press of bodies. The goons scan the crowd for twenty minutes before giving up and reporting back to the boss.',
      ],
      run_fail: [
        'You try to run but one of the goons is deceptively fast. He catches your jacket collar and hauls you backward like a rag doll. The beating that follows is thorough.',
        'You make it half a block before a third goon you did not see steps out of a doorway and clotheslines you. They drag you into an alley for a very unpleasant conversation.',
        'The Lincoln Town Car pulls alongside you as you run, cutting off your escape. The goons pile out and pin you against the wall. Running was the wrong choice.',
      ],
      bribe_success: [
        'You hand over a stack of cash and promise double by Friday. The goon counts it, calls the boss, and nods. "Mr. Vincenzo says you have got until Friday. Do not be late."',
        '"Here is half now, half on Tuesday," you say, extending an envelope. The enforcer checks with his boss by phone and pockets it. "Tuesday. No excuses."',
        'You offer the goons a personal tip on top of the partial payment. Their demeanor shifts from hostile to almost friendly. "We will tell the boss you are good for it."',
      ],
      bribe_fail: [
        'The enforcer shakes his head. "Boss says the full amount or we start breaking things." Your partial payment is not enough. Not today.',
        'You offer what you have but the goon pushes it back. "Mr. Vincenzo is done being patient. This is not a negotiation anymore." Then the hitting starts.',
        'The goons take your money but it is not enough to satisfy the debt. They deliver the beating anyway as a "reminder" and promise to come back for the rest.',
      ],
      bluff_success: [
        'You tell the goons you have a massive deal closing tomorrow that will cover the whole debt. You sell the lie with enough detail that they call the boss. "One more day," the enforcer says.',
        '"I have got the money in a safe house across town. Let me go get it." The goons, not known for critical thinking, agree to wait. You use the time to actually make the money.',
        'You claim a powerful new partner is backing you and dropping the shark\'s name could get him in hot water. The goons exchange a look of uncertainty and decide to relay the message instead of delivering a beating.',
      ],
      bluff_fail: [
        'The goon has heard every excuse in the book and yours is not even in the top ten. He sighs with genuine boredom and starts swinging.',
        '"Save it," the enforcer says, cutting off your elaborate story. "We have heard better lies from dead men." The beating is extra thorough for wasting their time.',
        'Your bluff might have worked on someone with fewer brain cells, but these goons have been doing this too long. They see through you instantly.',
      ],
    },

    // -------------------------------------------------------------------------
    // ROBBERY (player-initiated)
    // -------------------------------------------------------------------------
    robbery: {
      intro: [
        'You spot the target: a low-level dealer counting cash in a dim parking lot, completely unaware of your approach. The opportunity is right there.',
        'Your intel was good. The stash house has minimal security and the courier just arrived with a fresh supply. Time to make a move.',
        'The rival crew\'s runner cuts through the alley alone, a bulging backpack slung over one shoulder. This is the moment you have been waiting for.',
      ],
      fight_success: [
        'You strike fast and hard, overwhelming the target before they can react. They crumple to the ground and you grab everything of value. Clean, efficient, ruthless.',
        'The target reaches for a weapon but you are already on top of them. A swift disarming strike and it is over. You scoop up their cash, product, and vanish.',
        'You kick the door in and the target freezes. One look at you and they put their hands up. You clean the place out in under ninety seconds.',
      ],
      fight_fail: [
        'The target was not as soft as they looked. They pull a weapon you did not expect and you barely escape with a nasty wound and nothing to show for the risk.',
        'You move in but an unseen guard opens fire from the shadows. You scramble for cover, take a hit, and limp away empty-handed and bleeding.',
        'The dealer fights back with desperate ferocity. You trade blows in the dark but reinforcements arrive before you can finish the job. You flee with injuries and no loot.',
      ],
      run_success: [
        'Things go sideways but you cut your losses and bolt. You escape into the night, no richer but at least in one piece.',
        'When the situation turns bad, you trust your instincts and run. Smart move. Live to rob another day.',
        'You disengage cleanly and melt into the shadows. The target never gets a good look at your face.',
      ],
      run_fail: [
        'You try to abort the robbery but the target\'s crew has already spotted you. They chase you down and deliver a beating that makes you regret ever having the idea.',
        'Your escape route is blocked by a van that was not there before. The target\'s backup pulls you out of the shadows and teaches you a painful lesson.',
        'You turn to run but stumble over debris in the dark. They catch you and the tables turn completely. Now you are the one getting robbed.',
      ],
      bluff_success: [
        'You flash your weapon and bark commands with authority. The target drops everything and runs. You collect the spoils without throwing a single punch.',
        '"Do not move, do not breathe, do not think," you say, pressing cold steel against their back. They comply completely. You take everything and walk away like a ghost.',
        'Your reputation precedes you. The target recognizes you and surrenders immediately, handing over cash and product without a fight. Fear is the best weapon.',
      ],
      bluff_fail: [
        'You try to intimidate the target but they call your bluff, pulling their own weapon. Now you are in a standoff you did not want.',
        'The target laughs at your threats. "I know who you are. You are nobody." Their confidence unnerves you and the robbery falls apart.',
        'Your intimidation attempt backfires when the target hits a panic button. Suddenly the whole block knows you are here and the situation is very bad.',
      ],
    },

    // -------------------------------------------------------------------------
    // CREW BETRAYAL
    // -------------------------------------------------------------------------
    crew_betrayal: {
      intro: [
        'Your phone buzzes with a screenshot: your own crew member meeting with a rival. When you confront them, they pull a weapon and the truth spills out.',
        'You walk into your safe house and find it half-empty. Your most trusted lieutenant stands in the middle, packing the last of your product into his own bags.',
        'The betrayal comes mid-deal. Your crew member turns a gun on you and announces he is taking over the operation. The buyer watches with cold amusement.',
      ],
      fight_success: [
        'The traitor underestimated your skills. You disarm them with a technique they never saw in all their time working with you. A final blow puts them on the floor. Loyalty lesson delivered.',
        'Rage fuels your strikes. The betrayer manages to block the first two but the third connects squarely. They crumple, and you recover your stolen goods.',
        'You close the distance before the traitor can react, knocking their weapon away. A few devastating hits later, they are begging for mercy on the ground.',
      ],
      fight_fail: [
        'The traitor knows all your moves. They counter your attack perfectly and leave you bleeding on the floor of your own safe house. They walk out with your product and your pride.',
        'Fighting someone who knows your patterns is a losing proposition. The betrayer anticipated your first move, your second, and your third. They leave you broken.',
        'The traitor brought backup you did not expect. Three against one in your own territory. They clean you out and leave you wondering where it all went wrong.',
      ],
      run_success: [
        'You decide this fight is not worth dying over. You grab what you can and bail through the back. You can rebuild, but you cannot un-die.',
        'You throw a smoke bomb and dive out a window. The traitor fires into the haze but you are already gone. Betrayal stings but survival matters more.',
        'You flip the table between you and bolt for the exit. The traitor gives chase for a block before deciding the stolen goods are prize enough.',
      ],
      run_fail: [
        'The traitor anticipated your escape route because they helped you plan it. They are waiting at the back door with a crowbar and an ugly smile.',
        'You try to flee but the betrayer\'s new allies have the building surrounded. There is nowhere to go and the cost of betrayal falls on you.',
        'Your escape attempt is cut short when you realize the traitor has already disabled your getaway vehicle. They catch you in the parking lot.',
      ],
      bribe_success: [
        'You offer the traitor a bigger cut and a clean slate. Greed wins over grudges. They lower their weapon and you renegotiate from a position of wary truce.',
        '"Name your price," you say calmly. The traitor hesitates. You double the number. They holster their weapon and you shake on it, both knowing trust is gone forever.',
        'You promise the betrayer their own territory and a percentage of the operation. Their eyes light up with ambition. The weapon disappears and a very different conversation begins.',
      ],
      bribe_fail: [
        'You offer money but the traitor shakes their head. "This is not about money. This is about respect." Things are about to get very personal.',
        'The betrayer laughs at your offer. "I am already taking everything you have. Why would I settle for a cut?" They have a point.',
        'You try to buy your way out but the traitor is done negotiating. They have already made their deal with your rivals and your money means nothing.',
      ],
      bluff_success: [
        'You tell the traitor that you have been recording everything and the evidence goes to the cartel if anything happens to you. The color drains from their face. They back down.',
        '"I poisoned the product you stole," you lie with perfect composure. The betrayer freezes, then looks at the bags with horror. You use the moment to take back control.',
        'You calmly inform the traitor that their new allies are planning to double-cross them too, and you have the proof. Paranoia takes hold and the betrayal unravels.',
      ],
      bluff_fail: [
        'The traitor knows you too well. "You are bluffing. You always bluff when you are scared." They are right, and now they know you have nothing left.',
        'Your attempt at psychological warfare falls flat. The betrayer has been planning this for weeks and accounted for your silver tongue.',
        'You try to turn the tables with words but the traitor just presses the weapon harder against your chest. "Save the speeches for someone who has not heard them all before."',
      ],
    },

    // -------------------------------------------------------------------------
    // RANDOM ENCOUNTER (positive / negative)
    // -------------------------------------------------------------------------
    random_encounter: {
      positive: [
        'You find a duffel bag behind a dumpster containing cash and a small stash. Somebody\'s bad day just became your lucky break.',
        'A grateful stranger presses a roll of bills into your hand. "You helped my cousin last month. He said to find you." Sometimes karma pays dividends.',
        'You stumble across a deal gone wrong. Both parties fled, leaving behind product and cash scattered across the alley. Finder\'s keepers.',
        'An old connect spots you and insists on paying back a favor with a bag of premium product and some inside information about police patrols.',
      ],
      negative: [
        'You witness a violent crime and the perpetrator spots you. They chase you for three blocks before you lose them, but the adrenaline costs you.',
        'A police officer stops you for "matching a description." The questioning is invasive and raises your heat even though they find nothing.',
        'You accidentally walk into the middle of a sting operation. You are not the target but the chaos catches you in the crossfire.',
        'A car backfires and a nearby dealer panics, firing a wild shot that grazes you. Wrong place, wrong time, wrong neighborhood.',
      ],
    },
  };

  // ---------------------------------------------------------------------------
  // Equipment Helpers
  // ---------------------------------------------------------------------------

  /**
   * Get the player's currently equipped weapon, or fists as default.
   * @param {object} game - The game state.
   * @returns {object} Weapon definition from WEAPONS array.
   */
  function getEquippedWeapon(game) {
    var weapons = game.inventory.weapons || [];
    for (var i = 0; i < weapons.length; i++) {
      if (weapons[i].equipped) {
        var def = WEAPONS.find(function (w) { return w.id === weapons[i].id; });
        if (def) return def;
      }
    }
    // Fallback: use first weapon in inventory if any exist
    if (weapons.length > 0) {
      var def = WEAPONS.find(function (w) { return w.id === weapons[0].id; });
      if (def) return def;
    }
    return WEAPONS[0]; // fists
  }

  /**
   * Aggregate all equipped gear bonuses into a single object.
   * @param {object} game - The game state.
   * @returns {object} Aggregated bonuses.
   */
  function getGearBonuses(game) {
    var bonuses = {
      defenseBonus: 0,
      stealthPenalty: 0,
      stealthBonus: 0,
      runBonus: 0,
      bluffBonus: 0,
      scannerBonus: false,
    };

    var gear = game.inventory.gear || [];
    for (var i = 0; i < gear.length; i++) {
      var def = GEAR.find(function (g) { return g.id === gear[i].id; });
      if (def) {
        bonuses.defenseBonus += def.defenseBonus || 0;
        bonuses.stealthPenalty += def.stealthPenalty || 0;
        bonuses.stealthBonus += def.stealthBonus || 0;
        bonuses.runBonus += def.runBonus || 0;
        bonuses.bluffBonus += (def.bluffBonus || 0);
        if (def.scannerBonus) bonuses.scannerBonus = true;
      }
    }

    return bonuses;
  }

  /**
   * Get the player's overall combat power rating.
   * @param {object} game - The game state.
   * @returns {number} Combat power value.
   */
  function getPlayerCombatPower(game) {
    var Core = window.Core;
    var intimMod = Core.getStatModifier(game, 'intimidation');
    var weapon = getEquippedWeapon(game);
    var crewBonus = getCrewMuscleBonus(game);

    return intimMod * 10 + weapon.damage + weapon.intimidation + crewBonus;
  }

  // ---------------------------------------------------------------------------
  // Crew Helpers (internal)
  // ---------------------------------------------------------------------------

  /** Sum muscle bonus from crew members with a 'muscle' or 'enforcer' role. */
  function getCrewMuscleBonus(game) {
    var crew = game.crew || [];
    var bonus = 0;
    for (var i = 0; i < crew.length; i++) {
      var m = crew[i];
      if (m.role === 'muscle' || m.role === 'enforcer') {
        bonus += (m.combatBonus || m.level || 1) * 2;
      }
    }
    return bonus;
  }

  /** Sum driver bonus from crew members with a 'driver' role. */
  function getCrewDriverBonus(game) {
    var crew = game.crew || [];
    var bonus = 0;
    for (var i = 0; i < crew.length; i++) {
      if (crew[i].role === 'driver') {
        bonus += (crew[i].driveBonus || crew[i].level || 1) * 3;
      }
    }
    return bonus;
  }

  // ---------------------------------------------------------------------------
  // Chance Calculations
  // ---------------------------------------------------------------------------

  /**
   * Calculate the chance of winning a fight.
   * base 40% + (intimidation modifier * 20) + (weapon.damage * 3) +
   * (weapon.intimidation * 2) + crew muscle bonus - (enemy.strength * 5).
   * Clamped 5-95%.
   *
   * @param {object} game  - The game state.
   * @param {object} enemy - Enemy stats { strength, speed, greed, intelligence, bribeCost }.
   * @returns {number} Percentage chance (5-95).
   */
  function calculateFightChance(game, enemy) {
    var Core = window.Core;
    var intimMod = Core.getStatModifier(game, 'intimidation');
    var weapon = getEquippedWeapon(game);
    var crewBonus = getCrewMuscleBonus(game);

    var chance = 40
      + (intimMod * 20)
      + (weapon.damage * 3)
      + (weapon.intimidation * 2)
      + crewBonus
      - (enemy.strength * 5);

    return clamp(Math.round(chance), 5, 95);
  }

  /**
   * Calculate the chance of successfully running.
   * base 50% + (stealth modifier * 20) + gear run bonus * 3 +
   * driver crew bonus - (enemy.speed * 5). Clamped 5-95%.
   *
   * @param {object} game  - The game state.
   * @param {object} enemy - Enemy stats.
   * @returns {number} Percentage chance (5-95).
   */
  function calculateRunChance(game, enemy) {
    var Core = window.Core;
    var stealthMod = Core.getStatModifier(game, 'stealth');
    var gearBonuses = getGearBonuses(game);
    var driverBonus = getCrewDriverBonus(game);

    var chance = 50
      + (stealthMod * 20)
      + (gearBonuses.runBonus * 3)
      + driverBonus
      - (enemy.speed * 5);

    return clamp(Math.round(chance), 5, 95);
  }

  /**
   * Calculate the chance of a successful bribe.
   * base 30% + (charisma modifier * 15) + (amount / enemy.bribeCost * 40)
   * - (100 - enemy.greed). Clamped 5-95%.
   *
   * @param {object} game    - The game state.
   * @param {object} enemy   - Enemy stats.
   * @param {number} amount  - Dollar amount offered.
   * @returns {number} Percentage chance (5-95).
   */
  function calculateBribeChance(game, enemy, amount) {
    var Core = window.Core;
    var charismaMod = Core.getStatModifier(game, 'charisma');
    var bribeCost = enemy.bribeCost || 1000;

    var chance = 30
      + (charismaMod * 15)
      + ((amount / bribeCost) * 40)
      - (100 - enemy.greed);

    return clamp(Math.round(chance), 5, 95);
  }

  /**
   * Calculate the chance of bluffing past an encounter.
   * base 25% + (streetSmarts modifier * 15) + (charisma modifier * 10)
   * + gear bluff bonuses - (enemy.intelligence * 5). Clamped 5-95%.
   *
   * @param {object} game  - The game state.
   * @param {object} enemy - Enemy stats.
   * @returns {number} Percentage chance (5-95).
   */
  function calculateBluffChance(game, enemy) {
    var Core = window.Core;
    var smartsMod = Core.getStatModifier(game, 'streetSmarts');
    var charismaMod = Core.getStatModifier(game, 'charisma');
    var gearBonuses = getGearBonuses(game);

    var chance = 25
      + (smartsMod * 15)
      + (charismaMod * 10)
      + (gearBonuses.bluffBonus * 3)
      - (enemy.intelligence * 5);

    return clamp(Math.round(chance), 5, 95);
  }

  // ---------------------------------------------------------------------------
  // Encounter Generation
  // ---------------------------------------------------------------------------

  /**
   * Generate an encounter based on current game context.
   *
   * @param {object} game    - The game state.
   * @param {string} trigger - One of: "travel", "location", "heat", "debt",
   *                           "territory", "story".
   * @returns {object|null}  - Encounter object or null if no encounter fires.
   */
  function generateEncounter(game, trigger) {
    var type = determineEncounterType(game, trigger);
    if (!type) return null;

    var template = ENCOUNTER_TYPES[type];
    var enemy = buildEnemy(type, template, game);
    var narrativeSet = NARRATIVES[type];
    var intro = '';

    // Random encounters have a special positive/negative split
    if (type === 'random_encounter') {
      var isPositive = Math.random() < 0.5;
      intro = pick(isPositive ? narrativeSet.positive : narrativeSet.negative);
      return {
        type: type,
        title: isPositive ? 'Lucky Break' : 'Bad Luck',
        description: intro,
        isPositive: isPositive,
        enemy: enemy,
        options: isPositive
          ? [{ action: 'collect', label: 'Collect the spoils', chance: 100, cost: 0 }]
          : buildEncounterOptions(game, enemy, type),
      };
    }

    intro = pick(narrativeSet.intro);

    return {
      type: type,
      title: template.title,
      description: intro,
      enemy: enemy,
      options: buildEncounterOptions(game, enemy, type),
    };
  }

  /** Determine which encounter type to spawn based on trigger and context. */
  function determineEncounterType(game, trigger) {
    var cityHeat = game.heat.cities[game.world.currentCity] || 0;
    var heat = cityHeat + (game.heat.federal || 0);

    switch (trigger) {
      case 'heat':
        if (heat > 70) return Math.random() < 0.4 ? 'dea_raid' : 'police_bust';
        if (heat > 40) return 'police_bust';
        return Math.random() < 0.3 ? 'police_bust' : null;

      case 'debt':
        return 'shark_goons';

      case 'territory':
        return 'rival_dealer';

      case 'travel':
        var r = Math.random();
        if (heat > 50 && r < 0.3) return 'police_bust';
        if (r < 0.15) return 'mugging';
        if (r < 0.25) return 'random_encounter';
        return null;

      case 'location':
        var r2 = Math.random();
        if (r2 < 0.1) return 'mugging';
        if (r2 < 0.2) return 'rival_dealer';
        if (r2 < 0.3) return 'random_encounter';
        return null;

      case 'story':
        return 'crew_betrayal';

      default:
        var r3 = Math.random();
        if (heat > 60 && r3 < 0.25) return 'police_bust';
        if (r3 < 0.1) return 'mugging';
        if (r3 < 0.2) return 'random_encounter';
        if (r3 < 0.25) return 'rival_dealer';
        return null;
    }
  }

  /** Build an enemy object from encounter type template. */
  function buildEnemy(type, template, game) {
    var enemy = {
      name: getEnemyName(type),
      strength: template.strength,
      speed: template.speed,
      greed: template.greed,
      intelligence: template.intelligence,
      bribeCost: template.bribeCost,
      loot: {},
    };

    // Robbery targets are dynamically generated
    if (type === 'robbery') {
      enemy.strength = randInt(3, 7);
      enemy.speed = randInt(3, 6);
      enemy.greed = randInt(4, 8);
      enemy.intelligence = randInt(2, 5);
      enemy.bribeCost = 0;
      var lootMultiplier = enemy.strength;
      enemy.loot = {
        cash: randInt(500, 2000) * lootMultiplier,
        product: randInt(5, 20) * lootMultiplier,
      };
    }

    // Shark goons bribe cost = partial debt payment
    if (type === 'shark_goons') {
      enemy.bribeCost = Math.max(500, Math.floor((game.resources.debt || 0) * 0.2));
    }

    // Scale difficulty with player level
    var level = game.character.level || 1;
    if (level > 5) {
      enemy.strength = Math.min(10, enemy.strength + Math.floor((level - 5) / 3));
    }

    return enemy;
  }

  /** Get a contextual name for the enemy type. */
  function getEnemyName(type) {
    var names = {
      police_bust:    ['Officer Martinez', 'Sergeant Brooks', 'Detective Walsh', 'Officer Chen'],
      dea_raid:       ['Agent Crawford', 'Agent Nguyen', 'Special Agent Torres', 'Agent Blackwell'],
      mugging:        ['Street Thug', 'Desperate Junkie', 'Local Goon', 'Alley Rat'],
      rival_dealer:   ['Rico "Ice" Mendez', 'T-Bone Jackson', 'Little Mike', 'Viper'],
      shark_goons:    ['Big Tony', 'Knuckles McGee', 'The Hammer', 'Sal "Breaks" Moretti'],
      robbery:        ['Corner Boy', 'Small-Time Dealer', 'Stash House Runner', 'Street Hustler'],
      crew_betrayal:  ['Your Lieutenant', 'Trusted Runner', 'Right-Hand Man', 'Inner Circle Member'],
      random_encounter: ['Unknown'],
    };
    return pick(names[type] || ['Unknown']);
  }

  /** Build the available action options for an encounter. */
  function buildEncounterOptions(game, enemy, type) {
    var options = [];

    // Fight is always available
    options.push({
      action: 'fight',
      label: 'Fight',
      chance: calculateFightChance(game, enemy),
      cost: 0,
    });

    // Run is always available (except robbery - you initiated it; gets "abort" instead)
    if (type !== 'robbery') {
      options.push({
        action: 'run',
        label: 'Run',
        chance: calculateRunChance(game, enemy),
        cost: 0,
      });
    }

    // Bribe depends on the encounter type having a cost
    if (enemy.bribeCost > 0 || type === 'shark_goons') {
      var bribeCost = enemy.bribeCost || 1000;
      options.push({
        action: 'bribe',
        label: 'Bribe ($' + bribeCost.toLocaleString() + ')',
        chance: calculateBribeChance(game, enemy, bribeCost),
        cost: bribeCost,
      });
    }

    // Bluff available on most encounter types
    if (type !== 'random_encounter') {
      options.push({
        action: 'bluff',
        label: 'Bluff',
        chance: calculateBluffChance(game, enemy),
        cost: 0,
      });
    }

    // Robbery gets a special "abort" option instead of run
    if (type === 'robbery') {
      options.push({
        action: 'run',
        label: 'Abort',
        chance: calculateRunChance(game, enemy),
        cost: 0,
      });
    }

    return options;
  }

  // ---------------------------------------------------------------------------
  // Encounter Resolution
  // ---------------------------------------------------------------------------

  /**
   * Resolve an encounter by rolling against the chosen action's chance.
   *
   * @param {object} game          - The game state (will be mutated).
   * @param {object} encounter     - Encounter object from generateEncounter.
   * @param {string} chosenAction  - "fight", "run", "bribe", "bluff", or "collect".
   * @returns {object} { success, narrative, consequences }
   */
  function resolveEncounter(game, encounter, chosenAction) {
    var type = encounter.type;
    var enemy = encounter.enemy;

    // Handle positive random encounters
    if (type === 'random_encounter' && encounter.isPositive && chosenAction === 'collect') {
      return resolvePositiveRandom(game);
    }

    // Find the chosen option for its chance value
    var option = null;
    for (var i = 0; i < encounter.options.length; i++) {
      if (encounter.options[i].action === chosenAction) {
        option = encounter.options[i];
        break;
      }
    }

    if (!option) {
      return {
        success: false,
        narrative: 'You hesitate too long and the situation spirals out of control.',
        consequences: applyLossConsequences(game, type, enemy),
      };
    }

    var success = roll(option.chance);
    var narrative = getNarrative(type, chosenAction, success);
    var consequences;

    if (success) {
      consequences = applyWinConsequences(game, type, enemy, chosenAction, option.cost);
    } else {
      consequences = applyLossConsequences(game, type, enemy);
    }

    return {
      success: success,
      narrative: narrative,
      consequences: consequences,
    };
  }

  /** Get a narrative string for the given encounter outcome. */
  function getNarrative(type, action, success) {
    var narrativeSet = NARRATIVES[type];
    if (!narrativeSet) return success ? 'You prevailed.' : 'Things did not go your way.';

    var key = action + '_' + (success ? 'success' : 'fail');
    var variants = narrativeSet[key];
    if (variants && variants.length > 0) {
      return pick(variants);
    }

    return success
      ? 'You managed to come out on top this time.'
      : 'The situation went badly and you paid the price.';
  }

  /** Resolve a positive random encounter. */
  function resolvePositiveRandom(game) {
    var cashFound = randInt(200, 2000);
    var xpGained = randInt(10, 50);

    game.resources.cash += cashFound;

    return {
      success: true,
      narrative: pick(NARRATIVES.random_encounter.positive),
      consequences: {
        healthChange: 0,
        cashChange: cashFound,
        itemsGained: [],
        itemsLost: [],
        heatChange: 0,
        xpGained: xpGained,
        karmaChange: 0,
      },
    };
  }

  /** Apply consequences when the player wins an encounter. */
  function applyWinConsequences(game, type, enemy, action, actionCost) {
    var consequences = {
      healthChange: 0,
      cashChange: 0,
      itemsGained: [],
      itemsLost: [],
      heatChange: 0,
      xpGained: 0,
      karmaChange: 0,
    };

    // Deduct bribe cost
    if (action === 'bribe' && actionCost > 0) {
      game.resources.cash -= actionCost;
      consequences.cashChange -= actionCost;
    }

    // XP for winning
    var baseXP = { fight: 50, run: 20, bribe: 15, bluff: 30 };
    consequences.xpGained = (baseXP[action] || 25) + randInt(5, 20);

    switch (type) {
      case 'police_bust':
        consequences.heatChange = -5;
        applyHeatChange(game, -5);
        break;

      case 'dea_raid':
        consequences.heatChange = -10;
        applyHeatChange(game, -10);
        consequences.xpGained += 50;
        break;

      case 'mugging':
        break;

      case 'rival_dealer':
        var stolenCash = randInt(500, 3000);
        game.resources.cash += stolenCash;
        consequences.cashChange += stolenCash;
        consequences.itemsGained.push('Rival\'s stash');
        consequences.heatChange = 5;
        applyHeatChange(game, 5);
        break;

      case 'shark_goons':
        if (action === 'bribe') {
          game.resources.debt = Math.max(0, (game.resources.debt || 0) - actionCost);
        }
        break;

      case 'robbery':
        var lootCash = (enemy.loot && enemy.loot.cash) || randInt(1000, 5000);
        game.resources.cash += lootCash;
        consequences.cashChange += lootCash;
        consequences.itemsGained.push('Stolen goods');
        consequences.heatChange = 10;
        consequences.karmaChange = -5;
        applyHeatChange(game, 10);
        break;

      case 'crew_betrayal':
        consequences.xpGained += 30;
        break;

      case 'random_encounter':
        consequences.heatChange = 5;
        applyHeatChange(game, 5);
        break;
    }

    // Fighting always carries some health risk even on success
    if (action === 'fight') {
      var dmgTaken = randInt(3, 12);
      game.character.health = Math.max(1, game.character.health - dmgTaken);
      consequences.healthChange = -dmgTaken;
      consequences.heatChange += 5;
      applyHeatChange(game, 5);
    }

    return consequences;
  }

  /** Apply consequences when the player loses an encounter. */
  function applyLossConsequences(game, type, enemy) {
    var consequences = {
      healthChange: 0,
      cashChange: 0,
      itemsGained: [],
      itemsLost: [],
      heatChange: 0,
      xpGained: 5, // small consolation XP
      karmaChange: 0,
    };

    var healthLost, cashLost, lossPercent, lostDrugs;

    switch (type) {
      case 'police_bust':
        // Lose 30-60% of product, $1K-5K cash, 15-25 health, +20 heat
        healthLost = randInt(15, 25);
        cashLost = Math.min(game.resources.cash, randInt(1000, 5000));
        game.character.health = Math.max(1, game.character.health - healthLost);
        game.resources.cash -= cashLost;
        consequences.healthChange = -healthLost;
        consequences.cashChange = -cashLost;
        consequences.heatChange = 20;
        applyHeatChange(game, 20);
        lossPercent = randInt(30, 60) / 100;
        lostDrugs = loseDrugInventory(game, lossPercent);
        consequences.itemsLost = lostDrugs;
        break;

      case 'dea_raid':
        // Lose ALL product, 50% cash, 30 health, +40 heat
        healthLost = 30;
        cashLost = Math.floor(game.resources.cash * 0.5);
        game.character.health = Math.max(1, game.character.health - healthLost);
        game.resources.cash -= cashLost;
        consequences.healthChange = -healthLost;
        consequences.cashChange = -cashLost;
        consequences.heatChange = 40;
        applyHeatChange(game, 40);
        lostDrugs = loseDrugInventory(game, 1.0);
        consequences.itemsLost = lostDrugs;
        break;

      case 'mugging':
        // Lose 10-30% cash, 10-20 health
        healthLost = randInt(10, 20);
        lossPercent = randInt(10, 30) / 100;
        cashLost = Math.floor(game.resources.cash * lossPercent);
        game.character.health = Math.max(1, game.character.health - healthLost);
        game.resources.cash -= cashLost;
        consequences.healthChange = -healthLost;
        consequences.cashChange = -cashLost;
        break;

      case 'rival_dealer':
        // Lose product + turf reputation
        healthLost = randInt(10, 25);
        game.character.health = Math.max(1, game.character.health - healthLost);
        consequences.healthChange = -healthLost;
        lostDrugs = loseDrugInventory(game, randInt(30, 60) / 100);
        consequences.itemsLost = lostDrugs;
        consequences.heatChange = 5;
        applyHeatChange(game, 5);
        break;

      case 'shark_goons':
        // Brutal beating + take cash
        healthLost = randInt(20, 35);
        cashLost = Math.min(game.resources.cash, randInt(1000, 5000));
        game.character.health = Math.max(1, game.character.health - healthLost);
        game.resources.cash -= cashLost;
        consequences.healthChange = -healthLost;
        consequences.cashChange = -cashLost;
        break;

      case 'robbery':
        // Failed robbery - take damage, get nothing
        healthLost = randInt(15, 30);
        game.character.health = Math.max(1, game.character.health - healthLost);
        consequences.healthChange = -healthLost;
        consequences.heatChange = 15;
        applyHeatChange(game, 15);
        break;

      case 'crew_betrayal':
        // Traitor takes product and some cash
        healthLost = randInt(10, 20);
        cashLost = Math.min(game.resources.cash, randInt(500, 3000));
        game.character.health = Math.max(1, game.character.health - healthLost);
        game.resources.cash -= cashLost;
        consequences.healthChange = -healthLost;
        consequences.cashChange = -cashLost;
        lostDrugs = loseDrugInventory(game, randInt(20, 50) / 100);
        consequences.itemsLost = lostDrugs;
        consequences.karmaChange = -3;
        break;

      case 'random_encounter':
        // Minor negative consequences
        healthLost = randInt(5, 15);
        game.character.health = Math.max(1, game.character.health - healthLost);
        consequences.healthChange = -healthLost;
        consequences.heatChange = 5;
        applyHeatChange(game, 5);
        break;
    }

    return consequences;
  }

  /** Remove a percentage of the player's drug inventory. Returns lost item descriptions. */
  function loseDrugInventory(game, percent) {
    var lost = [];
    var drugs = game.inventory.drugs;
    for (var drug in drugs) {
      if (drugs.hasOwnProperty(drug) && drugs[drug] > 0) {
        var amountLost = Math.ceil(drugs[drug] * percent);
        if (amountLost > 0) {
          drugs[drug] = Math.max(0, drugs[drug] - amountLost);
          lost.push(amountLost + 'x ' + drug);
        }
      }
    }
    return lost;
  }

  /** Apply a heat change to the current city and (partially) to federal heat. */
  function applyHeatChange(game, amount) {
    var city = game.world.currentCity;
    if (!game.heat.cities[city]) game.heat.cities[city] = 0;
    game.heat.cities[city] = clamp(game.heat.cities[city] + amount, 0, 100);

    // Federal heat increases at half rate
    if (amount > 0) {
      game.heat.federal = clamp((game.heat.federal || 0) + Math.floor(amount / 2), 0, 100);
    }
  }

  // ---------------------------------------------------------------------------
  // Chase Mini-Game
  // ---------------------------------------------------------------------------

  /**
   * Run a cop chase mini-game. 3 rounds, each with a directional choice.
   * Each choice has random outcome modified by stealth + driver crew bonus.
   *
   * @param {object} game - The game state (will be mutated).
   * @returns {object} { escaped, rounds, healthLost, itemsLost }
   */
  function runChase(game) {
    var Core = window.Core;
    var stealthMod = Core.getStatModifier(game, 'stealth');
    var gearBonuses = getGearBonuses(game);
    var driverBonus = getCrewDriverBonus(game);

    var baseEscapeChance = 40 + (stealthMod * 10) + (gearBonuses.runBonus * 3) + driverBonus;
    if (gearBonuses.scannerBonus) baseEscapeChance += 10;

    var rounds = [];
    var totalHealthLost = 0;
    var itemsLost = [];
    var heatGained = 0;
    var escaped = false;

    var chaseNarratives = {
      left: {
        success: [
          'You wrench the wheel left, tires screaming through a narrow alley. The cruiser clips a dumpster and falls behind.',
          'A hard left through a construction zone throws up a wall of dust. The pursuing officers lose visual and you gain precious seconds.',
          'You cut left through a gas station lot, threading between pumps at insane speed. The cops hesitate and you widen the gap.',
        ],
        fail: [
          'You swing left but a delivery truck blocks the alley. Slamming the brakes, you lose valuable ground as the cruiser closes in.',
          'The left turn leads to a dead-end loading dock. You reverse frantically but the cops are already at the entrance.',
          'You cut left but the road is torn up for construction. Your undercarriage scrapes asphalt and the car bogs down.',
        ],
      },
      right: {
        success: [
          'A sharp right sends you barreling down a one-way street the wrong direction. Oncoming traffic scatters and the cruisers dare not follow.',
          'You hook right through an open parking garage, spiraling up three levels and out the other side. The cops go straight and lose you.',
          'The right turn takes you through a residential maze of identical streets. You kill your lights and coast to a stop behind a parked moving truck.',
        ],
        fail: [
          'You swerve right but a red light sends cross traffic into your path. You brake hard and the cruiser nearly rear-ends you.',
          'The right turn opens onto a broad boulevard with no cover. The helicopter spotlight finds you instantly.',
          'You cut right but spike strips are already laid across the intersection. Your front tires blow and the car shudders to a crawl.',
        ],
      },
      straight: {
        success: [
          'You floor it straight ahead, engine roaring. Your car has more under the hood than the standard-issue cruiser and you pull away steadily.',
          'You blast through a yellow light that turns red. Three cruisers stack up at the intersection as cross traffic seals them off.',
          'Straight through the tunnel at 90 miles per hour, you emerge on the other side and take the first exit. The cops fly past overhead on the bridge.',
        ],
        fail: [
          'You gun it straight but the road ahead is gridlocked with evening traffic. You are boxed in with nowhere to go.',
          'Full speed ahead until a spike strip shreds your rear tire. The car fishtails wildly and you crash into a parked van.',
          'You try to outrun them on the straightaway but a second unit pulls out from a side street directly in your path.',
        ],
      },
    };

    var directions = ['left', 'right', 'straight'];

    for (var round = 0; round < 3; round++) {
      // Pick a random direction (in a real UI the player would choose)
      var direction = directions[randInt(0, 2)];
      var roundChance = baseEscapeChance + randInt(-10, 10) - (round * 5);
      roundChance = clamp(roundChance, 10, 90);

      var success = roll(roundChance);
      var narrativeSet = chaseNarratives[direction];
      var narrative = pick(success ? narrativeSet.success : narrativeSet.fail);

      rounds.push({
        round: round + 1,
        direction: direction,
        success: success,
        narrative: narrative,
      });

      if (success) {
        escaped = true;
        break;
      } else {
        var dmg = randInt(3, 8);
        totalHealthLost += dmg;
        game.character.health = Math.max(1, game.character.health - dmg);
        heatGained += 5;
      }
    }

    // If all 3 rounds failed, one final check
    if (!escaped) {
      var finalChance = baseEscapeChance - 20;
      escaped = roll(clamp(finalChance, 5, 50));

      if (!escaped) {
        var lostDrugs = loseDrugInventory(game, randInt(20, 50) / 100);
        itemsLost = lostDrugs;
        var cashLost = Math.min(game.resources.cash, randInt(500, 3000));
        game.resources.cash -= cashLost;
        heatGained += 15;
        rounds.push({
          round: 4,
          direction: 'caught',
          success: false,
          narrative: 'The cruisers box you in from all sides. Officers swarm the car, weapons drawn. There is nowhere left to run.',
        });
      } else {
        rounds.push({
          round: 4,
          direction: 'final_escape',
          success: true,
          narrative: 'By some miracle, you find a gap in the blockade and squeeze through. Battered and breathless, you disappear into the city\'s sprawl.',
        });
      }
    }

    applyHeatChange(game, heatGained);

    return {
      escaped: escaped,
      rounds: rounds,
      healthLost: totalHealthLost,
      itemsLost: itemsLost,
    };
  }

  // ---------------------------------------------------------------------------
  // Shop Functions
  // ---------------------------------------------------------------------------

  /**
   * Purchase a weapon and auto-equip it.
   * @param {object} game       - The game state.
   * @param {string} weaponId   - ID of the weapon to buy.
   * @returns {object} { success, message }
   */
  function buyWeapon(game, weaponId) {
    var weaponDef = WEAPONS.find(function (w) { return w.id === weaponId; });
    if (!weaponDef) {
      return { success: false, message: 'Unknown weapon.' };
    }
    if (weaponDef.cost === 0) {
      return { success: false, message: 'You already have fists.' };
    }

    var owned = game.inventory.weapons.some(function (w) { return w.id === weaponId; });
    if (owned) {
      return { success: false, message: 'You already own a ' + weaponDef.name + '.' };
    }

    if (game.resources.cash < weaponDef.cost) {
      return { success: false, message: 'Not enough cash. Need $' + weaponDef.cost.toLocaleString() + '.' };
    }

    game.resources.cash -= weaponDef.cost;

    // Unequip all existing weapons
    for (var i = 0; i < game.inventory.weapons.length; i++) {
      game.inventory.weapons[i].equipped = false;
    }

    // Add and equip the new weapon
    game.inventory.weapons.push({
      id: weaponDef.id,
      name: weaponDef.name,
      equipped: true,
      value: weaponDef.cost,
    });

    return {
      success: true,
      message: 'Purchased and equipped ' + weaponDef.name + ' for $' + weaponDef.cost.toLocaleString() + '.',
    };
  }

  /**
   * Purchase gear and add it to inventory.
   * @param {object} game    - The game state.
   * @param {string} gearId  - ID of the gear to buy.
   * @returns {object} { success, message }
   */
  function buyGear(game, gearId) {
    var gearDef = GEAR.find(function (g) { return g.id === gearId; });
    if (!gearDef) {
      return { success: false, message: 'Unknown gear.' };
    }

    var owned = game.inventory.gear.some(function (g) { return g.id === gearId; });
    if (owned) {
      return { success: false, message: 'You already own a ' + gearDef.name + '.' };
    }

    if (game.resources.cash < gearDef.cost) {
      return { success: false, message: 'Not enough cash. Need $' + gearDef.cost.toLocaleString() + '.' };
    }

    game.resources.cash -= gearDef.cost;
    game.inventory.gear.push({
      id: gearDef.id,
      name: gearDef.name,
      value: gearDef.cost,
    });

    return {
      success: true,
      message: 'Purchased ' + gearDef.name + ' for $' + gearDef.cost.toLocaleString() + '.',
    };
  }

  /**
   * Get weapons available for purchase (not already owned).
   * @param {object} game - The game state.
   * @returns {Array} Weapon definitions the player can buy.
   */
  function getAvailableWeapons(game) {
    var ownedIds = {};
    var weapons = game.inventory.weapons || [];
    for (var i = 0; i < weapons.length; i++) {
      ownedIds[weapons[i].id] = true;
    }
    return WEAPONS.filter(function (w) {
      return w.cost > 0 && !ownedIds[w.id];
    });
  }

  /**
   * Get gear available for purchase (not already owned).
   * @param {object} game - The game state.
   * @returns {Array} Gear definitions the player can buy.
   */
  function getAvailableGear(game) {
    var ownedIds = {};
    var gear = game.inventory.gear || [];
    for (var i = 0; i < gear.length; i++) {
      ownedIds[gear[i].id] = true;
    }
    return GEAR.filter(function (g) {
      return !ownedIds[g.id];
    });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.Combat = {
    // Data
    WEAPONS: WEAPONS,
    GEAR: GEAR,
    ENCOUNTER_TYPES: ENCOUNTER_TYPES,

    // Equipment helpers
    getEquippedWeapon: getEquippedWeapon,
    getGearBonuses: getGearBonuses,
    getPlayerCombatPower: getPlayerCombatPower,

    // Chance calculations
    calculateFightChance: calculateFightChance,
    calculateRunChance: calculateRunChance,
    calculateBribeChance: calculateBribeChance,
    calculateBluffChance: calculateBluffChance,

    // Encounter lifecycle
    generateEncounter: generateEncounter,
    resolveEncounter: resolveEncounter,

    // Chase mini-game
    runChase: runChase,

    // Shop
    buyWeapon: buyWeapon,
    buyGear: buyGear,
    getAvailableWeapons: getAvailableWeapons,
    getAvailableGear: getAvailableGear,
  };

})();

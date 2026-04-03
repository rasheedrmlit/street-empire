/**
 * Street Empire - NPC & Crew System
 * ====================================
 * Manages all non-player characters, crew recruitment, loyalty mechanics,
 * dialogue trees, rival dealers, and NPC interactions.
 *
 * Depends on: window.Core
 * Exports: window.NPCs
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Crew Member Definitions
  // ---------------------------------------------------------------------------

  const CREW_MEMBERS = {
    // --- LOOKOUTS ---
    shadow: {
      id: 'shadow',
      name: 'Marcus Williams',
      nickname: 'Shadow',
      fullName: "Marcus 'Shadow' Williams",
      role: 'lookout',
      city: 'Detroit',
      personality: 'Patient and perceptive. Grew up watching every corner in the D. Never talks much, but nothing escapes his notice.',
      stats: { combat: 3, stealth: 9, loyalty: 55, skill: 8 },
      dailyWage: 200,
      recruitCost: 1500,
      loyalty: 55,
      alive: true,
      specialAbility: 'Ghost Protocol - Can make you vanish from a location instantly, avoiding any encounter.',
    },
    pigeon: {
      id: 'pigeon',
      name: 'Tommy Nguyen',
      nickname: 'Pigeon',
      fullName: "Tommy 'Pigeon' Nguyen",
      role: 'lookout',
      city: 'Seattle',
      personality: 'Nervous energy, always fidgeting, but his eyes are everywhere. Runs a network of street kids who feed him intel.',
      stats: { combat: 2, stealth: 7, loyalty: 60, skill: 9 },
      dailyWage: 200,
      recruitCost: 1200,
      loyalty: 60,
      alive: true,
      specialAbility: 'Street Network - Gets advance warning of police movements in the current city.',
    },
    whisper: {
      id: 'whisper',
      name: 'Diana Okafor',
      nickname: 'Whisper',
      fullName: "Diana 'Whisper' Okafor",
      role: 'lookout',
      city: 'Atlanta',
      personality: 'Quiet as a church mouse but sharp as a scalpel. Former intelligence analyst who fell on hard times.',
      stats: { combat: 2, stealth: 10, loyalty: 50, skill: 9 },
      dailyWage: 250,
      recruitCost: 2000,
      loyalty: 50,
      alive: true,
      specialAbility: 'Signal Intercept - Can tap into police scanner frequencies, reducing ambush chance by an extra 15%.',
    },

    // --- DRIVERS ---
    nitro: {
      id: 'nitro',
      name: 'Dante Reeves',
      nickname: 'Nitro',
      fullName: "Dante 'Nitro' Reeves",
      role: 'driver',
      city: 'Atlanta',
      personality: 'Lives for speed. Raced stock cars before a DUI ended his career. Treats every drive like the Daytona 500.',
      stats: { combat: 4, stealth: 5, loyalty: 50, skill: 10 },
      dailyWage: 300,
      recruitCost: 2000,
      loyalty: 50,
      alive: true,
      specialAbility: 'Burnout - Guaranteed escape from any vehicle chase once per day.',
    },
    abuela: {
      id: 'abuela',
      name: 'Maria Santos',
      nickname: 'Abuela',
      fullName: "Maria 'Abuela' Santos",
      role: 'driver',
      city: 'Miami',
      personality: 'A 58-year-old grandmother who drives like she stole it. Her minivan is the last vehicle cops suspect.',
      stats: { combat: 1, stealth: 8, loyalty: 65, skill: 8 },
      dailyWage: 250,
      recruitCost: 1500,
      loyalty: 65,
      alive: true,
      specialAbility: 'Hidden Compartments - Can smuggle extra product during travel, increasing carry capacity by 20.',
    },
    switchback: {
      id: 'switchback',
      name: 'Jamal Price',
      nickname: 'Switchback',
      fullName: "Jamal 'Switchback' Price",
      role: 'driver',
      city: 'Chicago',
      personality: 'Former bike messenger who knows every alley and back road in America. Calm under pressure, never panics.',
      stats: { combat: 3, stealth: 7, loyalty: 55, skill: 9 },
      dailyWage: 300,
      recruitCost: 1800,
      loyalty: 55,
      alive: true,
      specialAbility: 'Shortcut King - Travel between cities costs 30% less cash.',
    },

    // --- MUSCLE ---
    laloca: {
      id: 'laloca',
      name: 'Rosa Mendez',
      nickname: 'La Loca',
      fullName: "Rosa 'La Loca' Mendez",
      role: 'muscle',
      city: 'Miami',
      personality: 'Cartel-trained and fearless. Her reputation precedes her. Most problems resolve themselves when she walks in the room.',
      stats: { combat: 10, stealth: 3, loyalty: 45, skill: 7 },
      dailyWage: 400,
      recruitCost: 3000,
      loyalty: 45,
      alive: true,
      specialAbility: 'Intimidation Aura - Enemies think twice before engaging. 40% chance rivals back down without a fight.',
    },
    brick: {
      id: 'brick',
      name: 'Deshawn Carter',
      nickname: 'Brick',
      fullName: "Deshawn 'Brick' Carter",
      role: 'muscle',
      city: 'New York',
      personality: 'Built like a freight train, gentle as a kitten until provoked. Loyal to a fault but not the sharpest tool.',
      stats: { combat: 9, stealth: 2, loyalty: 70, skill: 4 },
      dailyWage: 350,
      recruitCost: 2000,
      loyalty: 70,
      alive: true,
      specialAbility: 'Human Shield - Takes damage instead of you in combat. Reduces your damage taken by 50%.',
    },
    viper: {
      id: 'viper',
      name: 'Alexei Volkov',
      nickname: 'Viper',
      fullName: "Alexei 'Viper' Volkov",
      role: 'muscle',
      city: 'New York',
      personality: 'Ex-Bratva enforcer. Quiet, methodical, and terrifying. Does not make threats. Makes promises.',
      stats: { combat: 10, stealth: 6, loyalty: 35, skill: 8 },
      dailyWage: 500,
      recruitCost: 4000,
      loyalty: 35,
      alive: true,
      specialAbility: 'Cold Blooded - +5 combat power instead of +3. Enemies suffer a morale penalty.',
    },
    tigre: {
      id: 'tigre',
      name: 'Hector Ruiz',
      nickname: 'El Tigre',
      fullName: "Hector 'El Tigre' Ruiz",
      role: 'muscle',
      city: 'Houston',
      personality: 'Former boxer with hands like cinder blocks. Fights clean when he can, dirty when he has to.',
      stats: { combat: 8, stealth: 4, loyalty: 55, skill: 6 },
      dailyWage: 350,
      recruitCost: 2200,
      loyalty: 55,
      alive: true,
      specialAbility: 'Knockout Artist - 25% chance to end any fight in one hit.',
    },

    // --- COOKS ---
    professor: {
      id: 'professor',
      name: 'Eugene Park',
      nickname: 'The Professor',
      fullName: "Eugene 'The Professor' Park",
      role: 'cook',
      city: 'Seattle',
      personality: 'PhD in organic chemistry, crushed by student debt. Treats cooking like an art form. Insufferably precise.',
      stats: { combat: 1, stealth: 4, loyalty: 50, skill: 10 },
      dailyWage: 500,
      recruitCost: 5000,
      loyalty: 50,
      alive: true,
      specialAbility: 'Pure Product - Cooked product sells for 20% more due to superior quality.',
    },
    patches: {
      id: 'patches',
      name: 'Linda Marsh',
      nickname: 'Patches',
      fullName: "Linda 'Patches' Marsh",
      role: 'cook',
      city: 'Detroit',
      personality: 'Former ER nurse who can make anything from anything. Practical, no-nonsense, and surprisingly maternal.',
      stats: { combat: 2, stealth: 5, loyalty: 60, skill: 8 },
      dailyWage: 450,
      recruitCost: 3500,
      loyalty: 60,
      alive: true,
      specialAbility: 'Field Medic - Can heal you for 25 HP once per day using improvised medical supplies.',
    },

    // --- DEALERS ---
    smooth: {
      id: 'smooth',
      name: 'Andre Washington',
      nickname: 'Smooth',
      fullName: "Andre 'Smooth' Washington",
      role: 'dealer',
      city: 'Atlanta',
      personality: 'Silver tongue and a thousand-watt smile. Could sell ice to a polar bear. Loves the hustle more than the money.',
      stats: { combat: 3, stealth: 5, loyalty: 50, skill: 9 },
      dailyWage: 350,
      recruitCost: 2500,
      loyalty: 50,
      alive: true,
      specialAbility: 'Gift of Gab - Passive income from territory is 30% higher.',
    },
    ghost: {
      id: 'ghost',
      name: 'Yuki Tanaka',
      nickname: 'Ghost',
      fullName: "Yuki 'Ghost' Tanaka",
      role: 'dealer',
      city: 'Seattle',
      personality: 'Operates entirely through dead drops and encrypted messages. No customer has ever seen her face.',
      stats: { combat: 2, stealth: 10, loyalty: 40, skill: 8 },
      dailyWage: 350,
      recruitCost: 3000,
      loyalty: 40,
      alive: true,
      specialAbility: 'Anonymous Sales - Dealing generates zero heat.',
    },
    preacher: {
      id: 'preacher',
      name: 'Terrence Odom',
      nickname: 'Preacher',
      fullName: "Terrence 'Preacher' Odom",
      role: 'dealer',
      city: 'Houston',
      personality: 'Talks like a Sunday sermon but moves product like a vending machine. His customers are fiercely loyal.',
      stats: { combat: 4, stealth: 4, loyalty: 65, skill: 7 },
      dailyWage: 300,
      recruitCost: 2000,
      loyalty: 65,
      alive: true,
      specialAbility: 'Congregation - Builds customer base twice as fast in any territory.',
    },
    duchess: {
      id: 'duchess',
      name: 'Camille Fontaine',
      nickname: 'Duchess',
      fullName: "Camille 'Duchess' Fontaine",
      role: 'dealer',
      city: 'New York',
      personality: 'Old money gone bad. Moves product through high-society circles. Champagne taste with a gutter hustle.',
      stats: { combat: 2, stealth: 6, loyalty: 40, skill: 9 },
      dailyWage: 400,
      recruitCost: 3500,
      loyalty: 40,
      alive: true,
      specialAbility: 'High Rollers - Access to VIP client list. Sells cocaine and ecstasy at 25% premium.',
    },
  };

  // ---------------------------------------------------------------------------
  // City Contacts
  // ---------------------------------------------------------------------------

  const CONTACTS = {
    carlos: {
      id: 'carlos',
      name: 'Carlos Reyes',
      nickname: null,
      fullName: 'Carlos Reyes',
      type: 'contact',
      city: 'Miami',
      role: 'Cartel Liaison',
      personality: 'Smooth as Cuban rum and twice as dangerous. Wears linen suits and a gold crucifix. Smiles when he threatens you.',
      relationship: 0,
      questLine: 'cocaine_pipeline',
      description: 'Connected to the Medellin remnants. Can open the cocaine supply line if you prove yourself.',
    },
    destiny: {
      id: 'destiny',
      name: 'Destiny Monroe',
      nickname: 'Des',
      fullName: "Destiny 'Des' Monroe",
      type: 'contact',
      city: 'New York',
      role: 'Info Broker',
      personality: 'Grew up in Bed-Stuy, knows everybody and everything. Trades information like currency. Trust is earned, never given.',
      relationship: 0,
      questLine: 'territory_takeover',
      description: 'Runs an underground information network across all five boroughs. Can help you claim territory.',
    },
    jerome: {
      id: 'jerome',
      name: 'Jerome Davis',
      nickname: 'Old Man Jerome',
      fullName: 'Old Man Jerome',
      type: 'contact',
      city: 'Chicago',
      role: 'Mentor',
      personality: 'Retired OG who ran the South Side in the eighties. Sits on his porch dispensing wisdom and warnings. Still has pull.',
      relationship: 0,
      questLine: 'mentor_lessons',
      description: 'A living legend who can teach you the deeper mechanics of the game. Surviving is one thing. Thriving is another.',
    },
    djblaze: {
      id: 'djblaze',
      name: 'Bryan Mitchell',
      nickname: 'DJ Blaze',
      fullName: 'DJ Blaze',
      type: 'contact',
      city: 'Atlanta',
      role: 'Club Promoter',
      personality: 'All flash, all energy. Runs the hottest clubs in the A. His parties are where the real money changes hands.',
      relationship: 0,
      questLine: 'club_connection',
      description: 'Gateway to the VIP nightlife scene. High-end clients, high-end product, high-end risk.',
    },
    keisha: {
      id: 'keisha',
      name: 'Keisha Jackson',
      nickname: 'Kee',
      fullName: "Keisha 'Kee' Jackson",
      type: 'contact',
      city: 'Detroit',
      role: 'Community Leader',
      personality: 'Runs a community center as a legitimate front. Hates what the drugs do but understands why people sell. Moral compass of the streets.',
      relationship: 0,
      questLine: 'community_path',
      description: 'Offers an alternative path. Work with the community or exploit it. Your karma decides.',
    },
    doc: {
      id: 'doc',
      name: 'Rajesh Gupta',
      nickname: 'Doc',
      fullName: "Rajesh 'Doc' Gupta",
      type: 'contact',
      city: 'Houston',
      role: 'Black Market Pharmacist',
      personality: 'Disgraced pharmacist with a dry wit and steady hands. Can source anything with a chemical formula.',
      relationship: 0,
      questLine: 'pharma_pipeline',
      description: 'Opens up the prescription drug pipeline. Oxy, Adderall, Xanax. Clean supply, premium prices.',
    },
    luna: {
      id: 'luna',
      name: 'Sarah Chen',
      nickname: 'Luna',
      fullName: "Sarah 'Luna' Chen",
      type: 'contact',
      city: 'Seattle',
      role: 'Tech Connect',
      personality: 'Former tech startup founder who pivoted to the dark web. Speaks in code and memes. Paranoid but brilliant.',
      relationship: 0,
      questLine: 'darkweb_market',
      description: 'Can set up an online distribution network. Bigger reach, bigger risk, bigger reward.',
    },
  };

  // ---------------------------------------------------------------------------
  // Viktor the Loan Shark
  // ---------------------------------------------------------------------------

  const VIKTOR = {
    id: 'viktor',
    name: 'Viktor Kozlov',
    nickname: 'The Shark',
    fullName: "Viktor 'The Shark' Kozlov",
    type: 'loan_shark',
    personality: 'Former Soviet military intelligence. Runs his operation like a chess game. Polite, precise, and utterly merciless.',
    relationship: -20,
  };

  // ---------------------------------------------------------------------------
  // Rival Dealers
  // ---------------------------------------------------------------------------

  const RIVALS = {
    kingpin_kenny: {
      id: 'kingpin_kenny',
      name: 'Kenneth Osei',
      nickname: 'Kingpin Kenny',
      fullName: "Kenneth 'Kingpin Kenny' Osei",
      type: 'rival',
      personality: 'Flashy, loud, and reckless. Thinks he is untouchable. Moves sloppy but has deep pockets.',
      strength: 6,
      territory: ['Atlanta', 'Miami'],
      currentCity: 'Atlanta',
      aggression: 7,
      alive: true,
      relationship: 0,
    },
    ice_queen: {
      id: 'ice_queen',
      name: 'Natasha Petrov',
      nickname: 'Ice Queen',
      fullName: "Natasha 'Ice Queen' Petrov",
      type: 'rival',
      personality: 'Cold, calculated, patient. Never makes a move without three backup plans. Connected to Eastern European networks.',
      strength: 8,
      territory: ['New York', 'Chicago'],
      currentCity: 'New York',
      aggression: 4,
      alive: true,
      relationship: 0,
    },
    lil_prophet: {
      id: 'lil_prophet',
      name: 'Isaiah Green',
      nickname: 'Lil Prophet',
      fullName: "Isaiah 'Lil Prophet' Green",
      type: 'rival',
      personality: 'Young, hungry, and dangerously smart. Came up from nothing and has something to prove. Respects strength.',
      strength: 5,
      territory: ['Detroit', 'Chicago'],
      currentCity: 'Detroit',
      aggression: 6,
      alive: true,
      relationship: 0,
    },
    don_felix: {
      id: 'don_felix',
      name: 'Felix Castillo',
      nickname: 'Don Felix',
      fullName: "Felix 'Don Felix' Castillo",
      type: 'rival',
      personality: 'Old school cartel mentality. Believes in honor among thieves. Will negotiate before fighting but never bluffs.',
      strength: 9,
      territory: ['Miami', 'Houston'],
      currentCity: 'Houston',
      aggression: 3,
      alive: true,
      relationship: 0,
    },
    byte: {
      id: 'byte',
      name: 'Jordan Ellis',
      nickname: 'Byte',
      fullName: "Jordan 'Byte' Ellis",
      type: 'rival',
      personality: 'Runs a tech-enabled operation from a laptop. Uses drones and dead drops. Hard to find, harder to catch.',
      strength: 4,
      territory: ['Seattle'],
      currentCity: 'Seattle',
      aggression: 2,
      alive: true,
      relationship: 0,
    },
  };

  // ---------------------------------------------------------------------------
  // VIP Customers
  // ---------------------------------------------------------------------------

  const VIP_CUSTOMERS = {
    wallstreet_mike: {
      id: 'wallstreet_mike',
      name: 'Michael Harrington',
      nickname: 'Wall Street Mike',
      type: 'customer',
      city: 'New York',
      preferredDrugs: ['cocaine', 'ecstasy'],
      budget: 'high',
      riskLevel: 'low',
      description: 'Finance bro who buys in bulk for his weekend parties. Reliable but will snitch if arrested.',
    },
    nurse_betty: {
      id: 'nurse_betty',
      name: 'Betty Simmons',
      nickname: 'Nurse Betty',
      type: 'customer',
      city: 'Houston',
      preferredDrugs: ['oxy', 'weed'],
      budget: 'medium',
      riskLevel: 'medium',
      description: 'Night shift nurse self-medicating after a divorce. Buys consistently but getting in deeper.',
    },
    professor_x: {
      id: 'professor_x',
      name: 'Xavier Bloom',
      nickname: 'Professor X',
      type: 'customer',
      city: 'Seattle',
      preferredDrugs: ['lsd', 'shrooms', 'weed'],
      budget: 'medium',
      riskLevel: 'low',
      description: 'University professor who microdoses for research. Discreet, pays on time, zero drama.',
    },
    queenie: {
      id: 'queenie',
      name: 'LaTonya Price',
      nickname: 'Queenie',
      type: 'customer',
      city: 'Atlanta',
      preferredDrugs: ['cocaine', 'molly'],
      budget: 'high',
      riskLevel: 'medium',
      description: 'Instagram influencer who throws the wildest parties in Buckhead. Big orders but loves to talk.',
    },
    trucker_tom: {
      id: 'trucker_tom',
      name: 'Tom Braddock',
      nickname: 'Trucker Tom',
      type: 'customer',
      city: 'Chicago',
      preferredDrugs: ['meth', 'oxy'],
      budget: 'low',
      riskLevel: 'high',
      description: 'Long-haul trucker burning the candle at both ends. Desperate and unpredictable. Might get you caught.',
    },
  };

  // ---------------------------------------------------------------------------
  // Dialogue Trees
  // ---------------------------------------------------------------------------

  const DIALOGUE_TREES = {

    // ---- VIKTOR THE LOAN SHARK ----
    viktor: {
      first_meeting: {
        id: 'first_meeting',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Viktor',
            text: 'Ah, there you are. Sit. I do not like to repeat myself, so listen carefully. You owe me money. The amount is not important. What is important is that you understand the terms.',
            options: [
              { text: 'How much exactly?', nextId: 'explain_debt' },
              { text: 'And if I can\'t pay?', nextId: 'threaten' },
              { text: 'I\'ll get your money.', nextId: 'confident' },
            ],
          },
          explain_debt: {
            id: 'explain_debt',
            speaker: 'Viktor',
            text: 'You owe what you owe, plus five percent daily interest. The number grows whether you sleep or not. I suggest you do not sleep much. You have thirty days.',
            options: [
              { text: 'Thirty days? That\'s tight.', nextId: 'tight_deadline' },
              { text: 'I understand.', nextId: 'end_meeting' },
            ],
          },
          threaten: {
            id: 'threaten',
            speaker: 'Viktor',
            text: 'If you cannot pay... well. I have a man named Gregor. Gregor does not negotiate. Gregor does not accept excuses. Gregor is very, very good at his job. Do we understand each other?',
            options: [
              { text: 'Crystal clear.', nextId: 'end_meeting', effects: { karma: 0 } },
              { text: 'I\'m not scared of you.', nextId: 'not_scared', requirements: { stat: 'intimidation', min: 7 } },
            ],
          },
          not_scared: {
            id: 'not_scared',
            speaker: 'Viktor',
            text: '...Interesting. Most people soil themselves at this point. Perhaps you are stupid. Perhaps you are brave. Either way, the debt remains. Thirty days.',
            options: [
              { text: '[Leave]', nextId: 'end_meeting', effects: { relationship: { npcId: 'viktor', amount: 5 } } },
            ],
          },
          confident: {
            id: 'confident',
            speaker: 'Viktor',
            text: 'Good. Confidence. I like that. But confidence without results is just noise. Thirty days. Make them count.',
            options: [
              { text: '[Leave]', nextId: 'end_meeting', effects: { relationship: { npcId: 'viktor', amount: 3 } } },
            ],
          },
          tight_deadline: {
            id: 'tight_deadline',
            speaker: 'Viktor',
            text: 'Tight? Yes. Impossible? That depends entirely on you. I have seen people accomplish remarkable things when properly motivated. Consider yourself motivated.',
            options: [
              { text: '[Leave]', nextId: 'end_meeting' },
            ],
          },
          end_meeting: {
            id: 'end_meeting',
            speaker: 'Viktor',
            text: 'We are done here. My number is in your phone. Do not call unless you have my money. And do not run. I always find what belongs to me.',
            options: [],
            effects: { flags: { met_viktor: true } },
          },
        },
      },

      debt_growing: {
        id: 'debt_growing',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Viktor',
            text: 'You are behind schedule. The interest does not care about your excuses. It compounds. Like my disappointment.',
            options: [
              { text: 'I need more time.', nextId: 'more_time' },
              { text: 'I have a partial payment.', nextId: 'partial_pay' },
              { text: 'Business is tough right now.', nextId: 'tough_business' },
            ],
          },
          more_time: {
            id: 'more_time',
            speaker: 'Viktor',
            text: 'Time is the one thing I do not sell. Every day you waste, the number grows. Every day, Gregor gets a little more restless. He has been asking about you.',
            options: [
              { text: 'I\'ll figure it out.', nextId: 'end_warning' },
            ],
          },
          partial_pay: {
            id: 'partial_pay',
            speaker: 'Viktor',
            text: 'Partial. How generous. You bring me crumbs and expect gratitude? Pay what you have. It slows the bleeding. But the wound remains open.',
            options: [
              { text: '[Make a payment]', nextId: 'end_warning', effects: { flags: { partial_payment: true } } },
              { text: 'On second thought, I need the cash.', nextId: 'keep_cash' },
            ],
          },
          tough_business: {
            id: 'tough_business',
            speaker: 'Viktor',
            text: 'Tough? You think this is tough? I grew up in Novosibirsk eating snow for dinner. Do not talk to me about tough. Talk to me about money.',
            options: [
              { text: '[Leave quietly]', nextId: 'end_warning', effects: { relationship: { npcId: 'viktor', amount: -5 } } },
            ],
          },
          keep_cash: {
            id: 'keep_cash',
            speaker: 'Viktor',
            text: 'You came here to waste my time. That is very brave. Or very stupid. The line between the two is thinner than you think.',
            options: [
              { text: '[Leave]', nextId: 'end_warning', effects: { relationship: { npcId: 'viktor', amount: -10 } } },
            ],
          },
          end_warning: {
            id: 'end_warning',
            speaker: 'Viktor',
            text: 'The clock does not stop ticking just because you close your eyes. Go. Make money. Bring it to me. This is the last polite conversation we will have.',
            options: [],
          },
        },
      },

      paying_off: {
        id: 'paying_off',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Viktor',
            text: 'Well, well. Look at you. Bringing real money now. I was beginning to think Gregor would have to pay you a visit after all.',
            options: [
              { text: 'I told you I\'d get it done.', nextId: 'respect' },
              { text: 'Just take it and we\'re done.', nextId: 'cold_finish' },
            ],
          },
          respect: {
            id: 'respect',
            speaker: 'Viktor',
            text: 'Yes, you did. And I did not believe you. I was wrong. That does not happen often. You have spine. In this business, that is worth more than money.',
            options: [
              { text: 'So we\'re square?', nextId: 'square' },
            ],
          },
          cold_finish: {
            id: 'cold_finish',
            speaker: 'Viktor',
            text: 'Done? My friend, nothing is ever done. But your debt, yes. That is settled. For now.',
            options: [
              { text: '[Leave]', nextId: 'end_payoff', effects: { relationship: { npcId: 'viktor', amount: 5 } } },
            ],
          },
          square: {
            id: 'square',
            speaker: 'Viktor',
            text: 'We are square. Your slate is clean. But I remember faces. And I remember people who deliver. If you ever need capital again... or something more... you know where to find me.',
            options: [
              { text: 'I\'ll keep that in mind.', nextId: 'end_payoff', effects: { relationship: { npcId: 'viktor', amount: 15 } } },
              { text: 'No offense, but I hope I never see you again.', nextId: 'end_payoff', effects: { relationship: { npcId: 'viktor', amount: -5 } } },
            ],
          },
          end_payoff: {
            id: 'end_payoff',
            speaker: 'Viktor',
            text: 'Go in peace. For now.',
            options: [],
            effects: { flags: { debt_paid: true } },
          },
        },
      },

      partnership_offer: {
        id: 'partnership_offer',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Viktor',
            text: 'You surprised me. I do not say that lightly. You paid your debt. You survived. Most do not. I have a proposition for you.',
            options: [
              { text: 'I\'m listening.', nextId: 'the_offer' },
              { text: 'Last time you had a proposition, I almost died.', nextId: 'humor' },
            ],
          },
          the_offer: {
            id: 'the_offer',
            speaker: 'Viktor',
            text: 'I need a distributor. Someone with reach. Someone I can trust. I provide the supply chain, the protection, the capital. You provide the network. Fifty-fifty split. What do you say?',
            options: [
              { text: 'I\'m in.', nextId: 'accept_deal', effects: { flags: { viktor_partner: true }, karma: -10 } },
              { text: 'I need to think about it.', nextId: 'think_about_it' },
              { text: 'I work alone.', nextId: 'decline_deal' },
            ],
          },
          humor: {
            id: 'humor',
            speaker: 'Viktor',
            text: 'Ha. You are funny. I like funny. But this is serious business. Much bigger than a loan. I am talking about an empire.',
            options: [
              { text: 'Tell me more.', nextId: 'the_offer' },
              { text: 'Not interested.', nextId: 'decline_deal' },
            ],
          },
          accept_deal: {
            id: 'accept_deal',
            speaker: 'Viktor',
            text: 'Smart. Very smart. This is the beginning of something beautiful. And profitable. I will be in touch with the details. Welcome to the big leagues.',
            options: [],
            effects: { flags: { phase2_viktor_alliance: true } },
          },
          think_about_it: {
            id: 'think_about_it',
            speaker: 'Viktor',
            text: 'Think quickly. Opportunities like this have an expiration date. And I do not offer twice.',
            options: [],
          },
          decline_deal: {
            id: 'decline_deal',
            speaker: 'Viktor',
            text: 'Alone. How noble. How limiting. The offer stands for now. But I am not a patient man. If someone else takes your place, there will be no second chance.',
            options: [],
            effects: { relationship: { npcId: 'viktor', amount: -10 } },
          },
        },
      },
    },

    // ---- CARLOS REYES (Miami Contact) ----
    carlos: {
      intro: {
        id: 'intro',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Carlos',
            text: 'Bienvenido to Miami, my friend. I hear you are looking to make some real money. Not that corner-boy nonsense. I am talking about weight.',
            options: [
              { text: 'Who told you about me?', nextId: 'who_told' },
              { text: 'What kind of weight?', nextId: 'the_product' },
              { text: 'Why should I trust you?', nextId: 'trust', requirements: { stat: 'streetSmarts', min: 6 } },
            ],
          },
          who_told: {
            id: 'who_told',
            speaker: 'Carlos',
            text: 'In Miami, the walls have ears and the ocean has eyes. Let us say a mutual friend mentioned your name. If you were nobody, we would not be talking.',
            options: [
              { text: 'Fair enough. What are you offering?', nextId: 'the_product' },
            ],
          },
          the_product: {
            id: 'the_product',
            speaker: 'Carlos',
            text: 'Cocaine. Pure. Straight from the source. But I do not hand this to just anyone. First, you prove yourself. I need a delivery made. No questions.',
            options: [
              { text: 'I can handle a delivery.', nextId: 'accept_quest', effects: { flags: { carlos_quest_started: true } } },
              { text: 'What\'s in it for me?', nextId: 'whats_in_it' },
              { text: 'I don\'t run errands.', nextId: 'decline' },
            ],
          },
          trust: {
            id: 'trust',
            speaker: 'Carlos',
            text: 'Smart question. You should not trust me. Trust gets people killed in this business. But business... business we can build. Trust comes later. Or not at all.',
            options: [
              { text: 'So what\'s the business?', nextId: 'the_product' },
            ],
          },
          whats_in_it: {
            id: 'whats_in_it',
            speaker: 'Carlos',
            text: 'Access. The cocaine pipeline runs through me. One delivery, and suddenly you can buy at prices nobody else in your league can touch. That is what is in it for you.',
            options: [
              { text: 'Alright, I\'m in.', nextId: 'accept_quest', effects: { flags: { carlos_quest_started: true } } },
              { text: 'Let me think about it.', nextId: 'end_intro' },
            ],
          },
          accept_quest: {
            id: 'accept_quest',
            speaker: 'Carlos',
            text: 'Good. The package will be at the marina. Slip forty-seven. Take it to a man at the Fontainebleau. You will know him by the red pocket square. Do not open the package. Do not be late.',
            options: [],
            effects: { flags: { carlos_delivery_active: true } },
          },
          decline: {
            id: 'decline',
            speaker: 'Carlos',
            text: 'Errands? No, my friend. This is an audition. But if you are not ready for the stage... the door is right there.',
            options: [
              { text: 'Fine, I\'ll do it.', nextId: 'accept_quest', effects: { flags: { carlos_quest_started: true } } },
              { text: '[Leave]', nextId: 'end_intro', effects: { relationship: { npcId: 'carlos', amount: -10 } } },
            ],
          },
          end_intro: {
            id: 'end_intro',
            speaker: 'Carlos',
            text: 'You know where to find me. The offer will not last forever.',
            options: [],
          },
        },
      },
    },

    // ---- DESTINY (New York Contact) ----
    destiny: {
      intro: {
        id: 'intro',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Des',
            text: 'Nah, stop right there. I know who you are. Question is, do you know who I am? Because if you walking up to me, you better have a reason.',
            options: [
              { text: 'I heard you know things.', nextId: 'know_things' },
              { text: 'I need territory in New York.', nextId: 'territory' },
              { text: 'I was told to find you.', nextId: 'told_to_find' },
            ],
          },
          know_things: {
            id: 'know_things',
            speaker: 'Des',
            text: 'I know everything. Who is moving what, where the cops are watching, which blocks are hot and which ones are open. Information is power and I am the power company.',
            options: [
              { text: 'What would it cost to plug in?', nextId: 'the_deal' },
            ],
          },
          territory: {
            id: 'territory',
            speaker: 'Des',
            text: 'Territory? In MY city? You got nerve, I will give you that. Every block in this city belongs to somebody. You want in, you need to take it. And to take it, you need me.',
            options: [
              { text: 'Then let\'s work together.', nextId: 'the_deal' },
              { text: 'I can take it myself.', nextId: 'go_alone', requirements: { stat: 'intimidation', min: 8 } },
            ],
          },
          told_to_find: {
            id: 'told_to_find',
            speaker: 'Des',
            text: 'Told by who? Actually, do not answer that. If you found me, you are either connected or lucky. Let us find out which.',
            options: [
              { text: 'Test me.', nextId: 'the_deal' },
            ],
          },
          the_deal: {
            id: 'the_deal',
            speaker: 'Des',
            text: 'Here is the deal. There is a block on 145th that is been running sloppy. The crew there is weak. Take that block and you prove you are serious. I will feed you intel after that.',
            options: [
              { text: 'Consider it done.', nextId: 'accept_quest', effects: { flags: { destiny_quest_started: true } } },
              { text: 'What support do I get?', nextId: 'support' },
            ],
          },
          go_alone: {
            id: 'go_alone',
            speaker: 'Des',
            text: 'Ha! Okay tough guy. Go ahead. Walk into Harlem blind and see how that works out. When you limp back here, my price doubles.',
            options: [
              { text: 'Fine. What do you suggest?', nextId: 'the_deal' },
              { text: '[Leave]', nextId: 'end_intro', effects: { relationship: { npcId: 'destiny', amount: -5 } } },
            ],
          },
          support: {
            id: 'support',
            speaker: 'Des',
            text: 'I give you the layout. Who is there, how many, when they re-up. You provide the muscle. This is your audition, not mine.',
            options: [
              { text: 'Alright, I\'m in.', nextId: 'accept_quest', effects: { flags: { destiny_quest_started: true } } },
            ],
          },
          accept_quest: {
            id: 'accept_quest',
            speaker: 'Des',
            text: 'Good. I will send the details to your phone. And hey. Do not embarrass me out there.',
            options: [],
            effects: { flags: { destiny_territory_active: true } },
          },
          end_intro: {
            id: 'end_intro',
            speaker: 'Des',
            text: 'You know where the door is.',
            options: [],
          },
        },
      },
    },

    // ---- OLD MAN JEROME (Chicago Contact) ----
    jerome: {
      intro: {
        id: 'intro',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Jerome',
            text: 'Sit down, young blood. You got that look. Same look I had forty years ago. Hungry. Scared. Trying not to show either one.',
            options: [
              { text: 'I\'m not scared.', nextId: 'denial' },
              { text: 'You used to be in the game?', nextId: 'old_days' },
              { text: 'I need advice.', nextId: 'advice' },
            ],
          },
          denial: {
            id: 'denial',
            speaker: 'Jerome',
            text: 'Mmhmm. That is exactly what a scared person says. It is okay. Fear keeps you alive. Arrogance gets you buried. Lesson one, free of charge.',
            options: [
              { text: 'What\'s lesson two?', nextId: 'advice' },
            ],
          },
          old_days: {
            id: 'old_days',
            speaker: 'Jerome',
            text: 'Used to be? Son, I ran the South Side when your parents were in diapers. Retired now. Still breathing. That alone tells you I know what I am doing.',
            options: [
              { text: 'Can you teach me?', nextId: 'advice' },
              { text: 'Why\'d you quit?', nextId: 'why_quit' },
            ],
          },
          why_quit: {
            id: 'why_quit',
            speaker: 'Jerome',
            text: 'Because everybody I came up with is either dead or locked up. I am the last one standing. Think about that before you ask your next question.',
            options: [
              { text: 'I hear you. So what should I know?', nextId: 'advice' },
            ],
          },
          advice: {
            id: 'advice',
            speaker: 'Jerome',
            text: 'Three rules. One: never get high on your own supply. Two: the money is not yours until it is washed. Three: everybody talks. The question is when, not if. Now. You want real knowledge? I can show you how this city works. But you gotta earn it.',
            options: [
              { text: 'What do I need to do?', nextId: 'mentor_quest' },
              { text: 'Thanks for the wisdom, old man.', nextId: 'end_intro' },
            ],
          },
          mentor_quest: {
            id: 'mentor_quest',
            speaker: 'Jerome',
            text: 'There is a shop on Halsted. Laundromat. That is where you learn to wash money. Go there, talk to my boy Marcus. Tell him Jerome sent you. That is your first real lesson.',
            options: [
              { text: 'I\'m on it.', nextId: 'end_intro', effects: { flags: { jerome_quest_started: true, mentor_lesson_1: true } } },
            ],
          },
          end_intro: {
            id: 'end_intro',
            speaker: 'Jerome',
            text: 'Be smart out there, young blood. The streets do not give second chances.',
            options: [],
          },
        },
      },
    },

    // ---- DJ BLAZE (Atlanta Contact) ----
    djblaze: {
      intro: {
        id: 'intro',
        nodes: {
          start: {
            id: 'start',
            speaker: 'DJ Blaze',
            text: 'Yoooo, what is good! You the one everybody been talking about? Come in, come in. VIP section. Drinks on me. Let us talk business.',
            options: [
              { text: 'Word travels fast.', nextId: 'word_travels' },
              { text: 'What kind of business?', nextId: 'the_business' },
              { text: 'I don\'t drink on the job.', nextId: 'all_business' },
            ],
          },
          word_travels: {
            id: 'word_travels',
            speaker: 'DJ Blaze',
            text: 'In Atlanta? Everything travels fast. The music, the money, the product. Speaking of which, my club needs a reliable connect. The last one got too messy.',
            options: [
              { text: 'Define messy.', nextId: 'messy' },
              { text: 'I can be your connect.', nextId: 'the_business' },
            ],
          },
          messy: {
            id: 'messy',
            speaker: 'DJ Blaze',
            text: 'Selling to the wrong people. Drawing heat. You sell to my VIP clients, you keep it clean. These are rappers, athletes, people with money to burn. They do not want drama. Neither do I.',
            options: [
              { text: 'I keep things professional.', nextId: 'the_business' },
            ],
          },
          all_business: {
            id: 'all_business',
            speaker: 'DJ Blaze',
            text: 'Ha! All business. I respect that. Alright, straight to it then.',
            options: [
              { text: 'What do you need?', nextId: 'the_business' },
            ],
          },
          the_business: {
            id: 'the_business',
            speaker: 'DJ Blaze',
            text: 'My club, Inferno, pulls two thousand people on a Friday night. Half of them want to party harder than the music lets them. I need someone to supply the VIP section. Cocaine, molly, premium only. You in?',
            options: [
              { text: 'I\'m in. What\'s the setup?', nextId: 'accept_quest', effects: { flags: { blaze_quest_started: true } } },
              { text: 'How much are we talking?', nextId: 'the_money' },
            ],
          },
          the_money: {
            id: 'the_money',
            speaker: 'DJ Blaze',
            text: 'On a good weekend? Five figures easy. These clients do not haggle. They pay premium for premium. But first, you gotta prove you can move clean in my space. One trial run.',
            options: [
              { text: 'Set it up.', nextId: 'accept_quest', effects: { flags: { blaze_quest_started: true } } },
            ],
          },
          accept_quest: {
            id: 'accept_quest',
            speaker: 'DJ Blaze',
            text: 'Friday night. Inferno. Back entrance. My boy T-Rex will let you in. Bring quality product, serve the VIP list, and keep your head down. Do not mess this up.',
            options: [],
            effects: { flags: { blaze_club_active: true } },
          },
        },
      },
    },

    // ---- KEISHA (Detroit Contact) ----
    keisha: {
      intro: {
        id: 'intro',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Keisha',
            text: 'Let me guess. You are here because somebody told you Kee can help you make money. And that is true. But first I need to know something. What kind of dealer are you?',
            options: [
              { text: 'The kind that survives.', nextId: 'survivor' },
              { text: 'I\'m just trying to pay off a debt.', nextId: 'debt_talk' },
              { text: 'The kind that gets rich.', nextId: 'get_rich' },
            ],
          },
          survivor: {
            id: 'survivor',
            speaker: 'Keisha',
            text: 'Survival. That I understand. This neighborhood taught me that. But there is a difference between surviving and destroying everything around you while you do it.',
            options: [
              { text: 'I hear you. What are you proposing?', nextId: 'the_choice' },
            ],
          },
          debt_talk: {
            id: 'debt_talk',
            speaker: 'Keisha',
            text: 'A debt. To Viktor? Yeah, I know about him. Everybody in Detroit does. He has been bleeding this city for years. Maybe we can help each other.',
            options: [
              { text: 'How so?', nextId: 'the_choice' },
            ],
          },
          get_rich: {
            id: 'get_rich',
            speaker: 'Keisha',
            text: 'Rich. At whose expense? The kids in my community center? Their parents? Look around you. This is what rich dealers leave behind. Broken neighborhoods.',
            options: [
              { text: 'It\'s not personal. It\'s business.', nextId: 'just_business', effects: { karma: -5 } },
              { text: 'You\'re right. I could do better.', nextId: 'the_choice', effects: { karma: 5 } },
            ],
          },
          just_business: {
            id: 'just_business',
            speaker: 'Keisha',
            text: 'Business. Right. Well here is some business for you. I know every inch of this city. You want to move product in Detroit, you go through me. Or against me. Choose.',
            options: [
              { text: 'With you. Definitely with you.', nextId: 'the_choice' },
              { text: 'I do not need your permission.', nextId: 'against_me', effects: { relationship: { npcId: 'keisha', amount: -15 } } },
            ],
          },
          against_me: {
            id: 'against_me',
            speaker: 'Keisha',
            text: 'Your funeral. But remember, I did offer. And this city has a way of humbling people who think they do not need friends.',
            options: [],
          },
          the_choice: {
            id: 'the_choice',
            speaker: 'Keisha',
            text: 'I have two paths for you. Path one: you sell, but you do it smart. Keep it away from schools, away from kids. I give you safe territory. Path two: you help me build something legitimate. Takes longer, pays off bigger. Less bodies.',
            options: [
              { text: 'Path one. Smart hustle.', nextId: 'street_path', effects: { flags: { keisha_street_path: true } } },
              { text: 'Path two. The clean way.', nextId: 'clean_path', effects: { flags: { keisha_clean_path: true }, karma: 10 } },
              { text: 'Can I do both?', nextId: 'both_paths' },
            ],
          },
          street_path: {
            id: 'street_path',
            speaker: 'Keisha',
            text: 'Fine. There is a block on Gratiot that is open. No crew, no heat. But you stay away from my community center. That is the deal. Break it and we have a problem.',
            options: [],
            effects: { flags: { keisha_quest_started: true } },
          },
          clean_path: {
            id: 'clean_path',
            speaker: 'Keisha',
            text: 'I respect that. I need someone to help me set up a legit business as a front. A barber shop on Michigan Avenue. It washes money, provides jobs, and keeps the neighborhood standing. Win-win.',
            options: [],
            effects: { flags: { keisha_quest_started: true } },
          },
          both_paths: {
            id: 'both_paths',
            speaker: 'Keisha',
            text: 'Both? You greedy. But maybe that is not a bad thing. Start with the street path, prove you can be trusted, and I will open up the other one. One step at a time.',
            options: [
              { text: 'Deal.', nextId: 'street_path', effects: { flags: { keisha_both_paths: true } } },
            ],
          },
        },
      },
    },

    // ---- GENERIC DIALOGUES ----
    generic: {
      street_npc: {
        id: 'street_npc',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Stranger',
            text: 'Hey. You looking or selling?',
            options: [
              { text: 'Depends. What do you need?', nextId: 'buying' },
              { text: 'I might have something.', nextId: 'selling' },
              { text: 'Neither. Wrong person.', nextId: 'walk_away' },
            ],
          },
          buying: {
            id: 'buying',
            speaker: 'Stranger',
            text: 'Something to take the edge off, you know? Nothing heavy. What you got?',
            options: [
              { text: '[Offer product]', nextId: 'end_deal' },
              { text: 'Sorry, can\'t help you.', nextId: 'walk_away' },
            ],
          },
          selling: {
            id: 'selling',
            speaker: 'Stranger',
            text: 'For real? Alright, let me see what you working with.',
            options: [
              { text: '[Show inventory]', nextId: 'end_deal' },
              { text: 'Actually, never mind.', nextId: 'walk_away' },
            ],
          },
          walk_away: {
            id: 'walk_away',
            speaker: 'Stranger',
            text: 'Whatever, man. Be easy.',
            options: [],
          },
          end_deal: {
            id: 'end_deal',
            speaker: 'Stranger',
            text: 'Good looking out. I might come find you again.',
            options: [],
          },
        },
      },

      bar_npc: {
        id: 'bar_npc',
        nodes: {
          start: {
            id: 'start',
            speaker: 'Bartender',
            text: 'What can I get you? And keep it down. I run a quiet establishment.',
            options: [
              { text: 'I\'m looking for information.', nextId: 'info' },
              { text: 'Just a drink.', nextId: 'drink' },
              { text: 'You know where I can find work?', nextId: 'work' },
            ],
          },
          info: {
            id: 'info',
            speaker: 'Bartender',
            text: 'Information costs. Buy a drink first, then maybe I remember something useful.',
            options: [
              { text: '[Buy a drink - $20]', nextId: 'info_paid' },
              { text: 'Forget it.', nextId: 'end_bar' },
            ],
          },
          info_paid: {
            id: 'info_paid',
            speaker: 'Bartender',
            text: 'Word on the street is the cops are watching the east side heavy. Stay west if you are moving anything. Also, there is a new crew in town looking for muscle. Check the pool hall.',
            options: [
              { text: 'Thanks for the tip.', nextId: 'end_bar' },
            ],
          },
          drink: {
            id: 'drink',
            speaker: 'Bartender',
            text: 'Coming right up. You look like you could use one.',
            options: [
              { text: '[Drink quietly]', nextId: 'end_bar' },
            ],
          },
          work: {
            id: 'work',
            speaker: 'Bartender',
            text: 'Depends on what kind of work. Legit? Try the docks. Other kind? Talk to the guys in the back booth. I did not send you.',
            options: [
              { text: '[Check the back booth]', nextId: 'end_bar' },
              { text: 'Thanks.', nextId: 'end_bar' },
            ],
          },
          end_bar: {
            id: 'end_bar',
            speaker: 'Bartender',
            text: 'Stay safe out there.',
            options: [],
          },
        },
      },
    },
  };

  // ---------------------------------------------------------------------------
  // Crew Role Bonuses (constants)
  // ---------------------------------------------------------------------------

  const ROLE_BONUSES = {
    lookout: {
      ambushReduction: 0.30,
      description: 'Reduces ambush chance by 30%, gives early warnings.',
    },
    driver: {
      freeTravel: true,
      chaseEscapeBonus: 0.40,
      description: 'Travel costs no time period, better chase escapes.',
    },
    muscle: {
      combatBonus: 3,
      canDefendTerritory: true,
      description: '+3 combat power in encounters, can defend territory autonomously.',
    },
    cook: {
      cuttingMultiplier: 3,
      canCreateProduct: true,
      description: '3x cutting ratio instead of 2x, can create new product.',
    },
    dealer: {
      passiveIncomeBonus: true,
      customerBaseSpeed: 1.5,
      description: 'Generates passive income from territory, builds customer base 50% faster.',
    },
  };

  // ---------------------------------------------------------------------------
  // Helper: Initialize NPC State on Game
  // ---------------------------------------------------------------------------

  /**
   * Ensures the game state has the necessary NPC tracking structures.
   * Called internally by NPC functions before accessing NPC state.
   *
   * @param {object} game - The game state.
   */
  function ensureNPCState(game) {
    if (!game.npcState) {
      game.npcState = {
        relationships: {},
        dialogueProgress: {},
        crewMembers: {},
        rivals: {},
        flags: {},
      };
    }
    if (!game.npcState.relationships) game.npcState.relationships = {};
    if (!game.npcState.dialogueProgress) game.npcState.dialogueProgress = {};
    if (!game.npcState.crewMembers) game.npcState.crewMembers = {};
    if (!game.npcState.rivals) game.npcState.rivals = {};
  }

  // ---------------------------------------------------------------------------
  // Crew Functions
  // ---------------------------------------------------------------------------

  /**
   * Get all crew members available for recruitment in the given city.
   * Excludes anyone already recruited or dead.
   *
   * @param {object} game     - The game state.
   * @param {string} cityName - The city to check.
   * @returns {Array}         - Array of crew member objects available for recruitment.
   */
  function getAvailableCrew(game, cityName) {
    ensureNPCState(game);

    const recruitedIds = game.crew.map(function (c) { return c.id; });

    return Object.values(CREW_MEMBERS).filter(function (member) {
      if (member.city !== cityName) return false;
      if (recruitedIds.indexOf(member.id) !== -1) return false;

      // Check if killed in npcState
      var state = game.npcState.crewMembers[member.id];
      if (state && state.alive === false) return false;

      return true;
    });
  }

  /**
   * Recruit a crew member by their id.
   * Deducts the recruitment cost from cash.
   *
   * @param {object} game   - The game state.
   * @param {string} crewId - The crew member's id.
   * @returns {{ success: boolean, message: string, member?: object }}
   */
  function recruitCrew(game, crewId) {
    ensureNPCState(game);

    var template = CREW_MEMBERS[crewId];
    if (!template) {
      return { success: false, message: 'Unknown crew member.' };
    }

    // Already recruited?
    var existing = game.crew.find(function (c) { return c.id === crewId; });
    if (existing) {
      return { success: false, message: template.fullName + ' is already on your crew.' };
    }

    // Dead?
    var state = game.npcState.crewMembers[crewId];
    if (state && state.alive === false) {
      return { success: false, message: template.fullName + ' is no longer available.' };
    }

    // Can afford?
    if (game.resources.cash < template.recruitCost) {
      return {
        success: false,
        message: 'Not enough cash. ' + template.fullName + ' wants $' + template.recruitCost.toLocaleString() + ' up front.',
      };
    }

    // Recruit
    game.resources.cash -= template.recruitCost;

    var recruited = {
      id: template.id,
      name: template.name,
      nickname: template.nickname,
      fullName: template.fullName,
      role: template.role,
      stats: Object.assign({}, template.stats),
      dailyWage: template.dailyWage,
      loyalty: template.loyalty,
      alive: true,
      specialAbility: template.specialAbility,
      personality: template.personality,
      daysUnpaid: 0,
    };

    game.crew.push(recruited);

    // Track in npcState
    game.npcState.crewMembers[crewId] = { recruited: true, alive: true };

    return {
      success: true,
      message: template.fullName + ' has joined your crew as a ' + template.role + '.',
      member: recruited,
    };
  }

  /**
   * Fire a crew member. Low loyalty members may not leave quietly.
   *
   * @param {object} game   - The game state.
   * @param {string} crewId - The crew member's id.
   * @returns {{ success: boolean, message: string, event?: string }}
   */
  function fireCrew(game, crewId) {
    ensureNPCState(game);

    var index = -1;
    for (var i = 0; i < game.crew.length; i++) {
      if (game.crew[i].id === crewId) {
        index = i;
        break;
      }
    }

    if (index === -1) {
      return { success: false, message: 'That person is not on your crew.' };
    }

    var member = game.crew[index];
    var result = {
      success: true,
      message: member.fullName + ' has been let go.',
    };

    // Low loyalty: they might cause trouble on the way out
    if (member.loyalty < 20) {
      var roll = Math.random() * 100;
      if (roll < 50) {
        result.event = 'stole_product';
        result.message = member.fullName + ' did not leave quietly. They stole product on the way out.';

        // Steal some drugs
        var drugKeys = Object.keys(game.inventory.drugs);
        if (drugKeys.length > 0) {
          var targetDrug = drugKeys[Math.floor(Math.random() * drugKeys.length)];
          var stolen = Math.min(game.inventory.drugs[targetDrug], Math.floor(Math.random() * 10) + 1);
          game.inventory.drugs[targetDrug] -= stolen;
          if (game.inventory.drugs[targetDrug] <= 0) {
            delete game.inventory.drugs[targetDrug];
          }
        }
      } else if (roll < 80) {
        result.event = 'threat';
        result.message = member.fullName + ' left cursing your name. Word on the street is they are talking to your enemies.';
        if (window.Core && window.Core.adjustHeat) {
          window.Core.adjustHeat(game, game.world.currentCity, 5);
        }
      }
    } else if (member.loyalty >= 60) {
      result.message = member.fullName + ' leaves respectfully. Says to call if you ever need them again.';
    }

    // Remove from crew
    game.crew.splice(index, 1);

    // Update npcState
    game.npcState.crewMembers[crewId] = game.npcState.crewMembers[crewId] || {};
    game.npcState.crewMembers[crewId].recruited = false;

    return result;
  }

  /**
   * Pay daily wages for all crew members.
   * Call this when a new day begins.
   * Unpaid crew lose loyalty rapidly.
   *
   * @param {object} game - The game state.
   * @returns {{ totalPaid: number, unpaid: Array, messages: Array }}
   */
  function payCrew(game) {
    ensureNPCState(game);

    var totalPaid = 0;
    var unpaid = [];
    var messages = [];

    for (var i = 0; i < game.crew.length; i++) {
      var member = game.crew[i];
      if (!member.alive) continue;

      if (game.resources.cash >= member.dailyWage) {
        game.resources.cash -= member.dailyWage;
        totalPaid += member.dailyWage;
        member.daysUnpaid = 0;

        // Loyalty bump for paying on time
        updateLoyalty(game, member.id, 2);
      } else {
        // Cannot afford
        member.daysUnpaid = (member.daysUnpaid || 0) + 1;
        unpaid.push(member);

        // Loyalty drops hard when unpaid
        updateLoyalty(game, member.id, -10);

        messages.push(member.fullName + ' was not paid today. Loyalty dropping.');

        if (member.daysUnpaid >= 3) {
          messages.push(member.fullName + ' is threatening to leave. Pay up or lose them.');
        }
      }
    }

    return { totalPaid: totalPaid, unpaid: unpaid, messages: messages };
  }

  /**
   * Adjust a crew member's loyalty, clamped to [0, 100].
   *
   * @param {object} game   - The game state.
   * @param {string} crewId - The crew member's id.
   * @param {number} amount - Loyalty change (positive or negative).
   * @returns {number|null}  - New loyalty value, or null if member not found.
   */
  function updateLoyalty(game, crewId, amount) {
    var member = null;
    for (var i = 0; i < game.crew.length; i++) {
      if (game.crew[i].id === crewId) {
        member = game.crew[i];
        break;
      }
    }

    if (!member) return null;

    member.loyalty = Math.max(0, Math.min(100, member.loyalty + amount));
    return member.loyalty;
  }

  /**
   * Check for betrayals among low-loyalty crew members.
   * Below 20: random chance of betrayal. Below 10: guaranteed.
   *
   * @param {object} game - The game state.
   * @returns {Array}     - Array of betrayal event objects.
   */
  function checkBetrayals(game) {
    ensureNPCState(game);

    var betrayals = [];

    for (var i = game.crew.length - 1; i >= 0; i--) {
      var member = game.crew[i];
      if (!member.alive) continue;

      var willBetray = false;

      if (member.loyalty < 10) {
        willBetray = true;
      } else if (member.loyalty < 20) {
        willBetray = Math.random() < 0.3; // 30% chance
      }

      if (!willBetray) continue;

      // Determine betrayal type
      var roll = Math.random();
      var betrayal = {
        crewId: member.id,
        name: member.fullName,
      };

      if (roll < 0.33) {
        // Steal product
        betrayal.type = 'theft';
        betrayal.message = member.fullName + ' stole product from your stash and disappeared.';

        var drugKeys = Object.keys(game.inventory.drugs);
        if (drugKeys.length > 0) {
          var targetDrug = drugKeys[Math.floor(Math.random() * drugKeys.length)];
          var stolen = Math.min(
            game.inventory.drugs[targetDrug],
            Math.floor(Math.random() * 15) + 5
          );
          game.inventory.drugs[targetDrug] -= stolen;
          if (game.inventory.drugs[targetDrug] <= 0) {
            delete game.inventory.drugs[targetDrug];
          }
          betrayal.details = 'Stole ' + stolen + ' units of ' + targetDrug;
        }
      } else if (roll < 0.66) {
        // Snitch to police
        betrayal.type = 'snitch';
        betrayal.message = member.fullName + ' snitched to the police. Your heat just went through the roof.';

        if (window.Core && window.Core.adjustHeat) {
          window.Core.adjustHeat(game, game.world.currentCity, 25);
        }
      } else {
        // Steal cash
        betrayal.type = 'robbery';
        var stolenCash = Math.min(
          game.resources.cash,
          Math.floor(Math.random() * 2000) + 500
        );
        game.resources.cash -= stolenCash;
        betrayal.message = member.fullName + ' robbed you of $' + stolenCash.toLocaleString() + ' and vanished.';
        betrayal.details = 'Stole $' + stolenCash.toLocaleString();
      }

      // Remove the traitor from crew
      game.crew.splice(i, 1);

      // Mark in npcState
      game.npcState.crewMembers[member.id] = game.npcState.crewMembers[member.id] || {};
      game.npcState.crewMembers[member.id].recruited = false;
      game.npcState.crewMembers[member.id].betrayed = true;

      betrayals.push(betrayal);
    }

    return betrayals;
  }

  /**
   * Calculate the aggregate bonus from all living crew members for a given type.
   *
   * @param {object} game      - The game state.
   * @param {string} bonusType - One of: 'ambushReduction', 'freeTravel', 'chaseEscapeBonus',
   *                             'combatBonus', 'canDefendTerritory', 'cuttingMultiplier',
   *                             'canCreateProduct', 'passiveIncomeBonus', 'customerBaseSpeed',
   *                             or a role name like 'lookout', 'driver', etc.
   * @returns {number|boolean} - Aggregated value for numeric bonuses, or true/false for boolean.
   */
  function getCrewBonus(game, bonusType) {
    var total = 0;
    var hasBoolean = false;

    for (var i = 0; i < game.crew.length; i++) {
      var member = game.crew[i];
      if (!member.alive) continue;

      var roleData = ROLE_BONUSES[member.role];
      if (!roleData) continue;

      // Check if bonusType matches a role name (returns count of that role)
      if (bonusType === member.role) {
        total += 1;
        continue;
      }

      // Check specific bonus keys
      if (roleData[bonusType] !== undefined) {
        var val = roleData[bonusType];
        if (typeof val === 'boolean') {
          if (val) hasBoolean = true;
        } else if (typeof val === 'number') {
          total += val;
        }
      }
    }

    // For boolean bonuses, return true if any crew member provides it
    if (bonusType === 'freeTravel' || bonusType === 'canDefendTerritory' ||
        bonusType === 'canCreateProduct' || bonusType === 'passiveIncomeBonus') {
      return hasBoolean;
    }

    return total;
  }

  /**
   * Check if a specific crew member is alive.
   *
   * @param {object} game   - The game state.
   * @param {string} crewId - The crew member's id.
   * @returns {boolean}
   */
  function isCrewAlive(game, crewId) {
    // Check active crew first
    for (var i = 0; i < game.crew.length; i++) {
      if (game.crew[i].id === crewId) {
        return game.crew[i].alive;
      }
    }

    // Check npcState for historical record
    ensureNPCState(game);
    var state = game.npcState.crewMembers[crewId];
    if (state && state.alive === false) return false;

    // Template default
    var template = CREW_MEMBERS[crewId];
    return template ? template.alive : false;
  }

  // ---------------------------------------------------------------------------
  // Dialogue Functions
  // ---------------------------------------------------------------------------

  /**
   * Retrieve a dialogue node by NPC id and dialogue id.
   *
   * @param {string} npcId      - The NPC's id (e.g., 'viktor', 'carlos').
   * @param {string} dialogueId - The dialogue tree id (e.g., 'first_meeting', 'intro').
   * @param {string} [nodeId]   - Optional specific node id. Defaults to 'start'.
   * @returns {object|null}     - The dialogue node, or null if not found.
   */
  function getDialogue(npcId, dialogueId, nodeId) {
    var npcTree = DIALOGUE_TREES[npcId];
    if (!npcTree) return null;

    var dialogue = npcTree[dialogueId];
    if (!dialogue || !dialogue.nodes) return null;

    var targetNode = nodeId || 'start';
    return dialogue.nodes[targetNode] || null;
  }

  /**
   * Progress a dialogue by selecting a choice.
   * Applies any effects from the choice and the next node.
   * Checks stat/item requirements.
   *
   * @param {object} game        - The game state.
   * @param {string} npcId       - The NPC's id.
   * @param {string} dialogueId  - The dialogue tree id.
   * @param {string} currentNodeId - Current node id.
   * @param {number} choiceIndex - Index of the chosen option.
   * @returns {{ success: boolean, nextNode?: object, message?: string }}
   */
  function progressDialogue(game, npcId, dialogueId, currentNodeId, choiceIndex) {
    ensureNPCState(game);

    var currentNode = getDialogue(npcId, dialogueId, currentNodeId);
    if (!currentNode) {
      return { success: false, message: 'Dialogue not found.' };
    }

    if (!currentNode.options || currentNode.options.length === 0) {
      // End of dialogue
      applyDialogueEffects(game, currentNode.effects);
      return { success: true, nextNode: null, message: 'End of conversation.' };
    }

    if (choiceIndex < 0 || choiceIndex >= currentNode.options.length) {
      return { success: false, message: 'Invalid dialogue choice.' };
    }

    var choice = currentNode.options[choiceIndex];

    // Check requirements
    if (choice.requirements) {
      if (choice.requirements.stat) {
        var statVal = game.character.stats[choice.requirements.stat] || 0;
        if (statVal < choice.requirements.min) {
          return {
            success: false,
            message: 'Requires ' + choice.requirements.stat + ' of at least ' + choice.requirements.min + '.',
          };
        }
      }
      if (choice.requirements.flag) {
        if (!game.flags[choice.requirements.flag]) {
          return { success: false, message: 'You have not unlocked this option yet.' };
        }
      }
    }

    // Apply choice effects
    applyDialogueEffects(game, choice.effects);

    // Get next node
    if (!choice.nextId) {
      return { success: true, nextNode: null, message: 'End of conversation.' };
    }

    var nextNode = getDialogue(npcId, dialogueId, choice.nextId);
    if (!nextNode) {
      return { success: false, message: 'Dialogue path broken: missing node ' + choice.nextId };
    }

    // Apply next node's entry effects if any
    applyDialogueEffects(game, nextNode.effects);

    // Track progress
    if (!game.npcState.dialogueProgress[npcId]) {
      game.npcState.dialogueProgress[npcId] = {};
    }
    game.npcState.dialogueProgress[npcId][dialogueId] = choice.nextId;

    return { success: true, nextNode: nextNode };
  }

  /**
   * Apply effects from a dialogue node or choice.
   *
   * @param {object} game    - The game state.
   * @param {object} effects - Effects object (karma, relationship, flags, etc.).
   */
  function applyDialogueEffects(game, effects) {
    if (!effects) return;

    if (effects.karma !== undefined && window.Core && window.Core.adjustKarma) {
      window.Core.adjustKarma(game, effects.karma);
    }

    if (effects.relationship) {
      adjustRelationship(
        game,
        effects.relationship.npcId,
        effects.relationship.amount
      );
    }

    if (effects.flags) {
      for (var key in effects.flags) {
        if (effects.flags.hasOwnProperty(key)) {
          game.flags[key] = effects.flags[key];
        }
      }
    }

    if (effects.xp && window.Core && window.Core.addXP) {
      window.Core.addXP(game, effects.xp);
    }

    if (effects.cash) {
      game.resources.cash += effects.cash;
    }

    if (effects.heat && window.Core && window.Core.adjustHeat) {
      window.Core.adjustHeat(game, game.world.currentCity, effects.heat);
    }
  }

  /**
   * Get the relationship level with an NPC.
   *
   * @param {object} game  - The game state.
   * @param {string} npcId - The NPC's id.
   * @returns {number}     - Relationship value (default 0).
   */
  function getNPCRelationship(game, npcId) {
    ensureNPCState(game);
    return game.npcState.relationships[npcId] || 0;
  }

  /**
   * Adjust the relationship level with an NPC, clamped to [-100, 100].
   *
   * @param {object} game   - The game state.
   * @param {string} npcId  - The NPC's id.
   * @param {number} amount - Relationship change.
   * @returns {number}      - New relationship value.
   */
  function adjustRelationship(game, npcId, amount) {
    ensureNPCState(game);

    var current = game.npcState.relationships[npcId] || 0;
    var updated = Math.max(-100, Math.min(100, current + amount));
    game.npcState.relationships[npcId] = updated;
    return updated;
  }

  /**
   * Get available dialogue trees for an NPC based on game progress and flags.
   *
   * @param {object} game  - The game state.
   * @param {string} npcId - The NPC's id.
   * @returns {Array}      - Array of { dialogueId, title, available } objects.
   */
  function getAvailableDialogues(game, npcId) {
    ensureNPCState(game);

    var npcTree = DIALOGUE_TREES[npcId];
    if (!npcTree) return [];

    var available = [];

    if (npcId === 'viktor') {
      // Viktor's dialogues depend on debt status
      if (!game.flags.met_viktor) {
        available.push({
          dialogueId: 'first_meeting',
          title: 'Meet the Loan Shark',
          available: true,
        });
      }

      if (game.flags.met_viktor && game.resources.debt > 0) {
        available.push({
          dialogueId: 'debt_growing',
          title: 'Check In With Viktor',
          available: true,
        });
      }

      if (game.flags.met_viktor && game.resources.debt <= 0 && !game.flags.debt_paid) {
        available.push({
          dialogueId: 'paying_off',
          title: 'Final Payment',
          available: true,
        });
      }

      if (game.flags.debt_paid && !game.flags.viktor_partner && !game.flags.phase2_viktor_alliance) {
        available.push({
          dialogueId: 'partnership_offer',
          title: 'Viktor Has a Proposition',
          available: true,
        });
      }
    } else {
      // For city contacts: check if intro has been completed
      for (var dialogueId in npcTree) {
        if (!npcTree.hasOwnProperty(dialogueId)) continue;

        var progress = game.npcState.dialogueProgress[npcId];
        var completed = progress && progress[dialogueId];

        available.push({
          dialogueId: dialogueId,
          title: formatDialogueTitle(dialogueId),
          available: !completed,
          completed: !!completed,
        });
      }
    }

    return available;
  }

  /**
   * Format a dialogue id into a readable title.
   *
   * @param {string} dialogueId - The dialogue tree id.
   * @returns {string}
   */
  function formatDialogueTitle(dialogueId) {
    return dialogueId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // ---------------------------------------------------------------------------
  // Rival Dealer Functions
  // ---------------------------------------------------------------------------

  /**
   * Initialize rival state on the game if not present.
   *
   * @param {object} game - The game state.
   */
  function ensureRivalState(game) {
    ensureNPCState(game);

    if (Object.keys(game.npcState.rivals).length === 0) {
      for (var id in RIVALS) {
        if (!RIVALS.hasOwnProperty(id)) continue;
        game.npcState.rivals[id] = {
          currentCity: RIVALS[id].currentCity,
          alive: true,
          relationship: 0,
          strength: RIVALS[id].strength,
        };
      }
    }
  }

  /**
   * Update rival positions and territory influence. Call once per day.
   * Rivals may move between their territory cities.
   *
   * @param {object} game - The game state.
   * @returns {Array}     - Array of movement event messages.
   */
  function updateRivals(game) {
    ensureRivalState(game);

    var events = [];

    for (var id in RIVALS) {
      if (!RIVALS.hasOwnProperty(id)) continue;

      var rival = RIVALS[id];
      var state = game.npcState.rivals[id];

      if (!state.alive) continue;

      // 30% chance to move to a different territory city each day
      if (Math.random() < 0.30 && rival.territory.length > 1) {
        var currentIdx = rival.territory.indexOf(state.currentCity);
        var otherCities = rival.territory.filter(function (c) {
          return c !== state.currentCity;
        });

        if (otherCities.length > 0) {
          var newCity = otherCities[Math.floor(Math.random() * otherCities.length)];
          var oldCity = state.currentCity;
          state.currentCity = newCity;

          // Only notify if player is in the new or old city
          if (newCity === game.world.currentCity) {
            events.push(rival.fullName + ' has arrived in ' + newCity + '. Watch your back.');
          } else if (oldCity === game.world.currentCity) {
            events.push(rival.fullName + ' has left ' + oldCity + '.');
          }
        }
      }

      // Rival strength can fluctuate slightly
      if (Math.random() < 0.15) {
        var delta = Math.random() < 0.5 ? 1 : -1;
        state.strength = Math.max(1, Math.min(10, state.strength + delta));
      }
    }

    return events;
  }

  /**
   * Get all rivals currently in a given city.
   *
   * @param {object} game     - The game state.
   * @param {string} cityName - The city to check.
   * @returns {Array}         - Array of rival objects with current state merged.
   */
  function getRivalsInCity(game, cityName) {
    ensureRivalState(game);

    var results = [];

    for (var id in RIVALS) {
      if (!RIVALS.hasOwnProperty(id)) continue;

      var state = game.npcState.rivals[id];
      if (!state.alive) continue;
      if (state.currentCity !== cityName) continue;

      results.push(Object.assign({}, RIVALS[id], {
        currentCity: state.currentCity,
        strength: state.strength,
        relationship: state.relationship,
        alive: state.alive,
      }));
    }

    return results;
  }

  /**
   * Get the price modifier caused by rival presence in a city.
   * More rivals in a city = more competition = lower sell prices.
   *
   * @param {object} game     - The game state.
   * @param {string} cityName - The city to check.
   * @returns {number}        - Price modifier (1.0 = no effect, < 1.0 = lower prices).
   */
  function getRivalPriceEffect(game, cityName) {
    var rivalsHere = getRivalsInCity(game, cityName);
    if (rivalsHere.length === 0) return 1.0;

    // Each rival reduces sell prices by 5-10% depending on their strength
    var totalEffect = 0;
    for (var i = 0; i < rivalsHere.length; i++) {
      totalEffect += 0.05 + (rivalsHere[i].strength / 10) * 0.05;
    }

    return Math.max(0.5, 1.0 - totalEffect);
  }

  // ---------------------------------------------------------------------------
  // NPC Lookup Helpers
  // ---------------------------------------------------------------------------

  /**
   * Get a contact NPC by their id.
   *
   * @param {string} contactId - The contact's id.
   * @returns {object|null}
   */
  function getContact(contactId) {
    return CONTACTS[contactId] || null;
  }

  /**
   * Get all contacts in a given city.
   *
   * @param {string} cityName - The city to check.
   * @returns {Array}
   */
  function getContactsInCity(cityName) {
    return Object.values(CONTACTS).filter(function (c) {
      return c.city === cityName;
    });
  }

  /**
   * Get VIP customers in a given city.
   *
   * @param {string} cityName - The city to check.
   * @returns {Array}
   */
  function getCustomersInCity(cityName) {
    return Object.values(VIP_CUSTOMERS).filter(function (c) {
      return c.city === cityName;
    });
  }

  /**
   * Get a crew member template by id (the base definition, not the recruited instance).
   *
   * @param {string} crewId - The crew member's id.
   * @returns {object|null}
   */
  function getCrewTemplate(crewId) {
    return CREW_MEMBERS[crewId] || null;
  }

  /**
   * Get all phone messages that should be sent based on game state.
   * Generates contextual messages from contacts, crew, and Viktor.
   *
   * @param {object} game - The game state.
   * @returns {Array}     - Array of phone message objects to add.
   */
  function generateNPCMessages(game) {
    ensureNPCState(game);

    var messages = [];
    var day = game.world.day;

    // Viktor warnings based on debt and day
    if (game.resources.debt > 0) {
      if (day === 7) {
        messages.push({
          id: 'viktor_week1',
          from: 'Viktor',
          subject: 'A Friendly Reminder',
          body: 'One week gone. Three more to go. The interest does not sleep. Neither should you.',
          read: false,
          day: day,
          period: window.Core ? window.Core.getPeriodName(game) : 'Morning',
        });
      } else if (day === 14) {
        messages.push({
          id: 'viktor_week2',
          from: 'Viktor',
          subject: 'Halfway',
          body: 'Fourteen days. Your debt is growing faster than your payments. Gregor is getting bored. You do not want Gregor to get bored.',
          read: false,
          day: day,
          period: window.Core ? window.Core.getPeriodName(game) : 'Morning',
        });
      } else if (day === 21) {
        messages.push({
          id: 'viktor_week3',
          from: 'Viktor',
          subject: 'Nine Days',
          body: 'Nine days remain. I have been patient. My patience has an expiration date. It is in nine days.',
          read: false,
          day: day,
          period: window.Core ? window.Core.getPeriodName(game) : 'Morning',
        });
      } else if (day === 27) {
        messages.push({
          id: 'viktor_final',
          from: 'Viktor',
          subject: 'Last Warning',
          body: 'Three days. If I do not have my money, there will be no more messages. Only Gregor. And Gregor does not text.',
          read: false,
          day: day,
          period: window.Core ? window.Core.getPeriodName(game) : 'Morning',
        });
      }
    }

    // Lookout warnings if player has a lookout crew member
    var hasLookout = game.crew.some(function (c) {
      return c.role === 'lookout' && c.alive;
    });
    if (hasLookout) {
      var cityHeat = (game.heat.cities[game.world.currentCity] || 0);
      if (cityHeat > 60) {
        messages.push({
          id: 'lookout_heat_' + day,
          from: 'Your Lookout',
          subject: 'Heat Warning',
          body: 'Heads up. Cops are all over this area. Lay low or move to another city.',
          read: false,
          day: day,
          period: window.Core ? window.Core.getPeriodName(game) : 'Morning',
        });
      }
    }

    return messages;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.NPCs = {
    // Data
    CREW_MEMBERS: CREW_MEMBERS,
    CONTACTS: CONTACTS,
    RIVALS: RIVALS,
    VIP_CUSTOMERS: VIP_CUSTOMERS,
    VIKTOR: VIKTOR,
    DIALOGUE_TREES: DIALOGUE_TREES,
    ROLE_BONUSES: ROLE_BONUSES,

    // Crew management
    getAvailableCrew: getAvailableCrew,
    recruitCrew: recruitCrew,
    fireCrew: fireCrew,
    payCrew: payCrew,
    updateLoyalty: updateLoyalty,
    checkBetrayals: checkBetrayals,
    getCrewBonus: getCrewBonus,
    isCrewAlive: isCrewAlive,
    getCrewTemplate: getCrewTemplate,

    // Dialogue
    getDialogue: getDialogue,
    progressDialogue: progressDialogue,
    getNPCRelationship: getNPCRelationship,
    adjustRelationship: adjustRelationship,
    getAvailableDialogues: getAvailableDialogues,

    // Rivals
    updateRivals: updateRivals,
    getRivalsInCity: getRivalsInCity,
    getRivalPriceEffect: getRivalPriceEffect,

    // NPC lookup
    getContact: getContact,
    getContactsInCity: getContactsInCity,
    getCustomersInCity: getCustomersInCity,
    generateNPCMessages: generateNPCMessages,

    // State management
    ensureNPCState: ensureNPCState,
  };
})();

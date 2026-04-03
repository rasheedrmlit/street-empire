/*
 * PROGRESSION.JS — Street Empire Progression System
 * Skill trees, reputation tiers, achievements, upgrades shop, and prestige/NG+.
 * References window.Core for game state access.
 */

(function () {
  'use strict';

  // ============================================================
  //  SKILL TREE DEFINITIONS
  // ============================================================

  const SKILL_TREE = {
    chemist: {
      id: 'chemist',
      name: 'Chemist',
      emoji: '\uD83E\uDDEA',
      description: 'Master the product. Cut, cook, and create your way to a premium empire.',
      perks: [
        {
          id: 'street_pharmacist',
          tier: 1,
          name: 'Street Pharmacist',
          cost: 1,
          description: 'Can cut soft drugs (normally only hard/pharma). Even weed gets the treatment now.',
          effect: 'Unlocks cutting for soft drug category'
        },
        {
          id: 'quality_control',
          tier: 2,
          name: 'Quality Control',
          cost: 2,
          description: 'Your cuts are cleaner — product keeps 75% quality instead of the usual 50%.',
          effect: 'Cut products retain 75% quality instead of 50%'
        },
        {
          id: 'the_cook',
          tier: 3,
          name: 'The Cook',
          cost: 3,
          description: 'Combine two drugs into a premium product. Chemistry is an art form.',
          effect: 'Unlock product synthesis — combine 2 drugs for premium product'
        },
        {
          id: 'breaking_bad',
          tier: 4,
          name: 'Breaking Bad',
          cost: 4,
          description: 'Your cutting game is legendary — 4x yield instead of 2x.',
          effect: '4x cutting ratio instead of 2x'
        },
        {
          id: 'heisenberg',
          tier: 5,
          name: 'Heisenberg',
          cost: 5,
          description: 'Create "Blue Sky" — your signature product worth 3x market value. Say my name.',
          effect: 'Create Blue Sky signature product worth 3x market value'
        }
      ]
    },

    enforcer: {
      id: 'enforcer',
      name: 'Enforcer',
      emoji: '\uD83D\uDCA5',
      description: 'Rule the streets with iron fists. Fight harder, hold territory, become untouchable.',
      perks: [
        {
          id: 'street_fighter',
          tier: 1,
          name: 'Street Fighter',
          cost: 1,
          description: 'You know how to throw hands. +15% fight success in encounters.',
          effect: '+15% fight success rate'
        },
        {
          id: 'armored_up',
          tier: 2,
          name: 'Armored Up',
          cost: 2,
          description: 'You can take a hit and keep standing. 25% less damage from all sources.',
          effect: 'Reduce damage taken by 25%'
        },
        {
          id: 'crew_commander',
          tier: 3,
          name: 'Crew Commander',
          cost: 3,
          description: 'Your crew fights like a unit. All crew combat bonuses are doubled.',
          effect: 'Crew combat bonuses doubled'
        },
        {
          id: 'warlord',
          tier: 4,
          name: 'Warlord',
          cost: 4,
          description: 'Your territory is a money machine. 2x passive income from all held turf.',
          effect: 'Territory generates 2x passive income'
        },
        {
          id: 'untouchable',
          tier: 5,
          name: 'Untouchable',
          cost: 5,
          description: 'Ghost-like reflexes. 50% chance to completely dodge negative encounter effects.',
          effect: '50% chance to avoid negative encounter effects entirely'
        }
      ]
    },

    networker: {
      id: 'networker',
      name: 'Networker',
      emoji: '\uD83E\uDD1D',
      description: 'Connections are currency. Talk your way up, buy your way out.',
      perks: [
        {
          id: 'smooth_talker',
          tier: 1,
          name: 'Smooth Talker',
          cost: 1,
          description: 'Silver tongue gets results. +15% bribe and bluff success.',
          effect: '+15% bribe and bluff success rate'
        },
        {
          id: 'connected',
          tier: 2,
          name: 'Connected',
          cost: 2,
          description: 'You know people who know people. Unlock VIP clients in every city.',
          effect: 'Unlock exclusive VIP clients in every city'
        },
        {
          id: 'inside_man',
          tier: 3,
          name: 'Inside Man',
          cost: 3,
          description: 'Got a badge on the payroll. Police raid warnings arrive 1 day early via phone.',
          effect: 'Get police raid warnings 1 day early via phone'
        },
        {
          id: 'money_launderer',
          tier: 4,
          name: 'Money Launderer',
          cost: 4,
          description: 'Your businesses are washing machines for cash. 2x laundering capacity per day.',
          effect: 'Businesses launder 2x money per day'
        },
        {
          id: 'kingmaker',
          tier: 5,
          name: 'Kingmaker',
          cost: 5,
          description: 'Everyone has a price. Bribe your way out of ANY encounter, even DEA.',
          effect: 'Can bribe out of any encounter including DEA'
        }
      ]
    }
  };

  // ============================================================
  //  REPUTATION TIERS
  // ============================================================

  const REPUTATION_TIERS = [
    {
      id: 'corner_boy',
      name: 'Corner Boy',
      emoji: '\uD83D\uDEB6',
      minReputation: 0,
      maxReputation: 99,
      description: 'Fresh off the block. Nobody knows your name yet — keep your head down and hustle.',
      unlocks: [
        'Basic drug buying and selling',
        'Access to starter locations',
        '1 crew slot'
      ]
    },
    {
      id: 'shot_caller',
      name: 'Shot Caller',
      emoji: '\uD83D\uDCF1',
      minReputation: 100,
      maxReputation: 499,
      description: 'People are starting to talk. You call some shots on your block now.',
      unlocks: [
        'Better city locations unlocked',
        '2 crew slots',
        'Access to mid-tier suppliers',
        'Can hire lookouts'
      ]
    },
    {
      id: 'block_captain',
      name: 'Block Captain',
      emoji: '\uD83C\uDFD8\uFE0F',
      minReputation: 500,
      maxReputation: 1499,
      description: 'You run the block. Territory is yours for the taking.',
      unlocks: [
        'Territory claiming unlocked',
        'VIP client access',
        '3 crew slots',
        'Can purchase stash houses'
      ]
    },
    {
      id: 'trap_lord',
      name: 'Trap Lord',
      emoji: '\uD83D\uDC51',
      minReputation: 1500,
      maxReputation: 4999,
      description: 'The trap bows to you. Every city knows your product.',
      unlocks: [
        'All city locations unlocked',
        'Can purchase businesses',
        '4 crew slots',
        'Premium supplier access',
        'Bulk deal discounts'
      ]
    },
    {
      id: 'drug_lord',
      name: 'Drug Lord',
      emoji: '\uD83E\uDD85',
      minReputation: 5000,
      maxReputation: 14999,
      description: 'An empire built on powder and paper. The feds know your name too.',
      unlocks: [
        'Exclusive cartel suppliers',
        '5 crew slots (max)',
        'Can own multiple territories per city',
        'Diplomatic immunity in allied territories'
      ]
    },
    {
      id: 'kingpin',
      name: 'Kingpin',
      emoji: '\uD83C\uDFAD',
      minReputation: 15000,
      maxReputation: Infinity,
      description: 'You ARE the game. Legendary status. The streets will never forget your name.',
      unlocks: [
        'Everything unlocked',
        'Legendary supplier prices',
        'Can set market prices in owned territories',
        'Kingpin exclusive encounters',
        'Access to prestige endings'
      ]
    }
  ];

  // ============================================================
  //  ACHIEVEMENTS
  // ============================================================

  const ACHIEVEMENTS = [
    {
      id: 'first_blood',
      name: 'First Blood',
      description: 'Win your first encounter. Welcome to the game.',
      emoji: '\uD83E\uDE78',
      condition: function (game) {
        return (game.stats && game.stats.encountersWon >= 1);
      }
    },
    {
      id: 'drug_dealer_101',
      name: 'Drug Dealer 101',
      description: 'Make your first sale. Everybody starts somewhere.',
      emoji: '\uD83D\uDCB5',
      condition: function (game) {
        return (game.stats && game.stats.totalSales >= 1);
      }
    },
    {
      id: 'five_finger_discount',
      name: 'Five Finger Discount',
      description: 'Find free drugs for the first time. Finders keepers.',
      emoji: '\uD83E\uDD1E',
      condition: function (game) {
        return (game.stats && game.stats.freeFinds >= 1);
      }
    },
    {
      id: 'tourist',
      name: 'Tourist',
      description: 'Visit 5 different cities. Expanding your horizons.',
      emoji: '\uD83C\uDDFA\uD83C\uDDF8',
      condition: function (game) {
        return (game.stats && game.stats.citiesVisited && game.stats.citiesVisited.length >= 5);
      }
    },
    {
      id: 'globe_trotter',
      name: 'Globe Trotter',
      description: 'Visit all 10 cities. Coast to coast, you been everywhere.',
      emoji: '\uD83C\uDF0E',
      condition: function (game) {
        return (game.stats && game.stats.citiesVisited && game.stats.citiesVisited.length >= 10);
      }
    },
    {
      id: 'debt_free',
      name: 'Debt Free',
      description: 'Pay off the loan shark completely. No more looking over your shoulder.',
      emoji: '\uD83D\uDD13',
      condition: function (game) {
        return (game.debt !== undefined && game.debt <= 0);
      }
    },
    {
      id: 'first_100k',
      name: 'First $100K',
      description: 'Reach $100,000 net worth. Six figures, baby.',
      emoji: '\uD83D\uDCB0',
      condition: function (game) {
        var netWorth = _getNetWorth(game);
        return netWorth >= 100000;
      }
    },
    {
      id: 'millionaire',
      name: 'Millionaire',
      description: 'Reach $1,000,000 net worth. From the corner to the penthouse.',
      emoji: '\uD83C\uDFB0',
      condition: function (game) {
        var netWorth = _getNetWorth(game);
        return netWorth >= 1000000;
      }
    },
    {
      id: 'scarface',
      name: 'Scarface',
      description: 'Own territory in Miami. Say hello to my little friend.',
      emoji: '\uD83C\uDF34',
      condition: function (game) {
        return (game.territories && game.territories.some(function (t) {
          return t.city && t.city.toLowerCase() === 'miami';
        }));
      }
    },
    {
      id: 'corner_boy_to_kingpin',
      name: 'Corner Boy to Kingpin',
      description: 'Reach Kingpin reputation tier. You made it to the top.',
      emoji: '\uD83C\uDFC6',
      condition: function (game) {
        return (game.reputation !== undefined && game.reputation >= 15000);
      }
    },
    {
      id: 'crew_chief',
      name: 'Crew Chief',
      description: 'Recruit your first crew member. Strength in numbers.',
      emoji: '\uD83D\uDC65',
      condition: function (game) {
        return (game.crew && game.crew.length >= 1);
      }
    },
    {
      id: 'army',
      name: 'Army',
      description: 'Have 5 crew members simultaneously. You roll deep.',
      emoji: '\uD83C\uDFD4\uFE0F',
      condition: function (game) {
        return (game.crew && game.crew.length >= 5);
      }
    },
    {
      id: 'breaking_bad_achievement',
      name: 'Breaking Bad',
      description: 'Unlock the Heisenberg perk. You are the one who knocks.',
      emoji: '\uD83E\uDDEA',
      condition: function (game) {
        return hasPerk(game, 'heisenberg');
      }
    },
    {
      id: 'untouchable_streak',
      name: 'Untouchable',
      description: 'Win 10 encounters without losing one. Nobody can touch you.',
      emoji: '\uD83D\uDEE1\uFE0F',
      condition: function (game) {
        return (game.stats && game.stats.encounterWinStreak >= 10);
      }
    },
    {
      id: 'houdini',
      name: 'Houdini',
      description: 'Escape 5 police encounters. Now you see me, now you don\'t.',
      emoji: '\uD83C\uDFA9',
      condition: function (game) {
        return (game.stats && game.stats.policeEscapes >= 5);
      }
    },
    {
      id: 'robin_hood',
      name: 'Robin Hood',
      description: 'Karma above 50. You\'re a dealer with a conscience.',
      emoji: '\uD83C\uDFF9',
      condition: function (game) {
        return (game.karma !== undefined && game.karma > 50);
      }
    },
    {
      id: 'villain',
      name: 'Villain',
      description: 'Karma below -50. Pure menace. The streets fear you.',
      emoji: '\uD83D\uDE08',
      condition: function (game) {
        return (game.karma !== undefined && game.karma < -50);
      }
    },
    {
      id: 'clean_money',
      name: 'Clean Money',
      description: 'Own all 3 business types. Legitimate businessman, on paper.',
      emoji: '\uD83C\uDFE2',
      condition: function (game) {
        if (!game.businesses) return false;
        var types = {};
        game.businesses.forEach(function (b) { types[b.type] = true; });
        return Object.keys(types).length >= 3;
      }
    },
    {
      id: 'survivor',
      name: 'Survivor',
      description: 'Reach day 30. Still breathing, still grinding.',
      emoji: '\uD83D\uDCC5',
      condition: function (game) {
        return (game.day !== undefined && game.day >= 30);
      }
    },
    {
      id: 'ghost',
      name: 'Ghost',
      description: 'Complete a game with federal heat below 10. They never even knew you existed.',
      emoji: '\uD83D\uDC7B',
      condition: function (game) {
        return (game.gameComplete && game.federalHeat !== undefined && game.federalHeat < 10);
      }
    },
    {
      id: 'serial_entrepreneur',
      name: 'Serial Entrepreneur',
      description: 'Own safe houses in 5 cities. Real estate mogul of the underworld.',
      emoji: '\uD83C\uDFE0',
      condition: function (game) {
        if (!game.safeHouses) return false;
        var cities = {};
        game.safeHouses.forEach(function (sh) { cities[sh.city] = true; });
        return Object.keys(cities).length >= 5;
      }
    },
    {
      id: 'chemist_achievement',
      name: 'Chemist',
      description: 'Cut product 20 times. You could teach a college course on this.',
      emoji: '\u2697\uFE0F',
      condition: function (game) {
        return (game.stats && game.stats.timesCut >= 20);
      }
    },
    {
      id: 'plug_love',
      name: 'Plug Love',
      description: 'Max relationship with any supplier. Your plug treats you like family.',
      emoji: '\u2764\uFE0F',
      condition: function (game) {
        if (!game.supplierRelations) return false;
        return Object.values(game.supplierRelations).some(function (rel) {
          return rel >= 100;
        });
      }
    },
    {
      id: 'negotiator',
      name: 'Negotiator',
      description: 'Successfully bluff 10 encounters. All talk, all results.',
      emoji: '\uD83D\uDDE3\uFE0F',
      condition: function (game) {
        return (game.stats && game.stats.bluffsSucceeded >= 10);
      }
    },
    {
      id: 'war_machine',
      name: 'War Machine',
      description: 'Win 20 fights. You\'re a walking weapon.',
      emoji: '\uD83D\uDCA2',
      condition: function (game) {
        return (game.stats && game.stats.fightsWon >= 20);
      }
    },
    {
      id: 'speed_runner',
      name: 'Speed Runner',
      description: 'Pay off debt before day 15. Built different.',
      emoji: '\u26A1',
      condition: function (game) {
        return (game.stats && game.stats.debtPaidOffDay !== undefined && game.stats.debtPaidOffDay < 15);
      }
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Meet all city contacts. You know everybody worth knowing.',
      emoji: '\uD83E\uDD8B',
      condition: function (game) {
        return (game.stats && game.stats.allContactsMet === true);
      }
    },
    {
      id: 'quest_master',
      name: 'Quest Master',
      description: 'Complete 10 quests. Making moves, checking boxes.',
      emoji: '\uD83D\uDCCB',
      condition: function (game) {
        return (game.stats && game.stats.questsCompleted >= 10);
      }
    },
    {
      id: 'whale',
      name: 'Whale',
      description: 'Sell $100K in a single transaction. Big fish, big plays.',
      emoji: '\uD83D\uDC33',
      condition: function (game) {
        return (game.stats && game.stats.largestSale >= 100000);
      }
    },
    {
      id: 'ironman',
      name: 'Ironman',
      description: 'Complete Phase 1 without health dropping below 50. Built like a tank.',
      emoji: '\uD83E\uDDBE',
      condition: function (game) {
        return (game.stats && game.stats.phase1Complete && game.stats.healthNeverBelow50 === true);
      }
    }
  ];

  // ============================================================
  //  UPGRADES SHOP
  // ============================================================

  const UPGRADES = [
    {
      id: 'coat_pockets',
      name: 'Coat Pockets',
      description: 'Extra pockets sewn into your jacket. +20 inventory slots.',
      cost: 2000,
      category: 'capacity',
      effect: { inventoryBonus: 20 },
      requires: null
    },
    {
      id: 'duffel_bag',
      name: 'Duffel Bag',
      description: 'A sturdy bag for bigger hauls. +30 inventory slots.',
      cost: 5000,
      category: 'capacity',
      effect: { inventoryBonus: 30 },
      requires: 'coat_pockets'
    },
    {
      id: 'van',
      name: 'Van',
      description: 'A nondescript panel van. +50 inventory slots.',
      cost: 15000,
      category: 'capacity',
      effect: { inventoryBonus: 50 },
      requires: 'duffel_bag'
    },
    {
      id: 'box_truck',
      name: 'Box Truck',
      description: 'Moving serious weight now. +100 inventory slots.',
      cost: 40000,
      category: 'capacity',
      effect: { inventoryBonus: 100 },
      requires: 'van'
    },
    {
      id: 'body_armor',
      name: 'Body Armor',
      description: 'Kevlar vest under the hoodie. Reduce damage by 15%.',
      cost: 3000,
      category: 'defense',
      effect: { damageReduction: 0.15 },
      requires: null
    },
    {
      id: 'burner_phone',
      name: 'Burner Phone',
      description: 'Disposable phone for tips and warnings about upcoming events.',
      cost: 500,
      category: 'intel',
      effect: { eventTips: true },
      requires: null
    },
    {
      id: 'fake_id',
      name: 'Fake ID',
      description: 'Quality fake identification. -10% police encounter chance.',
      cost: 2000,
      category: 'stealth',
      effect: { policeEncounterReduction: 0.10 },
      requires: null
    },
    {
      id: 'lock_box',
      name: 'Lock Box',
      description: 'Small lockbox to keep cash safe. Store $10K safe from mugging.',
      cost: 1000,
      category: 'storage',
      effect: { protectedCash: 10000 },
      requires: null
    },
    {
      id: 'safe',
      name: 'Safe',
      description: 'Heavy-duty safe bolted to the floor. Store $50K safe from mugging.',
      cost: 5000,
      category: 'storage',
      effect: { protectedCash: 50000 },
      requires: 'lock_box'
    },
    {
      id: 'vault',
      name: 'Vault',
      description: 'Bank-grade vault in your stash house. Store $200K safe from mugging.',
      cost: 20000,
      category: 'storage',
      effect: { protectedCash: 200000 },
      requires: 'safe'
    },
    {
      id: 'scanner',
      name: 'Scanner',
      description: 'Police scanner radio. See police presence levels in all cities.',
      cost: 3000,
      category: 'intel',
      effect: { policeVisibility: true },
      requires: null
    },
    {
      id: 'gps_jammer',
      name: 'GPS Jammer',
      description: 'Military-grade signal jammer. -15% federal heat gain.',
      cost: 8000,
      category: 'stealth',
      effect: { federalHeatReduction: 0.15 },
      requires: null
    }
  ];

  // ============================================================
  //  PRESTIGE TITLES
  // ============================================================

  const PRESTIGE_TITLES = [
    'OG',
    'Veteran',
    'Legend',
    'Godfather',
    'Ghost',
    'Immortal',
    'Mythical',
    'Eternal',
    'Supreme',
    'Absolute'
  ];

  // ============================================================
  //  INTERNAL HELPERS
  // ============================================================

  function _getGame() {
    return (window.Core && window.Core.getGame) ? window.Core.getGame() : null;
  }

  function _getNetWorth(game) {
    var cash = game.cash || 0;
    var inventoryValue = 0;
    if (game.inventory && Array.isArray(game.inventory)) {
      game.inventory.forEach(function (item) {
        inventoryValue += (item.quantity || 0) * (item.marketPrice || item.price || 0);
      });
    }
    var debt = game.debt || 0;
    return cash + inventoryValue - debt;
  }

  function _ensureProgressionState(game) {
    if (!game.progression) {
      game.progression = {};
    }
    if (!game.progression.perks) {
      game.progression.perks = [];
    }
    if (!game.progression.upgrades) {
      game.progression.upgrades = [];
    }
    if (!game.progression.achievements) {
      game.progression.achievements = [];
    }
    if (game.progression.skillPoints === undefined) {
      game.progression.skillPoints = 0;
    }
    return game.progression;
  }

  // ============================================================
  //  SKILL TREE FUNCTIONS
  // ============================================================

  /**
   * Returns the full skill tree structure with all branches, tiers, costs, and descriptions.
   */
  function getSkillTree() {
    return JSON.parse(JSON.stringify(SKILL_TREE));
  }

  /**
   * Unlock a perk in a given branch at the specified tier index (0-based).
   * Spends skill points and enforces tier prerequisites.
   * Returns { success, message, perk? }
   */
  function unlockPerk(game, branchName, tierIndex) {
    if (!game) return { success: false, message: 'No active game.' };

    var prog = _ensureProgressionState(game);
    var branch = SKILL_TREE[branchName];

    if (!branch) {
      return { success: false, message: 'Unknown skill branch: ' + branchName };
    }

    if (tierIndex < 0 || tierIndex >= branch.perks.length) {
      return { success: false, message: 'Invalid tier index for ' + branch.name + '.' };
    }

    var perk = branch.perks[tierIndex];

    // Already unlocked?
    if (prog.perks.indexOf(perk.id) !== -1) {
      return { success: false, message: 'You already have "' + perk.name + '" unlocked.' };
    }

    // Check prerequisite (must own previous tier in same branch)
    if (tierIndex > 0) {
      var prevPerk = branch.perks[tierIndex - 1];
      if (prog.perks.indexOf(prevPerk.id) === -1) {
        return {
          success: false,
          message: 'You need "' + prevPerk.name + '" first before unlocking "' + perk.name + '".'
        };
      }
    }

    // Check skill points
    if (prog.skillPoints < perk.cost) {
      return {
        success: false,
        message: 'Not enough skill points. Need ' + perk.cost + ', got ' + prog.skillPoints + '.'
      };
    }

    // Unlock it
    prog.skillPoints -= perk.cost;
    prog.perks.push(perk.id);

    return {
      success: true,
      message: branch.emoji + ' Perk unlocked: "' + perk.name + '" — ' + perk.description,
      perk: perk
    };
  }

  /**
   * Check if the player has a specific perk by ID.
   */
  function hasPerk(game, perkId) {
    if (!game || !game.progression || !game.progression.perks) return false;
    return game.progression.perks.indexOf(perkId) !== -1;
  }

  /**
   * Returns perks the player can currently unlock (has enough points and meets tier prerequisite).
   */
  function getAvailablePerks(game) {
    if (!game) return [];

    var prog = _ensureProgressionState(game);
    var available = [];

    Object.keys(SKILL_TREE).forEach(function (branchKey) {
      var branch = SKILL_TREE[branchKey];
      branch.perks.forEach(function (perk, index) {
        // Skip already owned
        if (prog.perks.indexOf(perk.id) !== -1) return;

        // Check prerequisite
        if (index > 0) {
          var prevPerk = branch.perks[index - 1];
          if (prog.perks.indexOf(prevPerk.id) === -1) return;
        }

        // Check cost
        if (prog.skillPoints >= perk.cost) {
          available.push({
            branch: branchKey,
            branchName: branch.name,
            branchEmoji: branch.emoji,
            tierIndex: index,
            perk: perk
          });
        }
      });
    });

    return available;
  }

  /**
   * Returns the player's current unspent skill points.
   */
  function getSkillPoints(game) {
    if (!game) return 0;
    var prog = _ensureProgressionState(game);
    return prog.skillPoints;
  }

  // ============================================================
  //  REPUTATION FUNCTIONS
  // ============================================================

  /**
   * Returns the player's current reputation tier object.
   */
  function getReputationTier(game) {
    if (!game) return REPUTATION_TIERS[0];

    var rep = game.reputation || 0;
    for (var i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
      if (rep >= REPUTATION_TIERS[i].minReputation) {
        return REPUTATION_TIERS[i];
      }
    }
    return REPUTATION_TIERS[0];
  }

  /**
   * Returns the next reputation tier and progress toward it.
   * Returns null if already at Kingpin.
   */
  function getNextTier(game) {
    if (!game) return { tier: REPUTATION_TIERS[1], current: 0, needed: 100, remaining: 100 };

    var rep = game.reputation || 0;
    var currentTier = getReputationTier(game);
    var currentIndex = REPUTATION_TIERS.indexOf(currentTier);

    if (currentIndex >= REPUTATION_TIERS.length - 1) {
      return null; // Already Kingpin
    }

    var nextTier = REPUTATION_TIERS[currentIndex + 1];
    return {
      tier: nextTier,
      current: rep,
      needed: nextTier.minReputation,
      remaining: nextTier.minReputation - rep
    };
  }

  /**
   * Checks if the player just crossed a reputation tier threshold.
   * Compares current rep against a stored "lastCheckedTier" to detect transitions.
   * Returns newly unlocked tier or null.
   */
  function checkTierUnlocks(game) {
    if (!game) return null;

    var prog = _ensureProgressionState(game);
    var currentTier = getReputationTier(game);

    if (prog.lastTierId !== currentTier.id) {
      var previousTierId = prog.lastTierId;
      prog.lastTierId = currentTier.id;

      // Only notify if upgrading (not first check)
      if (previousTierId !== undefined) {
        return {
          newTier: currentTier,
          message: currentTier.emoji + ' RANK UP! You are now a ' + currentTier.name + '! ' + currentTier.description
        };
      } else {
        prog.lastTierId = currentTier.id;
      }
    }

    return null;
  }

  /**
   * Returns reputation progress as { current, nextThreshold, percentage }.
   */
  function getReputationProgress(game) {
    if (!game) return { current: 0, nextThreshold: 100, percentage: 0 };

    var rep = game.reputation || 0;
    var currentTier = getReputationTier(game);
    var currentIndex = REPUTATION_TIERS.indexOf(currentTier);

    if (currentIndex >= REPUTATION_TIERS.length - 1) {
      return { current: rep, nextThreshold: null, percentage: 100 };
    }

    var nextTier = REPUTATION_TIERS[currentIndex + 1];
    var tierStart = currentTier.minReputation;
    var tierEnd = nextTier.minReputation;
    var progressInTier = rep - tierStart;
    var tierRange = tierEnd - tierStart;
    var percentage = Math.min(100, Math.floor((progressInTier / tierRange) * 100));

    return {
      current: rep,
      nextThreshold: tierEnd,
      percentage: percentage
    };
  }

  // ============================================================
  //  ACHIEVEMENT FUNCTIONS
  // ============================================================

  /**
   * Scan all achievements, return array of newly unlocked ones.
   */
  function checkAchievements(game) {
    if (!game) return [];

    var prog = _ensureProgressionState(game);
    var newlyUnlocked = [];

    ACHIEVEMENTS.forEach(function (ach) {
      // Skip if already unlocked
      if (prog.achievements.indexOf(ach.id) !== -1) return;

      try {
        if (ach.condition(game)) {
          prog.achievements.push(ach.id);
          newlyUnlocked.push({
            id: ach.id,
            name: ach.name,
            description: ach.description,
            emoji: ach.emoji,
            message: ach.emoji + ' ACHIEVEMENT UNLOCKED: ' + ach.name + ' — ' + ach.description
          });
        }
      } catch (e) {
        // Silently skip achievements with evaluation errors
      }
    });

    return newlyUnlocked;
  }

  /**
   * Return all achievements with their unlock status for the current game.
   */
  function getAchievements(game) {
    var prog = (game && game.progression) ? game.progression : { achievements: [] };
    var unlockedSet = prog.achievements || [];

    return ACHIEVEMENTS.map(function (ach) {
      return {
        id: ach.id,
        name: ach.name,
        description: ach.description,
        emoji: ach.emoji,
        unlocked: unlockedSet.indexOf(ach.id) !== -1
      };
    });
  }

  /**
   * Returns achievement progress as { total, unlocked, percentage }.
   */
  function getAchievementProgress(game) {
    var prog = (game && game.progression) ? game.progression : { achievements: [] };
    var unlocked = (prog.achievements || []).length;
    var total = ACHIEVEMENTS.length;

    return {
      total: total,
      unlocked: unlocked,
      percentage: total > 0 ? Math.floor((unlocked / total) * 100) : 0
    };
  }

  // ============================================================
  //  UPGRADES SHOP FUNCTIONS
  // ============================================================

  /**
   * Return available upgrades with purchase status and whether the player can afford them.
   */
  function getUpgradeShop(game) {
    var prog = (game && game.progression) ? game.progression : { upgrades: [] };
    var owned = prog.upgrades || [];
    var cash = (game && game.cash) || 0;

    return UPGRADES.map(function (upg) {
      var isOwned = owned.indexOf(upg.id) !== -1;
      var prereqMet = !upg.requires || owned.indexOf(upg.requires) !== -1;
      var canAfford = cash >= upg.cost;

      return {
        id: upg.id,
        name: upg.name,
        description: upg.description,
        cost: upg.cost,
        category: upg.category,
        effect: upg.effect,
        requires: upg.requires,
        owned: isOwned,
        available: !isOwned && prereqMet && canAfford,
        prereqMet: prereqMet,
        canAfford: canAfford
      };
    });
  }

  /**
   * Purchase an upgrade. Deducts cash and applies the effect.
   * Returns { success, message, upgrade? }
   */
  function buyUpgrade(game, upgradeId) {
    if (!game) return { success: false, message: 'No active game.' };

    var prog = _ensureProgressionState(game);
    var upgrade = UPGRADES.find(function (u) { return u.id === upgradeId; });

    if (!upgrade) {
      return { success: false, message: 'Unknown upgrade: ' + upgradeId };
    }

    if (prog.upgrades.indexOf(upgradeId) !== -1) {
      return { success: false, message: 'You already own "' + upgrade.name + '".' };
    }

    // Check prerequisite
    if (upgrade.requires && prog.upgrades.indexOf(upgrade.requires) === -1) {
      var reqUpgrade = UPGRADES.find(function (u) { return u.id === upgrade.requires; });
      var reqName = reqUpgrade ? reqUpgrade.name : upgrade.requires;
      return {
        success: false,
        message: 'You need "' + reqName + '" before you can buy "' + upgrade.name + '".'
      };
    }

    // Check cash
    if ((game.cash || 0) < upgrade.cost) {
      return {
        success: false,
        message: 'Not enough cash. "' + upgrade.name + '" costs $' + upgrade.cost.toLocaleString() +
                 ' but you only have $' + (game.cash || 0).toLocaleString() + '.'
      };
    }

    // Purchase
    game.cash -= upgrade.cost;
    prog.upgrades.push(upgradeId);

    return {
      success: true,
      message: 'Purchased "' + upgrade.name + '" for $' + upgrade.cost.toLocaleString() + '. ' + upgrade.description,
      upgrade: upgrade
    };
  }

  /**
   * Check if the player owns a specific upgrade by ID.
   */
  function hasUpgrade(game, upgradeId) {
    if (!game || !game.progression || !game.progression.upgrades) return false;
    return game.progression.upgrades.indexOf(upgradeId) !== -1;
  }

  /**
   * Calculate total inventory limit: base capacity + all owned capacity upgrades.
   */
  function getInventoryLimit(game) {
    var baseCapacity = (game && game.baseInventoryLimit) ? game.baseInventoryLimit : 100;
    var bonus = 0;

    if (game && game.progression && game.progression.upgrades) {
      UPGRADES.forEach(function (upg) {
        if (upg.effect.inventoryBonus && game.progression.upgrades.indexOf(upg.id) !== -1) {
          bonus += upg.effect.inventoryBonus;
        }
      });
    }

    return baseCapacity + bonus;
  }

  // ============================================================
  //  PRESTIGE / NEW GAME+ FUNCTIONS
  // ============================================================

  /**
   * Get the current prestige level from localStorage.
   */
  function getPrestigeLevel() {
    try {
      var stored = localStorage.getItem('streetEmpire_prestige');
      return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Save prestige level to localStorage.
   */
  function _setPrestigeLevel(level) {
    try {
      localStorage.setItem('streetEmpire_prestige', String(level));
    } catch (e) {
      // localStorage unavailable
    }
  }

  /**
   * Get prestige-related multipliers for difficulty and rewards.
   */
  function getPrestigeMultiplier(prestigeLevel) {
    if (typeof prestigeLevel !== 'number') prestigeLevel = getPrestigeLevel();

    return {
      prestigeLevel: prestigeLevel,
      debtMultiplier: 1 + (prestigeLevel * 1),         // Starting debt: $5000 x prestige level added
      policeAggression: 1 + (prestigeLevel * 0.15),     // 15% more aggressive police per prestige
      priceUnfavorability: 1 + (prestigeLevel * 0.10),   // 10% worse buy prices per prestige
      xpMultiplier: 1 + (prestigeLevel * 0.25),          // 25% more XP per prestige
      rewardMultiplier: 1 + (prestigeLevel * 0.20),      // 20% better sale prices per prestige
      title: prestigeLevel > 0
        ? (PRESTIGE_TITLES[Math.min(prestigeLevel - 1, PRESTIGE_TITLES.length - 1)])
        : null
    };
  }

  /**
   * Calculate prestige rewards at end of game.
   * Returns the rewards the player will receive on New Game+.
   */
  function calculatePrestige(game) {
    if (!game) return null;

    var currentPrestige = getPrestigeLevel();
    var newPrestige = currentPrestige + 1;
    var cashCarryOver = Math.floor((game.cash || 0) * 0.10);
    var bonusSkillPoints = newPrestige; // 1 skill point per prestige level

    // Gather all achievements (these persist)
    var prog = (game.progression) ? game.progression : { achievements: [] };
    var achievements = prog.achievements || [];

    // Calculate final score
    var score = 0;
    score += Math.floor((game.cash || 0) / 100);
    score += (game.reputation || 0);
    score += (game.day || 0) * 10;
    score += achievements.length * 500;
    score += (prog.perks ? prog.perks.length : 0) * 200;
    if (game.debt <= 0) score += 5000;

    var prestigeTitle = PRESTIGE_TITLES[Math.min(newPrestige - 1, PRESTIGE_TITLES.length - 1)];

    return {
      previousPrestige: currentPrestige,
      newPrestige: newPrestige,
      title: prestigeTitle,
      finalScore: score,
      rewards: {
        cashCarryOver: cashCarryOver,
        bonusSkillPoints: bonusSkillPoints,
        achievementsKept: achievements.length,
        achievements: achievements.slice()
      },
      penalties: {
        startingDebt: 5000 * newPrestige,
        policeAggression: '+' + (newPrestige * 15) + '% police aggression',
        worseprices: '+' + (newPrestige * 10) + '% worse buy prices'
      },
      bonuses: {
        xpMultiplier: '+'  + (newPrestige * 25) + '% XP gain',
        rewardMultiplier: '+' + (newPrestige * 20) + '% sale prices'
      },
      message: '\uD83C\uDF1F PRESTIGE ' + newPrestige + ': "' + prestigeTitle + '" — ' +
               'Starting New Game+ with $' + cashCarryOver.toLocaleString() + ' cash, ' +
               bonusSkillPoints + ' bonus skill points, and all ' + achievements.length + ' achievements.'
    };
  }

  /**
   * Start a New Game+ run. Updates prestige level, creates fresh game state
   * with carried-over bonuses. Returns the new game state object.
   */
  function startNewGamePlus(game) {
    var prestige = calculatePrestige(game);
    if (!prestige) return null;

    // Persist new prestige level
    _setPrestigeLevel(prestige.newPrestige);

    // Persist achievements in localStorage so they survive the reset
    try {
      localStorage.setItem(
        'streetEmpire_achievements',
        JSON.stringify(prestige.rewards.achievements)
      );
    } catch (e) {
      // localStorage unavailable
    }

    // Build new game state — Core should handle the actual game init,
    // but we provide the prestige overrides.
    var newGameOverrides = {
      isNewGamePlus: true,
      prestigeLevel: prestige.newPrestige,
      prestigeTitle: prestige.title,
      cash: prestige.rewards.cashCarryOver,
      debt: prestige.penalties.startingDebt,
      progression: {
        perks: [],
        upgrades: [],
        achievements: prestige.rewards.achievements.slice(),
        skillPoints: prestige.rewards.bonusSkillPoints
      },
      multipliers: getPrestigeMultiplier(prestige.newPrestige)
    };

    // If Core has a newGame function, call it with overrides
    if (window.Core && typeof window.Core.newGame === 'function') {
      return window.Core.newGame(newGameOverrides);
    }

    // Otherwise return the overrides for the caller to apply
    return newGameOverrides;
  }

  /**
   * Load persisted achievements from localStorage (for NG+ continuity).
   */
  function _loadPersistedAchievements() {
    try {
      var stored = localStorage.getItem('streetEmpire_achievements');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Apply persisted achievements to a game state (call after game init on NG+).
   */
  function applyPersistedAchievements(game) {
    if (!game) return;
    var prog = _ensureProgressionState(game);
    var persisted = _loadPersistedAchievements();

    persisted.forEach(function (achId) {
      if (prog.achievements.indexOf(achId) === -1) {
        prog.achievements.push(achId);
      }
    });
  }

  // ============================================================
  //  PUBLIC API
  // ============================================================

  window.Progression = {
    // Data constants
    SKILL_TREE: SKILL_TREE,
    REPUTATION_TIERS: REPUTATION_TIERS,
    ACHIEVEMENTS: ACHIEVEMENTS,
    UPGRADES: UPGRADES,
    PRESTIGE_TITLES: PRESTIGE_TITLES,

    // Skill tree
    getSkillTree: getSkillTree,
    unlockPerk: unlockPerk,
    hasPerk: hasPerk,
    getAvailablePerks: getAvailablePerks,
    getSkillPoints: getSkillPoints,

    // Reputation
    getReputationTier: getReputationTier,
    getNextTier: getNextTier,
    checkTierUnlocks: checkTierUnlocks,
    getReputationProgress: getReputationProgress,

    // Achievements
    checkAchievements: checkAchievements,
    getAchievements: getAchievements,
    getAchievementProgress: getAchievementProgress,

    // Upgrades shop
    getUpgradeShop: getUpgradeShop,
    buyUpgrade: buyUpgrade,
    hasUpgrade: hasUpgrade,
    getInventoryLimit: getInventoryLimit,

    // Prestige / New Game+
    calculatePrestige: calculatePrestige,
    startNewGamePlus: startNewGamePlus,
    getPrestigeLevel: getPrestigeLevel,
    getPrestigeMultiplier: getPrestigeMultiplier,
    applyPersistedAchievements: applyPersistedAchievements
  };

})();

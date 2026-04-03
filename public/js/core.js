/**
 * Street Empire - Core Game Engine
 * =================================
 * Central game state management, character creation, progression systems,
 * and utility functions for the Street Empire drug dealing RPG.
 *
 * Exports: window.Core
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const SAVE_KEY = 'streetEmpire_save';
  const HIGH_SCORES_KEY = 'streetEmpire_highScores';

  const PERIODS = ['Morning', 'Afternoon', 'Night'];

  const STAT_NAMES = ['charisma', 'stealth', 'intimidation', 'streetSmarts', 'stamina'];

  /** XP required to reach a given level: level * 500 */
  const xpForLevel = (level) => level * 500;

  // Base stat template (all stats start at 5 unless backstory overrides)
  const BASE_STATS = {
    charisma: 5,
    stealth: 5,
    intimidation: 5,
    streetSmarts: 5,
    stamina: 5,
  };

  // ---------------------------------------------------------------------------
  // Backstory Definitions
  // ---------------------------------------------------------------------------

  const BACKSTORIES = {
    streetKid: {
      label: 'Street Kid',
      description: 'Grew up on the streets of Detroit. You know every alley, every shortcut, and every trick in the book.',
      startingCity: 'Detroit',
      stats: { charisma: 3, stealth: 9, intimidation: 5, streetSmarts: 9, stamina: 5 },
      startingCash: 5000,
      startingDebt: 5000,
      debtInterestRate: 0.05,
      bonuses: {
        // Extra starting drugs
        drugs: { weed: 10, shrooms: 5 },
        weapons: [],
        contacts: [],
      },
    },

    collegeDropout: {
      label: 'College Dropout',
      description: 'Left university with a silver tongue and empty pockets. Your people skills open doors others never see.',
      startingCity: 'Seattle',
      stats: { charisma: 9, stealth: 5, intimidation: 3, streetSmarts: 6, stamina: 5 },
      startingCash: 7500,
      startingDebt: 5000,
      debtInterestRate: 0.05,
      bonuses: {
        drugs: {},
        weapons: [],
        contacts: [],
      },
    },

    exMilitary: {
      label: 'Ex-Military',
      description: 'Dishonorably discharged but battle-hardened. Nobody wants to be on the wrong side of your temper.',
      startingCity: 'Houston',
      stats: { charisma: 3, stealth: 5, intimidation: 9, streetSmarts: 5, stamina: 9 },
      startingCash: 5000,
      startingDebt: 5000,
      debtInterestRate: 0.05,
      bonuses: {
        drugs: {},
        weapons: [{ id: 'combat_knife', name: 'Combat Knife', damage: 8, condition: 100 }],
        contacts: [],
      },
    },

    cartelRecruit: {
      label: 'Cartel Recruit',
      description: 'You caught the eye of a cartel lieutenant in Miami. Connections come at a price — your debt is steep.',
      startingCity: 'Miami',
      stats: { charisma: 6, stealth: 6, intimidation: 6, streetSmarts: 6, stamina: 6 },
      startingCash: 6000,
      startingDebt: 8000,
      debtInterestRate: 0.07,
      bonuses: {
        drugs: {},
        weapons: [],
        contacts: [{ id: 'cartel_contact', name: 'El Lobo', faction: 'Cartel', trust: 50 }],
      },
    },
  };

  // ---------------------------------------------------------------------------
  // Game Creation
  // ---------------------------------------------------------------------------

  /**
   * Create a brand-new game state from a character name and backstory choice.
   *
   * @param {string} name       - The player's character name.
   * @param {string} backstory  - One of: 'streetKid', 'collegeDropout', 'exMilitary', 'cartelRecruit'.
   * @returns {object}          - The full initial game state.
   */
  function createGame(name, backstory) {
    const bg = BACKSTORIES[backstory];
    if (!bg) {
      throw new Error(`Unknown backstory: "${backstory}". Valid options: ${Object.keys(BACKSTORIES).join(', ')}`);
    }

    const game = {
      // -- Character ----------------------------------------------------------
      character: {
        name: name || 'Unknown',
        backstory,
        level: 1,
        xp: 0,
        stats: { ...bg.stats },
        karma: 0,
        statPoints: 0,
        health: 100,         // current HP
        maxHealth: 100 + (bg.stats.stamina - 5) * 5, // stamina influences max HP
      },

      // -- Resources ----------------------------------------------------------
      resources: {
        cash: bg.startingCash,
        bank: 0,
        debt: bg.startingDebt,
        debtInterestRate: bg.debtInterestRate,
      },

      // -- World --------------------------------------------------------------
      world: {
        currentCity: bg.startingCity,
        currentLocation: 'downtown', // default starting location within city
        day: 1,
        period: 0,   // index into PERIODS: 0=Morning, 1=Afternoon, 2=Night
        phase: 1,    // Phase 1: Days 1-30 (loan shark deadline), Phase 2: 31+
      },

      // -- Heat ---------------------------------------------------------------
      heat: {
        cities: { [bg.startingCity]: 0 },
        federal: 0,
      },

      // -- Inventory ----------------------------------------------------------
      inventory: {
        drugs: { ...bg.bonuses.drugs },
        weapons: [...bg.bonuses.weapons],
        gear: [],
        items: [],
      },
      inventoryLimit: 100,

      // -- Social / Territory -------------------------------------------------
      crew: [],
      territory: {},
      properties: [],  // safe houses, businesses, etc.

      // -- Quests -------------------------------------------------------------
      quests: {
        main: [
          {
            id: 'pay_shark',
            title: 'Pay Off the Loan Shark',
            description: `Pay off your $${bg.startingDebt.toLocaleString()} debt before day 30.`,
            targetAmount: bg.startingDebt,
            progress: 0,
            completed: false,
          },
        ],
        city: {},       // keyed by city name, array of quest objects per city
        completed: [],
      },

      // -- Phone --------------------------------------------------------------
      phone: {
        messages: [
          {
            id: 'welcome',
            from: 'System',
            subject: 'Welcome to the streets',
            body: `Good luck out there, ${name || 'Unknown'}. The clock is ticking.`,
            read: false,
            day: 1,
            period: 'Morning',
          },
        ],
        contacts: [...bg.bonuses.contacts],
      },

      // -- Achievements -------------------------------------------------------
      achievements: [],

      // -- Lifetime Stats -----------------------------------------------------
      stats: {
        totalBought: 0,
        totalSold: 0,
        profitMade: 0,
        peopleMet: 0,
        encountersWon: 0,
        encountersLost: 0,
        citiesVisited: [bg.startingCity],
        daysAlive: 1,
      },

      // -- Settings -----------------------------------------------------------
      settings: {
        musicOn: true,
        sfxOn: true,
      },

      // -- Story Flags --------------------------------------------------------
      flags: {},

      // -- Meta ---------------------------------------------------------------
      gameOver: false,
      highScores: loadHighScores(),
      createdAt: Date.now(),
      lastSaved: null,
    };

    // Auto-save the fresh game
    saveGame(game);

    return game;
  }

  // ---------------------------------------------------------------------------
  // Save / Load
  // ---------------------------------------------------------------------------

  /**
   * Serialize and persist the game state to localStorage.
   * @param {object} game - The full game state object.
   */
  function saveGame(game) {
    try {
      game.lastSaved = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    } catch (err) {
      console.error('Failed to save game:', err);
    }
  }

  /**
   * Load a saved game from localStorage.
   * @returns {object|null} - The parsed game state, or null if none exists.
   */
  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to load game:', err);
      return null;
    }
  }

  /**
   * Delete the saved game from localStorage.
   */
  function deleteSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (err) {
      console.error('Failed to delete save:', err);
    }
  }

  /**
   * Load the high scores array from localStorage.
   * @returns {Array}
   */
  function loadHighScores() {
    try {
      const raw = localStorage.getItem(HIGH_SCORES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Persist the high scores array.
   * @param {Array} scores
   */
  function saveHighScores(scores) {
    try {
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
    } catch (err) {
      console.error('Failed to save high scores:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // Progression: XP & Leveling
  // ---------------------------------------------------------------------------

  /**
   * Award XP to the player and handle level-ups.
   *
   * @param {object} game   - The game state.
   * @param {number} amount - XP to add (must be positive).
   * @returns {{ leveledUp: boolean, newLevel: number }}
   */
  function addXP(game, amount) {
    if (amount <= 0) return { leveledUp: false, newLevel: game.character.level };

    game.character.xp += amount;
    let leveledUp = false;

    // Check for multiple level-ups in case of large XP gains
    while (game.character.xp >= xpForLevel(game.character.level + 1)) {
      game.character.xp -= xpForLevel(game.character.level + 1);
      game.character.level += 1;
      game.character.statPoints += 2;
      leveledUp = true;

      // Recalculate max health on level up (stamina may have changed)
      game.character.maxHealth = 100 + (game.character.stats.stamina - 5) * 5;
      // Heal a bit on level-up
      game.character.health = Math.min(
        game.character.health + 20,
        game.character.maxHealth
      );
    }

    return { leveledUp, newLevel: game.character.level };
  }

  // ---------------------------------------------------------------------------
  // Stat Allocation
  // ---------------------------------------------------------------------------

  /**
   * Spend unallocated stat points to raise a core stat.
   *
   * @param {object} game     - The game state.
   * @param {string} statName - One of the STAT_NAMES.
   * @param {number} points   - How many points to allocate (default 1).
   * @returns {boolean}       - True if allocation succeeded.
   */
  function allocateStat(game, statName, points = 1) {
    if (!STAT_NAMES.includes(statName)) {
      console.warn(`Invalid stat name: "${statName}"`);
      return false;
    }
    if (points < 1 || points > game.character.statPoints) {
      return false;
    }
    // Stats cap at 20
    const current = game.character.stats[statName];
    const canAdd = Math.min(points, 20 - current);
    if (canAdd <= 0) return false;

    game.character.stats[statName] += canAdd;
    game.character.statPoints -= canAdd;

    // If stamina was raised, update max health
    if (statName === 'stamina') {
      game.character.maxHealth = 100 + (game.character.stats.stamina - 5) * 5;
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Karma
  // ---------------------------------------------------------------------------

  /**
   * Adjust the player's karma value, clamped to [-100, 100].
   *
   * @param {object} game   - The game state.
   * @param {number} amount - Positive or negative karma change.
   */
  function adjustKarma(game, amount) {
    game.character.karma = Math.max(-100, Math.min(100, game.character.karma + amount));
  }

  // ---------------------------------------------------------------------------
  // Heat
  // ---------------------------------------------------------------------------

  /**
   * Adjust city heat and update federal heat accordingly.
   * Heat is clamped to [0, 100].
   *
   * @param {object} game     - The game state.
   * @param {string} cityName - The city to adjust heat in.
   * @param {number} amount   - Heat change (positive = more heat).
   */
  function adjustHeat(game, cityName, amount) {
    // Ensure the city has an entry
    if (game.heat.cities[cityName] === undefined) {
      game.heat.cities[cityName] = 0;
    }

    const oldHeat = game.heat.cities[cityName];
    game.heat.cities[cityName] = Math.max(0, Math.min(100, oldHeat + amount));

    // Federal heat slowly accumulates from the average of all city heats
    const cities = Object.values(game.heat.cities);
    const avgHeat = cities.reduce((sum, h) => sum + h, 0) / cities.length;
    // Federal heat drifts toward the average city heat, moving ~10% per update
    const federalDelta = (avgHeat - game.heat.federal) * 0.1;
    // Also bump federal slightly any time city heat rises
    const directBump = amount > 0 ? amount * 0.05 : 0;
    game.heat.federal = Math.max(
      0,
      Math.min(100, game.heat.federal + federalDelta + directBump)
    );
  }

  // ---------------------------------------------------------------------------
  // Time
  // ---------------------------------------------------------------------------

  /**
   * Advance the game clock by one period.
   * Morning -> Afternoon -> Night -> (next day) Morning.
   * On a new day: apply debt interest, increment day counter, check phase.
   *
   * @param {object} game - The game state.
   */
  function advancePeriod(game) {
    game.world.period += 1;

    // Wrap to next day
    if (game.world.period >= PERIODS.length) {
      game.world.period = 0;
      game.world.day += 1;
      game.stats.daysAlive = game.world.day;

      // Apply daily debt interest (compounds on unpaid debt)
      if (game.resources.debt > 0) {
        game.resources.debt = Math.ceil(
          game.resources.debt * (1 + game.resources.debtInterestRate)
        );
      }

      // Phase transition: Day 31+ enters Phase 2 (open world)
      if (game.world.day > 30 && game.world.phase === 1) {
        game.world.phase = 2;
      }

      // Small natural heat decay overnight for every city (-1 per night)
      for (const city of Object.keys(game.heat.cities)) {
        game.heat.cities[city] = Math.max(0, game.heat.cities[city] - 1);
      }

      // Natural health recovery overnight based on stamina
      const staminaMod = getStatModifier(game, 'stamina');
      const healAmount = Math.floor(5 * staminaMod);
      game.character.health = Math.min(
        game.character.health + healAmount,
        game.character.maxHealth
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Utility Helpers
  // ---------------------------------------------------------------------------

  /**
   * Check whether the player can still take actions.
   *
   * @param {object} game - The game state.
   * @returns {boolean}
   */
  function canAct(game) {
    return !game.gameOver && game.character.health > 0;
  }

  /**
   * Convert a stat value (1-20 scale) to a multiplier for calculations.
   * Stat 1 => 0.5x, Stat 10 => 1.0x, Stat 20 => 2.0x (linear interpolation).
   *
   * @param {object} game     - The game state.
   * @param {string} statName - One of the STAT_NAMES.
   * @returns {number}        - Multiplier between 0.5 and 2.0.
   */
  function getStatModifier(game, statName) {
    const value = game.character.stats[statName] || 5;
    // Linear map: 1 -> 0.5, 20 -> 2.0
    // modifier = 0.5 + (value - 1) * (1.5 / 19)
    return +(0.5 + ((value - 1) * 1.5) / 19).toFixed(3);
  }

  /**
   * Calculate the player's total net worth.
   * net worth = cash + bank + drug inventory value + property value - debt
   *
   * Drug values are estimated at a flat "street value" average since market
   * prices fluctuate. Other modules can provide a more accurate valuation.
   *
   * @param {object} game - The game state.
   * @returns {number}
   */
  function calculateNetWorth(game) {
    // Rough street values per unit for estimation
    const DRUG_BASE_VALUES = {
      weed: 15,
      shrooms: 30,
      ecstasy: 50,
      cocaine: 120,
      heroin: 150,
      meth: 100,
      lsd: 40,
      oxy: 80,
      crack: 90,
      molly: 55,
    };

    let drugValue = 0;
    for (const [drug, qty] of Object.entries(game.inventory.drugs)) {
      const unitPrice = DRUG_BASE_VALUES[drug] || 50; // fallback for unknown drugs
      drugValue += unitPrice * qty;
    }

    // Property value: sum of purchase prices if stored, or flat estimate
    const propertyValue = game.properties.reduce((sum, p) => sum + (p.value || 0), 0);

    // Weapon/gear value
    const weaponValue = game.inventory.weapons.reduce((sum, w) => sum + (w.value || 0), 0);
    const gearValue = game.inventory.gear.reduce((sum, g) => sum + (g.value || 0), 0);

    return (
      game.resources.cash +
      game.resources.bank +
      drugValue +
      propertyValue +
      weaponValue +
      gearValue -
      game.resources.debt
    );
  }

  /**
   * Get the human-readable name of the current time period.
   *
   * @param {object} game - The game state.
   * @returns {string}    - 'Morning', 'Afternoon', or 'Night'.
   */
  function getPeriodName(game) {
    return PERIODS[game.world.period] || 'Morning';
  }

  /**
   * Get the total number of items currently in the player's inventory
   * (drug units + weapon count + gear count + item count).
   *
   * @param {object} game - The game state.
   * @returns {number}
   */
  function getInventoryCount(game) {
    const drugUnits = Object.values(game.inventory.drugs).reduce((s, q) => s + q, 0);
    return (
      drugUnits +
      game.inventory.weapons.length +
      game.inventory.gear.length +
      game.inventory.items.length
    );
  }

  /**
   * Check if the player has room in their inventory.
   *
   * @param {object} game  - The game state.
   * @param {number} units - Number of units to add (default 1).
   * @returns {boolean}
   */
  function hasInventorySpace(game, units = 1) {
    return getInventoryCount(game) + units <= game.inventoryLimit;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.Core = {
    // Constants
    BACKSTORIES,
    STAT_NAMES,
    PERIODS,
    xpForLevel,

    // Game lifecycle
    createGame,
    saveGame,
    loadGame,
    deleteSave,

    // Progression
    addXP,
    allocateStat,
    adjustKarma,

    // World systems
    adjustHeat,
    advancePeriod,

    // Utilities
    canAct,
    getStatModifier,
    calculateNetWorth,
    getPeriodName,
    getInventoryCount,
    hasInventorySpace,

    // High scores
    loadHighScores,
    saveHighScores,
  };
})();

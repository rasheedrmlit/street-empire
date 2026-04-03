// ============================================================
// Street Empire - Economy System
// Manages drugs, dynamic pricing, supply chains, product
// cutting, money laundering, customer base, loans, and banking.
// ============================================================

(function () {
  'use strict';

  // ----------------------------------------------------------
  // Drug Definitions
  // ----------------------------------------------------------

  const DRUGS = {
    Weed:     { emoji: '\u{1F33F}', base: 350,   volatility: 0.4,  category: 'soft',        addictiveness: 0.1  },
    Edibles:  { emoji: '\u{1F36C}', base: 200,   volatility: 0.35, category: 'soft',        addictiveness: 0.05 },
    Shrooms:  { emoji: '\u{1F344}', base: 600,   volatility: 0.5,  category: 'psychedelic', addictiveness: 0.1  },
    Molly:    { emoji: '\u{1F48A}', base: 1200,  volatility: 0.55, category: 'party',       addictiveness: 0.3  },
    Cocaine:  { emoji: '\u2744\uFE0F',  base: 15000, volatility: 0.6,  category: 'hard',        addictiveness: 0.7  },
    Crack:    { emoji: '\u{1FAA8}', base: 1500,  volatility: 0.7,  category: 'hard',        addictiveness: 0.9  },
    Heroin:   { emoji: '\u{1F489}', base: 5000,  volatility: 0.65, category: 'hard',        addictiveness: 0.85 },
    Fentanyl: { emoji: '\u2620\uFE0F',  base: 25000, volatility: 0.8,  category: 'hard',        addictiveness: 0.95 },
    Meth:     { emoji: '\u{1F9EA}', base: 3000,  volatility: 0.6,  category: 'hard',        addictiveness: 0.8  },
    Xanax:    { emoji: '\u{1F4A4}', base: 800,   volatility: 0.45, category: 'pharma',      addictiveness: 0.5  },
    Adderall: { emoji: '\u26A1',    base: 500,   volatility: 0.4,  category: 'pharma',      addictiveness: 0.3  },
    Lean:     { emoji: '\u{1F964}', base: 2000,  volatility: 0.5,  category: 'pharma',      addictiveness: 0.4  },
    Ketamine: { emoji: '\u{1F434}', base: 3500,  volatility: 0.55, category: 'psychedelic', addictiveness: 0.2  },
    LSD:      { emoji: '\u{1F308}', base: 1800,  volatility: 0.5,  category: 'psychedelic', addictiveness: 0.05 }
  };

  const DRUG_NAMES = Object.keys(DRUGS);

  // ----------------------------------------------------------
  // Supplier Definitions (per city)
  // ----------------------------------------------------------

  const SUPPLIERS = {
    'Los Santos': [
      {
        id: 'ls_plug_1', name: 'Big Marco', personality: 'Loud and flashy, always wearing gold chains.',
        reliability: 0.85, drugs: ['Weed', 'Edibles', 'Lean', 'Cocaine'],
        discount: 0.75, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'ls_plug_2', name: 'Silent Vee', personality: 'Barely speaks. Texts only. Never late.',
        reliability: 0.95, drugs: ['Meth', 'Fentanyl', 'Heroin', 'Crack'],
        discount: 0.8, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'ls_plug_3', name: 'Dr. Feel', personality: 'Ex-pharmacist. Clean operation, premium product.',
        reliability: 0.9, drugs: ['Xanax', 'Adderall', 'Molly', 'Ketamine'],
        discount: 0.7, relationship: 0, canGetBusted: false, bustedUntilDay: 0
      }
    ],
    'Vice City': [
      {
        id: 'vc_plug_1', name: 'Cuban Pete', personality: 'Old school. Deals in bulk. Trusts no one new.',
        reliability: 0.8, drugs: ['Cocaine', 'Crack', 'Weed', 'Lean'],
        discount: 0.65, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'vc_plug_2', name: 'Neon Nikki', personality: 'Club queen. Knows everyone in the nightlife scene.',
        reliability: 0.75, drugs: ['Molly', 'LSD', 'Ketamine', 'Shrooms'],
        discount: 0.8, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'vc_plug_3', name: 'The Pharmacist', personality: 'Meticulous. Lab coat. Pharmaceutical grade only.',
        reliability: 0.95, drugs: ['Xanax', 'Adderall', 'Fentanyl', 'Heroin'],
        discount: 0.7, relationship: 0, canGetBusted: false, bustedUntilDay: 0
      }
    ],
    'Liberty City': [
      {
        id: 'lc_plug_1', name: 'Brick', personality: 'Runs the projects. Dangerous but consistent.',
        reliability: 0.7, drugs: ['Crack', 'Heroin', 'Fentanyl', 'Meth'],
        discount: 0.6, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'lc_plug_2', name: 'Smooth Eddie', personality: 'Wears suits. Treats it like a business.',
        reliability: 0.9, drugs: ['Cocaine', 'Lean', 'Weed', 'Edibles'],
        discount: 0.75, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'lc_plug_3', name: 'Trippy Tina', personality: 'Lives in a van. Festival circuit supplier.',
        reliability: 0.65, drugs: ['LSD', 'Shrooms', 'Molly', 'Ketamine'],
        discount: 0.85, relationship: 0, canGetBusted: false, bustedUntilDay: 0
      }
    ],
    'San Fierro': [
      {
        id: 'sf_plug_1', name: 'Tech Bao', personality: 'Silicon Valley connections. Encrypted everything.',
        reliability: 0.9, drugs: ['Adderall', 'Molly', 'LSD', 'Ketamine'],
        discount: 0.7, relationship: 0, canGetBusted: false, bustedUntilDay: 0
      },
      {
        id: 'sf_plug_2', name: 'Mama Rosa', personality: 'Runs a taqueria as front. Family operation.',
        reliability: 0.85, drugs: ['Weed', 'Edibles', 'Cocaine', 'Meth'],
        discount: 0.75, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'sf_plug_3', name: 'Ghost', personality: 'No one has seen his face. Dead drops only.',
        reliability: 0.6, drugs: ['Fentanyl', 'Heroin', 'Crack', 'Xanax'],
        discount: 0.6, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      }
    ],
    'Las Venturas': [
      {
        id: 'lv_plug_1', name: 'Casino Carl', personality: 'High roller. Only deals at the tables.',
        reliability: 0.75, drugs: ['Cocaine', 'Molly', 'Lean', 'Xanax'],
        discount: 0.7, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'lv_plug_2', name: 'Desert Fox', personality: 'Lives off-grid. Cooks in the desert.',
        reliability: 0.8, drugs: ['Meth', 'Crack', 'Fentanyl', 'Heroin'],
        discount: 0.65, relationship: 0, canGetBusted: true, bustedUntilDay: 0
      },
      {
        id: 'lv_plug_3', name: 'Pixie', personality: 'Rave organizer. Glitter and good vibes.',
        reliability: 0.7, drugs: ['LSD', 'Shrooms', 'Ketamine', 'Edibles', 'Weed'],
        discount: 0.8, relationship: 0, canGetBusted: false, bustedUntilDay: 0
      }
    ]
  };

  // ----------------------------------------------------------
  // VIP Client Templates
  // ----------------------------------------------------------

  const VIP_CLIENTS = [
    { name: 'Jordan Whitmore',  title: 'Wall Street Banker',    preferredDrugs: ['Cocaine', 'Adderall'],          spendMultiplier: 2.0 },
    { name: 'Dex Holloway',     title: 'Hollywood Producer',    preferredDrugs: ['Cocaine', 'Molly', 'Lean'],     spendMultiplier: 1.8 },
    { name: 'Sanjay Patel',     title: 'Tech CEO',              preferredDrugs: ['Adderall', 'LSD', 'Ketamine'],  spendMultiplier: 1.7 },
    { name: 'Marcus "Blitz" T', title: 'Pro Athlete',           preferredDrugs: ['Lean', 'Weed', 'Xanax'],        spendMultiplier: 1.5 },
    { name: 'Senator Graves',   title: 'Politician',            preferredDrugs: ['Cocaine', 'Xanax', 'Adderall'], spendMultiplier: 1.9 }
  ];

  // ----------------------------------------------------------
  // Helper Utilities
  // ----------------------------------------------------------

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  /** Retrieve Core module if available, otherwise provide safe defaults. */
  function getCore() {
    return window.Core || null;
  }

  /** Get a stat modifier from Core (e.g. charisma price discount). */
  function getStatModifier(game, stat) {
    var core = getCore();
    if (core && typeof core.getStatModifier === 'function') {
      return core.getStatModifier(game, stat);
    }
    return 1;
  }

  // ----------------------------------------------------------
  // Price History
  // ----------------------------------------------------------

  function ensurePriceHistory(game) {
    if (!game.priceHistory) {
      game.priceHistory = {};
    }
    DRUG_NAMES.forEach(function (name) {
      if (!game.priceHistory[name]) {
        game.priceHistory[name] = [];
      }
    });
  }

  function recordPrice(game, drugName, price) {
    ensurePriceHistory(game);
    var history = game.priceHistory[drugName];
    history.push(Math.round(price));
    if (history.length > 10) {
      history.shift();
    }
  }

  function getPriceTrend(game, drugName) {
    ensurePriceHistory(game);
    var history = game.priceHistory[drugName];
    if (history.length < 2) return 'stable';
    var recent = history[history.length - 1];
    var prev = history[history.length - 2];
    var pctChange = (recent - prev) / prev;
    if (pctChange > 0.1) return 'rising';
    if (pctChange < -0.1) return 'falling';
    return 'stable';
  }

  // ----------------------------------------------------------
  // Dynamic Pricing
  // ----------------------------------------------------------

  /**
   * Generate market prices for all drugs for the current location / time.
   * Mutates game.prices and game.priceHistory.
   */
  function generatePrices(game) {
    if (!game.prices) game.prices = {};
    ensurePriceHistory(game);

    var cityHeatMod = 1 + (game.heat || 0) * 0.005;          // higher heat = slightly higher prices
    var locationMod = (game.locationPriceModifier || 1);      // set by location module
    var hour = game.hour || 12;
    var isNight = hour >= 22 || hour < 5;
    var dayProgression = 1 + ((game.day || 1) - 1) * 0.02;   // prices creep up 2% per day

    DRUG_NAMES.forEach(function (name) {
      var drug = DRUGS[name];
      var base = drug.base;

      // Time-of-day: party/club drugs get a night premium
      var timeMod = 1;
      if (isNight && (drug.category === 'party' || drug.category === 'psychedelic')) {
        timeMod = 1.3;
      }

      // Supply/demand: if player has been selling a lot in this city, demand dips
      var demandMod = 1;
      if (game.cityDemand && game.cityDemand[game.currentCity]) {
        var sold = game.cityDemand[game.currentCity][name] || 0;
        demandMod = Math.max(0.5, 1 - sold * 0.01);
      }

      // Random volatility swing
      var swing = 1 + (Math.random() * 2 - 1) * drug.volatility;

      // Event multipliers (set by events system, applied once then cleared)
      var eventMod = 1;
      if (game.priceMultipliers && game.priceMultipliers[name]) {
        eventMod = game.priceMultipliers[name];
      }

      var finalPrice = base * cityHeatMod * locationMod * timeMod * demandMod * swing * dayProgression * eventMod;
      finalPrice = Math.max(Math.round(finalPrice), 1);

      game.prices[name] = finalPrice;
      recordPrice(game, name, finalPrice);
    });

    // Reset event multipliers after applying
    game.priceMultipliers = {};

    return game.prices;
  }

  // ----------------------------------------------------------
  // Supply Chain
  // ----------------------------------------------------------

  /** Initialise suppliers in game state for the given city. */
  function ensureSuppliers(game) {
    if (!game.suppliers) {
      game.suppliers = {};
      Object.keys(SUPPLIERS).forEach(function (city) {
        game.suppliers[city] = SUPPLIERS[city].map(function (s) {
          return Object.assign({}, s);
        });
      });
    }
  }

  /** Get suppliers available in the player's current city (not busted). */
  function getAvailableSuppliers(game) {
    ensureSuppliers(game);
    var city = game.currentCity;
    if (!game.suppliers[city]) return [];
    var day = game.day || 1;
    return game.suppliers[city].filter(function (s) {
      return s.bustedUntilDay <= day;
    });
  }

  /** Find a supplier by ID across all cities. */
  function findSupplier(game, supplierId) {
    ensureSuppliers(game);
    var cities = Object.keys(game.suppliers);
    for (var i = 0; i < cities.length; i++) {
      var list = game.suppliers[cities[i]];
      for (var j = 0; j < list.length; j++) {
        if (list[j].id === supplierId) return list[j];
      }
    }
    return null;
  }

  /**
   * Buy drugs from a supplier at a discount off market price.
   * Returns { success, message, cost?, qty? }
   */
  function buyFromSupplier(game, supplierId, drugName, qty) {
    var supplier = findSupplier(game, supplierId);
    if (!supplier) return { success: false, message: 'Supplier not found.' };

    var day = game.day || 1;
    if (supplier.bustedUntilDay > day) {
      return { success: false, message: supplier.name + ' is off the grid right now. Try again in a few days.' };
    }

    if (supplier.drugs.indexOf(drugName) === -1) {
      return { success: false, message: supplier.name + ' doesn\'t carry ' + drugName + '.' };
    }

    // Reliability check: supplier might flake
    if (Math.random() > supplier.reliability) {
      return { success: false, message: supplier.name + ' didn\'t show up. Unreliable as usual.' };
    }

    var marketPrice = (game.prices && game.prices[drugName]) || DRUGS[drugName].base;
    var relationshipDiscount = 1 - (supplier.relationship / 100) * 0.15; // up to 15% extra off
    var unitCost = Math.round(marketPrice * supplier.discount * relationshipDiscount);
    var totalCost = unitCost * qty;

    var cash = (game.dirtyMoney || 0) + (game.cleanMoney || 0);
    if (totalCost > cash) {
      return { success: false, message: 'Not enough cash. Need $' + totalCost.toLocaleString() + '.' };
    }

    // Check inventory space
    var inventoryUsed = getInventoryCount(game);
    var inventoryMax = game.inventoryMax || 100;
    if (inventoryUsed + qty > inventoryMax) {
      return { success: false, message: 'Not enough inventory space. ' + (inventoryMax - inventoryUsed) + ' slots left.' };
    }

    // Deduct cash (prefer dirty money first)
    deductCash(game, totalCost);

    // Add to inventory
    if (!game.inventory) game.inventory = {};
    if (!game.inventory[drugName]) {
      game.inventory[drugName] = { qty: 0, quality: 100 };
    }
    game.inventory[drugName].qty += qty;

    // Busted check for supplier
    if (supplier.canGetBusted && Math.random() < 0.05) {
      supplier.bustedUntilDay = day + randInt(3, 7);
    }

    // Small relationship boost from doing business
    supplier.relationship = Math.min(100, supplier.relationship + 1);

    return {
      success: true,
      message: 'Bought ' + qty + 'x ' + drugName + ' from ' + supplier.name + ' for $' + totalCost.toLocaleString() + '.',
      cost: totalCost,
      qty: qty
    };
  }

  /** Improve relationship with a supplier (gift, favour, etc.). */
  function improveRelationship(game, supplierId, amount) {
    var supplier = findSupplier(game, supplierId);
    if (!supplier) return { success: false, message: 'Supplier not found.' };
    amount = amount || 5;
    supplier.relationship = Math.min(100, supplier.relationship + amount);
    return {
      success: true,
      message: 'Relationship with ' + supplier.name + ' improved to ' + supplier.relationship + '.',
      relationship: supplier.relationship
    };
  }

  // ----------------------------------------------------------
  // Inventory Helpers
  // ----------------------------------------------------------

  function getInventoryCount(game) {
    if (!game.inventory) return 0;
    var total = 0;
    Object.keys(game.inventory).forEach(function (d) {
      total += game.inventory[d].qty || 0;
    });
    return total;
  }

  function deductCash(game, amount) {
    var remaining = amount;
    // Spend dirty money first
    if (game.dirtyMoney && game.dirtyMoney > 0) {
      var fromDirty = Math.min(game.dirtyMoney, remaining);
      game.dirtyMoney -= fromDirty;
      remaining -= fromDirty;
    }
    if (remaining > 0 && game.cleanMoney && game.cleanMoney > 0) {
      var fromClean = Math.min(game.cleanMoney, remaining);
      game.cleanMoney -= fromClean;
      remaining -= fromClean;
    }
    return remaining; // should be 0 if caller checked affordability
  }

  function getTotalCash(game) {
    return (game.dirtyMoney || 0) + (game.cleanMoney || 0);
  }

  // ----------------------------------------------------------
  // Product Cutting
  // ----------------------------------------------------------

  /**
   * Cut a product to double quantity at the cost of quality.
   * Only hard and pharma category drugs can be cut.
   * Requires "Chemist" skill for better ratios.
   */
  function cutProduct(game, drugName, qty) {
    var drug = DRUGS[drugName];
    if (!drug) return { success: false, message: 'Unknown drug: ' + drugName };

    if (drug.category !== 'hard' && drug.category !== 'pharma') {
      return { success: false, message: drugName + ' cannot be cut. Only hard and pharma drugs can be cut.' };
    }

    if (!game.inventory || !game.inventory[drugName] || game.inventory[drugName].qty < qty) {
      return { success: false, message: 'Not enough ' + drugName + ' in inventory.' };
    }

    var hasChemist = game.skills && game.skills.Chemist;
    var qtyMultiplier = hasChemist ? 2.5 : 2.0;
    var qualityPenalty = hasChemist ? 0.35 : 0.5;

    var entry = game.inventory[drugName];
    var originalQty = entry.qty;
    var addedQty = Math.floor(qty * (qtyMultiplier - 1));
    entry.qty += addedQty;
    entry.quality = Math.max(5, Math.round(entry.quality * (1 - qualityPenalty)));

    // Karma hit for cutting dangerous drugs
    var karmaHit = 0;
    if (drugName === 'Fentanyl') {
      karmaHit = -15;
    } else if (drug.category === 'hard') {
      karmaHit = -5;
    } else {
      karmaHit = -2;
    }
    if (game.karma !== undefined) {
      game.karma = clamp(game.karma + karmaHit, -100, 100);
    }

    return {
      success: true,
      message: 'Cut ' + qty + 'x ' + drugName + '. Inventory: ' + entry.qty + ' (was ' + originalQty + '). Quality now ' + entry.quality + '%.',
      newQty: entry.qty,
      quality: entry.quality,
      karmaChange: karmaHit
    };
  }

  // ----------------------------------------------------------
  // Customer Base
  // ----------------------------------------------------------

  function ensureCustomerBase(game, cityName) {
    if (!game.customerBase) game.customerBase = {};
    if (!game.customerBase[cityName]) {
      game.customerBase[cityName] = { street: 5, regular: 0, vip: 0, vipClients: [] };
    }
    return game.customerBase[cityName];
  }

  /** Build up customer base in a city over time. */
  function buildCustomerBase(game, cityName, tier) {
    var base = ensureCustomerBase(game, cityName);
    tier = tier || 'street';

    var charismaMod = getStatModifier(game, 'charisma');
    var gain = Math.max(1, Math.round(rand(1, 3) * charismaMod));

    if (tier === 'street') {
      base.street += gain;
    } else if (tier === 'regular') {
      // Regulars grow slower
      if (base.street >= 10) {
        var promoted = Math.min(gain, Math.floor(base.street * 0.1));
        base.regular += promoted;
        base.street -= promoted;
      }
    } else if (tier === 'vip') {
      // VIP only if you have regulars and reputation
      if (base.regular >= 5 && (game.reputation || 0) >= 30) {
        base.vip += 1;
        base.regular -= 1;
        // Assign a named VIP client
        if (base.vipClients.length < VIP_CLIENTS.length) {
          var available = VIP_CLIENTS.filter(function (vc) {
            return base.vipClients.indexOf(vc.name) === -1;
          });
          if (available.length > 0) {
            var chosen = available[randInt(0, available.length - 1)];
            base.vipClients.push(chosen.name);
          }
        }
      }
    }

    return {
      success: true,
      message: 'Customer base in ' + cityName + ': Street=' + base.street + ', Regular=' + base.regular + ', VIP=' + base.vip,
      base: Object.assign({}, base)
    };
  }

  /** How much demand exists for a drug in a city based on customer base. */
  function getCustomerDemand(game, cityName) {
    var base = ensureCustomerBase(game, cityName);
    var demand = {};
    DRUG_NAMES.forEach(function (name) {
      var drug = DRUGS[name];
      // Base demand from customer counts weighted by addictiveness
      var streetDemand = base.street * (1 + drug.addictiveness) * rand(0.5, 1.5);
      var regularDemand = base.regular * (1.5 + drug.addictiveness) * rand(0.8, 1.2);
      var vipDemand = base.vip * (2 + drug.addictiveness) * rand(0.9, 1.1);
      demand[name] = Math.round(streetDemand + regularDemand + vipDemand);
    });
    return demand;
  }

  /**
   * Sell to a specific customer tier.
   * Returns { success, message, revenue, reputationChange }
   */
  function sellToCustomers(game, drugName, qty, tier) {
    tier = tier || 'street';

    if (!game.inventory || !game.inventory[drugName] || game.inventory[drugName].qty < qty) {
      return { success: false, message: 'Not enough ' + drugName + ' to sell.' };
    }

    var cityName = game.currentCity;
    var base = ensureCustomerBase(game, cityName);

    // Verify customer availability
    var customerCount = base[tier] || 0;
    if (customerCount <= 0) {
      return { success: false, message: 'No ' + tier + ' customers in ' + cityName + '.' };
    }

    // Max quantity this tier can absorb
    var maxBuy;
    if (tier === 'street') maxBuy = Math.min(qty, customerCount * 2);
    else if (tier === 'regular') maxBuy = Math.min(qty, customerCount * 5);
    else maxBuy = Math.min(qty, customerCount * 10);

    var actualQty = Math.min(qty, maxBuy);
    if (actualQty <= 0) {
      return { success: false, message: 'Customers can\'t absorb that much right now.' };
    }

    var marketPrice = (game.prices && game.prices[drugName]) || DRUGS[drugName].base;
    var entry = game.inventory[drugName];
    var quality = entry.quality || 100;

    // Price modifiers per tier
    var tierMultiplier = 1;
    if (tier === 'regular') tierMultiplier = 1.15;
    if (tier === 'vip') {
      tierMultiplier = 1.5;
      // Check if a VIP client has a preference bonus
      var vipBonus = 1;
      if (base.vipClients && base.vipClients.length > 0) {
        VIP_CLIENTS.forEach(function (vc) {
          if (base.vipClients.indexOf(vc.name) !== -1 && vc.preferredDrugs.indexOf(drugName) !== -1) {
            vipBonus = Math.max(vipBonus, vc.spendMultiplier);
          }
        });
      }
      tierMultiplier *= vipBonus;
    }

    // Quality modifier: low quality = lower price
    var qualityMod = 0.5 + (quality / 100) * 0.5; // 50%-100% of price based on quality

    // Charisma modifier
    var charismaMod = getStatModifier(game, 'charisma');

    var unitPrice = Math.round(marketPrice * tierMultiplier * qualityMod * charismaMod);
    var revenue = unitPrice * actualQty;

    // Deduct from inventory
    entry.qty -= actualQty;
    if (entry.qty <= 0) {
      delete game.inventory[drugName];
    }

    // Revenue is dirty money
    if (!game.dirtyMoney) game.dirtyMoney = 0;
    game.dirtyMoney += revenue;

    // Track city demand saturation
    if (!game.cityDemand) game.cityDemand = {};
    if (!game.cityDemand[cityName]) game.cityDemand[cityName] = {};
    if (!game.cityDemand[cityName][drugName]) game.cityDemand[cityName][drugName] = 0;
    game.cityDemand[cityName][drugName] += actualQty;

    // Reputation change based on quality
    var repChange = 0;
    if (quality >= 80) repChange = Math.round(actualQty * 0.5);
    else if (quality >= 50) repChange = 0;
    else repChange = -Math.round(actualQty * 0.5);

    if (game.reputation !== undefined) {
      game.reputation = clamp((game.reputation || 0) + repChange, 0, 100);
    }

    // VIP sales draw more attention
    if (tier === 'vip') {
      if (game.heat !== undefined) game.heat = Math.min(100, (game.heat || 0) + 3);
    }

    return {
      success: true,
      message: 'Sold ' + actualQty + 'x ' + drugName + ' to ' + tier + ' customers for $' + revenue.toLocaleString() + '.',
      revenue: revenue,
      actualQty: actualQty,
      reputationChange: repChange
    };
  }

  // ----------------------------------------------------------
  // Core Buy / Sell (general market transactions)
  // ----------------------------------------------------------

  /**
   * Buy drug from the open market at current prices.
   */
  function buyDrug(game, drugName, qty, locationModifier) {
    var drug = DRUGS[drugName];
    if (!drug) return { success: false, message: 'Unknown drug.' };

    locationModifier = locationModifier || 1;
    var marketPrice = (game.prices && game.prices[drugName]) || drug.base;
    var charismaMod = getStatModifier(game, 'charisma');
    // Charisma lowers buy price
    var unitCost = Math.round(marketPrice * locationModifier / charismaMod);
    var totalCost = unitCost * qty;

    if (totalCost > getTotalCash(game)) {
      return { success: false, message: 'Not enough cash. Need $' + totalCost.toLocaleString() + '.' };
    }

    var inventoryUsed = getInventoryCount(game);
    var inventoryMax = game.inventoryMax || 100;
    if (inventoryUsed + qty > inventoryMax) {
      return { success: false, message: 'Inventory full. ' + (inventoryMax - inventoryUsed) + ' slots left.' };
    }

    deductCash(game, totalCost);

    if (!game.inventory) game.inventory = {};
    if (!game.inventory[drugName]) {
      game.inventory[drugName] = { qty: 0, quality: 100 };
    }
    game.inventory[drugName].qty += qty;

    return {
      success: true,
      message: 'Bought ' + qty + 'x ' + drugName + ' for $' + totalCost.toLocaleString() + '.',
      cost: totalCost,
      unitCost: unitCost,
      qty: qty
    };
  }

  /**
   * Sell drug on the open market at current prices.
   */
  function sellDrug(game, drugName, qty, locationModifier, customerTier) {
    var drug = DRUGS[drugName];
    if (!drug) return { success: false, message: 'Unknown drug.' };

    if (!game.inventory || !game.inventory[drugName] || game.inventory[drugName].qty < qty) {
      return { success: false, message: 'Not enough ' + drugName + ' in inventory.' };
    }

    // If a customer tier is specified, delegate to sellToCustomers
    if (customerTier && customerTier !== 'market') {
      return sellToCustomers(game, drugName, qty, customerTier);
    }

    locationModifier = locationModifier || 1;
    var marketPrice = (game.prices && game.prices[drugName]) || drug.base;
    var entry = game.inventory[drugName];
    var quality = entry.quality || 100;
    var qualityMod = 0.5 + (quality / 100) * 0.5;
    var charismaMod = getStatModifier(game, 'charisma');

    var unitPrice = Math.round(marketPrice * locationModifier * qualityMod * charismaMod);
    var revenue = unitPrice * qty;

    entry.qty -= qty;
    if (entry.qty <= 0) {
      delete game.inventory[drugName];
    }

    if (!game.dirtyMoney) game.dirtyMoney = 0;
    game.dirtyMoney += revenue;

    // Track demand saturation
    var cityName = game.currentCity;
    if (cityName) {
      if (!game.cityDemand) game.cityDemand = {};
      if (!game.cityDemand[cityName]) game.cityDemand[cityName] = {};
      if (!game.cityDemand[cityName][drugName]) game.cityDemand[cityName][drugName] = 0;
      game.cityDemand[cityName][drugName] += qty;
    }

    return {
      success: true,
      message: 'Sold ' + qty + 'x ' + drugName + ' for $' + revenue.toLocaleString() + '.',
      revenue: revenue,
      unitPrice: unitPrice,
      qty: qty
    };
  }

  // ----------------------------------------------------------
  // Money Laundering
  // ----------------------------------------------------------

  /**
   * Launder dirty money through owned businesses.
   * Each business can process a fixed amount per day.
   * Returns { success, message, laundered }
   */
  function launderMoney(game, amount) {
    if (!game.dirtyMoney || game.dirtyMoney <= 0) {
      return { success: false, message: 'No dirty money to launder.' };
    }

    amount = Math.min(amount, game.dirtyMoney);

    // Calculate daily laundering capacity from businesses
    var businesses = game.businesses || [];
    if (businesses.length === 0) {
      return { success: false, message: 'You need to own a business to launder money. Buy a front first.' };
    }

    var dailyCapacity = 0;
    businesses.forEach(function (biz) {
      dailyCapacity += biz.launderCapacity || 5000;
    });

    // Track how much has been laundered today
    if (!game.launderedToday) game.launderedToday = 0;
    var remaining = dailyCapacity - game.launderedToday;

    if (remaining <= 0) {
      return { success: false, message: 'Businesses are maxed out for today. Capacity resets tomorrow.' };
    }

    var toLaunder = Math.min(amount, remaining);
    var fee = Math.round(toLaunder * 0.15); // 15% laundering fee
    var netClean = toLaunder - fee;

    game.dirtyMoney -= toLaunder;
    if (!game.cleanMoney) game.cleanMoney = 0;
    game.cleanMoney += netClean;
    game.launderedToday += toLaunder;

    return {
      success: true,
      message: 'Laundered $' + toLaunder.toLocaleString() + ' through your businesses. Fee: $' + fee.toLocaleString() + '. Clean: $' + netClean.toLocaleString() + '.',
      laundered: toLaunder,
      fee: fee,
      netClean: netClean
    };
  }

  /**
   * Check if dirty money is drawing federal attention.
   * Called each day by the game loop.
   */
  function checkDirtyMoneyHeat(game) {
    var dirty = game.dirtyMoney || 0;
    if (dirty > 50000) {
      var heatGain = Math.round((dirty - 50000) / 10000);
      if (!game.federalHeat) game.federalHeat = 0;
      game.federalHeat = Math.min(100, game.federalHeat + heatGain);
      return {
        warning: true,
        message: 'Feds are noticing your cash flow. Federal heat +' + heatGain + '.',
        federalHeat: game.federalHeat
      };
    }
    return { warning: false };
  }

  /** Reset daily laundering capacity (called on new day). */
  function resetDailyLaundering(game) {
    game.launderedToday = 0;
  }

  // ----------------------------------------------------------
  // Loan Shark
  // ----------------------------------------------------------

  function borrowMoney(game, amount) {
    if (!game.debt) game.debt = 0;
    var maxDebt = 50000;

    if (amount <= 0) return { success: false, message: 'Invalid amount.' };
    if (game.debt + amount > maxDebt) {
      return { success: false, message: 'Loan shark won\'t lend more than $' + maxDebt.toLocaleString() + ' total. Current debt: $' + game.debt.toLocaleString() + '.' };
    }

    game.debt += amount;
    if (!game.dirtyMoney) game.dirtyMoney = 0;
    game.dirtyMoney += amount; // loan cash is technically dirty

    return {
      success: true,
      message: 'Borrowed $' + amount.toLocaleString() + ' from the loan shark. Total debt: $' + game.debt.toLocaleString() + '.',
      debt: game.debt
    };
  }

  function repayDebt(game, amount) {
    if (!game.debt || game.debt <= 0) {
      return { success: false, message: 'You don\'t owe anything.' };
    }

    amount = Math.min(amount, game.debt);

    if (amount > getTotalCash(game)) {
      return { success: false, message: 'Not enough cash to repay $' + amount.toLocaleString() + '.' };
    }

    deductCash(game, amount);
    game.debt -= amount;

    return {
      success: true,
      message: 'Repaid $' + amount.toLocaleString() + '. Remaining debt: $' + game.debt.toLocaleString() + '.',
      debt: game.debt
    };
  }

  /**
   * Apply daily interest to loan and check threat levels.
   * Called each new day by the game loop.
   * Returns { debt, warning?, combatEncounter? }
   */
  function processLoanDaily(game) {
    if (!game.debt || game.debt <= 0) return { debt: 0 };

    // 10% compound interest per day
    game.debt = Math.round(game.debt * 1.10);

    var result = { debt: game.debt };

    if (game.debt > 40000) {
      result.combatEncounter = true;
      result.warning = 'The loan shark sent goons after you!';
    } else if (game.debt > 30000) {
      result.warning = 'The loan shark is getting impatient. "You better have my money soon..."';
    }

    // Bad ending check
    if ((game.day || 1) >= 30 && game.debt > 0) {
      result.badEnding = true;
      result.warning = 'Day 30 reached with outstanding debt. The loan shark caught up to you...';
    }

    return result;
  }

  // ----------------------------------------------------------
  // Bank
  // ----------------------------------------------------------

  function depositBank(game, amount) {
    if (amount <= 0) return { success: false, message: 'Invalid amount.' };

    var cash = getTotalCash(game);
    if (amount > cash) {
      return { success: false, message: 'Not enough cash on hand.' };
    }

    deductCash(game, amount);
    if (!game.bankBalance) game.bankBalance = 0;
    game.bankBalance += amount;

    return {
      success: true,
      message: 'Deposited $' + amount.toLocaleString() + ' in the bank. Balance: $' + game.bankBalance.toLocaleString() + '.',
      bankBalance: game.bankBalance
    };
  }

  function withdrawBank(game, amount) {
    if (amount <= 0) return { success: false, message: 'Invalid amount.' };

    if (!game.bankBalance || amount > game.bankBalance) {
      return { success: false, message: 'Insufficient bank balance.' };
    }

    game.bankBalance -= amount;
    if (!game.cleanMoney) game.cleanMoney = 0;
    game.cleanMoney += amount; // bank money comes out clean

    return {
      success: true,
      message: 'Withdrew $' + amount.toLocaleString() + ' from the bank. Balance: $' + game.bankBalance.toLocaleString() + '.',
      bankBalance: game.bankBalance
    };
  }

  /**
   * Federal seizure check. If federal heat > 80, bank funds are at risk.
   * Called when federal heat changes or on certain events.
   */
  function checkFederalSeizure(game) {
    var federalHeat = game.federalHeat || 0;
    if (federalHeat > 80 && game.bankBalance && game.bankBalance > 0) {
      // Probability of seizure scales with heat
      var seizureChance = (federalHeat - 80) / 100; // 0-20% chance
      if (Math.random() < seizureChance) {
        var seized = game.bankBalance;
        game.bankBalance = 0;
        return {
          seized: true,
          amount: seized,
          message: 'FEDERAL SEIZURE: The feds froze and seized $' + seized.toLocaleString() + ' from your bank account!'
        };
      }
    }
    return { seized: false };
  }

  // ----------------------------------------------------------
  // Day-End Economy Processing
  // ----------------------------------------------------------

  /**
   * Called at the start of each new day to process economy events:
   * - Reset demand saturation slightly
   * - Process loan interest
   * - Check dirty money heat
   * - Reset laundering capacity
   */
  function processDayEnd(game) {
    var results = [];

    // Decay city demand saturation (demand recovers over time)
    if (game.cityDemand) {
      Object.keys(game.cityDemand).forEach(function (city) {
        Object.keys(game.cityDemand[city]).forEach(function (drug) {
          game.cityDemand[city][drug] = Math.max(0, game.cityDemand[city][drug] - 5);
        });
      });
    }

    // Loan shark
    var loanResult = processLoanDaily(game);
    if (loanResult.warning) results.push(loanResult);

    // Dirty money heat
    var heatResult = checkDirtyMoneyHeat(game);
    if (heatResult.warning) results.push(heatResult);

    // Federal seizure check
    var seizureResult = checkFederalSeizure(game);
    if (seizureResult.seized) results.push(seizureResult);

    // Reset laundering
    resetDailyLaundering(game);

    return results;
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  window.Economy = {
    DRUGS: DRUGS,
    DRUG_NAMES: DRUG_NAMES,
    SUPPLIERS: SUPPLIERS,
    VIP_CLIENTS: VIP_CLIENTS,

    // Pricing
    generatePrices: generatePrices,
    getPriceTrend: getPriceTrend,
    ensurePriceHistory: ensurePriceHistory,

    // Supply chain
    getAvailableSuppliers: getAvailableSuppliers,
    buyFromSupplier: buyFromSupplier,
    improveRelationship: improveRelationship,

    // Cutting
    cutProduct: cutProduct,

    // Customer base
    buildCustomerBase: buildCustomerBase,
    getCustomerDemand: getCustomerDemand,
    sellToCustomers: sellToCustomers,

    // Core buy/sell
    buyDrug: buyDrug,
    sellDrug: sellDrug,

    // Money laundering
    launderMoney: launderMoney,
    checkDirtyMoneyHeat: checkDirtyMoneyHeat,
    resetDailyLaundering: resetDailyLaundering,

    // Loan shark
    borrowMoney: borrowMoney,
    repayDebt: repayDebt,
    processLoanDaily: processLoanDaily,

    // Bank
    depositBank: depositBank,
    withdrawBank: withdrawBank,
    checkFederalSeizure: checkFederalSeizure,

    // Day processing
    processDayEnd: processDayEnd,

    // Utilities
    getInventoryCount: getInventoryCount,
    getTotalCash: getTotalCash
  };

})();

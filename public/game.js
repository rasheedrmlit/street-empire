// ============================================================
// STREET EMPIRE — Game Engine
// ============================================================

const CITIES = [
  { name: "Miami", flavor: "Vice City vibes. Product flows through the port like water.", heat: 0.7 },
  { name: "New York", flavor: "The biggest market in the country. Sky-high prices, sky-high risk.", heat: 0.9 },
  { name: "Los Angeles", flavor: "Hollywood money meets cartel supply lines.", heat: 0.6 },
  { name: "Chicago", flavor: "The crossroads. Every crew in the Midwest moves through here.", heat: 0.8 },
  { name: "Houston", flavor: "Border proximity keeps supply cheap and plentiful.", heat: 0.5 },
  { name: "Detroit", flavor: "Hard streets, desperate customers, and razor-thin margins.", heat: 0.85 },
  { name: "Atlanta", flavor: "The hub of the South. Trap music was born here for a reason.", heat: 0.65 },
  { name: "Philadelphia", flavor: "East coast grit. The opioid crisis hit this city hard.", heat: 0.75 },
  { name: "Las Vegas", flavor: "Party town. Recreational demand is through the roof.", heat: 0.4 },
  { name: "Seattle", flavor: "Tech money and liberal attitudes make for a unique market.", heat: 0.35 }
];

const DRUGS = [
  { name: "Weed",         emoji: "🌿", basePrice: 350,    volatility: 0.4, category: "soft" },
  { name: "Edibles",      emoji: "🍬", basePrice: 200,    volatility: 0.35, category: "soft" },
  { name: "Shrooms",      emoji: "🍄", basePrice: 600,    volatility: 0.5, category: "psychedelic" },
  { name: "Molly",        emoji: "💊", basePrice: 1200,   volatility: 0.55, category: "party" },
  { name: "Cocaine",      emoji: "❄️", basePrice: 15000,  volatility: 0.6, category: "hard" },
  { name: "Crack",        emoji: "🪨", basePrice: 1500,   volatility: 0.7, category: "hard" },
  { name: "Heroin",       emoji: "💉", basePrice: 5000,   volatility: 0.65, category: "hard" },
  { name: "Fentanyl",     emoji: "☠️", basePrice: 25000,  volatility: 0.8, category: "hard" },
  { name: "Meth",         emoji: "🧪", basePrice: 3000,   volatility: 0.6, category: "hard" },
  { name: "Xanax",        emoji: "💤", basePrice: 800,    volatility: 0.45, category: "pharma" },
  { name: "Adderall",     emoji: "⚡", basePrice: 500,    volatility: 0.4, category: "pharma" },
  { name: "Lean",         emoji: "🥤", basePrice: 2000,   volatility: 0.5, category: "pharma" },
  { name: "Ketamine",     emoji: "🐴", basePrice: 3500,   volatility: 0.55, category: "psychedelic" },
  { name: "LSD",          emoji: "🌈", basePrice: 1800,   volatility: 0.5, category: "psychedelic" }
];

const RANDOM_EVENTS = [
  {
    type: "bust",
    title: "POLICE RAID!",
    messages: [
      "DEA agents kick in the door! You barely escape!",
      "Undercover cop tries to set you up!",
      "SWAT team raids the block! Everyone scatters!"
    ],
    effect: (game) => {
      const lostItems = [];
      for (const drug in game.inventory) {
        if (game.inventory[drug] > 0 && Math.random() < 0.5) {
          const lost = Math.ceil(game.inventory[drug] * (0.3 + Math.random() * 0.4));
          game.inventory[drug] -= lost;
          lostItems.push(`${lost} ${drug}`);
        }
      }
      game.health -= Math.floor(Math.random() * 15) + 5;
      return lostItems.length > 0
        ? `You lost: ${lostItems.join(", ")}. Health took a hit.`
        : "You got away clean but took some damage running.";
    }
  },
  {
    type: "mugging",
    title: "MUGGED!",
    messages: [
      "A crew catches you slipping in the alley!",
      "Armed robbers corner you at a red light!",
      "Some fiends try to jack your stash!"
    ],
    effect: (game) => {
      const stolen = Math.floor(game.cash * (0.1 + Math.random() * 0.2));
      game.cash -= stolen;
      game.health -= Math.floor(Math.random() * 10) + 5;
      return `They took $${stolen.toLocaleString()} and roughed you up.`;
    }
  },
  {
    type: "find",
    title: "LUCKY FIND!",
    messages: [
      "You find a stash someone ditched running from the cops!",
      "A rival dealer's spot got raided — you grab what's left!",
      "Someone drops a bag during a deal gone wrong!"
    ],
    effect: (game) => {
      const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
      const qty = Math.floor(Math.random() * 8) + 2;
      game.inventory[drug.name] = (game.inventory[drug.name] || 0) + qty;
      return `You scored ${qty} units of ${drug.emoji} ${drug.name}!`;
    }
  },
  {
    type: "price_spike",
    title: "PRICE SURGE!",
    messages: [
      "A massive shipment got intercepted — prices are skyrocketing!",
      "A celebrity overdose makes the news — demand explodes!",
      "Border crackdown chokes supply lines!"
    ],
    effect: (game) => {
      const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
      game.priceMultipliers[drug.name] = 2.5 + Math.random() * 2;
      return `${drug.emoji} ${drug.name} prices just went through the roof!`;
    }
  },
  {
    type: "price_crash",
    title: "PRICE CRASH!",
    messages: [
      "A massive shipment just landed — the market is flooded!",
      "A new lab opened up — supply is everywhere!",
      "Feds busted the competition — fire sale on seized product!"
    ],
    effect: (game) => {
      const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
      game.priceMultipliers[drug.name] = 0.15 + Math.random() * 0.25;
      return `${drug.emoji} ${drug.name} prices just bottomed out! Time to buy!`;
    }
  },
  {
    type: "heal",
    title: "STREET DOCTOR",
    messages: [
      "You find a back-alley doc who patches you up.",
      "Your connect hooks you up with a medic.",
      "A friendly nurse at the clinic helps you out, no questions asked."
    ],
    effect: (game) => {
      const healed = Math.min(100 - game.health, Math.floor(Math.random() * 25) + 15);
      game.health += healed;
      return `Recovered ${healed} health. Feeling better.`;
    }
  },
  {
    type: "tip",
    title: "HOT TIP!",
    messages: [
      "Your boy on the inside gives you intel...",
      "A dirty cop slips you some info...",
      "Word on the street is..."
    ],
    effect: (game) => {
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
      return `${drug.emoji} ${drug.name} is about to blow up in ${city.name}. Might want to stock up.`;
    }
  }
];

// ============================================================
// Game State
// ============================================================

function createGame() {
  const game = {
    day: 1,
    maxDays: 30,
    cash: 2000,
    debt: 5000,
    debtInterestRate: 0.10,
    bank: 0,
    health: 100,
    maxHealth: 100,
    reputation: 0,
    city: CITIES[0],
    inventory: {},
    inventoryLimit: 100,
    prices: {},
    priceMultipliers: {},
    priceHistory: {},
    gameOver: false,
    highScores: JSON.parse(localStorage.getItem('streetEmpireScores') || '[]'),
    eventLog: [],
    stats: {
      totalBought: 0,
      totalSold: 0,
      profitMade: 0,
      citiesVisited: new Set(),
      busts: 0
    }
  };

  DRUGS.forEach(d => {
    game.inventory[d.name] = 0;
    game.priceMultipliers[d.name] = 1;
    game.priceHistory[d.name] = [];
  });

  generatePrices(game);
  return game;
}

function generatePrices(game) {
  const cityHeat = game.city.heat;
  DRUGS.forEach(drug => {
    const cityFactor = 0.6 + Math.random() * 0.8;
    const volatilitySwing = 1 + (Math.random() - 0.5) * 2 * drug.volatility;
    const heatFactor = drug.category === "hard" ? (1 + cityHeat * 0.3) : 1;
    const dayFactor = 1 + (game.day / game.maxDays) * 0.2;
    const multiplier = game.priceMultipliers[drug.name] || 1;

    let price = Math.round(drug.basePrice * cityFactor * volatilitySwing * heatFactor * dayFactor * multiplier);
    price = Math.max(Math.round(drug.basePrice * 0.1), price);
    game.prices[drug.name] = price;

    game.priceHistory[drug.name].push(price);
    if (game.priceHistory[drug.name].length > 10) {
      game.priceHistory[drug.name].shift();
    }
  });

  // Reset multipliers after applying
  DRUGS.forEach(d => { game.priceMultipliers[d.name] = 1; });
}

function getInventoryCount(game) {
  return Object.values(game.inventory).reduce((a, b) => a + b, 0);
}

function buyDrug(game, drugName, qty) {
  const price = game.prices[drugName];
  const totalCost = price * qty;
  const spaceLeft = game.inventoryLimit - getInventoryCount(game);

  if (qty > spaceLeft) return { success: false, msg: `Only room for ${spaceLeft} more units.` };
  if (totalCost > game.cash) return { success: false, msg: `Not enough cash. Need $${totalCost.toLocaleString()}.` };

  game.cash -= totalCost;
  game.inventory[drugName] += qty;
  game.stats.totalBought += totalCost;
  return { success: true, msg: `Bought ${qty} ${drugName} for $${totalCost.toLocaleString()}.` };
}

function sellDrug(game, drugName, qty) {
  if (game.inventory[drugName] < qty) return { success: false, msg: `You only have ${game.inventory[drugName]}.` };

  const price = game.prices[drugName];
  const totalRevenue = price * qty;
  game.cash += totalRevenue;
  game.inventory[drugName] -= qty;
  game.stats.totalSold += totalRevenue;
  game.stats.profitMade += totalRevenue;
  game.reputation += Math.floor(totalRevenue / 1000);
  return { success: true, msg: `Sold ${qty} ${drugName} for $${totalRevenue.toLocaleString()}.` };
}

function travelTo(game, cityIndex) {
  const newCity = CITIES[cityIndex];
  if (newCity.name === game.city.name) return { success: false, msg: "You're already here." };

  game.city = newCity;
  game.day++;
  game.stats.citiesVisited.add(newCity.name);

  // Accumulate debt interest
  if (game.debt > 0) {
    game.debt = Math.round(game.debt * (1 + game.debtInterestRate));
  }

  generatePrices(game);

  // Random event chance (40%)
  let event = null;
  if (Math.random() < 0.4) {
    event = triggerRandomEvent(game);
  }

  if (game.health <= 0) {
    game.health = 0;
    game.gameOver = true;
  }

  if (game.day > game.maxDays) {
    game.gameOver = true;
  }

  return { success: true, event, city: newCity };
}

function triggerRandomEvent(game) {
  const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  const msg = ev.messages[Math.floor(Math.random() * ev.messages.length)];
  const result = ev.effect(game);
  if (ev.type === "bust") game.stats.busts++;

  return { type: ev.type, title: ev.title, message: msg, result };
}

function payDebt(game, amount) {
  amount = Math.min(amount, game.cash, game.debt);
  if (amount <= 0) return { success: false, msg: "No debt to pay or no cash." };
  game.cash -= amount;
  game.debt -= amount;
  return { success: true, msg: `Paid $${amount.toLocaleString()} toward debt. Remaining: $${game.debt.toLocaleString()}` };
}

function borrowMoney(game, amount) {
  const maxBorrow = 50000 - game.debt;
  if (amount > maxBorrow) return { success: false, msg: `Shark won't lend more than $${maxBorrow.toLocaleString()} more.` };
  if (amount <= 0) return { success: false, msg: "Enter an amount to borrow." };
  game.cash += amount;
  game.debt += amount;
  return { success: true, msg: `Borrowed $${amount.toLocaleString()}. Total debt: $${game.debt.toLocaleString()}. Interest: ${(game.debtInterestRate*100)}% per day.` };
}

function depositBank(game, amount) {
  amount = Math.min(amount, game.cash);
  if (amount <= 0) return { success: false, msg: "No cash to deposit." };
  game.cash -= amount;
  game.bank += amount;
  return { success: true, msg: `Deposited $${amount.toLocaleString()}. Bank: $${game.bank.toLocaleString()}` };
}

function withdrawBank(game, amount) {
  amount = Math.min(amount, game.bank);
  if (amount <= 0) return { success: false, msg: "Nothing in the bank." };
  game.bank -= amount;
  game.cash += amount;
  return { success: true, msg: `Withdrew $${amount.toLocaleString()}. Bank: $${game.bank.toLocaleString()}` };
}

function calculateFinalScore(game) {
  const netWorth = game.cash + game.bank - game.debt;
  const inventoryValue = DRUGS.reduce((sum, drug) => {
    return sum + (game.inventory[drug.name] * drug.basePrice);
  }, 0);
  return netWorth + inventoryValue + (game.reputation * 10);
}

function saveHighScore(game, name) {
  const score = calculateFinalScore(game);
  game.highScores.push({ name, score, date: new Date().toLocaleDateString() });
  game.highScores.sort((a, b) => b.score - a.score);
  game.highScores = game.highScores.slice(0, 10);
  localStorage.setItem('streetEmpireScores', JSON.stringify(game.highScores));
}

// Export for use
window.GameEngine = {
  CITIES, DRUGS, RANDOM_EVENTS,
  createGame, generatePrices, getInventoryCount,
  buyDrug, sellDrug, travelTo, triggerRandomEvent,
  payDebt, borrowMoney, depositBank,
  withdrawBank,
  calculateFinalScore, saveHighScore
};

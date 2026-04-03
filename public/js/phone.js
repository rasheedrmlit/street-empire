// ============================================================
// STREET EMPIRE — Burner Phone / Messaging System
// In-game phone UI for tips, threats, crew texts, story beats
// ============================================================

(function() {
  'use strict';

  // Message types determine styling and behavior
  const MSG_TYPES = {
    THREAT: 'threat',
    TIP: 'tip',
    CREW: 'crew',
    STORY: 'story',
    CONTACT: 'contact',
    ALERT: 'alert',
    SHARK: 'shark',
    NEWS: 'news',
    SYSTEM: 'system'
  };

  // ── Pre-built message templates ──
  const MESSAGE_TEMPLATES = {
    // Loan shark escalation messages
    shark_intro: {
      sender: "Viktor 💀",
      type: MSG_TYPES.SHARK,
      text: "Welcome to the game, kid. You owe me $%DEBT%. Don't make me come find you. Clock's ticking. ⏰",
      portrait: "💀"
    },
    shark_reminder_mild: {
      sender: "Viktor 💀",
      type: MSG_TYPES.SHARK,
      texts: [
        "Just a friendly reminder... $%DEBT% and counting. Interest doesn't sleep. 😤",
        "Tick tock. You still owe me $%DEBT%. I'm losing patience.",
        "My accountant says you're behind. $%DEBT%. Fix it."
      ],
      portrait: "💀"
    },
    shark_reminder_angry: {
      sender: "Viktor 💀",
      type: MSG_TYPES.SHARK,
      texts: [
        "You think this is a joke? $%DEBT%. I'm sending my boys. 🔪",
        "Last warning before things get ugly. $%DEBT%. Pay up or bleed.",
        "I know where you are. I know where your family is. $%DEBT%. NOW."
      ],
      portrait: "💀"
    },
    shark_paid: {
      sender: "Viktor 💀",
      type: MSG_TYPES.SHARK,
      text: "Well well well... you actually paid up. Maybe you're not as stupid as you look. We should talk business. 🤝",
      portrait: "💀"
    },

    // Crew messages
    crew_hired: {
      sender: "%NAME%",
      type: MSG_TYPES.CREW,
      text: "Yo, I'm in. Just tell me where you need me. 💪",
      portrait: "👤"
    },
    crew_loyalty_low: {
      sender: "%NAME%",
      type: MSG_TYPES.CREW,
      texts: [
        "Bro you haven't paid me in days. What's good?",
        "I'm out here risking my neck and you can't even pay on time? 😤",
        "Other people are making offers. Just saying..."
      ],
      portrait: "👤"
    },
    crew_loyalty_high: {
      sender: "%NAME%",
      type: MSG_TYPES.CREW,
      texts: [
        "Ride or die, boss. Whatever you need. 💯",
        "We're eating good. Appreciate you keeping it real.",
        "I got your back no matter what. 🤝"
      ],
      portrait: "👤"
    },
    crew_warning: {
      sender: "%NAME%",
      type: MSG_TYPES.CREW,
      texts: [
        "Heads up — I'm seeing unmarked cars on the block. Stay low. 🚔",
        "Yo, watch yourself today. Something feels off out here.",
        "Police scanner is going crazy. They might be planning something."
      ],
      portrait: "👤"
    },

    // Contact/NPC messages
    contact_intro: {
      sender: "%NAME%",
      type: MSG_TYPES.CONTACT,
      text: "Heard about you. Come find me in %CITY%. I might have work. 📍",
      portrait: "🤵"
    },
    contact_quest: {
      sender: "%NAME%",
      type: MSG_TYPES.CONTACT,
      text: "Got something for you. Come see me. It's urgent. 🔥",
      portrait: "🤵"
    },

    // Tips
    tip_price: {
      sender: "Street Intel 📡",
      type: MSG_TYPES.TIP,
      texts: [
        "Word is %DRUG% prices about to spike in %CITY%. Stock up now. 📈",
        "%DRUG% just got scarce in %CITY%. Prices going through the roof.",
        "Big shipment of %DRUG% just hit %CITY%. Prices crashing. Buy buy buy. 📉"
      ],
      portrait: "📡"
    },
    tip_danger: {
      sender: "Street Intel 📡",
      type: MSG_TYPES.TIP,
      texts: [
        "DEA rolling heavy in %CITY% today. Stay away if you're dirty. 🚨",
        "Heard there's a sting operation going down in %CITY%. Watch out.",
        "Feds just got a tip about operations in %CITY%. Lay low."
      ],
      portrait: "📡"
    },
    tip_opportunity: {
      sender: "Street Intel 📡",
      type: MSG_TYPES.TIP,
      texts: [
        "A rival's stash house in %CITY% just got raided. Easy pickings if you move fast. 💰",
        "New connect just arrived in %CITY%. Premium product at wholesale. 🔌",
        "VIP client in %CITY% looking for a new supplier. Big money. 💎"
      ],
      portrait: "📡"
    },

    // News
    news_bust: {
      sender: "BREAKING NEWS 📰",
      type: MSG_TYPES.NEWS,
      texts: [
        "Major drug bust in %CITY%. 50 arrests. Street prices expected to surge.",
        "DEA operation in %CITY% seizes millions in product. Supply chain disrupted.",
        "Police chief announces crackdown in %CITY%. Dealers on high alert."
      ],
      portrait: "📰"
    },
    news_celebrity: {
      sender: "TMZ ALERT 📰",
      type: MSG_TYPES.NEWS,
      texts: [
        "CELEBRITY OVERDOSE: Famous rapper hospitalized in %CITY%. Demand for %DRUG% exploding.",
        "Hollywood star caught with %DRUG% at %CITY% hotel. Media frenzy.",
        "Pro athlete suspended after testing positive for %DRUG%. Street demand surges."
      ],
      portrait: "📰"
    },

    // System
    system_save: {
      sender: "System",
      type: MSG_TYPES.SYSTEM,
      text: "Game saved. 💾",
      portrait: "💾"
    },
    system_achievement: {
      sender: "Achievement Unlocked! 🏆",
      type: MSG_TYPES.SYSTEM,
      text: "%NAME% — %DESC%",
      portrait: "🏆"
    },
    system_levelup: {
      sender: "LEVEL UP! ⬆️",
      type: MSG_TYPES.SYSTEM,
      text: "You reached Level %LEVEL%! +2 stat points available.",
      portrait: "⬆️"
    },
    system_reputation: {
      sender: "Street Rep 👑",
      type: MSG_TYPES.SYSTEM,
      text: "Your reputation has grown. You're now known as: %TIER%. New opportunities unlocked.",
      portrait: "👑"
    }
  };

  // ── Phone State ──
  let unreadCount = 0;
  let phoneOpen = false;

  // ── Create a message from template ──
  function createMessage(templateId, replacements = {}) {
    const template = MESSAGE_TEMPLATES[templateId];
    if (!template) return null;

    // Pick random text if template has multiple
    let text = template.text;
    if (template.texts) {
      text = template.texts[Math.floor(Math.random() * template.texts.length)];
    }

    // Apply replacements
    let sender = template.sender;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `%${key.toUpperCase()}%`;
      text = text.split(placeholder).join(value);
      sender = sender.split(placeholder).join(value);
    }

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sender,
      type: template.type,
      text,
      portrait: template.portrait,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      day: null, // Set by sendMessage
      period: null,
      read: false
    };
  }

  // ── Send a message to the player's phone ──
  function sendMessage(game, templateId, replacements = {}) {
    const msg = createMessage(templateId, replacements);
    if (!msg) return null;

    msg.day = game.world.day;
    msg.period = game.world.period;

    game.phone.messages.unshift(msg); // Newest first

    // Keep max 50 messages
    if (game.phone.messages.length > 50) {
      game.phone.messages = game.phone.messages.slice(0, 50);
    }

    unreadCount++;

    // Trigger phone notification in UI
    if (typeof window.onPhoneMessage === 'function') {
      window.onPhoneMessage(msg);
    }

    // Play sound
    if (window.Audio && window.Audio.isInitialized()) {
      window.Audio.sfxPhoneVibrate();
    }

    return msg;
  }

  // ── Send a custom message (not from template) ──
  function sendCustomMessage(game, sender, text, type = MSG_TYPES.CONTACT, portrait = "👤") {
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sender,
      type,
      text,
      portrait,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      day: game.world.day,
      period: game.world.period,
      read: false
    };

    game.phone.messages.unshift(msg);
    if (game.phone.messages.length > 50) {
      game.phone.messages = game.phone.messages.slice(0, 50);
    }

    unreadCount++;

    if (typeof window.onPhoneMessage === 'function') {
      window.onPhoneMessage(msg);
    }

    if (window.Audio && window.Audio.isInitialized()) {
      window.Audio.sfxPhoneVibrate();
    }

    return msg;
  }

  // ── Mark message as read ──
  function markRead(game, messageId) {
    const msg = game.phone.messages.find(m => m.id === messageId);
    if (msg && !msg.read) {
      msg.read = true;
      unreadCount = Math.max(0, unreadCount - 1);
    }
  }

  // ── Mark all as read ──
  function markAllRead(game) {
    game.phone.messages.forEach(m => { m.read = true; });
    unreadCount = 0;
  }

  // ── Get unread count ──
  function getUnreadCount(game) {
    return game.phone.messages.filter(m => !m.read).length;
  }

  // ── Get messages filtered by type ──
  function getMessagesByType(game, type) {
    return game.phone.messages.filter(m => m.type === type);
  }

  // ── Contact management ──
  function addContact(game, name, role, portrait = "👤") {
    if (game.phone.contacts.find(c => c.name === name)) return; // Already exists
    game.phone.contacts.push({
      name,
      role,
      portrait,
      addedDay: game.world.day
    });
  }

  function hasContact(game, name) {
    return game.phone.contacts.some(c => c.name === name);
  }

  function getContacts(game) {
    return game.phone.contacts;
  }

  // ── Auto-messages based on game state ──
  // Call this each period to generate contextual messages
  function checkAutoMessages(game) {
    const messages = [];

    // Shark messages based on debt and day
    if (game.resources.debt > 0) {
      const day = game.world.day;
      const debt = game.resources.debt;

      if (day === 1 && game.world.period === 'morning') {
        messages.push(sendMessage(game, 'shark_intro', { debt: debt.toLocaleString() }));
      }
      else if (day === 5 && game.world.period === 'morning') {
        messages.push(sendMessage(game, 'shark_reminder_mild', { debt: debt.toLocaleString() }));
      }
      else if (day === 10 && game.world.period === 'morning') {
        messages.push(sendMessage(game, 'shark_reminder_mild', { debt: debt.toLocaleString() }));
      }
      else if (day === 15 && game.world.period === 'morning') {
        messages.push(sendMessage(game, 'shark_reminder_angry', { debt: debt.toLocaleString() }));
      }
      else if (day === 20 && game.world.period === 'morning') {
        messages.push(sendMessage(game, 'shark_reminder_angry', { debt: debt.toLocaleString() }));
      }
      else if (day === 25 && game.world.period === 'morning') {
        messages.push(sendMessage(game, 'shark_reminder_angry', { debt: debt.toLocaleString() }));
      }
      else if (debt > 30000 && Math.random() < 0.15) {
        messages.push(sendMessage(game, 'shark_reminder_angry', { debt: debt.toLocaleString() }));
      }
    }

    // Debt just paid off
    if (game.resources.debt === 0 && !game.flags.shark_paid_notified) {
      messages.push(sendMessage(game, 'shark_paid', {}));
      game.flags.shark_paid_notified = true;
    }

    // Crew loyalty warnings
    if (game.crew && game.crew.length > 0) {
      game.crew.forEach(member => {
        if (member.loyalty < 30 && Math.random() < 0.2) {
          messages.push(sendMessage(game, 'crew_loyalty_low', { name: member.nickname || member.name }));
        }
        if (member.loyalty > 80 && Math.random() < 0.05) {
          messages.push(sendMessage(game, 'crew_loyalty_high', { name: member.nickname || member.name }));
        }
      });
    }

    // Lookout warnings (if you have a lookout crew member)
    const hasLookout = game.crew && game.crew.some(m => m.role === 'lookout' && m.alive);
    if (hasLookout) {
      const cityHeat = (game.heat.cities[game.world.currentCity] || 0);
      if (cityHeat > 50 && Math.random() < 0.3) {
        const lookout = game.crew.find(m => m.role === 'lookout' && m.alive);
        messages.push(sendMessage(game, 'crew_warning', {
          name: lookout.nickname || lookout.name
        }));
      }
    }

    // Random tips (based on having burner phone upgrade or networker perks)
    const hasBurnerPhone = game.inventory.gear &&
      game.inventory.gear.some(g => g.id === 'burner_phone');
    if (hasBurnerPhone && Math.random() < 0.2) {
      const drugs = ['Weed', 'Cocaine', 'Molly', 'Xanax', 'Lean', 'Meth', 'Fentanyl', 'Heroin'];
      const cities = ['Miami', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Detroit', 'Atlanta', 'Philadelphia', 'Las Vegas', 'Seattle'];
      const drug = drugs[Math.floor(Math.random() * drugs.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      if (Math.random() < 0.5) {
        messages.push(sendMessage(game, 'tip_price', { drug, city }));
      } else {
        messages.push(sendMessage(game, 'tip_opportunity', { drug, city }));
      }
    }

    // High federal heat warnings
    if (game.heat.federal > 60 && Math.random() < 0.2) {
      const city = game.world.currentCity;
      messages.push(sendMessage(game, 'tip_danger', { city }));
    }

    return messages.filter(m => m !== null);
  }

  // ── Notification helper for achievements ──
  function notifyAchievement(game, name, description) {
    sendMessage(game, 'system_achievement', { name, desc: description });
  }

  // ── Notification for level up ──
  function notifyLevelUp(game, level) {
    sendMessage(game, 'system_levelup', { level: level.toString() });
  }

  // ── Notification for reputation tier change ──
  function notifyReputationTier(game, tierName) {
    sendMessage(game, 'system_reputation', { tier: tierName });
  }

  // ── Phone UI state ──
  function isPhoneOpen() { return phoneOpen; }
  function openPhone() { phoneOpen = true; }
  function closePhone() { phoneOpen = false; }
  function togglePhone() { phoneOpen = !phoneOpen; return phoneOpen; }

  // ── Export ──
  window.Phone = {
    MSG_TYPES,
    MESSAGE_TEMPLATES,
    createMessage,
    sendMessage,
    sendCustomMessage,
    markRead,
    markAllRead,
    getUnreadCount,
    getMessagesByType,
    addContact,
    hasContact,
    getContacts,
    checkAutoMessages,
    notifyAchievement,
    notifyLevelUp,
    notifyReputationTier,
    isPhoneOpen,
    openPhone,
    closePhone,
    togglePhone
  };

})();

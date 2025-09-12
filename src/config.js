const CONFIG = {
  sleep: {
    dawnchaser: { name: "Dawn Chaser", icon: "🌅", wake: "5:30 AM", identity: "Early riser, peak performance" },
    earlybird: { name: "Early Bird", icon: "☀️", wake: "6:30 AM", identity: "Balanced energy, productive mornings" },
    nightowl: { name: "Night Owl", icon: "🦉", wake: "7:30 AM", identity: "Creative evenings, flexible mornings" },
    custom: { name: "Custom Time", icon: "⏰", wake: "6:00 AM", identity: "Set your own schedule" }
  },
  fitness: {
    endurance: { name: "Endurance", icon: "🏃", identity: "Long-distance, steady pace" },
    strength: { name: "Strength", icon: "�", identity: "Power, resistance training" },
    mobility: { name: "Mobility", icon: "🧘", identity: "Flexibility, movement quality" },
    custom: { name: "Custom", icon: "🎯", identity: "Define your own fitness goals" }
  },
  mind: {
    reader: { name: "Reader", icon: "📚", identity: "Deep knowledge, thoughtful insights" },
    writer: { name: "Writer", icon: "✍️", identity: "Creative expression, clear thinking" },
    learner: { name: "Learner", icon: "🧠", identity: "Continuous growth, skill development" },
    custom: { name: "Custom", icon: "🎨", identity: "Define your mental practice" }
  },
  spirit: {
    mindful: { name: "Mindful", icon: "🧘", identity: "Present awareness, inner peace" },
    reflective: { name: "Reflective", icon: "🔍", identity: "Deep contemplation, self-discovery" },
    connected: { name: "Connected", icon: "🌟", identity: "Spiritual awareness, higher purpose" },
    custom: { name: "Custom", icon: "✨", identity: "Define your spiritual practice" }
  }
};

// Remove the old ARCHETYPES - we'll use domain-specific identities instead
const DOMAIN_IDENTITIES = {
  sleep: CONFIG.sleep,
  fitness: CONFIG.fitness,
  mind: CONFIG.mind,
  spirit: CONFIG.spirit
};
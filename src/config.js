const CON    strength: { name: "Strength", icon: "💪", identity: "Power, resistance training" },IG = {
  sleep: {
    dawnchaser: { name: "Dawn Chaser", icon: "🌅", wake: "5:30 AM", sleep: "10:30 PM", identity: "Early riser, peak performance" },
    earlybird: { name: "Early Bird", icon: "☀️", wake: "6:30 AM", sleep: "11:30 PM", identity: "Balanced energy, productive mornings" },
    nightowl: { name: "Night Owl", icon: "🦉", wake: "7:30 AM", sleep: "12:30 AM", identity: "Creative evenings, flexible mornings" },
    custom: { name: "Custom Time", icon: "⏰", wake: "6:00 AM", sleep: "11:00 PM", identity: "Set your own schedule" }
  },
  fitness: {
    endurance: { name: "Endurance", icon: "🏃", identity: "Long-distance, steady pace" },
    strength: { name: "Strength", icon: "�", identity: "Power, resistance training" },
    mobility: { name: "Mobility", icon: "🧘", identity: "Flexibility, movement quality" },
    custom: { name: "Custom", icon: "🎯", identity: "Define your own fitness goals" }
  },
  mind: {
    reading: {
      casual: { name: "Casual Reading", icon: "�", target: 2, identity: "Enjoyable reading, no pressure" },
      perspicacity: { name: "Perspicacity", icon: "📚", target: 4, identity: "Thoughtful reading, weekly insights" },
      erudition: { name: "Erudition", icon: "🎓", target: 6, identity: "Deep study, comprehensive knowledge" }
    },
    writing: {
      journal: { name: "Journal", icon: "📝", target: 3, identity: "Personal reflection, daily notes" },
      editorial: { name: "Editorial", icon: "✍️", target: 5, identity: "Structured writing, weekly articles" },
      treatise: { name: "Treatise", icon: "📜", target: 7, identity: "In-depth writing, major projects" }
    }
  },
  spirit: {
    meditation: {
      awareness: { name: "Awareness", icon: "🧘", identity: "Basic mindfulness, daily practice" },
      mindfulness: { name: "Mindfulness", icon: "🌸", identity: "Present awareness, inner peace" },
      reflection: { name: "Reflection", icon: "🔍", identity: "Deep contemplation, self-discovery" },
      gratitude: { name: "Gratitude", icon: "🙏", identity: "Thankful practice, positive focus" }
    }
  }
};

// Remove the old ARCHETYPES - we'll use domain-specific identities instead
const DOMAIN_IDENTITIES = {
  sleep: CONFIG.sleep,
  fitness: CONFIG.fitness,
  mind: CONFIG.mind,
  spirit: CONFIG.spirit
};
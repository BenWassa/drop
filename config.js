const CONFIG = {
  sleep: {
    earlybird: { name: "Early Bird", icon: "🌅", wake: "5:30", sleep: "21:30" },
    balanced: { name: "Balanced Rise", icon: "☀️", wake: "6:30", sleep: "22:30" },
    nightowl: { name: "Night Owl", icon: "🦉", wake: "7:30", sleep: "23:30" }
  },
  fitness: {
    maintain: { name: "Maintain", icon: "〰️", multiplier: 1.0 },
    deload: { name: "Deload", icon: "📉", multiplier: 0.8 },
    growth: { name: "Growth", icon: "📈", multiplier: 1.1 }
  },
  mind: {
    reading: {
      leisure: { name: "Leisure", icon: "🛋️", target: 2 },
      perspicacity: { name: "Perspicacity", icon: "🧐", target: 5 },
      erudition: { name: "Erudition", icon: "📚", target: 8 }
    },
    writing: {
      journal: { name: "Journal", icon: "✍️", target: 3 },
      editorial: { name: "Editorial", icon: "📰", target: 5 },
      treatise: { name: "Treatise", icon: "📜", target: 7 }
    }
  },
  spirit: {
    meditation: {
      awareness: { name: "Awareness", icon: "🧘" },
      introspection: { name: "Introspection", icon: "🔍" },
      transcendence: { name: "Transcendence", icon: "🌌" }
    }
  }
};


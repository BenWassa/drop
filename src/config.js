const OURA_CONFIG = {
  // IMPORTANT: Paste your actual Client ID here
  CLIENT_ID: 'L76FLDOGHZ75ZVPB',
  
  // Standard Oura API URLs
  AUTH_URL: 'https://cloud.ouraring.com/oauth/authorize',
  TOKEN_URL: 'https://api.ouraring.com/oauth/token',
  API_URL: 'https://api.ouraring.com/v2'
};

const CONFIG = {
  sleep: {
    Dawnchaser: { name: "Dawnchaser", icon: "🌅", wake: "5:30", sleep: "21:30" },
    Earlybird: { name: "Earlybird", icon: "☀️", wake: "6:30", sleep: "22:30" },
    Nightowl: { name: "Nightowl", icon: "🦉", wake: "7:30", sleep: "23:30" }
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

const ARCHETYPES = {
  scholar: {
    name: "Scholar",
    commitments: {
      sleep: "Earlybird",
      fitnessMode: "maintain",
      fitnessBaseline: 5,
      fitnessUnit: "km",
      reading: "erudition",
      writing: "treatise",
      meditation: "awareness"
    }
  },
  athlete: {
    name: "Athlete",
    commitments: {
      sleep: "Dawnchaser",
      fitnessMode: "growth",
      fitnessBaseline: 8,
      fitnessUnit: "km",
      reading: "leisure",
      writing: "journal",
      meditation: "awareness"
    }
  }
};
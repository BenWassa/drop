// Full CONFIG copied from the archive so the multi-page renderer can reuse domain metadata
const CONFIG = {
    sleep: {
        dawnchaser: { name: 'Dawn Chaser', icon: '🌅', wake: '5:30 AM', sleep: '10:30 PM', identity: 'Early riser, peak performance' },
        earlybird: { name: 'Early Bird', icon: '☀️', wake: '6:30 AM', sleep: '11:30 PM', identity: 'Balanced energy, productive mornings' },
        nightowl: { name: 'Night Owl', icon: '🦉', wake: '7:30 AM', sleep: '12:30 AM', identity: 'Creative evenings, flexible mornings' },
        custom: { name: 'Custom Time', icon: '⏰', wake: '6:00 AM', sleep: '11:00 PM', identity: 'Set your own schedule' }
    },
    fitness: {
        cardio: {
            low: { name: 'Cardio — Low', icon: '🚶', multiplier: 0.6, description: 'Light aerobic activity, maintain base fitness' },
            medium: { name: 'Cardio — Medium', icon: '🏃', multiplier: 1.0, description: 'Regular runs or sustained aerobic sessions' },
            high: { name: 'Cardio — High', icon: '🏃‍♂️', multiplier: 1.3, description: 'Training for endurance or performance' }
        },
        strength: {
            low: { name: 'Strength — Low', icon: '🪢', multiplier: 0.6, description: 'Bodyweight or light resistance' },
            medium: { name: 'Strength — Medium', icon: '🏋️', multiplier: 1.0, description: 'Structured resistance sessions' },
            high: { name: 'Strength — High', icon: '🏋️‍♂️', multiplier: 1.4, description: 'Heavy lifting and progressive overload' }
        },
        skills: {
            low: { name: 'Skills — Low', icon: '⚙️', multiplier: 0.7, description: 'Basic skill practice and mobility' },
            medium: { name: 'Skills — Medium', icon: '🤼', multiplier: 1.0, description: 'Regular skill work or sport training' },
            high: { name: 'Skills — High', icon: '🏆', multiplier: 1.25, description: 'High-intensity performance training' }
        },
        custom: { name: 'Custom', icon: '🎯', description: 'Define your own fitness goals' }
    },
    mind: {
        reading: {
            casual: { name: 'Leisure', icon: '📖', target: 2, identity: 'Enjoyable reading, light exposure' },
            perspicacity: { name: 'Perspicacity', icon: '📚', target: 4, identity: 'Thoughtful reading and synthesis' },
            erudition: { name: 'Erudition', icon: '🎓', target: 6, identity: 'Deep study and comprehensive knowledge' }
        },
        writing: {
            journal: { name: 'Journal', icon: '📝', target: 3, identity: 'Personal reflection, daily notes' },
            editorial: { name: 'Editorial', icon: '✍️', target: 5, identity: 'Structured writing, weekly articles' },
            treatise: { name: 'Treatise', icon: '📜', target: 7, identity: 'In-depth writing, major projects' }
        }
    },
    spirit: {
        stress: {
            low: { name: 'Stress — Low', icon: '🟢', identity: 'Prioritize recovery and low stress exposure' },
            medium: { name: 'Stress — Medium', icon: '🟡', identity: 'Balanced exposure and recovery' },
            high: { name: 'Stress — High', icon: '🔴', identity: 'High tolerance for stress and challenge' }
        },
        meditation: {
            awareness: { name: 'Awareness', icon: '🧘', identity: 'Basic mindfulness, daily practice' },
            introspection: { name: 'Introspection', icon: '🔍', identity: 'Deeper contemplative practice' },
            transcendence: { name: 'Transcendence', icon: '✨', identity: 'Advanced practice, expansive states' }
        }
    }
};

// Keep window.CONFIG available (archive code expects a global CONFIG)
window.CONFIG = window.CONFIG || CONFIG;

// Light compatibility map of domain identities
window.DOMAIN_IDENTITIES = window.DOMAIN_IDENTITIES || {
    sleep: CONFIG.sleep,
    fitness: CONFIG.fitness,
    mind: CONFIG.mind,
    spirit: CONFIG.spirit
};

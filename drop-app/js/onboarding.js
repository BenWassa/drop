document.addEventListener('DOMContentLoaded', () => {
    loadState();

    // Populate direct control form if present
    const form = document.getElementById('direct-control-form');
    if(form){
        // new quantitative fields
        const sleepWake = document.getElementById('sleepWake');
        const sleepHours = document.getElementById('sleepHours');
        const suggestedBedtime = document.getElementById('suggestedBedtime');

        const fitnessKm = document.getElementById('fitness_km_week');
        const fitnessStrength = document.getElementById('fitness_strength_sessions');
        const fitnessSkill = document.getElementById('fitness_skill_sessions');

        const mindReading = document.getElementById('mind_reading_minutes_week');

        const spiritStress = document.getElementById('spirit_stress');
        const spiritMeditation = document.getElementById('spirit_meditation_sessions_week');

        // populate with existing quantitative commitments
        if(state.commitments){
            if(state.commitments.sleep){
                sleepWake.value = state.commitments.sleep.wakeTime || '';
                sleepHours.value = state.commitments.sleep.target_hours || '';
            }
            if(state.commitments.fitness){
                fitnessKm.value = state.commitments.fitness.km_week || '';
                fitnessStrength.value = state.commitments.fitness.strength_sessions_week || '';
                fitnessSkill.value = state.commitments.fitness.skill_sessions_week || '';
            }
            if(state.commitments.mind){
                mindReading.value = state.commitments.mind.reading_minutes_per_week || '';
            }
            if(state.commitments.spirit){
                spiritStress.value = state.commitments.spirit.stress_level || '3';
                spiritMeditation.value = state.commitments.spirit.meditation_sessions_week || '';
            }
        }

        function updateSuggestedBedtime(){
            const wake = sleepWake.value; // HH:MM
            const hours = parseFloat(sleepHours.value) || 8;
            if(!wake){ suggestedBedtime.textContent = '—'; return; }
            // compute bedtime = wakeTime - hours
            const [wh, wm] = wake.split(':').map(Number);
            const wakeDate = new Date();
            wakeDate.setHours(wh, wm, 0, 0);
            wakeDate.setHours(wakeDate.getHours() - Math.floor(hours));
            // subtract fractional hours as minutes
            const fractional = hours - Math.floor(hours);
            wakeDate.setMinutes(wakeDate.getMinutes() - Math.round(fractional * 60));
            const hh = String(wakeDate.getHours()).padStart(2,'0');
            const mm = String(wakeDate.getMinutes()).padStart(2,'0');
            suggestedBedtime.textContent = `${hh}:${mm}`;
        }

        sleepWake?.addEventListener('change', updateSuggestedBedtime);
        sleepHours?.addEventListener('input', updateSuggestedBedtime);
        updateSuggestedBedtime();

        const continueBtn = document.getElementById('continue-btn');
        if(continueBtn){
            continueBtn.addEventListener('click', () => {
                // basic validation and normalization
                state.commitments = state.commitments || {};

                // Sleep: wake time (priority) + hours (0.5 step)
                const wakeVal = sleepWake.value || '';
                let hoursVal = parseFloat(sleepHours.value);
                if(isNaN(hoursVal)) hoursVal = 8;
                // snap to 0.5 steps
                hoursVal = Math.round(hoursVal * 2) / 2;
                state.commitments.sleep = { wakeTime: wakeVal, target_hours: hoursVal };

                // Fitness: km per week, strength sessions, skill sessions
                const km = parseFloat(fitnessKm.value) || 0;
                const strengthSessions = parseInt(fitnessStrength.value) || 0;
                const skillSessions = parseInt(fitnessSkill.value) || 0;
                state.commitments.fitness = {
                    km_week: Math.round(km * 10) / 10,
                    strength_sessions_week: strengthSessions,
                    skill_sessions_week: skillSessions
                };

                // Mind: minutes per week (30 min increments)
                let readingMin = parseInt(mindReading.value) || 0;
                // snap to 30-min steps
                readingMin = Math.round(readingMin / 30) * 30;
                state.commitments.mind = { reading_minutes_per_week: readingMin };

                // Spirit: stress (1-5) and meditation sessions per week
                const stress = parseInt(spiritStress.value) || 3;
                const medSessions = parseInt(spiritMeditation.value) || 0;
                state.commitments.spirit = { stress_level: Math.min(5, Math.max(1, stress)), meditation_sessions_week: medSessions };

                // Mirror critical weekly targets for quick use
                state.weeklyTargets = state.weeklyTargets || {};
                state.weeklyTargets.fitness = state.commitments.fitness.km_week || 0;
                state.weeklyTargets.fitness_strength = state.commitments.fitness.strength_sessions_week || 0;
                state.weeklyTargets.fitness_skill = state.commitments.fitness.skill_sessions_week || 0;
                state.weeklyTargets.mind_reading = state.commitments.mind.reading_minutes_per_week || 0;
                state.weeklyTargets.spirit_meditation = state.commitments.spirit.meditation_sessions_week || 0;

                saveState();
                window.location.href = 'confirmation.html';
            });
        }
    }

    // Populate confirmation summary if present
    const summary = document.getElementById('confirmation-summary');
    if(summary){
        // Friendly summary rendering
        const s = state.commitments || {};
        const sleepEl = document.getElementById('confirm-sleep');
        const fitnessEl = document.getElementById('confirm-fitness');
        const mindEl = document.getElementById('confirm-mind');
        const spiritEl = document.getElementById('confirm-spirit');

        if(sleepEl){
            const hours = s.sleep?.target_hours != null ? `${s.sleep.target_hours} hrs/night` : '—';
            const wake = s.sleep?.wakeTime || '—';
            sleepEl.innerHTML = `<div class="flex items-center gap-3"><div class="text-2xl">🛌</div><div><div class="font-medium">Sleep</div><div class="text-xs text-gray-400">Wake: ${wake}</div></div></div><div class="text-sm text-gray-200">${hours}</div>`;
        }

        if(fitnessEl){
            const km = s.fitness?.km_week != null ? `${s.fitness.km_week} km/week` : '0 km/week';
            const str = s.fitness?.strength_sessions_week != null ? `${s.fitness.strength_sessions_week} strength/wk` : '0';
            const skl = s.fitness?.skill_sessions_week != null ? `${s.fitness.skill_sessions_week} skill/wk` : '0';
            fitnessEl.innerHTML = `<div class="flex items-center gap-3"><div class="text-2xl">🏃</div><div><div class="font-medium">Fitness</div><div class="text-xs text-gray-400">Distance / strength / skill</div></div></div><div class="text-sm text-gray-200">${km} · ${str} · ${skl}</div>`;
        }

        if(mindEl){
            const reading = s.mind?.reading_minutes_per_week != null ? `${s.mind.reading_minutes_per_week} min/week` : '0';
            mindEl.innerHTML = `<div class="flex items-center gap-3"><div class="text-2xl">📚</div><div><div class="font-medium">Mind</div><div class="text-xs text-gray-400">Reading target</div></div></div><div class="text-sm text-gray-200">${reading}</div>`;
        }

        if(spiritEl){
            const stress = s.spirit?.stress_level != null ? `Stress ${s.spirit.stress_level}/5` : '—';
            const med = s.spirit?.meditation_sessions_week != null ? `${s.spirit.meditation_sessions_week} sessions/wk` : '0';
            spiritEl.innerHTML = `<div class="flex items-center gap-3"><div class="text-2xl">🧘</div><div><div class="font-medium">Spirit</div><div class="text-xs text-gray-400">Stress · Meditation</div></div></div><div class="text-sm text-gray-200">${stress} · ${med}</div>`;
        }

        const quarterInfo = document.getElementById('quarter-info');
        if(quarterInfo){
            const q = getQuarterInfo();
            quarterInfo.textContent = `Quarter ${q.quarter} — ${q.year}`;
        }

        const startBtn = document.getElementById('start-journey-btn');
        if(startBtn){
            startBtn.addEventListener('click', () => {
                state.onboardingComplete = true;
                saveState();
                window.location.href = '../app/index.html';
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('date');
    dateEl.textContent = new Date().toLocaleDateString();

    const data = JSON.parse(localStorage.getItem('pwaData')) || {};

    const updateScore = (domain, score) => {
        document.getElementById(`${domain}-score-top`).textContent = score;
        document.getElementById(`${domain}-score-card`).textContent = score;
        data[domain] = score;
        localStorage.setItem('pwaData', JSON.stringify(data));
    };

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            document.getElementById(`${card.dataset.domain}-overlay`).style.display = 'flex';
        });
    });

    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.overlay').style.display = 'none';
        });
    });

    const calculateAndUpdateScores = () => {
        let sleepScore = 0;
        const wake = document.getElementById('wake-time').value;
        const rest = document.getElementById('rest-time').value;
        if (wake && rest) {
            const diff = (new Date(`1970-01-02T${wake}`) - new Date(`1970-01-01T${rest}`)) / 36e5;
            sleepScore = Math.min(100, Math.round((diff / 8) * 100));
        }
        updateScore('sleep', sleepScore);

        let fitnessScore = 0;
        const distance = parseInt(document.getElementById('run-distance').textContent);
        if (distance > 0) fitnessScore += 50;
        if (document.getElementById('strength').checked) fitnessScore += 25;
        if (document.getElementById('skill').checked) fitnessScore += 25;
        updateScore('fitness', fitnessScore);

        let mindScore = 0;
        if (document.getElementById('read').checked) mindScore += 50;
        if (document.getElementById('write').checked) mindScore += 50;
        updateScore('mind', mindScore);

        let spiritScore = 0;
        if (document.getElementById('meditation').checked) spiritScore += 100;
        updateScore('spirit', spiritScore);
    };

    document.querySelectorAll('input, .run-adjust').forEach(el => {
        el.addEventListener('input', calculateAndUpdateScores);
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('run-adjust')) {
                const runEl = document.getElementById('run-distance');
                let distance = parseInt(runEl.textContent);
                if (e.target.textContent === '+') distance = Math.min(42, distance + 1);
                else distance = Math.max(0, distance - 1);
                runEl.textContent = distance;
                calculateAndUpdateScores();
            }
        });
    });

    for (const domain in data) {
        updateScore(domain, data[domain]);
    }
    calculateAndUpdateScores();
});
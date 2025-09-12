function generateSampleData(){
    const sampleState = {
        onboardingComplete: true,
        commitments: {
            sleep: 'earlybird',
            fitnessBaseline: 5,
            fitnessUnit: 'km'
        },
        logs: {},
    };

    const today = new Date();
    for(let i=28;i>0;i--){
        const d = new Date(today);
        d.setDate(today.getDate()-i);
        const k = d.toISOString().split('T')[0];
        sampleState.logs[k] = {
            embodiedSleep: Math.random() < 0.8,
            fitnessLogged: +(Math.random()*8).toFixed(1),
            reading: Math.random() < 0.6,
            writing: Math.random() < 0.4,
            meditation: Math.random() < 0.7,
            burnout: Math.floor(Math.random()*3)+1
        };
    }
    localStorage.setItem('dropState_v2', JSON.stringify(sampleState));
    console.log('Sample data saved to localStorage as dropState_v2');
}

window.generateSampleData = generateSampleData;

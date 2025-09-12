// Simple state management using localStorage
window.state = window.state || {};

function loadState(){
    try{
        const raw = localStorage.getItem('dropState_v2');
        if(raw){
            window.state = Object.assign({}, window.state, JSON.parse(raw));
        } else {
            window.state = Object.assign({}, window.state, {onboardingComplete:false, commitments:{}, logs:{}});
        }
    }catch(e){
        console.error('Failed to load state', e);
        window.state = {onboardingComplete:false, commitments:{}, logs:{}};
    }
}

function saveState(){
    try{
        localStorage.setItem('dropState_v2', JSON.stringify(window.state));
    }catch(e){
        console.error('Failed to save state', e);
    }
}

// expose
window.loadState = loadState;
window.saveState = saveState;

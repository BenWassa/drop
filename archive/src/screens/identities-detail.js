// Identities Detail screen - shows selected identities and allows tweaks
(function(){
    function setupIdentitiesDetail() {
        const container = document.getElementById('identities-summary');
        const si = state.selectedIdentities || {};
        let html = '';
        html += `<div class="mb-2">Sleep: <strong>${si.sleep || 'earlybird'}</strong></div>`;
        html += `<div class="mb-2">Fitness: <strong>${si.fitness || 'endurance'}</strong></div>`;
        html += `<div class="mb-2">Mind: <strong>${si.mind || 'reader'}</strong></div>`;
        html += `<div class="mb-2">Spirit: <strong>${si.spirit || 'mindful'}</strong></div>`;
        container.innerHTML = html;

        const cont = document.getElementById('identities-continue');
        cont.onclick = function(){
            // Apply the domain identities to commitments (same behaviour as before)
            applyDomainIdentitiesToCommitments(state.selectedIdentities || {});
            saveState();
            renderConfirmationScreen();
            showScreen('confirmation-screen');
        };
    }

    if (window.registerScreen) window.registerScreen('identities-detail-screen', setupIdentitiesDetail);
    window.setupIdentitiesDetail = setupIdentitiesDetail;
})();

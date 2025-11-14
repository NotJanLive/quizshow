// Spieler-spezifische Funktionen

// Last Man Standing Player View
function updateLMSPlayerView(state) {
  const lmsState = state.lmsState;
  
  // Update Round Info
  document.getElementById('lms-player-round').textContent = lmsState.currentRound;
  document.getElementById('lms-player-theme').textContent = lmsState.roundTitle;
  
  // Update Keywords Grid
  const keywordsGrid = document.getElementById('lms-player-keywords');
  keywordsGrid.innerHTML = '';
  
  lmsState.keywords.forEach((keyword, index) => {
    const card = document.createElement('div');
    const isRevealed = lmsState.revealedKeywords.includes(index);
    
    card.className = `keyword-card ${isRevealed ? 'revealed' : 'hidden'}`;
    card.textContent = isRevealed ? keyword : '?';
    
    keywordsGrid.appendChild(card);
  });
  
  // Update Scores
  const scoresList = document.getElementById('lms-player-scores');
  scoresList.innerHTML = '';
  
  state.players.filter(p => !p.isHost).forEach(player => {
    const scoreDiv = document.createElement('div');
    scoreDiv.className = `score-item ${player.eliminated ? 'eliminated' : ''}`;
    scoreDiv.innerHTML = `
      <span class="player-name">
        ${player.name}
        ${player.eliminated ? ' ❌' : ''}
      </span>
      <span class="player-points">${player.modePoints}P</span>
    `;
    scoresList.appendChild(scoreDiv);
  });
}

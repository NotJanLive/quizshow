// Main Client Logic
const socket = io();

// Client State
const clientState = {
  sessionId: null,
  roomCode: null,
  isHost: false,
  currentScreen: 'lobby',
  selectedAnswerIndex: null
};

// Elemente
const screens = {
  lobby: document.getElementById('lobby-screen'),
  waiting: document.getElementById('waiting-room'),
  lmsPlayer: document.getElementById('lms-player-screen'),
  lmsHost: document.getElementById('lms-host-screen'),
  wwmPlayer: document.getElementById('wwm-player-screen'),
  wwmHost: document.getElementById('wwm-host-screen'),
  holPlayer: document.getElementById('hol-player-screen'),
  holHost: document.getElementById('hol-host-screen'),
  sqPlayer: document.getElementById('sq-player-screen'),
  sqHost: document.getElementById('sq-host-screen'),
  jpPlayer: document.getElementById('jp-player-screen'),
  jpHost: document.getElementById('jp-host-screen'),
  leaderboard: document.getElementById('leaderboard-screen')
};

// Session aus LocalStorage wiederherstellen
window.addEventListener('load', () => {
  const savedSession = localStorage.getItem('quizSession');
  
  if (savedSession) {
    const session = JSON.parse(savedSession);
    clientState.sessionId = session.sessionId;
    clientState.roomCode = session.roomCode;
    clientState.isHost = session.isHost;
    
    socket.emit('rejoin-room', {
      roomCode: session.roomCode,
      sessionId: session.sessionId,
      isHost: session.isHost
    });
  }
});

// Raum erstellen
document.getElementById('create-room-btn').addEventListener('click', () => {
  const hostName = document.getElementById('host-name-input').value.trim();
  
  if (!hostName) {
    showError('Bitte gib deinen Namen ein');
    return;
  }

  socket.emit('create-room', { hostName });
});

// Raum beitreten
document.getElementById('join-room-btn').addEventListener('click', () => {
  const playerName = document.getElementById('player-name-input').value.trim();
  const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
  
  if (!playerName) {
    showError('Bitte gib deinen Namen ein');
    return;
  }
  
  if (roomCode.length !== 6) {
    showError('Raumcode muss 6 Zeichen lang sein');
    return;
  }

  socket.emit('join-room', { roomCode, playerName });
});

// Socket Events
socket.on('room-created', (data) => {
  clientState.sessionId = data.sessionId;
  clientState.roomCode = data.roomCode;
  clientState.isHost = true;
  
  saveSession();
  
  document.getElementById('display-room-code').textContent = data.roomCode;
  document.getElementById('host-controls').style.display = 'block';
  
  switchScreen('waiting');
});

socket.on('room-joined', (data) => {
  clientState.sessionId = data.sessionId;
  clientState.roomCode = data.roomCode;
  clientState.isHost = false;
  
  saveSession();
  
  document.getElementById('display-room-code').textContent = data.roomCode;
  
  switchScreen('waiting');
});

socket.on('rejoin-success', (data) => {
  console.log('Erfolgreich wieder verbunden');
});

socket.on('game-state-update', (state) => {
  updateUI(state);
});

socket.on('error', (data) => {
  showError(data.message);
});

// UI Update basierend auf State
function updateUI(state) {
  console.log('State Update:', state);
  
  // Update Spielerliste in Waiting Room
  const waitingPlayersList = document.getElementById('waiting-players-list');
  waitingPlayersList.innerHTML = '';
  state.players.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player-item';
    playerDiv.innerHTML = `
      <span class="player-name">${player.name}</span>
      ${player.isHost ? '<span class="player-badge">HOST</span>' : ''}
    `;
    waitingPlayersList.appendChild(playerDiv);
  });

  // Screen-Wechsel basierend auf currentScreen und Rolle
  if (state.currentScreen === 'lobby') {
    switchScreen('waiting');
  } else if (state.currentScreen === 'game') {
    if (state.currentMode === 'last-man-standing') {
      if (clientState.isHost) {
        switchScreen('lmsHost');
        updateLMSHostView(state);
      } else {
        switchScreen('lmsPlayer');
        updateLMSPlayerView(state);
      }
    } else if (state.currentMode === 'wwm') {
      if (clientState.isHost) {
        switchScreen('wwmHost');
        updateWWMHostView(state);
      } else {
        switchScreen('wwmPlayer');
        updateWWMPlayerView(state);
      }
    } else if (state.currentMode === 'higher-or-lower') {
      if (clientState.isHost) {
        switchScreen('holHost');
        updateHOLHostView(state);
      } else {
        switchScreen('holPlayer');
        updateHOLPlayerView(state);
      }
    } else if (state.currentMode === 'symbol-quiz') {
      if (clientState.isHost) {
        switchScreen('sqHost');
        updateSQHostView(state);
      } else {
        switchScreen('sqPlayer');
        updateSQPlayerView(state);
      }
    } else if (state.currentMode === 'jeopardy') {
      if (clientState.isHost) {
        switchScreen('jpHost');
        updateJeopardyHostView(state);
      } else {
        switchScreen('jpPlayer');
        updateJeopardyPlayerView(state);
      }
    }
  } else if (state.currentScreen === 'leaderboard') {
    switchScreen('leaderboard');
    updateLeaderboard(state);
  }
}

// Screen-Wechsel
function switchScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
  clientState.currentScreen = screenName;
}

// Session speichern
function saveSession() {
  localStorage.setItem('quizSession', JSON.stringify({
    sessionId: clientState.sessionId,
    roomCode: clientState.roomCode,
    isHost: clientState.isHost
  }));
}

// Error anzeigen
function showError(message) {
  const toast = document.getElementById('error-toast');
  const messageEl = document.getElementById('error-message');
  
  messageEl.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Leaderboard aktualisieren
function updateLeaderboard(state) {
  const leaderboard = document.querySelector('.leaderboard');
  if (!leaderboard) return;
  
  leaderboard.innerHTML = '';
  
  const sortedPlayers = [...state.players]
    .filter(p => !p.isHost)
    .sort((a, b) => b.totalPoints - a.totalPoints);
  
  sortedPlayers.forEach((player, index) => {
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    item.style.animationDelay = `${index * 0.1}s`;
    
    let medal = '';
    if (index === 0) medal = '🥇';
    else if (index === 1) medal = '🥈';
    else if (index === 2) medal = '🥉';
    else medal = `#${index + 1}`;
    
    item.innerHTML = `
      <div class="leaderboard-rank">${medal}</div>
      <div class="leaderboard-name">${player.name}</div>
      <div class="leaderboard-points">${player.totalPoints}P</div>
    `;
    leaderboard.appendChild(item);
  });

  const hostControls = document.getElementById('host-leaderboard-controls');
  if (hostControls) {
    hostControls.style.display = clientState.isHost ? 'block' : 'none';
  }
  
  const continueBtn = document.getElementById('continue-from-leaderboard-btn');
  if (continueBtn && clientState.isHost) {
    continueBtn.style.display = 'block';
  }
}

// Wechsel zum nächsten Modus
document.getElementById('continue-from-leaderboard-btn')?.addEventListener('click', () => {
  socket.emit('continue-to-next-mode', {
    roomCode: clientState.roomCode,
    sessionId: clientState.sessionId
  });
});

// Last Man Standing - Player View
function updateLMSPlayerView(state) {
  const lmsState = state.lmsState;
  
  document.getElementById('lms-player-round').textContent = lmsState.currentRound;
  document.getElementById('lms-player-theme').textContent = lmsState.roundTitle;
  
  const keywordsGrid = document.getElementById('lms-player-keywords');
  keywordsGrid.innerHTML = '';
  
  lmsState.keywords.forEach((keyword, index) => {
    const card = document.createElement('div');
    const isRevealed = lmsState.revealedKeywords.includes(index);
    
    card.className = `keyword-card ${isRevealed ? 'revealed' : 'hidden'}`;
    card.textContent = isRevealed ? keyword : '?';
    
    keywordsGrid.appendChild(card);
  });
  
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
      <div class="score-details">
        <span class="score-current">${player.modePoints}P</span>
        <span class="score-total">(Gesamt: ${player.totalPoints}P)</span>
      </div>
    `;
    scoresList.appendChild(scoreDiv);
  });
}

// WWM - Player View
function updateWWMPlayerView(state) {
  const wwmState = state.wwmState;
  
  document.getElementById('wwm-player-question-num').textContent = wwmState.currentQuestion + 1;
  document.getElementById('wwm-player-question').textContent = wwmState.question.question;
  document.getElementById('wwm-player-question-points').textContent = wwmState.questionPoints;
  
  const answersGrid = document.getElementById('wwm-player-answers');
  answersGrid.innerHTML = '';
  
  const currentPlayer = state.players.find(p => p.sessionId === clientState.sessionId);
  const myPlayerName = currentPlayer.name;
  const myTempAnswer = wwmState.playerTempAnswers[myPlayerName];
  const mySubmittedAnswer = wwmState.playerAnswers[myPlayerName];
  
  wwmState.question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.textContent = answer;
    
    const isSelected = myTempAnswer && myTempAnswer.answerIndex === index;
    const isSubmitted = mySubmittedAnswer && mySubmittedAnswer.answerIndex === index;
    
    if (isSelected && !mySubmittedAnswer) {
      button.classList.add('selected');
    }
    
    if (isSubmitted) {
      button.classList.add('submitted');
      if (wwmState.questionRevealed) {
        if (index === wwmState.question.correctAnswer) {
          button.classList.add('correct');
        } else {
          button.classList.add('incorrect');
        }
      }
      button.disabled = true;
    } else if (wwmState.correctAnswersRevealed) {
      if (index === wwmState.question.correctAnswer) {
        button.classList.add('revealed-correct');
      }
      button.disabled = true;
    } else {
      button.addEventListener('click', () => {
        clientState.selectedAnswerIndex = index;
        socket.emit('select-answer', {
          roomCode: clientState.roomCode,
          sessionId: clientState.sessionId,
          answerIndex: index
        });
      });
    }
    
    answersGrid.appendChild(button);
  });
  
  const oldSubmitContainer = answersGrid.parentElement.querySelector('.submit-container');
  if (oldSubmitContainer) {
    oldSubmitContainer.remove();
  }
  
  const submitContainer = document.createElement('div');
  submitContainer.className = 'submit-container';
  submitContainer.style.marginTop = '1.5rem';
  submitContainer.style.textAlign = 'center';
  
  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn';
  submitBtn.style.maxWidth = '300px';
  submitBtn.style.margin = '0 auto';
  
  if (myTempAnswer && !mySubmittedAnswer) {
    submitBtn.className = 'btn btn-success';
    submitBtn.textContent = 'Antwort abgeben';
    submitBtn.disabled = false;
    submitBtn.addEventListener('click', () => {
      socket.emit('submit-answer', {
        roomCode: clientState.roomCode,
        sessionId: clientState.sessionId,
        questionIndex: wwmState.currentQuestion,
        answerIndex: myTempAnswer.answerIndex
      });
    });
  } else if (mySubmittedAnswer) {
    submitBtn.className = 'btn btn-success';
    submitBtn.textContent = '✓ Antwort eingegeben';
    submitBtn.disabled = true;
  } else {
    submitBtn.className = 'btn btn-disabled';
    submitBtn.textContent = 'Zuerst eine Antwort wählen';
    submitBtn.disabled = true;
  }
  
  submitContainer.appendChild(submitBtn);
  answersGrid.parentElement.appendChild(submitContainer);
  
  const scoresList = document.getElementById('wwm-player-scores');
  scoresList.innerHTML = '';
  
  state.players.filter(p => !p.isHost).forEach(player => {
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score-item';
    scoreDiv.innerHTML = `
      <span class="player-name">${player.name}</span>
      <div class="score-details">
        <span class="score-current">${player.modePoints}P</span>
        <span class="score-total">(Gesamt: ${player.totalPoints}P)</span>
      </div>
    `;
    scoresList.appendChild(scoreDiv);
  });
}

// Higher or Lower - Player View
function updateHOLPlayerView(state) {
  const holState = state.holState;
  const currentPlayer = state.players.find(p => p.sessionId === clientState.sessionId);
  
  document.getElementById('hol-player-round').textContent = holState.currentRound;
  document.getElementById('hol-player-points').textContent = currentPlayer.modePoints + 'P';
  document.getElementById('hol-player-total').textContent = currentPlayer.totalPoints + 'P';
  
  const livesDisplay = '❤️'.repeat(Math.max(0, currentPlayer.lives)) + 
                       '🖤'.repeat(Math.max(0, 2 - currentPlayer.lives));
  document.getElementById('hol-player-lives').textContent = livesDisplay;
  
  const scoresContainer = document.getElementById('hol-player-all-scores');
  scoresContainer.innerHTML = '';
  
  state.players.filter(p => !p.isHost).forEach(player => {
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score-item';
    
    const livesStr = '❤️'.repeat(Math.max(0, player.lives)) + 
                     '🖤'.repeat(Math.max(0, 2 - player.lives));
    
    scoreDiv.innerHTML = `
      <span class="player-name">${player.name}</span>
      <div class="score-details">
        <span class="score-current">${player.modePoints}P</span>
        <span class="score-total">${livesStr}</span>
      </div>
    `;
    scoresContainer.appendChild(scoreDiv);
  });
}

// ← UPDATED: Symbol Quiz - Player View MIT KEYWORD BOX
function updateSQPlayerView(state) {
  const sqState = state.sqState;
  
  document.getElementById('sq-player-theme-num').textContent = sqState.currentTheme + 1;
  
  // ← GELBE BOX MIT KEYWORD (nutzt theme-keyword CSS Klasse)
  const tipsContainer = document.getElementById('sq-player-tips');
  let keywordDiv = document.getElementById('sq-player-theme-keyword');
  
  if (!keywordDiv) {
    keywordDiv = document.createElement('div');
    keywordDiv.id = 'sq-player-theme-keyword';
    keywordDiv.className = 'theme-keyword';
    tipsContainer.parentElement.insertBefore(keywordDiv, tipsContainer);
  }
  
  // ← ZWEI ZUSTÄNDE:
  if (sqState.revealedKeyword >= 0 && sqState.themes && sqState.themes[sqState.revealedKeyword]) {
    // NACH RICHTIGE ANTWORT: "Die richtige Antwort ist: <keyword>"
    keywordDiv.textContent = `Die richtige Antwort ist: ${sqState.themes[sqState.revealedKeyword].keyword}`;
    keywordDiv.style.color = 'var(--success)';
  } else {
    // AM ANFANG: "Wer bin ich?"
    keywordDiv.textContent = 'Wer bin ich?';
    keywordDiv.style.color = 'var(--accent)';
  }
  
  tipsContainer.innerHTML = '';
  
  sqState.tips.forEach((tip, index) => {
    const tipDiv = document.createElement('div');
    tipDiv.className = 'tip-item';
    
    if (sqState.revealedTips[index]) {
      tipDiv.classList.add('revealed');
      tipDiv.textContent = tip;
      tipDiv.style.animationDelay = `${index * 0.1}s`;
    } else {
      tipDiv.classList.add('hidden');
      tipDiv.textContent = `Tipp ${index + 1}: Noch verborgen`;
    }
    
    tipsContainer.appendChild(tipDiv);
  });
  
  // Buzzer Status
  const buzzerStatus = document.getElementById('sq-player-buzzer-status');
  const buzzerText = document.getElementById('sq-player-buzzer-text');
  const buzzBtn = document.getElementById('sq-player-buzz-btn');
  
  if (sqState.currentBuzzer) {
    buzzerStatus.classList.add('active');
    buzzerText.textContent = `⚡ ${sqState.currentBuzzer} buzzert!`;
    buzzBtn.disabled = true;
    buzzBtn.textContent = 'Buzzer blockiert';
  } else if (sqState.answered) {
    buzzerStatus.classList.remove('active');
    buzzerText.textContent = 'Thema beendet - warte auf nächstes...';
    buzzBtn.disabled = true;
    buzzBtn.textContent = 'Warte...';
  } else {
    buzzerStatus.classList.remove('active');
    buzzerText.textContent = 'Buzzern um zu antworten!';
    buzzBtn.disabled = false;
    buzzBtn.textContent = 'BUZZERN';
  }
  
  buzzBtn.onclick = () => {
    socket.emit('player-buzz', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId
    });
  };
  
  // Scoreboard
  const scoresList = document.getElementById('sq-player-scores');
  scoresList.innerHTML = '';
  
  state.players.filter(p => !p.isHost).forEach(player => {
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score-item';
    scoreDiv.innerHTML = `
      <span class="player-name">${player.name}</span>
      <div class="score-details">
        <span class="score-current">${player.modePoints}P</span>
        <span class="score-total">(Gesamt: ${player.totalPoints}P)</span>
      </div>
    `;
    scoresList.appendChild(scoreDiv);
  });
}

// Jeopardy - Player View
function updateJeopardyPlayerView(state) {
  const jpState = state.jpState;
  const currentPlayer = state.players.find(p => p.sessionId === clientState.sessionId);
  const isCurrentPlayer = jpState.currentPlayerSessionId === clientState.sessionId;
  
  document.getElementById('jp-player-current').textContent = 
    isCurrentPlayer ? '✓ Du bist an der Reihe!' : `${jpState.currentPlayer} ist dran`;
  
  const gridContainer = document.getElementById('jp-player-grid');
  gridContainer.innerHTML = '';
  gridContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
  
  jpState.categories.forEach((category) => {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'jeopardy-category-header';
    headerDiv.textContent = category.name;
    gridContainer.appendChild(headerDiv);
  });
  
  const sortedCategories = jpState.categories.map(cat => ({
    name: cat.name,
    questions: [...cat.questions].sort((a, b) => a.points - b.points)
  }));
  
  const maxQuestions = Math.max(...sortedCategories.map(cat => cat.questions.length));
  
  for (let rowIdx = 0; rowIdx < maxQuestions; rowIdx++) {
    for (let catIdx = 0; catIdx < sortedCategories.length; catIdx++) {
      const question = sortedCategories[catIdx].questions[rowIdx];
      
      if (!question) {
        const placeholder = document.createElement('div');
        placeholder.style.visibility = 'hidden';
        gridContainer.appendChild(placeholder);
        continue;
      }
      
      const originalCatIdx = jpState.categories.indexOf(
        jpState.categories.find(c => c.name === sortedCategories[catIdx].name)
      );
      const originalQIdx = jpState.categories[originalCatIdx].questions.indexOf(question);
      
      const key = `${originalCatIdx}-${originalQIdx}`;
      const isUsed = jpState.usedQuestions.includes(key);
      
      const box = document.createElement('button');
      box.className = `jeopardy-box ${isUsed ? 'used' : ''}`;
      box.textContent = `${question.points}P`;
      box.disabled = isUsed || !isCurrentPlayer;
      
      if (!isUsed && isCurrentPlayer) {
        box.onclick = () => {
          socket.emit('select-jeopardy-question', {
            roomCode: clientState.roomCode,
            sessionId: clientState.sessionId,
            categoryIndex: originalCatIdx,
            questionIndex: originalQIdx
          });
        };
      }
      
      gridContainer.appendChild(box);
    }
  }
  
  const questionDisplay = document.getElementById('jp-player-question-display');
  const buzzerContainer = document.getElementById('jp-player-buzzer-container');
  
  if (jpState.currentQuestion) {
    questionDisplay.style.display = 'block';
    document.getElementById('jp-player-question-text').textContent = jpState.currentQuestion.question;
    
    if (jpState.buzzerActive) {
      buzzerContainer.style.display = 'block';
      const buzzBtn = document.getElementById('jp-player-buzz-btn');
      
      if (jpState.buzzerPlayer) {
        buzzBtn.disabled = true;
        buzzBtn.classList.add('buzzer-pressed');
        buzzBtn.textContent = `⚡ ${jpState.buzzerPlayer} buzzert`;
      } else if (isCurrentPlayer) {
        buzzBtn.disabled = true;
        buzzBtn.classList.add('buzzer-disabled');
        buzzBtn.textContent = 'Du kannst nicht auf deine eigene Frage buzzern';
      } else {
        buzzBtn.disabled = false;
        buzzBtn.classList.remove('buzzer-pressed');
        buzzBtn.classList.remove('buzzer-disabled');
        buzzBtn.textContent = 'BUZZERN';
        buzzBtn.onclick = () => {
          socket.emit('player-buzz-jeopardy', {
            roomCode: clientState.roomCode,
            sessionId: clientState.sessionId
          });
        };
      }
    } else {
      buzzerContainer.style.display = 'none';
    }
  } else {
    questionDisplay.style.display = 'none';
    buzzerContainer.style.display = 'none';
  }
  
  const scoresList = document.getElementById('jp-player-scores');
  scoresList.innerHTML = '';
  
  state.players.filter(p => !p.isHost).forEach(player => {
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score-item';
    scoreDiv.innerHTML = `
      <span class="player-name">${player.name}${player.sessionId === jpState.currentPlayerSessionId ? ' 👉' : ''}</span>
      <div class="score-details">
        <span class="score-current">${player.modePoints}P</span>
        <span class="score-total">(Gesamt: ${player.totalPoints}P)</span>
      </div>
    `;
    scoresList.appendChild(scoreDiv);
  });
}
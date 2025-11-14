// Host-spezifische Funktionen

// Spielmodus starten
document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', (e) => {
    const mode = e.target.getAttribute('data-mode');
    
    socket.emit('start-game-mode', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId,
      mode: mode
    });
  });
});

// Last Man Standing Host View
function updateLMSHostView(state) {
  const lmsState = state.lmsState;
  
  document.getElementById('lms-host-round').textContent = lmsState.currentRound;
  document.getElementById('lms-host-theme').textContent = lmsState.roundTitle;
  
  const keywordsGrid = document.getElementById('lms-host-keywords');
  keywordsGrid.innerHTML = '';
  
  lmsState.keywords.forEach((keyword, index) => {
    const card = document.createElement('div');
    const isRevealed = lmsState.revealedKeywords.includes(index);
    
    card.className = `keyword-card clickable ${isRevealed ? 'revealed' : 'hidden'}`;
    card.textContent = keyword;
    
    card.addEventListener('click', () => {
      socket.emit('reveal-keyword', {
        roomCode: clientState.roomCode,
        sessionId: clientState.sessionId,
        keywordIndex: index
      });
    });
    
    keywordsGrid.appendChild(card);
  });
  
  const hostPlayersList = document.getElementById('lms-host-players');
  hostPlayersList.innerHTML = '';
  
  const sortedPlayers = [...state.players.filter(p => !p.isHost)].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  sortedPlayers.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'host-player-item';
    playerDiv.innerHTML = `
      <div class="host-player-header">
        <span class="player-name">${player.name}</span>
        <span class="player-points">${player.modePoints} Punkte (Gesamt: ${player.totalPoints}P)</span>
      </div>
      <div class="host-player-controls">
        <button class="btn ${player.eliminated ? 'btn-success' : 'btn-danger'}" 
                onclick="toggleElimination('${player.sessionId}', ${player.eliminated})">
          ${player.eliminated ? 'Wiederbeleben' : 'Eliminieren'}
        </button>
        <button class="btn btn-secondary" onclick="adjustPoints('${player.sessionId}', -1)">
          -1 Punkt
        </button>
        <button class="btn btn-secondary" onclick="adjustPoints('${player.sessionId}', 1)">
          +1 Punkt
        </button>
      </div>
    `;
    hostPlayersList.appendChild(playerDiv);
  });
}

function toggleElimination(sessionId, isCurrentlyEliminated) {
  if (isCurrentlyEliminated) {
    socket.emit('revive-player', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId,
      targetSessionId: sessionId
    });
  } else {
    socket.emit('eliminate-player', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId,
      targetSessionId: sessionId
    });
  }
}

function adjustPoints(sessionId, delta) {
  socket.emit('adjust-points', {
    roomCode: clientState.roomCode,
    sessionId: clientState.sessionId,
    targetSessionId: sessionId,
    delta: delta
  });
}

document.getElementById('lms-next-round-btn')?.addEventListener('click', () => {
  socket.emit('next-round', {
    roomCode: clientState.roomCode,
    sessionId: clientState.sessionId
  });
});

document.getElementById('show-leaderboard-btn')?.addEventListener('click', () => {
  socket.emit('show-leaderboard', {
    roomCode: clientState.roomCode,
    sessionId: clientState.sessionId
  });
});

// WWM - Host View
function updateWWMHostView(state) {
  const wwmState = state.wwmState;
  
  document.getElementById('wwm-host-question-num').textContent = wwmState.currentQuestion + 1;
  document.getElementById('wwm-host-question').textContent = wwmState.question.question;
  document.getElementById('wwm-host-question-points').textContent = wwmState.questionPoints;
  
  const answersGrid = document.getElementById('wwm-host-answers');
  answersGrid.innerHTML = '';
  
  wwmState.question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.textContent = answer;
    
    if (index === wwmState.question.correctAnswer) {
      button.classList.add('selected');
      if (wwmState.questionRevealed) {
        button.classList.add('revealed', 'correct');
      }
    }
    
    if (wwmState.questionRevealed) {
      button.disabled = true;
    }
    
    answersGrid.appendChild(button);
  });
  
  const playerAnswersList = document.getElementById('wwm-host-player-answers');
  playerAnswersList.innerHTML = '';
  
  const playerAnswersDetail = {};
  
  for (const [playerName, answer] of Object.entries(wwmState.playerAnswers)) {
    const answerText = wwmState.question.answers[answer.answerIndex];
    playerAnswersDetail[playerName] = { answer: answerText, correct: answer.correct };
  }
  
  if (Object.keys(wwmState.playerAnswers).length > 0) {
    const answersTitle = document.createElement('div');
    answersTitle.style.marginBottom = '1rem';
    answersTitle.style.fontWeight = 'bold';
    answersTitle.style.fontSize = '1.1rem';
    answersTitle.textContent = `${Object.keys(wwmState.playerAnswers).length} Antworten eingegeben:`;
    playerAnswersList.appendChild(answersTitle);
    
    for (const [playerName, details] of Object.entries(playerAnswersDetail)) {
      const div = document.createElement('div');
      div.className = 'player-answer-item';
      if (details.correct !== null) {
        div.classList.add(details.correct ? 'correct' : 'incorrect');
      }
      div.style.marginBottom = '0.5rem';
      div.innerHTML = `<strong>${playerName}</strong>: ${details.answer}${details.correct !== null ? (details.correct ? ' ✓' : ' ✗') : ''}`;
      playerAnswersList.appendChild(div);
    }
  } else {
    const noAnswersDiv = document.createElement('div');
    noAnswersDiv.style.opacity = '0.7';
    noAnswersDiv.textContent = 'Noch keine Antworten eingegeben...';
    playerAnswersList.appendChild(noAnswersDiv);
  }
  
  const revealBtn = document.getElementById('wwm-reveal-answer-btn');
  const nextBtn = document.getElementById('wwm-next-question-btn');
  
  revealBtn.disabled = wwmState.questionRevealed;
  nextBtn.disabled = !wwmState.questionRevealed;
  
  revealBtn.onclick = () => {
    socket.emit('reveal-answer', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId,
      questionIndex: wwmState.currentQuestion
    });
  };
  
  nextBtn.onclick = () => {
    socket.emit('next-question', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId
    });
  };
  
  const scoresList = document.getElementById('wwm-host-scores');
  scoresList.innerHTML = '';
  
  const sortedPlayers = [...state.players.filter(p => !p.isHost)].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  sortedPlayers.forEach(player => {
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

// Higher or Lower - Host View
function updateHOLHostView(state) {
  const holState = state.holState;
  
  document.getElementById('hol-host-round').textContent = holState.currentRound;
  
  const hostPlayersList = document.getElementById('hol-host-players');
  hostPlayersList.innerHTML = '';
  
  const sortedPlayers = [...state.players.filter(p => !p.isHost)].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  sortedPlayers.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'host-player-item';
    
    const livesStr = '❤️'.repeat(Math.max(0, player.lives)) + 
                     '🖤'.repeat(Math.max(0, 2 - player.lives));
    
    playerDiv.innerHTML = `
      <div class="host-player-header">
        <span class="player-name">${player.name}</span>
        <div class="host-player-score-info">
          <span class="player-points">${player.modePoints}P</span>
          <span class="player-lives">${livesStr}</span>
        </div>
      </div>
      <div class="host-player-controls" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
        <button class="btn btn-success" style="padding: 0.5rem; font-size: 0.9rem; margin-bottom: 0;" 
                onclick="addPointsHOL('${player.sessionId}', 1)">+1P</button>
        <button class="btn btn-success" style="padding: 0.5rem; font-size: 0.9rem; margin-bottom: 0;" 
                onclick="addPointsHOL('${player.sessionId}', 5)">+5P</button>
        <button class="btn btn-danger" style="padding: 0.5rem; font-size: 0.9rem; margin-bottom: 0;" 
                onclick="addPointsHOL('${player.sessionId}', -1)">-1P</button>
        <button class="btn btn-danger" style="padding: 0.5rem; font-size: 0.9rem; margin-bottom: 0;" 
                onclick="addPointsHOL('${player.sessionId}', -5)">-5P</button>
        <button class="btn btn-accent" style="padding: 0.5rem; font-size: 0.9rem; margin-bottom: 0; grid-column: span 2;" 
                onclick="addLife('${player.sessionId}')">➕ Leben</button>
        <button class="btn btn-danger" style="padding: 0.5rem; font-size: 0.9rem; margin-bottom: 0; grid-column: span 2;" 
                onclick="removeLife('${player.sessionId}')">❌ Leben</button>
      </div>
    `;
    hostPlayersList.appendChild(playerDiv);
  });
}

function addPointsHOL(sessionId, amount) {
  socket.emit('add-points-hol', {
    roomCode: clientState.roomCode,
    sessionId: clientState.sessionId,
    targetSessionId: sessionId,
    amount: amount
  });
}

function addLife(sessionId) {
  socket.emit('add-life', {
    roomCode: clientState.roomCode,
    sessionId: clientState.sessionId,
    targetSessionId: sessionId
  });
}

function removeLife(sessionId) {
  socket.emit('remove-life', {
    roomCode: clientState.roomCode,
    sessionId: clientState.sessionId,
    targetSessionId: sessionId
  });
}

document.getElementById('hol-next-round-btn')?.addEventListener('click', () => {
  socket.emit('next-round-hol', {
    roomCode: clientState.roomCode,
    sessionId: clientState.sessionId
  });
});

// ← FIXED: Symbol Quiz - Host View (ENTFERNT alte Title-Box, erstellt neue Keyword-Box)
function updateSQHostView(state) {
  const sqState = state.sqState;
  
  document.getElementById('sq-host-theme-num').textContent = sqState.currentTheme + 1;
  
  // ← ENTFERNE DIE ALTE BOX mit "Thema"
  const oldTitleBox = document.getElementById('sq-host-theme-title');
  if (oldTitleBox) {
    oldTitleBox.style.display = 'none';
  }
  
  // ← ERSTELLE/NUTZE DIE NEUE KEYWORD-BOX
  const tipsContainer = document.getElementById('sq-host-tips');
  let keywordDiv = document.getElementById('sq-host-theme-keyword');
  
  if (!keywordDiv) {
    keywordDiv = document.createElement('div');
    keywordDiv.id = 'sq-host-theme-keyword';
    keywordDiv.className = 'theme-keyword';
    tipsContainer.parentElement.insertBefore(keywordDiv, tipsContainer);
  }
  
  // ← FUELLE DIE KEYWORD-BOX MIT DATEN
  if (sqState.themes && sqState.currentTheme >= 0 && sqState.currentTheme < sqState.themes.length) {
    keywordDiv.textContent = sqState.themes[sqState.currentTheme].keyword;
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
  
  const buzzerStatus = document.getElementById('sq-host-buzzer-status');
  const buzzerText = document.getElementById('sq-host-buzzer-text');
  const playerInfo = document.getElementById('sq-host-buzzer-player');
  
  if (sqState.currentBuzzer) {
    buzzerStatus.classList.add('active');
    buzzerText.textContent = `⚡ BUZZER GEDRÜCKT!`;
    if (playerInfo) {
      playerInfo.classList.add('active');
      playerInfo.textContent = `🎯 ${sqState.currentBuzzer} buzzert!`;
    }
  } else {
    buzzerStatus.classList.remove('active');
    buzzerText.textContent = 'Warte auf Buzzer...';
    if (playerInfo) playerInfo.classList.remove('active');
  }
  
  const revealBtn = document.getElementById('sq-reveal-tip-btn');
  const resetBtn = document.getElementById('sq-reset-buzzer-btn');
  const awardBtn = document.getElementById('sq-award-points-btn');
  const nextBtn = document.getElementById('sq-next-theme-btn');
  
  const allRevealed = sqState.revealedTips.every(r => r);
  revealBtn.disabled = allRevealed;
  revealBtn.onclick = () => {
    socket.emit('reveal-tip', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId
    });
  };
  
  resetBtn.disabled = !sqState.currentBuzzer || sqState.answered;
  resetBtn.onclick = () => {
    socket.emit('reset-buzzer', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId
    });
  };
  
  awardBtn.disabled = !sqState.currentBuzzer || sqState.answered;
  awardBtn.onclick = () => {
    socket.emit('award-points-sq', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId,
      targetSessionId: state.players.find(p => p.name === sqState.currentBuzzer).sessionId,
      points: 5
    });
  };
  
  nextBtn.disabled = !sqState.answered;
  nextBtn.onclick = () => {
    socket.emit('next-theme-sq', {
      roomCode: clientState.roomCode,
      sessionId: clientState.sessionId
    });
  };
  
  const scoresList = document.getElementById('sq-host-scores');
  scoresList.innerHTML = '';
  
  const sortedPlayers = [...state.players.filter(p => !p.isHost)].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  sortedPlayers.forEach(player => {
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

// Jeopardy - Host View (komplett)
function updateJeopardyHostView(state) {
  const jpState = state.jpState;
  
  const currentPlayerName = jpState.currentPlayer === -1 ? 
    'Spieler wird gewählt...' : jpState.currentPlayer;
  document.getElementById('jp-host-current-name').textContent = currentPlayerName;
  
  const gridContainer = document.getElementById('jp-host-grid');
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
      const isSelected = jpState.currentQuestion && 
                        jpState.currentQuestion.categoryIndex === originalCatIdx &&
                        jpState.currentQuestion.questionIndex === originalQIdx;
      
      const box = document.createElement('div');
      box.className = `jeopardy-box ${isUsed ? 'used' : ''} ${isSelected ? 'selected' : ''}`;
      box.textContent = `${question.points}P`;
      
      gridContainer.appendChild(box);
    }
  }
  
  const questionDisplay = document.getElementById('jp-host-question-display');
  const answerDisplay = document.getElementById('jp-host-question-answer');
  const correctBtn = document.getElementById('jp-host-correct-btn');
  const wrongBtn = document.getElementById('jp-host-wrong-btn');
  const buzzerInfo = document.getElementById('jp-host-buzzer-info');
  const buzzerPlayerInfo = document.getElementById('jp-host-buzzer-player-info');
  const buzzerCorrectBtn = document.getElementById('jp-host-buzzer-correct-btn');
  const skipBuzzBtn = document.getElementById('jp-host-skip-buzz-btn');
  
  if (jpState.currentQuestion) {
    questionDisplay.style.display = 'block';
    document.getElementById('jp-host-question-text').textContent = jpState.currentQuestion.question;
    answerDisplay.textContent = `Antwort: ${jpState.currentQuestion.answer}`;
    
    if (!jpState.buzzerActive && !jpState.answered) {
      correctBtn.style.display = 'inline-block';
      wrongBtn.style.display = 'inline-block';
      buzzerInfo.style.display = 'none';
      
      correctBtn.onclick = () => {
        socket.emit('mark-jeopardy-correct', {
          roomCode: clientState.roomCode,
          sessionId: clientState.sessionId
        });
      };
      
      wrongBtn.onclick = () => {
        socket.emit('mark-jeopardy-wrong', {
          roomCode: clientState.roomCode,
          sessionId: clientState.sessionId
        });
      };
    } else if (jpState.buzzerActive && !jpState.buzzerPlayer) {
      correctBtn.style.display = 'none';
      wrongBtn.style.display = 'none';
      buzzerInfo.style.display = 'block';
      
      buzzerPlayerInfo.innerHTML = '⏳ <strong>Warte auf Buzzer...</strong>';
      buzzerPlayerInfo.style.color = 'var(--accent)';
      
      buzzerCorrectBtn.style.display = 'none';
      skipBuzzBtn.style.display = 'none';
      
    } else if (jpState.buzzerActive && jpState.buzzerPlayer) {
      correctBtn.style.display = 'none';
      wrongBtn.style.display = 'none';
      buzzerInfo.style.display = 'block';
      
      buzzerPlayerInfo.textContent = `⚡ ${jpState.buzzerPlayer} buzzert und antwortet!`;
      buzzerPlayerInfo.style.color = 'var(--success)';
      
      buzzerCorrectBtn.style.display = 'inline-block';
      skipBuzzBtn.style.display = 'inline-block';
      
      buzzerCorrectBtn.textContent = '✓ Richtig (50% Punkte)';
      skipBuzzBtn.textContent = '✗ Falsch (Buzzer zurücksetzen)';
      
      buzzerCorrectBtn.onclick = () => {
        const buzzerPlayerObj = state.players.find(p => p.name === jpState.buzzerPlayer);
        socket.emit('award-buzz-points', {
          roomCode: clientState.roomCode,
          sessionId: clientState.sessionId,
          targetSessionId: buzzerPlayerObj.sessionId
        });
      };
      
      skipBuzzBtn.onclick = () => {
        socket.emit('reset-buzzer-jeopardy', {
          roomCode: clientState.roomCode,
          sessionId: clientState.sessionId
        });
      };
    } else if (jpState.answered) {
      correctBtn.style.display = 'none';
      wrongBtn.style.display = 'none';
      buzzerInfo.style.display = 'none';
    }
  } else {
    questionDisplay.style.display = 'none';
  }
  
  let playerSelectorDiv = document.getElementById('jp-player-selector-div');
  
  if (!playerSelectorDiv) {
    const screenContainer = document.getElementById('jp-host-screen');
    playerSelectorDiv = document.createElement('div');
    playerSelectorDiv.id = 'jp-player-selector-div';
    playerSelectorDiv.style.marginTop = '1.5rem';
    playerSelectorDiv.style.padding = '1.5rem';
    playerSelectorDiv.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))';
    playerSelectorDiv.style.border = '2px solid var(--success)';
    playerSelectorDiv.style.borderRadius = '10px';
    screenContainer.appendChild(playerSelectorDiv);
  }
  
  playerSelectorDiv.innerHTML = '';
  
  if (jpState.currentPlayer === -1) {
    const startMessage = document.createElement('div');
    startMessage.style.textAlign = 'center';
    startMessage.style.marginBottom = '1rem';
    startMessage.style.fontSize = '1.1rem';
    startMessage.style.color = 'var(--accent)';
    startMessage.style.fontWeight = 'bold';
    startMessage.textContent = '👇 Wähle einen Spieler zum Starten!';
    playerSelectorDiv.appendChild(startMessage);
  } else {
    const selectorTitle = document.createElement('h4');
    selectorTitle.textContent = '👉 Nächster Spieler:';
    selectorTitle.style.marginBottom = '1rem';
    selectorTitle.style.marginTop = '0';
    selectorTitle.style.color = 'var(--success)';
    playerSelectorDiv.appendChild(selectorTitle);
  }
  
  const sortedPlayers = [...state.players.filter(p => !p.isHost)].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  sortedPlayers.forEach(player => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${player.sessionId === jpState.currentPlayerSessionId ? 'btn-success' : 'btn-secondary'}`;
    btn.textContent = player.name;
    btn.style.padding = '0.8rem';
    btn.style.fontSize = '0.95rem';
    btn.style.marginBottom = '0.5rem';
    btn.style.marginRight = '0.5rem';
    btn.style.width = 'auto';
    btn.style.display = 'inline-block';
    btn.style.cursor = 'pointer';
    btn.style.border = 'none';
    
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      socket.emit('set-jeopardy-current-player', {
        roomCode: clientState.roomCode,
        sessionId: clientState.sessionId,
        targetSessionId: player.sessionId
      });
    });
    
    playerSelectorDiv.appendChild(btn);
  });
  
  const totalQuestions = jpState.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const usedQuestionsCount = Array.isArray(jpState.usedQuestions) ? jpState.usedQuestions.length : 0;
  const allQuestionsUsed = usedQuestionsCount >= totalQuestions;
  
  if (allQuestionsUsed && !jpState.currentQuestion) {
    let endBtnContainer = document.getElementById('jp-host-end-btn-container');
    
    if (!endBtnContainer) {
      const screenContainer = document.getElementById('jp-host-screen');
      endBtnContainer = document.createElement('div');
      endBtnContainer.id = 'jp-host-end-btn-container';
      endBtnContainer.style.textAlign = 'center';
      endBtnContainer.style.marginTop = '2rem';
      endBtnContainer.style.padding = '2rem';
      endBtnContainer.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))';
      endBtnContainer.style.border = '3px solid var(--success)';
      endBtnContainer.style.borderRadius = '15px';
      
      const endBtnTitle = document.createElement('h3');
      endBtnTitle.textContent = '🎉 Jeopardy beendet!';
      endBtnTitle.style.color = 'var(--success)';
      endBtnTitle.style.marginBottom = '1rem';
      endBtnContainer.appendChild(endBtnTitle);
      
      const endBtn = document.createElement('button');
      endBtn.id = 'jp-host-end-btn';
      endBtn.className = 'btn btn-success';
      endBtn.textContent = '🏆 Zum Final Leaderboard';
      endBtn.style.fontSize = '1.2rem';
      endBtn.style.padding = '1rem 2rem';
      endBtn.style.display = 'inline-block';
      endBtn.style.width = 'auto';
      
      endBtn.onclick = () => {
        socket.emit('end-quiz-show', {
          roomCode: clientState.roomCode,
          sessionId: clientState.sessionId
        });
      };
      
      endBtnContainer.appendChild(endBtn);
      screenContainer.appendChild(endBtnContainer);
    }
  } else {
    const endBtnContainer = document.getElementById('jp-host-end-btn-container');
    if (endBtnContainer) {
      endBtnContainer.remove();
    }
  }
  
  const scoresList = document.getElementById('jp-host-scores');
  scoresList.innerHTML = '';
  
  const scoreSortedPlayers = [...state.players.filter(p => !p.isHost)].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  scoreSortedPlayers.forEach(player => {
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